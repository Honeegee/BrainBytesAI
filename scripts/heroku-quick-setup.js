#!/usr/bin/env node

/**
 * Quick Heroku Setup for BrainBytesAI
 * 
 * Since you already have GitHub secrets configured, this script focuses on:
 * 1. Creating Heroku apps
 * 2. Getting your Heroku API key
 * 3. Final verification
 */

const { execSync } = require('child_process');
const readline = require('readline');

class QuickHerokuSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.apps = {
            staging: {
                backend: 'brainbytes-backend-staging',
                frontend: 'brainbytes-frontend-staging',
                ai: 'brainbytes-ai-service-staging'
            },
            production: {
                backend: 'brainbytes-backend',
                frontend: 'brainbytes-frontend', 
                ai: 'brainbytes-ai-service'
            }
        };

        this.existingSecrets = [
            'PRODUCTION_AI_API_KEY',
            'PRODUCTION_DATABASE_URL', 
            'PRODUCTION_JWT_SECRET',
            'PRODUCTION_REDIS_PASSWORD',
            'PRODUCTION_SESSION_SECRET',
            'STAGING_AI_API_KEY',
            'STAGING_DATABASE_URL',
            'STAGING_JWT_SECRET',
            'STAGING_SESSION_SECRET'
        ];
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async checkHerokuCLI() {
        console.log('🔍 Checking Heroku CLI installation...');
        
        try {
            const version = execSync('heroku --version', { encoding: 'utf8' });
            console.log('✅ Heroku CLI installed:', version.trim());
            return true;
        } catch (error) {
            console.log('❌ Heroku CLI not found.');
            console.log('\n📥 Install Heroku CLI:');
            console.log('   Download: https://devcenter.heroku.com/articles/heroku-cli');
            console.log('   Or run: npm install -g heroku');
            return false;
        }
    }

    async checkHerokuAuth() {
        console.log('\n🔐 Checking Heroku authentication...');
        
        try {
            const auth = execSync('heroku auth:whoami', { encoding: 'utf8' });
            console.log('✅ Logged in as:', auth.trim());
            return true;
        } catch (error) {
            console.log('❌ Not logged into Heroku.');
            console.log('   Run: heroku login');
            return false;
        }
    }

    async createApps() {
        console.log('\n🏗️  Creating Heroku applications...');
        
        const createApp = async (name, description) => {
            try {
                console.log(`Creating ${description}: ${name}...`);
                execSync(`heroku create ${name}`, { encoding: 'utf8' });
                console.log(`✅ Created: ${name}`);
                return name;
            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('is not available')) {
                    console.log(`⚠️  App name '${name}' is taken or already exists`);
                    
                    const newName = await this.question(`   Enter alternative name for ${description}: `);
                    if (newName.trim()) {
                        return await createApp(newName.trim(), description);
                    }
                    return null;
                } else {
                    console.log(`❌ Failed to create ${name}:`, error.message);
                    return null;
                }
            }
        };

        const createdApps = {};
        
        // Create staging apps
        console.log('\n📦 Creating staging applications:');
        createdApps.backendStaging = await createApp(this.apps.staging.backend, 'Backend (Staging)');
        createdApps.frontendStaging = await createApp(this.apps.staging.frontend, 'Frontend (Staging)');
        createdApps.aiStaging = await createApp(this.apps.staging.ai, 'AI Service (Staging)');
        
        // Ask about production apps
        const createProd = await this.question('\n🎯 Create production apps too? (y/n): ');
        
        if (createProd.toLowerCase() === 'y' || createProd.toLowerCase() === 'yes') {
            console.log('\n🚀 Creating production applications:');
            createdApps.backendProd = await createApp(this.apps.production.backend, 'Backend (Production)');
            createdApps.frontendProd = await createApp(this.apps.production.frontend, 'Frontend (Production)');
            createdApps.aiProd = await createApp(this.apps.production.ai, 'AI Service (Production)');
        }

        return createdApps;
    }

    async getHerokuAPIKey() {
        console.log('\n🔑 Getting your Heroku API key...');
        
        try {
            const token = execSync('heroku auth:token', { encoding: 'utf8' });
            return token.trim();
        } catch (error) {
            console.log('❌ Failed to get API key:', error.message);
            return null;
        }
    }

    showExistingSecrets() {
        console.log('\n✅ Your existing GitHub secrets:');
        console.log('================================');
        this.existingSecrets.forEach(secret => {
            console.log(`   ✓ ${secret}`);
        });
    }

    showMissingSecret(apiKey) {
        console.log('\n🔧 Missing GitHub Secret:');
        console.log('=========================');
        console.log('Go to: https://github.com/Honeegee/BrainBytesAI/settings/secrets/actions');
        console.log('\nAdd this secret:');
        console.log(`   HEROKU_API_KEY = ${apiKey}`);
    }

    generateWorkflowUpdate(createdApps) {
        console.log('\n📝 Workflow Update Needed:');
        console.log('==========================');
        
        const needsUpdate = Object.values(createdApps).some(app => 
            app && !Object.values(this.apps.staging).concat(Object.values(this.apps.production)).includes(app)
        );

        if (needsUpdate) {
            console.log('⚠️  You used custom app names. Update .github/workflows/deploy-heroku.yml:');
            console.log('\nReplace lines 86-93 with:');
            console.log('```yaml');
            console.log('  if [[ "$environment" == "production" ]]; then');
            if (createdApps.frontendProd) console.log(`    echo "frontend_app=${createdApps.frontendProd}" >> $GITHUB_OUTPUT`);
            if (createdApps.backendProd) console.log(`    echo "backend_app=${createdApps.backendProd}" >> $GITHUB_OUTPUT`);
            if (createdApps.aiProd) console.log(`    echo "ai_app=${createdApps.aiProd}" >> $GITHUB_OUTPUT`);
            console.log('  else');
            if (createdApps.frontendStaging) console.log(`    echo "frontend_app=${createdApps.frontendStaging}" >> $GITHUB_OUTPUT`);
            if (createdApps.backendStaging) console.log(`    echo "backend_app=${createdApps.backendStaging}" >> $GITHUB_OUTPUT`);
            if (createdApps.aiStaging) console.log(`    echo "ai_app=${createdApps.aiStaging}" >> $GITHUB_OUTPUT`);
            console.log('  fi');
            console.log('```');
        } else {
            console.log('✅ Default app names used - no workflow update needed!');
        }
    }

    showFinalSteps(createdApps) {
        console.log('\n🎯 Final Steps:');
        console.log('===============');
        console.log('1. ✅ Add HEROKU_API_KEY to GitHub Secrets (shown above)');
        if (Object.values(createdApps).some(app => app && !Object.values(this.apps.staging).concat(Object.values(this.apps.production)).includes(app))) {
            console.log('2. 📝 Update workflow file with custom app names (shown above)');
        }
        console.log('3. 📤 Commit and push changes to test-atlas-cicd branch');
        console.log('4. 🚀 Deploy automatically or manually:');
        console.log('   • Automatic: Push triggers deployment after CI/CD');
        console.log('   • Manual: https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml');
        console.log('   • Script: node scripts/deploy-heroku.js deploy staging');
        
        console.log('\n📱 Your App URLs (after deployment):');
        if (createdApps.frontendStaging) console.log(`   Frontend (Staging): https://${createdApps.frontendStaging}.herokuapp.com`);
        if (createdApps.backendStaging) console.log(`   Backend (Staging): https://${createdApps.backendStaging}.herokuapp.com`);
        if (createdApps.aiStaging) console.log(`   AI Service (Staging): https://${createdApps.aiStaging}.herokuapp.com`);
    }

    async run() {
        console.log('🧠 BrainBytesAI - Quick Heroku Setup');
        console.log('====================================\n');

        // Show what you already have
        this.showExistingSecrets();

        // Check prerequisites
        if (!(await this.checkHerokuCLI())) {
            this.rl.close();
            return;
        }

        if (!(await this.checkHerokuAuth())) {
            console.log('\n⚡ Please run "heroku login" first, then run this script again.');
            this.rl.close();
            return;
        }

        // Create apps
        const createdApps = await this.createApps();

        // Get API key
        const apiKey = await this.getHerokuAPIKey();
        
        if (!apiKey) {
            console.log('❌ Could not retrieve API key. Setup incomplete.');
            this.rl.close();
            return;
        }

        // Show what to add to GitHub
        this.showMissingSecret(apiKey);

        // Show workflow updates if needed
        this.generateWorkflowUpdate(createdApps);

        // Show final steps
        this.showFinalSteps(createdApps);

        console.log('\n🎉 Quick setup completed!');
        console.log('💡 You\'re ready to deploy once you add the HEROKU_API_KEY secret!');
        
        this.rl.close();
    }
}

// Main execution
if (require.main === module) {
    const setup = new QuickHerokuSetup();
    setup.run().catch(console.error);
}

module.exports = QuickHerokuSetup;