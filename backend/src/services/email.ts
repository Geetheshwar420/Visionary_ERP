import nodemailer from 'nodemailer';

// Email configuration
// For development, you can use a test account from Ethereal or a real Gmail account with App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'no-reply@visionaryerp.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

/**
 * Send verification email with OTP
 */
export const sendVerificationEmail = async (email: string, code: string) => {
    const mailOptions = {
        from: '"Visionary ERP" <no-reply@visionaryerp.com>',
        to: email,
        subject: 'Visionary ERP - Verify Your Email',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to Visionary ERP!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Thank you for joining our platform. To complete your registration, please enter the following verification code in the application:
        </p>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This code will expire in 10 minutes. If you didn't request this email, please ignore it.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          &copy; 2024 Visionary ERP. All rights reserved.
        </p>
      </div>
    `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Verification email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Error sending verification email:', error);
        // Even if it fails, we return success: false so we know it didn't send
        return { success: false, error };
    }
};
