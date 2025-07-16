@echo off
echo ⚠️  WARNING: Starting STRESS Traffic Generation...
echo This will generate high load on your application!
echo Duration: 5 minutes
echo Requests per second: 50
echo Concurrency: 20
echo.
echo Press Ctrl+C to stop at any time.
echo.
pause

cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

set BASE_URL=http://localhost
set DURATION=300
set RPS=50
set CONCURRENCY=20
set LOG_FILE=stress-traffic-log.json

node generate-traffic.js

echo.
echo Stress traffic generation completed!
echo Check stress-traffic-log.json for detailed results.
pause