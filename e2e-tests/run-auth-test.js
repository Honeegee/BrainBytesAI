#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔐 Testing Authentication Setup...');
console.log('');

// Check if we should skip web server
process.env.SKIP_WEBSERVER = 'true';

// Set appropriate base URLs
if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'http://localhost:3001'; // Frontend
}

if (!process.env.API_URL) {
  process.env.API_URL = 'http://localhost:3000'; // Backend API
}

console.log(`📋 Configuration:`);
console.log(`   Frontend URL: ${process.env.BASE_URL}`);
console.log(`   Backend URL: ${process.env.API_URL}`);
console.log('');
console.log('⚠️  Note: Make sure both frontend (port 3001) and backend (port 3000) servers are running');
console.log('');

try {
  // Run only the auth setup test
  console.log('🚀 Running authentication setup test...');
  execSync('npx playwright test --project=setup', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ Authentication setup completed successfully!');
  console.log('   Auth state saved to: playwright/.auth/user.json');
  console.log('');
  console.log('🎯 You can now run authenticated tests with:');
  console.log('   npm test');
  
} catch (error) {
  console.error('\n❌ Authentication setup failed');
  console.error('');
  console.error('🔍 Common issues:');
  console.error('   1. Frontend server not running on port 3001');
  console.error('   2. Backend server not running on port 3000');
  console.error('   3. Database connection issues');
  console.error('   4. Network connectivity problems');
  console.error('');
  console.error('💡 Try:');
  console.error('   - Start frontend: cd frontend && npm run dev');
  console.error('   - Start backend: cd backend && npm start');
  console.error('   - Check server logs for errors');
  
  process.exit(1);
}