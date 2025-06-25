
import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react'; // Make sure Suspense is imported

export const metadata: Metadata = {
  title: 'Sign In | Learn9ja',
  description: 'Sign in to your Learn9ja account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
            <svg className="h-12 w-auto text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
            </svg>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {/* FIX: The LoginForm component, which uses useSearchParams, is wrapped in a Suspense boundary. */}
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                 <LoginForm />
            </Suspense>
        </div>
      </div>
    </div>
  );
}