// routes/authRoutes.js
import express from "express";
import passport from "../passport/passportConfig.js";
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  oauthCallback,
} from "../controllers/authController.js";
import {
  otpRequestLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", otpRequestLimiter, signup);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/resend-otp", otpRequestLimiter, resendOtp);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

// Step 1 of the redirect dance — browser navigates here directly (not axios),
// Passport redirects onward to Google/GitHub's actual login page.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Step 2 — Google/GitHub redirect back here after the user approves.
// Passport's middleware runs the strategy callback (the async function in
// passportConfig.js) BEFORE oauthCallback ever runs, populating req.user.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  oauthCallback,
);

router.get("/github", passport.authenticate("github", { session: false }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  oauthCallback,
);

export default router;
