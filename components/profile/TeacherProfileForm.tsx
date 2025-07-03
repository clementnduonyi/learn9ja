// src/components/profile/TeacherProfileForm.tsx
'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherProfile, Subject } from '@prisma/client'; // Import Prisma for Decimal type
import { JsonValue } from '@prisma/client/runtime/library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Import Input
import { Switch } from '@/components/ui/switch';
import { FaCheck } from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'
// Import actions
import { updateTeacherProfile, /*updateTeacherPayoutSettings*/ } from '@/app/actions/teacherActions'; // Adjust paths

import AvailabilityEditor, { WeeklyAvailability } from './AvailabilityEditor';
import SubjectSelector, { SubjectLevelsSelection } from './SubjectSelector';

// --- Types ---
interface TeacherProfileFormProps {
  userId: string;
  // Include new fields in initial data shape
  initialProfile: (TeacherProfile & {
    subjectsTaught: { subjectId: string; levels: string[] }[];
  }) | null;
  allSubjects: Subject[];
}

// Helper functions (parseAvailabilityJson, formatAvailabilityToJson) remain the same...
function parseAvailabilityJson(json: JsonValue | null | undefined): WeeklyAvailability {
    // Guard against non-object types
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
        return {};
    }

    // Type the incoming json as a record we can safely index
    const availabilityObject = json as Record<string, unknown>;
    const parsed: WeeklyAvailability = {};
    const days: (keyof WeeklyAvailability)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    for (const day of days) {
        // Safely get the value for the current day
        const daySlots = availabilityObject[day];

        // Check if the value is an array before processing
        if (Array.isArray(daySlots)) {
            const validSlots = daySlots
                .map((slot: unknown) => { // Treat each item as 'unknown' for safety
                    // Ensure the slot is a string before trying to split it
                    if (typeof slot !== 'string') return null;

                    const times = slot.split('-');
                    if (times.length === 2 && /^\d{2}:\d{2}$/.test(times[0]) && /^\d{2}:\d{2}$/.test(times[1])) {
                        return { start: times[0], end: times[1] };
                    }
                    return null; // Return null for malformed strings
                })
                .filter((s): s is { start: string; end: string; } => s !== null); // Type predicate correctly filters out nulls

            if (validSlots.length > 0) {
                 parsed[day] = validSlots;
            }
        }
    }
    return parsed;
}



function formatAvailabilityToJson(availability: WeeklyAvailability): JsonValue {
    // ... implementation ...
     const jsonResult: Record<string, string[]> = {};
     for (const day in availability) {
         const slots = availability[day as keyof WeeklyAvailability];
         if (slots && slots.length > 0) {
             jsonResult[day] = slots
                 .filter(slot => slot.start && slot.end)
                 .map(slot => `${slot.start}-${slot.end}`);
         }
     } return jsonResult as unknown as JsonValue;
}


