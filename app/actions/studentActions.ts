'use server'






// src/app/actions/studentActions.ts
//'use server';

import prisma from '@/lib/prisma';
import { Prisma, TeacherStatus } from '@prisma/client';
import { z, ZodError } from 'zod';
// Import the EXACT types needed for the card from the shared types file
import { teacherCardArgs, type TeacherForCard } from '@/lib/types';
import { isTeacherAvailable } from '@/lib/scheduling';

// --- Types ---
export interface SearchCriteria {
    subjectId: string;
    level: string;
    preferredTimeUTC?: Date;
    durationMinutes?: number;
    maxPrice?: number | null;
    language?: string | null;
    specialization?: string | null;
    bookingMode: 'SCHEDULED' | 'INSTANT';
}

// The action will now return data matching the TeacherForCard structure
interface SearchActionResult {
    success: boolean;
    data?: TeacherForCard[]; // <<< Use TeacherForCard type
    error?: string;
    message?: string;
}

// --- Zod Schema for Validation (remains the same) ---
const searchCriteriaSchema = z.object({
    subjectId: z.string().cuid(),
    level: z.string().min(1, { message: "Level is required" }),
    preferredTimeUTC: z.date().optional(), // Make optional overall, check based on mode
    durationMinutes: z.number().int().positive().optional().default(60),
    maxPrice: z.number().positive().nullable().optional(),
    language: z.string().min(1).nullable().optional(),
    location: z.string().min(1).nullable().optional(),
    specialization: z.string().min(1).nullable().optional(),
    bookingMode: z.enum(['SCHEDULED', 'INSTANT']),
}).refine(data => data.bookingMode !== 'SCHEDULED' || data.preferredTimeUTC !== undefined, {
    message: "Preferred time is required for scheduled bookings.",
    path: ["preferredTimeUTC"], // Point error to the relevant field
});



