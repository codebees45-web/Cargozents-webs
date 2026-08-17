import { useState } from 'react';

/**
 * Dual-purpose star rating: read-only display when `onChange` isn't
 * passed (e.g. showing a driver's average rating), interactive picker
 * when it is (e.g. inside ReviewModal).
 */
const StarRating = ({ value = 0, onChange, size = 'text-lg', showValue = false }) => {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = interactive ? hovered || value : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${size} leading-none transition ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
            star <= display ? 'text-accent' : 'text-primary/15'
          }`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {showValue && (
        <span className="ml-1 font-mono-ls text-[11px] text-[#5B7A70]">{value ? value.toFixed(1) : 'No ratings yet'}</span>
      )}
    </div>
  );
};

export default StarRating;