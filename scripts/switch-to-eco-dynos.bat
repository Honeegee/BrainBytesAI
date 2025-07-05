@echo off
REM ==================================================
REM Switch All Production Apps to Eco Dynos
REM ==================================================
REM This script changes all BrainBytes production apps to use eco dynos
REM Eco dynos are cost-effective and suitable for low-traffic applications
REM 
REM Prerequisites:
REM 1. Heroku CLI installed and logged in
REM 2. Access to the production apps
REM 
REM Usage: switch-to-eco-dynos.bat
REM ==================================================

echo ========================================
echo BrainBytes Production - Switch to Eco Dynos
echo ========================================
echo.

REM Check if Heroku CLI is installed
heroku --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Heroku CLI not found. Please install it first.
    echo Download from: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

REM Check if user is logged in to Heroku
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not logged in to Heroku. Please run 'heroku login' first.
    pause
    exit /b 1
)

echo Current dyno types and status:
echo.

REM Show current dyno status for all production apps
echo [1/3] Backend Production App:
heroku ps --app brainbytes-backend-production-d355616d0f1f
echo.

echo [2/3] AI Service Production App:
heroku ps --app brainbytes-ai-production-3833f742ba79
echo.

echo [3/3] Frontend Production App:
heroku ps --app brainbytes-frontend-production-03d1e6b6b158
echo.

echo ========================================
echo SWITCHING TO ECO DYNOS
echo ========================================
echo.
echo This will change all production apps to use eco dynos.
echo Eco dynos cost $5/month each and are suitable for low-traffic apps.
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Switching dynos to eco type...
echo.

REM Switch Backend to eco dyno
echo [1/3] Switching Backend to eco dyno...
heroku ps:type eco --app brainbytes-backend-production-d355616d0f1f
if %errorlevel% neq 0 (
    echo ERROR: Failed to switch backend to eco dyno
    pause
    exit /b 1
)
echo ✓ Backend switched to eco dyno
echo.

REM Switch AI Service to eco dyno
echo [2/3] Switching AI Service to eco dyno...
heroku ps:type eco --app brainbytes-ai-production-3833f742ba79
if %errorlevel% neq 0 (
    echo ERROR: Failed to switch AI service to eco dyno
    pause
    exit /b 1
)
echo ✓ AI Service switched to eco dyno
echo.

REM Switch Frontend to eco dyno
echo [3/3] Switching Frontend to eco dyno...
heroku ps:type eco --app brainbytes-frontend-production-03d1e6b6b158
if %errorlevel% neq 0 (
    echo ERROR: Failed to switch frontend to eco dyno
    pause
    exit /b 1
)
echo ✓ Frontend switched to eco dyno
echo.

echo ========================================
echo SCALING TO 1 DYNO EACH (RECOMMENDED)
echo ========================================
echo.
echo Ensuring each app has exactly 1 web dyno running...
echo.

REM Scale each app to exactly 1 dyno
echo [1/3] Scaling Backend to 1 dyno...
heroku ps:scale web=1 --app brainbytes-backend-production-d355616d0f1f
echo.

echo [2/3] Scaling AI Service to 1 dyno...
heroku ps:scale web=1 --app brainbytes-ai-production-3833f742ba79
echo.

echo [3/3] Scaling Frontend to 1 dyno...
heroku ps:scale web=1 --app brainbytes-frontend-production-03d1e6b6b158
echo.

echo ========================================
echo VERIFICATION
echo ========================================
echo.
echo Final dyno status:
echo.

echo [1/3] Backend Production App:
heroku ps --app brainbytes-backend-production-d355616d0f1f
echo.

echo [2/3] AI Service Production App:
heroku ps --app brainbytes-ai-production-3833f742ba79
echo.

echo [3/3] Frontend Production App:
heroku ps --app brainbytes-frontend-production-03d1e6b6b158
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo All production apps have been switched to eco dynos:
echo ✓ brainbytes-backend-production-d355616d0f1f
echo ✓ brainbytes-ai-production-3833f742ba79  
echo ✓ brainbytes-frontend-production-03d1e6b6b158
echo.
echo Cost Impact:
echo - Eco dynos cost $5/month each
echo - Total monthly cost: $15/month (3 apps × $5)
echo - Eco dynos never sleep (unlike free dynos)
echo.
echo Next Steps:
echo 1. Monitor app performance after the change
echo 2. Test all critical functionality
echo 3. Consider upgrading individual apps if needed
echo.
echo Apps should restart automatically after dyno type change.
echo.
pause
