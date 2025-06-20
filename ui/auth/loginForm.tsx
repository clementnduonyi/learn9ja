// src/components/auth/LoginForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to read query parameters
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // ... (error handling as before) ...
        setError(signInError.message.includes('Invalid login credentials') ? 'Invalid email or password.' : signInError.message);
        setLoading(false);
        return;
      }

      // --- Login Successful! ---

      // 1. Check for redirect parameter
      const redirectedFrom = searchParams.get('redirectedFrom');
      let redirectPath = '/dashboard'; // Default redirect

      if (redirectedFrom) {
        // Basic validation: Ensure it's an internal path (starts with '/')
        // Avoid open redirect vulnerabilities
        if (redirectedFrom.startsWith('/') && !redirectedFrom.startsWith('//')) {
          console.log(`Login successful, redirecting back to: ${redirectedFrom}`);
          redirectPath = redirectedFrom;
        } else {
          console.warn(`Invalid redirectedFrom parameter ignored: ${redirectedFrom}`);
          // Fallback to default dashboard if param is invalid/external
        }
      } else {
         console.log(`Login successful, redirecting to default: ${redirectPath}`);
      }


      // 2. Push to the determined path
      router.push(redirectPath);

      // 3. Refresh server components (important for layout/navbar updates)
      router.refresh();

      // No need to setLoading(false) here as the page is navigating away

    } catch (err: any) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    // ... (rest of the form JSX remains the same) ...
     <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                    Sign in to your account
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                    <div>
                        <Label htmlFor="email">Your email</Label>
                        <Input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="..." placeholder="name@company.com" required />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="..." required />
                    </div>

                    {error && ( <p className="text-sm font-medium text-red-500 text-center">{error}</p> )}

                    <Button type="submit" variant="default" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
                        Don’t have an account yet?{' '}
                        <Link href="/signup" className="font-medium text-indigo-600 hover:underline dark:text-indigo-500">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  );
}
