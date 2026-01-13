// @/components/ui/rating/StarRating.tsx (SVG version)
import React, { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  readOnly?: boolean;
  maxStars?: number;
  allowHalfStars?: boolean;
  showRatingText?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingChange,
  size = "md",
  color = "#fbbf24",
  readOnly = false,
  maxStars = 5,
  allowHalfStars = false,
  showRatingText = false,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeValues = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  };

  const iconSize = sizeValues[size];
  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[size];

  const handleStarClick = (starValue: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (!readOnly && allowHalfStars) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isHalf = x < rect.width / 2;
      const starValue = isHalf ? starIndex + 0.5 : starIndex + 1;
      setHoverRating(starValue);
    } else if (!readOnly) {
      setHoverRating(starIndex + 1);
    }
  };

  const renderStarSVG = (isFilled: boolean, isHalf?: boolean) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={iconSize}
      height={iconSize}
      className={readOnly ? "" : "transition-transform hover:scale-125"}
    >
      {isHalf ? (
        <>
          <defs>
            <linearGradient id="half-fill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="url(#half-fill)"
          />
        </>
      ) : (
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={isFilled ? color : "#d1d5db"}
        />
      )}
    </svg>
  );

  const displayRating = isHovering && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => {
          if (!readOnly) {
            setIsHovering(false);
            setHoverRating(0);
          }
        }}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const halfStarValue = index + 0.5;
          
          let isFull = false;
          let isHalf = false;

          if (allowHalfStars) {
            isFull = displayRating >= starValue;
            isHalf = !isFull && displayRating >= halfStarValue;
          } else {
            isFull = Math.round(displayRating) >= starValue;
          }

          return (
            <div
              key={index}
              className={readOnly ? "" : "cursor-pointer"}
              onClick={() => handleStarClick(allowHalfStars ? (isHalf ? halfStarValue : starValue) : starValue)}
              onMouseEnter={() => {
                if (!readOnly) {
                  setIsHovering(true);
                  if (!allowHalfStars) setHoverRating(starValue);
                }
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              aria-label={`Rate ${starValue} out of ${maxStars} stars`}
            >
              {renderStarSVG(isFull, isHalf)}
            </div>
          );
        })}
        
        {showRatingText && (
          <span className={`ml-2 font-medium ${textSize}`}>
            {displayRating.toFixed(allowHalfStars ? 1 : 0)}/{maxStars}
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;