import type { Gender } from '@prisma/client';

// Helper to get appropriate avatar URL
export function getDisplayAvatar(avatarUrl: string | null | undefined, gender: Gender | null | undefined): string {
    if (avatarUrl) {
        return avatarUrl; // Use uploaded avatar if available
    }
    // Return default based on gender
    switch (gender) {
        case 'MALE':
            return '/avatars/default-male.svg';
        case 'FEMALE':
            return '/avatars/default-female.svg';
        case 'OTHER':
        default:
            return '/avatars/default-other.png'; // Fallback generic avatar
    }
}
