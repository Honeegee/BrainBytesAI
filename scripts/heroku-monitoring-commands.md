# Heroku Monitoring Setup - Manual CLI Commands

## 🚀 Quick Setup via Heroku CLI

### Prerequisites
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Login: `heroku login`

### Step 1: Enable Metrics on Your Apps

#### For Staging Environment:
```bash
# Backend
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=staging --app brainbytes-backend-staging-de872da2939f

# AI Service  
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=staging --app brainbytes-ai-service-staging-4b75c77cf53a

# Frontend
heroku config:set MONITORING_ENABLED=true ENVIRONMENT=staging --app brainbytes-frontend-staging-7593f4655363
```

#### For Production Environment:
```bash
# Backend
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=production --app brainbytes-backend-production-d355616d0f1f

# AI Service
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=production --app brainbytes-ai-production-3833f742ba79

# Frontend  
heroku config:set MONITORING_ENABLED=true ENVIRONMENT=production --app brainbytes-frontend-production-03d1e6b6b158
```

### Step 2: Restart Apps (Optional but Recommended)
```bash
# Staging
heroku restart --app brainbytes-backend-staging-de872da2939f
heroku restart --app brainbytes-ai-service-staging-4b75c77cf53a
heroku restart --app brainbytes-frontend-staging-7593f4655363

# Production  
heroku restart --app brainbytes-backend-production-d355616d0f1f
heroku restart --app brainbytes-ai-production-3833f742ba79
heroku restart --app brainbytes-frontend-production-03d1e6b6b158
```

### Step 3: Test Health Endpoints

#### Staging:
```bash
# Test health endpoints
curl https://brainbytes-backend-staging-de872da2939f.herokuapp.com/health
curl https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com/health
curl https://brainbytes-frontend-staging-7593f4655363.herokuapp.com/

# Test metrics endpoints  
curl https://brainbytes-backend-staging-de872da2939f.herokuapp.com/metrics
curl https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com/metrics
```

#### Production:
```bash
# Test health endpoints
curl https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/health
curl https://brainbytes-ai-production-3833f742ba79.herokuapp.com/health  
curl https://brainbytes-frontend-production-03d1e6b6b158.herokuapp.com/

# Test metrics endpoints
curl https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/metrics
curl https://brainbytes-ai-production-3833f742ba79.herokuapp.com/metrics
```

### Step 4: Check App Status
```bash
# Check if apps are running
heroku ps --app brainbytes-backend-staging-de872da2939f
heroku ps --app brainbytes-ai-service-staging-4b75c77cf53a
heroku ps --app brainbytes-frontend-staging-7593f4655363
```

### Step 5: View Application Logs
```bash
# Real-time log monitoring
heroku logs --tail --app brainbytes-backend-staging-de872da2939f
heroku logs --tail --app brainbytes-ai-service-staging-4b75c77cf53a

# Search for errors
heroku logs --app brainbytes-backend-staging-de872da2939f | grep ERROR
```

## 🔧 Automated Script Options

### Option 1: Windows Batch Script
```cmd
scripts\setup-heroku-monitoring-cli.bat
```

### Option 2: Using the Node.js Script
```bash
node monitoring/heroku/heroku-monitoring.js setup staging
node monitoring/heroku/heroku-monitoring.js setup production
```

### Option 3: Using Shell Script (if available)
```bash
./monitoring/heroku/setup-heroku-monitoring.sh staging
./monitoring/heroku/setup-heroku-monitoring.sh production
```

## 📊 Expected Results

After setup, you should see:

1. **Health endpoints responding** with JSON containing service status
2. **Metrics endpoints** returning Prometheus-formatted metrics
3. **Apps running** without errors in `heroku ps`
4. **Environment variables** set correctly in `heroku config`

## 🔍 Troubleshooting

### If metrics endpoint returns 404:
```bash
# Check if ENABLE_METRICS is set
heroku config --app your-app-name

# If not set, add it
heroku config:set ENABLE_METRICS=true --app your-app-name

# Restart the app
heroku restart --app your-app-name
```

### If app won't start:
```bash
# Check logs for errors
heroku logs --tail --app your-app-name

# Check dyno status
heroku ps --app your-app-name

# Check recent releases
heroku releases --app your-app-name
```

## 🎯 Next Steps After CLI Setup

1. **Set up Grafana Cloud** (free tier available)
2. **Configure remote write** for metrics collection  
3. **Import dashboards** from `monitoring/heroku/dashboards/`
4. **Set up alerts** using `monitoring/heroku/alerts/heroku-alert-rules.yml`
5. **Configure notifications** (email, Slack, etc.)

---

**Note**: The CLI commands above enable basic monitoring. For full Grafana Cloud integration, you'll also need to configure remote write endpoints with your Grafana Cloud credentials.