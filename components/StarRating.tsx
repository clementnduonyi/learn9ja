// src/components/ui/StarRating.tsx
'use client';

import React, { useState } from 'react';

// Helper function for conditional class names (replace with `clsx` or `tailwind-merge` if available)
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface StarRatingProps {
    count?: number; // Number of stars
    rating: number; // Current rating (0-count)
    // Make optional if used in read-only mode without interaction
    onRatingChange?: (newRating: number) => void;
    readOnly?: boolean;
    size?: string; // e.g., 'text-xl', 'text-2xl', 'text-3xl'
    className?: string;
    icon?: React.ReactNode; // Allow custom icon, default to star
    color?: string; // e.g., 'text-yellow-500'
    hoverColor?: string; // e.g., 'hover:text-yellow-400'
    inactiveColor?: string; // e.g., 'text-gray-300'
}

export default function StarRating({
    count = 5,
    rating = 0,
    onRatingChange, // Can be undefined if readOnly
    readOnly = false,
    size = 'text-2xl', // Default size
    className,
    icon = '★', // Default star character
    color = 'text-yellow-400', // Default color
    hoverColor = 'hover:text-yellow-500', // Default hover color
    inactiveColor = 'text-gray-300',
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (readOnly || !onRatingChange) return; // No hover effect if read-only or no handler
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (readOnly || !onRatingChange) return;
        setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (readOnly || !onRatingChange) return; // Cannot click if read-only or no handler
        onRatingChange(index); // Pass the selected rating (1 to count)
    };

    return (
        <div className={cn("flex space-x-1", className)} role={!readOnly ? "radiogroup" : undefined} aria-label={!readOnly ? "Star rating" : `Rating: ${rating} out of ${count} stars`}>
            {[...Array(count)].map((_, i) => {
                const ratingValue = i + 1; // Star value (1, 2, 3, 4, 5)
                // Determine fill based on hover state first (if interactive), then actual rating
                const isFilled = ratingValue <= ((!readOnly && hoverRating > 0) ? hoverRating : rating);

                return (
                    <button
                        key={ratingValue}
                        type="button" // Prevent form submission
                        onClick={() => handleClick(ratingValue)}
                        onMouseEnter={() => handleMouseEnter(ratingValue)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readOnly}
                        className={cn(
                            "transition-colors duration-150 ease-in-out",
                            size,
                            isFilled ? color : inactiveColor,
                            // Apply hover color only when hovering over an unfilled star and interactive
                            !readOnly && !isFilled ? hoverColor : "",
                            readOnly ? 'cursor-default opacity-80' : 'cursor-pointer' // Style read-only state
                        )}
                        aria-label={!readOnly ? `Rate ${ratingValue} out of ${count} stars` : undefined} // Only label interactive buttons
                        aria-checked={!readOnly && rating === ratingValue}
                        role={!readOnly ? "radio" : undefined}
                        tabIndex={readOnly ? -1 : 0} // Make read-only stars not focusable
                    >
                        {icon}
                    </button>
                );
            })}
             {/* Screen reader text for interactive rating */}
             {!readOnly && rating > 0 && <span className="sr-only">{rating} out of 5 stars selected</span>}
        </div>
    );
}
