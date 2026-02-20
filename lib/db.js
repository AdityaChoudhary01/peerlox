import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // 🛠️ AZURE COSMOS DB OPTIMIZED OPTIONS
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1, // Keeps 1 connection warm for fast Serverless boots
      maxIdleTimeMS: 120000, // Closes connections after 2 mins before Azure drops them at 4 mins
      serverSelectionTimeoutMS: 5000, // Fail fast if the database is unreachable
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ New Azure Cosmos DB connection established!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Azure DB Connection Error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;