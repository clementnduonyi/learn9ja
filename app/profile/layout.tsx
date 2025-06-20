    // src/app/dashboard/layout.tsx
    /*import { redirect } from 'next/navigation';
    import { createClient } from '@/lib/supabase/server';
    import prisma from '@/lib/prisma';
    import DashboardSidebar from '@/ui/layout/DashboardSidebar'; // We'll create this next
    import type { User, Role, Gender } from '@prisma/client'; // Import types

    // Define a type for user data needed by the layout/sidebar
    export interface LayoutUserData {
        id: string;
        name: string | null;
        role: Role | null;
        avatarUrl: string | null;
        gender: Gender | null;
        email: string | undefined;
        unreadNotificationCount: number; 
    }

    export default async function DashboardLayout({
        children, // Will be the page content (e.g., StudentDashboardPage or TeacherDashboardPage)
    }: {
        children: React.ReactNode;
    }) {
        const supabase = await createClient();

        // 1. Get User Session & Auth User
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        // Redirect to login if no session
        if (authError || !authUser) {
            console.log('Dashboard layout: No auth user found, redirecting to login.');
            redirect('/login?message=Please login to access the dashboard');
        }

         // 2. Fetch Unread Notification Count
         let unreadCount = 0;
         try {
             unreadCount = await prisma.notification.count({
                 where: { userId: authUser.id, isRead: false },
             });
         } catch (error) {
             console.error("Failed to fetch notification count:", error);
             // Don't fail layout load for notification count error, default to 0
         }

        // 3. Fetch User Profile from DB (including role, name, avatar)
        let layoutUserData: LayoutUserData | null = null;
        try {
            const profile = await prisma.user.findUnique({
                where: { id: authUser.id },
                select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
            });

            if (profile && profile.role) {
                 layoutUserData = {
                     id: profile.id,
                     name: profile.name,
                     role: profile.role,
                     avatarUrl: profile.avatarUrl,
                     email: authUser.email, // Get email from auth user
                     gender: profile.gender,
                     unreadNotificationCount: unreadCount, 
                 };
            } else {
                // Profile or role missing - critical issue after login/confirmation
                console.error(`Profile or role missing for authenticated user ${authUser.id}.`);
                // Redirect to login with error, or a dedicated error/setup page
                redirect('/login?error=User profile incomplete. Please contact support.');
            }
        } catch (error) {
            console.error("Error fetching user profile for dashboard layout:", error);
            redirect('/login?error=Could not load user profile.');
        }

        // If we reach here, layoutUserData should be populated
        if (!layoutUserData) {
             // Fallback redirect if somehow null despite checks
             redirect('/login?error=Failed to load user data.');
        }

        


        // 3. Render Layout with Sidebar and Page Content
        return (
            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                {/* Sidebar Component *
                <DashboardSidebar user={layoutUserData} />

                {/* Main Content Area *
                <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                    {/* Render the specific page content (e.g., TeacherDashboardPage) *
                    {children}
                </main>
            </div>
        );
    }
*/

// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import ResponsiveDashboardWrapper from '@/components/layout/ResponsiveDashboardWrapper';
import type { User, Role, Gender } from '@prisma/client';

// Define a type for user data needed by the layout/sidebar
export interface LayoutUserData {
    id: string;
    name: string | null;
    role: Role | null;
    avatarUrl: string | null;
    gender: Gender | null;
    email: string | undefined;
    unreadNotificationCount: number; 
}

export default async function DashboardLayout({
    children, // Will be the page content (e.g., StudentDashboardPage or TeacherDashboardPage)
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Get User Session & Auth User
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    // Redirect to login if no session
    if (authError || !authUser) {
        console.log('Dashboard layout: No auth user found, redirecting to login.');
        redirect('/login?message=Please login to access the dashboard');
    }

     // 2. Fetch Unread Notification Count
     let unreadCount = 0;
     try {
         unreadCount = await prisma.notification.count({
             where: { userId: authUser.id, isRead: false },
         });
     } catch (error) {
         console.error("Failed to fetch notification count:", error);
         // Don't fail layout load for notification count error, default to 0
     }

    // 3. Fetch User Profile from DB (including role, name, avatar)
    let layoutUserData: LayoutUserData | null = null;
    try {
        const profile = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
        });

        if (profile && profile.role) {
             layoutUserData = {
                 id: profile.id,
                 name: profile.name,
                 role: profile.role,
                 avatarUrl: profile.avatarUrl,
                 email: authUser.email, // Get email from auth user
                 gender: profile.gender,
                 unreadNotificationCount: unreadCount, 
             };
        } else {
            // Profile or role missing - critical issue after login/confirmation
            console.error(`Profile or role missing for authenticated user ${authUser.id}.`);
            // Redirect to login with error, or a dedicated error/setup page
            redirect('/login?error=User profile incomplete. Please contact support.');
        }
    } catch (error) {
        console.error("Error fetching user profile for dashboard layout:", error);
        redirect('/login?error=Could not load user profile.');
    }

    // If we reach here, layoutUserData should be populated
    if (!layoutUserData) {
         // Fallback redirect if somehow null despite checks
         redirect('/login?error=Failed to load user data.');
    }

    // 4. Render Layout with Responsive Wrapper
    return (
        <ResponsiveDashboardWrapper user={layoutUserData}>
            {children}
        </ResponsiveDashboardWrapper>
    );
}