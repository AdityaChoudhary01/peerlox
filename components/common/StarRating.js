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
      // ✅ SEO & A11y: Tells screen readers and bots this is a rating group
      role="img" 
      aria-label={`Rating: ${rating} out of ${max} stars`}
    >
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFull = rating >= starValue;
        const isHalf = rating >= starValue - 0.5 && rating < starValue;

        return (
          <button
            key={index}
            type="button" 
            disabled={!interactive}
            // ✅ SEO & A11y: Context for interactive elements
            aria-label={interactive ? `Rate ${starValue} out of ${max} stars` : undefined}
            className={cn(
              "transition-all duration-200 outline-none", 
              interactive ? "cursor-pointer hover:scale-125 active:scale-95" : "cursor-default"
            )}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
          >
            {isFull ? (
              <Star 
                className={cn(
                  "fill-yellow-400 text-yellow-400", 
                  sizeClasses[size]
                )} 
                aria-hidden="true" // Icons are decorative for screen readers
              />
            ) : isHalf ? (
              <div className="relative">
                <Star className={cn("text-muted-foreground/30", sizeClasses[size])} aria-hidden="true" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={cn("fill-yellow-400 text-yellow-400", sizeClasses[size])} aria-hidden="true" />
                </div>
              </div>
            ) : (
              <Star 
                className={cn(
                  "text-muted-foreground/30 transition-colors", 
                  interactive && "hover:text-yellow-400",
                  sizeClasses[size]
                )} 
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
      
      {/* ✅ SEO: Hidden machine-readable value for crawlers */}
      <span className="sr-only" itemProp="ratingValue">{rating}</span>
    </div>
  );
}