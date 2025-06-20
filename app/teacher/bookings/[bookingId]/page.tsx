// src/app/teacher/bookings/[bookingId]/page.tsx

import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';
import TeacherBookingDetailClient from '@/components/teacher/TeacherBookingDetailClient'; // Client component for actions
// Rename the imported Prisma type to avoid naming conflicts
import { teacherBookingArgs, type TeacherBookingWithDetails as PrismaTeacherBookingWithDetails } from '@/lib/types';


export type PlainTeacherBookingWithDetails = Omit<PrismaTeacherBookingWithDetails, 'calculatedPrice'> & {
  calculatedPrice: number | null;
};

export async function generateMetadata({ params }: { params: { bookingId: string } }) {
  // TODO: Fetch minimal data for title
  return {
    title: `Booking Details`,
  };
}

export default async function TeacherBookingDetailPage({ params }: { params: { bookingId: string } }) {
    const supabase = await createClient();
    const awaitedParams = await params
    const bookingId = awaitedParams.bookingId;

    // --- Authentication & Authorization ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect(`/login?redirectTo=/teacher/bookings/${bookingId}`);
    }
    // Verify user is a teacher
    const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (profile?.role !== Role.TEACHER) {
        redirect('/dashboard?error=Unauthorized');
    }

    // --- Data Fetching ---
    let booking: PlainTeacherBookingWithDetails | null = null;
    let fetchError: string | null = null;
    try {
        let foundBooking: PrismaTeacherBookingWithDetails | null = null;
        // Retry fetching up to 3 times to account for replication lag
        for (let i = 0; i < 3; i++) {
            // Fetch the booking from the database
            foundBooking = await prisma.booking.findUnique({
                where: { 
                    id: bookingId,
                    teacherUserId: user.id 
                },
                ...teacherBookingArgs
            });

            if (foundBooking) {
                console.log(`[Booking Detail] Found booking on attempt ${i + 1}`);
                break; // Exit loop if booking is found
            }
            if (i < 2) {
                    console.log(`[Booking Detail] Booking not found on attempt ${i + 1}. Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 300)); // Short delay
            }
        }

        if (foundBooking) {
            // Authorization check
            if (foundBooking.teacherUserId === user.id) {
                // --- FIX: Convert Decimal to number before passing to client ---
                booking = {
                    ...foundBooking,
                    calculatedPrice: foundBooking.calculatedPrice
                        ? parseFloat(foundBooking.calculatedPrice.toString())
                        : null,
                };
                // --- END FIX ---
            } else {
                redirect('/teacher/bookings?error=You+are+not+authorized+to+view+this+booking.');
            }
        } else {
            notFound();
        }
    } catch (error: any) {
        console.error("Error fetching student booking detail:", error);
        fetchError = "Could not load booking details.";
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                notFound();
        }
    }
    /*try {
        booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
                teacherUserId: user.id, // <<< Ensure user is the TEACHER for this booking
            },
            ...teacherBookingArgs // Use the defined include args
        });
        

        if (!booking) {
            notFound(); // Booking doesn't exist or doesn't belong to this teacher
        }
    } catch (error: any) {
        console.error("Error fetching teacher booking detail:", error);
        fetchError = "Could not load booking details.";
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
             notFound();
        }
    }*/

    // --- Render ---
    return (
        // Uses DashboardLayout
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Booking/Request Details</h1>

            {fetchError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
            ) : booking ? (
                // Pass data to Client Component for actions
                <TeacherBookingDetailClient booking={booking} />
            ) : (
                 <p>Booking not found.</p>
            )}
        </div>
    );
}
