'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image'; // Assuming you might want an avatar later
import { Button } from '@/components/ui/button'; 
import { getJoinToken } from '@/app/actions/videoActions'; 
import { UpcomingBookingCardProps } from '@/lib/types'
import {  BookingStatus } from '@prisma/client';
import { completeBooking } from '@/app/actions/bookingActions';



// Helper function to format time - displays in browser's local timezone
const formatLocalDateTime = (date: Date | string): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, { // Use user's default locale
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function UpcomingBookingCard({ booking, onResponse }: UpcomingBookingCardProps) {
    const router = useRouter();
    const [isJoining, startJoinTransition] = useTransition();
    const [isCompleting, startCompleteTransition] = useTransition();
    const [joinError, setJoinError] = useState<string | null>(null);
    const [completeError, setCompleteError] = useState<string | null>(null);
    const [canMarkComplete, setCanMarkComplete] = useState(false);
    const [canJoin, setCanJoin] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(booking.status);

     // Effect to determine if buttons should be enabled based on time/status
     useEffect(() => {
        if (currentStatus !== BookingStatus.ACCEPTED) {
             setCanJoin(false);
             setCanMarkComplete(false);
             return; // No actions if not accepted
        }

        const checkTime = () => {
            const now = new Date();
            const startTime = new Date(booking.requestedTime);
            const endTime = booking.endTimeUtc ? new Date(booking.endTimeUtc) : null;

            // Join logic
            const joinWindowStart = new Date(startTime.getTime() - 10 * 60000); // 10 mins before
            const joinWindowEnd = endTime ? new Date(endTime.getTime() + 15 * 60000) : null; // 15 mins after
            setCanJoin(now >= joinWindowStart && (!joinWindowEnd || now <= joinWindowEnd));

            // Complete logic (enable slightly after scheduled end time)
            const completeEnableTime = endTime ? new Date(endTime.getTime() - 1 * 60000) : null; // Allow marking 1 min before end? Or exactly at end? Let's use end time.
            setCanMarkComplete(endTime ? now >= endTime : false); // Enable only if end time exists and has passed

        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Re-check every minute
        return () => clearInterval(interval);
    }, [booking.requestedTime, booking.endTimeUtc, currentStatus]); // Depend on status change



    const handleJoinCall = () => { 
        setJoinError(null);
        startJoinTransition(async () => {
            const result = await getJoinToken(booking.id);
            if (result.success && result.token && result.roomName && result.wsUrl) {
                sessionStorage.setItem('lk_token', result.token);
                sessionStorage.setItem('lk_room', result.roomName);
                sessionStorage.setItem('lk_url', result.wsUrl);
                router.push(`/booking/${booking.id}/call`);
            } else {
                setJoinError(result.error || "Failed to get join information.");
            }
        });
     };

      // --- Handler for Mark Complete ---
    const handleMarkComplete = () => {
        setCompleteError(null);
        if (!confirm("Are you sure you want to mark this session as complete?")) {
             return;
        }

        startCompleteTransition(async () => {
            const result = await completeBooking(booking.id);
            if (result.error || !result.success) {
                setCompleteError(result.error || "Failed to mark session complete.");
            } else {
                // Success! Update local state to reflect completion
                setCurrentStatus(BookingStatus.COMPLETED);
                // Optionally call onResponse if needed, but revalidatePath handles refresh
                // onResponse?.(booking.id);
                // router.refresh(); // Let revalidatePath handle it usually
            }
        });
    };


    // --- Render the Card ---
    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Booking Details */}
            <div className="flex-grow">
                {/* ... (details remain the same) ... */}
                 <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${currentStatus === BookingStatus.COMPLETED ? 'text-green-600' : ''}`}>{currentStatus}</span> {/* Display status */}
                </p>
                 {(joinError || completeError) && <p className="text-red-500 text-xs mt-1">{joinError || completeError}</p>}
            </div>

            {/* Action Buttons - Conditionally Render based on status */}
            <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto justify-end items-center">
                {currentStatus === BookingStatus.ACCEPTED && (
                     <>
                         {/* Cancel Button Placeholder */}
                         <Button variant="outline" size="sm" disabled title="Cancel functionality not yet implemented" className='text-xs'>
                            Cancel
                        </Button>
                         {/* Join Call Button */}
                         <Button variant="default" size="sm" onClick={handleJoinCall} disabled={!canJoin || isJoining} title={!canJoin ? `Cannot join yet. Available from ${formatLocalDateTime(new Date(new Date(booking.requestedTime).getTime() - 10 * 60000))}` : "Join the video call"}>
                            {isJoining ? 'Joining...' : 'Join Call'}
                        </Button>
                         {/* Mark Complete Button */}
                         <Button variant="secondary" size="sm" onClick={handleMarkComplete} disabled={!canMarkComplete || isCompleting} title={!canMarkComplete ? "Available after session end time" : "Mark session as complete"}>
                             {isCompleting ? 'Completing...' : 'Mark Complete'}
                        </Button>
                     </>
                )}
                {currentStatus === BookingStatus.COMPLETED && (
                     <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Completed</span>
                     // TODO: Add "Leave Review" button for student view here later
                )}
                 {/* Handle other statuses like PENDING, DECLINED, CANCELLED if this card is reused */}
            </div>
        </div>
    );
}