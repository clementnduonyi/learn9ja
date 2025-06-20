// src/components/profile/AvailabilityEditor.tsx

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WeeklyAvailability, AvailabilityEditorProps } from '@/lib/types'



// --- Component ---
export default function AvailabilityEditor({
  initialAvailability,
  onChange,
}: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(initialAvailability);

  // Notify parent component when availability changes
  useEffect(() => {
    onChange(availability);
  }, [availability, onChange]);

  // --- Handlers (scoped to this component) ---
  const handleAvailabilityChange = useCallback((day: keyof WeeklyAvailability, index: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => {
      const daySlots = [...(prev[day] ?? [])];
      if (daySlots[index]) {
        daySlots[index] = { ...daySlots[index], [field]: value };
      }
      return { ...prev, [day]: daySlots };
    });
  }, []);

  const addAvailabilitySlot = useCallback((day: keyof WeeklyAvailability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...(prev[day] ?? []), { start: '', end: '' }],
    }));
  }, []);

  const removeAvailabilitySlot = useCallback((day: keyof WeeklyAvailability, index: number) => {
    setAvailability(prev => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((_, i) => i !== index),
    }));
  }, []);

  const daysOfWeek: (keyof WeeklyAvailability)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // --- Render ---
  return (
     // Wrap the entire availability section in a styled container
     <div className="p-4 border rounded-lg shadow-sm bg-gray-50"> {/* Added container with background */}
     <Label className="text-lg font-semibold mb-3 block"> {/* Made label block */}
         Weekly Availability (in UTC Timezone)
     </Label>
     <p className="text-sm text-gray-500 mb-4"> {/* Increased bottom margin */}
         Set your regular available time slots for each day. Times should be entered in 24-hour format (e.g., 16:00 for 4 PM) and are assumed to be in UTC.
     </p>
     <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-auto space-y-4"> {/* This div now nests the days */}
       {daysOfWeek.map((day) => (
         // Removed individual borders from days, rely on outer container
         <div key={day} className="p-3 bg-white rounded shadow-xs"> {/* Optional: Slight inner background */}
           <h4 className="font-medium capitalize mb-3">{day}</h4>
           {(availability[day] ?? []).map((slot, index) => (
             <div key={index} className="flex items-center space-x-2 mb-2">
               {/* Input fields and remove button remain the same */}
                <Input
                   type="time"
                   aria-label={`${day} start time ${index + 1}`}
                   value={slot.start}
                   onChange={(e) => handleAvailabilityChange(day, index, 'start', e.target.value)}
                   className="w-32 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                   required={true}
                />
                <span>-</span>
                <Input
                   type="time"
                   aria-label={`${day} end time ${index + 1}`}
                   value={slot.end}
                   onChange={(e) => handleAvailabilityChange(day, index, 'end', e.target.value)}
                   className="w-32 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                   required={true}
                />
                <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   onClick={() => removeAvailabilitySlot(day, index)}
                   aria-label={`Remove ${day} time slot ${index + 1}`}
                   className="text-red-600 hover:bg-red-50"
                >
                   Remove
                </Button>
             </div>
           ))}
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={() => addAvailabilitySlot(day)}
             className="mt-2"
           >
             + Add Time Slot for {day.charAt(0).toUpperCase() + day.slice(1)}
           </Button>
         </div>
       ))}
     </div>
   </div> // End of wrapping container
  );
}

// Export the type for parent component if needed (optional)
export type { WeeklyAvailability };