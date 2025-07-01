@echo off
echo 🚀 Setting up Heroku monitoring via CLI...
echo.

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Heroku CLI not found. Please install it first.
    echo 📥 Download: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

REM Set environment (staging or production)
set /p ENVIRONMENT="Enter environment (staging/production): "

REM Set app names based on environment
if "%ENVIRONMENT%"=="staging" (
    set FRONTEND_APP=brainbytes-frontend-staging-7593f4655363
    set BACKEND_APP=brainbytes-backend-staging-de872da2939f
    set AI_APP=brainbytes-ai-service-staging-4b75c77cf53a
) else if "%ENVIRONMENT%"=="production" (
    set FRONTEND_APP=brainbytes-frontend-production-03d1e6b6b158
    set BACKEND_APP=brainbytes-backend-production-d355616d0f1f
    set AI_APP=brainbytes-ai-production-3833f742ba79
) else (
    echo ❌ Invalid environment. Use 'staging' or 'production'
    pause
    exit /b 1
)

echo.
echo 📋 Setting up monitoring for %ENVIRONMENT% environment...
echo   Frontend: %FRONTEND_APP%
echo   Backend:  %BACKEND_APP%
echo   AI:       %AI_APP%
echo.

REM Step 1: Enable metrics on all apps
echo 🔧 Step 1: Enabling metrics collection...
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=%ENVIRONMENT% --app %BACKEND_APP%
heroku config:set ENABLE_METRICS=true MONITORING_ENABLED=true ENVIRONMENT=%ENVIRONMENT% --app %AI_APP%
heroku config:set MONITORING_ENABLED=true ENVIRONMENT=%ENVIRONMENT% --app %FRONTEND_APP%

REM Step 2: Test health endpoints
echo.
echo 🔍 Step 2: Testing health endpoints...
echo Testing backend health...
curl -s https://%BACKEND_APP%.herokuapp.com/health
echo.
echo Testing AI service health...
curl -s https://%AI_APP%.herokuapp.com/health
echo.
echo Testing frontend...
curl -s https://%FRONTEND_APP%.herokuapp.com/ | findstr "BrainBytes" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend is responding
) else (
    echo ⚠️ Frontend may have issues
)

REM Step 3: Test metrics endpoints
echo.
echo 📊 Step 3: Testing metrics endpoints...
echo Testing backend metrics...
curl -s https://%BACKEND_APP%.herokuapp.com/metrics | findstr "brainbytes" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend metrics available
) else (
    echo ⚠️ Backend metrics not available yet (may need restart)
)

echo Testing AI service metrics...
curl -s https://%AI_APP%.herokuapp.com/metrics | findstr "brainbytes" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ AI service metrics available
) else (
    echo ⚠️ AI service metrics not available yet (may need restart)
)

REM Step 4: Check app status
echo.
echo 📈 Step 4: Checking app status...
echo Backend status:
heroku ps --app %BACKEND_APP%
echo.
echo AI service status:
heroku ps --app %AI_APP%
echo.
echo Frontend status:
heroku ps --app %FRONTEND_APP%

REM Step 5: Optional - Restart apps to ensure metrics are enabled
echo.
set /p RESTART="Restart apps to ensure metrics are active? (y/N): "
if /i "%RESTART%"=="y" (
    echo 🔄 Restarting applications...
    heroku restart --app %BACKEND_APP%
    heroku restart --app %AI_APP%
    heroku restart --app %FRONTEND_APP%
    echo ✅ Apps restarted
    
    echo.
    echo ⏳ Waiting 30 seconds for apps to start up...
    timeout /t 30 /nobreak >nul
    
    echo.
    echo 🔍 Re-testing metrics after restart...
    curl -s https://%BACKEND_APP%.herokuapp.com/metrics | findstr "brainbytes" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Backend metrics now available
    ) else (
        echo ⚠️ Backend metrics still not available
    )
)

echo.
echo ✅ Heroku monitoring setup complete!
echo.
echo 📋 Next steps:
echo 1. Set up Grafana Cloud account (free tier available)
echo 2. Configure remote write endpoints for metrics
echo 3. Import the BrainBytesAI dashboard
echo 4. Set up alerting rules
echo.
echo 🔗 Useful links:
echo   Backend Health:  https://%BACKEND_APP%.herokuapp.com/health
echo   Backend Metrics: https://%BACKEND_APP%.herokuapp.com/metrics
echo   AI Health:       https://%AI_APP%.herokuapp.com/health
echo   AI Metrics:      https://%AI_APP%.herokuapp.com/metrics
echo   Frontend:        https://%FRONTEND_APP%.herokuapp.com/
echo.
pause