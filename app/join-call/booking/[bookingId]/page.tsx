// src/app/join-call/booking/[bookingId]/page.tsx
//import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import VideoCallUI from '@/components/video/VideoCallUI';
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: Promise<{ bookingId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}


export interface BookingCallDetails {
    bookingId: string;
    subjectName: string;
    level: string;
    otherParticipantName: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date | null;
}
 
export async function generateMetadata(
  { params, }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
   const { bookingId } = await params
    try { 
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { subject: { select: { name: true } } }
        });
        if (!booking) return { title: "Booking Not Found" };

        const previousImages = (await parent).openGraph?.images || []

        return { 
            title: `Video Call for ${booking.subject.name}`,
            
            openGraph: {
            images: ['/some-specific-page-image.jpg', ...previousImages],
            },
        };
    } catch (error) {
    console.error("Error generating metadata for booking page:", error);
        return { title: "Video Call" };
    }
  
}


// Use the defined PageProps type for the component's props
export default async function VideoCallPage( { params, }: Props) {
    const supabase = await createClient();
    const { bookingId } = await params;

    // --- Authentication & Authorization ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect(`/login?redirectTo=/join-call/booking/${bookingId}`);
    }

    // --- Data Fetching ---
    let bookingDetails: BookingCallDetails | null = null;
    let fetchError: string | null = null;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                student: { select: { id: true, name: true } },
                teacher: { select: { id: true, name: true } },
                subject: { select: { name: true } },
            },
        });

        if (!booking) {
            notFound();
        }

        // Authorization check
        if (user.id !== booking.studentUserId && user.id !== booking.teacherUserId) {
             redirect('/dashboard?error=Unauthorized+access');
        }

        // Status check
        if (booking.status !== BookingStatus.ACCEPTED) {
            redirect(`/dashboard?error=Session+status+is+${booking.status}%2C+cannot+join+call.`);
        }

        // Prepare the "plain" data object to pass to the client
        const isUserStudent = user.id === booking.studentUserId;
        const otherParticipantName = (isUserStudent ? booking.teacher.name : booking.student.name) || 'Participant';

        bookingDetails = {
            bookingId: booking.id,
            subjectName: booking.subject.name,
            level: booking.level,
            otherParticipantName: otherParticipantName,
            scheduledStartTime: booking.requestedTime,
            scheduledEndTime: booking.endTimeUtc,
        };

    } catch (error) {
        console.error("Error fetching data for call page:", error);
        fetchError = "Could not load session details.";
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
            {fetchError ? (
                <div className="w-full flex items-center justify-center p-4 text-red-500">{fetchError}</div>
            ) : bookingDetails ? (
                // Pass the clean, serializable details object to the client component
                <VideoCallUI details={bookingDetails} />
            ) : (
                 // This case would be hit if notFound() wasn't called but bookingDetails is still null
                 <div className="w-full flex items-center justify-center p-4">Loading session details...</div>
            )}
        </div>
    );
}
