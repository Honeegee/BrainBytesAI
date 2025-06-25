@echo off
setlocal enabledelayedexpansion

REM BrainBytes Staging Deployment Script for Windows
REM This script deploys the application to staging environment with full monitoring

set ENVIRONMENT=staging
set COMPOSE_FILE=docker-compose.staging.yml
set BACKUP_DIR=.\backups\%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo.
echo 🚀 Starting BrainBytes Staging Deployment...
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker is not installed
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker Compose is not installed
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create backup directory
echo.
echo 💾 Creating backup directory...
mkdir "%BACKUP_DIR%" 2>nul
echo ✅ Backup directory created: %BACKUP_DIR%

REM Backup current volumes (if they exist)
echo.
echo 💾 Backing up existing data...

docker volume ls | findstr prometheus_staging_data >nul 2>nul
if %ERRORLEVEL% equ 0 (
    docker run --rm -v prometheus_staging_data:/source -v "%cd%\%BACKUP_DIR%":/backup alpine tar czf /backup/prometheus_data.tar.gz -C /source .
    echo ✅ Prometheus data backed up
)

docker volume ls | findstr alertmanager_staging_data >nul 2>nul
if %ERRORLEVEL% equ 0 (
    docker run --rm -v alertmanager_staging_data:/source -v "%cd%\%BACKUP_DIR%":/backup alpine tar czf /backup/alertmanager_data.tar.gz -C /source .
    echo ✅ Alertmanager data backed up
)

REM Stop existing services
echo.
echo 🛑 Stopping existing services...
docker-compose -f "%COMPOSE_FILE%" down --remove-orphans 2>nul
echo ✅ Services stopped

REM Clean up old images
echo.
echo 🧹 Cleaning up old images...
docker image prune -f >nul 2>nul
echo ✅ Image cleanup completed

REM Pull latest base images
echo.
echo 📥 Pulling latest base images...
docker-compose -f "%COMPOSE_FILE%" pull 2>nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Some images could not be pulled (may be custom builds)
) else (
    echo ✅ Base images pulled
)

REM Build application images
echo.
echo 🔨 Building application images...
docker-compose -f "%COMPOSE_FILE%" build --no-cache --parallel
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to build images
    exit /b 1
)
echo ✅ Images built successfully

REM Start services
echo.
echo 🚀 Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to start services
    exit /b 1
)

REM Wait for services to be healthy
echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo.
echo 🏥 Checking service health...

set ALL_HEALTHY=true

REM Check if containers are running
for %%s in (brainbytes-backend-staging brainbytes-frontend-staging brainbytes-ai-service-staging prometheus-staging alertmanager-staging redis-staging) do (
    docker ps --filter "name=%%s" --filter "status=running" --format "{{.Names}}" | findstr "%%s" >nul
    if !ERRORLEVEL! equ 0 (
        echo ✅ %%s is running
    ) else (
        echo ❌ %%s is not running
        set ALL_HEALTHY=false
    )
)

REM Test endpoints
echo.
echo 🧪 Testing endpoints...

REM Test backend health
curl -f -s http://localhost/health >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend health check passed
) else (
    echo ❌ Backend health check failed
    set ALL_HEALTHY=false
)

REM Test Prometheus
curl -f -s http://localhost:8080/prometheus/api/v1/status/config >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Prometheus is accessible
) else (
    echo ❌ Prometheus is not accessible
    set ALL_HEALTHY=false
)

REM Test metrics endpoints
curl -f -s http://localhost/metrics >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend metrics endpoint is working
) else (
    echo ❌ Backend metrics endpoint failed
    set ALL_HEALTHY=false
)

REM Display service URLs
echo.
echo 🌐 Service URLs:
echo Main Application: http://localhost/
echo Backend API: http://localhost/api/
echo Health Check: http://localhost/health
echo Metrics: http://localhost/metrics
echo.
echo Monitoring Dashboard: http://localhost:8080/
echo Prometheus: http://localhost:8080/prometheus/
echo Alertmanager: http://localhost:8080/alertmanager/
echo cAdvisor: http://localhost:8080/cadvisor/
echo.

REM Display deployment summary
if "%ALL_HEALTHY%"=="true" (
    echo ✅ Deployment completed successfully!
    echo 🎉 BrainBytes staging environment is ready
    echo.
    echo 🚦 To run traffic simulation: cd monitoring ^&^& node simulate-activity.js
) else (
    echo ❌ Deployment completed with issues
    echo ⚠️  Please check the logs: docker-compose -f %COMPOSE_FILE% logs
)

REM Show running containers
echo.
echo 📊 Running containers:
docker-compose -f "%COMPOSE_FILE%" ps

echo.
echo 🔍 To view logs: docker-compose -f %COMPOSE_FILE% logs -f [service_name]
echo 🛑 To stop: docker-compose -f %COMPOSE_FILE% down

pause