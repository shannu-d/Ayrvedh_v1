import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate required fields in request body
 */
export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields,
      });
      return;
    }

    // Email validation
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }
    }

    // Password validation (minimum 6 characters)
    if (req.body.password && req.body.password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // OTP validation (6 digits)
    if (req.body.otp) {
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(req.body.otp)) {
        res.status(400).json({ message: 'OTP must be 6 digits' });
        return;
      }
    }

    // Purpose validation
    if (req.body.purpose) {
      const validPurposes = ['registration', 'login', 'password-reset'];
      if (!validPurposes.includes(req.body.purpose)) {
        res.status(400).json({
          message: 'Invalid purpose',
          validPurposes,
        });
        return;
      }
    }

    next();
  };
};
