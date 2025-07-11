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

    let totalSessionPrice: number | null = null;
    if (variant === 'searchResult' && searchCriteria?.durationMinutes && teacher.teacherProfile?.pricePerHour) {
        const rate = parseFloat(teacher.teacherProfile.pricePerHour.toString());
        totalSessionPrice = (rate / 60) * searchCriteria.durationMinutes;
    }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover">
       <div className="relative">
          {teacher.isAvailableNow && (
            <div className="absolute top-3 right-3 bg-learn9ja/50 text-white text-xs px-2 py-1 rounded-full">
              Available Now
            </div>
            
          )}
        </div>
        <div className="p-5 flex-grow">
            {/* ... Teacher info, rating, price, subjects - same as before ... */}
          <div className="flex items-center gap-4">
          <Image
            src={displayAvatar}
            alt={`${teacher.name}'s profile`}
            width={100} height={100}
            className="w-24 h-24 rounded-full object-cover border-2 border-learn9ja"
            onError={(e) => { e.currentTarget.src = '/avatars/default-other.svg'; }}
          />
          <div>
            <h3 className="font-semibold text-lg text-learn9ja-dark">{teacher.name}</h3>
            <p className="text-sm text-gray-500">{specializationText}</p>
          </div>
        </div>

        {/* --- Details Row --- */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center gap-1">
            <StarRating rating={teacher.teacherProfile?.averageRating ?? 0} readOnly={true} size="text-base" color="text-yellow-500" />
            <span className="text-gray-600 font-medium">
              {(teacher.teacherProfile?.averageRating ?? 0).toFixed(1)}
            </span>
          </div>
          {/* --- Conditional Price Display --- */}
          <div>
              {variant === 'searchResult' && totalSessionPrice !== null ? (
                  <p className="text-learn9ja font-semibold">
                      Total: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalSessionPrice)}
                  </p>
              ) : (
                  teacher.teacherProfile?.pricePerHour !== null && (
                      <p className="text-learn9ja font-semibold">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(parseFloat(teacher.teacherProfile?.pricePerHour?.toString() ?? '0'))}/hr
                      </p>
                  )
              )}
          </div>
        </div>

        {/* --- Subjects Pills --- */}
        <div className="my-3 flex flex-wrap gap-2">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <span key={subject} className="text-xs font-medium bg-learn9ja/10 text-learn9ja rounded-full px-2.5 py-1">
              {subject}
            </span>
          ))}
          {teacher.subjects.length > 3 && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
              +{teacher.subjects.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-5">
             {variant === 'display' && (
                <div className="grid grid-cols-2 gap-3 m-auto">
                    <Link href={`/profile/teacher/${teacher.id}`}>
                        <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isInstantBookingDisabled || isActionPending}
                        className={cn("w-full text-white hover:bg-learn9ja/90", isInstantBookingDisabled ? "bg-gray-300" : "bg-learn9ja")}
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
                    className="w-full bg-learn9ja  hover:bg-learn9ja/90 text-white"
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
      
      </div>
            {/* --- Render the Modal for Instant Booking --- */}
        {variant === 'display' && (
            <InstantBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                teacher={ teacher }
            />
        )}
    </>
  );
};