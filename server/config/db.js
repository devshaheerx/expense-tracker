// config/db.js
import mongoose from "mongoose";

// Serverless functions can be invoked many times without a fresh process restart.
// Without caching, every invocation might try to open a NEW MongoDB connection,
// exhausting the connection pool and causing intermittent failures — exactly
// the "works sometimes, 500s other times" pattern. Caching on `global` persists
// across invocations within the same warm serverless instance.
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn; // reuse existing connection — no new handshake needed
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // fail faster than the default 30s if genuinely unreachable
      })
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // reset so the next invocation can retry cleanly
    throw error;
  }

  return cached.conn;
};

export default connectDB;
