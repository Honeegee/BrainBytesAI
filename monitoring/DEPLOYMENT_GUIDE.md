# BrainBytes Monitoring Deployment Guide

## Quick Setup

Your Prometheus and Grafana monitoring stack is ready to deploy to Heroku!

### Option 1: Automated Deployment (Recommended)

**Windows:**
```bash
cd monitoring
deploy-to-heroku.bat
```

**Linux/Mac:**
```bash
cd monitoring
./deploy-to-heroku.sh
```

### Option 2: Manual Deployment

#### Deploy Prometheus

1. Create Prometheus app:
```bash
heroku create brainbytes-prometheus-prod --stack container
heroku config:set PORT=9090 --app brainbytes-prometheus-prod
```

2. Deploy:
```bash
git add .
git commit -m "Deploy Prometheus"
heroku container:push web --app brainbytes-prometheus-prod
heroku container:release web --app brainbytes-prometheus-prod
```

#### Deploy Grafana

1. Create Grafana app:
```bash
heroku create brainbytes-grafana-prod --stack container
heroku config:set GF_SECURITY_ADMIN_PASSWORD=brainbytes123 GF_USERS_ALLOW_SIGN_UP=false --app brainbytes-grafana-prod
```

2. Switch to Grafana config:
```bash
cp grafana-heroku.yml heroku.yml
cp Procfile.grafana Procfile
```

3. Deploy:
```bash
git add .
git commit -m "Deploy Grafana"
heroku container:push web --app brainbytes-grafana-prod
heroku container:release web --app brainbytes-grafana-prod
```

4. Restore original config:
```bash
git checkout heroku.yml Procfile
```

## Access Your Monitoring

- **Prometheus**: https://brainbytes-prometheus-prod.herokuapp.com
- **Grafana**: https://brainbytes-grafana-prod.herokuapp.com
  - Username: `admin`
  - Password: `brainbytes123`

## What's Already Configured

✅ Prometheus scraping your production apps
✅ Grafana dashboards for system monitoring
✅ Alert rules for critical metrics
✅ Proper Heroku container configuration

## Next Steps

1. Verify Prometheus is collecting metrics from your apps
2. Check Grafana dashboards are loading data
3. Test alert notifications
4. Customize dashboards as needed

That's it! Your monitoring stack is production-ready.