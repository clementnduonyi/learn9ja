// src/components/student/StudentBookingDetailClient.tsx
'use client';

// This component receives the fetched booking data and renders details + action buttons
// It mirrors the logic previously put into StudentBookingCard but for a detail view

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingStatus } from '@prisma/client';
import type { PlainStudentBookingWithDetails } from '@/app/student/bookings/[bookingId]/page'; // Adjust path
import { Button } from '@/components/ui/button';
import ReviewModal from '@/components/teacher/reviews/ReviewModal';
import { cancelBooking, requestReschedule } from '@/app/actions/bookingActions';
import { getJoinToken } from '@/app/actions/videoActions';

interface StudentBookingDetailClientProps {
  booking: PlainStudentBookingWithDetails;
}

// Helper function
const formatLocalDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }); // More detail
}

export default function StudentBookingDetailClient({ booking }: StudentBookingDetailClientProps) {
    const router = useRouter();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isActionPending, startActionTransition] = useTransition();
    const [actionError, setActionError] = useState<string | null>(null);
    // Use booking.status directly, or sync to local state if needed for immediate feedback
    const [currentStatus, setCurrentStatus] = useState(booking.status);
    const [canJoin, setCanJoin] = useState(false);
    const [canReschedule, setCanReschedule] = useState(false);

    // Effect to determine if Join button should be enabled
    useEffect(() => {
        if (currentStatus !== BookingStatus.ACCEPTED) { setCanJoin(false); return; }
        const checkTime = () => {
            const now = new Date();
            const startTime = new Date(booking.requestedTime);
            const endTime = booking.endTimeUtc ? new Date(booking.endTimeUtc) : null;
            const joinWindowStart = new Date(startTime.getTime() - 10 * 60000);
            const joinWindowEnd = endTime ? new Date(endTime.getTime() + 15 * 60000) : null;
            setCanJoin(now >= joinWindowStart && (!joinWindowEnd || now <= joinWindowEnd));
        };

        if (booking.status === 'ACCEPTED') {
            const now = new Date();
            const oneHourInMillis = 60 * 60 * 1000;
            const sessionStartTime = new Date(booking.requestedTime);
            setCanReschedule(sessionStartTime.getTime() - now.getTime() > oneHourInMillis);
        } else {
            setCanReschedule(false);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [booking.requestedTime, booking.endTimeUtc, currentStatus]);

    // Action Handlers (similar to card)
    const handleCancel = () => { /* ... call cancelBooking, update state/error ... */
        setActionError(null);
        if (!confirm("Are you sure you want to cancel this request/booking?")) return;
        startActionTransition(async () => {
          const result = await cancelBooking(booking.id);
          if (result.error) { setActionError(result.error); }
          else { setCurrentStatus(BookingStatus.CANCELLED); router.refresh(); } // Update local status & refresh
        });
    };
    const handleRescheduleRequest = () => { /* ... call requestReschedule, update state/error ... */
        setActionError(null);
        const reason = prompt("Optional: Enter a brief reason for requesting reschedule:");
        if (reason === null) return;
        startActionTransition(async () => {
            const result = await requestReschedule(booking.id, reason || undefined);
            if (result.error) { setActionError(result.error); }
            else { setCurrentStatus(BookingStatus.RESCHEDULE_REQUESTED); router.refresh(); }
        });
     };
    const handleJoinCall = () => { /* ... call getJoinToken, redirect ... */
        setActionError(null);
        startActionTransition(async () => {
            const result = await getJoinToken(booking.id);
            if (result.success && result.token && result.roomName && result.wsUrl) {
                sessionStorage.setItem('lk_token', result.token);
                sessionStorage.setItem('lk_room', result.roomName);
                sessionStorage.setItem('lk_url', result.wsUrl);
                router.push(`/join-call/booking/${booking.id}`);
            } else {
                setActionError(result.error || "Failed to get join information.");
            }
        });
    };

    const teacherName = booking.teacher?.name ?? 'Teacher';
    
    const getStatusClass = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
            case BookingStatus.ACCEPTED: return 'text-indigo-600 bg-indigo-100';
            case BookingStatus.COMPLETED: return 'text-green-600 bg-green-100';
            case BookingStatus.DECLINED: return 'text-red-600 bg-red-100';
            case BookingStatus.CANCELLED: return 'text-gray-600 bg-gray-100';
            case BookingStatus.RESCHEDULE_REQUESTED: return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8 space-y-4">
                {/* Display Details */}
                <h2 className="text-2xl font-semibold">{booking.subject.name} ({booking.level})</h2>
                <p><strong>Teacher:</strong> {teacherName}</p>
                <p><strong>Scheduled Time:</strong> {formatLocalDateTime(booking.requestedTime)}</p>
                <p><strong>Duration:</strong> {booking.durationMinutes} minutes</p>
                <p><strong>Status:</strong> <span className={`font-medium px-2 py-0.5 rounded-full text-sm ${getStatusClass(currentStatus)}`}>{currentStatus.replace('_', ' ')}</span></p>
                {booking.calculatedPrice && <p><strong>Price:</strong> &#8358;{booking.calculatedPrice.toFixed(2)}</p>}

                {/* Display Action Buttons Conditionally */}
                <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                    {currentStatus === BookingStatus.PENDING && (
                         <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>Cancel Request</Button>
                    )}
                    {currentStatus === BookingStatus.ACCEPTED && (
                        <>
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={handleJoinCall} 
                                disabled={!canJoin || isActionPending} 
                                title={!canJoin ? `Available soon` : "Join Call"}
                                
                            >
                                Join Call
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRescheduleRequest} 
                                disabled={isActionPending  || !canReschedule}
                                title={!canReschedule ? "Cannot reschedule less than 1 hour before start" : "Request a new time"}
                            >

                                Request Reschedule
                            </Button>

                            <Button variant="default" size="sm" onClick={handleCancel} disabled={isActionPending}>
                            Cancel  Booking
                            </Button> {/* Destructive variant */}
                        </>

                       
                    )}
                     {currentStatus === BookingStatus.RESCHEDULE_REQUESTED && (
                         <>
                            <span className="text-sm italic text-blue-700 p-2">Reschedule requested. Waiting for teacher...</span>
                            <Button variant="default" size="sm" onClick={handleCancel} disabled={isActionPending}>Cancel Booking</Button>
                         </>
                    )}
                    {currentStatus === BookingStatus.COMPLETED && booking.review === null && (
                        <Button variant="secondary" size="sm" onClick={() => setIsReviewModalOpen(true)} disabled={isActionPending}>Leave Review</Button>
                    )}
                    {currentStatus === BookingStatus.COMPLETED && booking.review !== null && (
                         <p className="text-sm text-green-700 italic p-2">Review Submitted</p>
                    )}
                     {(currentStatus === BookingStatus.DECLINED || currentStatus === BookingStatus.CANCELLED) && (
                         <p className="text-sm text-gray-500 italic p-2">This booking is {currentStatus.toLowerCase()}.</p>
                     )}
                </div>
                 {actionError && <p className="text-red-500 text-xs mt-2">{actionError}</p>}
            </div>

            {/* Render the Review Modal */}
            {isReviewModalOpen && (
               <ReviewModal
                  isOpen={isReviewModalOpen}
                  onClose={() => setIsReviewModalOpen(false)}
                  bookingId={booking.id}
                  teacherName={teacherName}
               />
            )}
        </>
    );
}


