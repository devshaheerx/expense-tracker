import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiryDate,
} from "../utils/generateTokens.js";

const OTP_EXPIRY_MINUTES = 10;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Shared by local login/verify AND, later, OAuth callbacks.
// Creates a NEW session document — does not touch any other existing sessions,
// which is exactly what allows multiple devices to stay logged in simultaneously.
export const issueTokensForUser = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const { token: refreshToken, jti } = generateRefreshToken(user._id);

  await RefreshToken.create({
    user: user._id,
    jti,
    expiresAt: getRefreshTokenExpiryDate(),
  });

  return { accessToken, refreshToken };
};

export const signupUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser && existingUser.isVerified) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  let user;
  if (existingUser) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.otp = hashedOtp;
    existingUser.otpExpiry = otpExpiry;
    user = await existingUser.save();
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: "local",
      isVerified: false,
      otp: hashedOtp,
      otpExpiry,
    });
  }

  await sendOTPEmail(user.email, otp);

  return { email: user.email };
};

export const verifyUserOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+otp +otpExpiry",
  );

  if (!user || !user.otp || !user.otpExpiry) {
    throw new AppError("No pending verification found for this email", 400);
  }

  if (user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    throw new AppError("Invalid OTP", 400);
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const { accessToken, refreshToken } = await issueTokensForUser(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const resendUserOtp = async ({ email }) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError("No account found with this email", 404);
  }

  if (user.isVerified) {
    throw new AppError("This account is already verified", 400);
  }

  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  await sendOTPEmail(user.email, otp);
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.password) {
    throw new AppError(
      `This account uses ${user.authProvider} sign-in. Please log in with ${user.authProvider} instead.`,
      400,
    );
  }

  if (!user.isVerified) {
    const err = new AppError("Please verify your email before logging in", 403);
    err.email = user.email;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const { accessToken, refreshToken } = await issueTokensForUser(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

// Rotation: the incoming refresh token's session is deleted, a brand new one is issued.
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 403);
  }

  const session = await RefreshToken.findOne({
    jti: decoded.jti,
    user: decoded.userId,
  });

  if (!session) {
    // Token was valid JWT-wise, but its session was revoked (logged out, rotated already,
    // or "logout all" was used) — this is the moment a stolen-and-reused token gets caught.
    throw new AppError("Session expired or revoked. Please log in again.", 403);
  }

  await RefreshToken.deleteOne({ _id: session._id }); // rotate: kill the old session

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return issueTokensForUser(user); // issues a fresh session
};

// Logout THIS device only — deletes just the one session tied to the current cookie.
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await RefreshToken.deleteOne({ jti: decoded.jti, user: decoded.userId });
  } catch {
    // already invalid/expired — nothing to clean up
  }
};

// Logout ALL devices — deletes every session belonging to this user.
// Derives the user's identity from their own valid refresh token, since we don't
// have full auth middleware yet (that's Step 7) — but a valid refresh token is
// itself sufficient proof of identity for this action.
export const logoutAllUser = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 403);
  }

  await RefreshToken.deleteMany({ user: decoded.userId });
};

export const findOrCreateOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
  const idField = provider === 'google' ? 'googleId' : 'githubId';

  // 1. Already signed in with this exact provider before? Just log them in.
  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  // 2. No match on provider ID, but does an account with this email already exist?
  // This handles: user signed up with email/password first, now tries Google login
  // with the same email — we LINK the accounts instead of creating a duplicate.
  user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user[idField] = providerId;
    // OAuth providers already verify email ownership — safe to mark verified
    // even if this was previously an unverified local signup.
    user.isVerified = true;
    if (!user.avatar && avatar) user.avatar = avatar;
    await user.save();
    return user;
  }

  // 3. Brand new user entirely.
  user = await User.create({
    name,
    email: email.toLowerCase(),
    authProvider: provider,
    [idField]: providerId,
    avatar,
    isVerified: true, // provider already verified this email
  });

  return user;
};

// Add these two functions to authService.js

export const requestPasswordReset = async ({ email }) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Deliberately vague response whether or not the account exists — prevents
  // someone from using this endpoint to check which emails are registered
  // (a real security concern for password-reset flows specifically).
  if (!user) {
    return;
  }

  if (!user.password) {
    // OAuth-only account — there's no password to reset. We still don't reveal
    // this distinction to an unauthenticated caller, for the same reason as above.
    return;
  }

  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  await sendOTPEmail(user.email, otp, 'reset');
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  if (!email || !otp || !newPassword) {
    throw new AppError('Email, OTP, and new password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiry');

  if (!user || !user.otp || !user.otpExpiry) {
    throw new AppError('No password reset was requested for this email', 400);
  }

  if (user.otpExpiry < new Date()) {
    throw new AppError('Code has expired. Please request a new one.', 400);
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    throw new AppError('Invalid code', 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Security best practice: invalidate every existing session on password reset.
  // If someone else had unauthorized access, this locks them out immediately.
  await RefreshToken.deleteMany({ user: user._id });
};

export { AppError };
