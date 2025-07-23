#!/usr/bin/env node

const axios = require('axios');
const { spawn } = require('child_process');

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost',  // Through nginx proxy
  AI_SERVICE_URL: 'http://localhost:8090', // AI service on port 8090
  PROMETHEUS_URL: 'http://localhost:9090',
  ALERTMANAGER_URL: 'http://localhost:9093',
  CADVISOR_URL: 'http://localhost:8081',
  GRAFANA_URL: 'http://localhost:3003'
};

// Available incident types
const INCIDENT_TYPES = {
  HIGH_CPU: {
    name: 'High CPU Usage',
    description: 'Simulate high CPU usage to trigger CPU alerts',
    trigger: triggerHighCPU,
    resolve: resolveHighCPU
  },
  HIGH_ERROR_RATE: {
    name: 'High Error Rate',
    description: 'Generate HTTP errors to trigger error rate alerts',
    trigger: triggerHighErrorRate,
    resolve: resolveHighErrorRate
  },
  CONTAINER_MEMORY: {
    name: 'Container Memory Spike',
    description: 'Simulate high container memory usage',
    trigger: triggerContainerMemory,
    resolve: resolveContainerMemory
  },
  AI_SERVICE_SLOW: {
    name: 'AI Service Slowdown',
    description: 'Simulate slow AI service responses',
    trigger: triggerAIServiceSlow,
    resolve: resolveAIServiceSlow
  },
  MOBILE_CONNECTIVITY: {
    name: 'Mobile Connectivity Issues',
    description: 'Simulate mobile connection problems',
    trigger: triggerMobileConnectivity,
    resolve: resolveMobileConnectivity
  }
};

// Global state to track active incidents
let activeIncidents = new Map();

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    incident: '🚨'
  }[type] || 'ℹ️';
  
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Check if monitoring services are available
async function checkServices() {
  const services = [
    { name: 'Backend', url: `${CONFIG.BACKEND_URL}/health` },
    { name: 'AI Service', url: `${CONFIG.AI_SERVICE_URL}/health` },
    { name: 'Prometheus', url: `${CONFIG.PROMETHEUS_URL}/-/ready` },
    { name: 'Alertmanager', url: `${CONFIG.ALERTMANAGER_URL}/-/ready` },
    { name: 'cAdvisor', url: `${CONFIG.CADVISOR_URL}/healthz` },
    { name: 'Grafana', url: `${CONFIG.GRAFANA_URL}/api/health` }
  ];

  log('Checking monitoring services availability...', 'info');
  
  const results = {};
  for (const service of services) {
    try {
      await axios.get(service.url, { timeout: 5000 });
      log(`${service.name}: Available`, 'success');
      results[service.name] = true;
    } catch (error) {
      log(`${service.name}: Not available (${error.message})`, 'error');
      results[service.name] = false;
    }
  }
  
  return results;
}

// Get current alerts from Prometheus
async function getCurrentAlerts() {
  try {
    const response = await axios.get(`${CONFIG.PROMETHEUS_URL}/api/v1/alerts`, { timeout: 5000 });
    return response.data.data.alerts || [];
  } catch (error) {
    log(`Failed to fetch alerts: ${error.message}`, 'error');
    return [];
  }
}

