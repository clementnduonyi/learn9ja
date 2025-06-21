'use server'

import {  BookingStatus, Prisma } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Paystack } from 'paystack-sdk';
// import { sendBookingRequestEmail } from '@/lib/emails/bookingRequest';
import { ActionResult } from '@/lib/types';
import { revalidatePath } from 'next/cache'; // To refresh data on related pages


const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!)


// --- 1. INITIATE PAYMENT ACTION ---

export interface InitiatePaymentData {
  teacherUserId: string;
  subjectId: string;
  level: string;
  requestedTime: Date;
  durationMinutes: number;
}

const initiatePaymentSchema = z.object({
  teacherUserId: z.string().uuid(),
  subjectId: z.string().cuid(),
  level: z.string().min(1).max(50),
  requestedTime: z.date(),
  durationMinutes: z.number().int().min(30).max(180), // Example: duration must be 30-180 mins
});

export interface VerifiedBookingRequestData { paystackReference: string; }

export async function initiatePayment(requestData: InitiatePaymentData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user: studentUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !studentUser) return { success: false, error: 'Unauthorized: Please log in.' };

  const validatedData = initiatePaymentSchema.safeParse(requestData);
  if (!validatedData.success) {
    return { success: false, error: `Invalid input: ${validatedData.error.errors[0]?.message}` };
  }
  const { teacherUserId, subjectId, level, requestedTime, durationMinutes } = validatedData.data;

  try {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherUserId },
      select: { pricePerHour: true }
    });
    if (!teacherProfile?.pricePerHour) {
      return { success: false, error: "Could not find pricing for the selected teacher." };
    }
    const pricePerHour = parseFloat(teacherProfile.pricePerHour.toString());
    const expectedAmountKobo = Math.round(((pricePerHour * durationMinutes) / 60) * 100);

    if (expectedAmountKobo <= 0) {
        return { success: false, error: "Free sessions cannot be booked at this time." };
    }

    const payload = {
      email: studentUser.email!,
      amount: expectedAmountKobo.toString(),
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      metadata: {
        studentUserId: studentUser.id,
        teacherUserId, subjectId, level,
        requestedTime: requestedTime,
        durationMinutes,
      }
    };

    const transaction = await paystack.transaction.initialize(payload);
    if (!transaction.status || !transaction.data?.authorization_url) {
        throw new Error(transaction.message || "Failed to initialize Paystack transaction.");
    }

    return { success: true, authorization_url: transaction.data.authorization_url };

  } catch (error: unknown) {
    console.error("Error in initiatePayment:", error);
     // Check if the error is an instance of Error to safely access its message property
    if (error instanceof Error) {
        return { success: false, error: error.message || 'Failed.' };
    }

    // Fallback for non-Error types
    return { success: false, error: 'An unknown error occurred while initiating your payment.' };
  }
  
}


/**
 * Verifies a Paystack transaction, extracts booking details, and creates a booking.
 */
