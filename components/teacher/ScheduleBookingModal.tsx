// src/components/teachers/ScheduleBookingModal.tsx
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '../ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { initiatePayment } from '@/app/actions/bookingActions';
import { getTeacherSubjects } from '@/app/actions/teacherActions';

interface ScheduleModalProps { 
    isOpen: boolean;
    onClose: () => void;
    teacher: { id: string; name: string };
 }
type SubjectData = { 
    subjectId: string;
    subjectName: string;
    levels: string[];
 };

export default function ScheduleBookingModal({ isOpen, onClose, teacher }: ScheduleModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    // Form state
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [availableLevels, setAvailableLevels] = useState<string[]>([]);
    const [preferredDateTimeLocal, setPreferredDateTimeLocal] = useState('');
    const [duration, setDuration] = useState('60'); // <<< Ensure duration state exists

    // ... (useEffect logic to fetch subjects) ...
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
    

    const handleScheduleAndPay = () => {
        setError(null);
        if (!selectedSubjectId || !selectedLevel || !preferredDateTimeLocal) {
            setError("Please fill all required fields.");
            return;
        }
        const preferredTimeUTC = new Date(new Date(preferredDateTimeLocal).toISOString());

        startTransition(async () => {
            const result = await initiatePayment({
                teacherUserId: teacher.id,
                subjectId: selectedSubjectId,
                level: selectedLevel,
                requestedTime: preferredTimeUTC,
                durationMinutes: parseInt(duration, 10), // <<< Use selected duration
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
        <div className="fixed inset-0 ...">
            <div className="bg-white ...">
                <h2 className="text-xl font-bold">Schedule Session with {teacher.name}</h2>
                <div className="space-y-4 mt-6">
                    {/* Subject Select */}
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
                </div>
                 {/* Date/Time Picker */}
                <div>
                    <Label htmlFor="preferred-time">Preferred Date & Time* (Your Local)</Label>
                    <Input id="preferred-time" type="datetime-local" value={preferredDateTimeLocal} onChange={(e) => setPreferredDateTimeLocal(e.target.value)} required className="border-gray-300" />
                    <p className="text-xs text-gray-500 mt-1">We'll match based on UTC equivalent.</p>
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
                {/* Submit button and error display */}
                <Button onClick={handleScheduleAndPay} disabled={isPending || !preferredDateTimeLocal}>
                    Pay & Schedule
                </Button>
            </div>
        </div>
        
    );
}
