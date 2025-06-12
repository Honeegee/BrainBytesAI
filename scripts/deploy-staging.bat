@echo off
echo 🚀 Starting staging deployment...

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services with staging configuration
echo 🔧 Building and starting staging services...
docker-compose -f docker-compose.staging.yml up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Run deployment verification
echo 🔍 Running deployment verification...
node scripts/verify-deployment.js

echo ✅ Staging deployment completed!
pause