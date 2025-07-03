// src/app/dashboard/teacher/page.tsx

/*import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, BookingStatus, Role} from '@prisma/client'; // Import necessary types/enums
import TeacherRequestList from '@/components/teacher/TeacherRequestList';
import UpcomingBookingsList from '@/components/teacher/UpcomingBookingList';
// Import shared types if defined elsewhere, otherwise define here
// import type { /* ... * } from '@/types';

// --- Define Validator Args and Type for Teacher Dashboard Data ---
const teacherDashboardArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    // Select fields needed directly from User model if any (e.g., for welcome message)
    select: {
        id: true,
        name: true,
        role: true, // Needed for verification
        // Include the TeacherProfile relation with its nested relations
        teacherProfile: {
            include: { // Use include to get the full TeacherProfile object
                subjectsTaught: { // Include the subjects taught by this teacher
                    select: { // Select specific fields needed by the form
                        subjectId: true,
                        levels: true, // <<< Ensure we select the string array
                    }
                }
            }
        }
    }
});
// Define the type based on the validator
type TeacherDashboardUserData = Prisma.UserGetPayload<typeof teacherDashboardArgs>;

// Define types for booking data passed to child components (can be moved to types file)
type PendingBookingWithDetails = Prisma.BookingGetPayload<{
    include: {
        student: { select: { name: true, email: true } },
        subject: { select: { name: true } },
    }
}>;
type UpcomingBookingWithDetails = Prisma.BookingGetPayload<{
     include: {
        student: { select: { name: true, email: true } },
        subject: { select: { name: true } },
    }
}>;
// --- End Type Definitions ---


export default async function TeacherDashboardPage() {
    const supabase = await createClient();

    // --- 1. Authentication & Authorization ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect('/login');
    }

    // --- 2. Fetch Teacher User Data (Profile, Subjects Taught) ---
    let teacherData: TeacherDashboardUserData | null = null;
    let fetchError: string | null = null;
    try {
        teacherData = await prisma.user.findUnique({
            where: { id: user.id },
            ...teacherDashboardArgs // Use the defined select/include
        });

        // Verify user exists in DB and is a TEACHER
        if (!teacherData || teacherData.role !== Role.TEACHER) {
            console.warn(`User ${user.id} attempting teacher dashboard access is not a TEACHER or profile not found.`);
            redirect('/dashboard/student?error=Unauthorized'); // Redirect non-teachers
        }
        // Ensure teacher profile exists (should have been created post-signup)
        if (!teacherData.teacherProfile) {
             console.error(`Teacher profile missing for teacher user ${user.id}.`);
             redirect('/profile/teacher/edit?error=Profile setup needed'); // Redirect to edit page
        }

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        fetchError = "Could not load your dashboard data.";
        // Optionally handle specific errors or redirect
    }

    // --- 3. Fetch Booking Data ---
    let pendingBookings: PendingBookingWithDetails[] = [];
    let upcomingBookings: UpcomingBookingWithDetails[] = [];
    if (!fetchError && teacherData) { // Only fetch bookings if user data loaded successfully
        try {
            [pendingBookings, upcomingBookings] = await Promise.all([
                prisma.booking.findMany({
                    where: { teacherUserId: user.id, status: BookingStatus.PENDING },
                    include: { student: { select: { name: true, email: true } }, subject: { select: { name: true } } },
                    orderBy: { requestedTime: 'asc' },
                }),
                prisma.booking.findMany({
                    where: { teacherUserId: user.id, status: BookingStatus.ACCEPTED, requestedTime: { gte: new Date() } },
                    include: { student: { select: { name: true, email: true } }, subject: { select: { name: true } } },
                    orderBy: { requestedTime: 'asc' },
                })
            ]);
        } catch (error) {
             console.error("Error fetching teacher bookings:", error);
             fetchError = "Could not load booking information."; // Set error if booking fetch fails
        }
    }

    // --- 4. Fetch All Subjects (for Profile Form) ---
    /*let allSubjects: Subject[] = []; // Initialize empty
    if (!fetchError && teacherData) { // Only fetch if needed and no prior error
         try {
             allSubjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
         } catch (error) {
              console.error("Error fetching all subjects:", error);
              fetchError = "Could not load subject list for profile editing.";
         }
    }/


    // --- 5. Render Dashboard ---
    // Handle fetch error centrally
    if (fetchError) {
        return (
             <div className="container mx-auto px-4 py-8">
                 <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
                 <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
             </div>
        );
    }

    // We should have teacherData if we reach here due to checks above
    if (!teacherData || !teacherData.teacherProfile) {
         // This case should ideally be caught earlier, but acts as a safeguard
         console.error("Teacher data or profile is unexpectedly null.");
         redirect('/login?error=Failed to load dashboard.');
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
             {/* Use fetched name for greeting *}
             <h1 className="text-3xl font-bold mb-6">Welcome, {teacherData.name || 'Teacher'}!</h1>

             {/* Section 1: Pending Requests *}
             <section id="pending-requests" aria-labelledby="pending-requests-heading">
                 <h2 id="pending-requests-heading" className="text-2xl font-semibold mb-4 border-b pb-2">Pending Class Requests</h2>
                 <TeacherRequestList initialBookings={pendingBookings} />
             </section>

             {/* Section 2: Upcoming Schedule *}
             <section id="upcoming-schedule" aria-labelledby="upcoming-schedule-heading">
                  <h2 id="upcoming-schedule-heading" className="text-2xl font-semibold mb-4 border-b pb-2">Upcoming Schedule</h2>
                  <UpcomingBookingsList bookings={upcomingBookings} />
             </section>

        </div>
    );
}*/


