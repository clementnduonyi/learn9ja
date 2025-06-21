    
    'use server';

    import { revalidatePath } from 'next/cache';
    import { createClient } from '@/lib/supabase/server';
    import prisma from '@/lib/prisma';

    interface ActionResult {
        success: boolean;
        error?: string;
    }

    // Action to mark all unread notifications for the current user as read
    export async function markAllNotificationsRead(): Promise<ActionResult> {
        const supabase = await createClient();

        // Get User Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            // Don't return error, just fail silently if user isn't logged in somehow
            console.error("markAllNotificationsRead: User not authenticated.");
            return { success: false, error: 'Unauthorized' }; // Or just success: false
        }
        const userId = user.id;

        try {
            const { count } = await prisma.notification.updateMany({
                where: {
                    userId: userId,
                    isRead: false, // Only target unread notifications
                },
                data: {
                    isRead: true, // Set them to read
                },
            });

            console.log(`Marked ${count} notifications as read for user ${userId}`);

            // Revalidate the layout to update the notification count in sidebar/navbar
            // Use a generic path or the specific layout path
            revalidatePath('/', 'layout'); // Revalidate root layout which includes navbar/sidebar counts

            return { success: true };

        } catch (error: unknown) {
            console.error(`Error marking notifications read for user ${userId}:`, error);
            
            if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to respond to booking request.' };
        }

        // Fallback for non-Error types
        return { success: false, error: 'An unknown error occurred while updating notifications.' };
        }
    }

    // Optional: Action to mark a single notification as read (if needed later)
   /* export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
       // Similar logic: get user, find notification by ID, verify ownership, update isRead, revalidate
       
       return { success: false, error: 'Not implemented yet.'};
    }*/
    