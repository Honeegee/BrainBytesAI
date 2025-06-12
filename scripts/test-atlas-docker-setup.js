#!/usr/bin/env node

/**
 * Test script to verify Atlas-only Docker setup
 * This script tests that all containers can start and connect to MongoDB Atlas
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AtlasDockerTester {
  constructor() {
    this.testResults = [];
    this.containerPrefix = 'brainbytesai-atlas-test';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFn) {
    this.log(`Running test: ${testName}`);
    try {
      await testFn();
      this.testResults.push({ name: testName, status: 'passed' });
      this.log(`Test passed: ${testName}`, 'success');
    } catch (error) {
      this.testResults.push({ name: testName, status: 'failed', error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  async checkPrerequisites() {
    return this.runTest('Check Prerequisites', async () => {
      // Check Docker
      try {
        execSync('docker --version', { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Docker not installed or not running');
      }

      // Check Docker Compose
      try {
        execSync('docker-compose --version', { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Docker Compose not installed');
      }

      // Check environment files exist
      const envFiles = [
        'backend/.env.local',
        'frontend/.env.local'
      ];

      for (const envFile of envFiles) {
        if (!fs.existsSync(envFile)) {
          throw new Error(`Environment file missing: ${envFile}`);
        }
      }

      this.log('All prerequisites satisfied');
    });
  }

  async checkDockerComposeFiles() {
    return this.runTest('Validate Docker Compose Files', async () => {
      const composeFiles = [
        'docker-compose.yml',
        'docker-compose.staging.yml', 
        'docker-compose.production.yml'
      ];

      for (const file of composeFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Docker compose file missing: ${file}`);
        }

        // Read and validate no MongoDB service exists
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('mongo:') && content.includes('image: mongo')) {
          throw new Error(`${file} still contains MongoDB service - Atlas migration incomplete`);
        }

        // Validate services don't depend on mongo
        if (content.includes('- mongo')) {
          throw new Error(`${file} still has mongo dependency - needs to be removed`);
        }
      }

      this.log('All Docker Compose files validated');
    });
  }

  async testAtlasConnectivity() {
    return this.runTest('Test Atlas Connectivity', async () => {
      // Run the existing Atlas connection test
      try {
        const result = execSync('cd backend && node scripts/test-db-connection.js', { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        if (!result.includes('Connection successful') && !result.includes('✅')) {
          throw new Error('Atlas connection test failed');
        }
        
        this.log('Atlas connectivity verified');
      } catch (error) {
        throw new Error(`Atlas connection test failed: ${error.message}`);
      }
    });
  }

  async testDockerBuild() {
    return this.runTest('Test Docker Images Build', async () => {
      const services = ['frontend', 'backend', 'ai-service'];
      
      for (const service of services) {
        try {
          this.log(`Building ${service} image...`);
          execSync(`docker-compose build ${service}`, { 
            stdio: 'pipe',
            timeout: 300000 // 5 minutes timeout
          });
          this.log(`${service} image built successfully`);
        } catch (error) {
          throw new Error(`Failed to build ${service}: ${error.message}`);
        }
      }
    });
  }

  async testContainerStartup() {
    return this.runTest('Test Container Startup', async () => {
      try {
        this.log('Starting containers...');
        
        // Start containers in detached mode
        execSync('docker-compose up -d', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minutes timeout
        });

        // Wait for containers to start
        await this.sleep(10000); // 10 seconds

        // Check container health
        const containers = execSync('docker-compose ps --format json', { 
          stdio: 'pipe',
          encoding: 'utf8'
        });

        const containerList = containers.trim().split('\n').map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        for (const container of containerList) {
          if (container.State !== 'running') {
            throw new Error(`Container ${container.Service} is not running: ${container.State}`);
          }
        }

        this.log('All containers started successfully');
      } catch (error) {
        throw new Error(`Container startup failed: ${error.message}`);
      }
    });
  }

  async testServiceHealth() {
    return this.runTest('Test Service Health Endpoints', async () => {
      const healthChecks = [
        { name: 'Backend', url: 'http://localhost:3000/health' },
        { name: 'Frontend', url: 'http://localhost:3001' },
        { name: 'AI Service', url: 'http://localhost:3002/health' }
      ];

      // Wait for services to be ready
      await this.sleep(15000); // 15 seconds

      for (const check of healthChecks) {
        try {
          this.log(`Checking ${check.name} health...`);
          
          // Use curl to check service health
          const result = execSync(`curl -f -s --max-time 10 ${check.url}`, { 
            stdio: 'pipe',
            encoding: 'utf8'
          });
          
          this.log(`${check.name} is healthy`);
        } catch (error) {
          throw new Error(`${check.name} health check failed: ${error.message}`);
        }
      }
    });
  }

  async cleanup() {
    this.log('Cleaning up test containers...');
    try {
      execSync('docker-compose down', { stdio: 'pipe' });
      this.log('Cleanup completed');
    } catch (error) {
      this.log(`Cleanup error (non-critical): ${error.message}`, 'error');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    this.log('🚀 Starting Atlas-Only Docker Setup Test');
    this.log('==========================================');

    try {
      await this.checkPrerequisites();
      await this.checkDockerComposeFiles();
      await this.testAtlasConnectivity();
      await this.testDockerBuild();
      await this.testContainerStartup();
      await this.testServiceHealth();
    } catch (error) {
      this.log(`Critical test failure: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
    }

    // Print results summary
    this.log('==========================================');
    this.log('🏁 Test Results Summary');
    this.log('==========================================');

    let passed = 0;
    let failed = 0;

    for (const result of this.testResults) {
      if (result.status === 'passed') {
        this.log(`✅ ${result.name}`, 'success');
        passed++;
      } else {
        this.log(`❌ ${result.name}: ${result.error || 'Unknown error'}`, 'error');
        failed++;
      }
    }

    this.log(`\nResults: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      this.log('🎉 All tests passed! Your Atlas-only Docker setup is working correctly!', 'success');
      return true;
    } else {
      this.log('❌ Some tests failed. Please check the errors above and fix the issues.', 'error');
      return false;
    }
  }
}

// Run the test if called directly
if (require.main === module) {
  const tester = new AtlasDockerTester();
  tester.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = AtlasDockerTester;