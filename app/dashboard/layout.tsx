// src/app/dashboard/layout.tsx (The new Server Component wrapper)

/*import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import DashboardClientLayout from './DashboardClientLayout'; // Import the client layout
import type { LayoutUserData } from '@/lib/types';
import Footer from "@/components/DashboardFooter"


// This is the main layout for the /dashboard route. It remains a Server Component.
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        redirect('/login?message=Please login to access the dashboard');
    }

    // Fetch user profile and notification count in parallel
    const [profileData, unreadCount] = await Promise.all([
        prisma.user.findUnique({
            where: { id: authUser.id },
            select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
        }),
        prisma.notification.count({
            where: { userId: authUser.id, isRead: false },
        })
    ]);

    if (!profileData || !profileData.role) {
        redirect('/login?error=User profile incomplete. Please contact support.');
    }

    const layoutUserData: LayoutUserData = {
        id: profileData.id,
        name: profileData.name,
        role: profileData.role,
        avatarUrl: profileData.avatarUrl,
        gender: profileData.gender,
        email: authUser.email,
        unreadNotificationCount: unreadCount,
    };

    // Render the client layout and pass the server-fetched data as props
    return (
        <DashboardClientLayout user={layoutUserData}>
            {children}
        </DashboardClientLayout>
    );
}*/


// src/app/dashboard/layout.tsx
import '../global.css'; // Tailwind styles
import { Inter } from "next/font/google";
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import DashboardWrapper from '@/components/layout/DashboardWrapper'; // Import the new wrapper
// import NavbarWrapper from '@/components/layout/NavbarWrapper';
import { Suspense } from 'react';
import type { LayoutUserData } from '@/lib/types'; // Import shared type
// import type { Role, Gender } from '@prisma/client';


const inter = Inter({ subsets: ["latin"] });

// Define a separate async component to fetch data. This is a common pattern.
/*async function UserDataProvider({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const [profileData, unreadCount] = await Promise.all([
        prisma.user.findUnique({
            where: { id: authUser?.id },
            select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
        }),
        prisma.notification.count({
            where: { userId: authUser?.id, isRead: false },
        })
    ]);

    if (!profileData || !profileData.role) {
        // Optionally show an error UI instead of redirecting
        return <div>User profile incomplete. Please contact support.</div>;
    }


    const layoutUserData: LayoutUserData = {
        id: profileData.id,
        name: profileData.name,
        role: profileData.role,
        avatarUrl: profileData.avatarUrl,
        gender: profileData.gender,
        email: authUser?.email,
        unreadNotificationCount: unreadCount,
    };/

    // Render the client layout wrapper and pass the fetched data as props
    return (
        <DashboardWrapper user={layoutUserData}>
            {children}
        </DashboardWrapper>
    );
}*/
export const metadata: Metadata = {
  title: "Learn9ja - E-learning for all",
  description: "Connecting students with expert teachers for personalized learning.",
};


function DashboardLoadingSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            {/* Sidebar Skeleton */}
            <aside className="w-64 bg-white p-4 flex-col border-r hidden lg:flex">
                 <div className="flex-grow space-y-4 animate-pulse">
                    <div className="flex items-center space-x-2 h-8 mb-4"><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div>
                    <div className="flex items-center justify-center flex-col h-28 mb-4 border-b pb-4"><div className="h-20 w-20 bg-gray-200 rounded-full"></div><div className="h-4 bg-gray-200 rounded w-32 mt-2"></div></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                </div>
            </aside>
            {/* Main Content Skeleton */}
            <div className="flex-1 p-8">
                 <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                 <div className="mt-8 h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
        </div>
    )
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  
  const [profileData, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: authUser?.id },
      select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
    }),
    prisma.notification.count({
      where: { userId: authUser?.id, isRead: false },
    })
  ]);

  if (!profileData || !profileData.role) {
    return <div>User profile incomplete. Please contact support.</div>;
  }

  const layoutUserData: LayoutUserData = {
    id: profileData.id,
    name: profileData.name,
    role: profileData.role,
    avatarUrl: profileData.avatarUrl,
    gender: profileData.gender,
    email: authUser?.email,
    unreadNotificationCount: unreadCount,
  };

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white`}>
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardWrapper user={layoutUserData}>
            {children}
          </DashboardWrapper>
        </Suspense>
      </body>
    </html>
  );
}
