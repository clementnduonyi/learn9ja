import SignUpForm from '@/components/auth/SignUpForm'; // Assuming form is moved to components/auth
import type { Metadata } from 'next';
import Link from 'next/link';
// import { Suspense } from 'react';


export const metadata: Metadata = {
  title: 'Create Your Account | Learn9ja',
  description: 'Join Learn9ja today as a student or a teacher and start your learning journey.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Placeholder for a logo */}
        <Link href="/" className="flex justify-center">
            <svg className="h-12 w-auto text-learn9ja
            -600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
            </svg>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
         {/*} <Suspense>*/}
            <SignUpForm />
          {/*</Suspense>*/}
        </div>
      </div>
    </div>
  );
}