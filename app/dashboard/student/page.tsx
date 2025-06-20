  
import Link from 'next/link'
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace and enums
import StudentBookingsDisplay from '@/components/student/StudentBookingDispaly'; 
import { StudentBookingWithDetails } from '@/lib/types'


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
    } catch (error: any) {
        console.error("Failed to fetch student bookings:", error);
        fetchError = "Could not load your bookings. Please try again later.";
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

            {/* Section 1: Link to Find Teacher Page */}
            <section aria-labelledby="find-teacher-heading">
                <h2 id="find-teacher-heading" className="text-2xl font-semibold mb-4 border-b pb-2">Find Help</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                     <p className="text-gray-700 mb-4">Ready for your next session? Find available teachers based on subject, level, and your preferred time.</p>
                     {/* Styled Link acting like a button */}
                     <Link
                        href="/find-teachers" // <<< Ensure this route exists or adjust as needed
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
                     >
                         {/* Optional: Add an icon here if you have an icon library */}
                         {/* <SearchIcon className="mr-2 h-5 w-5" /> */}
                         Find a Teacher Now
                     </Link>
                </div>
            </section>

            {/* Section 2: My Bookings */}
            <section id="my-bookings" aria-labelledby="my-bookings-heading">
                <h2 id="my-bookings-heading" className="text-2xl font-semibold mb-4 border-b pb-2">My Sessions</h2>
                {fetchError ? (
                    <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
                ) : (
                    // Pass ALL bookings to the display component which will group them
                    <StudentBookingsDisplay bookings={allBookings} />
                )}
            </section>
        </div>
    );
}


    