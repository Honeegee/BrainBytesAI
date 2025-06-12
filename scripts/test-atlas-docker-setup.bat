@echo off
echo Starting Atlas-Only Docker Setup Test...
echo ==========================================

node scripts/test-atlas-docker-setup.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ All tests passed! Your Atlas-only Docker setup is working correctly!
    echo.
    echo Next steps:
    echo 1. Update environment variables with your actual Atlas credentials
    echo 2. Test your application: docker-compose up
    echo 3. Access your app: http://localhost:3001
) else (
    echo.
    echo ❌ Some tests failed. Please check the output above.
    echo.
    echo Common fixes:
    echo 1. Update .env files with correct Atlas connection strings
    echo 2. Ensure Docker is running
    echo 3. Check network connectivity to MongoDB Atlas
)

pause