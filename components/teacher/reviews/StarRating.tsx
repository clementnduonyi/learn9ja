// src/components/ui/StarRating.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming you use shadcn/ui utils or similar for classnames

interface StarRatingProps {
    count?: number; // Number of stars
    rating: number; // Current rating (0-count)
    onRatingChange: (newRating: number) => void; // Callback when rating changes
    readOnly?: boolean;
    size?: string; // e.g., 'text-xl', 'text-2xl'
    className?: string;
    icon?: React.ReactNode; // Allow custom icon, default to star
    color?: string; // e.g., 'text-yellow-500'
    hoverColor?: string; // e.g., 'hover:text-yellow-400'
    inactiveColor?: string; // e.g., 'text-gray-300'
}

export default function StarRating({
    count = 5,
    rating = 0,
    onRatingChange,
    readOnly = false,
    size = 'text-2xl', // Default size
    className,
    icon = '★', // Default star character
    color = 'text-yellow-500',
    hoverColor = 'hover:text-yellow-400',
    inactiveColor = 'text-gray-300',
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (readOnly) return;
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (readOnly) return;
        setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (readOnly) return;
        onRatingChange(index); // Pass the selected rating (1 to count)
    };

    return (
        <div className={cn("flex space-x-1", className)} role={!readOnly ? "radiogroup" : undefined}>
            {[...Array(count)].map((_, i) => {
                const ratingValue = i + 1; // Star value (1, 2, 3, 4, 5)
                const isFilled = ratingValue <= (hoverRating || rating);

                return (
                    <button
                        key={ratingValue}
                        type="button" // Prevent form submission if used inside form directly
                        onClick={() => handleClick(ratingValue)}
                        onMouseEnter={() => handleMouseEnter(ratingValue)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readOnly}
                        className={cn(
                            "cursor-pointer transition-colors",
                            size,
                            isFilled ? color : inactiveColor,
                            !readOnly && !isFilled ? hoverColor : "", // Apply hover only if not readOnly and not already filled
                            readOnly ? 'cursor-default' : ''
                        )}
                        aria-label={`Rate ${ratingValue} out of ${count} stars`}
                        aria-checked={!readOnly && rating === ratingValue}
                        role={!readOnly ? "radio" : undefined}
                    >
                        {icon}
                    </button>
                );
            })}
             {!readOnly && rating > 0 && <span className="sr-only">{rating} out of 5 stars selected</span>}
        </div>
    );
}