@echo off
echo Starting Light Traffic Generation...
echo Duration: 1 minute
echo Requests per second: 2
echo Concurrency: 2
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

set BASE_URL=http://localhost
set DURATION=60
set RPS=2
set CONCURRENCY=2
set LOG_FILE=light-traffic-log.json

node generate-traffic.js

echo.
echo Light traffic generation completed!
echo Check light-traffic-log.json for detailed results.
pause