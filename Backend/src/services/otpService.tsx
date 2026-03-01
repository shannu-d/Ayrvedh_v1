import crypto from 'crypto';
import { Otp } from '../models/Otp';
import { env } from '../config/env';

// MongoDB-based OTP service (replaces in-memory storage)
export const otpService = {
  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Save OTP to MongoDB database
   */
  async saveOtp(
    email: string,
    otp: string,
    purpose: 'registration' | 'login' | 'password-reset'
  ): Promise<void> {
    // Remove any existing OTP for this email and purpose
    await Otp.deleteMany({ email, purpose });

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save new OTP to MongoDB
    await Otp.create({
      email,
      otp,
      purpose,
      expiresAt,
    });
  },

  /**
   * Verify OTP from MongoDB
   */
  async verifyOtp(
    email: string,
    otp: string,
    purpose: 'registration' | 'login' | 'password-reset'
  ): Promise<boolean> {
    const otpRecord = await Otp.findOne({
      email,
      otp,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return false;
    }

    // Delete the OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return true;
  },

  /**
   * Delete all OTPs for an email
   */
  async deleteOtps(email: string): Promise<void> {
    await Otp.deleteMany({ email });
  },
};
