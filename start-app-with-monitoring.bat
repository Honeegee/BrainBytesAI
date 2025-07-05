@echo off
echo Starting BrainBytes AI Application...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Stopping any existing containers...
docker-compose down

echo.
echo Starting application...
echo - Application: http://localhost
echo - Grafana: http://localhost:3003 (admin/brainbytes123)
echo - Prometheus: http://localhost:9090
echo.

REM Check if HEROKU_API_TOKEN is set for Heroku monitoring
if defined HEROKU_API_TOKEN (
    echo HEROKU_API_TOKEN found. Starting with Heroku monitoring...
    docker-compose --profile heroku up -d --build
) else (
    echo Starting without Heroku monitoring...
    docker-compose up -d --build
    echo.
    echo To enable Heroku monitoring:
    echo 1. Set HEROKU_API_TOKEN in .env file
    echo 2. Restart: docker-compose --profile heroku up -d
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Application started successfully!
echo.
echo Access URLs:
echo - Main Application: http://localhost
echo - Grafana Dashboard: http://localhost:3003
echo - Prometheus: http://localhost:9090
echo.
echo Grafana login: admin / brainbytes123
echo.
pause