export async function verifyPaymentAndCreateBooking(
  requestData: VerifiedBookingRequestData
): Promise<ActionResult> {
  const { paystackReference } = requestData;

  if (!paystackReference) {
      return { success: false, error: "Payment reference is missing." };
  }

  try {
    // 1. Verify transaction with Paystack API
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${paystackReference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'no-store',
    });
    if (!paystackResponse.ok) {
      const errorBody = await paystackResponse.json()
      throw new Error(`Payment verification failed: ${errorBody.message}`);
    }
    const verificationData = await paystackResponse.json();
    if (verificationData.data.status !== 'success') {
      const errorBody = await verificationData.json()
      throw new Error(`Payment verification failed: ${errorBody.message}`);
     }
    console.log(`Payment verified for reference ${paystackReference}.`);


    // 2. Extract booking details from metadata
    const metadata = verificationData.data.metadata;
    const { studentUserId, teacherUserId, subjectId, level, requestedTime, durationMinutes: durationMinutesStr } = metadata; // Renamed to avoid confusion

    if (!studentUserId || !teacherUserId || !subjectId || !level || !requestedTime || !durationMinutesStr) {
        throw new Error("Essential booking details were missing from payment metadata.");
    }

    // --- FIX: Convert string values from metadata back to correct types ---
    const requestedTimeAsDate = new Date(requestedTime);
    const durationMinutes = parseInt(durationMinutesStr, 10); // Parse string to integer

    if (isNaN(durationMinutes)) {
        throw new Error("Invalid durationMinutes value in payment metadata.");
    }
    // --- END FIX ---


    // 3. Check for duplicate payment reference use
    const existingBooking = await prisma.booking.findFirst({ where: { videoRoomId: paystackReference } });
    if (existingBooking) {
      return { success: false, error: "This payment has already been used for a booking." };
    }


    // 4. Create booking and notification in a transaction
    const newBooking = await prisma.$transaction(async (tx) => {
        const createdBooking = await tx.booking.create({
          data: {
            studentUserId, teacherUserId, subjectId, level,
            requestedTime: requestedTimeAsDate,
            durationMinutes: durationMinutes, // <<< Use the parsed number
            status: BookingStatus.PENDING,
            calculatedPrice: new Prisma.Decimal(verificationData.data.amount / 100).toNumber(),
            videoRoomId: paystackReference,
          },
        });
        console.log(`Booking ${createdBooking.id} created successfully.`);

        // --- Notification Logic ---
        const [studentProfile, subject] = await Promise.all([
             tx.user.findUnique({where: {id: studentUserId}, select: {name: true}}),
             tx.subject.findUnique({where: { id: subjectId }, select: { name: true }})
        ]);
        const studentName = studentProfile?.name || 'A student';
        const subjectName = subject?.name || 'the requested subject';
        const formattedTime = requestedTimeAsDate.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
        const message = `${studentName} has booked a class for ${subjectName} (${level}) at ${formattedTime}.`;
        await tx.notification.create({
            data: { userId: teacherUserId, message, link: `/teacher/bookings/${createdBooking.id}` }
        });
        console.log(`Notification created for teacher ${teacherUserId}`);

        return createdBooking;
    });

    // 5. Optional: Send Email Notification
    // ...

    // 6. Revalidate paths
    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/teacher');

    return { success: true, bookingId: newBooking.id };

  } catch (error: unknown) {
    console.error("Error in verifyPaymentAndCreateBooking:", error);
    // Check if the error is an instance of Error to safely access its message property
    if (error instanceof Error) {
        return { success: false, error: error.message || 'Failed to verify payament.' };
    }

    // Fallback for non-Error types
    return { success: false, error: 'An unknown error occurred while verifying your payment. Try again!' };
  }
}





// --- completeBooking Action ---

