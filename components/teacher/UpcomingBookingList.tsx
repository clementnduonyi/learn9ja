// src/components/teacher/UpcomingBookingsList.tsx (Updated)

'use client';

import React from 'react'; // Removed useState as it's now managed in card/parent
import UpcomingBookingCard from './UpcomingBookingCard'; // Import the new card component and type
import { UpcomingBookingWithDetails } from '@/lib/types'

// Props interface remains the same
interface UpcomingBookingsListProps {
  bookings: UpcomingBookingWithDetails[];
}

export default function UpcomingBookingsList({ bookings }: UpcomingBookingsListProps) {

  // Remove formatLocalDateTime if not used elsewhere, or move to utils file

  if (!bookings || bookings.length === 0) {
    return <p className="text-gray-600 italic">You have no upcoming scheduled classes.</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        // Render the card component for each booking
        <UpcomingBookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}