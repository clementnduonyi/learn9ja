// src/app/profile/teacher/edit/page.tsx

/*import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Role, Subject } from '@prisma/client'; // Import Role
import TeacherProfileForm from '@/components/profile/TeacherProfileForm'; // Import the main form component

// Define Validator Args and Type for fetching data needed by the form
const teacherProfileEditArgs = Prisma.validator<Prisma.TeacherProfileDefaultArgs>()({
  // Select fields directly from TeacherProfile
  // Use 'include' for nested relations like subjectsTaught
  include: {
    subjectsTaught: { // Include the subjects taught by this teacher
      select: { // Select specific fields needed by the form
        subjectId: true,
        levels: true, // <<< Ensure we select the string array
      }
    }
    // No need to include 'user' here unless the form needs user.name etc.
    // which it currently doesn't directly use (userId is passed separately)
  }
});
// Define the type based on the validator for the initialProfile prop
// Note: This type is TeacherProfile & { subjectsTaught: ... }
type TeacherProfileForEdit = Prisma.TeacherProfileGetPayload<typeof teacherProfileEditArgs>;

export const metadata = {
  title: 'Edit Teacher Profile',
};

export default async function EditTeacherProfilePage() {
    const supabase = await createClient();

    // --- 1. Authentication & Authorization ---
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect('/login?message=Please login to edit your profile');
    }

    // Verify user is a TEACHER by checking the User table
    const userRoleProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    });
    if (!userRoleProfile || userRoleProfile.role !== Role.TEACHER) {
        console.warn(`User ${user.id} attempting to access teacher edit page is not a TEACHER.`);
        redirect('/dashboard/student?error=Unauthorized'); // Redirect non-teachers
    }

    // --- 2. Data Fetching ---
    let teacherProfileData: TeacherProfileForEdit | null = null;
    let allSubjects: Subject[] = [];
    let fetchError: string | null = null;

    try {
        // Fetch teacher profile data AND all subjects in parallel
        [teacherProfileData, allSubjects] = await Promise.all([
            prisma.teacherProfile.findUnique({
                where: { userId: user.id },
                ...teacherProfileEditArgs // Use the defined include args
            }),
            prisma.subject.findMany({
                orderBy: { name: 'asc' },
            })
        ]);

        // Handle case where teacher profile might not exist yet (e.g., error during signup callback)
        if (!teacherProfileData) {
            // Option 1: Redirect to dashboard with error
            // redirect('/dashboard/teacher?error=Profile not found, please contact support.');
            // Option 2: Allow form to render with null initial data (form needs to handle this)
            console.warn(`Teacher profile not found for user ${user.id}, allowing form render for potential creation.`);
            // Initialize a default structure if needed by the form, or let the form handle null
            // teacherProfileData = { userId: user.id, status: 'PENDING', subjectsTaught: [], bio: null, availability: null, averageRating: null, pricePerHour: null, payoutDetails: null, specializations: [], createdAt: new Date(), updatedAt: new Date() };
        }

    } catch (error) {
        console.error("Error fetching data for teacher profile edit:", error);
        fetchError = "Could not load profile data or subjects.";
    }

    // --- 3. Render Page ---
    return (
        // This page will inherit the DashboardLayout if placed under /dashboard
        // If placed elsewhere (like /profile/teacher/edit), it needs its own layout or styling
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Edit Teacher Profile</h1>

            {fetchError ? (
                 <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
            ) : (
                 // Render the form, passing the fetched data
                 <TeacherProfileForm
                    userId={user.id} // Pass the authenticated user ID
                    // Pass fetched profile data (can be null if not found, form must handle)
                    initialProfile={teacherProfileData}
                    allSubjects={allSubjects}
                 />
            )}
        </div>
    );
}*/

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Role, Subject } from '@prisma/client';
import TeacherProfileForm from '@/components/profile/TeacherProfileForm';

// Prisma validator for fetching teacher profile with subjectsTaught
const teacherProfileEditArgs = Prisma.validator<Prisma.TeacherProfileDefaultArgs>()({
  include: {
    subjectsTaught: {
      select: {
        subjectId: true,
        levels: true,
      },
    },
  },
});
type TeacherProfileForEdit = Prisma.TeacherProfileGetPayload<typeof teacherProfileEditArgs>;

export const metadata = {
  title: 'Edit Teacher Profile',
};

export default async function EditTeacherProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // --- 1. Authentication & Authorization ---
  if (userError || !user || !user.id) {
    redirect('/login?message=Please login to edit your profile');
  }

  // Verify user is a TEACHER by checking the User table
  const userRoleProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!userRoleProfile || userRoleProfile.role !== Role.TEACHER) {
    console.warn(`User ${user.id} attempting to access teacher edit page is not a TEACHER.`);
    redirect('/dashboard/student?error=Unauthorized');
  }

  // --- 2. Data Fetching ---
  let teacherProfileData: TeacherProfileForEdit | null = null;
  let allSubjects: Subject[] = [];
  let fetchError: string | null = null;

  try {
    [teacherProfileData, allSubjects] = await Promise.all([
      prisma.teacherProfile.findUnique({
        where: { userId: user.id },
        ...teacherProfileEditArgs,
      }),
      prisma.subject.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    if (!teacherProfileData) {
      // Optionally log or handle missing profile
      console.warn(`Teacher profile not found for user ${user.id}, allowing form render for potential creation.`);
    }
  } catch (error) {
    console.error("Error fetching data for teacher profile edit:", error);
    fetchError = "Could not load profile data or subjects.";
  }

  // --- 3. Render Page ---
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Edit Teacher Profile</h1>
      {fetchError ? (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
      ) : (
        <TeacherProfileForm
          userId={user.id}
          initialProfile={teacherProfileData}
          allSubjects={allSubjects}
        />
      )}
    </div>
  );
}

