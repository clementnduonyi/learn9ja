import type { Subject, User, Role } from '@prisma/client'; // Import Role enum
import {Prisma, Booking } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import type { TeacherProfile, TeacherSubject } from '@prisma/client';


export interface CompleteUserProfileArgs {
  name: string;
  role: Role;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  bookingId?: string;
  url?: string;
  authorization_url?: string;
}

export type BookingWithSubjectName = Booking & {
  subject: { name: string };
};

// Input data structure expected by the action
export interface BookingRequestData {
  teacherUserId: string;
  subjectId: string;
  level: string;
  requestedTime: Date; 
  durationMinutes?: number; 
}

// Helper type for props passed to client component
export interface BookingCallDetails {
    bookingId: string;
    subjectName: string;
    level: string; // Pass as string for simplicity
    otherParticipantName: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date | null;
}

// Input structure for the search criteria
export interface SearchCriteria {
  subjectId: string;
  level: string;
  preferredTimeUTC: Date;
  durationMinutes?: number;
}

// Output structure for search results
export interface TeacherSearchResult {
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null; 
  averageRating: number | null;
   
}

export interface SearchActionResult {
  success: boolean;
  data?: TeacherSearchResult[];
  error?: string;
}

// Define expected input structure
export interface TeacherSubjectInput {
  subjectId: string;
  level: string;
}
export interface TeacherProfileUpdateData {
  bio?: string;
  availability?: JsonValue;
  subjects?: TeacherSubjectInput[];
  speacialization: string;
}

// Define interface for email data
export interface BookingRequestEmailData {
  to: string; // Teacher's email
  studentName: string;
  subjectName: string;
  level: string;
  requestedTime: Date;
  bookingId: string; // To create a link
}

// --- Interface for Response Email Data ---
export interface BookingResponseEmailData {
    to: string; // Student's email address
    studentName: string;
    teacherName: string;
    subjectName: string;
    level: string;
    requestedTime: Date; // The time the class was originally requested for
    status: 'ACCEPTED' | 'DECLINED'; // The outcome of the request
    bookingId: string; // To create a link back to the booking details
    // Optional: Include the video URL only if the booking was accepted AND generated
    videoRoomUrl?: string | null;
}

// --- Types (Copied/Adapted from parent) ---
export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export type WeeklyAvailability = {
  [key in 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun']?: TimeSlot[];
};

export interface AvailabilityEditorProps {
  initialAvailability: WeeklyAvailability;
  onChange: (newAvailability: WeeklyAvailability) => void; // Callback to parent
}

// --- Subject selector Types ---
export interface SelectedSubject {
  subjectId: string;
  level: string;
}

export interface SubjectSelectorProps {
  allSubjects: Subject[];
  initialSelection: SelectedSubject[];
  onChange: (newSelection: SelectedSubject[]) => void; // Callback to parent
}

// Define the shape of the data passed from the server page
export interface TeacherProfileFormProps {
  userId: string;
  initialProfile: (TeacherProfile & {
    subjectsTaught: Pick<TeacherSubject, 'subjectId' | 'levels'>[];
  }) | null;
  allSubjects: Subject[];
}

export type PendingBookingWithDetails = Booking & {
    student: Pick<User, 'name' | 'email'>;
    subject: Pick<Subject, 'name'>;
};

export interface TeacherRequestCardProps {
    booking: PendingBookingWithDetails;
    onResponse: (bookingId: string) => void; // Callback to update parent list
}


// Define the expected shape of booking data including relations
// Make sure this matches the data fetched in the parent page component
export type UpcomingBookingWithDetails = Booking & {
  student: Pick<User, 'name' | 'email'>; // Or add avatarUrl if needed/fetched
  subject: Pick<Subject, 'name'>;
};

export interface UpcomingBookingCardProps {
  booking: UpcomingBookingWithDetails;
  onResponse?: (bookingId: string) => void;
}



  // 1. Define Reusable Arguments using Prisma.validator (Corrected)
// Define the arguments for fetching student bookings with details
export const studentBookingArgs = Prisma.validator<Prisma.BookingDefaultArgs>()({
  include: {
    teacher: { // This relation links to the User model
      select: {
        // Select fields directly from the User model (the teacher)
        name: true,
        id: true,
      }
    },
    subject: { select: { name: true } },
    review: { select: { id: true } }, // Include review to check if one exists
  },
  
});

// Define the exact type returned by queries using studentBookingArgs
export type StudentBookingWithDetails = Prisma.BookingGetPayload<typeof studentBookingArgs>;
export type CompleteBookingWithDetails = Prisma.BookingGetPayload<typeof studentBookingArgs>;


// Define Validator Args and Type for this page's query
export const teacherBookingArgs = Prisma.validator<Prisma.BookingDefaultArgs>()({
  include: {
    student: { select: { id: true, name: true, email: true } }, // Include student details
    subject: { select: { name: true } },
  }
});
export type TeacherBookingWithDetails = Prisma.BookingGetPayload<typeof teacherBookingArgs>;


// Define the specific data needed for the general settings page
export const userSettingsArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
        id: true,
        name: true,
        gender: true,
        email: true, // Read-only, but useful context
        role: true, // Needed to conditionally show payment form
        avatarUrl: true,
        dob: true,
        phone: true,
        address: true, // Assuming JSON field for address
        paymentMethodDetails: true, // Student-specific payment info
        timezone: true,
        // NOTE: teacherProfile is NOT included here anymore
    }
});
// Define the type based on the selection
export type UserSettingsData = Prisma.UserGetPayload<typeof userSettingsArgs>;




export const teacherCardArgs = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true, // User ID
    name: true,
    avatarUrl: true,
    gender: true,
    location: true,
    subscriptionTier: true, // <<< Crucial for button logic
    teacherProfile: {
      select: {
        // Use a main specialization or the first one as the subtitle
        specializations: true,
        averageRating: true,
        pricePerHour: true,
        bio: true,
        availability: true,
        // We'll determine isAvailableNow separately, not from a DB field for now
      }
    },
    // We fetch the subjects taught separately or pass them transformed
  }
});

// 2. Define the exact type based on the arguments
export type TeacherForCard = Prisma.UserGetPayload<typeof teacherCardArgs> & {
    // Add non-model properties here
    subjects: string[]; // Pass a simple array of subject names
    isAvailableNow?: boolean; // Indicates real-time presence
};


// Define Validator Args and Type for fetching data needed by the form
export const teacherProfileEditArgs = Prisma.validator<Prisma.TeacherProfileDefaultArgs>()({
  // Select fields directly from TeacherProfile
  // Use 'include' for nested relations like subjectsTaught
  include: {
    subjectsTaught: { // Include the subjects taught by this teacher
      select: { // Select specific fields needed by the form
        subjectId: true,
        levels: true, // <<< Ensure we select the string array
      }
    }
    // No need to include 'user' here unless the form needs user.name etc.
    // which it currently doesn't directly use (userId is passed separately)
  }
});
// Define the type based on the validator for the initialProfile prop
// Note: This type is TeacherProfile & { subjectsTaught: ... }
export type TeacherProfileForEdit = Prisma.TeacherProfileGetPayload<typeof teacherProfileEditArgs>;


