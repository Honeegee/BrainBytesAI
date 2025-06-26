const http = require('http');
const https = require('https');

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  duration: parseInt(process.env.DURATION) || 300, // 5 minutes
  concurrency: parseInt(process.env.CONCURRENCY) || 5,
  endpoints: [
    '/api/health',
    '/api/auth/profile',
    '/api/messages',
    '/api/learning-materials',
    '/api/user-profiles',
    '/metrics'
  ],
  subjects: ['math', 'science', 'english', 'history', 'physics'],
  gradeLevels: ['elementary', 'middle', 'high'],
  userTypes: ['student', 'teacher', 'parent']
};

class TrafficSimulator {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    this.running = true;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.getRandomUserAgent()
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(data);
      }

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          this.requestCount++;
          if (res.statusCode >= 400) {
            this.errorCount++;
          }
          resolve({
            statusCode: res.statusCode,
            responseTime: Date.now() - requestStart,
            size: Buffer.byteLength(responseData)
          });
        });
      });

      req.on('error', (err) => {
        this.errorCount++;
        this.requestCount++;
        resolve({
          statusCode: 500,
          responseTime: Date.now() - requestStart,
          error: err.message
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
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  getRandomEndpoint() {
    return config.endpoints[Math.floor(Math.random() * config.endpoints.length)];
  }

  getRandomSubject() {
    return config.subjects[Math.floor(Math.random() * config.subjects.length)];
  }

  getRandomGradeLevel() {
    return config.gradeLevels[Math.floor(Math.random() * config.gradeLevels.length)];
  }

  getRandomUserType() {
    return config.userTypes[Math.floor(Math.random() * config.userTypes.length)];
  }

  async simulateUserSession() {
    const sessionStart = Date.now();
    const sessionId = Math.random().toString(36).substring(7);
    
    // Simulate login
    await this.makeRequest(`${config.baseUrl}/api/auth/login`, 'POST', JSON.stringify({
      email: `user${sessionId}@example.com`,
      password: 'testpassword'
    }));

    // Simulate browsing
    const numRequests = Math.floor(Math.random() * 10) + 3; // 3-12 requests per session
    
    for (let i = 0; i < numRequests && this.running; i++) {
      const endpoint = this.getRandomEndpoint();
      const url = `${config.baseUrl}${endpoint}`;
      
      // Add some query parameters for certain endpoints
      if (endpoint === '/api/learning-materials') {
        const subject = this.getRandomSubject();
        const grade = this.getRandomGradeLevel();
        url += `?subject=${subject}&grade=${grade}`;
      }
      
      await this.makeRequest(url);
      
      // Random delay between requests (0.5-3 seconds)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2500 + 500));
    }

    const sessionDuration = (Date.now() - sessionStart) / 1000;
    this.log(`Session ${sessionId} completed: ${numRequests} requests in ${sessionDuration.toFixed(2)}s`);
  }

  async simulateAIInteraction() {
    const subject = this.getRandomSubject();
    const gradeLevel = this.getRandomGradeLevel();
    
    // Simulate question submission
    const questionData = JSON.stringify({
      question: `Help me understand ${subject} concepts for ${gradeLevel} level`,
      subject: subject,
      gradeLevel: gradeLevel,
      complexity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    });

    await this.makeRequest(`${config.baseUrl}/api/messages`, 'POST', questionData);
  }

  async generateLoad() {
    const workers = [];
    
    for (let i = 0; i < config.concurrency; i++) {
      workers.push(this.workerLoop(i));
    }

    // Set up shutdown timer
    setTimeout(() => {
      this.running = false;
      this.log('Shutting down traffic simulation...');
    }, config.duration * 1000);

    await Promise.all(workers);
  }

  async workerLoop(workerId) {
    this.log(`Worker ${workerId} started`);
    
    while (this.running) {
      try {
        // Randomly choose between user session or AI interaction
        if (Math.random() > 0.3) {
          await this.simulateUserSession();
        } else {
          await this.simulateAIInteraction();
        }
        
        // Brief pause between sessions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
      } catch (error) {
        this.log(`Worker ${workerId} error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause on error
      }
    }
    
    this.log(`Worker ${workerId} stopped`);
  }

  printStats() {
    const runtime = (Date.now() - this.startTime) / 1000;
    const rps = (this.requestCount / runtime).toFixed(2);
    const errorRate = ((this.errorCount / this.requestCount) * 100).toFixed(2);
    
    console.log('\n=== Traffic Simulation Stats ===');
    console.log(`Runtime: ${runtime.toFixed(2)}s`);
    console.log(`Total Requests: ${this.requestCount}`);
    console.log(`Errors: ${this.errorCount}`);
    console.log(`Error Rate: ${errorRate}%`);
    console.log(`Requests/sec: ${rps}`);
    console.log('================================\n');
  }

  async run() {
    this.log('Starting BrainBytes traffic simulation...');
    this.log(`Target: ${config.baseUrl}`);
    this.log(`Duration: ${config.duration}s`);
    this.log(`Concurrency: ${config.concurrency}`);
    
    // Print stats every 30 seconds
    const statsInterval = setInterval(() => {
      if (this.running) {
        this.printStats();
      }
    }, 30000);

    try {
      await this.generateLoad();
    } finally {
      clearInterval(statsInterval);
      this.printStats();
    }
  }
}

// Run the simulation
if (require.main === module) {
  const simulator = new TrafficSimulator();
  
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    simulator.running = false;
  });
  
  simulator.run().catch(console.error);
}

module.exports = TrafficSimulator;