export async function completeBooking(bookingId: string): Promise<ActionResult> {
    const supabase = await createClient();

    // 1. Get User Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized: Please log in.' };
    }
    const userId = user.id;

    if (!bookingId) {
        return { success: false, error: 'Booking ID is required.' };
    }

    try {
        // 2. Fetch Booking & Validate Ownership/Status
        // Select endTimeUtc needed for time check
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { 
              status: true, 
              studentUserId: true, 
              teacherUserId: true, 
              endTimeUtc: true,
              subject: { 
                select: {
                    name: true
                }
            } 
          },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found.' };
        }

        // 3. Authorization Check
        if (userId !== booking.studentUserId && userId !== booking.teacherUserId) {
            return { success: false, error: 'Forbidden: You are not part of this booking.' };
        }

        // 4. Status Check - Must be ACCEPTED to be marked complete
        if (booking.status !== BookingStatus.ACCEPTED) {
            // It's okay if already completed, maybe return success silently?
            if (booking.status === BookingStatus.COMPLETED) {
                return { success: true }; // Already done
            }
            return { success: false, error: `Cannot mark complete: Booking status is ${booking.status}.` };
        }

        // 5. Time Check (Optional - Allow marking complete only after scheduled end time)
        const now = new Date();
        if (booking.endTimeUtc && now < booking.endTimeUtc) {
            console.warn(`Attempt to mark booking ${bookingId} complete before its end time.`);
            // Decide whether to enforce this strictly
            // return { success: false, error: 'Cannot mark complete before the scheduled end time.' };
        }

        // 6. Update Status
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.COMPLETED },
        });

        console.log(`Booking ${bookingId} marked as COMPLETED by user ${userId}`);

        // 7. Revalidate Paths (Optional but good for UX)
        // Refresh data for dashboards or booking lists
        revalidatePath('/dashboard/teacher'); // Example path
        revalidatePath('/dashboard/student'); // Example path
        // Revalidate specific booking page if it exists
        revalidatePath(`/student/bookings/${bookingId}`);
        revalidatePath(`/teacher/bookings/${bookingId}`); // Adjust actual paths

        // 8. TODO: Create Notification (Optional)
        //    - Notify the *other* participant.
        const otherParticipantId = userId === booking.studentUserId ? booking.teacherUserId : booking.studentUserId;
        try {
          const subjectName = booking.subject.name;
          await prisma.notification.create({ data: { userId: otherParticipantId, message: `Your session for ${subjectName} was marked complete.`, link: `/bookings/${bookingId}` } });
        } catch (notifError){ console.error("Notify complete error:", notifError); }


        return { success: true };

    } catch (error: unknown) {
        console.error(`Error marking booking ${bookingId} complete:`, error);
        // Check if the error is an instance of Error to safely access its message property
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to mark session complete. Try again!' };
        }

        // Fallback for non-Error types
        return { success: false, error: 'An unknown error occurred while saving the user profile.' };
    }
}

// ---Request Reschedule Action ---
export async function requestReschedule(
    bookingId: string,
    reason?: string // Optional reason from student
): Promise<ActionResult> {
    const supabase = await createClient();

    // 1. Get User Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };
    const studentUserId = user.id;

    if (!bookingId) return { success: false, error: 'Booking ID required.' };

    try {
        // Use transaction for atomicity
        await prisma.$transaction(async (tx) => {
            // 2. Fetch booking & validate
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                select: { status: true, studentUserId: true, teacherUserId: true, subject: { select: { name: true } }, level: true, requestedTime: true }
            });

            if (!booking) throw new Error("Booking not found.");
            if (booking.studentUserId !== studentUserId) throw new Error("Forbidden: Not your booking.");
            // Can only request reschedule for ACCEPTED bookings
            if (booking.status !== BookingStatus.ACCEPTED) throw new Error(`Cannot request reschedule: Booking status is ${booking.status}.`);
            // Optional: Add time constraint (e.g., cannot request reschedule within X hours of start)
            // const now = new Date();
            // if (new Date(booking.requestedTime).getTime() - now.getTime() < SOME_THRESHOLD_MS) {
            //    throw new Error("Cannot request reschedule too close to the start time.");
            // }


            // 3. Update status
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.RESCHEDULE_REQUESTED }
            });
            console.log(`Booking ${bookingId} status updated to RESCHEDULE_REQUESTED by student ${studentUserId}`);

            // 4. Notify Teacher
            const studentName = user.user_metadata?.full_name || 'Your student';
            const subjectName = booking.subject?.name || 'the session';
            const formattedTime = booking.requestedTime.toLocaleString();
            try {
                await tx.notification.create({
                    data: {
                        userId: booking.teacherUserId,
                        message: `${studentName} requested to reschedule the ${subjectName} (${booking.level}) session originally set for ${formattedTime}. Reason: ${reason || '(No reason provided)'}`,
                        link: `/teacher/requests/${bookingId}` // Link for teacher to view
                    }
                });
            } catch (notifError) { console.error("Reschedule Notify Error:", notifError); }

        }); // End transaction

        // Revalidate relevant paths
        revalidatePath('/dashboard/student');
        revalidatePath('/dashboard/teacher');
        revalidatePath(`/student/bookings/${bookingId}`); // If such pages exist
        revalidatePath(`/teacher/requests/${bookingId}`);

        return { success: true };

    } catch (error: unknown) {
      console.error(`Error requesting reschedule for booking ${bookingId}:`, error);
      // Check if the error is an instance of Error to safely access its message property
      if (error instanceof Error) {
          return { success: false, error: error.message || 'Failed to reschedule session.' };
      }

      // Fallback for non-Error types
      return { success: false, error: 'An unknown error occurred while rescheduling your session. Try agaian later!' };
    }
}


