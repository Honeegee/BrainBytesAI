#!/usr/bin/env node

/**
 * BrainBytes Monitoring Test Suite
 * 
 * This script comprehensively tests the Prometheus monitoring setup
 * to verify all components are working correctly.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost',
  prometheusUrl: 'http://localhost:8090/prometheus',
  alertmanagerUrl: 'http://localhost:8090/alertmanager',
  cadvisorUrl: 'http://localhost:8090/cadvisor',
  timeout: 10000,
  maxRetries: 3
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    debug: '🐛'
  };
  
  console.log(`${prefix[type]} [${timestamp}] ${message}`);
}

function addTestResult(name, passed, message, data = null) {
  const result = {
    name,
    passed,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (passed) {
    testResults.passed++;
    log(`${name}: ${message}`, 'success');
  } else {
    testResults.failed++;
    log(`${name}: ${message}`, 'error');
  }
}

// HTTP helper with retry logic
async function httpRequest(url, options = {}) {
  const maxRetries = options.maxRetries || config.maxRetries;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios({
        url,
        timeout: config.timeout,
        validateStatus: () => true, // Don't throw on 4xx/5xx
        ...options
      });
      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        log(`Request failed, retrying in 2s... (${i + 1}/${maxRetries})`, 'warning');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  throw lastError;
}

// Test suite functions
async function testServiceHealth() {
  log('Testing service health endpoints...', 'info');
  
  const services = [
    { name: 'Backend Health', url: `${config.baseUrl}/health` },
    { name: 'Backend Metrics', url: `${config.baseUrl}/metrics` },
    { name: 'AI Service Metrics', url: `${config.baseUrl}:3002/metrics` },
    { name: 'Prometheus API', url: `${config.prometheusUrl}/api/v1/status/config` },
    { name: 'Alertmanager API', url: `${config.alertmanagerUrl}/api/v1/status` }
  ];
  
  for (const service of services) {
    try {
      const response = await httpRequest(service.url);
      
      if (response.status >= 200 && response.status < 400) {
        addTestResult(
          service.name,
          true,
          `Endpoint accessible (HTTP ${response.status})`
        );
      } else {
        addTestResult(
          service.name,
          false,
          `Endpoint returned HTTP ${response.status}`
        );
      }
    } catch (error) {
      addTestResult(
        service.name,
        false,
        `Endpoint unreachable: ${error.message}`
      );
    }
  }
}

async function testPrometheusTargets() {
  log('Testing Prometheus targets...', 'info');
  
  try {
    const response = await httpRequest(`${config.prometheusUrl}/api/v1/targets`);
    
    if (response.status !== 200) {
      addTestResult(
        'Prometheus Targets',
        false,
        `Failed to fetch targets (HTTP ${response.status})`
      );
      return;
    }
    
    const targets = response.data.data.activeTargets;
    const expectedTargets = [
      'brainbytes-backend',
      'brainbytes-ai-service', 
      'prometheus',
      'node-exporter',
      'cadvisor'
    ];
    
    let upTargets = 0;
    let totalTargets = 0;
    
    for (const target of targets) {
      totalTargets++;
      if (target.health === 'up') {
        upTargets++;
      }
      
      const jobName = target.labels.job;
      const isUp = target.health === 'up';
      
      addTestResult(
        `Target: ${jobName}`,
        isUp,
        isUp ? `Target is UP` : `Target is DOWN (${target.lastError || 'unknown error'})`
      );
    }
    
    addTestResult(
      'Prometheus Targets Overview',
      upTargets === totalTargets,
      `${upTargets}/${totalTargets} targets are UP`
    );
    
  } catch (error) {
    addTestResult(
      'Prometheus Targets',
      false,
      `Failed to test targets: ${error.message}`
    );
  }
}

async function testMetricsCollection() {
  log('Testing metrics collection...', 'info');
  
  const expectedMetrics = [
    'brainbytes_http_requests_total',
    'brainbytes_http_request_duration_seconds',
    'brainbytes_active_sessions',
    'process_cpu_seconds_total',
    'nodejs_heap_size_total_bytes'
  ];
  
  try {
    const response = await httpRequest(`${config.baseUrl}/metrics`);
    
    if (response.status !== 200) {
      addTestResult(
        'Metrics Collection',
        false,
        `Failed to fetch metrics (HTTP ${response.status})`
      );
      return;
    }
    
    const metricsText = response.data;
    
    for (const metric of expectedMetrics) {
      const found = metricsText.includes(metric);
      addTestResult(
        `Metric: ${metric}`,
        found,
        found ? 'Metric found in output' : 'Metric not found'
      );
    }
    
  } catch (error) {
    addTestResult(
      'Metrics Collection',
      false,
      `Failed to test metrics: ${error.message}`
    );
  }
}

async function testPrometheusQueries() {
  log('Testing Prometheus queries...', 'info');
  
  const queries = [
    {
      name: 'Request Rate',
      query: 'rate(brainbytes_http_requests_total[5m])',
      expectData: false // May be empty if no traffic
    },
    {
      name: 'Process CPU',
      query: 'rate(process_cpu_seconds_total[5m])',
      expectData: true
    },
    {
      name: 'Memory Usage',
      query: 'process_resident_memory_bytes',
      expectData: true
    },
    {
      name: 'Active Sessions',
      query: 'brainbytes_active_sessions',
      expectData: false
    }
  ];
  
  for (const queryTest of queries) {
    try {
      const url = `${config.prometheusUrl}/api/v1/query`;
      const response = await httpRequest(url, {
        params: { query: queryTest.query }
      });
      
      if (response.status !== 200) {
        addTestResult(
          `Query: ${queryTest.name}`,
          false,
          `Query failed (HTTP ${response.status})`
        );
        continue;
      }
      
      const result = response.data;
      
      if (result.status !== 'success') {
        addTestResult(
          `Query: ${queryTest.name}`,
          false,
          `Query error: ${result.error || 'unknown error'}`
        );
        continue;
      }
      
      const hasData = result.data.result && result.data.result.length > 0;
      
      if (queryTest.expectData && !hasData) {
        addTestResult(
          `Query: ${queryTest.name}`,
          false,
          'Query successful but no data returned (expected data)'
        );
      } else {
        addTestResult(
          `Query: ${queryTest.name}`,
          true,
          `Query successful${hasData ? ' with data' : ' (no data)'}`
        );
      }
      
    } catch (error) {
      addTestResult(
        `Query: ${queryTest.name}`,
        false,
        `Query failed: ${error.message}`
      );
    }
  }
}

async function testAlertRules() {
  log('Testing alert rules...', 'info');
  
  try {
    const response = await httpRequest(`${config.prometheusUrl}/api/v1/rules`);
    
    if (response.status !== 200) {
      addTestResult(
        'Alert Rules',
        false,
        `Failed to fetch rules (HTTP ${response.status})`
      );
      return;
    }
    
    const rules = response.data.data.groups;
    let totalRules = 0;
    let healthyRules = 0;
    
    for (const group of rules) {
      for (const rule of group.rules) {
        totalRules++;
        
        if (rule.health === 'ok') {
          healthyRules++;
        } else {
          addTestResult(
            `Alert Rule: ${rule.name}`,
            false,
            `Rule unhealthy: ${rule.lastError || 'unknown error'}`
          );
        }
      }
    }
    
    addTestResult(
      'Alert Rules Overview',
      healthyRules === totalRules,
      `${healthyRules}/${totalRules} alert rules are healthy`
    );
    
  } catch (error) {
    addTestResult(
      'Alert Rules',
      false,
      `Failed to test alert rules: ${error.message}`
    );
  }
}

async function generateTestTraffic() {
  log('Generating test traffic...', 'info');
  
  const endpoints = [
    { method: 'GET', url: `${config.baseUrl}/health` },
    { method: 'GET', url: `${config.baseUrl}/metrics` },
    { method: 'POST', url: `${config.baseUrl}/api/auth/register`, data: {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    }}
  ];
  
  let successfulRequests = 0;
  
  for (let i = 0; i < 5; i++) {
    for (const endpoint of endpoints) {
      try {
        const response = await httpRequest(endpoint.url, {
          method: endpoint.method,
          data: endpoint.data,
          headers: endpoint.data ? { 'Content-Type': 'application/json' } : {}
        });
        
        if (response.status >= 200 && response.status < 500) {
          successfulRequests++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        // Ignore errors during traffic generation
      }
    }
  }
  
  addTestResult(
    'Test Traffic Generation',
    successfulRequests > 0,
    `Generated ${successfulRequests} successful requests`
  );
  
  // Wait a bit for metrics to be scraped
  log('Waiting for metrics to be scraped...', 'info');
  await new Promise(resolve => setTimeout(resolve, 5000));
}

function generateReport() {
  log('Generating test report...', 'info');
  
  const report = {
    summary: {
      total: testResults.tests.length,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      passRate: ((testResults.passed / testResults.tests.length) * 100).toFixed(2)
    },
    timestamp: new Date().toISOString(),
    tests: testResults.tests
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'monitoring', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MONITORING TEST REPORT');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⏭️  Skipped: ${report.summary.skipped}`);
  console.log(`📈 Pass Rate: ${report.summary.passRate}%`);
  console.log(`📁 Report saved to: ${reportPath}`);
  console.log('='.repeat(60));
  
  if (report.summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.message}`);
      });
  }
  
  return report.summary.failed === 0;
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting BrainBytes Monitoring Test Suite...\n');
  
  try {
    // Test basic service health
    await testServiceHealth();
    
    // Test Prometheus functionality
    await testPrometheusTargets();
    await testMetricsCollection();
    await testPrometheusQueries();
    await testAlertRules();
    
    // Generate some test traffic and retest metrics
    await generateTestTraffic();
    await testMetricsCollection();
    
    // Generate final report
    const allTestsPassed = generateReport();
    
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults,
  config
};