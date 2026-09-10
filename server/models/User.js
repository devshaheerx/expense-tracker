import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Only set for local (email/password) signups.
    // undefined for OAuth users — login logic checks "if (!user.password) reject local login attempt"
    password: {
      type: String,
      select: false, // never returned by default on queries — must explicitly .select('+password')
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      required: true,
    },

    // sparse: true is critical — without it, Mongo's unique index treats every
    // document missing this field as having the SAME value (undefined), and your
    // second local-auth signup fails with a duplicate key error.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: '',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;