'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { BookingStatus} from '@prisma/client'; // Import status enum and Prisma namespace
// Import notification/email functions if they exist
import { sendBookingResponseEmail } from '@/lib/emails/bookingResponse'; // Assuming you create this
import type { ActionResult } from '@/lib/types'; // Or define locally/globally

type BookingResponse = 'ACCEPTED' | 'DECLINED';
// src/app/actions/teacherActions.ts (or bookingActions.ts)


export async function respondToBookingRequest(
    bookingId: string,
    response: BookingResponse
): Promise<ActionResult> {
    const supabase = await createClient();

    // 1. Get current user (Teacher) session
    const { data: { user: teacherUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !teacherUser) return { success: false, error: 'Unauthorized' };
    const teacherUserId = teacherUser.id;

    // 2. Validate Input
    if (!bookingId || (response !== 'ACCEPTED' && response !== 'DECLINED')) {
        return { success: false, error: 'Invalid input provided.' };
    }

    try {
        let createdOrUpdatedBooking; // Define variable to hold result

        // Use transaction for atomicity
        await prisma.$transaction(async (tx) => {
            // 3. Fetch Booking & Verify Ownership/Status
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                // Include all data needed for logic AND notifications/emails
                include: {
                    student: { select: { id: true, email: true, name: true } },
                    teacher: { select: { name: true } }, // Teacher name needed for messages
                    subject: { select: { name: true } }
                }
            });

            if (!booking) throw new Error("Booking not found.");
            if (booking.teacherUserId !== teacherUserId) throw new Error("Forbidden: Not authorized.");
            if (booking.status !== BookingStatus.PENDING) throw new Error(`Cannot respond: Booking status is ${booking.status}.`);

            // 4. Prepare Update Data
            const newStatus = response === 'ACCEPTED' ? BookingStatus.ACCEPTED : BookingStatus.DECLINED;
            let endTimeUtc: Date | null = null;
            let videoRoomData = {};

            if (newStatus === BookingStatus.ACCEPTED) {
                endTimeUtc = new Date(booking.requestedTime.getTime() + booking.durationMinutes * 60000);
                // TODO: Video Room Creation Logic
                console.log(`TODO: Create video room for booking ${bookingId}`);
                videoRoomData = { videoRoomId: `placeholder-${bookingId}`, videoRoomUrl: `/booking/${bookingId}/call` };
            }

            // Update the booking AND include relations needed afterwards
            createdOrUpdatedBooking = await tx.booking.update({ // Assign result here
                where: { id: bookingId },
                data: {
                    status: newStatus,
                    endTimeUtc: endTimeUtc,
                    ...videoRoomData
                },
                include: { // Include relations needed for email step AFTER transaction
                    student: { select: { email: true, name: true } },
                    teacher: { select: { name: true } }, // Include teacher name again if needed after tx
                    subject: { select: { name: true } }
                }
            });
            console.log(`Booking ${bookingId} status updated to ${newStatus}`);

            // 6. Create In-App Notification for the Student
            try {
                // Use names fetched in 'booking' variable inside transaction
                const teacherName = booking.teacher?.name || 'Your teacher';
                const subjectName = booking.subject?.name || 'the session';
                const statusText = newStatus === 'ACCEPTED' ? 'accepted' : 'declined';
                const formattedTime = booking.requestedTime.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

                // --- Corrected Message String ---
                const message = `${teacherName} ${statusText} your request for ${subjectName} (${booking.level}) at ${formattedTime}.`;
                // --- End Correction ---

                await tx.notification.create({
                    data: {
                        userId: booking.studentUserId, // Notify the student
                        message: message, // Use the correctly formatted message
                        link: `/student/bookings/${booking.id}` // Example link
                    }
                });
                 console.log(`In-app notification created for student ${booking.studentUserId}`);
            } catch(notificationError) {
                console.error(`Failed to create in-app notification for student ${booking.studentUserId} for booking ${booking.id}:`, notificationError);
            }

            // Return value from transaction isn't strictly needed outside anymore
            // if we fetch required data again, but returning it is fine.
            return createdOrUpdatedBooking; // No longer need to return from tx

        }); // End Transaction


        // Fetch required data again AFTER transaction for email (or use data returned from tx if assigned)
        // This ensures we have the LATEST data if needed
         const finalBookingData = await prisma.booking.findUnique({
             where: { id: bookingId },
             include: {
                 student: { select: { email: true, name: true } },
                 teacher: { select: { name: true } },
                 subject: { select: { name: true } }
             }
         });

         if (!finalBookingData) {
             throw new Error("Failed to retrieve booking data after update.");
         }


        // 7. Send Email Notification to Student (Optional)
        try {
            const studentEmail = finalBookingData.student?.email;
            const studentName = finalBookingData.student?.name || 'Student';
            const teacherName = finalBookingData.teacher?.name || 'The Teacher';
            const subjectName = finalBookingData.subject?.name || 'The Subject';

            if (studentEmail) {
                console.log(`Attempting to send response email notification to ${studentEmail}`);
                await sendBookingResponseEmail({
                    to: studentEmail,
                    studentName: studentName,
                    teacherName: teacherName,
                    subjectName: subjectName,
                    level: finalBookingData.level,
                    requestedTime: finalBookingData.requestedTime,
                    status: finalBookingData.status as 'ACCEPTED' | 'DECLINED', // Assert status type
                    bookingId: finalBookingData.id,
                    videoRoomUrl: finalBookingData.videoRoomUrl
                });
            } else {
                 console.warn(`Could not find email for student ${finalBookingData.studentUserId} to send notification.`);
            }
        } catch(emailError) {
             console.error(`Failed to send response email notification for booking ${bookingId}:`, emailError);
        }

        // Revalidate paths
        revalidatePath('/dashboard/teacher');
        revalidatePath('/dashboard/student');
        revalidatePath(`/student/bookings/${bookingId}`);
        revalidatePath(`/teacher/requests/${bookingId}`);


        return { success: true };

    } catch (error: unknown) {
        console.error(`Error responding to booking ${bookingId}:`, error);
         // Check if the error is an instance of Error to safely access its message property
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to respond to booking request.' };
        }

        // Fallback for non-Error types
        return { success: false, error: 'An unknown error occurred while saving the user profile.' };
    }
}

// --- Other teacher actions like updateTeacherProfile, updateTeacherPayoutSettings ---
// ...

