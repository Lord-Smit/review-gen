import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { db } from '../lib/db';
import { trackPageView } from '../lib/analytics';
import { BusinessProvider } from '../contexts/BusinessContext';
import { createReviewGenerator } from '../utils/generateReview';
import { isValidSlug, safeHexColor, toSlug } from '../lib/validation';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { resolveReviewContent } from '../data/industries';
import Welcome from './Welcome';
import Experience from './Experience';
import ReviewPreview from './ReviewPreview';
import ReviewConfirmation from './ReviewConfirmation';
import NotFoundPage from './NotFoundPage';

function getSelectedLabels(optionsMap, rating, selectedOptionIds) {
  const options = Array.isArray(optionsMap?.[rating]) ? optionsMap[rating] : [];
  return options
    .filter(
      (option) =>
        option &&
        selectedOptionIds.includes(option.id) &&
        typeof option.label === 'string'
    )
    .map((option) => option.label);
}

/**
 * The customer-facing steps. Mounted with `key` set to the business id, so
 * moving between two business links naturally resets rating/step state instead
 * of leaking the previous business's selections.
 */
function ReviewFlow({ reviewContent }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState('');
  const [review, setReview] = useState('');

  const generatorRef = useRef(null);
  const templates = reviewContent.templates;
  const activeReviewOptions = reviewContent.options;

  const getGenerator = useCallback(() => {
    if (!generatorRef.current) {
      generatorRef.current = createReviewGenerator({ templates });
    }
    return generatorRef.current;
  }, [templates]);

  // Never carry exclusion state across a wording change.
  useEffect(() => {
    generatorRef.current = null;
  }, [templates]);

  // Move focus/scroll to the new step for keyboard and screen-reader users.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const heading = document.getElementById('step-heading');
    heading?.focus?.({ preventScroll: true });
  }, [currentStep]);

  const handleRatingChange = useCallback((newRating) => {
    setRating(newRating);
    setSelectedOptions([]);
    setReview('');
  }, []);

  const handleToggleOption = useCallback((optionId) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  }, []);

  const handleCommentChange = useCallback((value) => {
    setComment(value);
  }, []);

  const buildSelectedLabels = useCallback(
    () => getSelectedLabels(activeReviewOptions, rating, selectedOptions),
    [activeReviewOptions, rating, selectedOptions]
  );

  const handleGenerateReview = useCallback(() => {
    const generatedReview = getGenerator().generate({
      rating,
      selectedOptions: buildSelectedLabels(),
      comment,
    });

    setReview(generatedReview);
    setCurrentStep(3);
  }, [buildSelectedLabels, comment, getGenerator, rating]);

  const handleRegenerateReview = useCallback(() => {
    const generatedReview = getGenerator().regenerate({
      rating,
      selectedOptions: buildSelectedLabels(),
      comment,
    });

    setReview(generatedReview);
  }, [buildSelectedLabels, comment, getGenerator, rating]);

  const handleReviewChange = useCallback((value) => {
    setReview(value);
  }, []);

  const handleRestart = useCallback(() => {
    generatorRef.current = null;
    setCurrentStep(1);
    setRating(0);
    setSelectedOptions([]);
    setComment('');
    setReview('');
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  return (
    <>
      {currentStep === 1 && (
        <Welcome
          pageCopy={reviewContent.page}
          rating={rating}
          onRatingChange={handleRatingChange}
          onNext={() => goToStep(2)}
        />
      )}

      {currentStep === 2 && (
        <Experience
          pageCopy={reviewContent.page}
          rating={rating}
          reviewOptions={activeReviewOptions}
          selectedOptions={selectedOptions}
          onToggleOption={handleToggleOption}
          comment={comment}
          onCommentChange={handleCommentChange}
          onNext={handleGenerateReview}
          onBack={() => goToStep(1)}
        />
      )}

      {currentStep === 3 && (
        <ReviewPreview
          rating={rating}
          review={review}
          onReviewChange={handleReviewChange}
          onRegenerate={handleRegenerateReview}
          onNext={() => goToStep(4)}
          onBack={() => goToStep(2)}
        />
      )}

      {currentStep === 4 && (
        <ReviewConfirmation rating={rating} review={review} onRestart={handleRestart} />
      )}
    </>
  );
}

export default function BusinessReviewPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const normalizedSlug = useMemo(() => {
    const candidate = String(slug ?? '').toLowerCase();
    return isValidSlug(candidate) ? toSlug(candidate) : '';
  }, [slug]);

  // Wording, tap-options, and page copy come from the business's industry
  // preset, with per-business JSON overrides winning when present.
  const reviewContent = useMemo(() => resolveReviewContent(business), [business]);

  useEffect(() => {
    let isMounted = true;

    async function loadBusiness() {
      setLoading(true);
      setNotFound(false);
      setLoadError('');
      setBusiness(null);

      if (!normalizedSlug) {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await db.businesses.getBySlug(normalizedSlug);
        if (!isMounted) return;

        if (data && data.is_active) {
          setBusiness(data);
          // Fire-and-forget: analytics must never block the review flow.
          trackPageView(data.id);
        } else {
          setBusiness(null);
          setNotFound(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load business:', error);
          setLoadError(error?.message || 'We could not load this page.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [normalizedSlug, reloadToken]);

  const displayName = business?.name || business?.business_name || '';
  useDocumentMeta({
    title: displayName ? `${displayName} — Share your experience` : 'Share Your Experience',
    description:
      reviewContent.page.description ||
      'Share your experience with us and leave a quick, honest Google review.',
    noIndex: notFound || Boolean(loadError),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            This page could not be loaded
          </h1>
          <p className="mt-3 text-base text-gray-500">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !business) {
    return <NotFoundPage />;
  }

  return (
    <BusinessProvider business={business}>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: safeHexColor(business.background_color, '#FAFAFA') }}
      >
        <div className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
          <ReviewFlow
            key={business.id || business.slug}
            reviewContent={reviewContent}
          />
        </div>
      </div>
    </BusinessProvider>
  );
}
