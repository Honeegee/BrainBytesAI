const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const AI_SERVICE_URL = 'http://localhost:3002';
const PROMETHEUS_URL = 'http://localhost:9090';
const ALERTMANAGER_URL = 'http://localhost:9093';

// Test scenarios to trigger alerts
const alertTests = [
  {
    name: 'High Error Rate Test',
    description: 'Generate 500 errors to trigger high error rate alert',
    test: async () => {
      console.log('🔥 Generating 500 errors...');
      for (let i = 0; i < 50; i++) {
        try {
          await axios.get(`${BACKEND_URL}/nonexistent-endpoint`, { timeout: 1000 });
        } catch (error) {
          // Expected 404 errors
        }
        await delay(100); // 100ms delay between requests
      }
    }
  },
  {
    name: 'AI Service Error Test',
    description: 'Send invalid requests to AI service',
    test: async () => {
      console.log('🤖 Testing AI service errors...');
      for (let i = 0; i < 20; i++) {
        try {
          await axios.post(`${AI_SERVICE_URL}/api/chat`, {
            prompt: null, // Invalid payload
            invalidField: 'test'
          }, { timeout: 1000 });
        } catch (error) {
          // Expected errors
        }
        await delay(200);
      }
    }
  },
  {
    name: 'Slow Response Simulation',
    description: 'Generate slow requests (if endpoint exists)',
    test: async () => {
      console.log('🐌 Testing slow responses...');
      // This test assumes there might be a delay endpoint
      // In real scenarios, you might create a test endpoint that introduces delay
      for (let i = 0; i < 10; i++) {
        try {
          await axios.get(`${BACKEND_URL}/health`, { timeout: 100 }); // Very short timeout
        } catch (error) {
          // Expected timeout errors
        }
        await delay(500);
      }
    }
  },
  {
    name: 'Traffic Spike Test',
    description: 'Generate high volume of requests',
    test: async () => {
      console.log('📈 Generating traffic spike...');
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
            .catch(() => {}) // Ignore errors
        );
      }
      await Promise.all(promises);
    }
  },
  {
    name: 'Mobile Error Simulation',
    description: 'Simulate mobile device errors',
    test: async () => {
      console.log('📱 Simulating mobile errors...');
      const mobileHeaders = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      };
      
      for (let i = 0; i < 30; i++) {
        try {
          await axios.get(`${BACKEND_URL}/mobile-error-test`, { 
            headers: mobileHeaders,
            timeout: 1000 
          });
        } catch (error) {
          // Expected errors
        }
        await delay(150);
      }
    }
  }
];

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to check service availability
async function checkServices() {
  const services = [
    { name: 'Backend', url: `${BACKEND_URL}/health` },
    { name: 'AI Service', url: `${AI_SERVICE_URL}/health` },
    { name: 'Prometheus', url: `${PROMETHEUS_URL}/-/ready` },
    { name: 'Alertmanager', url: `${ALERTMANAGER_URL}/-/ready` }
  ];

  console.log('🔍 Checking service availability...\n');
  
  for (const service of services) {
    try {
      await axios.get(service.url, { timeout: 5000 });
      console.log(`✅ ${service.name}: Available`);
    } catch (error) {
      console.log(`❌ ${service.name}: Not available (${error.message})`);
    }
  }
  console.log('');
}

// Function to display current alerts
async function showCurrentAlerts() {
  try {
    console.log('📊 Checking current alerts...\n');
    
    // Get alerts from Prometheus
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/alerts`, { timeout: 5000 });
    const alerts = response.data.data.alerts;
    
    if (alerts.length === 0) {
      console.log('✅ No active alerts');
    } else {
      console.log(`🚨 ${alerts.length} active alert(s):`);
      alerts.forEach((alert, index) => {
        console.log(`  ${index + 1}. ${alert.labels.alertname} - ${alert.state}`);
        if (alert.annotations && alert.annotations.summary) {
          console.log(`     Summary: ${alert.annotations.summary}`);
        }
      });
    }
    console.log('');
  } catch (error) {
    console.log('❌ Could not fetch alerts from Prometheus');
    console.log('');
  }
}

// Function to run a specific test
async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const startTime = Date.now();
  await test.test();
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`✅ Test completed in ${duration.toFixed(2)}s`);
  console.log('⏳ Waiting 30 seconds for alerts to potentially trigger...');
  await delay(30000); // Wait for alerts to process
  
  await showCurrentAlerts();
}

// Main execution function
async function main() {
  console.log('🚨 BrainBytes Alert Testing Suite');
  console.log('===================================\n');
  
  console.log('This script will generate various conditions to test alerting rules.');
  console.log('Make sure the following are running:');
  console.log('- Docker Compose services (docker-compose up -d)');
  console.log('- Alert webhook receiver (npm run webhook in monitoring/)');
  console.log('');
  
  // Check services first
  await checkServices();
  
  // Show initial state
  await showCurrentAlerts();
  
  // Ask user which tests to run
  console.log('Available tests:');
  alertTests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name} - ${test.description}`);
  });
  console.log('  0. Run all tests');
  console.log('');
  
  // For automation, run all tests
  console.log('🔄 Running all tests automatically...\n');
  
  for (const test of alertTests) {
    await runTest(test);
  }
  
  console.log('🎉 All tests completed!');
  console.log('');
  console.log('📊 Check the following for results:');
  console.log('- Prometheus Alerts: http://localhost:9090/alerts');
  console.log('- Alertmanager: http://localhost:9093');
  console.log('- Alert Dashboard: http://localhost:5001');
  console.log('');
  console.log('Note: Some alerts may take a few minutes to trigger based on their');
  console.log('evaluation intervals and "for" clauses in the alert rules.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Alert testing stopped by user');
  process.exit(0);
});

// Start the test suite
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runTest,
  checkServices,
  showCurrentAlerts,
  alertTests
};