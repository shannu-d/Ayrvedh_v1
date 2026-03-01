import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailService = {
  /**
   * Send OTP email for registration
   */
  async sendRegistrationOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Verify your Ayurvedh account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Welcome to Ayurvedh!</h2>
          <p>Thank you for registering. Please use the following OTP to verify your email:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${otp}</span>
          </div>
          <p>This OTP is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // Always log OTP in development as a fallback
    console.log(`📧 [DEV] Registration OTP for ${email}: ${otp}`);

    if (!env.SMTP_USER) return; // No email configured, OTP is in console

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Registration OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send registration OTP email (check SMTP settings):', emailError);
      console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
      // Do NOT re-throw — registration still succeeds, user gets OTP from console
    }
  },

  /**
   * Send OTP email for login
   */
  async sendLoginOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Your Ayurvedh login code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Login to Ayurvedh</h2>
          <p>Use the following OTP to complete your login:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${otp}</span>
          </div>
          <p>This OTP is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, your account may be at risk.</p>
        </div>
      `,
    };

    console.log(`📧 [DEV] Login OTP for ${email}: ${otp}`);

    if (!env.SMTP_USER) return;

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Login OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send login OTP email:', emailError);
      console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    }
  },

  /**
   * Send OTP email for password reset
   */
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Reset your Ayurvedh password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5016;">Password Reset Request</h2>
          <p>Use the following OTP to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${otp}</span>
          </div>
          <p>This OTP is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    console.log(`📧 [DEV] Password Reset OTP for ${email}: ${otp}`);

    if (!env.SMTP_USER) return;

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset OTP email:', emailError);
      console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    }
  },
};
