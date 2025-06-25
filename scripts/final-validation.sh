#!/bin/bash

# Final Validation Script for Milestone 2 Submission
# This script performs comprehensive validation of the entire CI/CD and deployment setup

echo "🎓 MILESTONE 2 FINAL VALIDATION"
echo "================================"
echo "Platform: Heroku"
echo "Date: $(date)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# 1. GITHUB REPOSITORY VALIDATION
echo "📊 1. GITHUB REPOSITORY VALIDATION"
echo "-----------------------------------"

# Check if we're in a git repository
if [ -d ".git" ]; then
    print_status "PASS" "Git repository structure found"
else
    print_status "FAIL" "Not in a Git repository"
fi

# Check GitHub Actions workflows
if [ -d ".github/workflows" ]; then
    print_status "PASS" ".github/workflows directory exists"
    
    # Check for required workflow files
    if [ -f ".github/workflows/code-quality.yml" ]; then
        print_status "PASS" "Code Quality workflow file found"
    else
        print_status "FAIL" "Code Quality workflow file missing"
    fi
    
    if [ -f ".github/workflows/ci-cd.yml" ]; then
        print_status "PASS" "CI/CD Pipeline workflow file found"
    else
        print_status "FAIL" "CI/CD Pipeline workflow file missing"
    fi
    
    if [ -f ".github/workflows/deploy-heroku.yml" ]; then
        print_status "PASS" "Heroku Deployment workflow file found"
    else
        print_status "FAIL" "Heroku Deployment workflow file missing"
    fi
else
    print_status "FAIL" ".github/workflows directory missing"
fi

# Check main project structure
directories=("frontend" "backend" "ai-service" "docs" "e2e-tests" "scripts")
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        print_status "PASS" "$dir directory exists"
    else
        print_status "FAIL" "$dir directory missing"
    fi
done

echo ""

# 2. CI/CD IMPLEMENTATION VALIDATION
echo "🔄 2. CI/CD IMPLEMENTATION VALIDATION"
echo "------------------------------------"

# Check Docker files
docker_files=("frontend/Dockerfile" "backend/Dockerfile" "ai-service/Dockerfile")
for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "$file exists"
    else
        print_status "FAIL" "$file missing"
    fi
done

# Check docker-compose files (only development)
compose_files=("docker-compose.yml")
for file in "${compose_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "$file exists"
    else
        print_status "WARN" "$file missing (may be optional)"
    fi
done

# Check package.json files for test scripts
services=("frontend" "backend" "ai-service")
for service in "${services[@]}"; do
    if [ -f "$service/package.json" ]; then
        if grep -q '"test"' "$service/package.json"; then
            print_status "PASS" "$service has test scripts"
        else
            print_status "WARN" "$service missing test scripts"
        fi
    else
        print_status "FAIL" "$service/package.json missing"
    fi
done

echo ""

# 3. CLOUD DEPLOYMENT VALIDATION
echo "☁️  3. CLOUD DEPLOYMENT VALIDATION"
echo "---------------------------------"

# Test Heroku production services
production_services=(
    "https://brainbytes-frontend-production.herokuapp.com"
    "https://brainbytes-backend-production.herokuapp.com"
    "https://brainbytes-ai-production.herokuapp.com"
)

for service in "${production_services[@]}"; do
    service_name=$(echo "$service" | sed 's/https:\/\/\([^.]*\).*/\1/')
    
    if curl -f -s --max-time 10 "$service" > /dev/null 2>&1; then
        print_status "PASS" "$service_name is responding"
    elif curl -f -s --max-time 10 "$service/health" > /dev/null 2>&1; then
        print_status "PASS" "$service_name health endpoint responding"
    else
        print_status "FAIL" "$service_name not responding"
    fi
done

# Test staging services
staging_services=(
    "https://brainbytes-frontend-staging.herokuapp.com"
    "https://brainbytes-backend-staging.herokuapp.com"
    "https://brainbytes-ai-service-staging.herokuapp.com"
)

for service in "${staging_services[@]}"; do
    service_name=$(echo "$service" | sed 's/https:\/\/\([^.]*\).*/\1/')
    
    if curl -f -s --max-time 10 "$service" > /dev/null 2>&1; then
        print_status "PASS" "$service_name staging is responding"
    elif curl -f -s --max-time 10 "$service/health" > /dev/null 2>&1; then
        print_status "PASS" "$service_name staging health endpoint responding"
    else
        print_status "WARN" "$service_name staging not responding (may be sleeping)"
    fi
