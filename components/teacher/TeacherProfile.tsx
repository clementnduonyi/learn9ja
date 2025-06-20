// src/components/teachers/TeacherProfileActions.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InstantBookingModal from './InstantBookingModal';
import { SubscriptionTier } from '@prisma/client';

interface TeacherProfileActionsProps {
    teacher: {
        id: string;
        name: string | null;
        isAvailableNow: boolean;
        subscriptionTier: SubscriptionTier;
    };
}

export default function TeacherProfile({ teacher }: TeacherProfileActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const isInstantBookingDisabled = teacher.subscriptionTier === SubscriptionTier.BASIC || !teacher.isAvailableNow;

    const handleScheduleClick = () => {
        // Redirect to find-teachers page, potentially pre-filling the teacher's name
        router.push(`/find-teachers?teacherId=${teacher.id}`);
    };

    return (
        <>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button onClick={handleScheduleClick} variant="outline" className="flex-1">
                    Schedule a Class
                </Button>
                <Button
                    onClick={() => setIsModalOpen(true)}
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

            <InstantBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                teacher={{ id: teacher.id, name: teacher.name || 'Teacher' }}
            />
        </>
    );
}

