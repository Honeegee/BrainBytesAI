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
                frontend: 'brainbytes-frontend-staging',
                backend: 'brainbytes-backend-staging',
                ai: 'brainbytes-ai-service-staging'
            },
            production: {
                frontend: 'brainbytes-frontend',
                backend: 'brainbytes-backend',
                ai: 'brainbytes-ai-service'
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
  help            Show this help

Options:
  --force         Force deployment (skip some checks)

Examples:
  node scripts/deploy-heroku.js deploy staging
  node scripts/deploy-heroku.js deploy production --force
  node scripts/deploy-heroku.js status
  node scripts/deploy-heroku.js apps

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