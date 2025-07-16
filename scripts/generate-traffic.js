#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost',
  duration: parseInt(process.env.DURATION) || 300, // 5 minutes default
  concurrency: parseInt(process.env.CONCURRENCY) || 10,
  requestsPerSecond: parseInt(process.env.RPS) || 5,
  logFile: process.env.LOG_FILE || 'traffic-log.json'
};

// Sample endpoints to test
const endpoints = [
  { method: 'GET', path: '/', weight: 30 },
  { method: 'GET', path: '/api/health', weight: 20 },
  { method: 'GET', path: '/api/users', weight: 15 },
  { method: 'POST', path: '/api/auth/login', weight: 10, data: { email: 'test@example.com', password: 'password123' } },
  { method: 'GET', path: '/api/materials', weight: 15 },
  { method: 'POST', path: '/api/materials', weight: 5, data: { title: 'Test Material', content: 'Test content', type: 'article' } },
  { method: 'GET', path: '/api/ai/chat', weight: 5 }
];

// User agents for realistic traffic
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
];

// Statistics tracking
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  statusCodes: {},
  errors: [],
  startTime: Date.now()
};

// Weighted random selection
function selectEndpoint() {
  const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  return endpoints[0];
}

// Generate random user agent
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Make HTTP request
async function makeRequest() {
  const endpoint = selectEndpoint();
  const startTime = Date.now();
  
  try {
    const requestConfig = {
      method: endpoint.method,
      url: `${config.baseUrl}${endpoint.path}`,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      validateStatus: () => true // Don't throw on HTTP error status
    };

    if (endpoint.data) {
      requestConfig.data = endpoint.data;
    }

    const response = await axios(requestConfig);
    const responseTime = Date.now() - startTime;
    
    // Update statistics
    stats.totalRequests++;
    stats.responseTimes.push(responseTime);
    
    if (response.status >= 200 && response.status < 400) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }
    
    stats.statusCodes[response.status] = (stats.statusCodes[response.status] || 0) + 1;
    
    // Log request details
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: endpoint.method,
      path: endpoint.path,
      status: response.status,
      responseTime: responseTime,
      success: response.status >= 200 && response.status < 400
    };
    
    console.log(`${logEntry.timestamp} ${logEntry.method} ${logEntry.path} - ${logEntry.status} (${logEntry.responseTime}ms)`);
    
    return logEntry;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    stats.totalRequests++;
    stats.failedRequests++;
    stats.errors.push({
      timestamp: new Date().toISOString(),
      endpoint: endpoint.path,
      error: error.message
    });
    
    console.error(`ERROR: ${endpoint.method} ${endpoint.path} - ${error.message} (${responseTime}ms)`);
    
    return {
      timestamp: new Date().toISOString(),
      method: endpoint.method,
      path: endpoint.path,
      status: 'ERROR',
      responseTime: responseTime,
      success: false,
      error: error.message
    };
  }
}

// Traffic generator worker
async function trafficWorker(workerId) {
  const requestInterval = 1000 / (config.requestsPerSecond / config.concurrency);
  
  while (Date.now() - stats.startTime < config.duration * 1000) {
    await makeRequest();
    await new Promise(resolve => setTimeout(resolve, requestInterval));
  }
  
  console.log(`Worker ${workerId} completed`);
}

// Calculate statistics
function calculateStats() {
  const duration = (Date.now() - stats.startTime) / 1000;
  const avgResponseTime = stats.responseTimes.length > 0 
    ? stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length 
    : 0;
  
  const sortedTimes = stats.responseTimes.sort((a, b) => a - b);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p99Index = Math.floor(sortedTimes.length * 0.99);
  
  return {
    duration: duration,
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    failedRequests: stats.failedRequests,
    successRate: ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2),
    requestsPerSecond: (stats.totalRequests / duration).toFixed(2),
    avgResponseTime: avgResponseTime.toFixed(2),
    p95ResponseTime: sortedTimes[p95Index] || 0,
    p99ResponseTime: sortedTimes[p99Index] || 0,
    statusCodes: stats.statusCodes,
    errors: stats.errors.slice(-10) // Last 10 errors
  };
}

// Save results to file
function saveResults(results) {
  try {
    fs.writeFileSync(config.logFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${config.logFile}`);
  } catch (error) {
    console.error('Failed to save results:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Traffic Generator');
  console.log(`Target: ${config.baseUrl}`);
  console.log(`Duration: ${config.duration} seconds`);
  console.log(`Concurrency: ${config.concurrency}`);
  console.log(`Target RPS: ${config.requestsPerSecond}`);
  console.log('─'.repeat(80));
  
  // Start workers
  const workers = [];
  for (let i = 0; i < config.concurrency; i++) {
    workers.push(trafficWorker(i + 1));
  }
  
  // Progress reporting
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const progress = ((elapsed / config.duration) * 100).toFixed(1);
    const currentRps = (stats.totalRequests / elapsed).toFixed(1);
    
    console.log(`Progress: ${progress}% | Requests: ${stats.totalRequests} | Current RPS: ${currentRps} | Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`);
  }, 5000);
  
  // Wait for all workers to complete
  await Promise.all(workers);
  clearInterval(progressInterval);
  
  // Calculate and display final results
  const results = calculateStats();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TRAFFIC GENERATION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Duration: ${results.duration.toFixed(2)}s`);
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful: ${results.successfulRequests} (${results.successRate}%)`);
  console.log(`Failed: ${results.failedRequests}`);
  console.log(`Average RPS: ${results.requestsPerSecond}`);
  console.log(`Average Response Time: ${results.avgResponseTime}ms`);
  console.log(`95th Percentile: ${results.p95ResponseTime}ms`);
  console.log(`99th Percentile: ${results.p99ResponseTime}ms`);
  
  console.log('\nStatus Code Distribution:');
  Object.entries(results.statusCodes).forEach(([code, count]) => {
    console.log(`  ${code}: ${count} requests`);
  });
  
  if (results.errors.length > 0) {
    console.log('\nRecent Errors:');
    results.errors.forEach(error => {
      console.log(`  ${error.timestamp}: ${error.endpoint} - ${error.error}`);
    });
  }
  
  saveResults(results);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Traffic generation interrupted');
  const results = calculateStats();
  saveResults(results);
  process.exit(0);
});

// Run the traffic generator
if (require.main === module) {
  main().catch(error => {
    console.error('Traffic generator failed:', error);
    process.exit(1);
  });
}

module.exports = { main, config };