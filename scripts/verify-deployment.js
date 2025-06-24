#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script checks if all services are responding properly
 * without requiring additional dependencies
 */

const http = require('http');

const SERVICES = [
  { name: 'Frontend', url: 'http://localhost:3001', path: '/' },
  { name: 'Backend API', url: 'http://localhost:3000', path: '/api/health' },
  { name: 'AI Service', url: 'http://localhost:3002', path: '/health' }
];

function checkService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.path, service.url);
    
    const req = http.get(url, { timeout: 5000 }, (res) => {
      resolve({
        name: service.name,
        url: service.url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        url: service.url,
        status: 'TIMEOUT',
        success: false
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        url: service.url,
        status: err.code || 'ERROR',
        success: false
      });
    });
  });
}

async function verifyDeployment() {
  console.log('🔍 Running deployment verification...');
  
  const maxAttempts = 10;
  const delay = 3000; // 3 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n📋 Verification attempt ${attempt}/${maxAttempts}`);
    
    const results = await Promise.all(SERVICES.map(checkService));
    
    let allSuccessful = true;
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.name} (${result.url}): ${result.status}`);
      if (!result.success) allSuccessful = false;
    });
    
    if (allSuccessful) {
      console.log('\n🎉 All services are responding successfully!');
      process.exit(0);
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delay/1000}s before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('\n❌ Deployment verification failed after maximum attempts');
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Verification cancelled');
  process.exit(1);
});

verifyDeployment().catch(error => {
  console.error('❌ Verification error:', error.message);
  process.exit(1);
});