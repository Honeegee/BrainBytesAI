#!/usr/bin/env node

/**
 * Test Monitoring Setup for BrainBytesAI on Heroku
 * 
 * This script tests all monitoring endpoints and validates the setup
 */

const https = require('https');

class MonitoringTester {
    constructor() {
        this.apps = {
            staging: {
                frontend: 'brainbytes-frontend-staging-7593f4655363',
                backend: 'brainbytes-backend-staging-de872da2939f',
                ai: 'brainbytes-ai-service-staging-4b75c77cf53a'
            },
            production: {
                frontend: 'brainbytes-frontend-production-03d1e6b6b158',
                backend: 'brainbytes-backend-production-d355616d0f1f',
                ai: 'brainbytes-ai-production-3833f742ba79'
            }
        };
    }

    async testEnvironment(environment = 'staging') {
        console.log(`🧪 Testing monitoring setup for ${environment} environment\n`);
        
        const apps = this.apps[environment];
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };

        for (const [service, appName] of Object.entries(apps)) {
            console.log(`Testing ${service} (${appName}):`);
            
            // Test main health endpoint
            const healthUrl = service === 'frontend' 
                ? `https://${appName}.herokuapp.com/api/health`
                : `https://${appName}.herokuapp.com/health`;
            
            const healthResult = await this.testEndpoint(healthUrl, 'Health Check');
            results.total++;
            if (healthResult.success) results.passed++; else results.failed++;
            results.details.push({
                service,
                endpoint: 'health',
                url: healthUrl,
                ...healthResult
            });

            // Test metrics endpoint for backend services
            if (service !== 'frontend') {
                const metricsUrl = `https://${appName}.herokuapp.com/metrics`;
                const metricsResult = await this.testEndpoint(metricsUrl, 'Metrics');
                results.total++;
                if (metricsResult.success) results.passed++; else results.failed++;
                results.details.push({
                    service,
                    endpoint: 'metrics',
                    url: metricsUrl,
                    ...metricsResult
                });
            }

            // Test root endpoint
            const rootUrl = `https://${appName}.herokuapp.com/`;
            const rootResult = await this.testEndpoint(rootUrl, 'Root');
            results.total++;
            if (rootResult.success) results.passed++; else results.failed++;
            results.details.push({
                service,
                endpoint: 'root',
                url: rootUrl,
                ...rootResult
            });

            console.log(''); // Empty line between services
        }

        this.printSummary(environment, results);
        return results;
    }

    async testEndpoint(url, description) {
        try {
            const startTime = Date.now();
            const response = await this.makeRequest(url);
            const responseTime = Date.now() - startTime;
            
            if (response && response.statusCode >= 200 && response.statusCode < 400) {
                console.log(`  ✅ ${description}: OK (${responseTime}ms)`);
                
                // Additional validation for specific endpoints
                if (url.includes('/metrics')) {
                    const hasMetrics = response.data && response.data.includes('# HELP');
                    if (hasMetrics) {
                        const metricsCount = (response.data.match(/^# HELP/gm) || []).length;
                        console.log(`     📊 Found ${metricsCount} metric types`);
                    } else {
                        console.log(`     ⚠️  Response doesn't contain Prometheus metrics`);
                    }
                }
                
                if (url.includes('/health')) {
                    try {
                        const healthData = JSON.parse(response.data);
                        if (healthData.status) {
                            console.log(`     💚 Status: ${healthData.status}`);
                        }
                        if (healthData.environment) {
                            console.log(`     🌍 Environment: ${healthData.environment}`);
                        }
                    } catch (e) {
                        // Not JSON, that's ok
                    }
                }
                
                return {
                    success: true,
                    statusCode: response.statusCode,
                    responseTime,
                    message: 'OK'
                };
            } else {
                console.log(`  ❌ ${description}: HTTP ${response.statusCode}`);
                return {
                    success: false,
                    statusCode: response.statusCode,
                    responseTime,
                    message: `HTTP ${response.statusCode}`
                };
            }
        } catch (error) {
            console.log(`  ❌ ${description}: ${error.message}`);
            return {
                success: false,
                statusCode: null,
                responseTime: null,
                message: error.message
            };
        }
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 15000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    printSummary(environment, results) {
        console.log('='.repeat(60));
        console.log(`📊 Test Summary for ${environment.toUpperCase()}`);
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.total}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
        console.log('');

        if (results.failed > 0) {
            console.log('❌ Failed Tests:');
            results.details.filter(r => !r.success).forEach(result => {
                console.log(`  ${result.service} - ${result.endpoint}: ${result.message}`);
                console.log(`    URL: ${result.url}`);
            });
            console.log('');
        }

        if (results.passed === results.total) {
            console.log('🎉 All monitoring endpoints are working correctly!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Set up Grafana Cloud dashboard');
            console.log('2. Configure uptime monitoring');
            console.log('3. Set up alert notifications');
        } else {
            console.log('⚠️  Some endpoints are not working. Please check:');
            console.log('1. App deployment status');
            console.log('2. Environment variables');
            console.log('3. Application logs');
        }
        console.log('');
    }

    async testAll() {
        console.log('🚀 Testing monitoring setup for all environments\n');
        
        const stagingResults = await this.testEnvironment('staging');
        console.log('\n' + '='.repeat(60) + '\n');
        const productionResults = await this.testEnvironment('production');
        
        console.log('\n' + '='.repeat(60));
        console.log('🌍 Overall Summary');
        console.log('='.repeat(60));
        console.log(`Staging: ${stagingResults.passed}/${stagingResults.total} passed`);
        console.log(`Production: ${productionResults.passed}/${productionResults.total} passed`);
        
        const totalPassed = stagingResults.passed + productionResults.passed;
        const totalTests = stagingResults.total + productionResults.total;
        console.log(`Overall: ${totalPassed}/${totalTests} passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    }

    showHelp() {
        console.log(`
🧪 BrainBytesAI Monitoring Tester

Usage: node monitoring/heroku/test-monitoring.js [command]

Commands:
  test [env]     Test monitoring for specific environment (staging|production)
  test-all       Test monitoring for all environments
  help          Show this help

Examples:
  node monitoring/heroku/test-monitoring.js test staging
  node monitoring/heroku/test-monitoring.js test production
  node monitoring/heroku/test-monitoring.js test-all

This script tests:
- Health check endpoints
- Metrics endpoints (Prometheus)
- Application availability
- Response times
        `);
    }
}

// Main execution
async function main() {
    const tester = new MonitoringTester();
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    
    console.log('🧠 BrainBytesAI - Monitoring Tester\n');

    try {
        switch (command) {
            case 'test':
                const environment = args[1] || 'staging';
                await tester.testEnvironment(environment);
                break;
                
            case 'test-all':
                await tester.testAll();
                break;
                
            case 'help':
            default:
                tester.showHelp();
                break;
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MonitoringTester;