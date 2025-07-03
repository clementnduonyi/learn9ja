// src/app/actions/reminderActions.ts
'use server';

import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
// Import your email sending utility
// import { sendSessionReminderEmail } from '@/lib/email';

/**
 * This action finds upcoming sessions and sends reminders.
 * It is designed to be called by a cron job (e.g., every 5 minutes).
 */
export async function sendSessionReminders() {
  console.log('[Cron Job] Running sendSessionReminders...');

  // Find sessions starting in the next 10-15 minutes that haven't been reminded yet.
  const now = new Date();
  const reminderWindowStart = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  const reminderWindowEnd = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

  try {
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.ACCEPTED,
        // Find bookings starting within our time window
        requestedTime: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
        // TODO: Add a flag like 'reminderSent: false' to the Booking model
        // to prevent sending multiple reminders for the same session.
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } },
        subject: { select: { name: true } },
      },
    });

    if (upcomingBookings.length === 0) {
      console.log('[Cron Job] No sessions found in the upcoming reminder window.');
      return { success: true, message: 'No sessions to remind.' };
    }

    console.log(`[Cron Job] Found ${upcomingBookings.length} sessions to send reminders for.`);

    // Process all reminders concurrently
    await Promise.all(
      upcomingBookings.map(async (booking) => {
        const student = booking.student;
        const teacher = booking.teacher;
        const callLink = `${process.env.NEXT_PUBLIC_APP_URL}/join-call/booking/${booking.id}`;
        const message = `Reminder: Your session for ${booking.subject.name} with ${student.name} and ${teacher.name} starts in about 10 minutes.`;

        // 1. Create In-App Notifications
        await prisma.notification.createMany({
          data: [
            { userId: student.id, message, link: callLink },
            { userId: teacher.id, message, link: callLink },
          ],
        });

        // 2. Send Email Reminders
        // if (student.email) await sendSessionReminderEmail({ to: student.email, ... });
        // if (teacher.email) await sendSessionReminderEmail({ to: teacher.email, ... });

        // 3. TODO: Update booking to mark reminder as sent
        await prisma.booking.update({ where: { id: booking.id }, data: { reminderSent: true } });
      })
    );

    return { success: true, message: `Sent ${upcomingBookings.length} reminders.` };

  } catch (error) {
    console.error('[Cron Job] Error sending session reminders:', error);
    return { success: false, error: 'Failed to process reminders.' };
  }
}
