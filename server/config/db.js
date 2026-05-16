const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to MongoDB.
 * - If MONGO_URI is a valid atlas/local string, connects to it.
 * - If invalid (like '<real mongodb atlas uri>'), falls back to an in-memory database
 *   so the project can run immediately for testing purposes.
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // Check if the URI is a placeholder or invalid
    if (!uri || uri.includes('<') || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      console.warn('⚠️  No valid MONGO_URI found in .env. Starting an in-memory MongoDB server for testing...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`✅  In-Memory MongoDB started at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,   // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    console.error(
      '\n📋  Atlas troubleshooting:\n' +
      '    1. Resume cluster at cloud.mongodb.com (free tier auto-pauses)\n' +
      '    2. Network Access → Add IP → 0.0.0.0/0 (allow all)\n' +
      '    3. Verify MONGO_URI credentials in server/.env\n'
    );
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
