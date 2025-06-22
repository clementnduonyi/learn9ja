// src/components/teachers/TeacherCard.tsx
'use client';

import React, { useState, useTransition } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TeacherForCard } from "@/lib/types";
import { SubscriptionTier } from "@prisma/client";
import { cn } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import InstantBookingModal from '@/components/teacher/InstantBookingModal'; // <<< Import the modal
// Import ONLY the new initiate payment action
import { initiatePayment, type InitiatePaymentData } from "@/app/actions/bookingActions";

interface TeacherCardProps {
  teacher: TeacherForCard;
  variant?: 'display' | 'searchResult'; // Controls button behavior
  // This prop is ONLY passed when variant is 'searchResult'
  searchCriteria?: {
      preferredTimeUTC: Date;
      subjectId: string;
      level: string;
      durationMinutes?: number;
  }
}

function getDisplayAvatar(avatarUrl: string | null | undefined, gender: unknown ): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) { case 'MALE': return '/avatars/default-male.svg'; case 'FEMALE': return '/avatars/default-female.svg'; default: return '/avatars/default-other.svg'; }
}

export default function TeacherCard({ teacher, variant = 'display', searchCriteria }: TeacherCardProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionPending, startActionTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

 
const handleScheduledPayment = () => {
        if (!searchCriteria) {
            setError("Search details are missing to book this slot.");
            return;
        }
        setError(null);

        // --- Corrected Data Mapping ---
        // Create an object that matches the InitiatePaymentData interface
        const paymentData: InitiatePaymentData = {
            teacherUserId: teacher.id,
            subjectId: searchCriteria.subjectId,
            level: searchCriteria.level,
            requestedTime: searchCriteria.preferredTimeUTC, // Map preferredTimeUTC to requestedTime
            durationMinutes: searchCriteria.durationMinutes ?? 60, // Provide default duration
        };
        // --- End Correction ---

        startActionTransition(async () => {
            // Pass the correctly shaped object
            const result = await initiatePayment(paymentData);
            if (result.success && result.authorization_url) {
                window.location.href = result.authorization_url;
            } else {
                setError(result.error || "Could not start payment.");
            }
        });
    };


  // Button Logic
    const isInstantBookingDisabled = teacher.subscriptionTier === SubscriptionTier.BASIC || !teacher.isAvailableNow;
    const specializationText = teacher.teacherProfile?.specializations?.[0] || "General Tutor";
    const displayAvatar = getDisplayAvatar(teacher.avatarUrl, teacher.gender);



  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border ... flex flex-col">
        <div className="p-5 flex-grow">
            {/* ... Teacher info, rating, price, subjects - same as before ... */}
          <div className="flex items-center gap-4 mb-4">
          <Image
            src={displayAvatar}
            alt={`${teacher.name}'s profile`}
            width={64} height={64}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400"
            onError={(e) => { e.currentTarget.src = '/avatars/default-other.svg'; }}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{teacher.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{specializationText}</p>
          </div>
        </div>

        {/* --- Details Row --- */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center gap-1">
            <StarRating rating={teacher.teacherProfile?.averageRating ?? 0} readOnly={true} size="text-base" color="text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {(teacher.teacherProfile?.averageRating ?? 0).toFixed(1)}
            </span>
          </div>
          {teacher.teacherProfile?.pricePerHour !== null && (
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(
                    parseFloat(teacher.teacherProfile?.pricePerHour?.toString() ?? '0')
                )}/hr
            </p>
          )}
        </div>

        {/* --- Subjects Pills --- */}
        <div className="my-3 flex flex-wrap gap-2">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <span key={subject} className="text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full px-2.5 py-1">
              {subject}
            </span>
          ))}
          {teacher.subjects.length > 3 && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2.5 py-1">
              +{teacher.subjects.length - 3} more
            </span>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 mt-auto">
             {variant === 'display' && (
                <div className="grid grid-cols-2 gap-3">
                    <Link href={`/profile/teacher/${teacher.id}`} passHref>
                        <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isInstantBookingDisabled || isActionPending}
                        className={cn("w-full text-white", isInstantBookingDisabled ? "bg-gray-300 ..." : "bg-green-600 ...")}
                        title={isInstantBookingDisabled ? "Instant booking unavailable" : "Book an immediate session"}
                    >
                        Book Instant
                    </Button>
                </div>
            )}

            {variant === 'searchResult' && (
                <Button
                    onClick={handleScheduledPayment}
                    disabled={isActionPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isActionPending ? 'Redirecting...' : 'Pay & Book This Slot'}
                </Button>
            )}
              <div className="text-center mt-2 h-4 text-xs">
                {isActionPending && <p className="text-gray-500 animate-pulse">Please wait...</p>}
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
      </div>
      {/* --- Render the Modal for Instant Booking --- */}
      {variant === 'display' && (
          <InstantBookingModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              teacher={{ id: teacher.id, name: teacher.name || 'Teacher' }}
          />
      )}
    </div>
  );
};


