# Atlas CI/CD Pipeline Setup Guide

## 🎯 **Overview**

This guide explains how to configure your GitHub Actions CI/CD pipeline to work with MongoDB Atlas instead of local MongoDB containers.

## ✅ **Changes Made to CI/CD Pipeline**

### **Updated Workflows**
- [`ci-cd.yml`](../../.github/workflows/ci-cd.yml) - Updated to use Atlas for E2E and performance testing
- Removed local MongoDB service containers
- Updated environment variables to use Atlas connection strings

## 🔐 **Required GitHub Repository Secrets**

You need to add these secrets to your GitHub repository:

### **1. Navigate to Repository Settings**
1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### **2. Add Atlas Database Secrets**

#### **TEST_DATABASE_URL**
```bash
Name: TEST_DATABASE_URL
Value: mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_test?retryWrites=true&w=majority&appName=BrainBytes
```

#### **STAGING_DATABASE_URL** 
```bash
Name: STAGING_DATABASE_URL
Value: mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_staging?retryWrites=true&w=majority&appName=BrainBytes
```

#### **PRODUCTION_DATABASE_URL**
```bash
Name: PRODUCTION_DATABASE_URL  
Value: mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_production?retryWrites=true&w=majority&appName=BrainBytes
```

### **3. Add Heroku Deployment Secrets (if using Heroku)**

#### **HEROKU_API_KEY**
```bash
Name: HEROKU_API_KEY
Value: [Your Heroku API Key from account settings]
```

#### **Other Deployment Secrets**
```bash
Name: PROD_JWT_SECRET
Value: [Your production JWT secret - min 32 characters]

Name: PROD_SESSION_SECRET
Value: [Your production session secret - min 32 characters]

Name: STAGING_JWT_SECRET
Value: [Your staging JWT secret - min 32 characters]

Name: STAGING_SESSION_SECRET
Value: [Your staging session secret - min 32 characters]
```

## 🗄️ **Atlas Database Structure**

### **Required Databases in Your Atlas Cluster**
```yaml
Atlas Cluster: brainbytes.bpmgicl.mongodb.net
├── brainbytes_test          # For CI/CD testing
├── brainbytes_development   # For local development  
├── brainbytes_staging       # For staging environment
└── brainbytes_production    # For production environment
```

### **Atlas User Permissions**
Your current user `honeygden` should have:
- **Read and write access** to all databases
- **Network access** from GitHub Actions IPs (0.0.0.0/0 is already configured)

## 🚀 **How the Updated CI/CD Works**

### **E2E Testing Flow**
1. **No MongoDB Container**: Removes local MongoDB service
2. **Atlas Connection**: Uses `TEST_DATABASE_URL` secret
3. **Backend Startup**: Connects directly to Atlas test database
4. **Test Execution**: Runs Playwright tests against Atlas-connected services

### **Performance Testing Flow**
1. **Atlas Performance DB**: Uses same `TEST_DATABASE_URL`
2. **Load Testing**: Artillery tests run against Atlas-connected backend
3. **Real-world Simulation**: Tests actual Atlas performance characteristics

### **Environment Variables in CI/CD**
```yaml
# E2E Tests:
DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
MONGODB_URI: ${{ secrets.TEST_DATABASE_URL }}

# Performance Tests:  
DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
MONGODB_URI: ${{ secrets.TEST_DATABASE_URL }}
```

## 🧪 **Testing the Updated Pipeline**

### **1. Trigger CI/CD Pipeline**
```bash
# Option 1: Manual trigger
# Go to GitHub Actions → CI/CD Pipeline → Run workflow

# Option 2: Push to development branch
git checkout development
git commit --allow-empty -m "Test Atlas CI/CD pipeline"
git push origin development

# Option 3: Push to main branch  
git checkout main
git commit --allow-empty -m "Test Atlas CI/CD pipeline"
git push origin main
```

### **2. Monitor Pipeline Execution**
1. Go to **GitHub Actions** tab in your repository
2. Click on the running **CI/CD Pipeline** workflow
3. Monitor each job:
   - ✅ **Setup**: Should install dependencies successfully
   - ✅ **Test Matrix**: Should run unit tests for all services
   - ✅ **E2E Tests**: Should connect to Atlas and run integration tests
   - ✅ **Performance Tests**: Should run load tests against Atlas

### **3. Expected Success Indicators**
```bash
✅ Backend connects to Atlas test database
✅ E2E tests run without MongoDB container errors
✅ Performance tests complete successfully
✅ All test artifacts are uploaded
✅ Test summary shows all jobs passed
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Missing GitHub Secrets**
```yaml
Error: "DATABASE_URL is not defined"
Solution: Add TEST_DATABASE_URL secret to repository
```

#### **2. Atlas Network Access**
```yaml
Error: "Could not connect to Atlas cluster"
Solution: Ensure 0.0.0.0/0 is whitelisted in Atlas Network Access
```

#### **3. Database Permissions**
```yaml
Error: "Authentication failed"
Solution: Verify user permissions in Atlas Database Access
```

#### **4. Connection String Format**
```yaml
Error: "Invalid connection string"
Solution: Ensure format is mongodb+srv://user:pass@cluster/database?options
```

## 📊 **Benefits of Atlas-Enabled CI/CD**

### **Advantages**
- ✅ **Realistic Testing**: Tests run against actual Atlas infrastructure
- ✅ **Performance Accuracy**: Load tests reflect real Atlas performance
- ✅ **Consistency**: Same database technology across all environments
- ✅ **Scalability**: Atlas handles test load automatically
- ✅ **Monitoring**: Atlas provides insights into test database usage

### **Considerations**
- ⚠️ **Network Dependency**: Tests require internet connectivity to Atlas
- ⚠️ **Data Isolation**: Test database should be separate from development
- ⚠️ **Cost Awareness**: Test executions consume Atlas resources (minimal on M0)

## ✅ **Next Steps**

1. **Add GitHub Secrets**: Configure all required repository secrets
2. **Test Pipeline**: Run a test deployment to verify Atlas connectivity
3. **Monitor Performance**: Check Atlas metrics during CI/CD runs
4. **Documentation**: Update team docs with new CI/CD process

## 🔄 **Migration Summary**

| Component | Before | After |
|-----------|---------|-------|
| **E2E Database** | Local MongoDB container | Atlas test database |
| **Performance DB** | Local MongoDB container | Atlas test database |
| **Network** | Container networking | Internet → Atlas |
| **Configuration** | Hardcoded localhost | GitHub secrets |
| **Monitoring** | Container logs only | Atlas + GitHub logs |

Your CI/CD pipeline is now fully compatible with the Atlas-only approach! 🎉