done

echo ""

# 4. DOCUMENTATION VALIDATION
echo "📚 4. DOCUMENTATION VALIDATION"
echo "------------------------------"

# Check required documentation files
doc_files=(
    "docs/README.md"
    "docs/DOCUMENTATION_INDEX.md"
    "docs/deployment/CI_CD_DOCUMENTATION.md"
    "docs/deployment/HEROKU_SETUP.md"
    "docs/deployment/COMPREHENSIVE_DEPLOYMENT_PLAN.md"
    "docs/deployment/ARCHITECTURE_DIAGRAM.md"
    "docs/deployment/OPERATIONAL_RUNBOOK.md"
    "docs/deployment/HOMEWORK_COMPLETION_SUMMARY.md"
    "docs/MILESTONE_2_FINAL_SUBMISSION.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        # Check if file has content (more than 100 lines for major docs)
        line_count=$(wc -l < "$file")
        if [ "$line_count" -gt 50 ]; then
            print_status "PASS" "$file exists and has substantial content ($line_count lines)"
        else
            print_status "WARN" "$file exists but may need more content ($line_count lines)"
        fi
    else
        print_status "FAIL" "$file missing"
    fi
done

echo ""

# 5. SECURITY VALIDATION
echo "🔒 5. SECURITY VALIDATION"
echo "------------------------"

# Check for common security files
security_files=(".env.example" "backend/.env.example" "frontend/.env.local.example")
for file in "${security_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "$file template exists"
    else
        print_status "WARN" "$file template missing"
    fi
done

# Check for actual .env files (should not be committed)
env_files=(".env" "backend/.env" "frontend/.env.local")
for file in "${env_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "WARN" "$file exists (should not be committed to git)"
    else
        print_status "PASS" "$file not found in repository (good for security)"
    fi
done

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" ".gitignore"; then
        print_status "PASS" ".gitignore includes .env files"
    else
        print_status "WARN" ".gitignore should include .env files"
    fi
    
    if grep -q "node_modules" ".gitignore"; then
        print_status "PASS" ".gitignore includes node_modules"
    else
        print_status "WARN" ".gitignore should include node_modules"
    fi
else
    print_status "FAIL" ".gitignore file missing"
fi

echo ""

# 6. FINAL SUMMARY
echo "📋 6. VALIDATION SUMMARY"
echo "-----------------------"

echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

# Calculate success rate
if [ "$TOTAL_CHECKS" -gt 0 ]; then
    success_rate=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo "Success Rate: $success_rate%"
    
    if [ "$success_rate" -ge 90 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! Ready for submission${NC}"
    elif [ "$success_rate" -ge 80 ]; then
        echo -e "${YELLOW}✅ GOOD! Minor issues to address${NC}"
    elif [ "$success_rate" -ge 70 ]; then
        echo -e "${YELLOW}⚠️  ACCEPTABLE! Some issues need attention${NC}"
    else
        echo -e "${RED}❌ NEEDS WORK! Major issues to resolve${NC}"
    fi
else
    echo -e "${RED}❌ No checks performed${NC}"
fi

echo ""
echo "🔗 QUICK ACCESS LINKS"
echo "--------------------"
echo "📊 GitHub Repository: https://github.com/Honeegee/BrainBytesAI"
echo "🚀 GitHub Actions: https://github.com/Honeegee/BrainBytesAI/actions"
echo "🖥️ Production Frontend: https://brainbytes-frontend-production.herokuapp.com"
echo "🔧 Production Backend: https://brainbytes-backend-production.herokuapp.com"
echo "🤖 Production AI Service: https://brainbytes-ai-production.herokuapp.com"
echo ""
echo "📋 Key Documentation:"
echo "  - Documentation Index: docs/DOCUMENTATION_INDEX.md"
echo "  - Final Submission: docs/MILESTONE_2_FINAL_SUBMISSION.md"
echo "  - Architecture Diagrams: docs/deployment/ARCHITECTURE_DIAGRAM.md"
echo "  - CI/CD Documentation: docs/deployment/CI_CD_DOCUMENTATION.md"
echo ""
echo "Validation completed at: $(date)"
echo "================================"