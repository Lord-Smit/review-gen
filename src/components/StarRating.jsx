import { useCallback, useRef, useState } from 'react';
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

function StarIcon({ filled, size }) {
  return (
    <Star
      size={size}
      className={`transition-all duration-200 ease-out ${
        filled ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'fill-none text-gray-300'
      }`}
      strokeWidth={filled ? 1.5 : 1.8}
      aria-hidden="true"
    />
  );
}

export default function StarRating({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 'lg',
}) {
  const [hovered, setHovered] = useState(0);
  const groupRef = useRef(null);

  const { icon: iconSize, target } = SIZES[size] || SIZES.lg;
  const displayValue = hovered || rating;

  const focusStar = useCallback((value) => {
    const buttons = groupRef.current?.querySelectorAll('[role="radio"]');
    buttons?.[value - 1]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (readonly || !onRatingChange) return;

      let next = rating || 0;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        next = Math.min(5, (rating || 0) + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        next = Math.max(1, (rating || 1) - 1);
      } else if (event.key === 'Home') {
        next = 1;
      } else if (event.key === 'End') {
        next = 5;
      } else {
        return;
      }

      event.preventDefault();
      onRatingChange(next);
      focusStar(next);
    },
    [focusStar, onRatingChange, rating, readonly]
  );

  if (readonly) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex items-center gap-1"
          role="img"
          aria-label={`Rated ${rating} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`${target} flex items-center justify-center`}>
              <StarIcon filled={star <= rating} size={iconSize} />
            </span>
          ))}
        </div>
        {rating > 0 && (
          <span className={`text-sm font-semibold tracking-wide ${LABEL_COLORS[rating] || 'text-gray-500'}`}>
            {LABELS[rating]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={groupRef}
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rate your experience out of 5 stars"
        onMouseLeave={() => setHovered(0)}
        onKeyDown={handleKeyDown}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          const isSelected = star <= rating;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star === 1 ? '' : 's'} — ${LABELS[star]}`}
              tabIndex={rating === star || (!rating && star === 1) ? 0 : -1}
              className={`
                ${target} flex items-center justify-center rounded-full
                cursor-pointer transition-transform duration-200 ease-out
                hover:scale-110 active:scale-95
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isSelected && !hovered ? 'animate-star-pop' : ''}
              `}
              onClick={() => onRatingChange?.(star)}
              onMouseEnter={() => setHovered(star)}
            >
              <StarIcon filled={filled} size={iconSize} />
            </button>
          );
        })}
      </div>

      <span
        className={`text-sm font-semibold tracking-wide transition-all duration-200 ${
          rating > 0 ? LABEL_COLORS[rating] || 'text-gray-500' : 'text-transparent'
        }`}
        aria-live="polite"
      >
        {rating > 0 ? LABELS[rating] : '\u00A0'}
      </span>
    </div>
  );
}
