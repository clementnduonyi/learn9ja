// src/components/settings/AvatarUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { getAvatarUploadUrl } from '@/app/actions/userActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud } from 'lucide-react';

interface AvatarUploadProps {
    initialUrl: string | null | undefined;
    // Callback to notify the parent form of the new public URL
    onUploadComplete: (newUrl: string) => void;
}

export default function AvatarUpload({ initialUrl, onUploadComplete }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsUploading(true);

        try {
            // 1. Get the signed URL from our server action
            const { success, error: urlError, uploadUrl, filePath } = await getAvatarUploadUrl(file.type, file.size);
            if (!success || !uploadUrl || !filePath) {
                throw new Error(urlError || "Failed to get upload URL.");
            }

            // 2. Upload the file directly to Supabase Storage using the signed URL
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });

            if (!response.ok) {
                throw new Error("File upload failed. Please try again.");
            }

            // 3. Construct the public URL for the newly uploaded file
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;

            // 4. Update preview state and notify the parent form component
            setPreview(publicUrl);
            onUploadComplete(publicUrl);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-5">
            <div className="relative">
                <Image
                    src={preview || '/avatars/default-other.svg'} // Fallback to a generic default
                    alt="Current Avatar"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover bg-gray-200 border-2 border-gray-300"
                    onError={(e) => { e.currentTarget.src = '/avatars/default-other.svg'; }}
                />
                 {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Change Avatar
                </Button>
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, or WEBP. Max 5MB.</p>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
}
