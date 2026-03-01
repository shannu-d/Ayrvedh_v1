import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Registration
router.post('/register', validateRequest(['name', 'email', 'password']), authController.register);
router.post('/verify-registration', validateRequest(['email', 'otp']), authController.verifyRegistration);

// Login with password
router.post('/login', validateRequest(['email', 'password']), authController.login);

// Login with OTP (passwordless)
router.post('/login-otp', validateRequest(['email']), authController.requestLoginOtp);
router.post('/verify-login-otp', validateRequest(['email', 'otp']), authController.verifyLoginOtp);

// Password reset
router.post('/forgot-password', validateRequest(['email']), authController.forgotPassword);
router.post('/reset-password', validateRequest(['email', 'otp', 'newPassword']), authController.resetPassword);

// Resend OTP
router.post('/resend-otp', validateRequest(['email', 'purpose']), authController.resendOtp);

// Protected routes (require login)
router.get('/me', authMiddleware, authController.getMe);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.patch('/change-password', authMiddleware, authController.changePassword);

export default router;

