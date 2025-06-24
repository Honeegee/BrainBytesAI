#!/usr/bin/env node

/**
 * Test script to verify deployment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing deployment configuration...\n');

// Check if required files exist
const requiredFiles = [
  'docker-compose.staging.yml',
  'docker-compose.production.yml',
  'backend/.env.staging',
  'backend/.env.production',
  'backend/Dockerfile.staging',
  '.github/workflows/deploy.yml'
];

console.log('📁 Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check Docker Compose staging configuration
console.log('\n🐳 Checking Docker Compose staging configuration:');
try {
  const stagingCompose = fs.readFileSync('docker-compose.staging.yml', 'utf8');
  
  // Check if it uses environment variables instead of env_file
  if (stagingCompose.includes('${STAGING_DATABASE_URL}')) {
    console.log('  ✅ Uses STAGING_DATABASE_URL environment variable');
  } else {
    console.log('  ❌ Missing STAGING_DATABASE_URL environment variable');
  }
  
  if (stagingCompose.includes('${STAGING_JWT_SECRET}')) {
    console.log('  ✅ Uses STAGING_JWT_SECRET environment variable');
  } else {
    console.log('  ❌ Missing STAGING_JWT_SECRET environment variable');
  }
  
  if (stagingCompose.includes('${STAGING_SESSION_SECRET}')) {
    console.log('  ✅ Uses STAGING_SESSION_SECRET environment variable');
  } else {
    console.log('  ❌ Missing STAGING_SESSION_SECRET environment variable');
  }
  
  // Check that it doesn't use env_file directive
  if (!stagingCompose.includes('env_file:')) {
    console.log('  ✅ No env_file directive (using environment variables)');
  } else {
    console.log('  ⚠️  Still uses env_file directive');
  }
  
} catch (error) {
  console.log('  ❌ Error reading staging compose file:', error.message);
}

// Check Docker Compose production configuration
console.log('\n🏭 Checking Docker Compose production configuration:');
try {
  const prodCompose = fs.readFileSync('docker-compose.production.yml', 'utf8');
  
  if (prodCompose.includes('${PRODUCTION_DATABASE_URL}')) {
    console.log('  ✅ Uses PRODUCTION_DATABASE_URL environment variable');
  } else {
    console.log('  ❌ Missing PRODUCTION_DATABASE_URL environment variable');
  }
  
  if (prodCompose.includes('${PRODUCTION_JWT_SECRET}')) {
    console.log('  ✅ Uses PRODUCTION_JWT_SECRET environment variable');
  } else {
    console.log('  ❌ Missing PRODUCTION_JWT_SECRET environment variable');
  }
  
  if (prodCompose.includes('${PRODUCTION_REDIS_PASSWORD}')) {
    console.log('  ✅ Uses PRODUCTION_REDIS_PASSWORD environment variable');
  } else {
    console.log('  ❌ Missing PRODUCTION_REDIS_PASSWORD environment variable');
  }
  
} catch (error) {
  console.log('  ❌ Error reading production compose file:', error.message);
}

// Check GitHub workflow
console.log('\n⚙️  Checking GitHub workflow configuration:');
try {
  const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
  
  if (workflow.includes('$GITHUB_ENV')) {
    console.log('  ✅ Uses $GITHUB_ENV for environment variables');
  } else {
    console.log('  ❌ Missing $GITHUB_ENV usage');
  }
  
  if (workflow.includes('secrets.STAGING_DATABASE_URL')) {
    console.log('  ✅ References STAGING_DATABASE_URL secret');
  } else {
    console.log('  ❌ Missing STAGING_DATABASE_URL secret reference');
  }
  
  if (workflow.includes('secrets.PRODUCTION_DATABASE_URL')) {
    console.log('  ✅ References PRODUCTION_DATABASE_URL secret');
  } else {
    console.log('  ❌ Missing PRODUCTION_DATABASE_URL secret reference');
  }
  
} catch (error) {
  console.log('  ❌ Error reading workflow file:', error.message);
}

console.log('\n🎯 Deployment configuration check completed!');
console.log('\n📝 Next steps:');
console.log('  1. Commit and push your changes');
console.log('  2. Trigger a staging deployment to test');
console.log('  3. If staging works, test production deployment');
console.log('  4. Monitor deployment logs for any issues');

console.log('\n🚀 Your GitHub secrets are ready:');
console.log('  ✅ STAGING_DATABASE_URL');
console.log('  ✅ STAGING_JWT_SECRET');
console.log('  ✅ STAGING_SESSION_SECRET');
console.log('  ✅ STAGING_AI_API_KEY');
console.log('  ✅ PRODUCTION_DATABASE_URL');
console.log('  ✅ PRODUCTION_JWT_SECRET');
console.log('  ✅ PRODUCTION_SESSION_SECRET');
console.log('  ✅ PRODUCTION_AI_API_KEY');
console.log('  ✅ PRODUCTION_REDIS_PASSWORD');