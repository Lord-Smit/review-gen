import { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { resolveIndustry } from '../../data/industries';
import { createReviewGenerator } from '../../utils/generateReview';

const RATINGS = [5, 4, 3, 2, 1];

/** Small deterministic PRNG so samples are stable until the user shuffles. */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic sample reviews for one industry/rating/seed combination. */
function buildSamples(preset, rating, seed) {
  const labels = (preset.options[rating] || [])
    .slice(0, 3)
    .map((option) => option.label);
  const generator = createReviewGenerator({
    templates: preset.templates,
    random: mulberry32(seed * 7919 + rating),
  });

  return [0, 1, 2].map(() =>
    generator.generate({ rating, selectedOptions: labels })
  );
}

/**
 * Shows what a customer will actually read for the selected industry, so
 * awkward copy is caught before a client ever sees it.
 */
export default function IndustryPreview({ industryKey }) {
  const [rating, setRating] = useState(5);
  const [seed, setSeed] = useState(1);

  const preset = resolveIndustry(industryKey);
  const options = preset.options[rating] || [];
  const samples = buildSamples(preset, rating, seed);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Review preview</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Sample reviews using the wording customers will see for {preset.label}.
          </p>
        </div>

        <div
          className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 shadow-xs"
          role="group"
          aria-label="Preview rating"
        >
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                rating === value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {value}★
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <span
            key={option.id}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600"
          >
            {option.label}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {samples.map((sample, index) => (
          <p
            key={index}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-700"
          >
            {sample}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
          <Sparkles className="h-3 w-3" />
          Samples are generated from the three options above — no facts are invented.
        </p>
        <button
          type="button"
          onClick={() => setSeed((value) => value + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition-colors hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Shuffle samples
        </button>
      </div>
    </div>
  );
}
