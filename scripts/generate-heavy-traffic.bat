@echo off
echo Starting Heavy Traffic Generation...
echo Duration: 10 minutes
echo Requests per second: 20
echo Concurrency: 10
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

set BASE_URL=http://localhost
set DURATION=600
set RPS=20
set CONCURRENCY=10
set LOG_FILE=heavy-traffic-log.json

node generate-traffic.js

echo.
echo Heavy traffic generation completed!
echo Check heavy-traffic-log.json for detailed results.
pause