// src/components/teacher/TeacherRequestCard.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // For router.refresh
import { Button } from '@/components/ui/button';
import { respondToBookingRequest } from '@/app/actions/bookingResponseActions'; // Adjust path
import {  TeacherRequestCardProps } from '@/lib/types'



export default function TeacherRequestCard({ booking, onResponse }: TeacherRequestCardProps) {
    const router = useRouter();
    const [isAccepting, startAcceptTransition] = useTransition();
    const [isDeclining, startDeclineTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const isProcessing = isAccepting || isDeclining;

    const handleResponseClick = (response: 'ACCEPTED' | 'DECLINED') => {
        setError(null);
        const action = response === 'ACCEPTED' ? startAcceptTransition : startDeclineTransition;

        action(async () => {
            const result = await respondToBookingRequest(booking.id, response);
            if (result.error || !result.success) {
                setError(result.error || `Failed to ${response.toLowerCase()} request.`);
            } else {
                // Success! Notify parent to remove from list
                onResponse(booking.id);
                // Refresh server data on other pages potentially
                router.refresh();
            }
        });
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Booking Details */}
            <div className="flex-grow">
                <p className="font-semibold">
                    {booking.subject.name} ({booking.level.charAt(0) + booking.level.slice(1).toLowerCase()})
                </p>
                <p className="text-sm text-gray-700">
                    Student: {booking.student.name || booking.student.email}
                </p>
                <p className="text-sm text-gray-700">
                    Requested Time (UTC): {new Date(booking.requestedTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' })}
                </p>
                 <p className="text-sm text-gray-700">
                    Duration: {booking.durationMinutes} minutes
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 flex-shrink-0">
                <Button
                    variant="outline" // Example style for decline
                    size="sm"
                    onClick={() => handleResponseClick('DECLINED')}
                    disabled={isProcessing}
                >
                    {isDeclining ? 'Declining...' : 'Decline'}
                </Button>
                <Button
                    // variant="primary" // Example style for accept (assuming default is primary)
                    size="sm"
                    onClick={() => handleResponseClick('ACCEPTED')}
                    disabled={isProcessing}
                >
                    {isAccepting ? 'Accepting...' : 'Accept'}
                </Button>
            </div>
             {error && <p className="text-red-500 text-xs text-center mt-2 w-full sm:col-span-2">{error}</p>} {/* Error display */}
        </div>
    );
}