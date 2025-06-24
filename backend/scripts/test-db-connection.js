#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * This script helps test your MongoDB Atlas connection configuration.
 * Usage:
 *   node scripts/test-db-connection.js [environment]
 *
 * Examples:
 *   node scripts/test-db-connection.js staging
 *   node scripts/test-db-connection.js production
 *   NODE_ENV=staging node scripts/test-db-connection.js
 */

const { connectDatabase, getDatabaseConfig } = require('../config/database');
const mongoose = require('mongoose');

const testConnection = async environment => {
  try {
    // Load environment-specific .env file
    if (environment) {
      process.env.NODE_ENV = environment;
      // Load the specific environment file
      require('dotenv').config({ path: `.env.${environment}` });
    } else {
      require('dotenv').config();
    }

    const config = getDatabaseConfig();
    const env = process.env.NODE_ENV || 'development';

    console.log(`🔍 Testing MongoDB connection for environment: ${env}`);
    console.log(
      `📡 Connection URI: ${config.uri ? config.uri.replace(/\/\/.*@/, '//***:***@') : 'Not configured'}`
    );

    if (!config.uri) {
      console.error('❌ No database URI configured for this environment');
      console.log(
        '\n💡 Make sure you have set the appropriate environment variables:'
      );
      console.log('   - For development: LOCAL_DATABASE_URL');
      console.log('   - For staging: STAGING_DATABASE_URL');
      console.log('   - For production: PROD_DATABASE_URL');
      process.exit(1);
    }

    // Test connection
    await connectDatabase();

    // Test basic operations
    console.log('🧪 Testing basic database operations...');

    // Test if we can list collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      `📊 Found ${collections.length} collections:`,
      collections.map(c => c.name)
    );

    // Test a simple query (if users collection exists)
    const userCollectionExists = collections.some(
      c => c.name === 'userprofiles' || c.name === 'users'
    );
    if (userCollectionExists) {
      const UserProfile = require('../models/userProfile');
      const userCount = await UserProfile.countDocuments();
      console.log(`👥 Total users in database: ${userCount}`);
    }

    console.log('✅ Database connection test successful!');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your connection string format');
    console.error('2. Verify username and password in MongoDB Atlas');
    console.error('3. Ensure IP address is whitelisted (0.0.0.0/0 for Heroku)');
    console.error('4. Confirm the database name in your connection string');

    process.exit(1);
  }
};

// Get environment from command line argument
const environment = process.argv[2];

// Run the test
testConnection(environment);
