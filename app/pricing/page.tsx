

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import PricingCard from '@/components/PricingCard'; // Import the refactored card
import type { SubscriptionTier } from '@prisma/client';
import { Role } from '@prisma/client';

export const metadata = {
  title: 'Pricing Plans',
};

// Define your pricing plans data (could come from DB or config file)

const plans = [
    {
        title: "Basic",
        price: 0,
        features: [
          "Access to teacher profiles",
          "Schedule classes with teachers",
          "In-app messaging with teachers",
          "Basic learning resources",
          "24/7 customer support"
        ],
        targetRole: Role.STUDENT,
        isPopular: false
      },
      {
        title: "Premium",
        price: 5000,
        features: [
          "All Basic features",
          "Access to class recordings",
          "Priority matching with teachers",
          "Advanced learning analytics",
          "Study groups with other students",
          "Premium learning resources"
        ],
        targetRole: Role.STUDENT,
        isPopular: true
      },
      {
        title: "Enterprise",
        price: 12000,
        features: [
          "All Premium features",
          "Dedicated account manager",
          "Custom learning paths",
          "Group classes for schools",
          "Bulk student management",
          "White-label options for institutions"
        ],
        targetRole: Role.STUDENT,
        isPopular: false
      },
 
  // Add Teacher plans if they differ
  // { title: 'Teacher Basic', price: 0, features: [...], targetRole: Role.TEACHER },
  // { title: 'Teacher Pro', price: 2500, features: [...], targetRole: Role.TEACHER },
  {
    title: "Basic",
    price: 0,
    features: [
      "Create teacher profile",
      "Receive scheduled bookings",
      "In-app messaging with students",
      "Basic teaching tools",
      "Payment processing"
    ],
    targetRole: Role.TEACHER,
    isPopular: false
  },
  {
    title: "Premium",
    price: 7500,
    features: [
      "All Basic features",
      "Offer instant classes",
      "Enhanced profile visibility",
      "Record and share classes",
      "Advanced teaching tools",
      "Priority customer support"
    ],
    targetRole: Role.TEACHER,
    isPopular: true
  },
  {
    title: "Professional",
    price: 15000,
    features: [
      "All Premium features",
      "Lower platform fees (5%)",
      "Create and sell courses",
      "Advanced analytics dashboard",
      "Promotional opportunities",
      "Featured teacher placement"
    ],
    targetRole: Role.TEACHER,
    isPopular: false
  }
];

export default async function PricingPage() {
    const supabase = await createClient();

    // --- Fetch Logged-in User Data ---
    let currentUserRole: Role | null = null;
    let currentUserTier: SubscriptionTier | null = null;
    let isUserLoggedIn = false;

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
        isUserLoggedIn = true;
        try {
            const profile = await prisma.user.findUnique({
                where: { id: authUser.id },
                select: { role: true, subscriptionTier: true } // Select needed fields
            });
            if (profile) {
                currentUserRole = profile.role;
                currentUserTier = profile.subscriptionTier;
            } else {
                console.warn(`Pricing Page: Profile not found for logged in user ${authUser.id}`);
                // Handle case where user is logged in but profile doesn't exist?
                // Maybe redirect to profile setup or show error? For now, treat as logged out for pricing.
                isUserLoggedIn = false;
            }
        } catch (error) {
            console.error("Error fetching user profile for pricing page:", error);
            // Treat as logged out if fetch fails
            isUserLoggedIn = false;
        }
    }

    // --- Render Pricing Cards ---
    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                    Choose Your Plan
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-10 sm:mb-12">
                    Select the plan that best fits your learning or teaching needs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.title}
                            title={plan.title}
                            price={plan.price}
                            features={plan.features}
                            isPopular={plan.isPopular}
                            targetRole={plan.targetRole}
                            // Pass user state down
                            currentUserRole={currentUserRole}
                            currentUserTier={currentUserTier}
                            isUserLoggedIn={isUserLoggedIn}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

