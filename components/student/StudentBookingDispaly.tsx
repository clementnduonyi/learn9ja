
'use client';

import React, { useMemo } from 'react';
import { BookingStatus } from '@prisma/client';
import type { StudentBookingWithDetails } from '@/lib/types';
import StudentBookingCard from '@/components/student/StudentBookingCard'; 

interface StudentBookingsDisplayProps {
  bookings: StudentBookingWithDetails[];
}

export default function StudentBookingsDisplay({ bookings }: StudentBookingsDisplayProps) {

  // Group bookings by status using useMemo for efficiency
  const groupedBookings = useMemo(() => {
    const now = new Date(); // Get current time once for comparison
    // Add new categories for time-based filtering of ACCEPTED bookings
    const groups: Record<string, StudentBookingWithDetails[]> = {
      PENDING: [],
      UPCOMING_ACCEPTED: [], // Accepted and in the future
      PAST_ACCEPTED: [],     // Accepted but in the past (awaiting completion/review)
      RESCHEDULE_REQUESTED: [],
      COMPLETED: [],
      DECLINED: [], 
      CANCELLED: []
    };

    bookings.forEach(booking => {
      switch (booking.status) {
        case BookingStatus.PENDING:
          groups.PENDING.push(booking);
          break;
        case BookingStatus.ACCEPTED:
          // Check if the session end time is in the past
          // Use endTimeUtc if available, otherwise estimate based on requestedTime + duration
          const endTime = booking.endTimeUtc
            ? new Date(booking.endTimeUtc)
            : new Date(new Date(booking.requestedTime).getTime() + booking.durationMinutes * 60000);

          if (endTime < now) {
            groups.PAST_ACCEPTED.push(booking); // It's finished according to schedule
          } else {
            groups.UPCOMING_ACCEPTED.push(booking); // It's still upcoming
          }
          break;
        case BookingStatus.RESCHEDULE_REQUESTED:
           groups.RESCHEDULE_REQUESTED.push(booking);
           break;
        case BookingStatus.COMPLETED:
          groups.COMPLETED.push(booking);
          break;
        case BookingStatus.DECLINED:
          groups.DECLINED.push(booking); // DECLINED, CANCELLE
          break;
        case BookingStatus.DECLINED:
        groups.DECLINED.push(booking); // DECLINED, CANCELLE
        break;
      }
    });

    // Sort upcoming bookings by time (earliest first)
    groups.UPCOMING_ACCEPTED.sort((a, b) => new Date(a.requestedTime).getTime() - new Date(b.requestedTime).getTime());
    // Sort past accepted bookings (most recent first)
    groups.PAST_ACCEPTED.sort((a, b) => new Date(b.requestedTime).getTime() - new Date(a.requestedTime).getTime());
     // Sort completed bookings (most recent first)
    groups.COMPLETED.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); // Sort by updated time


    return groups;
  }, [bookings]);


  if (!bookings || bookings.length === 0) {
    return <p className="text-gray-600 italic">You have no booking history yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {groupedBookings.PENDING.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-yellow-700">Pending Teacher Approval</h3>
          <div className="space-y-4">
            {groupedBookings.PENDING.map(booking => (
              <StudentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

       {/* Reschedule Requested */}
      {groupedBookings.RESCHEDULE_REQUESTED.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-yellow-900">Reschedule Requested</h3>
          <div className="space-y-4">
            {groupedBookings.RESCHEDULE_REQUESTED.map(booking => (
              <StudentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming/Accepted Sessions */}
      {groupedBookings.UPCOMING_ACCEPTED.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-yellow-900">Upcoming & Scheduled Sessions</h3>
          <div className="space-y-4">
            {groupedBookings.UPCOMING_ACCEPTED.map(booking => (
              <StudentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

       {/* NEW: Past Accepted Sessions (Awaiting Completion/Review) */}
       {groupedBookings.PAST_ACCEPTED.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-yellow-900">Past Sessions (Awaiting Completion)</h3>
          <div className="space-y-4">
            {groupedBookings.PAST_ACCEPTED.map(booking => (
              // StudentBookingCard will show different buttons based on ACCEPTED status
              // but the context here is that the time has passed.
              <StudentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}


      {/* Completed Sessions */}
      {groupedBookings.COMPLETED.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-3 text-learn9ja">Completed Sessions</h3>
          <div className="space-y-4">
            {groupedBookings.COMPLETED.map(booking => (
              <StudentBookingCard key={booking.id} booking={booking} /> // Card shows "Leave Review" here
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

