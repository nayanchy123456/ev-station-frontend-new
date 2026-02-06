import React, { useState } from "react";
import "../../css/rating/starRating.css";

/**
 * StarRating Component
 * Reusable component for displaying and selecting star ratings
 * 
 * @param {number} value - Current rating value (0-5)
 * @param {function} onChange - Callback when rating changes (interactive mode only)
 * @param {boolean} interactive - Whether stars are clickable (default: false)
 * @param {string} size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} showValue - Whether to show numeric value (default: false)
 * @param {number} totalStars - Total number of stars (default: 5)
 */
const StarRating = ({
  value = 0,
  onChange,
  interactive = false,
  size = "medium",
  showValue = false,
  totalStars = 5
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (interactive) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= totalStars; i++) {
      const isFilled = i <= Math.floor(displayValue);
      const isHalf = !isFilled && i === Math.ceil(displayValue) && displayValue % 1 !== 0;

      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          role={interactive ? "button" : "img"}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          tabIndex={interactive ? 0 : -1}
          onKeyPress={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              handleClick(i);
            }
          }}
        >
          {isHalf ? '⯨' : isFilled ? '⭐' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`star-rating star-rating-${size}`}>
      <div className="stars-container">
        {renderStars()}
      </div>
      {showValue && value > 0 && (
        <span className="rating-value">
          {value.toFixed(1)}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;