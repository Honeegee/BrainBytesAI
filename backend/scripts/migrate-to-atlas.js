#!/usr/bin/env node

/**
 * MongoDB Atlas Migration Script
 *
 * This script helps migrate data from your local MongoDB to MongoDB Atlas.
 * It can also be used to backup/restore data between different environments.
 *
 * Usage:
 *   node scripts/migrate-to-atlas.js [source] [target]
 *
 * Examples:
 *   node scripts/migrate-to-atlas.js development staging
 *   node scripts/migrate-to-atlas.js local production
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { getDatabaseConfig } = require('../config/database');
const UserProfile = require('../models/userProfile');

const migrateData = async (sourceEnv, targetEnv) => {
  let sourceConnection, targetConnection;

  try {
    console.log(`🚀 Starting migration from ${sourceEnv} to ${targetEnv}`);

    // Get source configuration
    process.env.NODE_ENV = sourceEnv;
    const sourceConfig = getDatabaseConfig();

    if (!sourceConfig.uri) {
      throw new Error(
        `No database URI configured for source environment: ${sourceEnv}`
      );
    }

    // Get target configuration
    process.env.NODE_ENV = targetEnv;
    const targetConfig = getDatabaseConfig();

    if (!targetConfig.uri) {
      throw new Error(
        `No database URI configured for target environment: ${targetEnv}`
      );
    }

    console.log(
      `📡 Source: ${sourceConfig.uri.replace(/\/\/.*@/, '//***:***@')}`
    );
    console.log(
      `📡 Target: ${targetConfig.uri.replace(/\/\/.*@/, '//***:***@')}`
    );

    // Create connections
    console.log('🔌 Connecting to source database...');
    sourceConnection = await mongoose.createConnection(
      sourceConfig.uri,
      sourceConfig.options
    );

    console.log('🔌 Connecting to target database...');
    targetConnection = await mongoose.createConnection(
      targetConfig.uri,
      targetConfig.options
    );

    // Get models for both connections
    const SourceUserProfile = sourceConnection.model(
      'UserProfile',
      UserProfile.schema
    );
    const TargetUserProfile = targetConnection.model(
      'UserProfile',
      UserProfile.schema
    );

    // Migrate UserProfiles
    console.log('👥 Migrating user profiles...');
    const sourceUsers = await SourceUserProfile.find({});
    console.log(
      `📊 Found ${sourceUsers.length} user profiles in source database`
    );

    if (sourceUsers.length > 0) {
      // Clear target collection (optional - comment out if you want to merge)
      await TargetUserProfile.deleteMany({});
      console.log('🗑️  Cleared target user profiles collection');

      // Insert users to target
      const result = await TargetUserProfile.insertMany(sourceUsers);
      console.log(`✅ Successfully migrated ${result.length} user profiles`);
    }

    // Add migration for other collections here as needed
    // Example for messages, learning materials, etc.

    console.log('✅ Migration completed successfully!');

    // Verify migration
    const targetUserCount = await TargetUserProfile.countDocuments();
    console.log(
      `🔍 Verification: ${targetUserCount} user profiles in target database`
    );
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Ensure both source and target databases are accessible');
    console.error('2. Check your environment configuration files');
    console.error('3. Verify network connectivity to MongoDB Atlas');
    process.exit(1);
  } finally {
    // Close connections
    if (sourceConnection) {
      await sourceConnection.close();
      console.log('🔌 Source connection closed');
    }

    if (targetConnection) {
      await targetConnection.close();
      console.log('🔌 Target connection closed');
    }
  }
};

const backupData = async environment => {
  try {
    console.log(`💾 Creating backup for environment: ${environment}`);

    process.env.NODE_ENV = environment;
    const config = getDatabaseConfig();

    const connection = await mongoose.createConnection(
      config.uri,
      config.options
    );
    const UserProfile = connection.model(
      'UserProfile',
      require('../models/userProfile').schema
    );

    const users = await UserProfile.find({});

    const backup = {
      timestamp: new Date().toISOString(),
      environment: environment,
      data: {
        userProfiles: users,
      },
    };

    const fs = require('fs');
    const backupFileName = `backup-${environment}-${Date.now()}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup created: ${backupFileName}`);
    console.log(`📊 Backed up ${users.length} user profiles`);

    await connection.close();
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 1) {
  // Single argument = backup mode
  backupData(args[0]);
} else if (args.length === 2) {
  // Two arguments = migration mode
  migrateData(args[0], args[1]);
} else {
  console.log('Usage:');
  console.log('  Backup: node scripts/migrate-to-atlas.js [environment]');
  console.log('  Migrate: node scripts/migrate-to-atlas.js [source] [target]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/migrate-to-atlas.js development');
  console.log('  node scripts/migrate-to-atlas.js development staging');
  process.exit(1);
}
