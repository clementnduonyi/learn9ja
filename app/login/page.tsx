// src/app/auth/login/page.tsx

import LoginForm from '@/ui/auth/loginForm'; // Import the form component
import type { Metadata } from 'next';

// Optional: Add metadata for the page (title, description)
export const metadata: Metadata = {
  title: 'Login - Academic Ace Agency',
  description: 'Sign in to your account.',
};

export default function LoginPage() {
  return (
    // You can add optional layout/styling around the form here if needed
    // The form component itself includes padding and centering
    <LoginForm />
  );
}