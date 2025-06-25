#!/usr/bin/env node

/**
 * Heroku Deployment Helper Script
 * 
 * This script helps trigger and monitor Heroku deployments after successful Atlas staging deployment.
 * It can trigger the deployment workflow and provide status updates.
 */

const https = require('https');
const { execSync } = require('child_process');

class HerokuDeploymentHelper {
    constructor() {
        this.repoOwner = 'Honeegee';
        this.repoName = 'BrainBytesAI';
        this.token = process.env.GITHUB_TOKEN;
        
        if (!this.token) {
            console.log('⚠️  GITHUB_TOKEN environment variable not set');
            console.log('   You can still trigger deployment manually through GitHub Actions UI');
        }
    }

    async triggerDeployment(environment = 'staging', forceDeployment = false) {
        console.log('🚀 Triggering Heroku Deployment...');
        console.log(`   Environment: ${environment}`);
        console.log(`   Force deployment: ${forceDeployment}`);
        
        if (!this.token) {
            console.log('\n📱 Manual trigger required:');
            console.log('1. Go to: https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/deploy-heroku.yml');
            console.log('2. Click "Run workflow"');
            console.log(`3. Select environment: ${environment}`);
            console.log(`4. Set force deployment: ${forceDeployment}`);
            console.log('5. Click "Run workflow" button');
            return;
        }

        const payload = {
            ref: 'test-atlas-cicd',
            inputs: {
                environment: environment,
                force_deploy: forceDeployment.toString()
            }
        };

        try {
            await this.makeGitHubRequest('POST', `/repos/${this.repoOwner}/${this.repoName}/actions/workflows/deploy-heroku.yml/dispatches`, payload);
            console.log('✅ Deployment workflow triggered successfully!');
            console.log('\n📊 Monitor deployment at:');
            console.log(`   https://github.com/${this.repoOwner}/${this.repoName}/actions/workflows/deploy-heroku.yml`);
        } catch (error) {
            console.error('❌ Failed to trigger deployment:', error.message);
        }
    }

    async checkDeploymentStatus() {
        console.log('📊 Checking recent deployment status...');
        
        if (!this.token) {
            console.log('⚠️  GITHUB_TOKEN not available for status check');
            console.log('   Check manually at: https://github.com/YOUR_USERNAME/BrainBytesAI/actions');
            return;
        }

        try {
            const runs = await this.makeGitHubRequest('GET', `/repos/${this.repoOwner}/${this.repoName}/actions/workflows/deploy-heroku.yml/runs?per_page=5`);
            
            if (runs.workflow_runs.length === 0) {
                console.log('📭 No recent deployment runs found');
                return;
            }

            console.log('\n🔍 Recent deployment runs:');
            runs.workflow_runs.forEach((run, index) => {
                const status = this.getStatusEmoji(run.status, run.conclusion);
                const date = new Date(run.created_at).toLocaleString();
                console.log(`   ${index + 1}. ${status} ${run.display_title} - ${date}`);
                console.log(`      URL: ${run.html_url}`);
            });
        } catch (error) {
            console.error('❌ Failed to check deployment status:', error.message);
        }
    }

