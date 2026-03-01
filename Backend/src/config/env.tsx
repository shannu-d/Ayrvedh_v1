import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ayurvedh',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ayurvedh.com',

  // OTP configuration
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),

  // Groq AI
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
};
