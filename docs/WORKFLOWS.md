# Enhanced GitHub Actions Workflows

This document describes the comprehensive CI/CD workflows implemented for the BrainBytes project.

## Overview

The project includes several automated workflows that handle testing, code quality, security, and deployment:

1. **CI/CD Pipeline** (`ci-cd.yml`) - Main workflow for testing and quality checks
2. **Deployment** (`deploy.yml`) - Environment-specific deployment automation
3. **Code Quality** (`code-quality.yml`) - Advanced code quality and security scanning

## Workflows Description

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Features:**
- ✅ **Caching** - Dependencies and Docker layers cached for faster builds
- ✅ **Matrix Builds** - Tests on Node.js versions 18, 20, and 22
- ✅ **Job Timeouts** - Prevents stuck workflows (5-30 minutes per job)
- ✅ **Artifacts** - Stores test results, coverage, and reports
- ✅ **Notifications** - Slack integration and GitHub issue creation on failures

**Jobs:**

#### Code Quality Checks
- ESLint validation for all services
- Prettier format checking
- Large file detection (>50MB)
- Basic secrets scanning

#### Security Scanning
- npm audit for vulnerability detection
- Audit reports generation
- Security artifacts storage

#### Matrix Testing
- Parallel testing across Node.js versions
- Coverage collection with Codecov integration
- Service-specific test isolation

#### End-to-End Testing
- Playwright browser testing
- Multi-browser support (Chrome, Firefox, Safari)
- Mobile viewport testing
- Service health verification

#### Docker Build & Test
- Multi-stage Docker builds with caching
- Container health checks
- Service integration testing

#### Performance Testing
- Artillery load testing
- Performance report generation
- Automated performance benchmarking

#### Test Summary & Notifications
- Consolidated test reporting
- Slack notifications
- GitHub issue creation on failures

### 2. Deployment Workflow (`deploy.yml`)

**Triggers:**
- Push to `main` (production) or `develop` (staging)
- Manual workflow dispatch with environment selection

**Features:**
- ✅ **Environment Variables** - Secure secret management
- ✅ **Branch-specific Deployments** - Automatic environment detection
- ✅ **Blue-Green Deployment** - Zero-downtime production deployments
- ✅ **Deployment Verification** - Health checks and smoke tests
- ✅ **Rollback Capability** - Automatic rollback on failures

**Environments:**
- **Staging** (`staging.brainbytes.app`) - Auto-deploy from `develop`
- **Production** (`brainbytes.app`) - Auto-deploy from `main`

**Deployment Process:**
1. **Build & Push** - Docker images to GitHub Container Registry
2. **Environment Setup** - Configuration and secrets injection
3. **Deployment** - Service deployment with health checks
4. **Verification** - Automated testing of deployed services
5. **Notification** - Status updates via Slack

### 3. Code Quality Workflow (`code-quality.yml`)

**Triggers:**
- Push/PR to main branches
- Daily scheduled run at 2 AM UTC
- Manual workflow dispatch

**Features:**
- ✅ **ESLint Integration** - Comprehensive code linting
- ✅ **Prettier Formatting** - Code format validation
- ✅ **Vulnerability Scanning** - Dependency security checks
- ✅ **Code Analysis** - Complexity and maintainability metrics
- ✅ **Secrets Detection** - Advanced secrets scanning with TruffleHog

**Quality Checks:**

#### Lint & Format
- ESLint rules enforcement
- Prettier format validation
- JSON report generation

#### Security Scanning
- npm audit with severity filtering
- High/critical vulnerability detection
- PR comments with security findings

#### Code Analysis
- Code duplication detection
- File size monitoring
- TODO/FIXME comment tracking

#### Secrets Scanning
- TruffleHog OSS integration
- Manual pattern detection
- URL credential checking

## Configuration Files

### Test Configuration
- **Frontend**: [`frontend/jest.config.js`](../frontend/jest.config.js)
- **Backend**: [`backend/jest.config.js`](../backend/jest.config.js)
- **AI Service**: [`ai-service/jest.config.js`](../ai-service/jest.config.js)
- **E2E Tests**: [`e2e-tests/playwright.config.js`](../e2e-tests/playwright.config.js)

