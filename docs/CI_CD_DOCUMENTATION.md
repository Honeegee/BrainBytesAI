# CI/CD Pipeline Documentation

## Overview

This document provides comprehensive documentation for the BrainBytesAI CI/CD pipeline setup. The pipeline consists of three main workflows that work together to ensure code quality, testing, and deployment.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Workflow Details](#workflow-details)
3. [Manual Workflow Execution](#manual-workflow-execution)
4. [Status Badges](#status-badges)
5. [Troubleshooting](#troubleshooting)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)

## Workflow Overview

The CI/CD pipeline consists of three primary workflows:

### 1. Code Quality & Security Workflow
- **File**: [`.github/workflows/code-quality.yml`](.github/workflows/code-quality.yml)
- **Purpose**: Ensures code quality, security, and maintainability standards
- **Triggers**: Push to main/development, PRs, daily scheduled runs

### 2. CI/CD Pipeline Workflow
- **File**: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)
- **Purpose**: Runs comprehensive testing including unit tests, E2E tests, and performance tests
- **Triggers**: After successful code quality checks, manual dispatch

### 3. Deploy to Environments Workflow
- **File**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- **Purpose**: Builds Docker images and deploys to staging/production environments
- **Triggers**: After successful CI/CD pipeline, manual dispatch

## Workflow Details

### Code Quality & Security Workflow

**Purpose**: This workflow is the first gate in our pipeline, ensuring all code meets quality and security standards.

**Jobs**:
1. **Lint & Format Check** (`lint-and-format`)
   - Runs ESLint and Prettier checks
   - Matrix strategy for all services (frontend, backend, ai-service)
   - Uploads ESLint reports as artifacts

2. **Security Vulnerability Scan** (`security-scan`)
   - Runs npm audit for dependency vulnerabilities
   - Checks for high/critical vulnerabilities
   - Comments on PRs with security findings

3. **Code Analysis** (`code-analysis`)
   - Detects code duplication using jscpd
   - Identifies large files
   - Finds TODO/FIXME comments

4. **Secrets Scanning** (`secrets-scan`)
   - Uses TruffleHog for secret detection
   - Manual checks for common secret patterns
   - Validates no hardcoded credentials

5. **Quality Summary** (`quality-summary`)
   - Aggregates all quality check results
   - Posts summary comments on PRs

**Success Criteria**: All jobs must pass for the workflow to succeed and trigger the CI/CD pipeline.

### CI/CD Pipeline Workflow

**Purpose**: Comprehensive testing across multiple Node.js versions and deployment scenarios.

**Jobs**:
1. **Check Code Quality Status** (`check-code-quality`)
   - Validates that code quality workflow passed
   - Only runs when triggered by workflow_run event

2. **Setup Dependencies** (`setup`)
   - Installs dependencies for all services
   - Caches dependencies for performance
   - Verifies installation success

3. **Test Matrix** (`test-matrix`)
   - **Matrix Strategy**: Tests across Node.js versions 18, 20, 22
   - **Services**: frontend, backend, ai-service
   - **Coverage**: Uploads test coverage to Codecov
   - **Artifacts**: Stores test results and coverage reports

4. **E2E Tests** (`e2e-tests`)
   - Spins up MongoDB service
   - Starts all application services (frontend:3001, backend:3000, ai-service:3002)
   - Runs Playwright end-to-end tests
   - Creates dynamic health check tests

5. **Performance Testing** (`performance-test`)
   - Only runs on main/development branches or manual dispatch
   - Uses Artillery for load testing
   - Tests against running application services
   - Generates performance reports

6. **Test Summary** (`test-summary`)
   - Aggregates all test results
   - Creates comprehensive test report

7. **Notifications** (`notify`)
   - Sends workflow status notifications
   - Updates GitHub step summary
   - Comments on PRs with results

**Node.js Version Support**: 18.x, 20.x, 22.x

### Deploy to Environments Workflow

**Purpose**: Builds and deploys applications to staging and production environments.

**Jobs**:
1. **Check CI/CD Status** (`check-ci-cd`)
   - Ensures CI/CD pipeline passed before deployment

2. **Setup Deployment** (`setup`)
   - Determines target environment (staging/production)
   - Sets deployment URLs and configuration

3. **Build & Push Images** (`build-images`)
   - **Matrix Strategy**: Builds Docker images for all services
   - **Multi-platform**: Supports linux/amd64 and linux/arm64
   - **Registry**: Uses GitHub Container Registry (ghcr.io)
   - **Caching**: Implements Docker layer caching

4. **Deploy to Staging** (`deploy-staging`)
   - Deploys to staging environment
   - Runs health checks and smoke tests
   - Environment URL: https://staging.brainbytes.app

5. **Deploy to Production** (`deploy-production`)
   - Blue-green deployment strategy
   - Pre-deployment backup
   - Comprehensive production verification
   - Environment URL: https://brainbytes.app

6. **Rollback** (`rollback`)
   - Automatic rollback on deployment failure
   - Restores previous version

7. **Deployment Notifications** (`notify-deployment`)
   - Slack notifications (if configured)
   - GitHub deployment status updates

**Environment Mapping**:
- `main` branch → Production environment
- `development` branch → Staging environment

## Manual Workflow Execution

### Running Code Quality Checks Manually

The Code Quality workflow cannot be run manually as it's designed to trigger on push/PR events. However, you can run individual quality checks locally:

**Linux/macOS:**
```bash
# Run ESLint
cd frontend && npm run lint
cd ../backend && npm run lint
cd ../ai-service && npm run lint

# Run Prettier
cd frontend && npm run format:check
cd ../backend && npm run format:check
cd ../ai-service && npm run format:check

# Run security audit
npm audit
```

**Windows (Command Prompt):**
```cmd
REM Run ESLint
cd frontend && npm run lint
cd ..\backend && npm run lint
cd ..\ai-service && npm run lint

REM Run Prettier
cd frontend && npm run format:check
cd ..\backend && npm run format:check
cd ..\ai-service && npm run format:check

REM Run security audit
npm audit
```

**Windows (PowerShell):**
```powershell
# Run ESLint
Set-Location frontend; npm run lint
Set-Location ..\backend; npm run lint
Set-Location ..\ai-service; npm run lint

# Run Prettier
Set-Location frontend; npm run format:check
Set-Location ..\backend; npm run format:check
Set-Location ..\ai-service; npm run format:check

# Run security audit
npm audit
```

### Running CI/CD Pipeline Manually

1. **Navigate to Actions Tab**:
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Select "CI/CD Pipeline" workflow

2. **Manual Dispatch**:
   - Click "Run workflow" button
   - Select the branch (main or development)
   - Click "Run workflow"

3. **Command Line (using GitHub CLI)**:
   
   **All Platforms:**
   ```bash
   gh workflow run "CI/CD Pipeline" --ref main
   ```

### Running Deployment Manually

1. **Navigate to Actions Tab**:
   - Go to "Deploy to Environments" workflow
   - Click "Run workflow"

2. **Configure Manual Deployment**:
   - **Environment**: Choose `staging` or `production`
   - **Force Deploy**: Check to skip some validation checks
   - Click "Run workflow"

3. **Command Line (using GitHub CLI)**:
   
   **Linux/macOS:**
   ```bash
   # Deploy to staging
   gh workflow run "Deploy to Environments" \
     --ref development \
     -f environment=staging \
     -f force_deploy=false

   # Deploy to production
   gh workflow run "Deploy to Environments" \
     --ref main \
     -f environment=production \
     -f force_deploy=false
   ```

   **Windows (Command Prompt/PowerShell):**
   ```cmd
   # Deploy to staging
   gh workflow run "Deploy to Environments" --ref development -f environment=staging -f force_deploy=false

   # Deploy to production
   gh workflow run "Deploy to Environments" --ref main -f environment=production -f force_deploy=false
   ```

## Status Badges

Add these badges to your README.md to display workflow status:

### Code Quality Badge
```markdown
[![Code Quality & Security](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/code-quality.yml/badge.svg)](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/code-quality.yml)
```

### CI/CD Pipeline Badge
```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/ci-cd.yml)
```

### Deployment Badge
```markdown
[![Deploy to Environments](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/deploy.yml)
```

### Badge Status Meanings

| Badge Status | Meaning |
|--------------|---------|
| ![Passing](https://img.shields.io/badge/build-passing-brightgreen) | All checks passed successfully |
| ![Failing](https://img.shields.io/badge/build-failing-red) | One or more checks failed |
| ![Pending](https://img.shields.io/badge/build-pending-yellow) | Workflow is currently running |
| ![No Status](https://img.shields.io/badge/build-no%20status-lightgrey) | Workflow hasn't run yet |

## Troubleshooting

### Common Issues and Solutions

#### 1. Code Quality Workflow Failures

**ESLint Errors**:

*Linux/macOS:*
```bash
# Fix linting issues locally
cd [service-directory]
npm run lint:fix
```

*Windows (Command Prompt):*
```cmd
REM Fix linting issues locally
cd [service-directory]
npm run lint:fix
```

*Windows (PowerShell):*
```powershell
# Fix linting issues locally
Set-Location [service-directory]
npm run lint:fix
```

**Prettier Formatting**:

*All Platforms:*
```bash
# Auto-format code
cd [service-directory]
npm run format
```

**Security Vulnerabilities**:

*All Platforms:*
```bash
# Update vulnerable dependencies
npm audit fix

# For high-risk vulnerabilities requiring manual review
npm audit fix --force
```

#### 2. CI/CD Pipeline Failures

**Test Failures**:

*All Platforms:*
```bash
# Run tests locally
cd [service-directory]
npm test

# Run with coverage
npm run test:coverage
```

**E2E Test Issues**:

*All Platforms:*
```bash
# Run E2E tests locally
cd e2e-tests
npm ci
npx playwright install
npm run test:working
```

**Port Conflicts**:
- The pipeline uses ports 3000 (backend), 3001 (frontend), 3002 (ai-service)

*Linux/macOS:*
```bash
# Check for conflicting processes
sudo lsof -ti:3000
sudo lsof -ti:3001
sudo lsof -ti:3002

# Kill processes using ports
sudo lsof -ti:3000 | xargs -r sudo kill -9
```

*Windows (Command Prompt):*
```cmd
REM Check for conflicting processes
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002

REM Kill process by PID (replace PID with actual process ID)
taskkill /PID [PID] /F
```

*Windows (PowerShell):*
```powershell
# Check for conflicting processes
Get-NetTCPConnection -LocalPort 3000,3001,3002

# Kill processes using ports
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process -Force
```

**MongoDB Connection Issues**:
- Ensure MongoDB service is healthy
- Check connection string format
- Verify database permissions

#### 3. Deployment Failures

**Docker Build Issues**:

*All Platforms:*
```bash
# Test Docker build locally
docker build -t test-image ./frontend
docker build -t test-image ./backend
docker build -t test-image ./ai-service
```

**Environment Configuration**:
- Verify all required secrets are configured
- Check environment variable syntax
- Ensure deployment URLs are accessible

**Health Check Failures**:
- Verify health endpoints are responding
- Check service logs for errors
- Ensure all services are properly started

### Debugging Steps

#### 1. Check Workflow Logs
1. Go to Actions tab in GitHub
2. Click on the failed workflow run
3. Expand the failed job
4. Review the step-by-step logs

#### 2. Download Artifacts

*All Platforms:*
```bash
# Using GitHub CLI
gh run download [run-id]

# Or download from web interface
# Actions → Workflow Run → Artifacts section
```

#### 3. Local Testing

*Linux/macOS:*
```bash
# Run the same commands locally
# Example for CI/CD pipeline:
npm ci
cd frontend && npm ci
cd ../backend && npm ci
cd ../ai-service && npm ci

# Run tests
cd frontend && npm test
cd ../backend && npm test
cd ../ai-service && npm test
```

*Windows (Command Prompt):*
```cmd
REM Run the same commands locally
REM Example for CI/CD pipeline:
npm ci
cd frontend && npm ci
cd ..\backend && npm ci
cd ..\ai-service && npm ci

REM Run tests
cd frontend && npm test
cd ..\backend && npm test
cd ..\ai-service && npm test
```

*Windows (PowerShell):*
```powershell
# Run the same commands locally
# Example for CI/CD pipeline:
npm ci
Set-Location frontend; npm ci
Set-Location ..\backend; npm ci
Set-Location ..\ai-service; npm ci

# Run tests
Set-Location frontend; npm test
Set-Location ..\backend; npm test
Set-Location ..\ai-service; npm test
```

#### 4. Check Dependencies

*All Platforms:*
```bash
# Verify package-lock.json is up to date
npm ci

# Check for dependency conflicts
npm ls
```

### Performance Issues

#### Slow Workflow Execution
- **Caching**: Workflows use dependency caching to speed up builds
- **Parallel Jobs**: Matrix strategies run jobs in parallel
- **Artifact Retention**: Reduce retention days for large artifacts

#### Resource Limitations
- **Timeout Settings**: All jobs have timeout limits
- **Memory Usage**: Monitor test memory consumption
- **Concurrent Runners**: GitHub Actions has runner limits

## Configuration

### Required Secrets

Configure these secrets in GitHub repository settings:

#### Staging Environment
- `STAGING_DATABASE_URL`: MongoDB connection string for staging
- `STAGING_JWT_SECRET`: JWT secret for staging
- `STAGING_AI_API_KEY`: AI service API key for staging

#### Production Environment
- `PRODUCTION_DATABASE_URL`: MongoDB connection string for production
- `PRODUCTION_JWT_SECRET`: JWT secret for production
- `PRODUCTION_AI_API_KEY`: AI service API key for production

#### Optional Secrets
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `CODECOV_TOKEN`: For enhanced code coverage reporting

### Environment Variables

The workflows use these environment variables:

```yaml
# CI/CD Pipeline
NODE_VERSION_MATRIX: '[18, 20, 22]'

# Deployment
REGISTRY: ghcr.io
IMAGE_NAME: ${{ github.repository }}
```

### File Structure

```
.github/
├── workflows/
│   ├── code-quality.yml     # Code quality and security checks
│   ├── ci-cd.yml           # CI/CD pipeline with testing
│   └── deploy.yml          # Deployment to environments
├── performance-test.yml    # Artillery performance test config
└── performance-test-quick.yml # Quick performance test config
```

## Best Practices

### 1. Branch Strategy
- Use `main` for production-ready code
- Use `development` for staging/testing
- Create feature branches for new development
- All PRs should target `development` first

### 2. Commit Messages
- Use conventional commit format
- Include issue references
- Write descriptive commit messages

### 3. Testing Strategy
- Write unit tests for all new features
- Maintain high test coverage (>80%)
- Include E2E tests for critical user flows
- Run tests locally before pushing

### 4. Security Practices
- Never commit secrets or credentials
- Use environment variables for configuration
- Regularly update dependencies
- Monitor security vulnerability reports

### 5. Performance Considerations
- Monitor workflow execution times
- Use caching effectively
- Optimize Docker builds with multi-stage builds
- Keep artifacts small and relevant

### 6. Monitoring and Alerts
- Set up Slack notifications for deployment failures
- Monitor application health after deployments
- Use GitHub's built-in monitoring features
- Implement proper logging in applications

---

## Support

For issues with the CI/CD pipeline:

1. **Check this documentation** for common solutions
2. **Review workflow logs** in GitHub Actions
3. **Test locally** to reproduce issues
4. **Create an issue** with detailed error information

## Related Documentation

- [API Documentation](./API.md)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)
- [Performance Testing Guide](./PERFORMANCE_TESTING.md)
- [Manual Testing Guide](./MANUAL_TESTING_GUIDE.md)