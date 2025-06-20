// src/app/booking/[bookingId]/call/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import VideoCallUI from '@/ui/video/videoUI';
import { notFound } from 'next/navigation';
import { BookingCallDetails } from '@/lib/types';



export default async function VideoCallPage({ params }: { params: { bookingId: string } }) {
    const supabase = await createClient();
    const bookingId = params.bookingId;

    // 1. Get User Session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect(`/login?message=Please login to join the call&redirectTo=/booking/${bookingId}/call`);
    }
    const userId = user.id;

    // 2. Fetch Booking Details (including related data)
    let bookingDetails: BookingCallDetails | null = null;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                student: { select: { id: true, name: true } },
                teacher: { select: { id: true, name: true } },
                subject: { select: { name: true } },
            },
        });

        // 3. Basic Validation & Authorization
        if (!booking) {
            notFound(); // Use Next.js notFound helper if booking doesn't exist
        }

        if (userId !== booking.studentUserId && userId !== booking.teacherUserId) {
            // User is not part of this booking, forbidden
            // You could redirect or show a specific error component
             console.warn(`User ${userId} attempted to access booking ${bookingId} they are not part of.`);
             redirect('/dashboard?error=Unauthorized access');
        }

        if (booking.status !== BookingStatus.ACCEPTED) {
            // Cannot join calls for bookings not in ACCEPTED state
            redirect(`/dashboard?error=Session status is ${booking.status}, cannot join call.`);
        }

        // 4. Determine Other Participant
        const isUserStudent = userId === booking.studentUserId;
        const otherParticipant = isUserStudent ? booking.teacher : booking.student;
        const otherParticipantName = otherParticipant?.name || 'Participant'; // Fallback name

        // 5. Prepare data to pass to client component
        bookingDetails = {
            bookingId: booking.id,
            subjectName: booking.subject.name,
            level: booking.level,
            otherParticipantName: otherParticipantName,
            scheduledStartTime: booking.requestedTime, // Pass Date objects
            scheduledEndTime: booking.endTimeUtc,     // Pass Date objects (can be null)
        };

    } catch (error) {
        console.error("Error fetching booking details for call:", error);
        // Handle error - maybe redirect or show an error message component
        return <div className="p-4 text-red-500">Error loading booking details. Please try again later.</div>;
        // Or use notFound() for specific Prisma errors like record not found
    }

    // Ensure bookingDetails were successfully prepared
    if (!bookingDetails) {
        return <div className="p-4 text-red-500">Could not load booking information.</div>;
    }

    // 6. Render Client Component with fetched details
    return (
        // Add layout/styling as needed
        <div className="flex flex-col md:flex-row h-screen"> {/* Example layout */}
            {/* Pass fetched details as props */}
            <VideoCallUI details={bookingDetails} />
        </div>
    );
}