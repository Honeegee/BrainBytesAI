# Heroku Setup Guide for BrainBytesAI Homework

This guide provides step-by-step instructions to complete your cloud environment homework using Heroku, addressing all requirements from the assignment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Task 1: Complete Cloud Environment Setup](#task-1-complete-cloud-environment-setup)
3. [Task 2: Comprehensive Deployment Plan](#task-2-comprehensive-deployment-plan)
4. [Task 3: GitHub Actions CI/CD Pipeline](#task-3-github-actions-cicd-pipeline)
5. [Task 4: Philippine-Specific Documentation](#task-4-philippine-specific-documentation)
6. [Verification and Testing](#verification-and-testing)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts and Tools

1. **Heroku Account** (Free)
   - Sign up at [https://signup.heroku.com/](https://signup.heroku.com/)
   - Verify your email address

2. **MongoDB Atlas Account** (Free)
   - Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free M0 cluster

3. **GitHub Repository Secrets**
   - Access to your GitHub repository settings
   - Ability to add repository secrets

### Local Development Setup

```bash
# Install Heroku CLI
# Windows (using winget)
winget install Heroku.CLI

# macOS (using Homebrew)
brew tap heroku/brew && brew install heroku

# Linux (using snap)
sudo snap install --classic heroku

# Verify installation
heroku --version
heroku login
```

## Task 1: Complete Cloud Environment Setup

### 1.1 Security Hardening Implementation

#### Create Heroku Applications

```bash
# Login to Heroku
heroku login

# Create production applications
heroku create brainbytes-frontend --region us
heroku create brainbytes-backend --region us
heroku create brainbytes-ai-service --region us

# Create staging applications
heroku create brainbytes-frontend-staging --region us
heroku create brainbytes-backend-staging --region us
heroku create brainbytes-ai-service-staging --region us

# Verify applications created
heroku apps
```

#### Security Configuration

```bash
# Configure security settings for production backend
heroku config:set \
  HELMET_ENABLED=true \
  CSRF_PROTECTION=true \
  SECURE_COOKIES=true \
  HTTPS_ONLY=true \
  RATE_LIMIT_REQUESTS=1000 \
  RATE_LIMIT_WINDOW=900000 \
  BCRYPT_ROUNDS=12 \
  -a brainbytes-backend

# Configure security settings for staging backend
heroku config:set \
  HELMET_ENABLED=true \
  CSRF_PROTECTION=false \
  SECURE_COOKIES=false \
  HTTPS_ONLY=false \
  RATE_LIMIT_REQUESTS=100 \
  RATE_LIMIT_WINDOW=900000 \
  BCRYPT_ROUNDS=10 \
  -a brainbytes-backend-staging
```

### 1.2 Database and Storage Setup

#### MongoDB Atlas Configuration

1. **Create MongoDB Atlas Cluster**
   ```bash
   # In MongoDB Atlas Dashboard:
   # 1. Create a new project: "BrainBytesAI"
   # 2. Build a cluster (M0 Sandbox - FREE)
   # 3. Choose AWS, Singapore region (closest to Philippines)
   # 4. Create cluster
   ```

2. **Configure Database Access**
   ```bash
   # In Atlas Dashboard:
   # 1. Database Access → Add New Database User
   # 2. Authentication Method: Password
   # 3. Username: brainbytes_prod, Password: [generate secure password]
   # 4. Database User Privileges: Read and write to any database
   # 5. Repeat for staging user: brainbytes_staging
   ```

3. **Configure Network Access**
   ```bash
   # In Atlas Dashboard:
   # 1. Network Access → Add IP Address
   # 2. Add 0.0.0.0/0 (Allow access from anywhere) - for Heroku dynos
   # 3. Comment: "Heroku dynos"
   ```

4. **Get Connection Strings**
   ```bash
   # In Atlas Dashboard:
   # 1. Clusters → Connect → Connect your application
   # 2. Driver: Node.js, Version: 4.1 or later
   # 3. Copy connection string for both production and staging
   # Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```

#### Configure Database URLs in Heroku

```bash
# Production database
heroku config:set DATABASE_URL="mongodb+srv://brainbytes_prod:your_password@cluster.mongodb.net/brainbytes_production" -a brainbytes-backend

# Staging database  
heroku config:set DATABASE_URL="mongodb+srv://brainbytes_staging:your_password@cluster.mongodb.net/brainbytes_staging" -a brainbytes-backend-staging
```

### 1.3 Add-on Configuration and Monitoring

#### Redis Cache Setup

```bash
# Production Redis (Mini plan - $3/month)
heroku addons:create heroku-redis:mini -a brainbytes-backend

# Staging Redis (Hobby Dev - Free)
heroku addons:create heroku-redis:hobby-dev -a brainbytes-backend-staging

# Verify Redis setup
heroku addons -a brainbytes-backend
heroku config -a brainbytes-backend | grep REDIS_URL
```

#### Logging and Monitoring Setup

```bash
# Production logging (Papertrail Choklad - $7/month)
heroku addons:create papertrail:choklad -a brainbytes-backend
heroku addons:create papertrail:choklad -a brainbytes-frontend
heroku addons:create papertrail:choklad -a brainbytes-ai-service

# Staging logging (Papertrail Sandstone - Free)
heroku addons:create papertrail:sandstone -a brainbytes-backend-staging
heroku addons:create papertrail:sandstone -a brainbytes-frontend-staging
heroku addons:create papertrail:sandstone -a brainbytes-ai-service-staging

# Access logs
heroku addons:open papertrail -a brainbytes-backend
```

#### Application Performance Monitoring

```bash
# Enable Heroku Metrics (Free)
# Available automatically in Heroku Dashboard
# Access via: https://dashboard.heroku.com/apps/[app-name]/metrics

# Configure log drains for custom monitoring (optional)
heroku drains:add https://your-monitoring-service.com/logs -a brainbytes-backend
```

## Task 2: Comprehensive Deployment Plan

The deployment plan has been created in [`HEROKU_DEPLOYMENT_PLAN.md`](./HEROKU_DEPLOYMENT_PLAN.md). Key sections include:

- ✅ **Environment Architecture**: Complete Heroku app architecture with data flow diagrams
- ✅ **Resource Specifications**: Detailed dyno configurations and add-on plans
- ✅ **Security Implementation**: Environment variables, access control, and data protection
- ✅ **Deployment Procedures**: Step-by-step GitHub Actions integration
- ✅ **Testing and Validation**: Comprehensive testing strategies and checklists
- ✅ **Operational Procedures**: Maintenance, monitoring, and incident response
- ✅ **Cost Management**: Free tier optimization and cost monitoring
- ✅ **Philippine-Specific Considerations**: Network optimization and compliance

## Task 3: GitHub Actions CI/CD Pipeline

### 3.1 Repository Secrets Configuration

Add the following secrets to your GitHub repository (`Settings → Secrets and variables → Actions`):

#### Required Secrets

```bash
# Heroku Authentication
HEROKU_API_KEY=your_heroku_api_key

# Production Environment Secrets
PROD_DATABASE_URL=mongodb+srv://brainbytes_prod:password@cluster.mongodb.net/brainbytes_production
PROD_JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_prod
PROD_SESSION_SECRET=your_super_secure_session_secret_minimum_32_characters_prod
PROD_AI_API_KEY=your_production_ai_service_api_key
PROD_REDIS_URL=redis://h:password@host:port

# Staging Environment Secrets
STAGING_DATABASE_URL=mongodb+srv://brainbytes_staging:password@cluster.mongodb.net/brainbytes_staging
STAGING_JWT_SECRET=your_secure_jwt_secret_minimum_32_characters_staging
STAGING_SESSION_SECRET=your_secure_session_secret_minimum_32_characters_staging
STAGING_AI_API_KEY=your_staging_ai_service_api_key
STAGING_REDIS_URL=redis://h:password@host:port
```

#### How to Get Heroku API Key

```bash
# Method 1: Via Heroku CLI
heroku auth:token

# Method 2: Via Heroku Dashboard
# 1. Go to https://dashboard.heroku.com/account
# 2. Scroll to "API Key" section
# 3. Click "Reveal" and copy the key
```

### 3.2 Workflow Configuration

The complete GitHub Actions workflow is already created in [`.github/workflows/deploy-heroku.yml`](../../.github/workflows/deploy-heroku.yml).

#### Key Features:
- ✅ **Automatic deployment** after successful CI/CD pipeline
- ✅ **Manual deployment** with environment selection
- ✅ **Environment-specific configuration** (staging/production)
- ✅ **Health checks** and verification
- ✅ **Rollback capabilities**
- ✅ **Comprehensive reporting**

### 3.3 Testing the CI/CD Pipeline

#### Test Manual Deployment

```bash
# 1. Navigate to GitHub Actions tab in your repository
# 2. Select "Deploy to Heroku" workflow
# 3. Click "Run workflow"
# 4. Select environment: staging
# 5. Click "Run workflow"
```

#### Test Automatic Deployment

```bash
# 1. Make a minor change to your application
git add .
git commit -m "Test automatic deployment"
git push origin development  # Triggers staging deployment

# 2. Merge to main branch (triggers production deployment)
git checkout main
git merge development
git push origin main
```

## Task 4: Philippine-Specific Documentation

### 4.1 Performance Optimization for Philippine Internet

#### Network Resilience Implementation

Create [`frontend/lib/resilient-api.js`](../../frontend/lib/resilient-api.js):

```javascript
// Resilient API client for Philippine internet conditions
import axios from 'axios';

const createResilientClient = () => {
  const client = axios.create({
    timeout: 30000, // 30 seconds for slow connections
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  // Add retry logic
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config } = error;
      
      // Don't retry if already retried 3 times
      if (!config || config.__retryCount >= 3) {
        throw error;
      }
      
      config.__retryCount = (config.__retryCount || 0) + 1;
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, config.__retryCount) * 1000;
      
      console.log(`Retrying request (attempt ${config.__retryCount}/3) after ${delay}ms`);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(client(config)), delay);
      });
    }
  );
  
  return client;
};

export default createResilientClient();
```

#### Mobile Data Optimization

Update [`frontend/next.config.js`](../../frontend/next.config.js):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for mobile data usage
  compress: true,
  
  // Image optimization for slow connections
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // PWA configuration for offline support
  experimental: {
    scrollRestoration: true,
  },
  
  // Optimize bundle size
  swcMinify: true,
  
  // Philippine-specific headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Philippines-Optimized',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 4.2 Data Privacy Compliance

#### Philippine Data Privacy Act Implementation

Create [`backend/middleware/data-privacy.js`](../../backend/middleware/data-privacy.js):

```javascript
// Philippine Data Privacy Act compliance middleware
const crypto = require('crypto');

const dataPrivacyMiddleware = {
  // Audit logging for DPA compliance
  auditLogger: (req, res, next) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: req.user?.id || 'anonymous',
      action: req.method,
      resource: req.path,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      dataAccessed: req.body ? Object.keys(req.body) : [],
    };
    
    // Log to compliance system
    console.log('DPA_AUDIT:', JSON.stringify(auditLog));
    
    // Store in audit trail database
    // await AuditLog.create(auditLog);
    
    next();
  },
  
  // Data minimization
  sanitizeUserData: (userData) => {
    const { password, internalNotes, adminFlags, ...safeData } = userData;
    return safeData;
  },
  
  // Consent management
  requireConsent: (consentType) => {
    return (req, res, next) => {
      if (!req.user?.consents?.[consentType]) {
        return res.status(403).json({
          error: 'Data processing consent required',
          consentType,
          redirect: `/consent/${consentType}`,
        });
      }
      next();
    };
  },
  
  // Data retention policy
  scheduleDataDeletion: (userId, retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000) => {
    const deletionDate = new Date(Date.now() + retentionPeriod);
    
    // Schedule deletion job
    console.log(`Scheduled data deletion for user ${userId} on ${deletionDate}`);
    // await ScheduledJob.create({ userId, deletionDate, type: 'data_deletion' });
  },
};

module.exports = dataPrivacyMiddleware;
```

### 4.3 Educational Data Handling

#### FERPA-Compliant Student Data Protection

Create [`backend/models/student-data.js`](../../backend/models/student-data.js):

```javascript
// Educational data model with Philippine compliance
const mongoose = require('mongoose');
const crypto = require('crypto');

const studentDataSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Encrypted educational records
  educationalRecords: {
    type: String, // Encrypted JSON
    required: true,
  },
  
  // Metadata for compliance
  dataClassification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'confidential',
  },
  
  consentRecords: [{
    type: String, // Type of consent
    granted: Boolean,
    timestamp: Date,
    ipAddress: String,
  }],
  
  accessLog: [{
    userId: String,
    action: String,
    timestamp: Date,
    purpose: String,
  }],
  
  retentionSchedule: {
    createdAt: { type: Date, default: Date.now },
    retentionPeriod: { type: Number, default: 7 * 365 * 24 * 60 * 60 * 1000 }, // 7 years
    scheduledDeletion: Date,
  },
}, {
  timestamps: true,
});

// Encrypt educational records before saving
studentDataSchema.pre('save', function(next) {
  if (this.isModified('educationalRecords')) {
    const cipher = crypto.createCipher('aes-256-gcm', process.env.EDUCATION_ENCRYPTION_KEY);
    this.educationalRecords = cipher.update(this.educationalRecords, 'utf8', 'hex') + cipher.final('hex');
  }
  next();
});

// Decrypt educational records after loading
studentDataSchema.methods.getDecryptedRecords = function() {
  const decipher = crypto.createDecipher('aes-256-gcm', process.env.EDUCATION_ENCRYPTION_KEY);
  const decrypted = decipher.update(this.educationalRecords, 'hex', 'utf8') + decipher.final('utf8');
  return JSON.parse(decrypted);
};

module.exports = mongoose.model('StudentData', studentDataSchema);
```

## Verification and Testing

### Deployment Verification Checklist

#### Pre-Deployment Verification

```bash
# 1. Verify all secrets are configured
heroku config -a brainbytes-backend

# 2. Check add-ons are provisioned
heroku addons -a brainbytes-backend

# 3. Verify database connectivity
heroku run node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Database error:', err));
" -a brainbytes-backend

# 4. Test Redis connectivity
heroku run node -e "
  const redis = require('redis');
  const client = redis.createClient(process.env.REDIS_URL);
  client.ping().then(() => console.log('✅ Redis connected'));
" -a brainbytes-backend
```

#### Post-Deployment Verification

```bash
# 1. Health check all services
curl https://brainbytes-backend-staging.herokuapp.com/health
curl https://brainbytes-frontend-staging.herokuapp.com/
curl https://brainbytes-ai-service-staging.herokuapp.com/health

# 2. Check application logs
heroku logs --tail -a brainbytes-backend-staging

# 3. Verify environment variables
heroku config -a brainbytes-backend-staging

# 4. Test basic functionality
# - User registration
# - User login
# - API endpoints
# - Database operations
```

### Performance Testing

#### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://brainbytes-backend-staging.herokuapp.com'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 300
      arrivalRate: 10
      name: "Sustained load"
scenarios:
  - name: "API health check"
    requests:
      - get:
          url: "/health"
  - name: "User authentication"
    requests:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "testpassword"
EOF

# Run load test
artillery run load-test.yml
```

### Security Testing

#### Security Audit Checklist

```bash
# 1. NPM audit for vulnerabilities
cd frontend && npm audit
cd ../backend && npm audit
cd ../ai-service && npm audit

# 2. Check environment variables
heroku config -a brainbytes-backend | grep -E "(SECRET|KEY|PASSWORD)"

# 3. Test HTTPS enforcement
curl -I http://brainbytes-frontend.herokuapp.com
# Should redirect to HTTPS

# 4. Test rate limiting
for i in {1..20}; do
  curl -w "%{http_code}\n" -o /dev/null -s https://brainbytes-backend-staging.herokuapp.com/api/test
done
# Should show 429 after rate limit exceeded

# 5. Test CORS configuration
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://brainbytes-backend-staging.herokuapp.com/api/users
# Should deny unauthorized origins
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Not Starting

```bash
# Check build logs
heroku logs --tail -a brainbytes-backend-staging

# Common fixes:
# - Verify Procfile exists and is correct
# - Check package.json start script
# - Verify environment variables
# - Check Node.js version compatibility

# Fix Node.js version
echo "18.x" > .nvmrc
git add .nvmrc
git commit -m "Set Node.js version"
git push heroku main
```

#### 2. Database Connection Issues

```bash
# Check DATABASE_URL format
heroku config:get DATABASE_URL -a brainbytes-backend-staging

# Test connection manually
heroku run node -e "
  const mongoose = require('mongoose');
  console.log('Connecting to:', process.env.DATABASE_URL);
  mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error:', err.message));
" -a brainbytes-backend-staging

# Common fixes:
# - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
# - Check database user permissions
# - Verify connection string format
# - Check if cluster is sleeping (wake it up)
```

#### 3. Environment Variable Issues

```bash
# List all config vars
heroku config -a brainbytes-backend-staging

# Set missing variables
heroku config:set MISSING_VAR=value -a brainbytes-backend-staging

# Remove incorrect variables
heroku config:unset WRONG_VAR -a brainbytes-backend-staging

# Bulk update from file
heroku config:set $(cat .env.production) -a brainbytes-backend
```

#### 4. Deployment Failures

```bash
# Check deployment status
heroku releases -a brainbytes-backend-staging

# Rollback to previous version
heroku rollback v123 -a brainbytes-backend-staging

# Force restart
heroku restart -a brainbytes-backend-staging

# Clear build cache
heroku repo:purge_cache -a brainbytes-backend-staging
```

#### 5. GitHub Actions Issues

```bash
# Common fixes:
# 1. Verify HEROKU_API_KEY secret is set correctly
# 2. Check that app names in workflow match actual Heroku apps
# 3. Verify branch names in triggers
# 4. Check if Heroku apps exist and you have access

# Test Heroku CLI authentication locally
heroku auth:whoami
heroku apps

# Verify GitHub secrets
# Go to repository Settings → Secrets and variables → Actions
# Ensure all required secrets are present and correct
```

### Support Resources

1. **Heroku Documentation**: https://devcenter.heroku.com/
2. **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
3. **GitHub Actions Documentation**: https://docs.github.com/en/actions
4. **Philippine Data Privacy Act**: https://privacy.gov.ph/data-privacy-act/

### Final Homework Submission

Your homework should include:

- ✅ **Deployed applications** on Heroku (staging and production)
- ✅ **Comprehensive documentation** (this guide + deployment plan)
- ✅ **Working CI/CD pipeline** with GitHub Actions
- ✅ **Security implementations** (environment variables, HTTPS, rate limiting)
- ✅ **Philippine-specific optimizations** (network resilience, data privacy compliance)
- ✅ **Cost management** within free/low-cost tiers
- ✅ **Monitoring and logging** setup
- ✅ **Testing procedures** and validation checklists

This Heroku-based approach provides a complete cloud deployment solution that's much easier to implement than AWS while still meeting all the homework requirements and providing real-world deployment experience.