@echo off
echo 🚀 Deploying BrainBytes Monitoring to Heroku...

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Heroku CLI is not installed. Please install it first.
    pause
    exit /b 1
)

REM Check login
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Please login to Heroku first: heroku login
    pause
    exit /b 1
)

REM Set app names
set PROMETHEUS_APP=brainbytes-prometheus-prod
set GRAFANA_APP=brainbytes-grafana-prod

echo 📊 Creating Prometheus app: %PROMETHEUS_APP%

REM Create Prometheus app
heroku create %PROMETHEUS_APP% --stack container
heroku config:set PORT=9090 --app %PROMETHEUS_APP%

REM Deploy Prometheus
git add .
git commit -m "Deploy Prometheus monitoring"
heroku container:push web --app %PROMETHEUS_APP%
heroku container:release web --app %PROMETHEUS_APP%

echo ✅ Prometheus deployed to: https://%PROMETHEUS_APP%.herokuapp.com

echo 📈 Creating Grafana app: %GRAFANA_APP%

REM Create Grafana app
heroku create %GRAFANA_APP% --stack container

REM Set Grafana environment variables
heroku config:set GF_SECURITY_ADMIN_PASSWORD=brainbytes123 GF_USERS_ALLOW_SIGN_UP=false GF_SERVER_HTTP_PORT=3000 --app %GRAFANA_APP%

REM Copy Grafana-specific files for deployment
copy grafana-heroku.yml heroku.yml
copy Procfile.grafana Procfile

REM Deploy Grafana
git add .
git commit -m "Deploy Grafana monitoring"
heroku container:push web --app %GRAFANA_APP%
heroku container:release web --app %GRAFANA_APP%

REM Restore original files
git checkout heroku.yml Procfile

echo ✅ Grafana deployed to: https://%GRAFANA_APP%.herokuapp.com
echo 🔐 Grafana login: admin / brainbytes123
echo.
echo 🎉 Monitoring stack deployed successfully!
echo 📊 Prometheus: https://%PROMETHEUS_APP%.herokuapp.com
echo 📈 Grafana: https://%GRAFANA_APP%.herokuapp.com
echo.
echo Next steps:
echo 1. Configure Grafana data source to point to your Prometheus URL
echo 2. Import the pre-configured dashboards
echo 3. Set up alerting rules

pause