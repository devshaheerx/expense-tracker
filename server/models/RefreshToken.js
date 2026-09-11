import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // A random unique ID embedded inside the JWT itself — not the token string.
    // Storing the jti (not the whole signed token) is fine to keep in plaintext:
    // it's just a session identifier, not a secret. The actual secret is the JWT
    // signature, which never leaves the user's httpOnly cookie.
    jti: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB automatically deletes documents once expiresAt passes.
// This keeps the collection from growing forever with dead sessions.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.add({
  expiresAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.model('RefreshToken', refreshTokenSchema);