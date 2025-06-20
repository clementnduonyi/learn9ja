
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// This is a Server Component that immediately redirects
export default async function DashboardRedirectPage() {
    const supabase = await createClient();

    // 1. Get User Session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Redirect to login if no session (should technically be caught by middleware, but belt-and-suspenders)
    if (userError || !user) {
        redirect('/login?message=Session expired, please login');
    }

    // 2. Fetch User Role from DB
    let userRole: Role | null = null;
    try {
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });
        // Ensure profile and role exist
        if (profile?.role) {
            userRole = profile.role;
        } else {
             // This case means user authenticated but profile/role is missing!
             // Needs handling - maybe redirect to profile setup or show error.
             console.error(`Role missing for authenticated user ${user.id}. Redirecting to profile setup.`);
             // Example: redirect('/complete-profile'); // Create this page if needed
             redirect('/login?error=Profile setup incomplete. Please contact support.'); // Simple error for now
        }
    } catch (error) {
        console.error("Error fetching user role for dashboard redirect:", error);
        // Redirect to login with error if DB query fails
        redirect('/login?error=Could not verify user role.');
    }

    // 3. Redirect based on Role
    if (userRole === Role.TEACHER) {
        console.log(`User ${user.id} is TEACHER, redirecting to /dashboard/teacher`);
        redirect('/dashboard/teacher');
    } else if (userRole === Role.STUDENT) {
        console.log(`User ${user.id} is STUDENT, redirecting to /dashboard/student`);
        redirect('/dashboard/student');
    } else {
        // Fallback for unknown role or if role was somehow null
        console.error(`Unknown or null role '${userRole}' for user ${user.id}. Redirecting to login.`);
        redirect('/login?error=Unknown user role.');
    }

    // This part should technically not be reached due to redirects
    return null;
}

