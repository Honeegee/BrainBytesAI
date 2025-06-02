# Manual Testing Guide for Enhanced Workflows

This guide walks you through testing all the enhanced workflow components locally before deploying.

## Prerequisites

Make sure you have the following installed:
- Node.js (versions 18, 20, or 22)
- npm
- Docker and Docker Compose
- Git

## Step 1: Install Dependencies

First, let's install all the new dependencies we added:

```bash
# Install root dependencies
npm install

# Install frontend dependencies (includes new testing tools)
cd frontend
npm install

# Install backend dependencies (includes new testing tools)
cd ../backend
npm install

# Install AI service dependencies
cd ../ai-service
npm install

# Install E2E testing dependencies
cd ../e2e-tests
npm install
```

## Step 2: Test Code Quality Tools

### ESLint Testing

Test ESLint on each service:

```bash
# Frontend ESLint
cd frontend
npm run lint
npm run lint:fix  # Fix auto-fixable issues

# Backend ESLint
cd ../backend
npm run lint
npm run lint:fix

# AI Service ESLint
cd ../ai-service
npm run lint
npm run lint:fix
```

### Prettier Testing

Test code formatting:

```bash
# Frontend Prettier
cd frontend
npm run format:check  # Check formatting
npm run format       # Fix formatting

# Backend Prettier
cd ../backend
npm run format:check
npm run format

# AI Service Prettier
cd ../ai-service
npm run format:check
npm run format
```

## Step 3: Test Enhanced Unit Testing

### Test Coverage Collection

```bash
# Frontend tests with coverage
cd frontend
npm run test:coverage

# Backend tests with coverage
cd ../backend
npm run test:coverage

# AI Service tests with coverage
cd ../ai-service
npm run test:coverage
```

Check that coverage reports are generated in `coverage/` directories.

### Test JUnit Reporting

The tests should now generate JUnit XML files in `test-results/` directories for CI integration.

## Step 4: Test E2E Setup

### Install Playwright Browsers

```bash
cd e2e-tests
npx playwright install --with-deps
```

### Test Playwright Configuration

```bash
# Check Playwright configuration
npx playwright test --list

# Run a basic test (will need services running)
# We'll test this in Step 6
```

## Step 5: Test Docker Builds

### Test Development Docker Compose

```bash
# Build and start services
docker-compose up --build -d

# Check service health
curl http://localhost:3000/health  # Backend
curl http://localhost:3001         # Frontend
curl http://localhost:3002/health  # AI Service

# Stop services
docker-compose down
```

### Test Staging Docker Compose

```bash
# Set environment variables (create temporary .env file)
export GITHUB_REPOSITORY="your-username/BrainBytesAI"
export GITHUB_REF_NAME="develop"
export STAGING_DATABASE_URL="mongodb://localhost:27017/brainbytes_staging"
export STAGING_JWT_SECRET="test-jwt-secret"
export STAGING_SESSION_SECRET="test-session-secret"
export STAGING_AI_API_KEY="test-api-key"
export STAGING_MONGO_USER="testuser"
export STAGING_MONGO_PASSWORD="testpass"

# Test staging compose (will need actual images)
# docker-compose -f docker-compose.staging.yml config
```

## Step 6: Test E2E with Running Services

### Start Services

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 30
```

### Run E2E Tests

```bash
cd e2e-tests

# Run tests headless
npm test

# Run tests with browser visible
npm run test:headed

# Run specific test
npx playwright test login.spec.js

# Run tests with UI mode
npm run test:ui
```

## Step 7: Test Security Scanning

### npm Audit

```bash
# Test npm audit on each service
cd frontend && npm audit
cd ../backend && npm audit
cd ../ai-service && npm audit
```

### Manual Security Checks

```bash
# Check for potential secrets
grep -r -i -E "(api[_-]?key|password|secret|token)" --include="*.js" --exclude-dir=node_modules .

