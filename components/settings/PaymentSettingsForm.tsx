// src/components/settings/PaymentSettingsForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
// Assuming updatePaymentSettings action ONLY handles student logic now
import { updatePaymentSettings } from '@/app/actions/settingsAction';
import { Button } from '@/components/ui/button';
/*import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';*/

interface PaymentSettingsFormProps {
    role: Role; // Still useful to conditionally render the whole section
    initialPaymentData: JsonValue | null; // Student e.g., { stripeCustomerId: 'cus_...' }
    // Removed initialPayoutData prop
}

export default function PaymentSettingsForm({ role, initialPaymentData }: PaymentSettingsFormProps) {
     const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Only render anything if the user is a student
    if (role !== 'STUDENT') {
        return null; // Or display a message indicating no payment settings for this role
    }

    // TODO: Add state for actual student payment form fields when implemented (e.g., Stripe Elements)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
         event.preventDefault();
         setError(null);
         setSuccess(null);
         console.warn("Student Payment form submission not fully implemented.");

         // --- Placeholder for actual logic ---
         // 1. Get data from Stripe Elements or similar
         // 2. Prepare data object for student payment update
         // 3. Call server action: await updatePaymentSettings(paymentData);
         // 4. Handle result
         // --- End Placeholder ---

         const paymentData = { /* student payment data from Stripe Elements, etc. */ };
         startTransition(async () => {
             const result = await updatePaymentSettings(paymentData); // Action only handles student now
             if (result.error) { setError(result.error); }
             else { setSuccess("Settings updated!"); router.refresh(); }
             await new Promise(resolve => setTimeout(resolve, 500)); // Simulate action
             setSuccess("Placeholder: Student Payment Settings saved (Integration needed).");
         });
    };


    return (
         <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
             <div>
                 <h3 className="font-medium mb-2">Payment Method</h3>
                 <p className="text-sm text-gray-600 mb-4">Manage your payment method for booking sessions.</p>
                 {/* TODO: Implement Stripe Elements or similar here */}
                 <div className="p-4 border rounded bg-gray-50 text-center text-gray-500">
                     Student Payment Method Integration <em>coming soon!</em>
                 </div>
                 {/* Display stored info if available, e.g., last 4 digits */}
                 {initialPaymentData && <p>Current Method: **** **** **** {initialPaymentData.toString()}</p>}
             </div>


             {error && <p className="text-red-500 text-sm">{error}</p>}
             {success && <p className="text-green-600 text-sm">{success}</p>}

             {/* Only show save button if there are actual fields/actions */}
             <Button type="submit" disabled={isPending} className="mt-4">
                 {isPending ? 'Saving...' : 'Save Payment Settings'}
             </Button>
              <p className="text-xs italic text-gray-500 mt-4">Note: Full payment integration is not yet implemented.</p>
         </form>
    );
}
