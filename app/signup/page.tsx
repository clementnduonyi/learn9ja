// src/app/auth/login/page.tsx

import SignUpForm from '@/components/signup/SignupForm';
import type { Metadata } from 'next';

// Optional: Add metadata for the page (title, description)
export const metadata: Metadata = {
  title: 'Sign up | Learn9ja - e-learning for all',
  description: 'Sign up to access our services.',
};

export default function SignUpPage() {
  return (
    // You can add optional layout/styling around the form here if needed
    // The form component itself includes padding and centering
    <SignUpForm />
  );
}