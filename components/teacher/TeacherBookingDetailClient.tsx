// src/components/teacher/TeacherBookingDetailClient.tsx
'use client';

// This component receives the fetched booking data and renders details + action buttons for the teacher

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingStatus } from '@prisma/client';
import type { PlainTeacherBookingWithDetails } from '@/app/teacher/bookings/[bookingId]/page'; // Import type from page
import { Button } from '@/components/ui/button';
// Import relevant actions
import { respondToBookingRequest } from '@/app/actions/bookingResponseActions'; // Or bookingActions
import { cancelBooking, completeBooking, acknowledgeRescheduleRequest } from '@/app/actions/bookingActions';
import { getJoinToken } from '@/app/actions/videoActions';

interface TeacherBookingDetailClientProps {
  booking: PlainTeacherBookingWithDetails;
}

// Helper function
const formatLocalDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
}

export default function TeacherBookingDetailClient({ booking }: TeacherBookingDetailClientProps) {
    const router = useRouter();
    const [isActionPending, startActionTransition] = useTransition();
    const [actionError, setActionError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState(booking.status);
    const [canJoin, setCanJoin] = useState(false);
    const [canMarkComplete, setCanMarkComplete] = useState(false);

    // Effect for enabling Join/Complete buttons based on time/status
     useEffect(() => {
        if (currentStatus !== BookingStatus.ACCEPTED) {
             setCanJoin(false);
             setCanMarkComplete(false);
             return;
        }
        const checkTime = () => {
            const now = new Date();
            const startTime = new Date(booking.requestedTime);
            const endTime = booking.endTimeUtc ? new Date(booking.endTimeUtc) : null;
            // Join logic
            const joinWindowStart = new Date(startTime.getTime() - 10 * 60000);
            const joinWindowEnd = endTime ? new Date(endTime.getTime() + 15 * 60000) : null;
            setCanJoin(now >= joinWindowStart && (!joinWindowEnd || now <= joinWindowEnd));
            // Complete logic
            setCanMarkComplete(endTime ? now >= endTime : false);
        };
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [booking.requestedTime, booking.endTimeUtc, currentStatus]);


    // --- Action Handlers ---
    const handleAcceptDecline = (response: 'ACCEPTED' | 'DECLINED') => {
        setActionError(null);
        startActionTransition(async () => {
            const result = await respondToBookingRequest(booking.id, response);
            if (result.error) { setActionError(result.error); }
            else { setCurrentStatus(response === 'ACCEPTED' ? BookingStatus.ACCEPTED : BookingStatus.DECLINED); router.refresh(); }
        });
    };

     const handleCancel = () => {
         setActionError(null);
         if (!confirm("Are you sure you want to cancel this booking? This cannot be undone.")) return;
         startActionTransition(async () => {
             const result = await cancelBooking(booking.id);
             if (result.error) { setActionError(result.error); }
             else { setCurrentStatus(BookingStatus.CANCELLED); router.refresh(); }
         });
     };

     const handleMarkComplete = () => {
         setActionError(null);
         if (!confirm("Mark this session as complete?")) return;
         startActionTransition(async () => {
             const result = await completeBooking(booking.id);
             if (result.error) { setActionError(result.error); }
             else { setCurrentStatus(BookingStatus.COMPLETED); router.refresh(); }
         });
     };

     const handleJoinCall = () => {
         setActionError(null);
         startActionTransition(async () => {
            const result = await getJoinToken(booking.id);
            if (result.success && result.token && result.roomName && result.wsUrl) {
                sessionStorage.setItem('lk_token', result.token);
                sessionStorage.setItem('lk_room', result.roomName);
                sessionStorage.setItem('lk_url', result.wsUrl);
                router.push(`/booking/${booking.id}/call`);
            } else {
                setActionError(result.error || "Failed to get join information.");
            }
        });
     };

    
    // --- NEW: Handler for Acknowledging Reschedule Request ---

    const handleAcknowledgeReschedule = () => {
        setActionError(null);
        if (!confirm("This will cancel the booking and notify the student to book a new time. Are you sure?")) return;
        startActionTransition(async () => {
            const result = await acknowledgeRescheduleRequest(booking.id);
            if (result.error) { setActionError(result.error); }
            else { setCurrentStatus('CANCELLED'); router.refresh(); }
        });
    };


    


    const studentName = booking.student?.name || booking.student?.email || 'Student';
      
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
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8 space-y-4">
            {/* Display Details */}
            <h2 className="text-2xl font-semibold">{booking.subject.name} ({booking.level})</h2>
            <p><strong>Student:</strong> {studentName}</p>
            <p><strong>Requested Time:</strong> {formatLocalDateTime(booking.requestedTime)}</p>
            <p><strong>Duration:</strong> {booking.durationMinutes} minutes</p>
            {booking.endTimeUtc && <p><strong>Scheduled End:</strong> {formatLocalDateTime(booking.endTimeUtc)}</p>}
            <p><strong>Status:</strong> <span className={`font-medium px-2 py-0.5 rounded-full text-sm ${getStatusClass(currentStatus)}`}>{currentStatus.replace('_', ' ')}</span></p>
            {booking.calculatedPrice && <p><strong>Price:</strong> &#8358;{booking.calculatedPrice.toFixed(2)}</p>}

            {/* Action Buttons based on Status */}
            <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                {currentStatus === BookingStatus.PENDING && (
                    <>
                        <Button variant="default" size="sm" onClick={() => handleAcceptDecline('DECLINED')} disabled={isActionPending}>Decline</Button>
                        <Button variant="default" size="sm" onClick={() => handleAcceptDecline('ACCEPTED')} disabled={isActionPending}>Accept</Button>
                    </>
                )}
                {currentStatus === BookingStatus.ACCEPTED && (
                     <>
                        <Button variant="default" size="sm" onClick={handleJoinCall} disabled={!canJoin || isActionPending} title={!canJoin ? `Available soon` : "Join Call"}>Join Call</Button>
                        <Button variant="secondary" size="sm" onClick={handleMarkComplete} disabled={!canMarkComplete || isActionPending} title={!canMarkComplete ? "Available after session end" : "Mark Complete"}>Mark Complete</Button>
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>Cancel Booking</Button>
                    </>
                )}
                 {currentStatus === BookingStatus.RESCHEDULE_REQUESTED && (
                     <>
                        <p className="text-sm italic text-blue-700 p-2 w-full">Student requested to reschedule. Please contact them directly to arrange a new time.</p>
                        {/* Buttons to Acknowledge (set back to ACCEPTED?) or Cancel? */}
                       <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>
                            Cancel Booking
                       </Button>

                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleAcknowledgeReschedule} 
                            disabled={isActionPending}
                        >
                            Acknowledge
                        </Button>
                    </>
                )}
                 {currentStatus === BookingStatus.COMPLETED && (
                     <p className="text-sm text-green-700 font-medium p-2">Session Completed</p>
                 )}
                 {(currentStatus === BookingStatus.DECLINED || currentStatus === BookingStatus.CANCELLED) && (
                     <p className="text-sm text-gray-500 italic p-2">This booking is {currentStatus.toLowerCase()}.</p>
                 )}
            </div>
             {actionError && <p className="text-red-500 text-xs mt-2">{actionError}</p>}
        </div>
    );
}