### Code Quality
- **Prettier**: `.prettierrc.json` in each service directory
- **ESLint**: `.eslintrc.json` in each service directory

### Docker Deployment
- **Staging**: [`docker-compose.staging.yml`](../docker-compose.staging.yml)
- **Production**: [`docker-compose.production.yml`](../docker-compose.production.yml)

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Staging Environment
```
STAGING_DATABASE_URL
STAGING_JWT_SECRET
STAGING_SESSION_SECRET
STAGING_AI_API_KEY
STAGING_MONGO_USER
STAGING_MONGO_PASSWORD
```

### Production Environment
```
PRODUCTION_DATABASE_URL
PRODUCTION_JWT_SECRET
PRODUCTION_SESSION_SECRET
PRODUCTION_AI_API_KEY
PRODUCTION_MONGO_USER
PRODUCTION_MONGO_PASSWORD
PRODUCTION_REDIS_PASSWORD
```

### Notifications
```
SLACK_WEBHOOK_URL (optional)
```

## Artifacts & Reports

### Test Results
- **Location**: `test-results/`
- **Coverage**: `coverage/`
- **E2E Reports**: `playwright-report/`
- **Performance**: `performance-report.html`

### Quality Reports
- **Security**: `security-report.md`
- **Code Analysis**: `code-analysis-report.md`
- **Secrets Scan**: `secrets-report.md`
- **Quality Summary**: `quality-summary.md`

## Coverage Thresholds

| Service | Lines | Functions | Branches | Statements |
|---------|-------|-----------|----------|------------|
| Frontend | 70% | 70% | 70% | 70% |
| Backend | 70% | 70% | 70% | 70% |
| AI Service | 60% | 60% | 60% | 60% |

## Performance Metrics

### Load Testing
- **Duration**: 60 seconds
- **Arrival Rate**: 10 requests/second
- **Target**: All API endpoints
- **Reports**: HTML and JSON formats

### Response Time Targets
- **Frontend**: < 2 seconds
- **API**: < 500ms
- **Database**: < 100ms

## Monitoring & Alerts

### Failure Notifications
- **Slack**: Real-time workflow status
- **GitHub Issues**: Auto-created for main branch failures
- **Email**: GitHub notification settings

### Health Checks
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3-5 attempts
- **Endpoints**: `/health`, `/api/health`, `/api/health/db`

## Best Practices

### Workflow Optimization
1. **Caching Strategy**: Dependencies and Docker layers cached
2. **Parallel Execution**: Matrix builds and independent jobs
3. **Early Termination**: Fast failure detection
4. **Resource Management**: Appropriate timeouts and limits

### Security
1. **Secret Management**: GitHub Secrets for sensitive data
2. **Least Privilege**: Minimal permissions for workflow actions
3. **Vulnerability Scanning**: Automated dependency checks
4. **Secrets Detection**: Multiple scanning methods

### Testing Strategy
1. **Unit Tests**: Service-specific testing
2. **Integration Tests**: Cross-service communication
3. **E2E Tests**: Full user journey validation
4. **Performance Tests**: Load and stress testing

## Troubleshooting

### Common Issues

#### Test Failures
- Check coverage thresholds
- Verify test environment setup
- Review service dependencies

#### Deployment Failures
- Validate environment variables
- Check Docker image availability
- Verify service health endpoints

#### Security Alerts
- Review npm audit output
- Check for hardcoded secrets
- Update vulnerable dependencies

### Debugging Tips

1. **Workflow Logs**: Check GitHub Actions logs
2. **Local Testing**: Run workflows locally with `act`
3. **Step-by-step**: Use workflow debug mode
4. **Artifacts**: Download and examine generated reports

## Migration Guide

If upgrading from basic workflows:

1. **Update package.json**: Add new dependencies
2. **Configure secrets**: Set up environment variables
3. **Test locally**: Verify changes before deployment
4. **Monitor initially**: Watch first few workflow runs
5. **Adjust thresholds**: Fine-tune based on project needs

## Future Enhancements

Planned improvements:
- [ ] Integration with external monitoring tools
- [ ] Advanced performance testing scenarios
- [ ] Multi-environment staging
- [ ] Automated dependency updates
- [ ] Advanced security scanning tools