#!/usr/bin/env node

/**
 * Cleanup and Prepare for Merge Script
 * 
 * This script cleans up the test files and prepares the codebase
 * for merging test-atlas-cicd branch into development.
 */

const fs = require('fs');
const path = require('path');

class CleanupHelper {
    constructor() {
        this.filesToRemove = [
            // Test/temporary files that shouldn't go to development
            'scripts/test-atlas-cicd.js',
            'scripts/test-atlas-docker-setup.js',
            'scripts/test-atlas-e2e-setup.js',
            'scripts/test-atlas-docker-setup.bat'
        ];
        
        this.filesToKeep = [
            // Production-ready files to keep
            'backend/Procfile',
            'ai-service/Procfile', 
            'frontend/Procfile',
            'scripts/deploy-heroku.js',
            'scripts/setup-heroku.js',
            'scripts/heroku-quick-setup.js',
            'scripts/trigger-full-deployment.js',
            'scripts/verify-deployment.js',
            'docs/HEROKU_SETUP.md',
            'docs/HEROKU_ACCOUNT_VERIFICATION.md',
            '.github/workflows/deploy-heroku.yml'
        ];
    }

    async cleanup() {
        console.log('🧹 Cleaning up test files for production merge...\n');

        // Remove test files
        this.filesToRemove.forEach(file => {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`✅ Removed: ${file}`);
                } catch (error) {
                    console.log(`⚠️  Could not remove ${file}: ${error.message}`);
                }
            } else {
                console.log(`ℹ️  File not found: ${file}`);
            }
        });

        console.log('\n📋 Files to keep for production:');
        this.filesToKeep.forEach(file => {
            const fullPath = path.join(process.cwd(), file);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Keeping: ${file}`);
            } else {
                console.log(`⚠️  Missing: ${file}`);
            }
        });
    }

    generateMergeChecklist() {
        console.log('\n📝 Pre-Merge Checklist:');
        console.log('========================');
        console.log('□ All test files removed');
        console.log('□ Heroku deployment files in place');
        console.log('□ Documentation updated');
        console.log('□ Workflow files configured');
        console.log('□ Procfiles created for all services');
        console.log('□ Environment variables documented');
        console.log('□ No sensitive data in code');
        console.log('□ All scripts executable and tested');
        
        console.log('\n🔧 What\'s Ready for Development:');
        console.log('==================================');
        console.log('✅ Complete Heroku deployment setup');
        console.log('✅ Atlas MongoDB integration');
        console.log('✅ CI/CD pipeline with testing');
        console.log('✅ Security scanning and code quality');
        console.log('✅ E2E testing framework');
        console.log('✅ Performance testing');
        console.log('✅ Comprehensive documentation');
        console.log('✅ Deployment scripts and helpers');
    }

    generateMergeCommands() {
        console.log('\n🚀 Ready to Merge! Commands:');
        console.log('============================');
        console.log('# 1. Stage all changes');
        console.log('git add .');
        console.log('');
        console.log('# 2. Commit with descriptive message');
        console.log('git commit -m "feat: Add comprehensive Heroku deployment setup');
        console.log('');
        console.log('- Complete CI/CD pipeline with Atlas integration');
        console.log('- Heroku deployment workflows for all services');
        console.log('- Automated testing (unit, integration, E2E, performance)');
        console.log('- Security scanning and code quality checks');
        console.log('- Deployment scripts and documentation');
        console.log('- Support for staging and production environments"');
        console.log('');
        console.log('# 3. Push to test-atlas-cicd branch');
        console.log('git push origin test-atlas-cicd');
        console.log('');
        console.log('# 4. Switch to development branch');
        console.log('git checkout development');
        console.log('');
        console.log('# 5. Merge test-atlas-cicd into development');
        console.log('git merge test-atlas-cicd');
        console.log('');
        console.log('# 6. Push development branch');
        console.log('git push origin development');
        console.log('');
        console.log('# 7. Test automatic deployment on development branch');
        console.log('# (Workflows should trigger automatically on push to development)');
    }

    showPostMergeSteps() {
        console.log('\n🎯 After Merge to Development:');
        console.log('==============================');
        console.log('1. 📊 Monitor workflow execution:');
        console.log('   https://github.com/Honeegee/BrainBytesAI/actions');
        console.log('');
        console.log('2. 🔧 Verify Heroku apps are created and configured');
        console.log('');
        console.log('3. 🧪 Test the full deployment pipeline:');
        console.log('   - Code Quality → CI/CD → Heroku Deploy');
        console.log('');
        console.log('4. 🌐 Access deployed applications:');
        console.log('   - Frontend: https://brainbytes-frontend-staging.herokuapp.com');
        console.log('   - Backend: https://brainbytes-backend-staging.herokuapp.com');
        console.log('   - AI Service: https://brainbytes-ai-service-staging.herokuapp.com');
        console.log('');
        console.log('5. 📋 Create production deployment when ready:');
        console.log('   - Merge development → main');
        console.log('   - Production deployment will trigger automatically');
    }

    async run() {
        console.log('🧠 BrainBytesAI - Cleanup & Merge Preparation');
        console.log('=============================================\n');

        await this.cleanup();
        this.generateMergeChecklist();
        this.generateMergeCommands();
        this.showPostMergeSteps();

        console.log('\n🎉 Cleanup completed! Ready for merge to development.');
        console.log('💡 Follow the commands above to merge safely.');
    }
}

// Main execution
if (require.main === module) {
    const cleanup = new CleanupHelper();
    cleanup.run().catch(console.error);
}

module.exports = CleanupHelper;