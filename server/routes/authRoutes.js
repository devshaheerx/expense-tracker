import express from 'express';
import passport from '../passport/passportConfig.js';
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  oauthCallback,
  getMe, // new
} from '../controllers/authController.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';
import { forgotPassword, resetUserPassword } from '../controllers/authController.js';


const router = express.Router();

router.post('/signup', otpRequestLimiter, signup);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/resend-otp', otpRequestLimiter, resendOtp);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, resetUserPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  oauthCallback
);
router.get('/github', passport.authenticate('github', { session: false }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  oauthCallback
);

router.get('/me', protect, getMe);

export default router;