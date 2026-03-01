import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: 'registration' | 'login' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'password-reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - document auto-deletes when expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
otpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
