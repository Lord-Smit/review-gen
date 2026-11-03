import { useState } from 'react';
import { RefreshCw, Sparkles, Star, Quote } from 'lucide-react';
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

export default function IndustryPreview({ industryKey }) {
  const [rating, setRating] = useState(5);
  const [seed, setSeed] = useState(1);

  const preset = resolveIndustry(industryKey);
  const options = preset.options[rating] || [];
  const samples = buildSamples(preset, rating, seed);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-slate-50/30 p-5 space-y-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Live Review Simulation
            </h3>
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {preset.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sample reviews showing the vocabulary generated for {preset.label}.
          </p>
        </div>

        {/* Rating Pills */}
        <div
          className="inline-flex rounded-xl border border-slate-200/90 bg-white p-1 shadow-2xs"
          role="group"
          aria-label="Preview rating"
        >
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                rating === value
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{value}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Available Option Chips for current rating */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Sample Customer Selection Options:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs"
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      {/* Generated Review Quotes */}
      <div className="space-y-2.5 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Generated Customer Review Drafts:
        </p>
        {samples.map((sample, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-xs sm:text-sm leading-relaxed text-slate-800 shadow-2xs flex items-start gap-3"
          >
            <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="flex-1">{sample}</p>
          </div>
        ))}
      </div>

      {/* Footer / Shuffle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
        <p className="text-[11px] text-slate-400">
          Drafts dynamically incorporate the tapped option choices without hallucinating facts.
        </p>
        <button
          type="button"
          onClick={() => setSeed((value) => value + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Shuffle Variations</span>
        </button>
      </div>
    </div>
  );
}
