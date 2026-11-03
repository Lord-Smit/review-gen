import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ExperienceOptions from '../components/ExperienceOptions';
import ProgressIndicator from '../components/ProgressIndicator';
import { useBusiness } from '../contexts/BusinessContext';
import { DEFAULT_COLORS, LIMITS, safeHexColor } from '../lib/validation';

const RATING_LABELS = {
  5: 'excellent',
  4: 'good',
  3: 'average',
  2: 'below average',
  1: 'poor',
};

export default function Experience({
  rating,
  reviewOptions,
  selectedOptions,
  onToggleOption,
  comment,
  onCommentChange,
  onNext,
  onBack,
}) {
  const [visible, setVisible] = useState(false);
  const business = useBusiness();

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const ratingLabel = RATING_LABELS[rating] || 'recent';
  const options = Array.isArray(reviewOptions?.[rating]) ? reviewOptions[rating] : [];
  const hasSelections = selectedOptions.length > 0;
  const hasComment = Boolean(comment && comment.trim());
  const canContinue = hasSelections || hasComment;

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <ProgressIndicator currentStep={2} />

          <div className="space-y-2 text-center">
            <h1
              id="step-heading"
              tabIndex={-1}
              className="text-2xl font-bold tracking-tight text-gray-900 outline-none sm:text-3xl"
            >
              What made your experience {ratingLabel}?
            </h1>
            <p className="text-base text-gray-500">
              Select all that apply, or add your own comment below.
            </p>
          </div>

          <ExperienceOptions
            options={options}
            selectedOptions={selectedOptions}
            onToggle={onToggleOption}
            primaryColor={business?.primary_color}
          />

          <div className="space-y-2">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700"
            >
              Anything else you&apos;d like to share?
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              maxLength={LIMITS.comment}
              onChange={(e) => onCommentChange(e.target.value.slice(0, LIMITS.comment))}
              placeholder="Add any additional details about your experience…"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-400" aria-live="polite">
                {comment.length}/{LIMITS.comment}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canContinue}
              style={{
                backgroundColor: safeHexColor(
                  business?.button_color || business?.primary_color,
                  DEFAULT_COLORS.button
                ),
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3 font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate Review
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
