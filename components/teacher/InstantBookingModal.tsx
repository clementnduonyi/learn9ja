// src/components/teachers/InstantBookingModal.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherSubjects } from '@/app/actions/teacherActions';
import { initiatePayment } from '@/app/actions/bookingActions';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: { id: string; name: string };
}

type SubjectData = {
    subjectId: string;
    subjectName: string;
    levels: string[];
};

export default function InstantBookingModal({ isOpen, onClose, teacher }: ModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // State for the form
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [availableLevels, setAvailableLevels] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [duration, setDuration] = useState('60'); // <<< Ensure duration state exists

    // Fetch this teacher's subjects when the modal opens
    useEffect(() => {
        if (isOpen) {
            getTeacherSubjects(teacher.id).then(result => {
                if (result.success && result.data) {
                    setSubjects(result.data);
                } else {
                    setError(result.error || "Failed to load subjects.");
                }
            });
        }
    }, [isOpen, teacher.id]);

    // When the user selects a subject, update the available levels
    useEffect(() => {
        const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId);
        setAvailableLevels(selectedSubject?.levels || []);
        setSelectedLevel(''); // Reset level when subject changes
    }, [selectedSubjectId, subjects]);


    const handleBookNow = () => {
        setError(null);
        if (!selectedSubjectId || !selectedLevel) {
            setError("Please select both a subject and a level.");
            return;
        }

        const bookingDetails = {
            teacherUserId: teacher.id,
            subjectId: selectedSubjectId,
            level: selectedLevel,
            requestedTime: new Date(), // Instant booking uses the current time
            durationMinutes: 60, // Default duration for instant class
        };

        startTransition(async () => {
            const result = await initiatePayment(bookingDetails);
            if (result.success && result.authorization_url) {
                // Redirect to Paystack
                window.location.href = result.authorization_url;
            } else {
                setError(result.error || "Could not start payment process.");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Book Instant Session</h2>
                    <p className="text-sm text-gray-500 mt-1">With {teacher.name}</p>
                </div>

                <div className="space-y-4 mt-6">
                    <div>
                        <Label htmlFor="subject-select">What subject do you need help with?</Label>
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} required>
                            <SelectTrigger id="subject-select"><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => <SelectItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="level-select">What is the level?</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedSubjectId} required>
                            <SelectTrigger id="level-select"><SelectValue placeholder="Select a level..." /></SelectTrigger>
                            <SelectContent>
                                {availableLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="schedule-duration">Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger id="schedule-duration"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1 hour 30 mins</SelectItem>
                                <SelectItem value="120">2 hour</SelectItem>
                                <SelectItem value="150">2 hour 30 mins</SelectItem>
                                <SelectItem value="180">3 hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                     {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <Button onClick={handleBookNow} disabled={isPending || !selectedLevel} className="w-full">
                        {isPending ? 'Redirecting to Payment...' : 'Pay & Book Now'}
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
                </div>
            </div>
        </div>
    );
}
