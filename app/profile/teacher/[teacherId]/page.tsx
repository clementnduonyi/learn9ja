
// src/app/profile/teacher/[id]/page.tsx

/*import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma, TeacherStatus } from '@prisma/client';
import { getTeacherSubjects } from '@/app/actions/teacherActions';
import { isTeacherAvailable } from '@/lib/scheduling'; // <<< Import the centralized helper
import StarRating from '@/components/StarRating';
import Image from 'next/image';
import TeacherProfile from '@/components/teacher/TeacherProfile';
import ReviewCard from '@/components/teacher/reviews/ReciewCard';
import type { Gender } from '@prisma/client';

// Define the data shape for this page using Prisma.validator
const teacherProfilePageArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
        id: true,
        name: true,
        avatarUrl: true,
        gender: true,
        languages: true,
        location: true,
        subscriptionTier: true,
        reviewsReceived: { // <<< Fetch reviews written FOR this user
            select: {
                rating: true,
                comment: true,
                createdAt: true,
                reviewer: { // Get the reviewer's name
                    select: { name: true, avatarUrl: true, gender: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit to the 5 most recent reviews
        },
        teacherProfile: {
            select: {
                bio: true,
                specializations: true,
                averageRating: true,
                pricePerHour: true,
                acceptingInstantSessions: true,
                availability: true,
            }
        }
    }
});
type TeacherProfileData = Prisma.UserGetPayload<typeof teacherProfilePageArgs>;

// Helper
function getDisplayAvatar(avatarUrl: string | null | undefined, gender: Gender | null | undefined): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) {
        case 'MALE': return '/avatars/default-male.svg';
        case 'FEMALE': return '/avatars/default-female.svg';
        default: return '/avatars/default-other.svg';
    }
}

export default async function TeacherPublicProfilePage( { params }:  { params: Promise<{ teacherId: string }> }) {

    const { teacherId } = await params

    let teacherData: TeacherProfileData | null = null;
    let teacherSubjects: { subjectId: string; subjectName: string; levels: string[]; }[] = [];

    try {
        // Fetch teacher data and their subjects concurrently
        const [fetchedTeacherData, subjectsResult] = await Promise.all([
            prisma.user.findUnique({
                where: {
                    id: teacherId,
                    role: 'TEACHER',
                    teacherProfile: { status: TeacherStatus.APPROVED }
                },
                ...teacherProfilePageArgs
            }),
            getTeacherSubjects(teacherId) // Use the server action to get subjects
        ]);

        teacherData = fetchedTeacherData;
        if (subjectsResult.success && subjectsResult.data) {
            teacherSubjects = subjectsResult.data;
        }

    } catch (error) {
        console.error("Error fetching teacher public profile:", error);
    }

    if (!teacherData || !teacherData.teacherProfile) {
        notFound(); // If teacher doesn't exist or is not approved, show 404
    }

    // --- Perform real-time availability check on the server ---
    // Safely check both the toggle and the schedule
    const isAvailableNow =
        teacherData.teacherProfile.acceptingInstantSessions === true &&
        isTeacherAvailable(
            teacherData.teacherProfile.availability,
            new Date(), // Use current UTC time
            60 // Assuming an instant session is 60 minutes
        );

    // Prepare a clean object for the client-side action buttons
    const teacherForActions = {
        id: teacherData.id,
        name: teacherData.name,
        isAvailableNow: isAvailableNow,
        subscriptionTier: teacherData.subscriptionTier,
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    {/* Header *}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <Image
                            src={getDisplayAvatar(teacherData.avatarUrl, teacherData.gender)}
                            alt={teacherData.name || 'Teacher Profile'}
                            width={128} height={128}
                            className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover"
                        />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{teacherData.name}</h1>
                            {teacherData.teacherProfile.specializations[0] && (
                                <p className="text-lg text-indigo-600 dark:text-indigo-400">{teacherData.teacherProfile.specializations[0]}</p>
                            )}
                             {teacherData.teacherProfile.averageRating && <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                                <StarRating rating={teacherData.teacherProfile.averageRating} readOnly={true} />
                                <span className="font-bold">{(teacherData.teacherProfile.averageRating).toFixed(1)}</span>
                            </div>}
                        </div>
                        <div className="flex-shrink-0">
                            {teacherData.teacherProfile.pricePerHour && <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(parseFloat(teacherData.teacherProfile.pricePerHour.toString()))}
                                <span className="text-base font-normal text-gray-500">/hr</span>
                            </p>}
                        </div>
                    </div>

                    {/* Action Buttons (Client Component) *}
                    <TeacherProfile teacher={teacherForActions} />

                    {/* Details Sections *}
                    <div className="mt-8 space-y-6 border-t pt-6">
                        {/* About Me *}
                        <div>
                            <h3 className="text-lg font-semibold">About Me</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{teacherData.teacherProfile.bio || "No bio available."}</p>
                        </div>
                         {/* Subjects & Levels *}
                         <div>
                            <h3 className="text-lg font-semibold">Subjects & Levels</h3>
                            <div className="mt-2 space-y-1">
                                {teacherSubjects.length > 0 ? teacherSubjects.map(s => (
                                    <div key={s.subjectId}>
                                        <span className="font-medium">{s.subjectName}:</span>
                                        <span className="ml-2 text-gray-600 dark:text-gray-300">{s.levels.join(', ')}</span>
                                    </div>
                                )) : <p className="text-gray-500 italic">No subjects listed.</p>}
                            </div>
                        </div>
                        {/* --- NEW: Reviews Section --- *}
                        <div className="mt-8 space-y-6 border-t pt-6">
                            <h3 className="text-lg font-semibold">Student Feedback & Reviews</h3>
                            {teacherData.reviewsReceived.length > 0 ? (
                                <div className="space-y-4">
                                    {teacherData.reviewsReceived.map((review, index) => (
                                        <ReviewCard key={index} review={review} />
                                    ))}
                                    {/* TODO: Add a "View all reviews" link if there are more *}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No reviews yet.</p>
                            )}
                        </div>
                        {/* More sections for languages, etc. *}
                    </div>
                </div>
            </div>
        </div>
    );
}*/



