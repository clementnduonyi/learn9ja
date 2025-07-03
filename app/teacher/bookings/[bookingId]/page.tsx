// src/app/teacher/bookings/[bookingId]/page.tsx
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';
import TeacherBookingDetailClient from '@/components/teacher/TeacherBookingDetailClient'; // Client component for actions
// Rename the imported Prisma type to avoid naming conflicts
import { teacherBookingArgs, type TeacherBookingWithDetails as PrismaTeacherBookingWithDetails } from '@/lib/types';
import type { Metadata, ResolvingMetadata } from 'next'
 

type Props = {
  params: Promise<{ bookingId: string }>
  //searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}


export type PlainTeacherBookingWithDetails = Omit<PrismaTeacherBookingWithDetails, 'calculatedPrice'> & {
  calculatedPrice: number | null;
};

// This function dynamically generates metadata for a page based on its params.
// It should be placed in the `page.tsx` file of a dynamic route.
export async function generateMetadata(
  { params, }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
   const { bookingId } = await params
    try { 
          const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: {
            subject: {
              select: { name: true }
            },
            student: {
              select: { name: true }
            }
          }
        });
        if (!booking) return { title: "Booking Not Found" };

        const previousImages = (await parent).openGraph?.images || []
        const title = `Session for ${booking.subject.name} class with ${booking.student.name}`;

        return { 
            title: title,
            description: `Details for your scheduled session for ${booking.subject.name}.`,
            openGraph: {
            images: ['/some-specific-page-image.jpg', ...previousImages],
            },
        };
    } catch (error) {
    console.error("Error generating metadata for booking page:", error);
        return { title: "Booking details" };
    }
  
}


export default async function TeacherBookingDetailPage( { params, }: Props) {
    const supabase = await createClient();
    const { bookingId } = await params

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
    } catch (error) {
        console.error("Error fetching student booking detail:", error);
        fetchError = "Could not load booking details.";
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                notFound();
        }
    }
    
    // --- Render ---
    return (
        // Uses DashboardLayout
        <div className="container mx-auto px-4 py-8 pt-16">
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
