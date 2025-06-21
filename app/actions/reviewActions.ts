'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { z, ZodError } from 'zod';

// Standard return type
interface ActionResult {
    success: boolean;
    error?: string;
}

// Input data type for the action
interface SubmitReviewInput {
    bookingId: string;
    rating: number;
    comment?: string;
}

// Zod schema for review input validation
const reviewSchema = z.object({
    bookingId: z.string().cuid(), // Assuming CUID for booking IDs
    rating: z.number().int().min(1).max(5, { message: "Rating must be between 1 and 5" }),
    comment: z.string().max(1000, { message: "Comment cannot exceed 1000 characters" }).optional(),
});


export async function submitReview(inputData: SubmitReviewInput): Promise<ActionResult> {
    const supabase = await createClient();

    // 1. Get User Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized: Please log in.' };
    }
    const reviewerUserId = user.id; // This is the student leaving the review

    // 2. Validate Input
    let validatedData;
    try {
        validatedData = reviewSchema.parse(inputData);
    } catch (error) {
         if (error instanceof ZodError) return { success: false, error: `Invalid input: ${error.errors[0]?.message}` };
         return { success: false, error: "Invalid review data." };
    }
    const { bookingId, rating, comment } = validatedData;

    try {
        // Use transaction to ensure review is created AND rating updated atomically
        await prisma.$transaction(async (tx) => {

            // 3. Fetch Booking & Validate Status/Ownership/Existing Review
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                select: {
                    status: true,
                    studentUserId: true,
                    teacherUserId: true,
                    review: { select: { id: true } } // Check if review exists
                }
            });

            if (!booking) throw new Error("Booking not found.");

            // 4a. Authorization: Only the student who took the class can review
            if (reviewerUserId !== booking.studentUserId) {
                 throw new Error("Forbidden: Only the student can review this booking.");
            }
            // 4b. Status Check: Booking must be completed
            if (booking.status !== BookingStatus.COMPLETED) {
                 throw new Error("Cannot review: Booking is not completed yet.");
            }
            // 4c. Prevent Duplicate Reviews
            if (booking.review) {
                throw new Error("A review has already been submitted for this booking.");
            }

            const revieweeUserId = booking.teacherUserId; // The Teacher is being reviewed

            // 5. Create the Review record
            await tx.review.create({
                data: {
                    bookingId: bookingId,
                    reviewerUserId: reviewerUserId, // Student
                    revieweeUserId: revieweeUserId, // Teacher
                    rating: rating,
                    comment: comment, // Will be null if undefined
                }
            });
            console.log(`Review created for booking ${bookingId} by user ${reviewerUserId}`);

            // 6. Recalculate and Update Teacher's Average Rating
            // NOTE: This recalculates the average on every submission. For high-traffic apps,
            // consider a database trigger or a background job for better performance.
            const ratingAggregation = await tx.review.aggregate({
                _avg: { rating: true },
                where: { revieweeUserId: revieweeUserId }, // Average for this specific teacher
            });
            const newAverageRating = ratingAggregation._avg.rating;

            // Update TeacherProfile if average is not null
            if (newAverageRating !== null) {
                 await tx.teacherProfile.update({
                     where: { userId: revieweeUserId },
                     // Use parseFloat and toFixed for better decimal handling if needed, Prisma handles Decimal conversion
                     data: { averageRating: parseFloat(newAverageRating.toFixed(2)) }, // Store with precision
                 });
                 console.log(`Updated average rating for teacher ${revieweeUserId} to ${newAverageRating.toFixed(2)}`);
            } else {
                 // Handle case where average becomes null (e.g., if all reviews deleted - shouldn't happen here)
                 await tx.teacherProfile.update({
                     where: { userId: revieweeUserId },
                     data: { averageRating: null }, // Set to null if no ratings
                 });
                  console.log(`Set average rating to null for teacher ${revieweeUserId} as no ratings found.`);
            }

        }, { timeout: 15000 }); // Optional: Increase timeout for transaction

        // Revalidate teacher profile pages or relevant lists if necessary
        //revalidatePath(`/teacher/${revieweeUserId}`);
        revalidatePath('/search');


        return { success: true };

    } catch (error: unknown) {
        console.error(`Error submitting review for booking ${bookingId}:`, error);
           
            if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to submit review.' };
        }

        // Fallback for non-Error types
        return { success: false, error: 'An unknown error occurred while submitting review.' };
    }
        
}