// --- The Rewritten Server Action ---
export async function findAvailableTeachers(
    criteria: SearchCriteria
): Promise<SearchActionResult> {
    console.log("\n--- findAvailableTeachers Action START (Advanced) ---");
    console.log("Received Criteria:", criteria);

    // 1. Validate Input
    let validatedCriteria: z.infer<typeof searchCriteriaSchema>;
    try {
        validatedCriteria = searchCriteriaSchema.parse(criteria);
        console.log("Validated Criteria:", validatedCriteria);
    } catch (error) {
        if (error instanceof ZodError) return { success: false, error: `Invalid search criteria: ${error.errors[0]?.message}` };
        return { success: false, error: "Invalid search criteria." };
    }

    const {
        subjectId, level, preferredTimeUTC, durationMinutes,
        maxPrice, language, specialization, bookingMode
    } = validatedCriteria;


   // --- Handle INSTANT booking mode (Deferred) ---
    if (bookingMode === 'INSTANT') {
        console.warn("Instant booking mode is not yet implemented.");
        return { success: false, error: "Instant booking is currently unavailable." };
        // TODO: Implement logic here:
        // 1. Filter teachers by subject/level/price/language/spec/status='APPROVED'
        // 2. Filter by online status (requires separate mechanism - e.g., Supabase Presence or last_seen field)
        // 3. Check current availability slot (using isTeacherAvailable with NOW as time)
        // 4. Check for immediate booking clashes
        // 5. Score and rank
    }

    // --- Logic for SCHEDULED booking mode ---
    if (!preferredTimeUTC) return { success: false, error: "Preferred time is required." };
    const requestedEndTimeUTC = new Date(preferredTimeUTC.getTime() + (durationMinutes ?? 60) * 60000);

    try {
        // 2. Initial Filtering - Fetch the full data shape required by TeacherForCard
        console.log("Step 2: Initial Filtering...");
        let potentialTeachers = await prisma.user.findMany({ // <<< Query the User model directly
            where: {
                role: 'TEACHER',
                teacherProfile: {
                    status: TeacherStatus.APPROVED,
                    // Specialization filter
                    ...(specialization && { specializations: { has: specialization } }),
                    // Subject/Level filter on the nested relation
                    subjectsTaught: {
                        some: {
                            subjectId: subjectId,
                            levels: { has: level }
                        }
                    },
                },
                // Language filter
                ...(language && { languages: { has: language } }),
            },
            ...teacherCardArgs, // <<< Use the shared args to select all needed fields
        });
        console.log(`Step 2 Found ${potentialTeachers.length} potential teachers after initial filters.`);
        
        // --- NEW: Step 2.5: Filter by Calculated Total Session Price ---
        if (maxPrice && maxPrice > 0) {
            console.log(`\nStep 2.5: Filtering by max session budget of ${maxPrice}...`);
            potentialTeachers = potentialTeachers.filter(teacher => {
                const pricePerHour = teacher.teacherProfile?.pricePerHour;
                if (pricePerHour === null || pricePerHour === undefined) {
                    // If teacher has no price set, they pass the filter (treat as free/negotiable)
                    return true;
                }
                // Calculate the total price for this specific session duration
                const totalSessionPrice = (parseFloat(pricePerHour.toString()) / 60) * durationMinutes;
                
                console.log(`- Teacher ${teacher.id}: price/hr=${pricePerHour}, session duration=${durationMinutes}mins, totalSessionPrice=${totalSessionPrice.toFixed(2)}`);
                
                // Keep the teacher if their total session price is within budget
                return totalSessionPrice <= maxPrice;
            });
            console.log(`Step 2.5 Found ${potentialTeachers.length} teachers within budget.`);
        }
        // --- END NEW STEP ---

        if (potentialTeachers.length === 0) {
            return { success: true, data: [], message: "No teachers found matching your core criteria." };
        }

        // 3. Filter by Time Availability
        console.log(`\nStep 3: Filtering by Time Availability...`);
        const availableByTimeTeachers = potentialTeachers.filter(teacher =>
            teacher.teacherProfile && isTeacherAvailable(teacher.teacherProfile.availability, preferredTimeUTC, durationMinutes ?? 60)
        );
        console.log(`Step 3 Found ${availableByTimeTeachers.length} teachers available at the requested time.`);

        if (availableByTimeTeachers.length === 0) {
            return { success: true, data: [], message: "No teachers are available at the time you selected." };
        }
        const availableByTimeTeacherUserIds = availableByTimeTeachers.map(t => t.id);

        // 4. Filter by Booking Clashes
        console.log(`\nStep 4: Checking for booking clashes...`);
        const conflictingBookings = await prisma.booking.findMany({
            where: {
                teacherUserId: { in: availableByTimeTeacherUserIds },
                status: 'ACCEPTED',
                AND: [
                    { requestedTime: { lt: requestedEndTimeUTC } }, // Existing starts before new ends
                    { endTimeUtc: { gt: preferredTimeUTC } },   // Existing ends after new starts
                ],
            },
             select: { teacherUserId: true }
        });
        const busyTeacherUserIds = new Set(conflictingBookings.map(b => b.teacherUserId));
        const finalAvailableTeachers = availableByTimeTeachers.filter(teacher => !busyTeacherUserIds.has(teacher.id));
        console.log(`Step 4 Final ${finalAvailableTeachers.length} available teachers after clash check.`);

        // 5. Score and Rank Teachers (logic remains the same)
        console.log(`\nStep 5: Scoring ${finalAvailableTeachers.length} teachers...`);
        const scoredTeachers = finalAvailableTeachers.map(teacher => {
             // ... same scoring logic ...
             let score = 0;
             // a) Subject/Level match = 40 points
             score += 40;
             // b) Rating score = 30%
             const avgRating = teacher.teacherProfile?.averageRating ?? 3.0;
             score += (Math.max(0, Math.min(5, avgRating)) / 5.0 * 30);
             // ... other scoring ...
             return { teacher, score };
        });
        scoredTeachers.sort((a, b) => b.score - a.score);

        // 6. Format Output (now matches TeacherForCard)
        // We also need to add the 'subjects' string array and 'isAvailableNow'
        const searchResults = await Promise.all(
            scoredTeachers.slice(0, 10).map(async ({ teacher, score }) => {
                // Fetch subject names for this teacher
                const subjectsTaught = await prisma.teacherSubject.findMany({
                    where: { teacherUserId: teacher.id },
                    include: { subject: { select: { name: true } } },
                });

                return {
                    ...teacher, // Spread all properties fetched via teacherCardArgs
                    subjects: subjectsTaught.map(ts => ts.subject.name), // Add subjects array
                    isAvailableNow: false, // For scheduled search, this is always false
                    score: parseFloat(score.toFixed(1)), // Add the score
                } as TeacherForCard; // Assert to the correct type
            })
        );

        console.log("--- findAvailableTeachers Action END (Success) ---");
        return { success: true, data: searchResults };

    } catch (error: any) {
        // ... (error handling) ...
        return { success: false, error: "Failed to search for teachers." };
    }
}
