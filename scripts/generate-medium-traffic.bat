@echo off
echo Starting Medium Traffic Generation...
echo Duration: 5 minutes
echo Requests per second: 10
echo Concurrency: 5
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

set BASE_URL=http://localhost
set DURATION=300
set RPS=10
set CONCURRENCY=5
set LOG_FILE=medium-traffic-log.json

node generate-traffic.js

echo.
echo Medium traffic generation completed!
echo Check medium-traffic-log.json for detailed results.
pause