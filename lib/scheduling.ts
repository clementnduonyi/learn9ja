// src/lib/scheduling.ts

import type { JsonValue } from '@prisma/client/runtime/library';

/**
 * Checks if a teacher is available for a given time slot based on their availability JSON.
 * Assumes all times (in availability JSON and the requested time) are in UTC.
 * @param availabilityJson The teacher's availability object, e.g., {"mon": ["14:00-16:00"]}
 * @param requestedUtcDateTime The start time of the requested session (as a UTC Date object).
 * @param durationMinutes The duration of the requested session.
 * @returns {boolean} True if the teacher is available, false otherwise.
 */
export function isTeacherAvailable(
    availabilityJson: JsonValue | null | undefined,
    requestedUtcDateTime: Date,
    durationMinutes: number
): boolean {
    // 1. Validate input
    if (!availabilityJson || typeof availabilityJson !== 'object' || Array.isArray(availabilityJson)) {
        return false;
    }

    // 2. Determine day of the week and requested time slot in minutes from midnight
    const requestedDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][requestedUtcDateTime.getDay()];
    const availableSlots = (availabilityJson as Record<string, string[]>)[requestedDay];

    if (!availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
        return false; // No slots defined for this day
    }

    const requestedStartMinutes = requestedUtcDateTime.getHours() * 60 + requestedUtcDateTime.getMinutes();
    const requestedEndMinutes = requestedStartMinutes + durationMinutes;

    // 3. Check against each of the teacher's available slots for that day
    for (const slot of availableSlots) {
        try {
            const [startStr, endStr] = slot.split('-');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const [endHour, endMinute] = endStr.split(':').map(Number);

            const slotStartMinutes = startHour * 60 + startMinute;
            let slotEndMinutes = endHour * 60 + endMinute;

            // Handle slots ending exactly at midnight (e.g., 23:00-00:00)
             if (slotEndMinutes === 0 && slotStartMinutes >= 0) {
                 slotEndMinutes = 24 * 60; // Treat 00:00 as the end of the 24-hour cycle
             }
             // NOTE: This logic does not support slots that cross midnight (e.g., 22:00-02:00).

            // Check if the requested slot is fully contained within an available slot
            if (requestedStartMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes) {
                return true; // Found a matching slot
            }
        } catch (e) {
            console.error(`Could not parse availability slot "${slot}"`, e);
            continue; // Ignore malformed slots
        }
    }

    return false; // No suitable slot found
}
