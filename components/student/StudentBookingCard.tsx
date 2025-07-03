'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BookingStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import ReviewModal from '@/components/teacher/reviews/ReviewModal';
import { StudentBookingWithDetails } from '@/lib/types';
import { cancelBooking, requestReschedule } from '@/app/actions/bookingActions'; 
import { getJoinToken } from '@/app/actions/videoActions'; 


interface StudentBookingCardProps {
  booking: StudentBookingWithDetails;
}

// Helper function
const formatLocalDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function StudentBookingCard({ booking }: StudentBookingCardProps) {
  const router = useRouter();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isActionPending, startActionTransition] = useTransition(); 
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(booking.status); 

  // State/Effect for Join button enablement (similar to teacher card)
  const [canJoin, setCanJoin] = useState(false);
  useEffect(() => {
    if (currentStatus !== BookingStatus.ACCEPTED) {
        setCanJoin(false); return;
    }
    const checkTime = () => {
        const now = new Date();
        const startTime = new Date(booking.requestedTime);
        const endTime = booking.endTimeUtc ? new Date(booking.endTimeUtc) : null;
        const joinWindowStart = new Date(startTime.getTime() - 10 * 60000);
        const joinWindowEnd = endTime ? new Date(endTime.getTime() + 15 * 60000) : null;
        setCanJoin(now >= joinWindowStart && (!joinWindowEnd || now <= joinWindowEnd));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [booking.requestedTime, booking.endTimeUtc, currentStatus]);

  // --- Action Handlers ---
  const handleCancel = () => {
    setActionError(null);
    if (!confirm("Are you sure you want to cancel this request/booking?")) return;
    startActionTransition(async () => {
      const result = await cancelBooking(booking.id);
      if (result.error) {
        setActionError(result.error);
      } else {
        setCurrentStatus(BookingStatus.CANCELLED); // Update local state immediately
        router.refresh(); // Refresh server data
      }
    });
  };

  const handleRescheduleRequest = () => {
     setActionError(null);
     // Optional: Add a prompt or modal for reason
     const reason = prompt("Optional: Enter a brief reason for requesting reschedule:");
     if (reason === null) return; // User cancelled prompt

     startActionTransition(async () => {
         const result = await requestReschedule(booking.id, reason || undefined);
         if (result.error) {
             setActionError(result.error);
         } else {
             setCurrentStatus(BookingStatus.RESCHEDULE_REQUESTED); // Update local state
             router.refresh();
         }
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
                router.push(`/join-call/booking/${booking.id}`);
            } else {
                setActionError(result.error || "Failed to get join information.");
            }
        });
    };

  // --- Render Card ---
  const teacherName = booking.teacher?.name ?? 'Teacher';

  // Determine status color/text (example)
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
      <div className="p-4 border rounded-lg shadow-sm bg-white space-y-2 flex flex-col sm:flex-row justify-between">
        {/* Details */}
        <div className="flex-grow mb-2 sm:mb-0 pr-4">
            <p className="font-semibold text-lg">
              {booking.subject.name} ({booking.level.charAt(0) + booking.level.slice(1).toLowerCase()})
            </p>
            <p className="text-sm text-gray-800">
              Teacher: <span className="font-medium">{teacherName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Scheduled Time: <span className="font-medium">{formatLocalDateTime(booking.requestedTime)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getStatusClass(currentStatus)}`}>{currentStatus.replace('_', ' ')}</span>
            </p>
             {actionError && <p className="text-red-500 text-xs mt-1">{actionError}</p>}
        </div>

        {/* Actions based on Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0 self-end sm:self-center">
            {currentStatus === BookingStatus.PENDING && (
                 <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>
                     {isActionPending ? 'Cancelling...' : 'Cancel Request'}
                 </Button>
            )}
            {currentStatus === BookingStatus.ACCEPTED && (
                <>
                    <Button variant="outline" size="sm" onClick={handleRescheduleRequest} disabled={isActionPending}>
                        {isActionPending ? '...' : 'Reschedule?'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>
                         {isActionPending ? '...' : 'Cancel Booking'}
                    </Button>
                    <Button variant="default" size="sm" onClick={handleJoinCall} disabled={!canJoin || isActionPending} title={!canJoin ? `Available from ${formatLocalDateTime(new Date(new Date(booking.requestedTime).getTime() - 10 * 60000))}` : "Join the video call"}>
                        {isActionPending ? '...' : 'Join Call'}
                    </Button>
                </>
            )}
             {currentStatus === BookingStatus.RESCHEDULE_REQUESTED && (
                 <>
                    <span className="text-xs italic text-blue-700 px-2 py-1">Waiting for teacher response...</span>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isActionPending}>
                         {isActionPending ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                 </>

            )}
            {currentStatus === BookingStatus.COMPLETED && booking.review === null && (
                <Button variant="secondary" size="sm" onClick={() => setIsReviewModalOpen(true)} disabled={isActionPending}>
                    Leave Review
                </Button>
            )}
            {currentStatus === BookingStatus.COMPLETED && booking.review !== null && (
                 <p className="text-sm text-green-700 italic px-3 py-1 text-right">Reviewed</p>
            )}
             {(currentStatus === BookingStatus.DECLINED || currentStatus === BookingStatus.CANCELLED) && (
                 <p className="text-sm text-gray-500 italic px-3 py-1 text-right">{currentStatus}</p>
             )}
        </div>
      </div>

      {/* Render the Modal Conditionally */}
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





