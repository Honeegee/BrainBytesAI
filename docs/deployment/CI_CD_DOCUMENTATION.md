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
- **Triggers**: Push to main/development, PRs, daily scheduled runs, manual dispatch

### 2. CI/CD Pipeline Workflow
- **File**: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)
- **Purpose**: Runs comprehensive testing including unit tests, E2E tests, and performance tests
- **Triggers**: Push to main/development, PRs, manual dispatch (runs independently)

### 3. Heroku Deployment Workflow
- **File**: [`.github/workflows/deploy-heroku.yml`](.github/workflows/deploy-heroku.yml)
- **Purpose**: Deploys to Heroku staging and production environments
- **Triggers**: Push to main/develop branches, manual dispatch (runs independently)

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

**Purpose**: Comprehensive testing across multiple Node.js versions with Docker builds and MongoDB Atlas integration.

**Jobs**:
1. **Setup Dependencies** (`setup`)
   - Installs dependencies for all services
   - Caches dependencies for performance
   - Verifies installation success

2. **Test Matrix** (`test-matrix`)
   - **Matrix Strategy**: Tests across Node.js versions 18, 20, 22
   - **Services**: frontend, backend, ai-service
   - **Coverage**: Uploads test coverage to Codecov
   - **Artifacts**: Stores test results and coverage reports

3. **Docker Build & Test** (`docker-build`)
   - Builds Docker images for all services
   - Runs health checks on containerized services
   - Validates Docker configurations

4. **E2E Tests** (`e2e-tests`)
   - Uses MongoDB Atlas for cloud database testing
   - Starts all application services with proper health checks
   - Runs Playwright end-to-end tests
   - Creates dynamic health check tests

5. **Performance Testing** (`performance-test`)
   - Only runs on main/development branches or manual dispatch
   - Uses Artillery for load testing
   - Tests against running application services
   - Generates comprehensive performance reports

6. **Test Summary** (`test-summary`)
   - Aggregates all test results
   - Creates comprehensive test report
   - Manages artifacts and cleanup

7. **Notifications** (`notify`)
   - Sends workflow status notifications
   - Updates GitHub step summary
   - Comments on PRs with results

**Node.js Version Support**: 18.x, 20.x, 22.x

### Heroku Deployment Workflow

**Purpose**: Deploys applications to Heroku staging and production environments with health verification.

**Jobs**:
1. **Deploy to Staging** (`deploy-staging`)
   - **Trigger**: Push to `develop` branch
   - **Services**: Frontend, Backend, AI Service
   - **Environment URLs**:
     - Frontend: https://brainbytes-frontend-staging-7593f4655363.herokuapp.com
     - Backend: https://brainbytes-backend-staging-de872da2939f.herokuapp.com
     - AI Service: https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com
   - **Health Checks**: Post-deployment verification for all services

2. **Deploy to Production** (`deploy-production`)
   - **Trigger**: Push to `main` branch
   - **Services**: Frontend, Backend, AI Service
   - **Environment URLs**:
     - Frontend: https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com
     - Backend: https://brainbytes-backend-production-d355616d0f1f.herokuapp.com
     - AI Service: https://brainbytes-ai-production-3833f742ba79.herokuapp.com
   - **Health Checks**: Comprehensive production verification

3. **Manual Deployment** (`manual-deploy`)
   - **Trigger**: Manual workflow dispatch
   - **Options**: Environment selection (staging/production)
   - **Force Deploy**: Option to skip validation checks

**Deployment Features**:
- **Heroku CLI Integration**: Uses official Heroku actions
- **Multi-service Coordination**: Deploys all services in proper order
- **Environment-specific Configuration**: Secure secrets and variables
- **Health Verification**: Automated post-deployment testing
- **Failure Handling**: Automatic error detection and reporting

**Environment Mapping**:
- `main` branch → Production environment (automatic)
- `develop` branch → Staging environment (automatic)
- Manual dispatch → User-selected environment

## Manual Workflow Execution

### Running Code Quality Checks Manually

The Code Quality workflow can be run manually using workflow dispatch with scan level options. You can also run individual quality checks locally:

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

### Running Heroku Deployment Manually

1. **Navigate to Actions Tab**:
   - Go to "Deploy to Heroku" workflow
   - Click "Run workflow"

2. **Configure Manual Deployment**:
   - **Environment**: Choose `staging` or `production`
   - **Force Deploy**: Check to skip some validation checks
   - Click "Run workflow"

3. **Command Line (using GitHub CLI)**:
   
   **Linux/macOS:**
   ```bash
   # Deploy to staging
   gh workflow run "Deploy to Heroku" \
     --ref develop \
     -f environment=staging \
     -f force_deploy=false

   # Deploy to production
   gh workflow run "Deploy to Heroku" \
     --ref main \
     -f environment=production \
     -f force_deploy=false
   ```

   **Windows (Command Prompt/PowerShell):**
   ```cmd
   # Deploy to staging
   gh workflow run "Deploy to Heroku" --ref develop -f environment=staging -f force_deploy=false

   # Deploy to production
   gh workflow run "Deploy to Heroku" --ref main -f environment=production -f force_deploy=false
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
[![Deploy to Heroku](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/deploy-heroku.yml/badge.svg)](https://github.com/YOUR_USERNAME/BrainBytesAI/actions/workflows/deploy-heroku.yml)
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
- The pipeline uses ports 3000 (frontend), 3001 (backend), 3002 (ai-service)

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

#### Heroku Deployment
- `HEROKU_API_KEY`: Heroku API key for deployment authentication
- `HEROKU_EMAIL`: Email associated with Heroku account

#### Application Environment Variables (configured in Heroku)
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: JWT secret for authentication
- `GROQ_API_KEY`: AI service API key for Groq integration

#### Optional Secrets
- `SLACK_WEBHOOK_URL`: For deployment notifications
- `CODECOV_TOKEN`: For enhanced code coverage reporting

### Environment Variables

The workflows use these environment variables:

```yaml
# CI/CD Pipeline
NODE_VERSION_MATRIX: '[18, 20, 22]'

