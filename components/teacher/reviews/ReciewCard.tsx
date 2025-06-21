// src/components/reviews/ReviewCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import StarRating from '@/components/StarRating';
import type { Prisma } from '@prisma/client';

// Define the shape of the review prop using Prisma utility types
type ReviewWithReviewer = Prisma.ReviewGetPayload<{
    select: {
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
            select: { name: true, avatarUrl: true, gender: true }
        }
    }
}>;

interface ReviewCardProps {
    review: ReviewWithReviewer;
}

// Helper (can be moved to utils)
const getDisplayAvatar = (avatarUrl: string | null | undefined, gender: unknown): string => {
    if (avatarUrl) return avatarUrl;
    switch (gender) { case 'MALE': return '/avatars/default-male.svg'; /* ... */ default: return '/avatars/default-other.svg'; }
}


export default function ReviewCard({ review }: ReviewCardProps) {
    const reviewerName = review.reviewer?.name || 'A Student';
    const displayAvatar = getDisplayAvatar(review.reviewer?.avatarUrl, review.reviewer?.gender);

    return (
        <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-start space-x-4">
                <Image
                    src={displayAvatar}
                    alt={reviewerName}
                    width={40} height={40}
                    className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-sm">{reviewerName}</p>
                            <StarRating rating={review.rating} readOnly={true} size="text-sm" />
                        </div>
                        <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    {review.comment && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {review.comment}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
