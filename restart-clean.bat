@echo off
echo Cleaning up and restarting BrainBytes AI Application...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Stopping all containers...
docker-compose down

echo.
echo Removing Grafana volume to clear database conflicts...
docker volume rm brainbytesai_grafana_data 2>nul
echo Grafana volume removed (if it existed)

echo.
echo Starting fresh application...
REM Check if HEROKU_API_TOKEN is set for Heroku monitoring
if defined HEROKU_API_TOKEN (
    echo HEROKU_API_TOKEN found. Starting with Heroku monitoring...
    docker-compose --profile heroku up -d --build
) else (
    echo Starting without Heroku monitoring...
    docker-compose up -d --build
)

echo.
echo Waiting for services to start...
timeout /t 15 /nobreak >nul

echo.
echo Application restarted with clean Grafana database!
echo.
echo Access URLs:
echo - Main Application: http://localhost
echo - Grafana Dashboard: http://localhost:3003
echo - Prometheus: http://localhost:9090
echo.
echo Grafana login: admin / brainbytes123
echo.
pause