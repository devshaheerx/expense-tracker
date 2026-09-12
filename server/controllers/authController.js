import { issueTokensForUser } from '../services/authService.js';
import {
  signupUser,
  verifyUserOtp,
  resendUserOtp,
  loginUser,
  refreshUserToken,
  logoutUser,
  logoutAllUser,
} from "../services/authService.js";
import { setAuthCookies } from "../utils/generateTokens.js";

const handleError = (res, error) => {
  console.error(error.message);
  const status = error.statusCode || 500;
  const body = {
    message: error.statusCode ? error.message : "Something went wrong",
  };
  if (error.email) body.email = error.email;
  res.status(status).json(body);
};

export const signup = async (req, res) => {
  try {
    const result = await signupUser(req.body);
    res
      .status(201)
      .json({
        message:
          "Signup successful. Check your email for the verification code.",
        ...result,
      });
  } catch (error) {
    handleError(res, error);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await verifyUserOtp(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: "Email verified successfully", user });
  } catch (error) {
    handleError(res, error);
  }
};

export const resendOtp = async (req, res) => {
  try {
    await resendUserOtp(req.body);
    res.status(200).json({ message: "A new verification code has been sent" });
  } catch (error) {
    handleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await loginUser(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    handleError(res, error);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await refreshUserToken(
      req.cookies.refreshToken,
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    handleError(res, error);
  }
};

export const logout = async (req, res) => {
  try {
    await logoutUser(req.cookies.refreshToken);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

export const logoutAll = async (req, res) => {
  try {
    await logoutAllUser(req.cookies.refreshToken);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out of all devices successfully" });
  } catch (error) {
    handleError(res, error);
  }
};


// GET /api/auth/google/callback and /api/auth/github/callback both use this.
// By the time this runs, Passport has already done the OAuth handshake and
// attached the found/created user to req.user.
export const oauthCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await issueTokensForUser(req.user);
    setAuthCookies(res, accessToken, refreshToken);

    // Redirect the BROWSER back into your React app now that cookies are set.
    // This is the moment control returns to your frontend after the OAuth detour.
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// GET /api/auth/me — protected by the `protect` middleware, so req.user is
// already guaranteed to exist and be verified by the time this code runs.
export const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
    },
  });
};