// src/app/dashboard/teacher/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, BookingStatus, Role } from '@prisma/client';
import TeacherRequestList from '@/components/teacher/TeacherRequestList';
// import TeacherProfileForm from '@/components/profile/TeacherProfileForm';
import UpcomingBookingsList from '@/components/teacher/UpcomingBookingList';
import { FileText, User, Clock } from 'lucide-react'; // Icons for summary cards



// --- Define Validator Args and Type for Teacher Dashboard Data ---
const teacherDashboardArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    // Select fields needed directly from User model if any (e.g., for welcome message)
    select: {
        id: true,
        name: true,
        role: true, // Needed for verification
        // Include the TeacherProfile relation with its nested relations
        teacherProfile: {
            include: { // Use include to get the full TeacherProfile object
                subjectsTaught: { // Include the subjects taught by this teacher
                    select: { // Select specific fields needed by the form
                        subjectId: true,
                        levels: true, // <<< Ensure we select the string array
                    }
                }
            }
        }
    }
});
// Define the type based on the validator
type TeacherDashboardUserData = Prisma.UserGetPayload<typeof teacherDashboardArgs>;


type PendingBookingWithDetails = Prisma.BookingGetPayload<{
    include: {
        student: { select: { name: true, email: true } },
        subject: { select: { name: true } },
    }
}>;
type UpcomingBookingWithDetails = Prisma.BookingGetPayload<{
     include: {
        student: { select: { name: true, email: true } },
        subject: { select: { name: true } },
    }
}>;

export default async function TeacherDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');


     // --- 2. Fetch Teacher User Data (Profile, Subjects Taught) ---
    let teacherData: TeacherDashboardUserData | null = null;
    let fetchError: string | null = null;
    try {
        teacherData = await prisma.user.findUnique({
            where: { id: user.id },
            ...teacherDashboardArgs // Use the defined select/include
        });

        // Verify user exists in DB and is a TEACHER
        if (!teacherData || teacherData.role !== Role.TEACHER) {
            console.warn(`User ${user.id} attempting teacher dashboard access is not a TEACHER or profile not found.`);
            redirect('/dashboard/student?error=Unauthorized'); // Redirect non-teachers
        }
        // Ensure teacher profile exists (should have been created post-signup)
        if (!teacherData.teacherProfile) {
             console.error(`Teacher profile missing for teacher user ${user.id}.`);
             redirect('/profile/teacher/edit?error=Profile setup needed'); // Redirect to edit page
        }

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        fetchError = "Could not load your dashboard data.";
        // Optionally handle specific errors or redirect
    }

    let pendingBookings: PendingBookingWithDetails[] = [];
    let upcomingBookings: UpcomingBookingWithDetails[] = [];
    if (!fetchError && teacherData) { // Only fetch bookings if user data loaded successfully
        try {
            [pendingBookings, upcomingBookings] = await Promise.all([
                prisma.booking.findMany({
                    where: { teacherUserId: user.id, status: BookingStatus.PENDING },
                    include: { student: { select: { name: true, email: true } }, subject: { select: { name: true } } },
                    orderBy: { requestedTime: 'asc' },
                }),
                prisma.booking.findMany({
                    where: { teacherUserId: user.id, status: BookingStatus.ACCEPTED, requestedTime: { gte: new Date() } },
                    include: { student: { select: { name: true, email: true } }, subject: { select: { name: true } } },
                    orderBy: { requestedTime: 'asc' },
                })
            ]);
        } catch (error) {
             console.error("Error fetching teacher bookings:", error);
             fetchError = "Could not load booking information."; // Set error if booking fetch fails
        }
    }

      // Handle fetch error centrally
    if (fetchError) {
        return (
             <div className="container mx-auto px-4 py-8">
                 <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
                 <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
             </div>
        );
    }

    // We should have teacherData if we reach here due to checks above
    if (!teacherData || !teacherData.teacherProfile) {
         // This case should ideally be caught earlier, but acts as a safeguard
         console.error("Teacher data or profile is unexpectedly null.");
         redirect('/login?error=Failed to load dashboard.');
    }
    // --- Render Styled Dashboard ---
    return (
        <div className="space-y-8 lg:pt-16">
             <header>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {teacherData.name || 'Teacher'}!</h1>
                <p className="text-gray-500 mt-1">Here&apos;s your dashboard at a glance.</p>
             </header>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-learn9ja/10 p-3 rounded-full"><FileText className="h-6 w-6 text-learn9ja" /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-bold">{pendingBookings.length}</p>
                        </div>
                    </div>
                </div>
                 <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-learn9ja/10 p-3 rounded-full"><Clock className="h-6 w-6 text-learn9ja" /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
                            <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                        </div>
                    </div>
                </div>
                 <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-learn9ja/10 p-3 rounded-full"><User className="h-6 w-6 text-learn9ja" /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Profile Status</p>
                            <p className="text-lg font-bold text-learn9ja">{teacherData.teacherProfile.status}</p>
                        </div>
                    </div>
                </div>
            </div>

             {/* Main Dashboard Sections as Cards */}
             <div className="space-y-8">
                 <div id="pending-requests" className="rounded-xl border bg-white p-6 shadow-sm">
                     <h2 className="text-xl font-semibold mb-4">Pending Class Requests</h2>
                     <TeacherRequestList initialBookings={pendingBookings} />
                 </div>

                 <div id="upcoming-schedule" className="rounded-xl border bg-white p-6 shadow-sm">
                      <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
                      <UpcomingBookingsList bookings={upcomingBookings} />
                 </div>
             </div>
        </div>
    );
}

