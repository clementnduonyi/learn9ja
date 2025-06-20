// src/components/teacher/TeacherRequestList.tsx
'use client';

import React, { useState } from 'react';
import type { Booking, User, Subject } from '@prisma/client';
import TeacherRequestCard from '@/components/teacher/RequestCard';


// Define the shape of the booking data including relations
type PendingBookingWithDetails = Booking & {
    student: Pick<User, 'name' | 'email'>;
    subject: Pick<Subject, 'name'>;
};

interface TeacherRequestListProps {
    initialBookings: PendingBookingWithDetails[];
}

export default function TeacherRequestList({ initialBookings }: TeacherRequestListProps) {
    const [bookings, setBookings] = useState(initialBookings);

    // Function to remove a booking from the list after response
    const handleResponse = (bookingId: string) => {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        // Optionally show a success message here
    };

    if (bookings.length === 0) {
        return <p className="text-gray-600">You have no pending class requests.</p>;
    }

    return (
        <div className="space-y-4">
            {bookings.map(booking => (
                <TeacherRequestCard
                    key={booking.id}
                    booking={booking}
                    onResponse={handleResponse} // Pass callback to remove from list
                />
            ))}
        </div>
    );
}