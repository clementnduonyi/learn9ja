// src/lib/scheduling.ts

// <<< 'use server'; directive has been REMOVED from this file. >>>
// These are regular helper functions, not Server Actions.

import type { JsonValue } from '@prisma/client/runtime/library';

const MINIMUM_SESSION_DURATION = 30; // Minimum minutes required for an instant session

/**
 * Checks if a teacher is available for an instant session starting NOW.
 * It verifies if the current time falls within any scheduled slot and if there's
 * enough time left in that slot for a minimum session.
 * @param availabilityJson The teacher's availability object stored in UTC, e.g., {"mon": ["14:00-16:00"]}
 * @returns {boolean} True if the teacher is available for an instant session, false otherwise.
 */
export function isTeacherAvailableNow(
    availabilityJson: JsonValue | null | undefined
): boolean {
    if (!availabilityJson || typeof availabilityJson !== 'object' || Array.isArray(availabilityJson)) {
        return false;
    }

    const now = new Date(); // Current time in UTC
    const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getUTCDay()];
    const availableSlots = (availabilityJson as Record<string, string[]>)[currentDay];

    if (!availableSlots || !Array.isArray(availableSlots)) {
        return false;
    }

    const nowInMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    for (const slot of availableSlots) {
        try {
            const [startStr, endStr] = slot.split('-');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const [endHour, endMinute] = endStr.split(':').map(Number);

            const slotStartMinutes = startHour * 60 + startMinute;
            let slotEndMinutes = endHour * 60 + endMinute;
            if (slotEndMinutes === 0) slotEndMinutes = 24 * 60;

            // Check if current time is within the slot AND there's enough time left for a minimum session
            if (nowInMinutes >= slotStartMinutes && (nowInMinutes + MINIMUM_SESSION_DURATION) <= slotEndMinutes) {
                return true; // Teacher is available now!
            }
        } catch (e) {
            console.error(`Could not parse availability slot "${slot}"`, e);
            continue;
        }
    }

    return false; // Not available in any slot right now
}


/**
 * Checks if a teacher is available for a SCHEDULED session at a specific future time.
 * @param availabilityJson The teacher's availability object stored in UTC.
 * @param requestedUtcDateTime The start time of the requested session (as a UTC Date object).
 * @param durationMinutes The duration of the requested session.
 * @returns {boolean} True if the teacher is available, false otherwise.
 */
export function isTeacherAvailableForScheduled(
    availabilityJson: JsonValue | null | undefined,
    requestedUtcDateTime: Date,
    durationMinutes: number
): boolean {
    if (!availabilityJson || typeof availabilityJson !== 'object' || Array.isArray(availabilityJson)) return false;
    const requestedDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][requestedUtcDateTime.getUTCDay()];
    const availableSlots = (availabilityJson as Record<string, string[]>)[requestedDay];
    if (!availableSlots || !Array.isArray(availableSlots)) return false;
    const requestedStartMinutes = requestedUtcDateTime.getUTCHours() * 60 + requestedUtcDateTime.getUTCMinutes();
    const requestedEndMinutes = requestedStartMinutes + durationMinutes;
    for (const slot of availableSlots) {
        try {
            const [startStr, endStr] = slot.split('-');
            const [startHour, startMinute] = startStr.split(':').map(Number);
            const [endHour, endMinute] = endStr.split(':').map(Number);
            const slotStartMinutes = startHour * 60 + startMinute;
            let slotEndMinutes = endHour * 60 + endMinute;
            if (slotEndMinutes === 0) slotEndMinutes = 24 * 60;
            if (requestedStartMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes) return true;
        } catch { continue; }
    }
    return false;
}