// Get container metrics from cAdvisor
async function getContainerMetrics() {
  try {
    const response = await axios.get(`${CONFIG.CADVISOR_URL}/api/v1.3/containers`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    log(`Failed to fetch container metrics: ${error.message}`, 'error');
    return {};
  }
}

// Display current system status
async function showSystemStatus() {
  log('=== SYSTEM STATUS ===', 'info');
  
  // Show alerts
  const alerts = await getCurrentAlerts();
  if (alerts.length === 0) {
    log('No active alerts', 'success');
  } else {
    log(`${alerts.length} active alert(s):`, 'warning');
    alerts.forEach((alert, index) => {
      log(`  ${index + 1}. ${alert.labels.alertname} - ${alert.state}`, 'incident');
    });
  }
  
  // Show active incidents
  if (activeIncidents.size === 0) {
    log('No active incidents', 'success');
  } else {
    log(`${activeIncidents.size} active incident(s):`, 'warning');
    activeIncidents.forEach((incident, id) => {
      log(`  ${id}: ${incident.name} (started: ${incident.startTime})`, 'incident');
    });
  }
  
  console.log('');
}

// Incident trigger functions
async function triggerHighCPU() {
  log('Triggering High CPU incident...', 'incident');
  
  // Use stress command to generate CPU load
  const stressProcess = spawn('stress', ['--cpu', '4', '--timeout', '300s'], {
    stdio: 'pipe'
  });
  
  const incidentId = 'high-cpu-' + Date.now();
  activeIncidents.set(incidentId, {
    name: 'High CPU Usage',
    startTime: new Date().toISOString(),
    process: stressProcess,
    type: 'HIGH_CPU'
  });
  
  log('High CPU load started (will run for 5 minutes)', 'warning');
  log('Expected alerts: HighCpuUsage', 'info');
  
  return incidentId;
}

async function resolveHighCPU() {
  log('Resolving High CPU incidents...', 'success');
  
  for (const [id, incident] of activeIncidents.entries()) {
    if (incident.type === 'HIGH_CPU' && incident.process) {
      incident.process.kill('SIGTERM');
      activeIncidents.delete(id);
      log(`Stopped CPU stress process for incident ${id}`, 'success');
    }
  }
}

async function triggerHighErrorRate() {
  log('Triggering High Error Rate incident...', 'incident');
  
  const incidentId = 'high-error-' + Date.now();
  let isRunning = true;
  
  const errorGenerator = async () => {
    while (isRunning) {
      try {
        // Generate 500 errors by hitting an endpoint that causes server errors
        await axios.get(`${CONFIG.BACKEND_URL}/api/simulate-error`, { timeout: 1000 });
      } catch (error) {
        // Expected errors - these should be 500 status codes
      }
      await delay(100); // 10 requests per second
    }
  };
  
  activeIncidents.set(incidentId, {
    name: 'High Error Rate',
    startTime: new Date().toISOString(),
    stopFunction: () => { isRunning = false; },
    type: 'HIGH_ERROR_RATE'
  });
  
  errorGenerator();
  
  log('Error generation started (10 errors/sec)', 'warning');
  log('Expected alerts: HighErrorRate', 'info');
  
  return incidentId;
}

async function resolveHighErrorRate() {
  log('Resolving High Error Rate incidents...', 'success');
  
  // Stop error generation first
  for (const [id, incident] of activeIncidents.entries()) {
    if (incident.type === 'HIGH_ERROR_RATE' && incident.stopFunction) {
      incident.stopFunction();
      activeIncidents.delete(id);
      log(`Stopped error generation for incident ${id}`, 'success');
    }
  }
  
  // Generate normal traffic to dilute error rate and help clear alerts
  log('Generating normal traffic to clear alerts...', 'info');
  const trafficCount = 1000; // Generate enough requests to dilute error rate
  let successCount = 0;
  let failCount = 0;
  
  const generateNormalTraffic = async () => {
    const promises = [];
    const batchSize = 50;
    
    for (let i = 0; i < Math.min(batchSize, trafficCount - successCount - failCount); i++) {
      promises.push(
        axios.get(`${CONFIG.BACKEND_URL}/health`)
          .then(() => successCount++)
          .catch(() => failCount++)
      );
    }
    
    await Promise.all(promises);
    
    if ((successCount + failCount) % 200 === 0) {
      log(`Generated ${successCount + failCount}/${trafficCount} normal requests (${successCount} success, ${failCount} failed)`, 'info');
    }
    
    if (successCount + failCount < trafficCount) {
      await delay(100); // Small delay between batches
      return generateNormalTraffic();
    }
  };
  
  try {
    await generateNormalTraffic();
    log(`Normal traffic generation complete: ${successCount} successful requests`, 'success');
    log('Alerts should clear within 1-3 minutes as error rate drops below thresholds', 'info');
  } catch (error) {
    log(`Error during traffic generation: ${error.message}`, 'error');
  }
}

async function triggerContainerMemory() {
  log('Triggering Container Memory incident...', 'incident');
  
  // Create a memory-intensive process
  const memoryHog = spawn('node', ['-e', `
    const arr = [];
    const interval = setInterval(() => {
      arr.push(new Array(1000000).fill('memory-hog'));
      console.log('Memory allocated:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      process.exit(0);
    }, 300000); // 5 minutes
  `], { stdio: 'pipe' });
  
  const incidentId = 'container-memory-' + Date.now();
  activeIncidents.set(incidentId, {
    name: 'Container Memory Spike',
    startTime: new Date().toISOString(),
    process: memoryHog,
    type: 'CONTAINER_MEMORY'
  });
  
  log('Memory consumption started', 'warning');
  log('Expected alerts: ContainerHighMemory', 'info');
  
  return incidentId;
}

async function resolveContainerMemory() {
  log('Resolving Container Memory incidents...', 'success');
  
  for (const [id, incident] of activeIncidents.entries()) {
    if (incident.type === 'CONTAINER_MEMORY' && incident.process) {
      incident.process.kill('SIGTERM');
      activeIncidents.delete(id);
      log(`Stopped memory process for incident ${id}`, 'success');
    }
  }
}

async function triggerAIServiceSlow() {
  log('Triggering AI Service Slow incident...', 'incident');
  
  const incidentId = 'ai-slow-' + Date.now();
  let isRunning = true;
  
  const slowRequestGenerator = async () => {
    while (isRunning) {
      try {
        // Send requests with very short timeout to simulate slow responses
        await axios.post(`${CONFIG.AI_SERVICE_URL}/api/chat`, {
          prompt: 'This is a test prompt that might cause slow responses',
          model: 'test'
        }, { timeout: 100 }); // Very short timeout
      } catch (error) {
        // Expected timeout errors
      }
      await delay(500);
    }
  };
  
  activeIncidents.set(incidentId, {
    name: 'AI Service Slowdown',
    startTime: new Date().toISOString(),
    stopFunction: () => { isRunning = false; },
    type: 'AI_SERVICE_SLOW'
  });
  
  slowRequestGenerator();
  
  log('AI slow request simulation started', 'warning');
  log('Expected alerts: SlowAiResponse', 'info');
  
  return incidentId;
}

async function resolveAIServiceSlow() {
  log('Resolving AI Service Slow incidents...', 'success');
  
  for (const [id, incident] of activeIncidents.entries()) {
    if (incident.type === 'AI_SERVICE_SLOW' && incident.stopFunction) {
      incident.stopFunction();
      activeIncidents.delete(id);
      log(`Stopped AI slow requests for incident ${id}`, 'success');
    }
  }
}

async function triggerMobileConnectivity() {
  log('Triggering Mobile Connectivity incident...', 'incident');
  
  const incidentId = 'mobile-connectivity-' + Date.now();
  let isRunning = true;
  
  const mobileErrorGenerator = async () => {
    const mobileHeaders = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    };
    
    while (isRunning) {
      try {
        // Generate mobile-specific errors
        await axios.get(`${CONFIG.BACKEND_URL}/mobile-error-test-${Math.random()}`, { 
          headers: mobileHeaders,
          timeout: 1000 
        });
      } catch (error) {
        // Expected errors
      }
      await delay(200); // 5 requests per second
    }
  };
  
  activeIncidents.set(incidentId, {
    name: 'Mobile Connectivity Issues',
    startTime: new Date().toISOString(),
    stopFunction: () => { isRunning = false; },
    type: 'MOBILE_CONNECTIVITY'
  });
  
  mobileErrorGenerator();
  
  log('Mobile connectivity error simulation started', 'warning');
  log('Expected alerts: HighMobileErrorRate', 'info');
  
  return incidentId;
}

