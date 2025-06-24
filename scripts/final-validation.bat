@echo off
setlocal enabledelayedexpansion

REM Final Validation Script for Milestone 2 Submission (Windows)
REM This script performs comprehensive validation of the entire CI/CD and deployment setup

echo 🎓 MILESTONE 2 FINAL VALIDATION
echo ================================
echo Platform: Heroku
echo Date: %date% %time%
echo.

REM Validation counters
set TOTAL_CHECKS=0
set PASSED_CHECKS=0
set FAILED_CHECKS=0

REM Function to print status (simulated with labels)
goto main

:print_pass
set /a TOTAL_CHECKS+=1
set /a PASSED_CHECKS+=1
echo ✅ PASS: %~1
goto :eof

:print_fail
set /a TOTAL_CHECKS+=1
set /a FAILED_CHECKS+=1
echo ❌ FAIL: %~1
goto :eof

:print_warn
set /a TOTAL_CHECKS+=1
echo ⚠️  WARN: %~1
goto :eof

:print_info
echo ℹ️  INFO: %~1
goto :eof

:main

REM 1. GITHUB REPOSITORY VALIDATION
echo 📊 1. GITHUB REPOSITORY VALIDATION
echo -----------------------------------

REM Check if we're in a git repository
if exist ".git" (
    call :print_pass "Git repository structure found"
) else (
    call :print_fail "Not in a Git repository"
)

REM Check GitHub Actions workflows
if exist ".github\workflows" (
    call :print_pass ".github/workflows directory exists"
    
    REM Check for required workflow files
    if exist ".github\workflows\code-quality.yml" (
        call :print_pass "Code Quality workflow file found"
    ) else (
        call :print_fail "Code Quality workflow file missing"
    )
    
    if exist ".github\workflows\ci-cd.yml" (
        call :print_pass "CI/CD Pipeline workflow file found"
    ) else (
        call :print_fail "CI/CD Pipeline workflow file missing"
    )
    
    if exist ".github\workflows\deploy-heroku.yml" (
        call :print_pass "Heroku Deployment workflow file found"
    ) else (
        call :print_fail "Heroku Deployment workflow file missing"
    )
) else (
    call :print_fail ".github/workflows directory missing"
)

REM Check main project structure
set directories=frontend backend ai-service docs e2e-tests scripts
for %%d in (%directories%) do (
    if exist "%%d" (
        call :print_pass "%%d directory exists"
    ) else (
        call :print_fail "%%d directory missing"
    )
)

echo.

REM 2. CI/CD IMPLEMENTATION VALIDATION
echo 🔄 2. CI/CD IMPLEMENTATION VALIDATION
echo ------------------------------------

REM Check Docker files
set docker_files=frontend\Dockerfile backend\Dockerfile ai-service\Dockerfile
for %%f in (%docker_files%) do (
    if exist "%%f" (
        call :print_pass "%%f exists"
    ) else (
        call :print_fail "%%f missing"
    )
)

REM Check docker-compose files
set compose_files=docker-compose.yml docker-compose.staging.yml docker-compose.production.yml
for %%f in (%compose_files%) do (
    if exist "%%f" (
        call :print_pass "%%f exists"
    ) else (
        call :print_warn "%%f missing (may be optional)"
    )
)

REM Check package.json files for test scripts
set services=frontend backend ai-service
for %%s in (%services%) do (
    if exist "%%s\package.json" (
        findstr /C:"\"test\"" "%%s\package.json" >nul
        if !errorlevel! equ 0 (
            call :print_pass "%%s has test scripts"
        ) else (
            call :print_warn "%%s missing test scripts"
        )
    ) else (
        call :print_fail "%%s/package.json missing"
    )
)

echo.

REM 3. CLOUD DEPLOYMENT VALIDATION
echo ☁️  3. CLOUD DEPLOYMENT VALIDATION
echo ---------------------------------

REM Test Heroku production services (simplified check)
echo Testing production services...
curl -f -s --max-time 10 "https://brainbytes-frontend-production.herokuapp.com" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-frontend-production is responding"
) else (
    call :print_fail "brainbytes-frontend-production not responding"
)

curl -f -s --max-time 10 "https://brainbytes-backend-production.herokuapp.com/health" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-backend-production health endpoint responding"
) else (
    call :print_fail "brainbytes-backend-production not responding"
)

curl -f -s --max-time 10 "https://brainbytes-ai-production.herokuapp.com/health" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-ai-production health endpoint responding"
) else (
    call :print_fail "brainbytes-ai-production not responding"
)

REM Test staging services
echo Testing staging services...
curl -f -s --max-time 10 "https://brainbytes-frontend-staging.herokuapp.com" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-frontend-staging is responding"
) else (
    call :print_warn "brainbytes-frontend-staging not responding (may be sleeping)"
)

