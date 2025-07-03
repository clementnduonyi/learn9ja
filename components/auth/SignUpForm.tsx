"use client"

import React, { useState, useTransition } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Gender, Role } from "@prisma/client";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils'; // Assuming you have a classname utility


// A better RoleSelection integrated directly into the form
const RoleSelection = ({ role, setRole }: { role: Role | '', setRole: (role: Role) => void }) => {
  return (
    <div className="space-y-2">
      <Label className="font-semibold text-gray-800 dark:text-gray-200">Join as a:</Label>
      <RadioGroup value={role} onValueChange={(value) => setRole(value as Role)} className="grid grid-cols-2 gap-4">
        {/* Student Option */}
        <div>
          <RadioGroupItem value="STUDENT" id="role-student" className="peer sr-only" />
          <Label
            htmlFor="role-student"
            className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                "peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-indigo-600 [&:has([data-state=checked])]:border-indigo-600",
                "cursor-pointer"
            )}
          >
            <span className="text-2xl mb-2">👨‍🎓</span>
            <span className="font-medium">Student</span>
          </Label>
        </div>
        {/* Teacher Option */}
        <div>
          <RadioGroupItem value="TEACHER" id="role-teacher" className="peer sr-only" />
          <Label
            htmlFor="role-teacher"
            className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                "peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-indigo-600 [&:has([data-state=checked])]:border-indigo-600",
                "cursor-pointer"
            )}
          >
            <span className="text-2xl mb-2">👩‍🏫</span>
            <span className="font-medium">Teacher</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
};


export default function SignUpForm() {
    const router = useRouter();
    const supabase = createClient();
    const [isPending, startTransition] = useTransition();

    const [role, setRole] = useState<Role | ''>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<Gender | ''>('');

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        // --- Validation ---
        if (!role) { setError("Please select your role."); return; }
        // ... other validations ...

        startTransition(async () => {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name.trim(),
                  selected_role: role,
                  selected_gender: gender,
                },
                emailRedirectTo: `${location.origin}/auth/callback`,
              },
            });

            if (signUpError) {setError(signUpError.message)} 
            
            if (signUpData) {
              setMessage("Success! Please check your email for a confirmation link.");
              // Don't redirect immediately, let the user see the success message
              router.push('/login?message=Please check your email to confirm your account.');
            }
        });
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-6">
            <RoleSelection role={role} setRole={(r) => setRole(r)} />

            <div className="grid grid-cols-1 gap-y-6">
                 <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="mt-1">
                        <Input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                    </div>
                </div>

                 <div>
                    <Label htmlFor="email">Email address</Label>
                    <div className="mt-1">
                        <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="mt-1">
                        <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)} className="flex space-x-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="MALE" id="gender-male" /><Label htmlFor="gender-male">Male</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="FEMALE" id="gender-female" /><Label htmlFor="gender-female">Female</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="OTHER" id="gender-other" /><Label htmlFor="gender-other">Other</Label></div>
                </RadioGroup>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}
            {message && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">{message}</p>}

            <div>
                <Button type="submit" disabled={isPending} variant="outline" className="w-full flex text-learn9ja justify-center py-3">
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </div>
        </form>
    );
}
