// src/app/student/bookings/[bookingId]/page.tsx

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
// Rename the imported Prisma type to avoid naming conflicts
import { studentBookingArgs, type StudentBookingWithDetails as PrismaStudentBookingWithDetails } from '@/lib/types';
import StudentBookingDetailClient from '@/components/student/StudentBookingDetailClient';

// Define a new "plain" type for the props that will be passed to the Client Component.
// It replaces the 'Decimal' type with 'number'.
export type PlainStudentBookingWithDetails = Omit<PrismaStudentBookingWithDetails, 'calculatedPrice'> & {
  calculatedPrice: number | null;
};


export async function generateMetadata({ params }: { params: { bookingId: string } }) {
  // TODO: Fetch minimal data to generate a better title
  return {
    title: `Booking Details`,
  };
}

export default async function StudentBookingDetailPage({ params }: { params: { bookingId: string } }) {
    const awaitedParams = await params;
    const bookingId = awaitedParams.bookingId;
    const supabase = await createClient();

    // --- Authentication & Authorization ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect(`/login?redirectTo=/student/bookings/${bookingId}`);
    }

    // --- Data Fetching with Retry Logic ---
    let booking: PlainStudentBookingWithDetails | null = null; // Use the new "plain" object type
    let fetchError: string | null = null;
    try {
        let foundBooking: PrismaStudentBookingWithDetails | null = null;
        // Retry fetching up to 3 times to account for replication lag
        for (let i = 0; i < 3; i++) {
            // Fetch the booking from the database
            foundBooking = await prisma.booking.findUnique({
                where: { id: bookingId },
                ...studentBookingArgs
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
            if (foundBooking.studentUserId === user.id) {
                // --- FIX: Convert Decimal to number before passing to client ---
                booking = {
                    ...foundBooking,
                    calculatedPrice: foundBooking.calculatedPrice
                        ? parseFloat(foundBooking.calculatedPrice.toString())
                        : null,
                };
                // --- END FIX ---
            } else {
                redirect('/student/bookings?error=You+are+not+authorized+to+view+this+booking.');
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

    // --- Render ---
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Booking Details</h1>
            {fetchError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
            ) : booking ? (
                // Now passing a plain object with 'calculatedPrice' as a number
                <StudentBookingDetailClient booking={booking} />
            ) : (
                 <p>Booking not found or you do not have permission to view it.</p>
            )}
        </div>
    );
}
