import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import StarRating from '../components/StarRating';
import ProgressIndicator from '../components/ProgressIndicator';
import Toast from '../components/Toast';
import { useBusiness } from '../contexts/BusinessContext';
import { trackGoogleClick } from '../lib/analytics';
import { copyToClipboard } from '../utils/clipboard';
import { DEFAULT_COLORS, isHttpUrl, safeHexColor } from '../lib/validation';

export default function ReviewConfirmation({ rating, review, onRestart }) {
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const business = useBusiness();
  const autoCopyAttempted = useRef(false);
  const toastId = useRef(0);

  const showToast = useCallback((message, variant = 'success') => {
    toastId.current += 1;
    setToast({ message, variant, id: toastId.current });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Attempt to copy automatically, but never claim success unless it worked.
  // Some browsers require a user gesture, so the manual button remains.
  useEffect(() => {
    if (autoCopyAttempted.current || !review) return undefined;
    autoCopyAttempted.current = true;
    let active = true;

    copyToClipboard(review).then((success) => {
      if (active && success) showToast('Review copied to clipboard!');
    });

    return () => {
      active = false;
    };
  }, [review, showToast]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(review);
    showToast(
      success ? 'Review copied to clipboard!' : 'Could not copy automatically. Please select the text and copy it.',
      success ? 'success' : 'error'
    );
  }, [review, showToast]);

  const handleOpenGoogle = useCallback(() => {
    trackGoogleClick(business?.id);
    copyToClipboard(review).then((success) => {
      if (success) showToast('Review copied — just paste it on Google!');
    });
  }, [business?.id, review, showToast]);

  const googleReviewUrl = isHttpUrl(business?.google_review_url)
    ? business.google_review_url
    : '';

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <ProgressIndicator currentStep={4} />

          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>

            <div className="space-y-2">
              <h1
                id="step-heading"
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-gray-900 outline-none sm:text-3xl"
              >
                Your review is ready!
              </h1>
              <p className="text-base text-gray-500">
                Thank you for sharing your experience.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="mb-4 flex justify-center">
              <StarRating rating={rating} readonly size="sm" />
            </div>
            <p className="whitespace-pre-wrap break-words text-sm italic leading-relaxed text-gray-700">
              {review}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              Copy Review
            </button>

            {googleReviewUrl ? (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenGoogle}
                style={{
                  backgroundColor: safeHexColor(
                    business?.button_color || business?.primary_color,
                    DEFAULT_COLORS.button
                  ),
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-sm transition hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                Submit Review on Google
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-300 px-6 py-3 font-medium text-white shadow-sm"
                title="This business has not configured a Google Review URL."
              >
                <ExternalLink className="h-4 w-4" />
                Google link unavailable
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            We&apos;ll copy your review automatically when possible. If it doesn&apos;t work,
            tap &ldquo;Copy Review&rdquo; and paste it on Google.
          </p>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              Write Another Review
            </button>
          </div>
        </div>
      </main>

      <Toast
        key={toast?.id ?? 'toast'}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        visible={Boolean(toast)}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
