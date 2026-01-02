import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  readonly = false,
  size = 'md',
  showCount = false,
  count = 0,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoveredRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRating(null);
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform duration-100 ${!readonly && 'focus:outline-none focus:ring-2 focus:ring-blue-400 rounded'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                value <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              } transition-colors duration-150`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)} {count > 0 && `(${count})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
