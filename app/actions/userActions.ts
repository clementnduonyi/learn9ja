// src/app/actions/userActions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

interface ActionResult {
    success: boolean;
    error?: string;
    uploadUrl?: string; // The secure URL for the client to upload to
    filePath?: string;  // The path of the file in the bucket
}

/**
 * Creates a secure, signed URL for uploading a user avatar to Supabase Storage.
 * @param fileType The MIME type of the file (e.g., 'image/png').
 * @param fileSize The size of the file in bytes.
 * @returns An object with the signed URL and file path, or an error.
 */
export async function getAvatarUploadUrl(fileType: string, fileSize: number): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Unauthorized: You must be logged in to upload an avatar.' };
    }

    // --- File Validation ---
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedFileTypes.includes(fileType)) {
        return { success: false, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
    }

    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    if (fileSize > maxFileSize) {
        return { success: false, error: 'File is too large. The maximum size is 5MB.' };
    }

    try {
        const fileExtension = fileType.split('/')[1];
        // Create a unique path for the file to prevent overwrites and caching issues
        const filePath = `avatars/${user.id}/${uuidv4()}.${fileExtension}`;

        // Generate the signed URL for upload. This is valid for a short time (e.g., 60 seconds).
        const { data, error } = await supabase.storage
            .from('avatars') // IMPORTANT: Ensure you have a bucket named 'avatars' in Supabase Storage.
            .createSignedUploadUrl(filePath);

        if (error) {
            console.error("Supabase storage error (createSignedUploadUrl):", error);
            throw new Error("Could not create a secure upload URL.");
        }

        return { success: true, uploadUrl: data.signedUrl, filePath: data.path };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: message };
    }
}