async function resolveMobileConnectivity() {
  log('Resolving Mobile Connectivity incidents...', 'success');
  
  for (const [id, incident] of activeIncidents.entries()) {
    if (incident.type === 'MOBILE_CONNECTIVITY' && incident.stopFunction) {
      incident.stopFunction();
      activeIncidents.delete(id);
      log(`Stopped mobile error generation for incident ${id}`, 'success');
    }
  }
}

// Clear all active alerts by generating normal traffic and user activity
async function clearAllAlerts() {
  log('Starting alert resolution process...', 'info');
  
  // Step 1: Generate normal HTTP traffic to clear error rate alerts
  log('Generating normal HTTP traffic to clear error rate alerts...', 'info');
  const trafficCount = 2000; // Generate enough requests to dilute error rate
  let successCount = 0;
  let failCount = 0;
  
  const generateNormalTraffic = async () => {
    const promises = [];
    const batchSize = 100;
    
    for (let i = 0; i < Math.min(batchSize, trafficCount - successCount - failCount); i++) {
      promises.push(
        axios.get(`${CONFIG.BACKEND_URL}/health`, { timeout: 5000 })
          .then(() => successCount++)
          .catch(() => failCount++)
      );
    }
    
    await Promise.all(promises);
    
    if ((successCount + failCount) % 400 === 0) {
      log(`Generated ${successCount + failCount}/${trafficCount} requests (${successCount} success, ${failCount} failed)`, 'info');
    }
    
    if (successCount + failCount < trafficCount) {
      await delay(50); // Small delay between batches
      return generateNormalTraffic();
    }
  };
  
  try {
    await generateNormalTraffic();
    log(`Normal traffic generation complete: ${successCount} successful requests`, 'success');
  } catch (error) {
    log(`Error during traffic generation: ${error.message}`, 'error');
  }
  
  // Step 2: Simulate user activity to clear NoActiveUsers alert
  log('Simulating user activity to clear NoActiveUsers alert...', 'info');
  const userActivityCount = 50;
  let activitySuccess = 0;
  
  for (let i = 0; i < userActivityCount; i++) {
    try {
      // Simulate various user endpoints
      const endpoints = [
        '/api/users/profile',
        '/api/learning-materials',
        '/api/messages',
        '/health'
      ];
      
      const endpoint = endpoints[i % endpoints.length];
      await axios.get(`${CONFIG.BACKEND_URL}${endpoint}`, { timeout: 3000 });
      activitySuccess++;
    } catch (error) {
      // Some endpoints might not exist or require auth, that's okay
    }
    
    if (i % 10 === 0) {
      await delay(100); // Small delay between batches
    }
  }
  
  log(`User activity simulation complete: ${activitySuccess}/${userActivityCount} successful requests`, 'success');
  
  // Step 3: Wait and check alert status
  log('Waiting 30 seconds for metrics to update...', 'info');
  await delay(30000);
  
  log('Checking current alert status...', 'info');
  await showSystemStatus();
  
  log('Alert resolution process complete!', 'success');
  log('Note: It may take 1-5 minutes for all alerts to fully clear depending on their evaluation intervals.', 'info');
}

