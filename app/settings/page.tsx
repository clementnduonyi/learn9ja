
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import UserProfileSettingsForm from '@/components/settings/UserProfileSettingForm';
import PaymentSettingsForm from '@/components/settings/PaymentSettingsForm';
import { User, CreditCard } from 'lucide-react';
import { userSettingsArgs } from '@/lib/types';

export const metadata = { title: 'Account Settings' };

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) redirect('/login?message=Please login');

    const userSettings = await prisma.user.findUnique({
        where: { id: authUser.id },
        ...userSettingsArgs
    });
    if (!userSettings) redirect('/login?error=User settings could not be loaded.');

    return (
        <div className="min-h-[80vh] py-10 px-2 sm:px-0 bg-learn9ja/5">
            <div className="max-w-2xl pt-24 mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-learn9ja drop-shadow-sm">Account Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your profile, payment, and account details.</p>
                </header>

                <div className="bg-white border border-learn9ja/20 rounded-2xl shadow-lg overflow-hidden">
                    {/* Section 1: User Profile Settings */}
                    <section className="p-8 border-b border-learn9ja/10 bg-learn9ja/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-learn9ja/20 p-3 rounded-full shadow">
                                <User className="h-7 w-7 text-learn9ja" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-learn9ja">Profile Information</h2>
                                <p className="text-sm text-gray-500">Update your personal details and avatar.</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <UserProfileSettingsForm initialData={userSettings} />
                        </div>
                    </section>

                    {/* Section 2: Payment Settings */}
                    <section className="p-8 bg-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-learn9ja/20 p-3 rounded-full shadow">
                                <CreditCard className="h-7 w-7 text-learn9ja" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-learn9ja">Payment Method</h2>
                                <p className="text-sm text-gray-500">Manage your payment details for booking sessions.</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <PaymentSettingsForm
                                role={userSettings.role!}
                                initialPaymentData={userSettings.paymentMethodDetails}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}




