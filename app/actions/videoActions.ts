'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { AccessToken } from 'livekit-server-sdk'; // Import LiveKit server SDK

// Define return type
interface JoinTokenResult {
  success: boolean;
  error?: string;
  roomName?: string;
  token?: string;
  wsUrl?: string; // Pass the websocket URL to the client
}

// Environment variable validation (optional but good practice)
const livekitApiKey = process.env.LIVEKIT_API_KEY;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
const livekitWsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL; // Public URL for client connection

if (!livekitApiKey || !livekitApiSecret || !livekitWsUrl) {
  console.error('LiveKit environment variables are not configured.');
  // Avoid throwing here ideally, handle lack of config in function
}

export async function getJoinToken(bookingId: string): Promise<JoinTokenResult> {
  // Check if LiveKit config is missing
   if (!livekitApiKey || !livekitApiSecret || !livekitWsUrl) {
       return { success: false, error: 'Video service is not configured on the server.' };
   }

  const supabase = await createClient();

  // 1. Get User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized: User not authenticated.' };
  }
  const userId = user.id;

  try {
    // 2. Fetch Booking & Validate User/Status/Time
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        studentUserId: true,
        teacherUserId: true,
        status: true,
        requestedTime: true,
        endTimeUtc: true,
        // videoRoomId: true, // Use bookingId as room name for simplicity unless stored separately
      }
    });

    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    // 3. Authorization Check
    if (userId !== booking.studentUserId && userId !== booking.teacherUserId) {
      return { success: false, error: 'Forbidden: You are not part of this booking.' };
    }

    // 4. Status Check
    if (booking.status !== BookingStatus.ACCEPTED) {
      return { success: false, error: `Cannot join booking: Status is ${booking.status}.` };
    }

    // 5. Time Check (Optional but recommended)
    const now = new Date();
    const startTime = new Date(booking.requestedTime);
    const endTime = booking.endTimeUtc ? new Date(booking.endTimeUtc) : null;
    // Allow joining e.g., 10 minutes before start up to 15 minutes after end
    const joinWindowStart = new Date(startTime.getTime() - 10 * 60000);
    const joinWindowEnd = endTime ? new Date(endTime.getTime() + 15 * 60000) : null; // None if no end time

    if (now < joinWindowStart) {
         return { success: false, error: `Too early to join. Session starts at ${startTime.toLocaleTimeString()}.` };
    }
    // Check end time only if it exists
    if (joinWindowEnd && now > joinWindowEnd) {
        return { success: false, error: 'This session has already ended.' };
    }


    // 6. Determine Room Name (Using bookingId is simple and unique)
    const roomName = bookingId;

    // 7. Fetch User's Name for LiveKit Participant Identity
     const userProfile = await prisma.user.findUnique({
         where: { id: userId },
         select: { name: true }
     });
     const participantName = userProfile?.name || user.email || userId; // Fallback name


    // 8. Generate LiveKit Token
    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: userId, // Unique ID for the participant (Supabase User ID)
      name: participantName, // Display name in the video call
    });

    // Define permissions
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true, // Allow publishing audio/video
      canSubscribe: true, // Allow subscribing to others
      // More granular permissions are possible
    });

    // Set token validity (e.g., 1 hour)
    at.ttl = '1h';

    const token = await at.toJwt();

    console.log(`Generated LiveKit token for user ${userId} for room ${roomName}`);

    // 9. Return Success with necessary info for client
    return {
      success: true,
      roomName: roomName,
      token: token,
      wsUrl: livekitWsUrl // Pass the connection URL
    };

  } catch (error) {
    console.error(`Error generating join token for booking ${bookingId}:`, error);
     if (error instanceof Error) {
          return { success: false, error: error.message || 'Failed to generate join token.' };
        }

      // Fallback for non-Error types
      return { success: false, error: "An unknown error occurred while generating join token. Try again!" };
  }
}