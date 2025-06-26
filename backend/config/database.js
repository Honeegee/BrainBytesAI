const mongoose = require('mongoose');

const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      // Use Atlas for development (Atlas-only approach)
      uri:
        process.env.DATABASE_URL ||
        process.env.MONGODB_URI ||
        process.env.LOCAL_DATABASE_URL ||
        'mongodb://localhost:27017/brainbytes',
      options: {
        // MongoDB Atlas optimized settings for development
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },

    staging: {
      // Use Atlas for staging
      uri: process.env.STAGING_DATABASE_URL,
      options: {
        // MongoDB Atlas optimized settings
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },

    production: {
      // Use Atlas for production
      uri: process.env.PROD_DATABASE_URL,
      options: {
        // Production MongoDB Atlas settings
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },

    test: {
      // Use in-memory MongoDB for testing
      uri:
        process.env.TEST_DATABASE_URL ||
        'mongodb://localhost:27017/brainbytes_test',
      options: {
        // Test environment settings
      },
    },
  };

  return configs[env];
};

const connectDatabase = async () => {
  try {
    const config = getDatabaseConfig();

    // Fallback to legacy environment variables if new ones aren't set
    let connectionUri = config.uri;

    if (!connectionUri) {
      console.log(
        'No database URI found in config, falling back to legacy environment variables...'
      );

      // Legacy fallback logic from your original server.js
      connectionUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

      if (!connectionUri) {
        const mongoUser =
          process.env.STAGING_MONGO_USER || process.env.MONGO_USER;
        const mongoPassword =
          process.env.STAGING_MONGO_PASSWORD || process.env.MONGO_PASSWORD;
        const mongoHost = process.env.MONGO_HOST || 'mongo';
        const mongoPort = process.env.MONGO_PORT || '27017';
        const mongoDb = process.env.MONGO_DB || 'brainbytes_staging';

        if (mongoUser && mongoPassword) {
          connectionUri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
        } else {
          connectionUri = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;
        }
      }
    }

    if (!connectionUri) {
      throw new Error('No database connection URI could be determined');
    }

    console.log(
      'Connecting to MongoDB:',
      connectionUri.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
    );

    await mongoose.connect(connectionUri, config.options);
    console.log(`✅ MongoDB connected successfully (${process.env.NODE_ENV})`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Starting server without database connection...');
    // Don't exit in development, allow server to start
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = { connectDatabase, getDatabaseConfig };
