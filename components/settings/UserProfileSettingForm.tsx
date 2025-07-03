// src/components/settings/UserProfileSettingsForm.tsx
/*'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
// Import the specific type for the data this form needs
import type { UserSettingsData } from '@/lib/types'; // Adjust path if type moved
import { updateUserProfileSettings } from '@/app/actions/settingsAction';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Assuming shadcn/ui
import { Gender } from '@prisma/client'; // <<< Import Gender enum


// A partial list of IANA timezones. In a real app, use a comprehensive library.
const timezones = [
    "Africa/Lagos", // (UTC+1)
    "Africa/Johannesburg", // (UTC+2)
    "Europe/London", // (UTC+0 / UTC+1 DST)
    "America/New_York", // (UTC-5 / UTC-4 DST)
    "America/Chicago", // (UTC-6 / UTC-5 DST)
    "America/Denver", // (UTC-7 / UTC-6 DST)
    "America/Los_Angeles", // (UTC-8 / UTC-7 DST)
];

interface Address {
  street?: string;
  city?: string;
  country?: string;
}

interface UserProfileSettingsFormProps {
    // Ensure UserSettingsData includes gender from the parent page fetch
    initialData: Pick<UserSettingsData, 'name' | 'email' | 'dob' | 'phone' | 'address' | 'avatarUrl' | 'gender' | 'timezone'>;
}

// Helper function remains the same
const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toISOString().split('T')[0];
    } catch (e) { 
        console.error("Error formatting date:", e); return ''; 
    }
};

export default function UserProfileSettingsForm({ initialData }: UserProfileSettingsFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(initialData.name ?? '');
    const [dob, setDob] = useState(formatDateForInput(initialData.dob));
    const [phone, setPhone] = useState(initialData.phone ?? '');
    const [timezone, setTimezone] = useState(initialData.timezone ?? ''); // <<< Add timezone state
    const [gender, setGender] = useState<Gender | null>(initialData.gender ?? null); // <<< Add gender state, initialize with null if no initial value
    // ... address state ...
    const [addressStreet, setAddressStreet] = useState((initialData.address as Address)?.street ?? '');
    const [addressCity, setAddressCity] = useState((initialData.address as Address)?.city ?? '');
    const [addressCountry, setAddressCountry] = useState((initialData.address as Address)?.country ?? '');
    // TODO: Add state for avatarUrl if implementing upload

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const addressData = (addressStreet || addressCity || addressCountry)
             ? { street: addressStreet, city: addressCity, country: addressCountry }
             : null;

        const formData = {
            name: name.trim(),
            dob: dob ? new Date(dob) : null,
            phone: phone.trim() || null,
            timezone: timezone,
            gender: gender, // <<< Include gender state in submitted data
            address: addressData,
            // TODO: Add avatarUrl from upload component state
        };

        startTransition(async () => {
            const result = await updateUserProfileSettings(formData); // Pass updated data structure
            if (result.error) {
                setError(result.error);
                setSuccess(null);
            } else {
                setSuccess("Profile updated successfully!");
                setError(null);
                router.refresh(); // Refresh server components
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            {/* TODO: Avatar Upload Component Here *}
            <div className="p-4 border rounded bg-gray-50 text-center text-gray-500">Avatar Upload Placeholder</div>

            {/* Name, Email, DOB, Phone Inputs ... *}
             <div><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1"/></div>
             <div><Label htmlFor="email">Email</Label><Input id="email" value={initialData.email ?? ''} disabled className="mt-1 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"/></div>
             <div><Label htmlFor="dob">Date of Birth</Label><Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1"/></div>
             <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" className="mt-1"/></div>

             {/* Gender Selection *}
             <div className="space-y-2">
                <Label>Gender (For default avatar)</Label>
                {/* Use RadioGroup, ensuring value matches state type (Gender | null) *}
                {/* Need to handle null state if no gender selected initially *}
                <RadioGroup
                    value={gender ?? ""} // Use empty string if gender is null for RadioGroup value
                    onValueChange={(value) => setGender(value as Gender)} // Cast selected value back to Gender
                    className="flex flex-wrap gap-x-4 gap-y-2" // Allow wrapping
                >
                    {/* Map over Gender enum values *}
                    {(Object.keys(Gender) as Array<keyof typeof Gender>).map((key) => (
                         <div className="flex items-center space-x-2" key={key}>
                             <RadioGroupItem value={key} id={`gender-${key.toLowerCase()}`} />
                             {/* Capitalize first letter for display *}
                             <Label htmlFor={`gender-${key.toLowerCase()}`} className="font-normal cursor-pointer">
                                 {key.charAt(0) + key.slice(1).toLowerCase()}
                             </Label>
                         </div>
                     ))}
                     {/* Optional: Add a button/way to clear selection back to null? *}
                </RadioGroup>
            </div>

            {/* Address Fields ... *}
             <fieldset className="space-y-3 border p-4 rounded-md pt-2">
                 <legend className="text-sm font-medium px-1">Address (Optional)</legend>
                 {/* ... address inputs ... *}
                  <div><Label htmlFor="street">Street</Label><Input id="street" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className="mt-1"/></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="mt-1"/></div>
                    <div><Label htmlFor="country">Country</Label><Input id="country" value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className="mt-1"/></div>
                  </div>
             </fieldset>
             {/* Timezone Selection Dropdown *}
            <div>
                <Label htmlFor="timezone">Your Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone} required>
                    <SelectTrigger id="timezone" className="mt-1">
                        <SelectValue placeholder="Select your timezone..." />
                    </SelectTrigger>
                    <SelectContent>
                        {timezones.map(tz => (
                            <SelectItem key={tz} value={tz}>
                                {tz.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-xs text-gray-500 mt-1">Crucial for scheduling. Availability times you set will be based on this timezone.</p>
            </div>

            {/* Submit Button & Messages ... *}
             <div className="pt-2 space-y-2">
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                {success && <p className="text-green-600 text-sm text-center">{success}</p>}
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Profile Changes'}
                </Button>
            </div>
        </form>
    );
}*/


