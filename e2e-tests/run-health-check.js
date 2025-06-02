#!/usr/bin/env node

const { execSync } = require('child_process');

// Set environment variable to skip web server
process.env.SKIP_WEBSERVER = 'true';

// Set base URL to a common development URL
if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'http://localhost:3000';
}

console.log('Running health check tests...');
console.log(`Base URL: ${process.env.BASE_URL}`);
console.log('Note: Make sure your frontend application is running on the specified URL');

try {
  // Run only health check tests
  execSync('npx playwright test --project=health-check', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ Health check tests completed successfully!');
} catch (error) {
  console.error('\n❌ Health check tests failed');
  process.exit(1);
}