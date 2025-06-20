// src/components/teachers/TeacherCard.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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

function getDisplayAvatar(avatarUrl: string | null | undefined, gender: any): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) { case 'MALE': return '/avatars/default-male.svg'; case 'FEMALE': return '/avatars/default-female.svg'; default: return '/avatars/default-other.svg'; }
}

export default function TeacherCard({ teacher, variant = 'display', searchCriteria }: TeacherCardProps) {
  const router = useRouter();
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



// src/components/teachers/TeacherCard.tsx
/*'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TeacherForCard } from "@/lib/types"; // Import the shared type
import { SubscriptionTier } from "@prisma/client";
import { cn } from "@/lib/utils"; // Optional classname utility
import StarRating from "@/components/StarRating"; // Import our StarRating component
//import { usePaystackPayment } from "react-paystack"; // <<< Import Paystack hook
import { verifyPaymentAndCreateBooking } from "@/app/actions/bookingActions"; // <<< Import the NEW verification action
import { createClient } from '@/lib/supabase/client'; // Use client-side Supabase

import {Paystack} from 'paystack-sdk';

const paystack = new Paystack(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);

// Helper function
function getDisplayAvatar(avatarUrl: string | null | undefined, gender: any): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) {
        case 'MALE': return '/avatars/default-male.svg';
        case 'FEMALE': return '/avatars/default-female.svg';
        default: return '/avatars/default-other.svg';
    }
}

interface TeacherCardProps {
  teacher: TeacherForCard;
  // This prop is passed by the search form component for scheduled bookings
  searchCriteria?: {
      preferredTime: Date;
      subjectId: string;
      level: string;
      durationMinutes?: number;
  }
}

export default function TeacherCard({ teacher, searchCriteria }: TeacherCardProps) {
  const [isActionPending, startActionTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');

  // Fetch the logged-in student's email on component mount for the Paystack config
  useEffect(() => {
    const getEmail = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            setStudentEmail(user.email);
        }
    };
    getEmail();
  }, []);


  // --- Paystack Logic ---
  const durationMinutes = searchCriteria?.durationMinutes ?? 60;
  const pricePerHour = parseFloat(teacher.teacherProfile?.pricePerHour?.toString() ?? '0');
  const sessionPrice = (pricePerHour * durationMinutes) / 60;
  // Paystack requires amount in smallest currency unit (kobo for NGN)
  const sessionPriceInKobo = Math.round(sessionPrice * 100);

  const paystackConfig = {
      reference: new Date().getTime().toString(), // Generate a unique reference for each transaction attempt
      email: studentEmail,
      amount: sessionPriceInKobo.toString(),
  };

  const initializePayment = paystack.transaction.initialize(paystackConfig);

  // Callback function triggered after a successful payment from the Paystack popup
  const onPaymentSuccess = (reference: { reference: string }) => {
      console.log("Paystack success callback received. Reference:", reference.reference);
      setError(null);
      setSuccess(null);

      // We need booking details to verify on the backend.
      // This is for a SCHEDULED booking, using the searchCriteria prop.
      const bookingDetails = {
          paystackReference: reference.reference,
          teacherUserId: teacher.id,
          subjectId: searchCriteria?.subjectId || '',
          level: searchCriteria?.level || '',
          requestedTime: searchCriteria?.preferredTime || new Date(),
          durationMinutes: durationMinutes,
      };

      // A simple validation to ensure we have the necessary details before calling the server
      if (!bookingDetails.subjectId || !bookingDetails.level || !searchCriteria) {
          setError("Missing subject, level, or time to complete booking.");
          return;
      }

      startActionTransition(async () => {
          const result = await verifyPaymentAndCreateBooking(bookingDetails);
          if (result.error || !result.success) {
              setError(result.error || "Booking failed after payment verification.");
          } else {
              setSuccess(`Request sent! ID: ${result.bookingId}`);
          }
      });
  };

  // Callback function if the user closes the Paystack popup
  const onPaymentClose = () => {
      console.log("Paystack payment popup closed by user.");
      setError("Payment was cancelled."); // Optionally notify user
  };

  const handleBookScheduled = () => {
      setError(null);
      setSuccess(null);
      if (!studentEmail) {
          setError("Could not retrieve your user email for payment.");
          return;
      }
      if (sessionPriceInKobo <= 0) {
          // Handle free sessions - bypass payment and call a different action
           alert("This would trigger a free booking request.");
           return;
      }
      // Initialize payment with the success and close callbacks
      initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose });
  };

  const handleBookInstant = () => {
       setError(null);
       setSuccess(null);
       // TODO: Implement UI to select subject/level for instant booking
       alert("Instant booking requires selecting a subject/level first. UI for this is not yet implemented.");
       return;
       // When implemented, it would call initializePayment like handleBookScheduled
  };

  // --- Button Logic ---
  const specializationText = teacher.teacherProfile?.specializations?.[0] || "General Tutor";
  const displayAvatar = getDisplayAvatar(teacher.avatarUrl, teacher.gender);
  // An instant booking button is disabled if the teacher is on the BASIC tier OR not "online"
  const isInstantBookingDisabled = teacher.subscriptionTier === SubscriptionTier.BASIC || !teacher.isAvailableNow;
  // A scheduled booking button is disabled if the student hasn't provided search criteria
  const isScheduledBookingDisabled = !searchCriteria?.preferredTimeUTC || !searchCriteria.subjectId || !searchCriteria.level;


  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <div className="p-5 flex-grow">
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

        {/* --- Details Row --- *
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

        {/* --- Subjects Pills --- *
        <div className="mt-3 flex flex-wrap gap-2 min-h-[50px]">
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
      </div>

      {/* --- Footer with Actions --- *
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 mt-auto">
        <div className="grid grid-cols-2 gap-3">
           <Button
              onClick={handleBookScheduled}
              disabled={isScheduledBookingDisabled || isActionPending || !!success}
              variant="outline"
              className="w-full"
              title={isScheduledBookingDisabled ? "Select all search criteria to schedule" : "Schedule a class for a future time"}
           >
              Schedule Class
           </Button>

           <Button
              onClick={handleBookInstant}
              disabled={isInstantBookingDisabled || isActionPending || !!success}
              className={cn("w-full text-white", isInstantBookingDisabled ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700")}
              title={
                teacher.subscriptionTier === SubscriptionTier.BASIC
                  ? "Instant booking is a Premium feature."
                  : !teacher.isAvailableNow
                  ? `${teacher.name} is not available for an instant session.`
                  : "Book an immediate session"
              }
           >
              Book Instant
           </Button>
        </div>
        {/* Messages *
        <div className="text-center mt-2 h-4 text-xs">
            {isActionPending && <p className="text-gray-500 animate-pulse">Verifying & Booking...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
        </div>
      </div>
    </div>
  );
};*/