
import nodemailer from 'nodemailer';

// Create the transporter based on environment
export async function createTransporter() {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal for development - generates preview emails
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('Using Ethereal for email testing...');
      console.log('Ethereal Credentials:', testAccount.user, testAccount.pass);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // Generated ethereal user
          pass: testAccount.pass, // Generated ethereal password
        },
      });
    } catch (error) {
       console.error("Failed to create Ethereal test account:", error);
       // Fallback or throw error if Ethereal fails
       throw new Error("Could not create email transporter for development.");
    }

  } else {
    // Use production SMTP settings from environment variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {
      console.error('Production email environment variables are not fully configured.');
      // In production, you might want to throw an error or use a default no-op transporter
      // to prevent crashes but log the issue.
      throw new Error("Production email settings are missing.");
      // return null; // Or return null/dummy transporter
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // Usually true if port is 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
}
