"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({ 
  rating = 0, 
  max = 5, 
  size = "sm", 
  interactive = false, 
  onRatingChange, 
  className 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      role="img" 
      aria-label={`Rating: ${rating} out of ${max} stars`}
    >
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFull = rating >= starValue;
        const isHalf = rating >= starValue - 0.5 && rating < starValue;

        // FIXED: Only use <button> if interactive. Otherwise use a <div> to prevent "Button missing accessible name" errors.
        const Wrapper = interactive ? "button" : "div";
        
        return (
          <Wrapper
            key={index}
            type={interactive ? "button" : undefined}
            disabled={interactive ? false : undefined}
            aria-label={interactive ? `Rate ${starValue} out of ${max} stars` : undefined}
            className={cn(
              "transition-all duration-200 outline-none flex items-center justify-center", 
              interactive ? "cursor-pointer hover:scale-125 active:scale-95" : "cursor-default"
            )}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
          >
            {isFull ? (
              <Star 
                className={cn("fill-yellow-400 text-yellow-400", sizeClasses[size])} 
                aria-hidden="true" 
              />
            ) : isHalf ? (
              <div className="relative flex items-center justify-center">
                <Star className={cn("text-white/20", sizeClasses[size])} aria-hidden="true" />
                <div className="absolute inset-0 overflow-hidden w-1/2 flex items-center">
                    <Star className={cn("fill-yellow-400 text-yellow-400", sizeClasses[size])} aria-hidden="true" />
                </div>
              </div>
            ) : (
              <Star 
                className={cn(
                  "text-white/20 transition-colors", 
                  interactive && "hover:text-yellow-400",
                  sizeClasses[size]
                )} 
                aria-hidden="true"
              />
            )}
          </Wrapper>
        );
      })}
      
      <span className="sr-only" itemProp="ratingValue">{rating}</span>
    </div>
  );
}