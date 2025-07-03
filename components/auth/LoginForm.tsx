'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Placeholder for a Social Login button component
const SocialLoginButton = ({ provider, children }: { provider: 'google' | 'github', children: React.ReactNode }) => {
    // TODO: Implement Supabase social login
    const handleLogin = () => {
        alert(`Social login with ${provider} is not yet implemented.`);
    };
    return <Button variant="outline" className="w-full flex justify-center gap-3" onClick={handleLogin}>{children}</Button>;
};


export default function LoginForm() {
    const router = useRouter();
    // This hook makes this component dynamic and requires the Suspense boundary.
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isPending, startTransition] = useTransition();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Get messages from URL params
    const urlError = searchParams.get('error');
    const urlMessage = searchParams.get('message');


    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message.includes('Invalid login credentials') ? 'Invalid email or password.' : signInError.message);
            } else {
                const redirectedFrom = searchParams.get('redirectedFrom');
                const redirectPath = (redirectedFrom && redirectedFrom.startsWith('/')) ? redirectedFrom : '/dashboard';
                router.push(redirectPath);
                router.refresh();
            }
        });
    };

    return (
        <div className="flex flex-col">
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <Label htmlFor="email">Email address</Label>
                    <div className="mt-1">
                        <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="mt-1">
                        <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <a href="#" className="font-medium text-learn9ja/50 hover:text-learn9ja/60 ">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                {(error || urlError) && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error || urlError}</p>}
                {urlMessage && !error && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{urlMessage}</p>}


                <div>
                    <Button type="submit" variant='outline' disabled={isPending} className="w-full flex text-learn9ja justify-center py-3">
                        {isPending ? "Signing in..." : "Sign in"}
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    {/* Placeholder social login buttons */}
                    <SocialLoginButton provider="google">
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.25a.75.75 0 01.75.75v.001c0 .414.336.75.75.75h4.42a.75.75 0 01.75-.75v-.001a.75.75 0 01-.75-.75H6.29zM3.5 15.25a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.25a.75.75 0 01-.75-.75zM5 11.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5H5.75a.75.75 0 01-.75-.75zM7.25 7.5a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75zM10 2a8 8 0 100 16 8 8 0 000-16zM1.75 10a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" /></svg>
                        <span>Google</span>
                    </SocialLoginButton>
                </div>
            </div>
        </div>
    );
}