    
    'use client';

    import React, { useEffect } from 'react';
    import Link from 'next/link';
    import type { Notification } from '@prisma/client';
    import { formatDistanceToNow } from 'date-fns'; // For relative time
    import { BellRing, Check } from 'lucide-react'; // Icons
    import { markAllNotificationsRead } from '@/app/actions/notificationActions'; // Import server action
    import { cn } from '@/lib/utils'; // Optional classname utility

    interface NotificationListProps {
      initialNotifications: Notification[];
    }

    export default function NotificationList({ initialNotifications }: NotificationListProps) {

      // Mark all as read when the component mounts for the first time
      useEffect(() => {
        // Check if there are any unread notifications before calling action
        const hasUnread = initialNotifications.some(n => !n.isRead);
        if (hasUnread) {
            console.log("NotificationList mounted with unread notifications, marking all as read...");
            // Call server action in background - don't need to await or handle result directly here
            // Errors will be logged server-side. Count update relies on revalidation.
            markAllNotificationsRead().catch(err => {
                 console.error("Client-side call to markAllNotificationsRead failed:", err);
            });
        }
        // Run only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // Empty dependency array ensures it runs only once

      if (!initialNotifications || initialNotifications.length === 0) {
        return (
          <div className="text-center py-10 text-gray-500">
            <BellRing className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">You have no notifications yet.</p>
          </div>
        );
      }

      return (
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {initialNotifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                  "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                  !notification.isRead ? 'bg-indigo-50 dark:bg-indigo-900/30 font-medium' : 'bg-white dark:bg-gray-800/50' // Highlight unread
              )}
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0 pt-0.5">
                   {/* Icon based on read status */}
                   {notification.isRead ? (
                       <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                   ) : (
                       <BellRing className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                   )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                      "text-sm text-gray-800 dark:text-gray-200",
                      !notification.isRead ? 'font-semibold' : ''
                  )}>
                    {/* Make message clickable if link exists */}
                    {notification.link ? (
                      <Link href={notification.link} className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
                        {notification.message}
                      </Link>
                    ) : (
                      <span>{notification.message}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <time dateTime={new Date(notification.createdAt).toISOString()}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </time>
                  </p>
                </div>
                 {/* Optional: Add individual 'Mark Read/Unread' button later */}
                 {/* <div className="flex-shrink-0 self-center"> ... button ... </div> */}
              </div>
            </li>
          ))}
        </ul>
    );
}
    