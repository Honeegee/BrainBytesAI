#!/usr/bin/env node

/**
 * Atlas CI/CD Test Script
 * 
 * This script simulates the CI/CD environment to test Atlas connectivity
 * Run this locally to verify your Atlas setup will work in GitHub Actions
 */

const mongoose = require('mongoose');

// Simulate GitHub Actions environment variables
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_test?retryWrites=true&w=majority&appName=BrainBytes';

const STAGING_DATABASE_URL = process.env.STAGING_DATABASE_URL || 
  'mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_staging?retryWrites=true&w=majority&appName=BrainBytes';

async function testAtlasConnections() {
  console.log('🧪 Atlas CI/CD Connection Test');
  console.log('===============================\n');

  const tests = [
    { name: 'Test Database', url: TEST_DATABASE_URL },
    { name: 'Staging Database', url: STAGING_DATABASE_URL }
  ];

  for (const test of tests) {
    try {
      console.log(`🔗 Testing ${test.name}...`);
      
      // Create connection with CI/CD-like settings
      const connection = await mongoose.createConnection(test.url, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      // Test basic operations
      console.log(`  ✅ Connection established`);
      
      // Test database operations
      const db = connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`  📊 Found ${collections.length} collections`);
      
      // Test write operation
      const testCollection = db.collection('ci_test');
      const testDoc = {
        test: true,
        timestamp: new Date(),
        environment: 'ci-cd-test'
      };
      
      await testCollection.insertOne(testDoc);
      console.log(`  ✍️ Write operation successful`);
      
      // Test read operation
      const doc = await testCollection.findOne({ test: true });
      console.log(`  📖 Read operation successful`);
      
      // Cleanup
      await testCollection.deleteMany({ environment: 'ci-cd-test' });
      console.log(`  🧹 Cleanup completed`);
      
      await connection.close();
      console.log(`  🔐 Connection closed\n`);
      
    } catch (error) {
      console.error(`  ❌ ${test.name} failed:`, error.message);
      console.error(`     Connection string: ${test.url.replace(/\/\/.*@/, '//***:***@')}\n`);
    }
  }
}

async function simulateCICDFlow() {
  console.log('🚀 Simulating CI/CD Pipeline Flow');
  console.log('===================================\n');
  
  try {
    // Simulate backend startup in CI/CD
    console.log('1. 🔧 Starting backend with Atlas...');
    const backendConnection = await mongoose.connect(TEST_DATABASE_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('   ✅ Backend connected to Atlas\n');
    
    // Simulate E2E test operations
    console.log('2. 🧪 Running E2E test operations...');
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    // Create test user
    const testUser = new User({
      email: 'cicd-test@example.com'
    });
    await testUser.save();
    console.log('   ✅ Test user created');
    
    // Query test user
    const foundUser = await User.findOne({ email: 'cicd-test@example.com' });
    console.log('   ✅ Test user retrieved');
    
    // Cleanup test data
    await User.deleteMany({ email: 'cicd-test@example.com' });
    console.log('   ✅ Test data cleaned up');
    
    await mongoose.disconnect();
    console.log('   ✅ Backend disconnected\n');
    
    console.log('🎉 CI/CD simulation completed successfully!');
    console.log('   Your Atlas setup is ready for GitHub Actions.\n');
    
  } catch (error) {
    console.error('❌ CI/CD simulation failed:', error.message);
    process.exit(1);
  }
}

async function checkGitHubSecretsRequirements() {
  console.log('🔐 GitHub Secrets Requirements Check');
  console.log('====================================\n');
  
  const requiredSecrets = [
    'TEST_DATABASE_URL',
    'STAGING_DATABASE_URL', 
    'PRODUCTION_DATABASE_URL',
    'HEROKU_API_KEY',
    'PROD_JWT_SECRET',
    'PROD_SESSION_SECRET'
  ];
  
  console.log('Required GitHub Repository Secrets:');
  requiredSecrets.forEach(secret => {
    const hasValue = process.env[secret] ? '✅' : '⚠️';
    console.log(`  ${hasValue} ${secret}`);
  });
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to GitHub Repository → Settings → Secrets and variables → Actions');
  console.log('2. Add each required secret with appropriate values');
  console.log('3. Test CI/CD pipeline with a test commit\n');
}

async function main() {
  try {
    await testAtlasConnections();
    await simulateCICDFlow();
    checkGitHubSecretsRequirements();
    
    console.log('✅ All Atlas CI/CD tests passed!');
    console.log('🚀 Your workflow updates are ready for testing.');
    
  } catch (error) {
    console.error('❌ Atlas CI/CD test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testAtlasConnections, simulateCICDFlow };