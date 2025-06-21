
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Assuming shadcn/ui RadioGroup
import { Gender, Role } from '@prisma/client'; // <<< Import Gender enum


// We removed the server action call from here previously
// import { completeUserProfile } from '@/app/actions/authActions';

export default function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();
 // const [step, setStep] = useState<"role" | "details">("role");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [gender, setGender] = useState<Gender | ''>(''); // <<< NEW state for gender
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);


  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // --- Validation ---
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters long."); return; }
    if (!role) { setError("Please select your role."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!gender) { setError("Please select your gender."); return; } // <<< NEW validation

    setLoading(true);

    // --- Call Supabase Auth SignUp ---
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

    setLoading(false); // Stop loading after Supabase call

    if (signUpError) {
      setError(signUpError.message);
      return; // Stop execution on Supabase signup error
    }

    // --- Success Handling (Profile creation now happens in callback) ---
    setMessage("Account created! Please check your email for a confirmation link to complete signup.");
    // Clear form
    setEmail(''); setPassword(''); setConfirmPassword(''); setName(''); setRole(''); setGender(''); // Clear gender too

    // Redirect to login or a specific "check email" page
    router.push('/login?message=Please check your email to confirm your account.');
   console.log(signUpData);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 max-w-sm mx-auto">
       <h2 className="text-2xl font-semibold text-center">Create Account</h2>
       {/* Name Input */}
       <div>
           <Label htmlFor="name">Full Name</Label>
           <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
       </div>
       {/* Email Input */}
       <div>
           <Label htmlFor="email">Email</Label>
           <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
       </div>
       {/* Password Inputs */}
       <div>
           <Label htmlFor="password">Password (min. 6 characters)</Label>
           <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
       </div>
       <div>
           <Label htmlFor="confirmPassword">Confirm Password</Label>
           <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
       </div>

       {/* Role Selection */}
       <div className="space-y-2">
            <Label>Select Your Role:</Label>
            {/* Assuming RadioGroup component */}
            <RadioGroup value={role} onValueChange={(value) => setRole(value as Role)} className="flex space-x-4">
                 <div className="flex items-center space-x-2">
                     <RadioGroupItem value={Role.STUDENT} id="role-student" />
                     <Label htmlFor="role-student">I need help (Student/Parent)</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                     <RadioGroupItem value={Role.TEACHER} id="role-teacher" />
                     <Label htmlFor="role-teacher">I want to teach (Teacher)</Label>
                 </div>
            </RadioGroup>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
            <Label>Gender (For default avatar)</Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)} className="flex space-x-4" required>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value={Gender.MALE} id="gender-male" />
                    <Label htmlFor="gender-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value={Gender.FEMALE} id="gender-female" />
                    <Label htmlFor="gender-female">Female</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value={Gender.OTHER} id="gender-other" />
                    <Label htmlFor="gender-other">Other / Prefer not to say</Label>
                </div>
            </RadioGroup>
        </div>


      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {message && <p className="text-green-500 text-sm text-center">{message}</p>}

      <Button type="submit" disabled={loading}  variant="default" className="w-full">
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
       <p className="text-center text-sm text-gray-600">
           Already have an account?{' '}
           <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-500">
               Log in
           </Link>
       </p>
    </form>
  );
}

