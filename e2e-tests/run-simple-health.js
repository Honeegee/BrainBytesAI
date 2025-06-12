#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 Running Simple Health Check Tests...\n');

// Set environment variables for the test
const env = {
  ...process.env,
  NODE_ENV: 'test',
  SKIP_AUTH_SETUP: 'true'
};

// Run the specific health check test
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';
const args = [
  'playwright',
  'test',
  'simple-health.spec.js',
  '--project=health-check',
  '--reporter=line'
];

const testProcess = spawn(command, args, {
  cwd: path.join(__dirname),
  env: env,
  stdio: 'inherit',
  shell: isWindows
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Simple Health Check completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Backend API connectivity: ✅');
    console.log('   - Frontend service availability: ✅');
    console.log('   - Environment configuration: ✅');
    console.log('   - Test framework functionality: ✅');
  } else {
    console.log('\n❌ Simple Health Check failed with some issues.');
    console.log('   Check the output above for details.');
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to run health check:', error.message);
  process.exit(1);
});