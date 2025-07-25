// src/components/profile/TeacherProfileForm.tsx
'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TeacherProfile, Subject } from '@prisma/client';
import { updateTeacherProfile } from '@/app/actions/teacherActions';

// Import UI Components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FaCheck } from 'react-icons/fa'
import { RxCross2 } from 'react-icons/rx'

// Import Child Form Components
import AvailabilityEditor from './AvailabilityEditor';
import SubjectSelector, { SubjectLevelsSelection } from './SubjectSelector';

// --- Type Definitions ---
interface TeacherProfileFormProps {
  userId: string;
  // This is the data shape fetched by the parent server component
  initialProfile: (TeacherProfile & {
    subjectsTaught: { subjectId: string; levels: string[] }[];
  }) | null;
  allSubjects: Subject[];
}

// --- Helper function to initialize the subject levels state ---
const initializeSubjectLevels = (subjectsTaught: { subjectId: string; levels: string[] }[] | undefined): SubjectLevelsSelection => {
    const initialMap: SubjectLevelsSelection = {};
    if (subjectsTaught) {
        subjectsTaught.forEach(st => {
            initialMap[st.subjectId] = st.levels ?? [];
        });
    }
    return initialMap;
};


// --- Main Component ---
export default function TeacherProfileForm({
 // userId,
  initialProfile,
  allSubjects,
}: TeacherProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- State for all form fields ---
  const [bio, setBio] = useState(initialProfile?.bio ?? '');
  const [pricePerHour, setPricePerHour] = useState<string>(initialProfile?.pricePerHour?.toString() ?? '');
  const [specializations, setSpecializations] = useState<string>((initialProfile?.specializations ?? []).join(', '));
  const [acceptingInstantSessions, setAcceptingInstantSessions] = useState<boolean>(initialProfile?.acceptingInstantSessions ?? false);
  
  // State managed by child components via callbacks
  const [currentAvailabilityJson, setCurrentAvailabilityJson] = useState(initialProfile?.availability ?? {});
  const [currentSubjectLevels, setCurrentSubjectLevels] = useState<SubjectLevelsSelection>(
    initializeSubjectLevels(initialProfile?.subjectsTaught)
  );

  // State for feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Callbacks for child components ---
  const handleAvailabilityUpdate = useCallback((newAvailabilityJson: Record<string, string[]>) => {
    setCurrentAvailabilityJson(newAvailabilityJson);
  }, []);

  const handleSubjectLevelsUpdate = useCallback((newSelection: SubjectLevelsSelection) => {
    setCurrentSubjectLevels(newSelection);
  }, []);

  // --- Form Submission Handler ---
  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // --- Validation ---

     const parsedPrice = pricePerHour.trim() ? parseFloat(pricePerHour) : null;
    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0)) {
        setError("Price per hour must be a valid positive number or empty.");
        return;
    }

    // --- Prepare Data for Server Action ---
    const specializationsArray = specializations.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const subjectsData = Object.entries(currentSubjectLevels).map(([subjectId, levels]) => ({
        subjectId,
        levels,
    }));

    const dataToUpdate = {
      bio: bio,
      pricePerHour: parsedPrice,
      specializations: specializationsArray,
      acceptingInstantSessions: acceptingInstantSessions,
      availability: currentAvailabilityJson,
      subjects: subjectsData,
    };

    startTransition(async () => {
      const result = await updateTeacherProfile(dataToUpdate);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Profile updated successfully!");
        // Refresh the page to show updated data everywhere (e.g., in the profile display page)
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleProfileSubmit} className="space-y-8">
        {/* Instant Session Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
            <div className="space-y-0.5">
                <Label htmlFor="instant-sessions" className="text-base font-medium">
                    Accept Instant Sessions
                </Label>
                <p className="text-sm text-gray-500">
                    Allow students on paid plans to book an immediate session with you.
                </p>
            </div>
            
          <Switch
              id="instant-sessions"
              checked={acceptingInstantSessions}
              onCheckedChange={setAcceptingInstantSessions}
              aria-label="Toggle instant session availability"
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
            />
            <label htmlFor="instant-sessions" className="cursor-pointer p-2 md:p-0">
              {acceptingInstantSessions ? <FaCheck /> : <RxCross2  />}
          </label>
        </div>

        {/* Bio */}
        <div>
            <Label htmlFor="bio" className="text-lg font-medium">About Me / Bio</Label>
            <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell students about your teaching style, experience, and what makes your sessions unique."
                rows={5}
                className="mt-2"
            />
        </div>

        {/* Rate and Specializations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <Label htmlFor="pricePerHour" className="text-lg font-medium">Your Rate (per hour)</Label>
                 <Input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    placeholder="e.g., 2500"
                    className="mt-2"
                 />
                 <p className="text-xs text-gray-500 mt-1">Leave blank if you prefer not to set a public rate.</p>
            </div>
            <div>
                <Label htmlFor="specializations" className="text-lg font-medium">Specializations</Label>
                 <Input
                    id="specializations"
                    type="text"
                    value={specializations}
                    onChange={(e) => setSpecializations(e.target.value)}
                    placeholder="e.g., JAMB Prep, Exam Coaching"
                    className="mt-2"
                 />
                 <p className="text-xs text-gray-500 mt-1">Enter skills, separated by commas.</p>
            </div>
        </div>

        {/* Availability Editor Component */}
        <AvailabilityEditor
            initialAvailabilityJson={initialProfile?.availability}
            onAvailabilityChange={handleAvailabilityUpdate}
        />

        {/* Subject Selector Component */}
        <SubjectSelector
            allSubjects={allSubjects}
            initialSelection={currentSubjectLevels}
            onChange={handleSubjectLevelsUpdate}
        />

        {/* Submit Button & Messages */}
        <div className="pt-4 border-t">
            {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            {success && <p className="mb-4 text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? 'Saving...' : 'Save All Profile Changes'}
            </Button>
        </div>
    </form>
  );
}

