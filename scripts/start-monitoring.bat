@echo off
echo Starting BrainBytes with Prometheus Monitoring...
echo.

echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running
    echo Please install Docker Desktop and ensure it's running
    pause
    exit /b 1
)

echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose is not available
    echo Please ensure Docker Desktop includes Docker Compose
    pause
    exit /b 1
)

echo.
echo Starting all services with monitoring...
docker-compose up -d

if %errorlevel% neq 0 (
    echo Error starting services
    pause
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Services started successfully!
echo.
echo Available endpoints:
echo - BrainBytes Frontend: http://localhost:3001
echo - BrainBytes Backend: http://localhost:3000
echo - AI Service: http://localhost:3002
echo - Prometheus UI: http://localhost:9090
echo - Alertmanager UI: http://localhost:9093
echo - Alert Dashboard: http://localhost:5001
echo - cAdvisor: http://localhost:8080
echo - Node Exporter: http://localhost:9100
echo.
echo Metrics endpoints:
echo - Backend Metrics: http://localhost:3000/metrics
echo - AI Service Metrics: http://localhost:3002/metrics
echo.
echo To generate test data and alerts:
echo   cd monitoring
echo   npm run simulate    (generate metrics)
echo   npm run webhook     (start alert receiver)
echo.

set /p choice="Open Prometheus UI in browser? (y/n): "
if /i "%choice%"=="y" (
    start http://localhost:9090
)

echo.
echo Press any key to exit...
pause >nul