    async checkHerokuApps() {
        console.log('🔍 Checking Heroku app status...');
        
        const apps = {
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

        for (const [env, services] of Object.entries(apps)) {
            console.log(`\n📱 ${env.toUpperCase()} Environment:`);
            
            for (const [service, appName] of Object.entries(services)) {
                const url = `https://${appName}.herokuapp.com${service === 'frontend' ? '' : '/health'}`;
                console.log(`   ${service.padEnd(10)} : ${url}`);
                
                try {
                    const response = await this.checkUrl(url);
                    console.log(`   ${''.padEnd(12)} ${response ? '✅ Online' : '❌ Offline'}`);
                } catch (error) {
                    console.log(`   ${''.padEnd(12)} ❌ Error: ${error.message}`);
                }
            }
        }
    }

    async setupMonitoring(environment = 'staging') {
        console.log(`🔧 Setting up monitoring for ${environment} environment...`);
        
        const apps = environment === 'staging' ?
            {
                frontend: 'brainbytes-frontend-staging-7593f4655363',
                backend: 'brainbytes-backend-staging-de872da2939f',
                ai: 'brainbytes-ai-service-staging-4b75c77cf53a'
            } :
            {
                frontend: 'brainbytes-frontend-production-03d1e6b6b158',
                backend: 'brainbytes-backend-production-d355616d0f1f',
                ai: 'brainbytes-ai-production-3833f742ba79'
            };

        console.log('\n📊 This will integrate with:');
        console.log('1. Grafana Cloud for metrics and dashboards');
        console.log('2. Heroku built-in logging');
        console.log('3. Custom application metrics');
        console.log('4. Uptime monitoring services');

        console.log('\n🔧 Required setup:');
        console.log('1. Run: node monitoring/heroku/heroku-monitoring.js setup ' + environment);
        console.log('2. Or run: ./monitoring/heroku/setup-heroku-monitoring.sh ' + environment);
        console.log('3. Import dashboard: monitoring/heroku/dashboards/brainbytes-heroku-dashboard.json');
        console.log('4. Configure alerts: monitoring/heroku/alerts/heroku-alert-rules.yml');

        console.log('\n📱 Applications to monitor:');
        for (const [service, appName] of Object.entries(apps)) {
            console.log(`   ${service.padEnd(10)}: ${appName}`);
        }

        console.log('\n🧪 Testing monitoring endpoints...');
        for (const [service, appName] of Object.entries(apps)) {
            const healthUrl = service === 'frontend'
                ? `https://${appName}.herokuapp.com`
                : `https://${appName}.herokuapp.com/health`;
            
            try {
                const isHealthy = await this.checkUrl(healthUrl);
                console.log(`   ${service.padEnd(10)}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
                
                // Test metrics endpoint for backend services
                if (service !== 'frontend') {
                    const metricsUrl = `https://${appName}.herokuapp.com/metrics`;
                    const hasMetrics = await this.checkUrl(metricsUrl);
                    console.log(`   ${''.padEnd(10)}  Metrics: ${hasMetrics ? '✅ Available' : '❌ Unavailable'}`);
                }
            } catch (error) {
                console.log(`   ${service.padEnd(10)}: ❌ Error - ${error.message}`);
            }
        }

        console.log('\n📖 Documentation:');
        console.log('   Setup Guide: monitoring/heroku/README.md');
        console.log('   Heroku Docs: https://devcenter.heroku.com/articles/metrics');
        console.log('   Grafana Cloud: https://grafana.com/products/cloud/');
    }

    async makeGitHubRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: path,
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'User-Agent': 'BrainBytesAI-Deploy-Script',
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });

            req.on('error', reject);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    async checkUrl(url) {
        return new Promise((resolve) => {
            const request = https.get(url, { timeout: 10000 }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 400);
            });
            
            request.on('error', () => resolve(false));
            request.on('timeout', () => {
                request.destroy();
                resolve(false);
            });
        });
    }

    getStatusEmoji(status, conclusion) {
        if (status === 'completed') {
            return conclusion === 'success' ? '✅' : '❌';
        } else if (status === 'in_progress') {
            return '🔄';
        } else {
            return '⏳';
        }
    }

    showHelp() {
        console.log(`
🚀 Heroku Deployment Helper

Usage: node scripts/deploy-heroku.js [command] [options]

Commands:
  deploy [env]     Trigger deployment (env: staging|production, default: staging)
  status          Check recent deployment status
  apps            Check Heroku app health
  monitoring [env] Set up monitoring for environment (staging|production)
  help            Show this help

Options:
  --force         Force deployment (skip some checks)

Examples:
  node scripts/deploy-heroku.js deploy staging
  node scripts/deploy-heroku.js deploy production --force
  node scripts/deploy-heroku.js status
  node scripts/deploy-heroku.js apps
  node scripts/deploy-heroku.js monitoring staging

Environment Variables:
  GITHUB_TOKEN    GitHub personal access token (optional, for API access)

Manual Deployment:
  If GITHUB_TOKEN is not set, you can manually trigger deployment at:
  https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml
        `);
    }
}

// Main execution
async function main() {
    const helper = new HerokuDeploymentHelper();
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    
    console.log('🧠 BrainBytesAI - Heroku Deployment Helper\n');

    switch (command) {
        case 'deploy':
            const environment = args[1] || 'staging';
            const forceDeployment = args.includes('--force');
            await helper.triggerDeployment(environment, forceDeployment);
            break;
            
        case 'status':
            await helper.checkDeploymentStatus();
            break;
            
        case 'apps':
            await helper.checkHerokuApps();
            break;
            
        case 'monitoring':
            const monitoringEnv = args[1] || 'staging';
            await helper.setupMonitoring(monitoringEnv);
            break;
            
        case 'help':
        default:
            helper.showHelp();
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = HerokuDeploymentHelper;