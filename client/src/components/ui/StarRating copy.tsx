// @/components/ui/rating/StarRating.tsx
import React, { useState } from "react";
import { Star } from "lucide-react"; // Optional: using Lucide React icons

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
  color = "#fbbf24", // yellow-400
  readOnly = false,
  maxStars = 5,
  allowHalfStars = false,
  showRatingText = false,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  // Size configurations
  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-sm" },
    md: { icon: "w-6 h-6", text: "text-base" },
    lg: { icon: "w-8 h-8", text: "text-lg" },
    xl: { icon: "w-10 h-10", text: "text-xl" },
  };

  const currentSize = sizeClasses[size];

  // Handle star click
  const handleStarClick = (starValue: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  // Handle mouse move for half-star precision
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
    if (!readOnly && allowHalfStars) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const isHalf = x < width / 2;
      const starValue = isHalf ? starIndex + 0.5 : starIndex + 1;
      setHoverRating(starValue);
    } else if (!readOnly) {
      setHoverRating(starIndex + 1);
    }
  };

  // Render star based on value
  const renderStar = (starIndex: number) => {
    const displayRating = isHovering && hoverRating > 0 ? hoverRating : rating;
    const starValue = starIndex + 1;
    const halfStarValue = starIndex + 0.5;

    let isFull = false;
    let isHalf = false;

    if (allowHalfStars) {
      isFull = displayRating >= starValue;
      isHalf = !isFull && displayRating >= halfStarValue;
    } else {
      isFull = Math.round(displayRating) >= starValue;
    }

    const starColor = isHovering && !readOnly ? "#f59e0b" : color; // yellow-500 on hover
    const opacityClass = readOnly ? "opacity-100" : "opacity-100 hover:opacity-90";

    if (allowHalfStars && isHalf) {
      return (
        <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
          <Star
            className="text-gray-300 absolute top-0 left-0"
            size={currentSize.icon.replace("w-", "")}
            fill="currentColor"
          />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: "50%", height: currentSize.icon }}
          >
            <Star
              className="absolute top-0 left-0"
              size={currentSize.icon.replace("w-", "")}
              style={{ color: starColor }}
              fill="currentColor"
            />
          </div>
        </div>
      );
    }

    return (
      <Star
        size={currentSize.icon.replace("w-", "")}
        className={opacityClass}
        style={{ color: isFull ? starColor : "#d1d5db" }} // gray-300 for empty
        fill={isFull ? "currentColor" : "none"}
      />
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => {
          setIsHovering(false);
          setHoverRating(0);
        }}
      >
        {Array.from({ length: maxStars }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`
              ${readOnly ? "cursor-default" : "cursor-pointer"}
              transition-transform active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded
            `}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => {
              if (!readOnly) setIsHovering(true);
              if (!readOnly && !allowHalfStars) setHoverRating(index + 1);
            }}
            onMouseMove={(e) => handleMouseMove(e, index)}
            disabled={readOnly}
            aria-label={`Rate ${index + 1} out of ${maxStars} stars`}
            title={`${index + 1} star${index !== 0 ? "s" : ""}`}
          >
            {renderStar(index)}
          </button>
        ))}
        
        {showRatingText && (
          <span className={`ml-2 font-medium ${currentSize.text}`}>
            {rating.toFixed(allowHalfStars ? 1 : 0)}/{maxStars}
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;