import { useState } from 'react';
import { Star } from 'lucide-react';

const LABELS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const LABEL_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-600',
  4: 'text-green-500',
  5: 'text-emerald-600',
};

const SIZES = {
  sm: { icon: 20, target: 'w-9 h-9' },
  md: { icon: 28, target: 'w-11 h-11' },
  lg: { icon: 36, target: 'w-12 h-12' },
};

export default function StarRating({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 'lg',
}) {
  const [hovered, setHovered] = useState(0);

  const { icon: iconSize, target } = SIZES[size] || SIZES.lg;
  const displayValue = hovered || rating;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => !readonly && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          const isSelected = star <= rating;

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              className={`
                ${target} flex items-center justify-center rounded-full
                transition-transform duration-200 ease-out
                ${readonly ? 'cursor-default' : 'cursor-pointer'}
                ${!readonly ? 'hover:scale-110 active:scale-95' : ''}
                ${isSelected && !hovered ? 'animate-[star-pop_0.3s_ease-out]' : ''}
              `}
              onClick={() => {
                if (!readonly && onRatingChange) {
                  onRatingChange(star);
                }
              }}
              onMouseEnter={() => !readonly && setHovered(star)}
              aria-label={`Rate ${star} out of 5`}
            >
              <Star
                size={iconSize}
                className={`transition-all duration-200 ease-out ${
                  filled
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                    : 'fill-none text-gray-300'
                }`}
                strokeWidth={filled ? 1.5 : 1.8}
              />
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <span
          className={`text-sm font-semibold tracking-wide transition-all duration-200 ${
            LABEL_COLORS[rating] || 'text-gray-500'
          }`}
        >
          {LABELS[rating]}
        </span>
      )}

      <style>{`
        @keyframes star-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