// src/components/settings/UserProfileSettingsForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { UserSettingsData } from '@/lib/types';
import { updateUserProfileSettings } from '@/app/actions/settingsAction';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AvatarUpload from './AvatarUpload'; // <<< Import the new component
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Assuming shadcn/ui
import { Gender } from '@prisma/client'; // <<< Import Gender enum



interface Address {
  street?: string;
  city?: string;
  country?: string;
}


interface UserProfileSettingsFormProps {
    initialData: UserSettingsData;
}

const formatDateForInput = (date: Date | null | undefined): string => { 
     if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toISOString().split('T')[0];
    } catch (e) { 
        console.error("Error formatting date:", e); return ''; 
    }
};
const timezones = ["Africa/Lagos", "Europe/London", "America/New_York"]; // Abridged

export default function UserProfileSettingsForm({ initialData }: UserProfileSettingsFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(initialData.name ?? '');
    const [dob, setDob] = useState(formatDateForInput(initialData.dob));
    const [phone, setPhone] = useState(initialData.phone ?? '');
    const [timezone, setTimezone] = useState(initialData.timezone ?? '');
     const [gender, setGender] = useState<Gender | null>(initialData.gender ?? null);
    const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl); // <<< State for new avatar URL
    const [addressStreet, setAddressStreet] = useState((initialData.address as Address)?.street ?? '');
    const [addressCity, setAddressCity] = useState((initialData.address as Address)?.city ?? '');
    const [addressCountry, setAddressCountry] = useState((initialData.address as Address)?.country ?? '');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); setSuccess(null);

        const addressData = (addressStreet || addressCity || addressCountry)
             ? { street: addressStreet, city: addressCity, country: addressCountry }
             : null;


        const formData = {
            name: name.trim(),
            dob: dob ? new Date(dob) : null,
            phone: phone.trim() || null,
            timezone: timezone,
            avatarUrl: avatarUrl, // <<< Pass the new avatar URL to the action
            // Address logic can be added here if needed
             address: addressData,
        };

        startTransition(async () => {
            const result = await updateUserProfileSettings(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("Profile updated successfully!");
                router.refresh(); // Refresh to show new avatar in layout
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            {/* Integrate the AvatarUpload component */}
            <div>
                <Label>Profile Picture</Label>
                <div className="mt-2">
                    <AvatarUpload
                        initialUrl={initialData.avatarUrl}
                        onUploadComplete={(newUrl) => setAvatarUrl(newUrl)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={initialData.email ?? ''} disabled className="mt-1 bg-gray-100 cursor-not-allowed" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
            </div>

            {/* Gender Selection */}
             <div>
                <Label>Gender (For default avatar)</Label>
                {/* Use RadioGroup, ensuring value matches state type (Gender | null) */}
                {/* Need to handle null state if no gender selected initially */}
                <RadioGroup
                    value={gender ?? ""} // Use empty string if gender is null for RadioGroup value
                    onValueChange={(value) => setGender(value as Gender)} // Cast selected value back to Gender
                    className="flex flex-wrap gap-x-4 gap-y-2" // Allow wrapping
                >
                    {/* Map over Gender enum values */}
                    {(Object.keys(Gender) as Array<keyof typeof Gender>).map((key) => (
                         <div className="flex items-center space-x-2" key={key}>
                             <RadioGroupItem value={key} id={`gender-${key.toLowerCase()}`} />
                             {/* Capitalize first letter for display */}
                             <Label htmlFor={`gender-${key.toLowerCase()}`} className="font-normal cursor-pointer">
                                 {key.charAt(0) + key.slice(1).toLowerCase()}
                             </Label>
                         </div>
                     ))}
                     {/* Optional: Add a button/way to clear selection back to null? */}
                </RadioGroup>
            </div>

            <div>
                 {/* Address Fields ... */}
             <fieldset className="space-y-3 border p-4 rounded-md pt-2">
                 <legend className="text-sm font-medium px-1">Address (Optional)</legend>
                 {/* ... address inputs ... */}
                  <div><Label htmlFor="street">Street</Label><Input id="street" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className="mt-1"/></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="mt-1"/></div>
                    <div><Label htmlFor="country">Country</Label><Input id="country" value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className="mt-1"/></div>
                  </div>
             </fieldset>
            </div>
            <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone} required>
                    <SelectTrigger id="timezone" className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{timezones.map(tz => (<SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>))}</SelectContent>
                </Select>
            </div>

            <div className="pt-2 space-y-2">
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}


