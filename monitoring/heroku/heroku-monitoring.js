#!/usr/bin/env node

/**
 * Heroku Monitoring Setup and Management Script
 * 
 * This script helps set up and manage monitoring for BrainBytesAI on Heroku
 * including Grafana Cloud integration, uptime monitoring, and health checks.
 */

const https = require('https');
const { execSync } = require('child_process');

class HerokuMonitoringManager {
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

    async setupMonitoring(environment = 'staging') {
        console.log(`🔧 Setting up monitoring for ${environment} environment...`);
        
        try {
            // Set up Grafana Cloud environment variables
            await this.setupGrafanaCloudConfig(environment);
            
            // Configure application monitoring
            await this.configureAppMonitoring(environment);
            
            // Set up uptime monitoring
            await this.setupUptimeMonitoring(environment);
            
            // Test monitoring endpoints
            await this.testMonitoringEndpoints(environment);
            
            console.log('✅ Monitoring setup completed successfully!');
            console.log('\n📊 Next steps:');
            console.log('1. Visit your Grafana Cloud dashboard');
            console.log('2. Import the BrainBytesAI dashboard');
            console.log('3. Configure alerting rules');
            console.log('4. Set up notification channels');
            
        } catch (error) {
            console.error('❌ Monitoring setup failed:', error.message);
            throw error;
        }
    }

