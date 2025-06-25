@echo off
REM BrainBytesAI Heroku Monitoring Setup Script for Windows
REM This script sets up comprehensive monitoring for Heroku-deployed BrainBytesAI

setlocal enabledelayedexpansion

REM Colors for output (Windows)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM Default environment
set "ENVIRONMENT=%1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=staging"

echo %BLUE%==================================================%NC%
echo %BLUE%  BrainBytesAI Heroku Monitoring Setup%NC%
echo %BLUE%==================================================%NC%
echo.

if not "%ENVIRONMENT%"=="staging" if not "%ENVIRONMENT%"=="production" (
    echo %RED%[ERROR]%NC% Invalid environment. Use 'staging' or 'production'
    exit /b 1
)

echo Setting up monitoring for: %ENVIRONMENT%
echo.

REM Check prerequisites
echo %GREEN%[STEP]%NC% Checking prerequisites...

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Heroku CLI is not installed. Please install it first:
    echo   https://devcenter.heroku.com/articles/heroku-cli
    exit /b 1
)

REM Check if user is logged in to Heroku
heroku auth:whoami >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Please log in to Heroku first:
    echo   heroku login
    exit /b 1
)

echo %GREEN%✅ Prerequisites check passed%NC%

REM Check Node.js
echo %GREEN%[STEP]%NC% Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% Node.js not found. Some monitoring scripts may not work.
) else (
    echo %GREEN%✅ Node.js found%NC%
)

REM Run the Node.js monitoring setup script
echo %GREEN%[STEP]%NC% Running monitoring setup...
if exist "monitoring\heroku\heroku-monitoring.js" (
    node monitoring\heroku\heroku-monitoring.js setup %ENVIRONMENT%
    if errorlevel 1 (
        echo %RED%[ERROR]%NC% Monitoring setup failed
        exit /b 1
    )
) else (
    echo %YELLOW%[WARNING]%NC% Node.js monitoring script not found
    echo Falling back to manual setup instructions...
    goto :manual_setup
)

echo.
echo %GREEN%==================================================%NC%
echo %GREEN%  Monitoring setup completed successfully!%NC%
echo %GREEN%==================================================%NC%
echo.
echo Next steps:
echo 1. Import the dashboard to Grafana Cloud
echo 2. Set up uptime monitoring with your preferred service
echo 3. Configure alert notification channels
echo 4. Test the monitoring setup with some traffic
echo.
echo Monitor your applications at:
echo   Grafana Cloud: https://grafana.com/
echo   Heroku Metrics: https://dashboard.heroku.com/
echo.
goto :end

:manual_setup
echo.
echo %BLUE%Manual Setup Instructions:%NC%
echo.
echo 1. Set up Grafana Cloud account at https://grafana.com/
echo 2. Get your Prometheus and Loki credentials
echo 3. Set environment variables on your Heroku apps:
echo.
if "%ENVIRONMENT%"=="staging" (
    echo    heroku config:set ENABLE_METRICS=true --app brainbytes-backend-staging-de872da2939f
    echo    heroku config:set ENABLE_METRICS=true --app brainbytes-ai-service-staging-4b75c77cf53a
    echo    heroku config:set ENVIRONMENT=staging --app brainbytes-frontend-staging-7593f4655363
    echo    heroku config:set ENVIRONMENT=staging --app brainbytes-backend-staging-de872da2939f
    echo    heroku config:set ENVIRONMENT=staging --app brainbytes-ai-service-staging-4b75c77cf53a
) else (
    echo    heroku config:set ENABLE_METRICS=true --app brainbytes-backend-production-d355616d0f1f
    echo    heroku config:set ENABLE_METRICS=true --app brainbytes-ai-production-3833f742ba79
    echo    heroku config:set ENVIRONMENT=production --app brainbytes-frontend-production-03d1e6b6b158
    echo    heroku config:set ENVIRONMENT=production --app brainbytes-backend-production-d355616d0f1f
    echo    heroku config:set ENVIRONMENT=production --app brainbytes-ai-production-3833f742ba79
)
echo.
echo 4. Add Grafana Cloud credentials to backend and AI services
echo 5. Import dashboard from: monitoring\heroku\dashboards\brainbytes-heroku-dashboard.json
echo 6. Configure alerts from: monitoring\heroku\alerts\heroku-alert-rules.yml
echo.
echo For detailed instructions, see: monitoring\heroku\README.md

:end
endlocal