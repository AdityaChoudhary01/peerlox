import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside the Cloudflare/Deployment Dashboard.'
  );
}

/**
 * Global cache to prevent multiple connections during hot reloads or 
 * concurrent Serverless function invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // 🛠️ CLOUDFLARE & AZURE COSMOS DB OPTIMIZED OPTIONS
    // lib/db.js
    const opts = {
      bufferCommands: false,
      maxPoolSize: 2, // Keeps connections low across many Vercel functions
      minPoolSize: 0, // Allows idle connections to close, freeing up Azure slots
      maxIdleTimeMS: 10000, // Closes unused pipes quickly
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
      family: 4, 
    };
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('🚀 High-Octane DB Connection Established!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset the promise on failure so the next request can retry
    cached.promise = null;
    console.error('❌ Database Connection Error:', e.message);
    throw new Error('Database connection failed. Check your network whitelist or URI.');
  }

  return cached.conn;
}

export default connectDB;