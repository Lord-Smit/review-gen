import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import ProgressIndicator from '../components/ProgressIndicator';
import Footer from '../components/Footer';
import { useBusiness } from '../contexts/BusinessContext';
import { safeHexColor, DEFAULT_COLORS } from '../lib/validation';

export default function Welcome({ rating, onRatingChange, onNext, pageCopy }) {
  const [visible, setVisible] = useState(false);
  const business = useBusiness();

  const heading =
    pageCopy?.heading || business?.welcome_heading || 'How was your experience?';
  const description =
    pageCopy?.description ||
    business?.welcome_description ||
    'Your feedback means a lot to us.';

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-10 text-center">
          <ProgressIndicator currentStep={1} />

          <div className="space-y-3">
            <h1
              id="step-heading"
              tabIndex={-1}
              className="text-3xl font-bold tracking-tight text-gray-900 outline-none sm:text-4xl"
            >
              {heading}
            </h1>
            <p className="text-base text-gray-500 sm:text-lg">
              {description}
            </p>
            {business?.welcome_message && (
              <p className="whitespace-pre-line text-sm text-gray-500">
                {business.welcome_message}
              </p>
            )}
          </div>

          <div className="flex justify-center py-4">
            <StarRating rating={rating} onRatingChange={onRatingChange} size="lg" />
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!rating}
            style={{
              backgroundColor: safeHexColor(
                business?.button_color || business?.primary_color,
                DEFAULT_COLORS.button
              ),
            }}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