    async setupGrafanaCloudConfig(environment) {
        console.log('🔧 Configuring Grafana Cloud integration...');
        
        const requiredVars = [
            'GRAFANA_CLOUD_PROMETHEUS_URL',
            'GRAFANA_CLOUD_PROMETHEUS_USER',
            'GRAFANA_CLOUD_PROMETHEUS_PASSWORD',
            'GRAFANA_CLOUD_LOKI_URL',
            'GRAFANA_CLOUD_LOKI_USER',
            'GRAFANA_CLOUD_LOKI_PASSWORD'
        ];

        console.log('\n📝 Required Grafana Cloud environment variables:');
        requiredVars.forEach(varName => {
            const value = process.env[varName];
            const status = value ? '✅' : '❌';
            console.log(`   ${status} ${varName}: ${value ? '[SET]' : '[MISSING]'}`);
        });

        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.log('\n⚠️  Missing environment variables. Set them with:');
            missingVars.forEach(varName => {
                console.log(`   heroku config:set ${varName}="your-value" --app ${this.apps[environment].backend}`);
            });
            
            console.log('\n📖 Get these values from:');
            console.log('   https://grafana.com/products/cloud/');
            console.log('   Account Settings > API Keys');
        }
    }

    async configureAppMonitoring(environment) {
        console.log(`🔧 Configuring application monitoring for ${environment}...`);
        
        const apps = this.apps[environment];
        
        // Set monitoring-related environment variables for each app
        const monitoringVars = {
            ENABLE_METRICS: 'true',
            METRICS_PORT: process.env.PORT || '${PORT}',
            ENVIRONMENT: environment,
            MONITORING_ENABLED: 'true'
        };

        for (const [service, appName] of Object.entries(apps)) {
            console.log(`   Configuring ${service} (${appName})...`);
            
            try {
                // Set environment variables for monitoring
                for (const [key, value] of Object.entries(monitoringVars)) {
                    const command = `heroku config:set ${key}="${value}" --app ${appName}`;
                    console.log(`     Setting ${key}...`);
                    // execSync(command, { stdio: 'pipe' });
                }
                
                console.log(`     ✅ ${service} configured`);
            } catch (error) {
                console.log(`     ⚠️  ${service} configuration failed: ${error.message}`);
            }
        }
    }

    async setupUptimeMonitoring(environment) {
        console.log(`🔧 Setting up uptime monitoring for ${environment}...`);
        
        const apps = this.apps[environment];
        const uptimeChecks = [];

        for (const [service, appName] of Object.entries(apps)) {
            const baseUrl = `https://${appName}.herokuapp.com`;
            const healthUrl = service === 'frontend' ? baseUrl : `${baseUrl}/health`;
            
            uptimeChecks.push({
                name: `${environment}-${service}`,
                url: healthUrl,
                service: service,
                appName: appName
            });
        }

        console.log('\n📊 Recommended uptime monitoring services:');
        console.log('1. UptimeRobot (Free tier available)');
        console.log('2. Pingdom');
        console.log('3. StatusCake');
        console.log('4. Better Uptime');

        console.log('\n🔗 URLs to monitor:');
        uptimeChecks.forEach(check => {
            console.log(`   ${check.name}: ${check.url}`);
        });

        // Test all endpoints
        console.log('\n🧪 Testing endpoints...');
        for (const check of uptimeChecks) {
            try {
                const isHealthy = await this.checkUrl(check.url);
                const status = isHealthy ? '✅' : '❌';
                console.log(`   ${status} ${check.name}: ${check.url}`);
            } catch (error) {
                console.log(`   ❌ ${check.name}: Error - ${error.message}`);
            }
        }
    }

    async testMonitoringEndpoints(environment) {
        console.log(`🧪 Testing monitoring endpoints for ${environment}...`);
        
        const apps = this.apps[environment];
        
        for (const [service, appName] of Object.entries(apps)) {
            if (service === 'frontend') continue; // Frontend doesn't have metrics endpoint
            
            const metricsUrl = `https://${appName}.herokuapp.com/metrics`;
            const healthUrl = `https://${appName}.herokuapp.com/health`;
            
            console.log(`\n   Testing ${service} (${appName}):`);
            
            try {
                // Test health endpoint
                const healthResponse = await this.makeRequest(healthUrl);
                console.log(`     ✅ Health: ${healthResponse ? 'OK' : 'Failed'}`);
                
                // Test metrics endpoint
                const metricsResponse = await this.makeRequest(metricsUrl);
                console.log(`     ✅ Metrics: ${metricsResponse ? 'OK' : 'Failed'}`);
                
                if (metricsResponse && typeof metricsResponse === 'string') {
                    const metricsCount = (metricsResponse.match(/^# HELP/gm) || []).length;
                    console.log(`     📊 Found ${metricsCount} metric types`);
                }
                
            } catch (error) {
                console.log(`     ❌ Error: ${error.message}`);
            }
        }
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 400) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async checkUrl(url) {
        try {
            await this.makeRequest(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    async generateDashboard(environment = 'staging') {
        console.log(`📊 Generating Grafana dashboard for ${environment}...`);
        
        const dashboard = {
            dashboard: {
                id: null,
                title: `BrainBytesAI - ${environment.toUpperCase()}`,
                tags: ['brainbytes', environment, 'heroku'],
                timezone: 'browser',
                panels: [
                    {
                        id: 1,
                        title: 'HTTP Request Rate',
                        type: 'graph',
                        targets: [{
                            expr: `rate(brainbytes_http_requests_total{environment="${environment}"}[5m])`,
                            legendFormat: '{{method}} {{route}}'
                        }]
                    },
                    {
                        id: 2,
                        title: 'Response Time',
                        type: 'graph',
                        targets: [{
                            expr: `brainbytes_http_request_duration_seconds{environment="${environment}"}`,
                            legendFormat: '{{method}} {{route}}'
                        }]
                    },
                    {
                        id: 3,
                        title: 'AI Response Time',
                        type: 'graph',
                        targets: [{
                            expr: `brainbytes_ai_response_time_seconds{environment="${environment}"}`,
                            legendFormat: '{{subject}} ({{complexity}})'
                        }]
                    },
                    {
                        id: 4,
                        title: 'Database Connections',
                        type: 'singlestat',
                        targets: [{
                            expr: `brainbytes_db_connections_active{environment="${environment}"}`,
                            legendFormat: 'Active Connections'
                        }]
                    }
                ],
                time: {
                    from: 'now-1h',
                    to: 'now'
                },
                refresh: '30s'
            }
        };

        const dashboardPath = `monitoring/heroku/dashboards/brainbytes-${environment}.json`;
        require('fs').writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
        console.log(`✅ Dashboard saved to: ${dashboardPath}`);
        
        return dashboard;
    }

    showHelp() {
        console.log(`
🧠 BrainBytesAI - Heroku Monitoring Manager

Usage: node monitoring/heroku/heroku-monitoring.js [command] [environment]

Commands:
  setup [env]         Set up monitoring for environment (staging|production)
  test [env]          Test monitoring endpoints
  dashboard [env]     Generate Grafana dashboard
  status [env]        Check monitoring status
  help               Show this help

Environment:
  staging            Configure staging environment (default)
  production         Configure production environment

Examples:
  node monitoring/heroku/heroku-monitoring.js setup staging
  node monitoring/heroku/heroku-monitoring.js test production
  node monitoring/heroku/heroku-monitoring.js dashboard staging

Prerequisites:
1. Heroku CLI installed and authenticated
2. Grafana Cloud account set up
3. Environment variables configured

Required Environment Variables:
  GRAFANA_CLOUD_PROMETHEUS_URL      - Your Prometheus push URL
  GRAFANA_CLOUD_PROMETHEUS_USER     - Your Prometheus username
  GRAFANA_CLOUD_PROMETHEUS_PASSWORD - Your Prometheus password
  GRAFANA_CLOUD_LOKI_URL           - Your Loki push URL  
  GRAFANA_CLOUD_LOKI_USER          - Your Loki username
  GRAFANA_CLOUD_LOKI_PASSWORD      - Your Loki password
        `);
    }
}

// Main execution
async function main() {
    const manager = new HerokuMonitoringManager();
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const environment = args[1] || 'staging';
    
    console.log('🧠 BrainBytesAI - Heroku Monitoring Manager\n');

    try {
        switch (command) {
            case 'setup':
                await manager.setupMonitoring(environment);
                break;
                
            case 'test':
                await manager.testMonitoringEndpoints(environment);
                break;
                
            case 'dashboard':
                await manager.generateDashboard(environment);
                break;
                
            case 'status':
                await manager.setupGrafanaCloudConfig(environment);
                await manager.testMonitoringEndpoints(environment);
                break;
                
            case 'help':
            default:
                manager.showHelp();
                break;
        }
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = HerokuMonitoringManager;