// Main CLI interface
async function main() {
  console.log('🚨 BrainBytes Incident Simulator');
  console.log('================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  const incidentType = args[1];
  
  if (command === 'status') {
    await checkServices();
    await showSystemStatus();
    return;
  }
  
  if (command === 'trigger') {
    if (!incidentType || !INCIDENT_TYPES[incidentType]) {
      console.log('Available incident types:');
      Object.entries(INCIDENT_TYPES).forEach(([key, incident]) => {
        console.log(`  ${key}: ${incident.description}`);
      });
      return;
    }
    
    await checkServices();
    const incidentId = await INCIDENT_TYPES[incidentType].trigger();
    log(`Incident triggered: ${incidentId}`, 'incident');
    log('Wait 2-3 minutes for alerts to trigger, then check:', 'info');
    log(`- Prometheus: ${CONFIG.PROMETHEUS_URL}/alerts`, 'info');
    log(`- Alertmanager: ${CONFIG.ALERTMANAGER_URL}`, 'info');
    log(`- Grafana: ${CONFIG.GRAFANA_URL}`, 'info');
    return;
  }
  
  if (command === 'resolve') {
    if (!incidentType || !INCIDENT_TYPES[incidentType]) {
      console.log('Available incident types to resolve:');
      Object.entries(INCIDENT_TYPES).forEach(([key, incident]) => {
        console.log(`  ${key}: ${incident.description}`);
      });
      return;
    }
    
    await INCIDENT_TYPES[incidentType].resolve();
    log('Incident resolution initiated', 'success');
    return;
  }

  if (command === 'clear-alerts') {
    log('Clearing all active alerts by generating normal traffic...', 'info');
    await clearAllAlerts();
    return;
  }
  
  if (command === 'resolve-all') {
    log('Resolving all active incidents...', 'success');
    for (const [key] of Object.entries(INCIDENT_TYPES)) {
      await INCIDENT_TYPES[key].resolve();
    }
    activeIncidents.clear();
    log('All incidents resolved', 'success');
    return;
  }
  
  // Show help
  console.log('Usage:');
  console.log('  node incident-simulator.js status                    # Show system status');
  console.log('  node incident-simulator.js trigger <INCIDENT_TYPE>   # Trigger an incident');
  console.log('  node incident-simulator.js resolve <INCIDENT_TYPE>   # Resolve an incident');
  console.log('  node incident-simulator.js resolve-all               # Resolve all incidents');
  console.log('  node incident-simulator.js clear-alerts              # Clear all active alerts');
  console.log('');
  console.log('Available incident types:');
  Object.entries(INCIDENT_TYPES).forEach(([key, incident]) => {
    console.log(`  ${key}: ${incident.description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node incident-simulator.js trigger HIGH_CPU');
  console.log('  node incident-simulator.js resolve HIGH_ERROR_RATE');
  console.log('  node incident-simulator.js clear-alerts');
  console.log('  node incident-simulator.js status');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('Shutting down incident simulator...', 'warning');
  
  // Resolve all active incidents
  for (const [key] of Object.entries(INCIDENT_TYPES)) {
    await INCIDENT_TYPES[key].resolve();
  }
  
  log('All incidents resolved. Goodbye!', 'success');
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    log(`Incident simulator failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  INCIDENT_TYPES,
  checkServices,
  getCurrentAlerts,
  getContainerMetrics,
  showSystemStatus
};