// src/app/settings/page.tsx

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import UserProfileSettingsForm from '@/components/settings/UserProfileSettingForm';
import PaymentSettingsForm from '@/components/settings/PaymentSettingsForm';
import { UserSettingsData, userSettingsArgs } from '@/lib/types';



export const metadata = {
  title: 'Account Settings',
};

export default async function SettingsPage() {
    const supabase = await createClient();

    // --- Authentication ---
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
        redirect('/login?message=Please login to access settings');
    }

    // --- Data Fetching ---
    let userSettings: UserSettingsData | null = null;
    let fetchError: string | null = null;
    try {
        // Fetch only the selected user data
        userSettings = await prisma.user.findUnique({
            where: { id: authUser.id },
            ...userSettingsArgs // Use the defined select args
        });
        if (!userSettings) {
            // This implies a data inconsistency if the user is authenticated
            throw new Error("User profile not found in database.");
        }
    } catch (error) {
        console.error("Error fetching user settings:", error);
        fetchError = "Could not load your settings data.";
    }

    // --- Render Page ---
    // Show error immediately if fetch failed
    if (fetchError) {
         return <div className="container mx-auto p-6 text-red-500 bg-red-50 rounded-md">{fetchError}</div>;
    }
    // Should not happen if auth check passed and DB is consistent, but safeguard anyway
    if (!userSettings) {
         redirect('/login?error=User settings could not be loaded.');
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-10">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

            {/* Section 1: User Profile Settings (Common Fields) */}
            <section aria-labelledby="profile-settings-heading">
                <h2 id="profile-settings-heading" className="text-xl font-semibold mb-4 border-b pb-2">Profile Information</h2>
                {/* Pass only the necessary subset of data if preferred, or the whole object */}
                <UserProfileSettingsForm initialData={userSettings} />
            </section>

            {/* Section 2: Payment Settings (Renders only for Student) */}
            <section aria-labelledby="payment-settings-heading">
                 <h2 id="payment-settings-heading" className="text-xl font-semibold mb-4 border-b pb-2">Payment Method</h2>
                 {/* Payment form handles the role check internally now */}
                 <PaymentSettingsForm
                    role={userSettings.role!} // Pass role from fetched data
                    initialPaymentData={userSettings.paymentMethodDetails}
                 />
            </section>

             {/* Add other general settings sections like Security (Password Change), Notifications etc. later */}

        </div>
    );
}
