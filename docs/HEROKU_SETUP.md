# 🚀 Heroku Setup Guide for BrainBytesAI

This guide will walk you through setting up Heroku for your BrainBytesAI application deployment.

## 📋 Prerequisites

- Heroku account (free tier available)
- Git installed locally
- Node.js installed locally
- Your MongoDB Atlas connection string

## 🔧 Step 1: Create Heroku Account & Install CLI

### 1.1 Create Heroku Account
1. Go to [https://signup.heroku.com/](https://signup.heroku.com/)
2. Sign up with your email
3. Verify your email address
4. Complete account setup

### 1.2 Install Heroku CLI
**Windows:**
```bash
# Download and install from: https://devcenter.heroku.com/articles/heroku-cli
# Or use Chocolatey:
choco install heroku-cli

# Or use npm:
npm install -g heroku
```

**Verify installation:**
```bash
heroku --version
```

### 1.3 Login to Heroku
```bash
heroku login
```
This will open a browser for authentication.

## 🏗️ Step 2: Create Heroku Applications

You need to create 6 Heroku apps (3 for staging, 3 for production):

### 2.1 Create Staging Apps
```bash
# Backend staging
heroku create brainbytes-backend-staging

# Frontend staging  
heroku create brainbytes-frontend-staging

# AI Service staging
heroku create brainbytes-ai-service-staging
```

### 2.2 Create Production Apps
```bash
# Backend production
heroku create brainbytes-backend

# Frontend production
heroku create brainbytes-frontend

# AI Service production
heroku create brainbytes-ai-service
```

**Note:** If these names are taken, use variations like:
- `your-username-brainbytes-backend-staging`
- `brainbytes-ai-backend-staging-v2`

## 🔑 Step 3: Get Heroku API Key

### 3.1 Generate API Key
```bash
heroku auth:token
```

### 3.2 Copy the API Key
Save this token - you'll need it for GitHub Actions.

## ⚙️ Step 4: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/Honeegee/BrainBytesAI/settings/secrets/actions`

Add these secrets:

### 4.1 Heroku Configuration
```
HEROKU_API_KEY = [Your Heroku API key from Step 3]
```

### 4.2 Staging Environment Secrets
```
STAGING_DATABASE_URL = [Your MongoDB Atlas connection string]
STAGING_JWT_SECRET = [Generate a random 64-character string]
STAGING_SESSION_SECRET = [Generate a random 64-character string]
STAGING_AI_API_KEY = [Your AI service API key (e.g., GROQ_API_KEY)]
STAGING_REDIS_URL = [Optional: Redis connection string]
```

### 4.3 Production Environment Secrets (Optional for now)
```
PROD_DATABASE_URL = [Your production MongoDB Atlas connection string]
PROD_JWT_SECRET = [Generate a different random 64-character string]
PROD_SESSION_SECRET = [Generate a different random 64-character string]
PROD_AI_API_KEY = [Your production AI service API key]
PROD_REDIS_URL = [Optional: Production Redis connection string]
```

## 🎲 Step 5: Generate Random Secrets

You can use these methods to generate secure random strings:

### 5.1 Online Generator
- Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
- Select "256-bit" and generate

### 5.2 Node.js Command
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5.3 OpenSSL (if available)
```bash
openssl rand -hex 32
```

## 🔧 Step 6: Update App Names (If Different)

If you had to use different app names, update the deployment workflow:

1. Edit [`.github/workflows/deploy-heroku.yml`](.github/workflows/deploy-heroku.yml)
2. Update lines 86-93 with your actual app names:

```yaml
# Set Heroku app names based on environment
if [[ "$environment" == "production" ]]; then
  echo "frontend_app=YOUR-FRONTEND-APP" >> $GITHUB_OUTPUT
  echo "backend_app=YOUR-BACKEND-APP" >> $GITHUB_OUTPUT
  echo "ai_app=YOUR-AI-SERVICE-APP" >> $GITHUB_OUTPUT
else
  echo "frontend_app=YOUR-FRONTEND-STAGING-APP" >> $GITHUB_OUTPUT
  echo "backend_app=YOUR-BACKEND-STAGING-APP" >> $GITHUB_OUTPUT
  echo "ai_app=YOUR-AI-SERVICE-STAGING-APP" >> $GITHUB_OUTPUT
fi
```

## 🧪 Step 7: Test Your Setup

### 7.1 Verify Apps Were Created
```bash
heroku apps
```

You should see all 6 apps listed.

### 7.2 Check App Status
```bash
heroku ps -a brainbytes-backend-staging
```

## 🚀 Step 8: Ready to Deploy!

Once setup is complete, you can deploy using:

### 8.1 Automatic Deployment
Push your code to the `test-atlas-cicd` branch - deployment will trigger automatically after CI/CD passes.

### 8.2 Manual Deployment
1. Go to: https://github.com/Honeegee/BrainBytesAI/actions/workflows/deploy-heroku.yml
2. Click "Run workflow"
3. Select branch: `test-atlas-cicd`
4. Choose environment: `staging`
5. Click "Run workflow"

### 8.3 Using Helper Script
```bash
node scripts/deploy-heroku.js deploy staging
```

## 📊 Monitoring Your Apps

### 8.1 View Logs
```bash
# Backend logs
heroku logs --tail -a brainbytes-backend-staging

# Frontend logs  
heroku logs --tail -a brainbytes-frontend-staging

# AI Service logs
heroku logs --tail -a brainbytes-ai-service-staging
```

### 8.2 Check App Status
```bash
heroku ps -a brainbytes-backend-staging
```

### 8.3 View App URLs
After deployment, your apps will be available at:
- Frontend: `https://[your-frontend-app].herokuapp.com`
- Backend: `https://[your-backend-app].herokuapp.com`
- AI Service: `https://[your-ai-service-app].herokuapp.com`

## 🆘 Troubleshooting

### Common Issues:

1. **App names already taken**
   - Use variations with your username or add numbers/suffixes

2. **GitHub Secrets not working**
   - Ensure secrets are added to the repository (not your personal account)
   - Check for typos in secret names

3. **Database connection issues**
   - Verify your MongoDB Atlas connection string
   - Ensure Atlas allows connections from anywhere (0.0.0.0/0) for Heroku

4. **Build failures**
   - Check Heroku logs: `heroku logs -a [app-name]`
   - Verify package.json scripts exist

## 🎯 Quick Setup Checklist

- [ ] Heroku account created
- [ ] Heroku CLI installed and logged in
- [ ] 6 Heroku apps created (3 staging, 3 production)
- [ ] Heroku API key generated
- [ ] GitHub secrets configured
- [ ] Random JWT/Session secrets generated
- [ ] MongoDB Atlas connection string ready
- [ ] App names updated in workflow (if needed)
- [ ] Ready to deploy!

## 💡 Tips

1. **Free Tier Limits**: Heroku free tier has limitations. Consider upgrading for production use.
2. **Environment Variables**: You can also set environment variables directly in Heroku dashboard.
3. **Custom Domains**: Add custom domains in Heroku app settings after deployment.
4. **SSL**: Heroku provides free SSL certificates for all apps.

---

Need help? Check the [official Heroku documentation](https://devcenter.heroku.com/) or ask for assistance!