// --- Component ---
export default function TeacherProfileForm({
  initialProfile,
  allSubjects,
}: TeacherProfileFormProps) {
  const router = useRouter();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [bio, setBio] = useState(initialProfile?.bio ?? '');
  const [currentAvailability, setCurrentAvailability] = useState<WeeklyAvailability>(
    parseAvailabilityJson(initialProfile?.availability)
  );
  const [currentSubjectLevels, setCurrentSubjectLevels] = useState<SubjectLevelsSelection>(() => {
      const initialMap: SubjectLevelsSelection = {};
      initialProfile?.subjectsTaught?.forEach(st => { initialMap[st.subjectId] = st.levels ?? []; });
      return initialMap;
  });
  
  const [pricePerHour, setPricePerHour] = useState<string>(initialProfile?.pricePerHour?.toString() ?? ''); // Store as string for input
  const [specializations, setSpecializations] = useState<string>((initialProfile?.specializations ?? []).join(', ')); // Store as comma-separated string
  const [acceptingInstant, setAcceptingInstant] = useState<boolean>(initialProfile?.acceptingInstantSessions ?? false);

  // Error/Success states remain the same
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  /*const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);*/

  // --- Callbacks ---
  const handleAvailabilityUpdate = useCallback((newAvailability: WeeklyAvailability) => { setCurrentAvailability(newAvailability); }, []);
  const handleSubjectLevelsUpdate = useCallback((newSelection: SubjectLevelsSelection) => { setCurrentSubjectLevels(newSelection); }, []);

  // --- Submit Handlers ---
  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null); setProfileSuccess(null);

    // --- Validation ---
    const formattedAvailability = formatAvailabilityToJson(currentAvailability);
    const parsedPrice = pricePerHour.trim() ? parseFloat(pricePerHour) : null;
    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0)) {
        setProfileError("Price per hour must be a valid positive number or empty.");
        return;
    }
    const specializationsArray = specializations.split(',').map(s => s.trim()).filter(s => s.length > 0);
    // ... other validation ...

    // Prepare subjects data
    const subjectsData = Object.entries(currentSubjectLevels).map(([subjectId, levels]) => ({
        subjectId,
        levels,
    }));

    // Prepare data for Server Action
    const dataToUpdate = {
      bio: bio,
      availability: formattedAvailability,
      acceptingInstantSessions: acceptingInstant,
      subjects: subjectsData,
      pricePerHour: parsedPrice, // Pass parsed number or null
      specializations: specializationsArray, // Pass array of strings
    };

    startProfileTransition(async () => {
      const result = await updateTeacherProfile(dataToUpdate); // Pass updated data structure
      if (result.error) { setProfileError(result.error); }
      else { setProfileSuccess("Profile details saved!"); router.refresh(); }
    });
  };

 /* const handlePayoutSetup = () => { /* ... same as before ... *;
  const isApprovedTeacher = initialProfile?.status === 'APPROVED';*/

  return (
    <div className="space-y-10">
        {/* Form Section 1: Profile Details */}
        <form onSubmit={handleProfileSubmit} className="space-y-8">
            <h3 className="text-xl font-semibold border-b pb-2">Profile Details, Rate & Availability</h3>
            <div className="flex items-center justify-between rounded-lg bg-red border p-4">
              <div className="space-y-0.5">
                  <Label htmlFor="instant-sessions" className="text-base font-medium">Accept Instant Sessions</Label>
                  <p className="text-sm text-gray-500">
                      Allow students on paid plans to book an immediate session with you if you&apos;re available.
                  </p>
              </div>
              
                <Switch
                  id="instant-sessions"
                  checked={acceptingInstant}
                  onCheckedChange={setAcceptingInstant}
                  aria-label="Toggle instant session availability"
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                />
               <label htmlFor="instant-sessions">
                  {acceptingInstant ? <FaCheck /> : <RxCross2  />}
              </label>

      
             
              
            </div>

            {/* Bio Section */}
            <div>
                <Label htmlFor="bio" className="text-lg font-medium">About Me / Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell students about your teaching style..." rows={4} className="mt-1" />
            </div>

            {/* Price Per Hour */}
            <div>
                 <Label htmlFor="pricePerHour" className="text-lg font-medium">Your Rate (per hour)</Label>
                 <Input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01" // Allow decimals
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    placeholder="e.g., 1500.00"
                    className="mt-1 max-w-xs" // Limit width
                 />
                 <p className="text-xs text-gray-500 mt-1">Leave blank if you prefer not to set a public rate.</p>
            </div>

            {/* Specializations */}
             <div>
                <Label htmlFor="specializations" className="text-lg font-medium">Specializations</Label>
                 <Input
                    id="specializations"
                    type="text"
                    value={specializations}
                    onChange={(e) => setSpecializations(e.target.value)}
                    placeholder="e.g., JAMB Prep, Exam Coaching, Beginners"
                    className="mt-1"
                 />
                 <p className="text-xs text-gray-500 mt-1">Enter special areas of expertise, separated by commas.</p>
            </div>


            {/* Availability Section */}
            <AvailabilityEditor initialAvailability={currentAvailability} onChange={handleAvailabilityUpdate} />
            {/* Subjects Section */}
            <SubjectSelector allSubjects={allSubjects} initialSelection={currentSubjectLevels} onChange={handleSubjectLevelsUpdate} />

            {/* Submit Button & Messages for Profile */}
            <div className="pt-4">
                {profileError && <p className="text-red-500 mb-2 text-sm">{profileError}</p>}
                {profileSuccess && <p className="text-green-600 mb-2 text-sm">{profileSuccess}</p>}
                <Button type="submit" disabled={isProfilePending}>
                    {isProfilePending ? 'Saving Profile...' : 'Save Profile Changes'}
                </Button>
            </div>
        </form>

        {/* Section 2: Payout Settings (Remains the same) */}
        {/*<div className="space-y-4 pt-6 border-t">
             <h3 className="text-xl font-semibold">Payout Settings</h3>
             {/* ... Payout section JSX remains the same ... *}
              {!isApprovedTeacher && ( <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md"> Payout setup is available only after approval. </p> )}
              {isApprovedTeacher && ( <> <p className="text-sm text-gray-600"> Connect with Stripe for secure payouts. </p> <div className="p-4 border rounded bg-gray-50 text-center text-gray-500"> Stripe Connect Status Placeholder </div> <Button type="button" onClick={handlePayoutSetup} disabled={isPayoutPending}> {isPayoutPending ? 'Processing...' : 'Setup/Manage Payouts via Stripe'} </Button> {payoutError && <p className="text-red-500 text-sm mt-2">{payoutError}</p>} {payoutSuccess && <p className="text-green-600 text-sm mt-2">{payoutSuccess}</p>} </> )}
        </div>*/}
    </div>
  );
}
