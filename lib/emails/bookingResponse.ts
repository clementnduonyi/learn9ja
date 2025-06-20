import { createTransporter } from "./utility";
import nodemailer from 'nodemailer';
import { BookingResponseEmailData } from "../types";



// --- Function to send the booking response email to the student ---
export async function sendBookingResponseEmail(data: BookingResponseEmailData): Promise<boolean> {
    try {
        const transporter = await createTransporter();
        // If createTransporter could return null on config error, handle it:
        if (!transporter) {
            console.error("Email transporter not available for booking response.");
            return false;
        }

        const { to, studentName, teacherName, subjectName, level, requestedTime, status, bookingId, videoRoomUrl } = data;

        // Format time nicely for the email (adjust locale/options as desired)
        const formattedTime = requestedTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        // Construct link to where student views their bookings (adjust route as needed)
        const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL}/student/bookings/${bookingId}`;

        let emailSubject = '';
        let htmlBody = '';
        let textBody = '';

        if (status === 'ACCEPTED') {
            emailSubject = `Booking Confirmed: ${subjectName} with ${teacherName}`;
            textBody = `Hello ${studentName},\n\nGreat news! Your class request for ${subjectName} (${level}) with ${teacherName} at ${formattedTime} has been confirmed.\n\n`;
            htmlBody = `
                <p>Hello ${studentName},</p>
                <p>Great news! Your class request for <strong>${subjectName} (${level})</strong> with <strong>${teacherName}</strong> at <strong>${formattedTime}</strong> has been confirmed.</p>
            `;

            // Add video link if available
            if (videoRoomUrl) {
                textBody += `You can join the session using this link (shortly before start time): ${videoRoomUrl}\n\n`;
                htmlBody += `<p>You can join the session using this link (shortly before the start time): <a href="${videoRoomUrl}" target="_blank">Join Video Call</a></p>`;
            } else {
                 // Fallback message if video link isn't ready/available yet
                 textBody += `Check the booking details page closer to the time for information on how to join the session.\n\n`;
                 htmlBody += `<p>Check the booking details page closer to the time for information on how to join the session.</p>`;
            }

            textBody += `View booking details: ${bookingLink}\n\nWe look forward to seeing you!\nYour App Team`;
            htmlBody += `<p><a href="${bookingLink}">View Booking Details</a></p><p>We look forward to seeing you!<br/>Demirite Team</p>`;

        } else { // status === 'DECLINED'
            emailSubject = `Booking Update: Request for ${subjectName} with ${teacherName}`;
            textBody = `Hello ${studentName},\n\nRegarding your class request for ${subjectName} (${level}) with ${teacherName} at ${formattedTime}, the teacher was unfortunately unable to accept this specific request.\n\nYou may wish to search for other available times or teachers.\n\nView booking details: ${bookingLink}\n\nRegards,\nDemirite Team`;
            htmlBody = `
                <p>Hello ${studentName},</p>
                <p>Regarding your class request for <strong>${subjectName} (${level})</strong> with <strong>${teacherName}</strong> at <strong>${formattedTime}</strong>, the teacher was unfortunately unable to accept this specific request.</p>
                <p>You may wish to search for other available times or teachers.</p>
                <p><a href="${bookingLink}">View Booking Details</a></p>
                <p>Regards,<br/>Demirite Team</p>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to, // Student's email address
            subject: emailSubject,
            text: textBody,
            html: htmlBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking response email sent: %s', info.messageId);

        // Log preview URL if using Ethereal in development
        if (process.env.NODE_ENV === 'development' && nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL (Ethereal - Student Response Email): %s', nodemailer.getTestMessageUrl(info));
        }

        return true; // Indicate success

    } catch (error) {
        console.error('Error sending booking response email:', error);
        return false; // Indicate failure
    }
}