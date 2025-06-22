// src/app/actions/teacherActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, Role, TeacherStatus } from '@prisma/client'; // Import necessary types
import type { JsonValue } from '@prisma/client/runtime/library';
import { teacherCardArgs, type TeacherForCard } from "@/lib/types"; // Import from shared types file
import { z, ZodError } from 'zod'; // Import Zod

// --- ActionResult Interface ---
interface ActionResult {
    success: boolean;
    error?: string;
    url?: string;
}

// --- Update Teacher Profile Action ---

// Input type for subjects expects levels as string[]
interface TeacherSubjectLevelInput {
    subjectId: string;
    levels: string[];
}
// Update main input type
interface TeacherProfileUpdateData {
    bio?: string;
    availability?: JsonValue;
    subjects?: TeacherSubjectLevelInput[];
    pricePerHour?: number | null;
    specializations?: string[];
}

// Zod schema for validation
const teacherProfileUpdateSchema = z.object({
    bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional().nullable(),
    availability: z.any().optional().nullable(),
    subjects: z.array(z.object({
        subjectId: z.string().cuid("Invalid subject ID"),
        levels: z.array(z.string().min(1, "Level cannot be empty").max(50, "Level too long")),
    })).optional(),
    pricePerHour: z.number().positive("Price must be positive").nullable().optional(),
    specializations: z.array(z.string().min(1, "Specialization cannot be empty").max(100, "Specialization too long")).optional(),
});


export async function updateTeacherProfile(data: TeacherProfileUpdateData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };

    const userProfile = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!userProfile || userProfile.role !== Role.TEACHER) return { success: false, error: 'Forbidden: Not a teacher.' };
    const userId = user.id;

    try {
        const validatedData = teacherProfileUpdateSchema.parse(data);
        // Explicitly type submittedSubjects based on validation result
        const submittedSubjects: TeacherSubjectLevelInput[] = validatedData.subjects ?? [];
        const submittedSubjectIds = submittedSubjects.map((s: TeacherSubjectLevelInput) => s.subjectId); // <<< Added type for s

        const priceValue = validatedData.pricePerHour !== null && validatedData.pricePerHour !== undefined
            ? new Prisma.Decimal(validatedData.pricePerHour)
            : null;

        await prisma.$transaction(async (tx) => {
            // 1. Update basic TeacherProfile fields
            await tx.teacherProfile.update({
                where: { userId: userId },
                data: {
                    bio: validatedData.bio,
                    availability: validatedData.availability,
                    pricePerHour: priceValue,
                    specializations: validatedData.specializations,
                },
            });
            console.log(`Updated base profile for teacher ${userId}`);

            // 2. Upsert submitted subjects/levels
            await Promise.all(submittedSubjects.map((subjectData: TeacherSubjectLevelInput) => { // <<< Added type for subjectData
                return tx.teacherSubject.upsert({
                    where: { teacherUserId_subjectId: { teacherUserId: userId, subjectId: subjectData.subjectId } },
                    update: { levels: subjectData.levels },
                    create: { teacherUserId: userId, subjectId: subjectData.subjectId, levels: subjectData.levels },
                });
            }));
            console.log(`Upserted ${submittedSubjects.length} subjects for teacher ${userId}`);

            // 3. Delete TeacherSubject records for subjects that were *not* submitted
            const subjectsToDelete = await tx.teacherSubject.findMany({
                where: {
                    teacherUserId: userId,
                    subjectId: { notIn: submittedSubjectIds },
                },
                select: { id: true }
            });

            if (subjectsToDelete.length > 0) {
                // Explicitly type 's' here based on the 'select' clause above
                const idsToDelete = subjectsToDelete.map((s: { id: string }) => s.id); // <<< Added type for s
                console.log(`Deleting ${idsToDelete.length} unselected subjects for teacher ${userId}`);
                await tx.teacherSubject.deleteMany({
                    where: { id: { in: idsToDelete } },
                });
            }

        }, { timeout: 20000 });

        revalidatePath('/profile/teacher/edit');
        revalidatePath('/profile/me');
        revalidatePath('/dashboard/teacher');
        return { success: true };

    } catch (error) {
        if (error instanceof ZodError) {
            console.error("Teacher profile update validation failed:", error.errors);
            return { success: false, error: `Invalid input: ${error.errors[0]?.message}` };
        }
        if (error instanceof Error) {
          return { success: false, error: error.message || 'Failed to update profile.' };
        }

        // Fallback for non-Error types
        return { success: false, error: 'An unknown error occurred while updating your profile. Try again!' };
          
    }
}


