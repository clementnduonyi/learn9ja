
'use server'; 

import { createClient } from '@/lib/supabase/server'; // Use the server client
import prisma from '@/lib/prisma'; // Use your Prisma client instance
import { CompleteUserProfileArgs, ActionResult } from "@/lib/types"



export async function completeUserProfile(args: CompleteUserProfileArgs): Promise<ActionResult | void> {
    const supabase = await createClient(); // Create server client to get user session

    // 1. Get the newly signed-up user's data from Supabase Auth
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
        console.error('Error getting user after signup:', getUserError);
        return { success: false, error: 'Could not retrieve user session after signup.' };
    }

    const { id: userId, email } = user;
    const { name, role } = args;

    // Input validation (basic)
    if (!userId || !email || !name || !role) {
         console.error('Missing data for profile creation:', { userId, email, name, role });
         return { success: false, error: 'Missing required information for profile creation.' };
    }


    try {
        // 2. Check if profile already exists for this user ID (idempotency)
        const existingProfile = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (existingProfile) {
            console.log(`Profile already exists for user ${userId}. Skipping creation.`);
            // Optionally update role/name if they differ? Or just return success.
            // For now, just return success if it exists.
            return { success: true };
        }

        // 3. Create the user profile in public.users table
         console.log(`Creating profile for user ${userId} with role ${role}`);
        const newProfile = await prisma.user.create({
            data: {
                id: userId, // Link to the auth.users id
                email: email,
                name: name,
                role: role,
                // avatarUrl can be added later
            },
        });

        // 4. If the user is a Teacher, create the TeacherProfile entry
        if (role === 'TEACHER') {
             console.log(`User is a TEACHER. Creating teacher profile for ${userId}`);
            await prisma.teacherProfile.create({
                data: {
                    userId: userId, // Link to the created User profile
                    // Initialize other fields as needed, e.g., empty JSON for availability
                    availability: {},
                },
            });
        }

        console.log(`Successfully created profile for user ${userId}`);
        return { success: true };

    } catch (error: any) {
        console.error(`Error creating profile for user ${userId}:`, error);
        // Check for specific Prisma errors if needed (e.g., unique constraint)
        return { success: false, error: error.message || 'Failed to save user profile to database.' };
    }
}