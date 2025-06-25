

// src/components/search/StudentSearchForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import type { Subject } from '@prisma/client';
import { findAvailableTeachers } from '@/app/actions/studentActions';
import type { TeacherForCard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import TeacherCard from '@/components/TeacherCard';

interface StudentSearchFormProps {
    subjects: Subject[];
}

export default function StudentSearchForm({ subjects }: StudentSearchFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<TeacherForCard[]>([]);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);

    // Form State
    const [subjectId, setSubjectId] = useState<string>('');
    const [level, setLevel] = useState<string>('');
    const [preferredDateTimeLocal, setPreferredDateTimeLocal] = useState<string>('');
    const [durationMinutes, setDurationMinutes] = useState('60'); // <<< Add state, default to 60
    // const [maxPrice, setMaxPrice] = useState<string>('');

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSearchMessage(null);
        setSearchResults([]);

        if (!subjectId || !level.trim() || !preferredDateTimeLocal) { /* ... validation ... */ }

        const criteria = {
            subjectId,
            level: level.trim(),
            preferredTimeUTC: new Date(new Date(preferredDateTimeLocal).toISOString()),
            durationMinutes: parseInt(durationMinutes, 10), // <<< Use selected duration
            // maxPrice: maxPrice.trim() ? parseFloat(maxPrice) : undefined,
            bookingMode: 'SCHEDULED' as const,
        };

        startTransition(async () => {
            const result = await findAvailableTeachers(criteria);
            if (result.error || !result.success) {
                setError(result.error || "Search failed.");
            } else {
                setSearchResults(result.data ?? []);
                if (result.message || (result.data ?? []).length === 0) {
                    setSearchMessage(result.message || "No available teachers found.");
                }
            }
        });
    };


    return (
        <div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8 p-6 border rounded-xl bg-white dark:bg-gray-800 shadow-lg items-end">
                {/* Subject Select */}
                <div className="lg:col-span-1">
                    <Label htmlFor="subject" className="font-semibold">Subject*</Label>
                    <Select value={subjectId} onValueChange={setSubjectId} required><SelectTrigger id="subject" className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{subjects.map(subject => (<SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>))}</SelectContent></Select>
                </div>

                {/* Level Input */}
                <div className="lg:col-span-1">
                    <Label htmlFor="level" className="font-semibold">Specific Level*</Label>
                    <Input id="level" type="text" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g., SS2, JAMB" required className="mt-1" />
                </div>

                {/* Date/Time Picker */}
                <div className="lg:col-span-1">
                    <Label htmlFor="preferred-time" className="font-semibold">Date & Time*</Label>
                    <Input id="preferred-time" type="datetime-local" value={preferredDateTimeLocal} onChange={(e) => setPreferredDateTimeLocal(e.target.value)} required className="mt-1" />
                </div>
                
                {/* Duration Select */}
                <div className="lg:col-span-1">
                    <Label htmlFor="duration" className="font-semibold">Duration*</Label>
                    <Select value={durationMinutes} onValueChange={setDurationMinutes} required>
                        <SelectTrigger id="duration" className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1 hour 30 mins</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="150">2 hours 30 mins</SelectItem>
                                <SelectItem value="180">3 hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 
                {/* Submit Button */}
                <div className="lg:col-span-1 flex items-end">
                    <Button type="submit" disabled={isPending} className="w-full py-2.5">
                        {isPending ? 'Searching...' : 'Find Teachers'}
                    </Button>
                </div>

                 {/* Optional criteria can be hidden in an "Advanced Search" section if needed */}
            </form>

            {/* --- Results Area --- */}
            <div className="mt-6">
               {error && <p className="text-red-500 ...">{error}</p>}
                {searchMessage && !error && searchResults.length === 0 && <p className="text-center ...">{searchMessage}</p>}
                 {!isPending && searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map(teacher => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                variant="searchResult" // Use the correct variant
                                searchCriteria={{
                                    subjectId,
                                    level: level.trim(),
                                    preferredTimeUTC: new Date(new Date(preferredDateTimeLocal).toISOString()),
                                    durationMinutes: parseInt(durationMinutes, 10)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


