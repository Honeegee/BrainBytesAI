@echo off
REM BrainBytes Incident Simulator - Quick Demo (Windows)
REM This script demonstrates the incident simulation system

echo 🚨 BrainBytes Incident Simulator - Quick Demo
echo ==============================================
echo.

REM Check if we're in the right directory
if not exist "incident-simulator.js" (
    echo ❌ Please run this script from the monitoring/scripts directory
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

echo 1️⃣ Checking system status...
node incident-simulator.js status
echo.

echo 2️⃣ Triggering a HIGH_ERROR_RATE incident...
echo    This will generate HTTP errors to test alert monitoring
start /b node incident-simulator.js trigger HIGH_ERROR_RATE
echo.

echo 3️⃣ Waiting 30 seconds for metrics to be collected...
timeout /t 30 /nobreak >nul
echo.

echo 4️⃣ Checking system status again (should show active incident)...
node incident-simulator.js status
echo.

echo 5️⃣ Resolving the incident...
node incident-simulator.js resolve HIGH_ERROR_RATE
echo.

echo 6️⃣ Final status check...
node incident-simulator.js status
echo.

echo ✅ Demo completed!
echo.
echo 🔗 Check your monitoring dashboards:
echo    • Prometheus Alerts: http://localhost:9090/alerts
echo    • Alertmanager: http://localhost:9093
echo    • Grafana: http://localhost:3003
echo    • cAdvisor: http://localhost:8081
echo.
echo 📚 For more options, run: node incident-simulator.js
pause