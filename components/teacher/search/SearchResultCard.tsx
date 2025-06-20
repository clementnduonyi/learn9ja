// src/components/search/TeacherCard.tsx
'use client';

import React, { useTransition, useState } from 'react';
import { SearchCriteria, TeacherSearchResult, } from '@/lib/types'
import { Button } from '@/components/ui/button';
import { createBookingRequest } from '@/app/actions/bookingActions'; // Assuming action is in studentActions
import Image from 'next/image'; // Use Next.js Image component

interface TeacherCardProps {
    teacher: TeacherSearchResult;
    searchCriteria: Pick<SearchCriteria, 'subjectId' | 'level' | 'preferredTimeUTC'>; // Pass needed criteria for booking
}

export default function TeacherCard({ teacher, searchCriteria }: TeacherCardProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const handleRequestClass = () => {
         setError(null);
         setSuccess(null);
         if (!confirm(`Request a class with ${teacher.name || 'this teacher'} at ${searchCriteria.preferredTimeUTC.toLocaleString()}?`)) {
             return;
         }

        startTransition(async () => {
            const result = await createBookingRequest({ // Need to implement this action
                teacherUserId: teacher.userId,
                subjectId: searchCriteria.subjectId,
                level: searchCriteria.level,
                requestedTime: searchCriteria.preferredTimeUTC,
                 // durationMinutes could be passed too if needed
            });

            if (result?.error || !result?.success) {
                 setError(result?.error || "Failed to send request.");
             } else {
                 setSuccess("Request sent successfully!");
                 // Optionally disable button or change state after success
             }
        });
    };


    return (
        <div className="border rounded-lg p-4 shadow-md bg-white flex flex-col justify-between">
            <div>
                <div className="flex items-center mb-3">
                     <Image
                        src={teacher.avatarUrl || '/default-avatar.png'} // Provide a default avatar
                        alt={teacher.name || 'Teacher avatar'}
                        width={50}
                        height={50}
                        className="rounded-full mr-3"
                    />
                    <div>
                        <h3 className="text-lg font-semibold">{teacher.name || 'Teacher'}</h3>
                         {/* Display Rating */}
                        {teacher.averageRating !== null && (
                            <p className="text-sm text-yellow-600">
                                 Rating: {teacher.averageRating.toFixed(1)} / 5
                                 {/* You could use star icons here */}
                            </p>
                        )}
                    </div>
                </div>
                {teacher.bio && (
                     <p className="text-sm text-gray-600 mb-3 line-clamp-3">{teacher.bio}</p> // Show snippet of bio
                 )}
                {/* Display subjects/levels if needed (requires fetching them in search result) */}
            </div>

            {/* Action Button & Messages */}
             <div className="mt-4">
                 {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
                 {success && <p className="text-xs text-green-600 mb-1">{success}</p>}
                 <Button
                    onClick={handleRequestClass}
                    disabled={isPending || !!success} // Disable if pending or already succeeded
                    className="w-full"
                    size="sm"
                >
                    {isPending ? 'Sending...' : (success ? 'Requested!' : 'Request Class')}
                </Button>
            </div>
        </div>
    );
}