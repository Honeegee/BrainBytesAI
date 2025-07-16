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

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

echo Stopping any existing containers...
docker-compose down

echo.
echo Starting application...
echo - Application: http://localhost
echo - Grafana: http://localhost:3003 (admin/brainbytes123)
echo - Prometheus: http://localhost:9090
echo.

REM Start all services including Heroku monitoring (if HEROKU_API_TOKEN is configured)
echo Starting all services...
docker-compose up -d --build

if defined HEROKU_API_TOKEN (
    echo ✓ Heroku production monitoring enabled
) else (
    echo ⚠ Heroku monitoring disabled (set HEROKU_API_TOKEN in .env to enable)
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