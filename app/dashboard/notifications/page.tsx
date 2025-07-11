    // src/app/dashboard/notifications/page.tsx

    import { redirect } from 'next/navigation';
    import { createClient } from '@/lib/supabase/server';
    import prisma from '@/lib/prisma';
    import { Notification } from '@prisma/client';
    import NotificationList from '@/components/notifications/NotificationList'; // Import client component

    export const metadata = {
      title: 'Notifications',
    };

    export default async function NotificationsPage() {
        const supabase = await createClient();

        // --- Authentication ---
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            redirect('/login?message=Please login to view notifications');
        }
        const userId = user.id;

        // --- Data Fetching ---
        let notifications: Notification[] = [];
        let fetchError: string | null = null;
        try {
            notifications = await prisma.notification.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' }, // Show newest first
                take: 50, // Limit number of notifications initially displayed
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
            fetchError = "Could not load notifications.";
        }

        // --- Render Page ---
        return (
            <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>

            {fetchError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">{fetchError}</div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <NotificationList initialNotifications={notifications} />
                </div>
            )}
        </div>
    );
}

    