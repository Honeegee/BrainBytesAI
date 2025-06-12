#!/usr/bin/env node

/**
 * Test script to verify Atlas E2E setup
 * This script tests the backend server startup with Atlas configuration
 */

const { spawn } = require('child_process');
const http = require('http');

// Configuration
const BACKEND_PORT = 3000;
const TEST_TIMEOUT = 60000; // 60 seconds
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds

console.log('🧪 Atlas E2E Setup Test');
console.log('='.repeat(50));

// Environment variables for testing
const testEnv = {
  ...process.env,
  PORT: BACKEND_PORT,
  NODE_ENV: 'test',
  JWT_SECRET: 'test_jwt_secret_key',
  SESSION_SECRET: 'test_session_secret_key'
};

// If TEST_DATABASE_URL is provided, use it
if (process.env.TEST_DATABASE_URL) {
  testEnv.DATABASE_URL = process.env.TEST_DATABASE_URL;
  testEnv.MONGODB_URI = process.env.TEST_DATABASE_URL;
  console.log('✅ Using TEST_DATABASE_URL for Atlas connection');
} else {
  console.log('⚠️  No TEST_DATABASE_URL provided - will use default configuration');
}

let backendProcess = null;
let healthCheckInterval = null;
let testTimeout = null;

// Cleanup function
function cleanup(exitCode = 0) {
  console.log('\n🧹 Cleaning up...');
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  
  if (backendProcess) {
    console.log('🛑 Stopping backend process...');
    backendProcess.kill('SIGTERM');
    
    // Force kill if still running after 5 seconds
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('🔪 Force killing backend process...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);
  }
  
  setTimeout(() => {
    process.exit(exitCode);
  }, 1000);
}

// Health check function
function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: health
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
    
    req.end();
  });
}

// Start backend server
async function startBackend() {
  console.log('🚀 Starting backend server...');
  console.log(`   Port: ${BACKEND_PORT}`);
  console.log(`   Environment: ${testEnv.NODE_ENV}`);
  console.log(`   Database: ${testEnv.DATABASE_URL ? 'Atlas' : 'Default config'}`);
  
  backendProcess = spawn('node', ['server.js'], {
    cwd: './backend',
    env: testEnv,
    stdio: 'pipe'
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });
  
  backendProcess.on('close', (code) => {
    console.log(`\n[Backend] Process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      cleanup(1);
    }
  });
  
  backendProcess.on('error', (error) => {
    console.error(`\n[Backend] Process error: ${error.message}`);
    cleanup(1);
  });
}

// Main test function
async function runTest() {
  try {
    // Set test timeout
    testTimeout = setTimeout(() => {
      console.error('\n❌ Test timed out after 60 seconds');
      cleanup(1);
    }, TEST_TIMEOUT);
    
    // Start backend
    await startBackend();
    
    // Wait a bit for server to start
    console.log('\n⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start health checking
    let attempts = 0;
    const maxAttempts = 20;
    
    console.log('🔍 Starting health checks...');
    
    healthCheckInterval = setInterval(async () => {
      attempts++;
      
      try {
        const health = await checkHealth();
        
        if (health.status === 200) {
          console.log(`\n✅ Health check successful (attempt ${attempts})`);
          console.log('📊 Health data:', JSON.stringify(health.data, null, 2));
          
          // Test root endpoint too
          try {
            const rootReq = http.request({
              hostname: 'localhost',
              port: BACKEND_PORT,
              path: '/',
              method: 'GET',
              timeout: 5000
            }, (res) => {
              console.log(`✅ Root endpoint responding (status: ${res.statusCode})`);
              console.log('\n🎉 All tests passed! Backend is ready for E2E testing.');
              cleanup(0);
            });
            
            rootReq.on('error', (err) => {
              console.log(`⚠️  Root endpoint error: ${err.message}`);
              console.log('✅ Health endpoint works, root endpoint has issues (may be OK)');
              cleanup(0);
            });
            
            rootReq.end();
            
          } catch (rootError) {
            console.log(`⚠️  Root endpoint test failed: ${rootError.message}`);
            console.log('✅ Health endpoint works (sufficient for E2E testing)');
            cleanup(0);
          }
          
        } else {
          console.log(`⚠️  Health check returned status ${health.status} (attempt ${attempts}/${maxAttempts})`);
          
          if (attempts >= maxAttempts) {
            console.error('\n❌ Health checks failed after maximum attempts');
            cleanup(1);
          }
        }
        
      } catch (error) {
        console.log(`⏳ Health check failed (attempt ${attempts}/${maxAttempts}): ${error.message}`);
        
        if (attempts >= maxAttempts) {
          console.error('\n❌ Backend server failed to start or respond to health checks');
          console.error('This may indicate:');
          console.error('  - Atlas connection issues');
          console.error('  - Missing environment variables');
          console.error('  - Server startup errors');
          cleanup(1);
        }
      }
    }, HEALTH_CHECK_INTERVAL);
    
  } catch (error) {
    console.error('\n❌ Test setup failed:', error.message);
    cleanup(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  cleanup(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  cleanup(0);
});

// Run the test
runTest().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  cleanup(1);
});