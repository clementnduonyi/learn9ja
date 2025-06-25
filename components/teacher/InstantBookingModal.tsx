
// src/components/teachers/InstantBookingModal.tsx
/*'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getTeacherSubjects } from '@/app/actions/teacherActions';
import { initiatePayment } from '@/app/actions/bookingActions';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { TeacherForCard } from '@/lib/types'; // Import main teacher type

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: TeacherForCard; // Use the full TeacherForCard type
}

type SubjectData = { subjectId: string; subjectName: string; levels: string[]; };

export default function InstantBookingModal({ isOpen, onClose, teacher }: ModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [availableLevels, setAvailableLevels] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [duration, setDuration] = useState('60'); // Default to 60 minutes
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

    // Fetch this teacher's subjects when the modal opens
    useEffect(() => {
        if (isOpen) {
            getTeacherSubjects(teacher.id).then(result => {
                if (result.success && result.data) setSubjects(result.data);
                else setError(result.error || "Failed to load subjects.");
            });
        }
    }, [isOpen, teacher.id]);

    // Update available levels when subject changes
    useEffect(() => {
        const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId);
        setAvailableLevels(selectedSubject?.levels || []);
        setSelectedLevel('');
    }, [selectedSubjectId, subjects]);

    // --- NEW: Real-time Price Calculation ---
    useEffect(() => {
        const pricePerHour = teacher.teacherProfile?.pricePerHour;
        if (pricePerHour !== null && pricePerHour !== undefined) {
            const rate = parseFloat(pricePerHour.toString());
            const total = (rate / 60) * parseInt(duration, 10);
            setCalculatedPrice(total);
        } else {
            setCalculatedPrice(0); // Treat as free if no rate is set
        }
    }, [duration, teacher.teacherProfile?.pricePerHour]);

    const handleBookNow = () => {
        setError(null);
        if (!selectedSubjectId || !selectedLevel) { /* ... validation ... * }

        startTransition(async () => {
            const result = await initiatePayment({
                teacherUserId: teacher.id,
                subjectId: selectedSubjectId,
                level: selectedLevel,
                requestedTime: new Date(),
                durationMinutes: parseInt(duration, 10),
            });
            if (result.success && result.authorization_url) {
                window.location.href = result.authorization_url;
            } else {
                setError(result.error || "Could not start payment.");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="bg-white p-6">
                <h2 className="text-xl font-bold">Book Instant Session with {teacher.name}</h2>
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
                        <Label htmlFor="instant-duration">Session Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger id="instant-duration"><SelectValue /></SelectTrigger>
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
                    {/* --- Display Calculated Price --- *}
                    {calculatedPrice !== null && (
                        <div className="text-center font-bold text-xl p-3 bg-gray-100 rounded-md">
                            Session Total: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(calculatedPrice)}
                        </div>
                    )}
                </div>
                <div className="mt-6 space-y-2">
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <Button onClick={handleBookNow} disabled={isPending || !selectedLevel}>
                        {isPending ? 'Redirecting...' : 'Pay & Book Now'}
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
                </div>
            </div>
        </div>
    );
}*/


// src/components/teachers/InstantBookingModal.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getTeacherSubjects } from '@/app/actions/teacherActions';
import { initiatePayment } from '@/app/actions/bookingActions';
import { Button } from '@/components/ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { TeacherForCard } from '@/lib/types';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: TeacherForCard;
}

type SubjectData = { subjectId: string; subjectName: string; levels: string[]; };

export default function InstantBookingModal({ isOpen, onClose, teacher }: ModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [availableLevels, setAvailableLevels] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [duration, setDuration] = useState('60');
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

    // Fetch this teacher's subjects when the modal opens
    useEffect(() => {
        if (isOpen && teacher.id) {
            getTeacherSubjects(teacher.id).then(result => {
                if (result.success && result.data) setSubjects(result.data);
                else setError(result.error || "Failed to load subjects.");
            });
        }
    }, [isOpen, teacher.id]);

    // Update available levels when subject changes
    useEffect(() => {
        const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId);
        setAvailableLevels(selectedSubject?.levels || []);
        setSelectedLevel('');
    }, [selectedSubjectId, subjects]);

    // Real-time Price Calculation
    useEffect(() => {
        const pricePerHour = teacher.teacherProfile?.pricePerHour;
        if (pricePerHour !== null && pricePerHour !== undefined) {
            const rate = parseFloat(pricePerHour.toString());
            const total = (rate / 60) * parseInt(duration, 10);
            setCalculatedPrice(total);
        } else {
            setCalculatedPrice(0);
        }
    }, [duration, teacher.teacherProfile?.pricePerHour]);

    const handleBookNow = () => {
        setError(null);
        if (!selectedSubjectId || !selectedLevel) {
            setError("Please select both a subject and a level.");
            return;
        }

        startTransition(async () => {
            const result = await initiatePayment({
                teacherUserId: teacher.id,
                subjectId: selectedSubjectId,
                level: selectedLevel,
                requestedTime: new Date(),
                durationMinutes: parseInt(duration, 10),
            });
            if (result.success && result.authorization_url) {
                window.location.href = result.authorization_url;
            } else {
                setError(result.error || "Could not start payment process.");
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-labelledby="instant-booking-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <div className="text-left">
                        <h2 id="instant-booking-title" className="text-xl font-bold text-gray-900 dark:text-white">Instant Session</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">with {teacher.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X size={20} />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="subject-select">Subject</Label>
                        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} required>
                            <SelectTrigger id="subject-select"><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                            <SelectContent>{subjects.map(s => <SelectItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="level-select">Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!selectedSubjectId} required>
                            <SelectTrigger id="level-select"><SelectValue placeholder="Select a level..." /></SelectTrigger>
                            <SelectContent>{availableLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="instant-duration">Session Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger id="instant-duration"><SelectValue /></SelectTrigger>
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
                    {calculatedPrice !== null && (
                        <div className="text-center font-bold text-2xl p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-300 block">Session Total</span>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(calculatedPrice)}
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-2">
                     {error && <p className="text-red-600 text-xs text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}
                    <Button onClick={handleBookNow} disabled={isPending || !selectedLevel} className="w-full text-lg py-3">
                        {isPending ? 'Redirecting...' : 'Pay & Book Now'}
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="w-full text-gray-600 dark:text-gray-300">Cancel</Button>
                </div>
            </div>
        </div>
    );
}


