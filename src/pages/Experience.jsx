import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ExperienceOptions from '../components/ExperienceOptions';
import ProgressIndicator from '../components/ProgressIndicator';
import reviewOptions from '../data/reviewOptions';

const RATING_LABELS = {
  5: 'excellent',
  4: 'good',
  3: 'average',
  2: 'below average',
  1: 'poor',
};

export default function Experience({
  rating,
  selectedOptions,
  onToggleOption,
  comment,
  onCommentChange,
  onNext,
  onBack,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const ratingLabel = RATING_LABELS[rating] || 'recent';
  const options = reviewOptions[rating] || [];
  const hasSelections = selectedOptions.length > 0;

  return (
    <div
      className="flex flex-col transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <ProgressIndicator currentStep={2} />

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              What made your experience {ratingLabel}?
            </h1>
            <p className="text-base text-gray-500">Select all that apply</p>
          </div>

          <ExperienceOptions
            options={options}
            selectedOptions={selectedOptions}
            onToggle={onToggleOption}
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
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add any additional details about your experience…"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
              disabled={!hasSelections}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
