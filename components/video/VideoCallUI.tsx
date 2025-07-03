
'use client';

import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
 // ControlBar, // If needed for custom layout
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookingCallDetails } from '@/lib/types';

// Props for the component
interface VideoCallUIProps {
    details: BookingCallDetails;
}

// Helper to format time locally
const formatLocalDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(undefined, { timeStyle: 'short' });
}

export default function VideoCallUI({ details }: VideoCallUIProps) {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [roomName, setRoomName] = useState<string | null>(null);
    const [connectUrl, setConnectUrl] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null); // Renamed error state

    useEffect(() => {
        // Retrieve connection details from session storage (as set by join button)
        const storedToken = sessionStorage.getItem('lk_token');
        const storedRoom = sessionStorage.getItem('lk_room');
        const storedUrl = sessionStorage.getItem('lk_url');

        // Validate if stored room matches the booking ID we are on (basic check)
        if (storedToken && storedRoom && storedUrl && storedRoom === details.bookingId) {
            setToken(storedToken);
            setRoomName(storedRoom); // Use booking ID as room name
            setConnectUrl(storedUrl);
            // Clear storage? Maybe not immediately, clear on disconnect/error instead.
        } else {
             setConnectionError("Could not retrieve valid connection details. Please try joining again from the dashboard.");
             console.error("Mismatch or missing session storage details for LiveKit.", {storedRoom, bookingId: details.bookingId});
        }
    }, [details.bookingId]); // Depend on bookingId from props

    const handleDisconnect = () => {
        console.log("Disconnected from LiveKit room:", roomName);
        // Clear storage on explicit disconnect
        sessionStorage.removeItem('lk_token');
        sessionStorage.removeItem('lk_room');
        sessionStorage.removeItem('lk_url');
        // Redirect back or to a feedback page etc.
        router.back(); // Go back to where they clicked "Join"
    };

    if (connectionError) {
        return <div className="flex items-center justify-center h-full text-red-600 bg-red-50 p-4">{connectionError}</div>;
    }

    if (!token || !connectUrl || !roomName) {
        return <div className="flex items-center justify-center h-full p-4">Loading Video Call...</div>; // Or a spinner
    }

    // --- Render UI with Details + Video ---
    return (
        <>
            {/* Sidebar/Header for Booking Info (Example Layout) */}
            <div className="w-full md:w-64 bg-gray-100 p-4 border-b md:border-b-0 md:border-r order-1 md:order-none flex-shrink-0">
                <h2 className="text-lg font-semibold mb-2">Session Details</h2>
                <div className="space-y-1 text-sm">
                    <p><strong>Subject:</strong> {details.subjectName} ({details.level})</p>
                    <p><strong>With:</strong> {details.otherParticipantName}</p>
                    <p>
                        <strong>Time:</strong>
                        {formatLocalDateTime(details.scheduledStartTime)}
                        {details.scheduledEndTime ? ` - ${formatLocalDateTime(details.scheduledEndTime)}` : ''}
                        <span className='text-xs text-gray-500'> (Your Local Time)</span>
                    </p>
                    {/* Add more details if needed */}
                </div>
                 <p className="text-xs text-gray-500 mt-4">ID: {details.bookingId}</p>
            </div>

            {/* Main Video Area */}
            <div className="flex-grow order-first md:order-none" data-lk-theme="default">
                 {/* Set height based on viewport minus potential header/footer */}
                 <div style={{ height: 'calc(100vh - 80px)' }} className="bg-black"> {/* Example height */}
                    <LiveKitRoom
                        serverUrl={connectUrl}
                        token={token}
                        connect={true}
                        video={true} // Enable video/audio inputs by default
                        audio={true}
                        onDisconnected={handleDisconnect}
                        options={{ adaptiveStream: true, dynacast: true }}
                    >
                        {/* Pre-built VideoConference UI */}
                        <VideoConference />
                        {/* Custom Controls can be added via ControlBar */}
                        {/*<ControlBar controls={{ microphone: true, camera: true, screenShare: true, leave: true }} /> */}
                    </LiveKitRoom>
                </div>
            </div>
        </>
    );
}