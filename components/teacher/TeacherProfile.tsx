// src/components/teachers/TeacherProfileActions.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InstantBookingModal from './InstantBookingModal';
import ScheduleBookingModal from './ScheduleBookingModal'
import { SubscriptionTier } from '@prisma/client';
import type { TeacherForCard } from '@/lib/types';

interface TeacherProfileActionsProps {
    teacher: TeacherForCard;
}

export default function TeacherProfileActions({ teacher }: TeacherProfileActionsProps) {
    const [isInstantModalOpen, setIsInstantModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    // Use the full teacher object for checks
    const isInstantBookingDisabled = teacher.subscriptionTier === SubscriptionTier.BASIC || !teacher.isAvailableNow;

    return (
        <>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setIsScheduleModalOpen(true)} variant="outline" className="flex-1">
                    Schedule a Class
                </Button>
                <Button
                    onClick={() => setIsInstantModalOpen(true)}
                    disabled={isInstantBookingDisabled}
                    className={cn("flex-1 text-white", isInstantBookingDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700")}
                >
                    Book Instant Session
                </Button>
            </div>
            {teacher.isAvailableNow && (
                <div className="text-center text-sm text-green-600 mt-2 animate-pulse">
                    Available now!
                </div>
            )}

            {/* Pass the full teacher object down to the modals */}
            <div className='m-auto w-50'>
                <InstantBookingModal 
                isOpen={isInstantModalOpen} 
                onClose={() => setIsInstantModalOpen(false)} 
                teacher={teacher} 
            />
            <ScheduleBookingModal 
                isOpen={isScheduleModalOpen} 
                onClose={() => setIsScheduleModalOpen(false)} 
                teacher={teacher} 
            />
            </div>
            
        </>
    );
}