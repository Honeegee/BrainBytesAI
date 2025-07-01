@echo off
echo 🚀 Deploying Monitoring Stack to Heroku...
echo.

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Heroku CLI not found. Please install it first.
    echo 📥 Download: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

echo 📋 Creating Heroku apps for monitoring stack...
echo.

REM Create Prometheus app
echo 🔧 Creating Prometheus app...
heroku create brainbytes-prometheus-prod --stack heroku-24
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Prometheus app may already exist, continuing...
)

REM Create Grafana app
echo 📊 Creating Grafana app...
heroku create brainbytes-grafana-prod --stack heroku-24
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Grafana app may already exist, continuing...
)

echo.
echo 🔧 Setting up git remotes...

REM Add git remotes for monitoring apps
git remote add prometheus-heroku https://git.heroku.com/brainbytes-prometheus-prod.git
git remote add grafana-heroku https://git.heroku.com/brainbytes-grafana-prod.git

echo.
echo 📦 Deploying Prometheus...
echo.

REM Deploy Prometheus
git subtree push --prefix=monitoring prometheus-heroku main
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Subtree push failed, trying force push...
    git push prometheus-heroku main:main --force
)

echo.
echo 📊 Deploying Grafana...
echo.

REM Deploy Grafana
git subtree push --prefix=monitoring grafana-heroku main
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Subtree push failed, trying force push...
    git push grafana-heroku main:main --force
)

echo.
echo ⚙️ Configuring Heroku apps...

REM Configure Prometheus app
heroku config:set PROMETHEUS_MODE=production --app brainbytes-prometheus-prod

REM Configure Grafana app
heroku config:set GF_SECURITY_ADMIN_PASSWORD=brainbytes --app brainbytes-grafana-prod
heroku config:set GF_USERS_ALLOW_SIGN_UP=false --app brainbytes-grafana-prod

echo.
echo 🔄 Restarting applications...
heroku restart --app brainbytes-prometheus-prod
heroku restart --app brainbytes-grafana-prod

echo.
echo ✅ Deployment complete!
echo.
echo 🔗 Your monitoring URLs:
echo   Prometheus: https://brainbytes-prometheus-prod.herokuapp.com
echo   Grafana:    https://brainbytes-grafana-prod.herokuapp.com
echo.
echo 📋 Grafana Login:
echo   Username: admin
echo   Password: brainbytes
echo.
echo 🎯 Next steps:
echo 1. Wait 2-3 minutes for apps to start
echo 2. Visit Grafana URL above
echo 3. Login with admin/brainbytes
echo 4. Check if Prometheus datasource is working
echo 5. View your production dashboards
echo.
pause