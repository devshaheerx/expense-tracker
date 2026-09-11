import rateLimit from "express-rate-limit";

export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signup/resend attempts per IP per window
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // slightly higher — legitimate typos happen
  message: {
    message: "Too many verification attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
