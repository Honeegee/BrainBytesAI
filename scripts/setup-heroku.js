#!/usr/bin/env node

/**
 * Heroku Setup Helper Script
 * 
 * This script helps you set up Heroku applications for BrainBytesAI deployment.
 * It provides interactive setup and validation.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

class HerokuSetupHelper {
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
            console.log('\n📥 Please install Heroku CLI:');
            console.log('   Windows: https://devcenter.heroku.com/articles/heroku-cli');
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

    async suggestAppNames() {
        console.log('\n🏗️  App Name Suggestions:');
        console.log('If the default names are taken, try these alternatives:');
        
        const username = await this.question('Enter your GitHub username (for unique app names): ');
        
        if (username) {
            console.log('\n📝 Suggested app names:');
            console.log('Staging:');
            console.log(`  - ${username}-brainbytes-backend-staging`);
            console.log(`  - ${username}-brainbytes-frontend-staging`);
            console.log(`  - ${username}-brainbytes-ai-service-staging`);
            
            console.log('\nProduction:');
            console.log(`  - ${username}-brainbytes-backend`);
            console.log(`  - ${username}-brainbytes-frontend`);
            console.log(`  - ${username}-brainbytes-ai-service`);
        }
    }

    async createApps() {
        console.log('\n🏗️  Creating Heroku applications...');
        
        const createApp = async (name, description) => {
            try {
                console.log(`Creating ${description}...`);
                execSync(`heroku create ${name}`, { encoding: 'utf8' });
                console.log(`✅ Created: ${name}`);
                return true;
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`⚠️  App ${name} already exists`);
                    return true;
                } else {
                    console.log(`❌ Failed to create ${name}:`, error.message);
                    return false;
                }
            }
        };

        const results = [];
        
        // Create staging apps
        console.log('\n📦 Creating staging applications:');
        results.push(await createApp(this.apps.staging.backend, 'Backend (Staging)'));
        results.push(await createApp(this.apps.staging.frontend, 'Frontend (Staging)'));
        results.push(await createApp(this.apps.staging.ai, 'AI Service (Staging)'));
        
        // Ask if user wants to create production apps now
        const createProd = await this.question('\n🎯 Create production apps now? (y/n): ');
        
        if (createProd.toLowerCase() === 'y' || createProd.toLowerCase() === 'yes') {
            console.log('\n🚀 Creating production applications:');
            results.push(await createApp(this.apps.production.backend, 'Backend (Production)'));
            results.push(await createApp(this.apps.production.frontend, 'Frontend (Production)'));
            results.push(await createApp(this.apps.production.ai, 'AI Service (Production)'));
        }

        return results.every(result => result);
    }

    async getHerokuAPIKey() {
        console.log('\n🔑 Getting Heroku API key...');
        
        try {
            const token = execSync('heroku auth:token', { encoding: 'utf8' });
            console.log('✅ API Key retrieved successfully');
            console.log('🔐 Your Heroku API Key (save this for GitHub Secrets):');
            console.log(`    ${token.trim()}`);
            return token.trim();
        } catch (error) {
            console.log('❌ Failed to get API key:', error.message);
            return null;
        }
    }

    generateSecrets() {
        console.log('\n🎲 Generating secure random secrets...');
        
        const secrets = {
            jwt: crypto.randomBytes(32).toString('hex'),
            session: crypto.randomBytes(32).toString('hex'),
            prodJwt: crypto.randomBytes(32).toString('hex'),
            prodSession: crypto.randomBytes(32).toString('hex')
        };

        console.log('🔐 Generated secrets (save these for GitHub Secrets):');
        console.log(`    STAGING_JWT_SECRET = ${secrets.jwt}`);
        console.log(`    STAGING_SESSION_SECRET = ${secrets.session}`);
        console.log(`    PROD_JWT_SECRET = ${secrets.prodJwt}`);
        console.log(`    PROD_SESSION_SECRET = ${secrets.prodSession}`);

        return secrets;
    }

    async showGitHubSecretsInstructions(apiKey, secrets) {
        console.log('\n📋 GitHub Secrets Configuration');
        console.log('================================================');
        console.log('Go to: https://github.com/Honeegee/BrainBytesAI/settings/secrets/actions');
        console.log('\nAdd these secrets:');
        console.log('\n🔧 Required secrets:');
        console.log(`HEROKU_API_KEY = ${apiKey}`);
        console.log(`STAGING_JWT_SECRET = ${secrets.jwt}`);
        console.log(`STAGING_SESSION_SECRET = ${secrets.session}`);
        
        const dbUrl = await this.question('\n📦 Enter your MongoDB Atlas connection string: ');
        if (dbUrl) {
            console.log(`STAGING_DATABASE_URL = ${dbUrl}`);
        }

        const aiKey = await this.question('🤖 Enter your AI service API key (GROQ_API_KEY): ');
        if (aiKey) {
            console.log(`STAGING_AI_API_KEY = ${aiKey}`);
        }

        console.log('\n🎯 Optional production secrets:');
        console.log(`PROD_JWT_SECRET = ${secrets.prodJwt}`);
        console.log(`PROD_SESSION_SECRET = ${secrets.prodSession}`);
        console.log('PROD_DATABASE_URL = [Your production MongoDB Atlas URL]');
        console.log('PROD_AI_API_KEY = [Your production AI service API key]');
    }

    async listCreatedApps() {
        console.log('\n📱 Your Heroku Applications:');
        console.log('===============================');
        
        try {
            const apps = execSync('heroku apps', { encoding: 'utf8' });
            console.log(apps);
        } catch (error) {
            console.log('❌ Could not list apps:', error.message);
        }
    }

    async showNextSteps() {
        console.log('\n🎯 Next Steps:');
        console.log('==============');
        console.log('1. ✅ Add the secrets to GitHub (shown above)');
        console.log('2. 📤 Commit and push your changes to test-atlas-cicd branch');
        console.log('3. 🚀 Deploy using one of these methods:');
        console.log('   • Wait for automatic deployment after CI/CD success');
        console.log('   • Manual: https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml');
        console.log('   • Script: node scripts/deploy-heroku.js deploy staging');
        console.log('\n📚 For detailed instructions, see: docs/HEROKU_SETUP.md');
    }

    async run() {
        console.log('🧠 BrainBytesAI - Heroku Setup Helper');
        console.log('=====================================\n');

        // Step 1: Check CLI
        if (!(await this.checkHerokuCLI())) {
            this.rl.close();
            return;
        }

        // Step 2: Check authentication
        if (!(await this.checkHerokuAuth())) {
            console.log('\n⚡ Please run "heroku login" first, then run this script again.');
            this.rl.close();
            return;
        }

        // Step 3: Suggest app names
        await this.suggestAppNames();

        // Step 4: Create apps
        const useDefaults = await this.question('\n🤔 Use default app names? (y/n): ');
        
        if (useDefaults.toLowerCase() === 'n' || useDefaults.toLowerCase() === 'no') {
            console.log('\n📝 Please create your apps manually using:');
            console.log('   heroku create your-app-name');
            console.log('\nThen update the app names in .github/workflows/deploy-heroku.yml');
        } else {
            await this.createApps();
        }

        // Step 5: Get API key
        const apiKey = await this.getHerokuAPIKey();
        
        if (!apiKey) {
            this.rl.close();
            return;
        }

        // Step 6: Generate secrets
        const secrets = this.generateSecrets();

        // Step 7: Show GitHub configuration
        await this.showGitHubSecretsInstructions(apiKey, secrets);

        // Step 8: List apps
        await this.listCreatedApps();

        // Step 9: Next steps
        await this.showNextSteps();

        console.log('\n🎉 Heroku setup helper completed!');
        console.log('💡 Run "node scripts/setup-heroku.js" again if you need to regenerate secrets.');
        
        this.rl.close();
    }
}

// Main execution
if (require.main === module) {
    const helper = new HerokuSetupHelper();
    helper.run().catch(console.error);
}

module.exports = HerokuSetupHelper;