# Heroku Deployment
HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
HEROKU_EMAIL: ${{ secrets.HEROKU_EMAIL }}
```

### File Structure

```
.github/
├── workflows/
│   ├── code-quality.yml     # Code quality and security checks
│   ├── ci-cd.yml           # CI/CD pipeline with testing
│   └── deploy-heroku.yml   # Heroku deployment workflow
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

## Recent Updates

### Enhanced Test Coverage Implementation

The CI/CD pipeline has been updated to support the comprehensive test coverage enhancements:

#### **Frontend Test Coverage Enhancements**
- ✅ **Component Interaction Tests**: Login form validation, password strength validation
- ✅ **User Interaction Testing**: Form submission, input validation, error handling
- ✅ **State Management Tests**: Form reducers, API state management patterns
- ✅ **Loading and Error States**: API call states, error boundary testing

#### **Backend Test Coverage Enhancements**
- ✅ **API Endpoint Testing**: Complete CRUD operations for all endpoints
- ✅ **Database Operations Testing**: MongoDB Memory Server integration
- ✅ **Error Handling Middleware**: Authentication, validation, security middleware
- ✅ **Mock Database Implementation**: Isolated testing with proper setup/teardown

#### **GitHub Actions Workflow Enhancements**
- ✅ **Parallel Job Execution**: Matrix strategy across Node.js versions (18, 20, 22)
- ✅ **Caching Implementation**: Dependency caching for faster builds
- ✅ **Test Report Generation**: Coverage reports uploaded to Codecov
- ✅ **Artifact Management**: Test results and coverage artifacts with proper retention
- ✅ **Fixed Job Status Reporting**: Resolved "N/A" status issue in pipeline summary

### Testing Documentation Updates

#### **Comprehensive Testing Approach**
- **[Testing Approach Documentation](./TESTING_APPROACH.md)**: Complete 347-line guide with:
  - Detailed code examples from actual project tests
  - Testing patterns for frontend, backend, and E2E testing
  - Debugging techniques and troubleshooting guides
  - Performance testing with Artillery integration
  - Best practices for test organization and maintenance

#### **Service-Specific Testing Guides**
- **[Frontend Test README](../frontend/tests/__tests__/README.md)**: Updated with implemented features
- **[Backend Test README](../backend/tests/__tests__/README.md)**: Comprehensive 199-line testing guide

### Workflow Status Reporting Fix

The CI/CD pipeline now provides accurate job status reporting instead of showing "N/A":

```yaml
# Updated dependency chain in notify job
needs: [setup, test-matrix, e2e-tests, performance-test, test-summary]

# Improved status messages
echo "- **Setup:** ${{ needs.setup.result || 'Skipped' }}" >> $GITHUB_STEP_SUMMARY
echo "- **Test Matrix:** ${{ needs.test-matrix.result || 'Skipped' }}" >> $GITHUB_STEP_SUMMARY
echo "- **E2E Tests:** ${{ needs.e2e-tests.result || 'Skipped' }}" >> $GITHUB_STEP_SUMMARY
echo "- **Performance Tests:** ${{ needs.performance-test.result || 'Skipped' }}" >> $GITHUB_STEP_SUMMARY
```

### Test Pattern Examples

The following test patterns are now implemented and documented:

#### **Frontend Component Testing**
```javascript
// Form validation testing pattern
test('validates email format correctly', () => {
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
    return null;
  };
  
  expect(validateEmail('user@example.com')).toBe(null);
  expect(validateEmail('invalid')).toBe('Email is invalid');
});
```

#### **Backend API Testing**
```javascript
// API endpoint testing with MongoDB Memory Server
test('POST /api/messages creates message and AI response', async () => {
  const res = await request(app)
    .post('/api/messages')
    .send({ text: 'Hello AI', chatId: 'test-123' });
    
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('userMessage');
  expect(res.body).toHaveProperty('aiMessage');
});
```

#### **Database Operations Testing**
```javascript
// Database persistence testing with mocks
test('saves message to database correctly', async () => {
  const message = await Message.create({
    text: 'Test message',
    chatId: 'chat-123',
    userId: 'user-123'
  });
  
  const found = await Message.findById(message._id);
  expect(found.text).toBe('Test message');
});
```

## Related Documentation

- **[Testing Approach Documentation](./TESTING_APPROACH.md)**: Comprehensive testing strategy and patterns
- **[Performance Testing Guide](./PERFORMANCE_TESTING.md)**: Load testing and performance metrics
- **[Frontend Test Documentation](../frontend/tests/__tests__/README.md)**: Frontend testing patterns
- **[Backend Test Documentation](../backend/tests/__tests__/README.md)**: Backend testing implementation