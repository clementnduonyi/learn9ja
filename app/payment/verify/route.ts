// src/app/payment/verify/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Ensure this action is correctly implemented and imported
import { verifyPaymentAndCreateBooking } from '@/app/actions/bookingActions';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Wrap the entire logic in a try...catch block for robustness
  try {
    const reference = requestUrl.searchParams.get('reference');

    // Check if Paystack provided a reference
    if (!reference) {
      console.error("[Paystack Callback] Error: No payment reference found in URL.");
      // Redirect to the main search page with a generic error
      return NextResponse.redirect(`${origin}/find-teachers?error=Payment+reference+was+missing.+Please+try+again.`);
    }

    console.log(`[Paystack Callback] Received reference: ${reference}. Starting server-side verification...`);

    // Call our secure server action to verify the payment and create the booking
    const result = await verifyPaymentAndCreateBooking({
      paystackReference: reference,
    });

    // Redirect the user based on the outcome of the verification and booking creation
    if (result.success && result.bookingId) {
      console.log(`[Paystack Callback] Booking ${result.bookingId} created successfully. Redirecting to success page.`);
      // Redirect to a dedicated booking detail page or a generic success page on the student's dashboard
      return NextResponse.redirect(`${origin}/student/bookings/${result.bookingId}?status=success`);
    } else {
      // If the action returned a controlled error, use that message
      console.error(`[Paystack Callback] Verification/booking failed for reference ${reference}. Reason:`, result.error);
      const errorMessage = encodeURIComponent(result.error || 'Your booking could not be confirmed after payment. Please contact support.');
      return NextResponse.redirect(`${origin}/find-teachers?error=${errorMessage}`);
    }

  } catch (error: any) {
    // Catch any unexpected errors that might occur during the process
    console.error("[Paystack Callback] A critical unexpected error occurred:", error);
    const errorMessage = encodeURIComponent("An unexpected server error occurred during payment verification. Please contact support.");
    return NextResponse.redirect(`${origin}/find-teachers?error=${errorMessage}`);
  }
}
