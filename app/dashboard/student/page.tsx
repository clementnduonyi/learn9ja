  
import Link from 'next/link'
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace and enums
import StudentBookingsDisplay from '@/components/student/StudentBookingDispaly'; 
import { StudentBookingWithDetails } from '@/lib/types'
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';



// src/app/student/bookings/page.tsx
const studentBookingArgs = Prisma.validator<Prisma.BookingDefaultArgs>()({
    include: {
      teacher: { // This relation links to the User model
        select: {
          // Select fields directly from the User model (the teacher)
          name: true,
          id: true, // Keep ID if needed by card/logic
          // avatarUrl: true // Select avatar if needed
        }
      },
      subject: { select: { name: true } },
      review: { select: { id: true } }, // Include review to check if one exists
    },
  });




export const metadata = {
  title: 'Student | Dashboard',
};

export default async function StudentDashboardPage() {
    const supabase = await createClient();

    // Get User Session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect('/login?message=Please login');
    }
    const userId = user.id;

    // Verify role is STUDENT

    const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (profile?.role !== 'STUDENT') { redirect('/dashboard/teacher?error=Unauthorized'); }


    // Fetch ALL bookings for this student
    let allBookings: StudentBookingWithDetails[] = [];
    let fetchError: string | null = null;
    try {
        allBookings = await prisma.booking.findMany({
            where: {
                studentUserId: userId, // Filter by the logged-in user
                // Fetch all non-archived statuses maybe? Or just fetch all? Fetch all for now.
                // status: { notIn: [BookingStatus.SOME_ARCHIVED_STATUS] }
            },
            ...studentBookingArgs,
            orderBy: {
                endTimeUtc: 'desc',
            },
        });
    } catch (error) {
        console.error("Failed to fetch student bookings:", error);
        fetchError = "Could not load your bookings. Please try again later.";
    }


     return (
        <div className="space-y-8 lg:pt-16">
            <header>
                 <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.user_metadata?.full_name || 'Student'}!</h1>
                <p className="text-gray-500 mt-1">Ready to learn something new today?</p>
            </header>

            {/* Call to Action Card */}
            <div className="bg-learn9ja rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold">Find Your Perfect Teacher</h2>
                <p className="mt-2 opacity-90 max-w-xl">
                    Search for expert teachers by subject, level, and your preferred time. Get one-on-one help instantly or schedule a session for later.
                </p>
                <Button asChild size="lg" className="mt-6 bg-white text-learn9ja hover:bg-white/90 font-bold">
                    <Link href="/find-teachers">
                        Find a Teacher Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>

            {/* My Sessions Section */}
            <section id="my-sessions" className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">My Sessions</h2>
                {fetchError ? (
                    <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
                ) : (
                    <StudentBookingsDisplay bookings={allBookings} />
                )}
            </section>
        </div>
    );
}


    