// --- Update Teacher Payout Settings Action (Remains the same - Placeholder) ---
interface PayoutSettingsInput { [key: string]: string | undefined; }
export async function updateTeacherPayoutSettings(inputData: PayoutSettingsInput): Promise<ActionResult> {
    // ... (Existing placeholder logic remains the same) ...
     const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id }, select: { status: true } });
    if (!profile) return { success: false, error: 'Teacher profile not found.' };
    if (profile.status !== TeacherStatus.APPROVED) return { success: false, error: 'Payout setup requires approved teacher status.' };
    console.warn("updateTeacherPayoutSettings action called - Stripe Connect logic needed.", inputData);
    try {
         const stripeOnboardingUrl = `https://connect.stripe.com/setup/c/acct_placeholder_${user.id}`;

         await prisma.teacherProfile.update({ where: { userId: user.id }, data: { payoutDetails: { stripeAccountId: `acct_placeholder_${user.id}`, status: 'onboarding_started' } } });
         revalidatePath('/profile/teacher/edit');
         return { success: true, url: stripeOnboardingUrl };
    } catch (error: unknown) {
        console.error(`Error updating payout settings for ${user.id}:`, error);

        if (error instanceof Error) {
          return { success: false, error: error.message || 'Failed to update payout details.' };
        }

      // Fallback for non-Error types
      return { success: false, error: 'An unknown error occurred while updating your payout information. Try again!' };
    }
}


/**
 * Fetches a list of approved, featured teachers.
 * This is a server-only function.
 * @returns {Promise<TeacherForCard[]>} A promise that resolves to an array of teacher data.
 */
export async function getFeaturedTeachers(): Promise<TeacherForCard[]> {
  try {
    const approvedTeachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        teacherProfile: {
          status: TeacherStatus.APPROVED, // Only show approved teachers
          // You could add other filters here, e.g., high rating
          // averageRating: { gte: 4.0 }
        }
      },
      ...teacherCardArgs, // Use the shared args for selection
      take: 6, // Limit to 6 for a homepage feature
    });

    // Separately fetch subject names for each teacher
    // This approach (N+1 query) is acceptable for a small number of featured teachers.
    // For larger queries, consider optimizing with a more advanced Prisma query.
    const teachersWithSubjects = await Promise.all(
      approvedTeachers.map(async (teacher) => {
        const subjectsTaught = await prisma.teacherSubject.findMany({
          where: { teacherUserId: teacher.id },
          include: { subject: { select: { name: true } } },
        });

        // Determine if teacher is available now (placeholder logic)
        // TODO: Replace with real-time presence check (e.g., Supabase Presence, Redis, etc.)
        const isAvailableNow = Math.random() > 0.5; // 50% chance of being available for demo

        return {
          ...teacher, // Spread the data fetched with teacherCardArgs
          subjects: subjectsTaught.map(ts => ts.subject.name), // Add subject names array
          isAvailableNow, // Add availability status
        };
      })
    );

    return teachersWithSubjects;

  } catch (error) {
    console.error("Failed to fetch featured teachers:", error);
    
    return []; // Return empty array on error to prevent page crashes
  }
}



// This action is read-only and safe to expose.
// It fetches the subjects and specific levels a single teacher is approved to teach.
export async function getTeacherSubjects(teacherUserId: string) {
  try {
    const subjects = await prisma.teacherSubject.findMany({
      where: { teacherUserId: teacherUserId },
      select: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        levels: true, // The array of level strings (e.g., ["JSS1", "SS2"])
      },
      orderBy: { subject: { name: 'asc' } }
    });
    // We need to flatten the result for easier use in the form
    return {
      success: true,
      data: subjects.map(item => ({
        subjectId: item.subject.id,
        subjectName: item.subject.name,
        levels: item.levels
      }))
    };
  } catch (error: unknown) {
    console.error("Error fetching teacher subjects:", error);
    if (error instanceof Error) {
          return { success: false, error: error.message || "Could not load teacher's subjects." };
        }

      // Fallback for non-Error types
      return { success: false, error: "An unknown error occurred while loading teacher's subject. Try again!" };

  }
}