// src/app/profile/teacher/[id]/page.tsx

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { TeacherStatus } from '@prisma/client';
import { getTeacherSubjects } from '@/app/actions/teacherActions';
import { isTeacherAvailable } from '@/lib/scheduling';
import StarRating from '@/components/StarRating';
import Image from 'next/image';
import TeacherProfileActions from '@/components/teacher/TeacherProfile';
import type { Gender } from '@prisma/client';
import ReviewCard from '@/components/teacher/reviews/ReciewCard';
// Import the shared type and args
import { teacherCardArgs, type TeacherForCard } from '@/lib/types';

// Helper function
function getDisplayAvatar(avatarUrl: string | null | undefined, gender: Gender | null | undefined): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) { case 'MALE': return '/avatars/default-male.svg'; case 'FEMALE': return '/avatars/default-female.svg'; default: return '/avatars/default-other.svg'; }
}

export default async function TeacherPublicProfilePage({ params }:  { params: Promise<{ teacherId: string }> }) {

    const { teacherId } = await params;

    try {
        const [teacherData, subjectsResult] = await Promise.all([
            prisma.user.findUnique({
                where: {
                    id: teacherId,
                    role: 'TEACHER',
                    teacherProfile: { status: TeacherStatus.APPROVED }
                },
                ...teacherCardArgs // Use the shared args to fetch all necessary fields
            }),
            getTeacherSubjects(teacherId)
        ]);

        
        if (!teacherData || !teacherData.teacherProfile) {
            notFound();
        }

        const teacherSubjects: { subjectId: string; subjectName: string; levels: string[]; }[] = [];

        console.log(subjectsResult)

        const isAvailableNow =
            teacherData.teacherProfile.acceptingInstantSessions === true &&
            isTeacherAvailable(teacherData.teacherProfile.availability, new Date(), 60);

            

        // --- Create the complete TeacherForCard object ---
        const teacherForCard: TeacherForCard = {
            ...teacherData,
            subjects: teacherSubjects.map(s => s.subjectName),
            isAvailableNow: isAvailableNow
        };

        return (
            <div className="bg-gray-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <Image
                                src={getDisplayAvatar(teacherData.avatarUrl, teacherData.gender)}
                                alt={teacherData.name || 'Teacher Profile'}
                                width={128} height={128}
                                className="w-32 h-32 rounded-full border-4 border-learn9ja object-cover"
                            />
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">{teacherData.name}</h1>
                                {teacherData.teacherProfile.specializations[0] && (
                                    <p className="text-lg text-learn9ja/50">{teacherData.teacherProfile.specializations[0]}</p>
                                )}
                                 {teacherData.teacherProfile.averageRating && <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                                    <StarRating rating={teacherData.teacherProfile.averageRating} readOnly={true} />
                                    <span className="font-bold">{(teacherData.teacherProfile.averageRating).toFixed(1)}</span>
                                </div>}
                            </div>
                            <div className="flex-shrink-0">
                                {teacherData.teacherProfile.pricePerHour && <p className="text-2xl font-bold text-learn9ja">
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(parseFloat(teacherData.teacherProfile.pricePerHour.toString()))}
                                    <span className="text-base font-normal text-learn9ja">/hr</span>
                                </p>}
                            </div>
                        </div>

                        {/* --- Pass the complete object to the actions component --- */}
                        <TeacherProfileActions teacher={teacherForCard} />

                        {/* Details Sections */}
                        <div className="mt-8 space-y-6 border-t pt-6">
                           {/* About Me */}
                        <div>
                            <h3 className="text-lg font-semibold">About Me</h3>
                            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{teacherData.teacherProfile.bio || "No bio available."}</p>
                        </div>
                         {/* Subjects & Levels */}
                         <div>
                            <h3 className="text-lg font-semibold">Subjects & Levels</h3>
                            <div className="mt-2 space-y-1">
                                {teacherSubjects.length > 0 ? teacherSubjects.map(s => (
                                    <div key={s.subjectId}>
                                        <span className="font-medium">{s.subjectName}:</span>
                                        <span className="ml-2 text-gray-600">{s.levels.join(', ')}</span>
                                    </div>
                                )) : <p className="text-gray-500 italic">No subjects listed.</p>}
                            </div>
                        </div>
                        {/* --- NEW: Reviews Section --- */}
                        <div className="mt-8 space-y-6 border-t pt-6">
                            <h3 className="text-lg font-semibold">Student Feedback & Reviews</h3>
                            {teacherData.reviewsReceived.length > 0 ? (
                                <div className="space-y-4">
                                    {teacherData.reviewsReceived.map((review, index) => (
                                        <ReviewCard key={index} review={review} />
                                    ))}
                                    {/* TODO: Add a "View all reviews" link if there are more */}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No reviews yet.</p>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        

    } catch (error) {
        console.error("Error fetching teacher public profile:", error);
        notFound();
    }
}

