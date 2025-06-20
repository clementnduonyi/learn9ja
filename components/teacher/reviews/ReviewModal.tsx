
'use client';

import React from 'react';
import ReviewForm from '@/components/teacher/reviews/reviewForm'; 

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    teacherName: string;
}

export default function ReviewModal({
    isOpen,
    onClose,
    bookingId,
    teacherName
}: ReviewModalProps) {
    if (!isOpen) {
        return null; // Don't render anything if not open
    }

    // Basic Modal Structure using Tailwind CSS
    return (
        <div
            // Backdrop
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose} // Close when clicking backdrop
            aria-labelledby="review-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                // Modal Content Box
                className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
            >
                 {/* Optional: Add a close button */}
                 <div className="text-right">
                     <button
                         onClick={onClose}
                         className="text-gray-400 hover:text-gray-600"
                         aria-label="Close review modal"
                     >
                         &times; {/* Simple 'X' */}
                     </button>
                 </div>

                <ReviewForm
                    bookingId={bookingId}
                    teacherName={teacherName}
                    onSuccess={() => {
                        console.log('Review successful, closing modal.');
                        onClose(); // Close modal on successful submission
                    }}
                />
            </div>
        </div>
    );
}