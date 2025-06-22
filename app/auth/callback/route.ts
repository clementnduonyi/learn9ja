/*import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import { Role, Gender, TeacherStatus } from '@prisma/client'; // Import Enums

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    console.log('[Auth Callback] Received code, attempting session exchange...');
    const supabase = await createClient();
    try {
        // 1. Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            console.error('[Auth Callback] Session exchange error:', exchangeError.message);
            throw new Error(`Session exchange failed: ${exchangeError.message}`);
        }
        console.log('[Auth Callback] Session exchanged successfully.');

        // 2. Get the newly authenticated user
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError || !user) {
            console.error('[Auth Callback] Critical Error: Could not get user after session exchange.', getUserError);
            throw new Error('Could not verify user after confirmation.');
        }
        console.log(`[Auth Callback] Retrieved user: ${user.id}, Email: ${user.email}`);
        console.log('[Auth Callback] User Metadata:', user.user_metadata);


        // 3. Check if profile already exists in public.users to prevent duplicates
        const existingProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true } // Select role to check if it's there
        });

        // Check if the profile exists AND has a role. If so, we are done.
        if (existingProfile && existingProfile.role) {
            console.log(`[Auth Callback] Profile with role already exists for user ${user.id}. Skipping creation.`);
        } else {
            console.log(`[Auth Callback] Profile for user ${user.id} does not exist or is incomplete. Creating/Updating...`);
            // 4. Extract data from metadata (set during signup)
            const name = user.user_metadata?.full_name || 'New User'; // Provide default if missing
            const role = user.user_metadata?.selected_role as Role | undefined;
            const gender = user.user_metadata?.selected_gender as Gender | undefined;

            // --- Validation of essential metadata ---
            if (!role) {
                 console.error(`[Auth Callback] CRITICAL: Role not found in user metadata for user ${user.id}. This is required for signup.`);
                 // Redirect to an error page or login, indicating profile setup failed.
                 return NextResponse.redirect(`${origin}/login?error=Profile setup failed (missing role). Please try signing up again or contact support.`);
            }

            // 5. Create or Update profile within a transaction
            try {
                await prisma.$transaction(async (tx) => {
                    console.log(`[Auth Callback] Starting upsert transaction for user ${user.id}`);
                    const upsertedUser = await tx.user.upsert({
                        where: { id: user.id },
                        update: { // Update fields if user somehow exists without a role
                            name: name,
                            role: role,
                            gender: gender,
                        },
                        create: { // Create the user profile if it doesn't exist
                            id: user.id,
                            email: user.email,
                            name: name,
                            role: role,
                            gender: gender,
                        },
                    });
                    console.log(`[Auth Callback] User record upserted for ${upsertedUser.id}`);

                    if (role === Role.TEACHER) {
                        // Check if teacher profile exists before creating
                        const existingTeacherProfile = await tx.teacherProfile.findUnique({ where: { userId: user.id } });
                        if (!existingTeacherProfile) {
                            await tx.teacherProfile.create({
                                data: {
                                    userId: user.id, // Link to the created User profile
                                    availability: {}, // Default availability
                                    status: TeacherStatus.PENDING, // Default status
                                },
                            });
                            console.log(`[Auth Callback] TeacherProfile record created for ${user.id}`);
                        } else {
                            console.log(`[Auth Callback] TeacherProfile already exists for ${user.id}. Skipping creation.`);
                        }
                    }
                }); // Commit transaction
                console.log(`[Auth Callback] Profile creation/update transaction committed for user ${user.id}`);
            } catch (profileError) {
                console.error(`[Auth Callback] CRITICAL: Error saving profile to DB for user ${user.id}:`, profileError);
                return NextResponse.redirect(`${origin}/login?error=Account confirmed, but failed to save profile details. Please contact support.`);
            }
        }

        // 6. Redirect to the main dashboard entry point
        console.log('[Auth Callback] Profile checked/created. Redirecting to /dashboard...');
        return NextResponse.redirect(`${origin}/dashboard`);

    } catch (error: unknown) {
        // Catch errors from any step above
        console.error("[Auth Callback] Overall error in GET handler:", error);
        if (error instanceof Error) {
            return NextResponse.redirect(`${origin}/login?error=Authentication process failed: ${error.message}`);
        }

      // Fallback for non-Error types
      return { success: false, error: "An unknown error occurred while authenticating. Try again!" };
       
    }
  }

  // Fallback redirect if no code is present in the URL
  return NextResponse.redirect(`${origin}/login?error=Authentication callback link invalid (no code).`);
}*/



// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { Role, Gender, TeacherStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    try {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw new Error(`Session exchange failed: ${exchangeError.message}`);

        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError || !user) throw new Error('Could not verify user after confirmation.');

        const existingProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true }
        });

        if (!existingProfile || !existingProfile.role) {
            const name = user.user_metadata?.full_name || 'New User';
            const role = user.user_metadata?.selected_role as Role | undefined;
            const gender = user.user_metadata?.selected_gender as Gender | undefined;

            if (!role) {
                console.error(`[Auth Callback] CRITICAL: Role missing for user ${user.id}.`);
                // FIX: Redirect with an error instead of returning an object
                return NextResponse.redirect(`${origin}/login?error=Profile+setup+failed+(missing+role).`);
            }

            try {
                await prisma.$transaction(async (tx) => {
                    await tx.user.upsert({
                        where: { id: user.id },
                        update: { name, role, gender },
                        create: { id: user.id, email: user.email, name, role, gender },
                    });

                    if (role === Role.TEACHER) {
                        const existingTeacherProfile = await tx.teacherProfile.findUnique({ where: { userId: user.id } });
                        if (!existingTeacherProfile) {
                            await tx.teacherProfile.create({
                                data: { userId: user.id, availability: {}, status: TeacherStatus.PENDING },
                            });
                        }
                    }
                });
            } catch (profileError: unknown) {
                // Throw to be caught by the outer catch block
                if (profileError instanceof Error) {
                    throw new Error(`DB Save Failed: ${profileError.message}`);
                }
                throw new Error("An unknown error occurred while saving the profile.");
            }
        }

        // Determine redirect path after profile is confirmed to exist
        const finalProfile = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
        const redirectPath = finalProfile?.role === Role.TEACHER ? '/dashboard/teacher' : '/dashboard/student';
        return NextResponse.redirect(`${origin}${redirectPath}`);

    } catch (error: unknown) {
        // This outer catch block handles all errors and ensures a valid response
        console.error("[Auth Callback] Overall error:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
    }
  }

  // Fallback redirect if no code is present
  return NextResponse.redirect(`${origin}/login?error=Authentication+callback+link+is+invalid.`);
}


