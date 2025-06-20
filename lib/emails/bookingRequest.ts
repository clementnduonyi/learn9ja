
import { createTransporter } from '@/lib/emails/utility';
import nodemailer from 'nodemailer';
import { BookingRequestEmailData } from '../types';



// Function to send the specific booking request email
export async function sendBookingRequestEmail(data: BookingRequestEmailData): Promise<boolean> {
    try {
        const transporter = await createTransporter();
        // If transporter is null (e.g., missing prod config and decided not to throw)
        if (!transporter) return false;

        const { to, studentName, level, requestedTime, } = data;

        // Construct the link to the request (adjust route as needed)
        const requestLink = `<span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_APP\_URL\}/teacher/requests/</span>{bookingId}`;

        // Simple email content (consider using HTML templates later)
        const subject = `New Class Request: <span class="math-inline">\{subjectName\} \(</span>{level})`;
        const textContent = `Hello,\n\nYou have received a new class request from ${studentName} for <span class="math-inline">\{subjectName\} \(</span>{level}) at ${requestedTime.toLocaleString()}.\n\nPlease review the request here: ${requestLink}\n\nThanks,\nDemirite Team`;
        const htmlContent = `
            <p>Hello,</p>
            <p>You have received a new class request from <strong><span class="math-inline">\{studentName\}</strong\> for <strong\></span>{subjectName} (${level})</strong> at <span class="math-inline">\{requestedTime\.toLocaleString\(\)\}\.</p\>
            <p>Please review the request by clicking the link below:</p>
            <p><a href="{requestLink}">View Request</a></p>
            <p>Thanks,<br/>Demirite Team</p>
            `;

        const mailOptions = {
            from: process.env.EMAIL_FROM, // Sender address (configured in .env)
            to: to,                       // Teacher's email address
            subject: subject,
            text: textContent,            // Plain text body
            html: htmlContent,            // HTML body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);

        // Log preview URL if using Ethereal
        if (process.env.NODE_ENV === 'development' && nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL (Ethereal): %s', nodemailer.getTestMessageUrl(info));
        // IMPORTANT: You MUST click this URL in your console to see the test email
        }

        return true; // Indicate success

    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Indicate failure
    }
}