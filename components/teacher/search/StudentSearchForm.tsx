// src/components/search/StudentSearchForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import type { Subject } from '@prisma/client';
// Import the TeacherForCard type for state, and the action
import { findAvailableTeachers } from '@/app/actions/studentActions';
import type { TeacherForCard } from '@/lib/types';

import {Button} from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import TeacherCard from '@/components/TeacherCard'; // The card component itself is now correct

interface StudentSearchFormProps {
    subjects: Subject[];
}

export default function StudentSearchForm({ subjects }: StudentSearchFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    // <<< State now holds the correct TeacherForCard type >>>
    const [searchResults, setSearchResults] = useState<TeacherForCard[]>([]);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);

    // Form State (remains the same)
    const [subjectId, setSubjectId] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [preferredDateTimeLocal, setPreferredDateTimeLocal] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [language, setLanguage] = useState<string>('');
    const [specialization, setSpecialization] = useState<string>('');

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSearchMessage(null);
        setSearchResults([]);

        // ... (Validation logic remains the same) ...
        if (!subjectId || !level.trim() || !preferredDateTimeLocal) {
            setError("Please select subject, enter level, and preferred date/time.");
            return;
        }
        const preferredTimeUTC = new Date(new Date(preferredDateTimeLocal).toISOString());
        // ...

        const criteria = {
            subjectId,
            level: level.trim(),
            preferredTimeUTC,
            maxPrice: maxPrice.trim() ? parseFloat(maxPrice) : undefined,
            language: language.trim() || undefined,
            specialization: specialization.trim() || undefined,
            bookingMode: 'SCHEDULED' as const,
        };

        startTransition(async () => {
            const result = await findAvailableTeachers(criteria);
            if (result.error || !result.success) {
                setError(result.error || "Search failed.");
            } else {
                setSearchResults(result.data ?? []);
                if (result.message || (result.data ?? []).length === 0) {
                    setSearchMessage(result.message || "No available teachers found for these criteria.");
                }
            }
        });
    };

    return (
        <div>
            {/* Form JSX remains the same */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-4 border rounded-lg bg-gray-50 items-start">
                 {/* Subject Select */}
                <div>
                    <Label htmlFor="subject">Subject*</Label>
                    <Select value={subjectId} onValueChange={setSubjectId} required>
                        <SelectTrigger id="subject"><SelectValue placeholder="Select subject..." /></SelectTrigger>
                        <SelectContent>
                            {subjects.map(subject => (<SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Level Input */}
                <div>
                    <Label htmlFor="level">Specific Level*</Label>
                    <Input
                        id="level"
                        type="text"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        placeholder="e.g., SS2, JSS1, Primary 5, JAMB"
                        required
                        className="border-gray-300"
                    />
                     <p className="text-xs text-gray-500 mt-1">Enter the exact class or exam level.</p>
                </div>

                {/* Date/Time Picker */}
                <div>
                    <Label htmlFor="preferred-time">Preferred Date & Time* (Your Local)</Label>
                    <Input id="preferred-time" type="datetime-local" value={preferredDateTimeLocal} onChange={(e) => setPreferredDateTimeLocal(e.target.value)} required className="border-gray-300" />
                    <p className="text-xs text-gray-500 mt-1">We&apos;ll match based on UTC equivalent.</p>
                </div>

                 {/* Max Price Input */}
                 {/* Max Price Input with Updated Label */}
                 <div>
                    <Label htmlFor="max-price">Max Session Budget (Optional)</Label>
                    <Input
                        id="max-price"
                        type="number"
                        min="0"
                        step="any"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="e.g., 2500"
                        className="border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the total amount you want to spend for this session.</p>
                 </div>

                 {/* Language Input */}
                 <div>
                    <Label htmlFor="language">Preferred Language (Optional)</Label>
                    <Input id="language" type="text" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g., English, Yoruba" className="border-gray-300" />
                 </div>

                 {/* Specialization Input */}
                 <div>
                    <Label htmlFor="specialization">Specialization Needed (Optional)</Label>
                    <Input id="specialization" type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., JAMB Prep, Remedial" className="border-gray-300" />
                 </div>

                 <div className="sm:col-span-2 lg:col-span-3 flex justify-center mt-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Searching...' : 'Find Available Teachers'}
                    </Button>
                </div>
            </form>

            {/* Results Area */}
            <div className="mt-6">
                {error && <p className="text-red-500 ...">{error}</p>}
                {searchMessage && !error && searchResults.length === 0 && <p className="text-center ...">{searchMessage}</p>}
                {isPending && <p className="text-center ...">Searching...</p>}

                {!isPending && searchResults.length > 0 && (
                    <div>
                         <h2 className="text-2xl font-semibold mb-4">Available Teachers Found</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {searchResults.map(teacher => (
                                // <<< This now works because teacher object matches TeacherForCard type >>>
                                <TeacherCard
                                    key={teacher.id}
                                    teacher={teacher}
                                    variant="searchResult" // Set variant for correct button display
                                    searchCriteria={{
                                        subjectId,
                                        level: level.trim(),
                                        preferredTimeUTC: new Date(new Date(preferredDateTimeLocal).toISOString())
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