curl -f -s --max-time 10 "https://brainbytes-backend-staging.herokuapp.com/health" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-backend-staging health endpoint responding"
) else (
    call :print_warn "brainbytes-backend-staging not responding (may be sleeping)"
)

curl -f -s --max-time 10 "https://brainbytes-ai-service-staging.herokuapp.com/health" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_pass "brainbytes-ai-service-staging health endpoint responding"
) else (
    call :print_warn "brainbytes-ai-service-staging not responding (may be sleeping)"
)

echo.

REM 4. DOCUMENTATION VALIDATION
echo 📚 4. DOCUMENTATION VALIDATION
echo ------------------------------

REM Check required documentation files
set doc_files=docs\README.md docs\DOCUMENTATION_INDEX.md docs\deployment\CI_CD_DOCUMENTATION.md docs\deployment\HEROKU_SETUP.md docs\deployment\COMPREHENSIVE_DEPLOYMENT_PLAN.md docs\deployment\ARCHITECTURE_DIAGRAM.md docs\deployment\OPERATIONAL_RUNBOOK.md docs\deployment\HOMEWORK_COMPLETION_SUMMARY.md docs\MILESTONE_2_FINAL_SUBMISSION.md

for %%f in (%doc_files%) do (
    if exist "%%f" (
        REM Check if file has content (basic check for file size)
        for %%A in ("%%f") do set size=%%~zA
        if !size! gtr 1000 (
            call :print_pass "%%f exists and has substantial content"
        ) else (
            call :print_warn "%%f exists but may need more content"
        )
    ) else (
        call :print_fail "%%f missing"
    )
)

echo.

REM 5. SECURITY VALIDATION
echo 🔒 5. SECURITY VALIDATION
echo ------------------------

REM Check for common security files
set security_files=.env.example backend\.env.example frontend\.env.local.example
for %%f in (%security_files%) do (
    if exist "%%f" (
        call :print_pass "%%f template exists"
    ) else (
        call :print_warn "%%f template missing"
    )
)

REM Check for actual .env files (should not be committed)
set env_files=.env backend\.env frontend\.env.local
for %%f in (%env_files%) do (
    if exist "%%f" (
        call :print_warn "%%f exists (should not be committed to git)"
    ) else (
        call :print_pass "%%f not found in repository (good for security)"
    )
)

REM Check .gitignore
if exist ".gitignore" (
    findstr /C:".env" ".gitignore" >nul
    if !errorlevel! equ 0 (
        call :print_pass ".gitignore includes .env files"
    ) else (
        call :print_warn ".gitignore should include .env files"
    )
    
    findstr /C:"node_modules" ".gitignore" >nul
    if !errorlevel! equ 0 (
        call :print_pass ".gitignore includes node_modules"
    ) else (
        call :print_warn ".gitignore should include node_modules"
    )
) else (
    call :print_fail ".gitignore file missing"
)

echo.

REM 6. FINAL SUMMARY
echo 📋 6. VALIDATION SUMMARY
echo -----------------------

echo Total Checks: !TOTAL_CHECKS!
echo Passed: !PASSED_CHECKS!
echo Failed: !FAILED_CHECKS!

REM Calculate success rate
if !TOTAL_CHECKS! gtr 0 (
    set /a success_rate=(PASSED_CHECKS * 100) / TOTAL_CHECKS
    echo Success Rate: !success_rate!%%
    
    if !success_rate! geq 90 (
        echo 🎉 EXCELLENT! Ready for submission
    ) else if !success_rate! geq 80 (
        echo ✅ GOOD! Minor issues to address
    ) else if !success_rate! geq 70 (
        echo ⚠️  ACCEPTABLE! Some issues need attention
    ) else (
        echo ❌ NEEDS WORK! Major issues to resolve
    )
) else (
    echo ❌ No checks performed
)

echo.
echo 🔗 QUICK ACCESS LINKS
echo --------------------
echo 📊 GitHub Repository: https://github.com/Honeegee/BrainBytesAI
echo 🚀 GitHub Actions: https://github.com/Honeegee/BrainBytesAI/actions
echo 🖥️ Production Frontend: https://brainbytes-frontend-production.herokuapp.com
echo 🔧 Production Backend: https://brainbytes-backend-production.herokuapp.com
echo 🤖 Production AI Service: https://brainbytes-ai-production.herokuapp.com
echo.
echo 📋 Key Documentation:
echo   - Documentation Index: docs/DOCUMENTATION_INDEX.md
echo   - Final Submission: docs/MILESTONE_2_FINAL_SUBMISSION.md
echo   - Architecture Diagrams: docs/deployment/ARCHITECTURE_DIAGRAM.md
echo   - CI/CD Documentation: docs/deployment/CI_CD_DOCUMENTATION.md
echo.
echo Validation completed at: %date% %time%
echo ================================

pause