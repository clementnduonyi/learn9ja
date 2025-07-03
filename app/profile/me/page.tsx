// src/app/profile/me/page.tsx

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Gender, Role, TeacherStatus } from '@prisma/client'; // Import necessary types/enums
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';
import { format } from 'date-fns'; // For formatting dates

// Define Validator Args and Type for fetching profile data
// Ensure this fetches all necessary fields including the updated TeacherSubject levels
const userProfileArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
        id: true, name: true, email: true, role: true, avatarUrl: true, gender: true, dob: true, phone: true, createdAt: true, address: true, 
        teacherProfile: { // Select the teacherProfile relation
            // Use 'include' to get all scalar fields (bio, status, etc.) AND nested relations
            include: {
                subjectsTaught: { // Include the subjects taught by this teacher
                    orderBy: { subject: { name: 'asc' } },
                    include: { // Include the subject name itself
                        subject: { select: { name: true } }
                    },
                    // 'levels' is included automatically because we use 'include' on subjectsTaught
                }
            }
        }
    }
});

// Define the exact type based on the validator
type UserWithProfile = Prisma.UserGetPayload<typeof userProfileArgs>;

// --- Helper Functions (Should be in lib/utils) ---
function calculateAge(dob: Date | null | undefined): number | null {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= 0 ? age : null;
}

function getDisplayAvatar(avatarUrl: string | null | undefined, gender: Gender | null | undefined): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) {
        case Gender.MALE: return '/avatars/default-male.svg';
        case Gender.FEMALE: return '/avatars/default-female.svg';
        default: return '/avatars/default-other.svg';
    }
}
// --- End Helper Functions ---

export const metadata = { title: 'My Profile' };

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) redirect('/login');

    let userProfile: UserWithProfile | null = null;
    let fetchError: string | null = null;
    try {
        userProfile = await prisma.user.findUnique({
            where: { id: authUser.id },
            ...userProfileArgs // Use the defined select/include args
        });
        if (!userProfile) throw new Error("User profile not found.");
    } catch (error) {
        console.error("Error fetching user profile:", error);
        fetchError = "Could not load user profile.";
    }

    if (fetchError) return <div className="container mx-auto p-6 text-red-500">{fetchError}</div>;
    if (!userProfile) redirect('/login?error=Profile not found');

    const age = calculateAge(userProfile.dob);
    const displayAvatar = getDisplayAvatar(userProfile.avatarUrl, userProfile.gender);
    // Format address for display (example)
    const address = userProfile.address as { street?: string, city?: string, country?: string } | null;
    const displayAddress = address ? [address.street, address.city, address.country].filter(Boolean).join(', ') : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
                {/* --- User Info Section --- */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                    <Image
                        src={displayAvatar || '/avatars/default-other.svg'}
                        alt={userProfile.name || 'User Avatar'}
                        width={120} height={120}
                        className="rounded-full border-4 border-learn9ja bg-gray-200 object-cover"
                        // onError={(e) => { e.currentTarget.src = '/avatars/default-other.svg'; }}
                        priority
                    />
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userProfile.name || 'User'}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{userProfile.email}</p>
                        <p className="text-sm text-learn9ja font-medium capitalize">{userProfile.role?.toLowerCase()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Member since: {format(new Date(userProfile.createdAt), 'PPP')}</p>
                        {age !== null && <p className="text-sm text-gray-500 dark:text-gray-500">Age: {age}</p>}
                        {userProfile.phone && <p className="text-sm text-gray-500 dark:text-gray-500">Phone: {userProfile.phone}</p>}
                        {userProfile.gender && <p className="text-sm text-gray-500 dark:text-gray-500 capitalize">Gender: {userProfile.gender.toLowerCase()}</p>}
                        {displayAddress && <p className="text-sm text-gray-500 dark:text-gray-500">Address: {displayAddress}</p>}
                        <Link href="/settings" className="mt-4 inline-block">
                            <Button size="sm" variant="outline">Edit Profile & Settings</Button>
                        </Link>
                    </div>
                </div>

                {/* --- Teacher Specific Info --- */}
                {userProfile.role === Role.TEACHER && userProfile.teacherProfile && (
                    <div className="border-t dark:border-gray-700 pt-6 mt-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Teacher Details</h2>
                        {/* Bio */}
                        <div>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">Bio</h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{userProfile.teacherProfile.bio || <span className='italic'>No bio provided.</span>}</p>
                        </div>
                        {/* Status */}
                        <div>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">Status</h3>
                            <p className={`text-sm font-medium px-2 py-0.5 rounded-full inline-block ${
                                userProfile.teacherProfile.status === TeacherStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {userProfile.teacherProfile.status}
                            </p>
                        </div>
                        {/* Rating */}
                        {userProfile.teacherProfile.averageRating !== null && ( 
                            <div>
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Average Rating</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    {/* Use StarRating component in read-only mode */}
                                    <StarRating
                                        rating={userProfile.teacherProfile.averageRating}
                                        readOnly={true}
                                        size="text-xl" // Adjust size as needed
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        ({userProfile.teacherProfile.averageRating.toFixed(1)} / 5.0)
                                    </span>
                                </div>
                            </div>
                         )}
                        {/* Rate */}
                        {userProfile.teacherProfile.pricePerHour !== null && ( 
                            <div>
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Rate</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                    {/* Format Decimal to currency string */}
                                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(
                                        parseFloat(userProfile.teacherProfile.pricePerHour.toString())
                                    )} / hour
                                </p>
                            </div>
                         )}
                        {/* Specializations */}
                        {userProfile.teacherProfile.specializations.length > 0 && (
                            <div>
                                <h3 className="font-medium text-gray-700 dark:text-gray-300">Specializations</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {userProfile.teacherProfile.specializations.map(spec => (
                                        <span key={spec} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{spec}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Subjects Taught (Updated Display) */}
                        <div>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">Subjects & Levels Taught</h3>
                            {userProfile.teacherProfile.subjectsTaught.length > 0 ? (
                                <ul className="space-y-2 mt-1">
                                    {userProfile.teacherProfile.subjectsTaught.map(ts => (
                                        <li key={ts.subjectId} className="text-sm">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{ts.subject.name}:</span>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                                {/* Display levels array as comma-separated string */}
                                                {ts.levels.join(', ')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-gray-500 dark:text-gray-400">No subjects specified.</p>
                            )}
                        </div>
                        {/* TODO: Display Availability in a user-friendly format */}
                    </div>
                )}

                 {/* --- Student Specific Info (Quick Links) --- */}
                 {userProfile.role === Role.STUDENT && (
                    <div className="border-t dark:border-gray-700 pt-6 mt-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">My Activity</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                             <Link href="/student/bookings?status=upcoming"><Button variant="secondary" size="sm">Upcoming Sessions</Button></Link>
                             <Link href="/student/bookings"><Button variant="secondary" size="sm">View All Sessions</Button></Link>
                             <Link href="/find-teachers"><Button variant="secondary" size="sm">Find a New Teacher</Button></Link>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
}
