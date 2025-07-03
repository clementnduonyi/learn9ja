
import './global.css';
import { Inter } from "next/font/google";
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import FooterWrapper from '@/components/layout/FooterWrapper';
import NavbarWrapper from '@/components/layout/NavbarWrapper'; // <-- NEW
import type { LayoutUserData } from '@/lib/types';

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Learn9ja - E-learning for all",
  description: "Connecting students with expert teachers for personalized learning.",
};


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let layoutUserData: LayoutUserData | null = null;

     if (!authUser) {
        return (
          <html lang="en">
            <body className={`${inter.className} flex flex-col min-h-screen bg-white`}>
               <NavbarWrapper user={null} />
              <main className="flex-grow">{children}</main>
               <FooterWrapper />
            </body>
          </html>
        );
        // Or: redirect('/login');
      }

    if (authUser) {
        const [profileData, unreadCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: authUser.id },
                select: { id: true, name: true, role: true, avatarUrl: true, gender: true },
            }),
            prisma.notification.count({
                where: { userId: authUser.id, isRead: false },
            })
        ]);

        if (profileData && profileData.role) {
            layoutUserData = {
                id: profileData.id,
                name: profileData.name,
                role: profileData.role,
                avatarUrl: profileData.avatarUrl,
                gender: profileData.gender,
                email: authUser.email,
                unreadNotificationCount: unreadCount,
            };
        } else {
            // Optionally show an error UI instead of redirecting
            return <div>User profile incomplete. Please contact support.</div>;
        }
    }

    return (
        <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen bg-white`}>
            <NavbarWrapper user={layoutUserData} />
            <main>{children}</main>
            <FooterWrapper  />
        </body>
        </html>
    );
}

