
'use client';

import React, { useState, useTransition } from 'react';
import { submitReview } from '@/app/actions/reviewActions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/teacher/reviews/StarRating';


interface ReviewFormProps {
    bookingId: string;
    teacherName: string;
    onSuccess: () => void; // Function to call after successful submission (e.g., close modal)
}

export default function ReviewForm({ bookingId, teacherName, onSuccess }: ReviewFormProps) {
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [rating, setRating] = useState<number>(0); 
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (rating === 0) {
            setError("Please select a rating (1-5 stars).");
            return;
        }

        startSubmitTransition(async () => {
            const result = await submitReview({
                bookingId,
                rating,
                comment: comment || undefined, // Send undefined if comment is empty
            });

            if (result.error || !result.success) {
                setError(result.error || "Failed to submit review.");
            } else {
                // Success!
                console.log("Review submitted successfully");
                onSuccess(); // Call parent callback (e.g., close modal)
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <h3 className="text-lg font-medium">Leave a review for {teacherName}</h3>
            <div className='flex flex-col items-center'>
                <Label className='mb-2'>Your Rating*</Label>
                <StarRating
                    rating={rating}
                    onRatingChange={setRating} // Pass setter function
                />
            </div>
            <div>
                <Label htmlFor={`comment-${bookingId}`}>Comment (Optional)</Label>
                <Textarea
                    id={`comment-${bookingId}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="mt-1"
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || rating === 0}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
}