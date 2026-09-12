// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Not authenticated. Please log in." });
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      // Distinguish expired vs invalid — the frontend's Axios interceptor (Step 8)
      // will specifically watch for this exact message to know when to call
      // /refresh-token automatically, versus a tampered/garbage token which
      // should force a full re-login instead.
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Invalid access token" });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // now available to every route handler after this middleware
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong during authentication" });
  }
};
