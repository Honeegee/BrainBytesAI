#!/usr/bin/env node

/**
 * BrainBytes Monitoring Demo Script
 * Creates realistic data patterns to demonstrate monitoring capabilities
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class MonitoringDemo {
  constructor() {
    this.config = {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:3002',
      demoLength: parseInt(process.env.DEMO_LENGTH) || 900, // 15 minutes
      phases: {
        normal: 300,      // 5 minutes normal operation
        highLoad: 180,    // 3 minutes high load
        errors: 120,      // 2 minutes error simulation
        recovery: 300     // 5 minutes recovery
      }
    };
    
    this.demoPhase = 'starting';
    this.startTime = Date.now();
    this.requestCount = 0;
    this.currentUsers = 0;
    this.isRunning = false;
    
    this.scenarios = {
      normal: this.normalOperationScenario.bind(this),
      highLoad: this.highLoadScenario.bind(this),
      errors: this.errorScenario.bind(this),
      recovery: this.recoveryScenario.bind(this)
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'INFO': '📊',
      'WARN': '⚠️',
      'ERROR': '🚨',
      'SUCCESS': '✅',
      'DEMO': '🎬'
    };
    console.log(`${emoji[level]} [${timestamp}] [${this.demoPhase.toUpperCase()}] ${message}`);
  }

  async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
    const url = options.useAiService ? this.config.aiServiceUrl : this.config.baseUrl;
    
    return new Promise((resolve) => {
      const urlObj = new URL(`${url}${endpoint}`);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.getRandomUserAgent(),
          'X-Demo-Source': 'monitoring-demo',
          ...options.headers
        },
        timeout: options.timeout || 10000
      };

      if (data) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(data);
      }

      const req = http.request(requestOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          this.requestCount++;
          resolve({
            statusCode: res.statusCode,
            responseTime: Date.now() - requestStart,
            size: Buffer.byteLength(responseData),
            success: res.statusCode < 400
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          statusCode: 500,
          responseTime: Date.now() - requestStart,
          error: err.message,
          success: false
        });
      });

      req.on('timeout', () => {
        req.abort();
        resolve({
          statusCode: 408,
          responseTime: options.timeout || 10000,
          error: 'Request timeout',
          success: false
        });
      });

      const requestStart = Date.now();
      
      if (data) {
        req.write(data);
      }
      
      req.end();
    });
  }

  getRandomUserAgent() {
    const mobileAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 10; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36'
    ];
    
    const desktopAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];

    // 75% mobile for Filipino context
    const isMobile = Math.random() < 0.75;
    const agents = isMobile ? mobileAgents : desktopAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  getRandomEducationalData() {
    const subjects = ['mathematics', 'science', 'english', 'filipino', 'history'];
    const gradeLevels = ['grade-7', 'grade-8', 'grade-9', 'grade-10'];
    const questionTypes = [
      'What is the quadratic formula?',
      'Explain photosynthesis',
      'How do you solve linear equations?',
      'What are the parts of a cell?',
      'Describe the water cycle',
      'What is the periodic table?',
      'How do you factor polynomials?',
      'Explain gravity and motion'
    ];

    return {
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      gradeLevel: gradeLevels[Math.floor(Math.random() * gradeLevels.length)],
      question: questionTypes[Math.floor(Math.random() * questionTypes.length)]
    };
  }

  async simulateUserSession(sessionIntensity = 'normal') {
    const sessionId = Math.random().toString(36).substring(7);
    const userData = this.getRandomEducationalData();
    this.currentUsers++;

    try {
      // Session start
      await this.makeRequest('/api/auth/profile', 'GET');
      
      // Determine session length based on intensity
      const sessionLength = {
        normal: Math.floor(Math.random() * 8) + 3, // 3-10 requests
        high: Math.floor(Math.random() * 15) + 8,  // 8-22 requests
        stress: Math.floor(Math.random() * 25) + 15 // 15-39 requests
      }[sessionIntensity] || 5;

      for (let i = 0; i < sessionLength && this.isRunning; i++) {
        // Mix of different requests
        const requestType = Math.random();
        
        if (requestType < 0.4) {
          // AI question (40% of requests)
          const questionData = JSON.stringify({
            prompt: userData.question,
            learningContext: {
              subject: userData.subject,
              gradeLevel: userData.gradeLevel
            }
          });
          
          await this.makeRequest('/api/chat', 'POST', questionData, {
            useAiService: true,
            timeout: sessionIntensity === 'stress' ? 15000 : 8000
          });
        } else if (requestType < 0.7) {
          // Learning materials (30% of requests)
          await this.makeRequest(`/api/learning-materials?subject=${userData.subject}&grade=${userData.gradeLevel}`);
        } else if (requestType < 0.9) {
          // User profile or session data (20% of requests)
          await this.makeRequest('/api/user-profiles');
        } else {
          // Health check or metrics (10% of requests)
          await this.makeRequest('/health');
        }

        // Variable delay between requests
        const delay = {
          normal: Math.random() * 3000 + 1000,  // 1-4 seconds
          high: Math.random() * 1500 + 500,     // 0.5-2 seconds  
          stress: Math.random() * 500 + 100     // 0.1-0.6 seconds
        }[sessionIntensity] || 2000;

        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      this.log(`Session ${sessionId} error: ${error.message}`, 'ERROR');
    } finally {
      this.currentUsers--;
    }
  }

  async normalOperationScenario() {
    this.log('Starting normal operation phase - baseline metrics', 'DEMO');
    
    const concurrency = 3; // 3 concurrent users
    const workers = [];

    for (let i = 0; i < concurrency; i++) {
      workers.push(this.sessionWorker(i, 'normal'));
    }

    // Run for normal phase duration
    setTimeout(() => {
      this.log('Normal operation phase complete', 'SUCCESS');
      this.demoPhase = 'highLoad';
    }, this.config.phases.normal * 1000);

    await Promise.all(workers);
  }

  async highLoadScenario() {
    this.log('Starting high load phase - stress testing dashboards', 'DEMO');
    
    const concurrency = 8; // 8 concurrent users
    const workers = [];

    // Create burst of activity
    for (let i = 0; i < concurrency; i++) {
      workers.push(this.sessionWorker(i, 'high'));
    }

    // Additional background load
    const backgroundWorkers = [];
    for (let i = 0; i < 5; i++) {
      backgroundWorkers.push(this.backgroundLoadWorker());
    }

    setTimeout(() => {
      this.log('High load phase complete - checking resource metrics', 'SUCCESS');
      this.demoPhase = 'errors';
    }, this.config.phases.highLoad * 1000);

    await Promise.all([...workers, ...backgroundWorkers]);
  }

  async errorScenario() {
    this.log('Starting error simulation phase - testing error tracking', 'DEMO');
    
    // Continue some normal traffic
    const normalWorkers = [];
    for (let i = 0; i < 2; i++) {
      normalWorkers.push(this.sessionWorker(i, 'normal'));
    }

    // Generate various types of errors
    const errorWorkers = [
      this.generate404Errors(),
      this.generate500Errors(),
      this.generateTimeouts(),
      this.generateDatabaseErrors()
    ];

    setTimeout(() => {
      this.log('Error simulation phase complete - errors should be visible in dashboards', 'SUCCESS');
      this.demoPhase = 'recovery';
    }, this.config.phases.errors * 1000);

    await Promise.all([...normalWorkers, ...errorWorkers]);
  }

  async recoveryScenario() {
    this.log('Starting recovery phase - returning to normal operation', 'DEMO');
    
    const concurrency = 4; // Moderate load
    const workers = [];

    for (let i = 0; i < concurrency; i++) {
      workers.push(this.sessionWorker(i, 'normal'));
    }

    setTimeout(() => {
      this.log('Demo complete! Check dashboards for full data visualization', 'SUCCESS');
      this.demoPhase = 'complete';
      this.isRunning = false;
    }, this.config.phases.recovery * 1000);

    await Promise.all(workers);
  }

  async sessionWorker(workerId, intensity) {
    while (this.isRunning && this.demoPhase !== 'complete') {
      try {
        await this.simulateUserSession(intensity);
        
        // Brief pause between sessions
        const pause = {
          normal: Math.random() * 2000 + 1000,
          high: Math.random() * 1000 + 500,
          stress: Math.random() * 500 + 200
        }[intensity] || 1500;
        
        await new Promise(resolve => setTimeout(resolve, pause));
        
      } catch (error) {
        this.log(`Worker ${workerId} error: ${error.message}`, 'ERROR');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async backgroundLoadWorker() {
    while (this.isRunning && this.demoPhase === 'highLoad') {
      // Generate background API calls
      await this.makeRequest('/api/health');
      await this.makeRequest('/metrics');
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }
  }

  async generate404Errors() {
    while (this.isRunning && this.demoPhase === 'errors') {
      // Generate 404 errors
      await this.makeRequest('/api/nonexistent-endpoint');
      await this.makeRequest('/api/missing-resource/' + Math.random().toString(36));
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    }
  }

  async generate500Errors() {
    while (this.isRunning && this.demoPhase === 'errors') {
      // Simulate server errors
      const badData = JSON.stringify({ 
        prompt: 'a'.repeat(10000), // Oversized request
        malformed: { circular: null }
      });
      badData.circular = badData; // Create circular reference
      
      await this.makeRequest('/api/chat', 'POST', badData, { useAiService: true });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1500));
    }
  }

  async generateTimeouts() {
    while (this.isRunning && this.demoPhase === 'errors') {
      // Create requests that will timeout
      await this.makeRequest('/api/chat', 'POST', JSON.stringify({
        prompt: 'Generate a very long response that will take a long time to process'
      }), { 
        useAiService: true, 
        timeout: 1000 // Very short timeout to force timeout errors
      });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2500 + 1000));
    }
  }

  async generateDatabaseErrors() {
    while (this.isRunning && this.demoPhase === 'errors') {
      // Simulate database connection issues
      await this.makeRequest('/api/user-profiles?invalid=query&limit=999999');
      await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 2000));
    }
  }

  printStats() {
    const runtime = (Date.now() - this.startTime) / 1000;
    const rps = (this.requestCount / runtime).toFixed(2);
    
    console.log('\n📊 DEMO STATISTICS');
    console.log('=====================================');
    console.log(`🕐 Runtime: ${Math.floor(runtime / 60)}m ${Math.floor(runtime % 60)}s`);
    console.log(`📊 Phase: ${this.demoPhase.toUpperCase()}`);
    console.log(`🎯 Total Requests: ${this.requestCount}`);
    console.log(`📈 Requests/sec: ${rps}`);
    console.log(`👥 Current Users: ${this.currentUsers}`);
    console.log('=====================================\n');
  }

  printDemoGuide() {
    console.log('\n🎬 MONITORING DEMO GUIDE');
    console.log('=====================================');
    console.log('📋 Demo Schedule:');
    console.log(`  1. Normal Operation  (${this.config.phases.normal}s) - Baseline metrics`);
    console.log(`  2. High Load        (${this.config.phases.highLoad}s) - Resource stress`);
    console.log(`  3. Error Simulation (${this.config.phases.errors}s) - Error tracking`);
    console.log(`  4. Recovery         (${this.config.phases.recovery}s) - Return to normal`);
    console.log('');
    console.log('🔗 Monitor these URLs during demo:');
    console.log('  • Grafana: http://localhost:3003');
    console.log('  • Prometheus: http://localhost:9090');
    console.log('  • Alertmanager: http://localhost:9093');
    console.log('');
    console.log('📊 Key Dashboards to Watch:');
    console.log('  • BrainBytes - System Overview');
    console.log('  • BrainBytes - Application Performance');
    console.log('  • BrainBytes - Error Analysis');
    console.log('  • BrainBytes - Resource Optimization');
    console.log('  • BrainBytes - User Experience');
    console.log('');
    console.log('⚠️  Expected Alerts:');
    console.log('  • High CPU Usage (during high load phase)');
    console.log('  • Elevated Error Rate (during error phase)');
    console.log('  • AI Response Time Degradation');
    console.log('=====================================\n');
  }

  async run() {
    this.log('🎬 Starting BrainBytes Monitoring System Demo', 'DEMO');
    this.printDemoGuide();
    
    this.isRunning = true;
    this.demoPhase = 'normal';

    // Print stats every 30 seconds
    const statsInterval = setInterval(() => {
      if (this.isRunning) {
        this.printStats();
      } else {
        clearInterval(statsInterval);
      }
    }, 30000);

    try {
      // Run demo phases sequentially
      await this.scenarios.normal();
      if (this.isRunning) await this.scenarios.highLoad();
      if (this.isRunning) await this.scenarios.errors();
      if (this.isRunning) await this.scenarios.recovery();
      
    } catch (error) {
      this.log(`Demo error: ${error.message}`, 'ERROR');
    } finally {
      this.isRunning = false;
      clearInterval(statsInterval);
      this.printStats();
      this.log('Demo completed. Review dashboards for generated metrics!', 'SUCCESS');
    }
  }
}

// CLI execution
if (require.main === module) {
  const demo = new MonitoringDemo();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping demo gracefully...');
    demo.isRunning = false;
  });
  
  demo.run().catch(console.error);
}

module.exports = MonitoringDemo;