// --- NEW: Cancel Booking Action (Can be called by Student or Teacher) ---
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
    const supabase = await createClient();

    // 1. Get User Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };
    const userId = user.id;

    if (!bookingId) return { success: false, error: 'Booking ID required.' };

    try {
        // Use transaction
        await prisma.$transaction(async (tx) => {
            // 2. Fetch booking & validate
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                select: { status: true, studentUserId: true, teacherUserId: true, subject: { select: { name: true } }, level: true, requestedTime: true }
            });

            if (!booking) throw new Error("Booking not found.");

            // 3. Authorization: Must be student OR teacher of the booking
            if (userId !== booking.studentUserId && userId !== booking.teacherUserId) {
                throw new Error("Forbidden: You cannot cancel this booking.");
            }

            // 4. Validation: Can only cancel PENDING or ACCEPTED (or RESCHEDULE_REQUESTED?) bookings
            // Add time constraints if needed (e.g., cannot cancel within 24 hours of start)
            const cancellableStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.RESCHEDULE_REQUESTED];
            if (!cancellableStatuses.includes(booking.status)) {
                throw new Error(`Cannot cancel booking: Status is ${booking.status}.`);
            }
            // Example Time Constraint: Cannot cancel within 1 hour of start time
            const now = new Date();
            const oneHour = 60 * 60 * 1000;
            if (booking.status === BookingStatus.ACCEPTED && (new Date(booking.requestedTime).getTime() - now.getTime()) < oneHour) {
                throw new Error("Cannot cancel less than 1 hour before the session starts.");
            }


            // 5. Update status
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.CANCELLED }
            });
            console.log(`Booking ${bookingId} status updated to CANCELLED by user ${userId}`);

            // 6. Notify the *other* participant
            const isStudentCancelling = userId === booking.studentUserId;
            const otherUserId = isStudentCancelling ? booking.teacherUserId : booking.studentUserId;
            const cancellerName = user.user_metadata?.full_name || (isStudentCancelling ? 'The student' : 'The teacher');
            const subjectName = booking.subject?.name || 'the session';
            const formattedTime = booking.requestedTime.toLocaleString();

            try {
                await tx.notification.create({
                    data: {
                        userId: otherUserId,
                        message: `The ${subjectName} (${booking.level}) session scheduled for ${formattedTime} was cancelled by ${cancellerName}.`,
                        link: isStudentCancelling ? `/teacher/requests/${bookingId}` : `/student/bookings/${bookingId}` // Link to relevant view
                    }
                });
            } catch (notifError) { console.error("Cancel Notify Error:", notifError); }

        }); // End transaction

        // Revalidate relevant paths
        revalidatePath('/dashboard/student');
        revalidatePath('/dashboard/teacher');
        revalidatePath(`/student/bookings/${bookingId}`);
        revalidatePath(`/teacher/requests/${bookingId}`);
        revalidatePath(`/teacher/bookings/${bookingId}`); // If teacher has separate scheduled list


        return { success: true };

    } catch (error: unknown) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      // Check if the error is an instance of Error to safely access its message property
      if (error instanceof Error) {
          return { success: false, error: error.message || 'Failed to cancel booking. Try again!' };
      }

      // Fallback for non-Error types
      return { success: false, error: 'An unknown error occurred while cancelling your booking. Try again later!' };
    }
}
