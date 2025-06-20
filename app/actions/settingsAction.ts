// src/app/actions/settingsActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z, ZodError } from 'zod';
import type { JsonValue } from '@prisma/client/runtime/library';
import { Gender } from '@prisma/client';


// Standard return type
interface ActionResult {
    success: boolean;
    error?: string;
}

// --- Update User Profile Action ---

// Zod schema for profile validation
const profileSettingsSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty" }).max(100),
    dob: z.date().nullable(), // Allow date or null
    gender: z.nativeEnum(Gender).nullable().optional(),
    phone: z.string().max(20).nullable().optional(), // Optional phone
    avatarUrl: z.string().url().optional().nullable(),
    address: z.any().optional().nullable(),
    timezone: z.string().min(1, {message: "You must select your timezone"}).max(100)
});

interface ProfileSettingsInput {
    name: string;
    timezone: string;
    dob: Date | null;
    phone?: string | null;
    gender?: Gender | null;
    avatarUrl?: string | null;
    address?: JsonValue | null;
}

export async function updateUserProfileSettings(inputData: ProfileSettingsInput): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };

    // Validate Input
    try {
        // Note: Zod might have issues validating Date directly from client if not careful
        // Ensure dob is passed as Date object if using z.date()
        const validatedData = profileSettingsSchema.parse({
            ...inputData,
            // Ensure dob is Date or null before parsing
            dob: inputData.dob ? new Date(inputData.dob) : null,
        });

        // Update user profile in DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: validatedData.name,
                dob: validatedData.dob,
                gender: validatedData.gender,
                phone: validatedData.phone,
                avatarUrl: validatedData.avatarUrl,
                address: validatedData.address,
                timezone:validatedData.timezone
            },
        });

        revalidatePath('/profile/me');
        revalidatePath('/settings');
        console.log(`User profile updated for ${user.id}`);
        return { success: true };

    } catch (error: any) {
        if (error instanceof ZodError) {
            console.error("Profile settings validation failed:", error.errors);
            return { success: false, error: `Invalid input: ${error.errors[0]?.message}` };
        }
        console.error(`Error updating profile settings for ${user.id}:`, error);
        return { success: false, error: error.message || 'Failed to update profile.' };
    }
}


// --- Update Payment Settings Action (Placeholder) ---

interface PaymentSettingsInput {
    // Define based on actual fields when implementing Stripe etc.
    // e.g., stripeToken?: string; connectOnboarding?: boolean;
    [key: string]: any; // Placeholder
}

export async function updatePaymentSettings(inputData: PaymentSettingsInput): Promise<ActionResult> {
     const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized' };

    console.warn("updatePaymentSettings action called but not fully implemented.");

    // TODO: Implement actual payment/payout logic here
    // 1. Fetch user role from DB
    // 2. Based on role:
    //    - Student: Interact with Stripe API (e.g., create/update customer, attach payment method)
    //               Save non-sensitive IDs (customer ID, payment method ID/last4) to User.paymentMethodDetails
    //    - Teacher: Initiate Stripe Connect onboarding, handle callbacks, save Connect Account ID to TeacherProfile.payoutDetails
    // 3. Update prisma record with relevant JSON data

    try {
         // --- Placeholder ---
         await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
         // Example: Update DB with placeholder data (DO NOT DO THIS WITH REAL DATA)
         // const profile = await prisma.user.findUnique({where: {id: user.id}, select: {role: true}});
         // if (profile?.role === 'STUDENT') {
         //     await prisma.user.update({ where: {id: user.id}, data: { paymentMethodDetails: { updated: new Date().toISOString() } } });
         // } else if (profile?.role === 'TEACHER') {
         //     await prisma.teacherProfile.update({ where: {userId: user.id}, data: { payoutDetails: { updated: new Date().toISOString() } } });
         // }
         // --- End Placeholder ---


         revalidatePath('/settings');
         console.log(`Payment settings placeholder updated for ${user.id}`);
         return { success: true };

    } catch (error: any) {
         console.error(`Error updating payment settings for ${user.id}:`, error);
         return { success: false, error: error.message || 'Failed to update payment settings.' };
    }
}