# Check for large files
find . -type f -size +50M -not -path "./node_modules/*" -not -path "./.git/*"
```

## Step 8: Test Performance Tools

### Install Artillery (for load testing)

```bash
npm install -g artillery
```

### Create Basic Performance Test

```bash
# Create a simple test file
cat > test-performance.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 10
      arrivalRate: 5
scenarios:
  - name: "Basic API Test"
    requests:
      - get:
          url: "/health"
EOF

# Run performance test (with services running)
artillery run test-performance.yml
```

## Step 9: Test Workflow Trigger Simulation

### Simulate CI Environment

```bash
# Set CI environment variable
export CI=true

# Run tests as they would run in CI
cd frontend && npm run test:coverage
cd ../backend && npm run test:coverage
cd ../ai-service && npm run test:coverage
```

### Test Matrix Build Simulation

Test with different Node.js versions if you have them:

```bash
# If you have nvm (Node Version Manager)
nvm use 18 && cd frontend && npm test
nvm use 20 && cd frontend && npm test
nvm use 22 && cd frontend && npm test
```

## Step 10: Validate Configuration Files

### Check Jest Configurations

```bash
# Test Jest config syntax
cd frontend && npx jest --showConfig
cd ../backend && npx jest --showConfig
cd ../ai-service && npx jest --showConfig
```

### Check Prettier Configurations

```bash
# Test Prettier config syntax
cd frontend && npx prettier --check .
cd ../backend && npx prettier --check .
cd ../ai-service && npx prettier --check .
```

### Check ESLint Configurations

```bash
# Test ESLint config syntax
cd frontend && npx eslint --print-config package.json
cd ../backend && npx eslint --print-config package.json
cd ../ai-service && npx eslint --print-config package.json
```

## Step 11: Test Workflow Files Locally

### Install act (GitHub Actions local runner)

```bash
# Install act (if you want to test workflows locally)
# Windows (using chocolatey)
choco install act-cli

# Or download from: https://github.com/nektos/act
```

### Test Workflow Syntax

```bash
# Check workflow syntax
cd .github/workflows
```

## Expected Results

After running all tests, you should see:

✅ **ESLint**: No linting errors
✅ **Prettier**: All files properly formatted
✅ **Unit Tests**: All tests pass with coverage reports
✅ **E2E Tests**: Browser tests complete successfully
✅ **Docker**: All services start and respond to health checks
✅ **Security**: No critical vulnerabilities or secrets found
✅ **Performance**: Basic load test completes

## Common Issues and Solutions

### Issue: Missing Dependencies
```bash
# Solution: Install missing packages
npm install <missing-package> --save-dev
```

### Issue: Playwright Browser Installation
```bash
# Solution: Install with deps
cd e2e-tests
npx playwright install --with-deps
```

### Issue: Docker Port Conflicts
```bash
# Solution: Stop conflicting services
docker-compose down
# Or check what's using ports
netstat -tulpn | grep :3000
```

### Issue: Test Coverage Too Low
```bash
# Solution: Lower thresholds temporarily in jest.config.js
# Or add more tests to reach thresholds
```

### Issue: ESLint Errors
```bash
# Solution: Fix automatically where possible
npm run lint:fix
# Or update ESLint rules in .eslintrc.json
```

## Next Steps

Once all local tests pass:

1. **Commit Changes**: `git add . && git commit -m "Add enhanced workflows"`
2. **Push to Branch**: `git push origin feature/enhanced-workflows`
3. **Create PR**: Create pull request to trigger workflows
4. **Monitor**: Watch GitHub Actions tab for workflow execution
5. **Configure Secrets**: Add required secrets in GitHub repository settings

## Monitoring First Workflow Run

When you push to GitHub:

1. Go to GitHub → Actions tab
2. Watch the workflows execute
3. Check for any failures and review logs
4. Download artifacts to verify reports
5. Check that notifications work (if configured)

Remember: The first run might take longer as Docker images are built and caches are established.