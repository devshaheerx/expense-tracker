// utils/generateTokens.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

// Returns both the signed token AND the raw jti, since the caller needs the jti
// separately to save a matching RefreshToken document in the DB.
export const generateRefreshToken = (userId) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ userId, jti }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY,
  });
  return { token, jti };
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    // 'none' is required in production because your frontend and backend sit
    // on two different Vercel domains (cross-site). 'lax' is fine for local
    // dev since both run on localhost.
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Converts your JWT_REFRESH_EXPIRY ("7d") into a real Date for storing in the DB.
export const getRefreshTokenExpiryDate = () => {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRY, 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
