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
    
    // Provide specific troubleshooting advice based on error type
    if (error.name === 'MongooseServerSelectionError') {
      console.error(
        '\n📋  Atlas Connection Troubleshooting:\n' +
        '    1. IP Whitelist: Go to MongoDB Atlas -> Network Access -> Add IP -> Allow Access from Anywhere (0.0.0.0/0).\n' +
        '    2. Cluster Paused: Check if your cluster is paused at cloud.mongodb.com and resume it.\n' +
        '    3. Credentials: Check if your MONGO_URI contains the correct username and password.\n'
      );
    } else if (error.message.includes('Authentication failed')) {
      console.error('❌  Authentication failed: Please check the username and password in your MONGO_URI.');
    }

    if (process.env.NODE_ENV === 'production') {
      console.error('🛑  CRITICAL: Database connection failed in production. Exiting process...');
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in non-production mode despite DB failure. Some features may not work.');
    }
  }
};

module.exports = connectDB;
