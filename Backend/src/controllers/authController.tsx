import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { otpService } from '../services/otpService';
import { emailService } from '../services/emailService';

// Updated authController with MongoDB-based OTP verification
export const authController = {
  /**
   * POST /auth/register
   * Start registration - send OTP to email
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }

      // Create unverified user
      await userService.createUser({ name, email, password });

      // Generate and send OTP (Asynchronously for speed)
      const otp = otpService.generateOtp();
      await otpService.saveOtp(email, otp, 'registration');
      emailService.sendRegistrationOtp(email, otp);

      res.status(200).json({
        message: 'Registration initiated. Please verify your email.',
        email,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  },

  /**
   * POST /auth/verify-registration
   * Verify registration OTP and activate account
   */
  async verifyRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await otpService.verifyOtp(email, otp, 'registration');
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      // Verify user
      const user = await userService.verifyUser(email);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Generate token
      const token = userService.generateToken(user);

      res.status(200).json({
        message: 'Email verified successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify registration error:', error);
      res.status(500).json({ message: 'Verification failed' });
    }
  },

  /**
   * POST /auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await userService.findByEmailWithPassword(email);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check if verified
      if (!user.isVerified) {
        // Send new OTP (Asynchronously)
        const otp = otpService.generateOtp();
        await otpService.saveOtp(email, otp, 'registration');
        emailService.sendRegistrationOtp(email, otp);

        res.status(403).json({
          message: 'Please verify your email first',
          requiresVerification: true,
        });
        return;
      }

      // Generate token
      const token = userService.generateToken(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  },

  /**
   * POST /auth/login-otp
   * Request OTP for passwordless login
   */
  async requestLoginOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await userService.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
        return;
      }

      // Generate and send OTP (Asynchronously)
      const otp = otpService.generateOtp();
      await otpService.saveOtp(email, otp, 'login');
      emailService.sendLoginOtp(email, otp);

      res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
      console.error('Request login OTP error:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  },

  /**
   * POST /auth/verify-login-otp
   * Verify OTP and login
   */
  async verifyLoginOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await otpService.verifyOtp(email, otp, 'login');
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      // Get user
      const user = await userService.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Generate token
      const token = userService.generateToken(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify login OTP error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  },

  /**
   * POST /auth/forgot-password
   * Request password reset OTP
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await userService.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
        return;
      }

      // Generate and send OTP (Asynchronously)
      const otp = otpService.generateOtp();
      await otpService.saveOtp(email, otp, 'password-reset');
      emailService.sendPasswordResetOtp(email, otp);

      res.status(200).json({ message: 'Password reset OTP sent to your email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  },

  /**
   * POST /auth/reset-password
   * Reset password with OTP
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;

      // Verify OTP
      const isValid = await otpService.verifyOtp(email, otp, 'password-reset');
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      // Update password
      const user = await userService.updatePassword(email, newPassword);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  },

  /**
   * GET /auth/me
   * Get current user (protected)
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const user = await userService.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  },

  /**
   * POST /auth/resend-otp
   * Resend OTP for any purpose
   */
  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, purpose } = req.body;

      // Generate and send new OTP
      const otp = otpService.generateOtp();
      await otpService.saveOtp(email, otp, purpose);

      switch (purpose) {
        case 'registration':
          emailService.sendRegistrationOtp(email, otp);
          break;
        case 'login':
          emailService.sendLoginOtp(email, otp);
          break;
        case 'password-reset':
          emailService.sendPasswordResetOtp(email, otp);
          break;
      }

      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
  },

  /**
   * PATCH /auth/profile
   * Update logged-in user's name (protected)
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { name } = req.body;

      if (!name || name.trim().length < 2) {
        res.status(400).json({ message: 'Name must be at least 2 characters' });
        return;
      }

      const user = await userService.updateProfile(userId, { name: name.trim() });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  },

  /**
   * PATCH /auth/change-password
   * Change password for logged-in user (protected)
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Current and new password are required' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters' });
        return;
      }

      // Fetch user with password
      const user = await userService.findByEmailWithPassword(
        (await userService.findById(userId))?.email || ''
      );
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }

      // Update password
      await userService.updatePassword(user.email, newPassword);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  },
};
