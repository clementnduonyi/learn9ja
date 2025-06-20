// src/components/pricing/PricingCard.tsx
'use client'; // Make it a client component if the button needs client-side interaction later

import React from 'react'; // Import React if using JSX directly
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils'; // Optional classname utility
// Import needed types from Prisma (used for props)
import type { Role } from '@prisma/client';
import { SubscriptionTier } from '@prisma/client';


interface PricingCardProps {
  title: string; // e.g., "Basic", "Premium", "Enterprise" - should match SubscriptionTier enum values
  price: number;
  features: string[];
  isPopular?: boolean;
  // Prop indicating which role this plan is primarily intended for (used for display/disabling)
  targetRole: Role; // 'STUDENT' or 'TEACHER'

  // --- Props passed from parent ---
  currentUserRole?: Role | null; // Role of the currently logged-in user
  currentUserTier?: SubscriptionTier | null; // Subscription tier of the logged-in user
  isUserLoggedIn: boolean; // Flag indicating if a user is logged in
}

// Helper function to map card title to SubscriptionTier enum value
// Adjust this mapping based on your exact card titles and enum names
const mapTitleToTier = (title: string): SubscriptionTier | null => {
    const upperTitle = title.toUpperCase();
    if (upperTitle in SubscriptionTier) {
        return upperTitle as SubscriptionTier;
    }
    console.warn(`PricingCard title "${title}" does not map to a known SubscriptionTier.`);
    return null; // Return null if no match
};

const PricingCard = ({
  title,
  price,
  features,
  isPopular = false,
  targetRole, // e.g., Role.STUDENT or Role.TEACHER
  currentUserRole,
  currentUserTier,
  isUserLoggedIn,
}: PricingCardProps) => {

  // Determine if the logged-in user's role matches the target role for this card
  // Allow viewing all cards if not logged in, disable button instead
  const isUserRoleMatch = !isUserLoggedIn || (currentUserRole === targetRole);

  // Determine if this card represents the user's current subscription tier
  const cardTier = mapTitleToTier(title);
  const isCurrentPlan = isUserLoggedIn && cardTier !== null && currentUserTier === cardTier;

  // Determine button text and state
  let buttonText = "Subscribe Now";
  let buttonDisabled = !isUserLoggedIn || !isUserRoleMatch; // Disable if not logged in or wrong role

  if (isCurrentPlan) {
    buttonText = "Current Plan";
    buttonDisabled = true; // Disable button for the current plan
  } else if (!isUserRoleMatch && isUserLoggedIn) {
     buttonText = `For ${targetRole === 'TEACHER' ? 'Teachers' : 'Students'} Only`;
     // Button is already disabled by !isUserRoleMatch check
  } else if (!isUserLoggedIn) {
      buttonText = "Login to Subscribe";
      // Button is already disabled by !isUserLoggedIn check
  }

  // TODO: Implement actual subscription logic when button is clicked
  // This would likely involve calling a server action to initiate a Stripe Checkout session
  const handleSubscribeClick = () => {
      console.log(`Subscribe button clicked for plan: ${title} (Tier: ${cardTier})`);
      // Example: redirectToCheckout(cardTier); // Call your checkout function
      alert(`Subscription logic for ${title} not implemented yet.`);
  };

  return (
    <div className={cn(`
      relative bg-white dark:bg-gray-800 rounded-xl border p-6 md:p-8 shadow-sm transition-shadow duration-200 hover:shadow-lg`,
      isPopular
        ? 'border-indigo-500 shadow-md shadow-indigo-500/10' // Use theme color for popular
        : 'border-gray-200 dark:border-gray-700',
      !isUserRoleMatch && isUserLoggedIn ? 'opacity-60 cursor-not-allowed' : '' // Dim card if wrong role
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
            Most Popular
          </span>
        </div>
      )}

      <h3 className={cn(
          'text-xl font-semibold',
          isPopular ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
      )}>
        {title}
      </h3>

      <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
        {/* Consider using Intl.NumberFormat for currency */}
        <span className="text-3xl font-bold">₦{price.toLocaleString()}</span>
        <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">/month</span>
      </div>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {targetRole === 'TEACHER'
          ? "For teachers enhancing their services."
          : "For students seeking the best experience."
        }
      </p>

      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-indigo-500 flex-shrink-0 mr-2 mt-0.5" />
            <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          onClick={handleSubscribeClick} // Add onClick handler
          disabled={buttonDisabled} // Use calculated disabled state
          className={cn(
              `w-full`,
              isPopular && !isCurrentPlan ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : '',
              !isPopular && !isCurrentPlan ? 'bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white' : '',
              isCurrentPlan ? 'bg-gray-200 text-gray-600 cursor-default hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300' : '',
              !isUserRoleMatch && isUserLoggedIn ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-500' : ''
          )}
          variant={isCurrentPlan || (!isUserRoleMatch && isUserLoggedIn) ? "outline" : "default"} // Adjust variant based on state
          aria-disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;

