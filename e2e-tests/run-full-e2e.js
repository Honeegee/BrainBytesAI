#!/usr/bin/env node

/**
 * Full E2E Test Runner
 * 
 * This script starts the necessary backend services and runs
 * the complete E2E test suite with real authentication.
 */

const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const sleep = promisify(setTimeout);

console.log('🚀 Starting Full E2E Test Suite...');
console.log('📋 This will start backend services and run real E2E tests');
console.log('');

// Configuration
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 3001;
const AI_SERVICE_PORT = 3002;

let backendProcess = null;
let frontendProcess = null;
let aiServiceProcess = null;

// Cleanup function
function cleanup() {
  console.log('🧹 Cleaning up processes...');
  
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
  
  if (frontendProcess) {
    frontendProcess.kill('SIGTERM');
    frontendProcess = null;
  }
  
  if (aiServiceProcess) {
    aiServiceProcess.kill('SIGTERM');
    aiServiceProcess = null;
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function startBackend() {
  console.log('🔧 Starting backend server...');
  
  const backendDir = path.join(__dirname, '..', 'backend');
  
  const env = {
    ...process.env,
    PORT: BACKEND_PORT,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/brainbytes_test',
    JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret_key_for_e2e',
    SESSION_SECRET: process.env.SESSION_SECRET || 'test_session_secret_key_for_e2e',
    NODE_ENV: 'test'
  };
  
  backendProcess = spawn('npm', ['start'], {
    cwd: backendDir,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });
  
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running')) {
      console.log('✅ Backend server started on port', BACKEND_PORT);
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error('Backend error:', data.toString());
  });
  
  // Wait for backend to start
  await sleep(5000);
  
  // Verify backend is running
  try {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:${BACKEND_PORT}/`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Backend returned status ${res.statusCode}`));
        }
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Backend health check timeout')));
      req.end();
    });
    console.log('✅ Backend health check passed');
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    throw error;
  }
}

async function runE2ETests() {
  console.log('🧪 Running E2E tests...');
  
  const env = {
    ...process.env,
    BASE_URL: `http://localhost:${FRONTEND_PORT}`,
    API_URL: `http://localhost:${BACKEND_PORT}`,
    NODE_ENV: 'test'
  };
  
  const args = [
    'playwright',
    'test',
    '--reporter=list,junit',
    '--output-dir=test-results'
  ];
  
  console.log(`🚀 Running: npx ${args.join(' ')}`);
  console.log('');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('npx', args, {
      stdio: 'inherit',
      env,
      cwd: __dirname,
      shell: true
    });
    
    testProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ E2E tests completed successfully!');
        resolve();
      } else {
        console.log('❌ E2E tests failed with exit code:', code);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('❌ Failed to start E2E tests:', error);
      reject(error);
    });
  });
}

async function main() {
  try {
    // Start backend
    await startBackend();
    
    // Run E2E tests
    await runE2ETests();
    
    console.log('🎉 Full E2E test suite completed successfully!');
    
  } catch (error) {
    console.error('❌ E2E test suite failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  cleanup();
  process.exit(1);
});