// src/components/profile/AvailabilityEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

// --- Type Definitions ---
// Represents the structured state for a single time slot in the UI
interface TimeSlot {
  startHour: string; startMinute: string; startPeriod: 'AM' | 'PM';
  endHour: string; endMinute: string; endPeriod: 'AM' | 'PM';
}

// Represents the component's internal state for the whole week
type WeeklyAvailability = {
  [key in 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun']?: TimeSlot[];
};

interface AvailabilityEditorProps {
  initialAvailabilityJson: unknown;
  onAvailabilityChange: (newAvailabilityJson: Record<string, string[]>) => void;
}

// A simple type for a parsed time object
interface SimpleTime {
    hour: string;
    minute: string;
    period: 'AM' | 'PM';
}

// --- Helper Functions ---
// Converts a "HH:mm" (24-hour) string from the DB into our SimpleTime object
const parseTimeSlot = (timeStr: string): SimpleTime | null => {
    try {
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12; // Midnight is 12 AM
        return {
            hour: hour.toString().padStart(2, '0'),
            minute: minute.toString().padStart(2, '0'),
            period: period as 'AM' | 'PM'
        };
    } catch {
        return null;
    }
};

// Converts our SimpleTime object back to a "HH:mm" (24-hour) string for saving
const formatTimeSlot = (slot: SimpleTime): string | null => {
    if (!slot.hour || !slot.minute || !slot.period) return null;
    let hour = parseInt(slot.hour, 10);
    if (slot.period === 'PM' && hour !== 12) hour += 12;
    if (slot.period === 'AM' && hour === 12) hour = 0; // Midnight case
    return `${hour.toString().padStart(2, '0')}:${slot.minute}`;
};

// --- Component ---
export default function AvailabilityEditor({ initialAvailabilityJson, onAvailabilityChange }: AvailabilityEditorProps) {
    const [availability, setAvailability] = useState<WeeklyAvailability>({});

    // Parse the initial JSON from the server into our component's state structure
    useEffect(() => {
        if (typeof initialAvailabilityJson !== 'object' || initialAvailabilityJson === null || Array.isArray(initialAvailabilityJson)) {
            return;
        }
        const parsedState: WeeklyAvailability = {};
        const availabilityObject = initialAvailabilityJson as Record<string, unknown>;

        for (const day of Object.keys(availabilityObject)) {
            const slots = availabilityObject[day];
            if (Array.isArray(slots)) {
                parsedState[day as keyof WeeklyAvailability] = slots.map(slotStr => {
                    if (typeof slotStr !== 'string') return null;
                    const [start, end] = slotStr.split('-');
                    const parsedStart = parseTimeSlot(start);
                    const parsedEnd = parseTimeSlot(end);
                    if (parsedStart && parsedEnd) {
                        return {
                            startHour: parsedStart.hour, startMinute: parsedStart.minute, startPeriod: parsedStart.period,
                            endHour: parsedEnd.hour, endMinute: parsedEnd.minute, endPeriod: parsedEnd.period,
                        };
                    }
                    return null;
                }).filter((s): s is TimeSlot => s !== null);
            }
        }
        setAvailability(parsedState);
    }, [initialAvailabilityJson]);

    // When component state changes, format it back to JSON and notify the parent form
    useEffect(() => {
        const newJson: Record<string, string[]> = {};
        for (const day of Object.keys(availability)) {
            const slots = availability[day as keyof WeeklyAvailability];
            if (slots) {
                newJson[day] = slots.map(slot => {
                    const start = formatTimeSlot({ hour: slot.startHour, minute: slot.startMinute, period: slot.startPeriod });
                    const end = formatTimeSlot({ hour: slot.endHour, minute: slot.endMinute, period: slot.endPeriod });
                    return (start && end) ? `${start}-${end}` : null;
                }).filter((s): s is string => s !== null);
            }
        }
        onAvailabilityChange(newJson);
    }, [availability, onAvailabilityChange]);

    const handleSlotChange = (day: keyof WeeklyAvailability, index: number, field: keyof TimeSlot, value: string) => {
        setAvailability(prev => {
            const daySlots = JSON.parse(JSON.stringify(prev[day] ?? []));
            if (daySlots[index]) {
                daySlots[index][field] = value;
            }
            return { ...prev, [day]: daySlots };
        });
    };

    const addSlot = (day: keyof WeeklyAvailability) => {
        const newSlot: TimeSlot = { startHour: '09', startMinute: '00', startPeriod: 'AM', endHour: '05', endMinute: '00', endPeriod: 'PM' };
        setAvailability(prev => ({ ...prev, [day]: [...(prev[day] ?? []), newSlot] }));
    };

    const removeSlot = (day: keyof WeeklyAvailability, index: number) => {
        setAvailability(prev => ({ ...prev, [day]: (prev[day] ?? []).filter((_, i) => i !== index) }));
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    const periods = ['AM', 'PM'];
    const daysOfWeek: (keyof WeeklyAvailability)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return (
        <div>
            <Label className="text-lg font-semibold">Weekly Availability</Label>
            <p className="text-sm text-gray-500 mb-3">Set your regular time slots. Times are based on the timezone in your account settings.</p>
            <div className="space-y-4">
                {daysOfWeek.map((day) => (
                    <div key={day} className="p-4 border rounded-lg bg-white">
                        <h4 className="font-medium capitalize mb-3">{day}</h4>
                        {(availability[day] ?? []).map((slot, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2 items-center mb-2">
                                <div className="grid grid-cols-3 gap-1">
                                    <Select value={slot.startHour} onValueChange={v => handleSlotChange(day, index, 'startHour', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{hours.map(h => <SelectItem key={`start-h-${h}`} value={h}>{h}</SelectItem>)}</SelectContent></Select>
                                    <Select value={slot.startMinute} onValueChange={v => handleSlotChange(day, index, 'startMinute', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{minutes.map(m => <SelectItem key={`start-m-${m}`} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                                    <Select value={slot.startPeriod} onValueChange={v => handleSlotChange(day, index, 'startPeriod', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{periods.map(p => <SelectItem key={`start-p-${p}`} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="grid grid-cols-4 gap-1 items-center">
                                    <span className="text-center">-</span>
                                    <Select value={slot.endHour} onValueChange={v => handleSlotChange(day, index, 'endHour', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{hours.map(h => <SelectItem key={`end-h-${h}`} value={h}>{h}</SelectItem>)}</SelectContent></Select>
                                    <Select value={slot.endMinute} onValueChange={v => handleSlotChange(day, index, 'endMinute', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{minutes.map(m => <SelectItem key={`end-m-${m}`} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                                    <Select value={slot.endPeriod} onValueChange={v => handleSlotChange(day, index, 'endPeriod', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{periods.map(p => <SelectItem key={`end-p-${p}`} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(day, index)} className="text-red-500 hover:bg-red-50 h-8 w-8 ml-1"><X size={16}/></Button>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addSlot(day)} className="mt-2">+ Add Time Slot</Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
