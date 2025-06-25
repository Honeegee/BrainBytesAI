#!/bin/bash

# BrainBytes Staging Deployment Script
# This script deploys the application to staging environment with full monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="staging"
COMPOSE_FILE="docker-compose.staging.yml"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🚀 Starting BrainBytes Staging Deployment...${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Create backup directory
echo -e "${BLUE}💾 Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
print_status "Backup directory created: $BACKUP_DIR"

# Backup current volumes (if they exist)
echo -e "${BLUE}💾 Backing up existing data...${NC}"
if docker volume ls | grep -q "prometheus_staging_data"; then
    docker run --rm -v prometheus_staging_data:/source -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/prometheus_data.tar.gz -C /source .
    print_status "Prometheus data backed up"
fi

if docker volume ls | grep -q "alertmanager_staging_data"; then
    docker run --rm -v alertmanager_staging_data:/source -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/alertmanager_data.tar.gz -C /source .
    print_status "Alertmanager data backed up"
fi

# Stop existing services
echo -e "${BLUE}🛑 Stopping existing services...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
print_status "Services stopped"

# Clean up old images (optional)
echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
docker image prune -f || true
print_status "Image cleanup completed"

# Pull latest base images
echo -e "${BLUE}📥 Pulling latest base images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull || print_warning "Some images could not be pulled (may be custom builds)"

# Build application images
echo -e "${BLUE}🔨 Building application images...${NC}"
docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
print_status "Images built successfully"

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${BLUE}🏥 Checking service health...${NC}"

services=("backend" "frontend" "ai-service" "prometheus" "alertmanager" "redis")
all_healthy=true

for service in "${services[@]}"; do
    container_name="${service}-staging"
    if [ "$service" = "backend" ]; then
        container_name="brainbytes-backend-staging"
    elif [ "$service" = "frontend" ]; then
        container_name="brainbytes-frontend-staging"
    elif [ "$service" = "ai-service" ]; then
        container_name="brainbytes-ai-service-staging"
    fi
    
    if docker ps --filter "name=$container_name" --filter "status=running" --format "{{.Names}}" | grep -q "$container_name"; then
        print_status "$service is running"
    else
        print_error "$service is not running"
        all_healthy=false
    fi
done

# Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"

# Test backend health
if curl -f -s http://localhost/health > /dev/null; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
    all_healthy=false
fi

# Test Prometheus
if curl -f -s http://localhost:8080/prometheus/api/v1/status/config > /dev/null; then
    print_status "Prometheus is accessible"
else
    print_error "Prometheus is not accessible"
    all_healthy=false
fi

# Test metrics endpoints
if curl -f -s http://localhost/metrics > /dev/null; then
    print_status "Backend metrics endpoint is working"
else
    print_error "Backend metrics endpoint failed"
    all_healthy=false
fi

# Run basic smoke tests
echo -e "${BLUE}💨 Running smoke tests...${NC}"

# Test if we can register a user (basic API test)
test_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","name":"Test User"}')

if [ "$test_response" = "201" ] || [ "$test_response" = "409" ]; then
    print_status "API registration test passed (HTTP $test_response)"
else
    print_warning "API registration test returned HTTP $test_response"
fi

# Display service URLs
echo -e "${BLUE}🌐 Service URLs:${NC}"
echo "Main Application: http://localhost/"
echo "Backend API: http://localhost/api/"
echo "Health Check: http://localhost/health"
echo "Metrics: http://localhost/metrics"
echo ""
echo "Monitoring Dashboard: http://localhost:8080/"
echo "Prometheus: http://localhost:8080/prometheus/"
echo "Alertmanager: http://localhost:8080/alertmanager/"
echo "cAdvisor: http://localhost:8080/cadvisor/"
echo ""

# Display deployment summary
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}🎉 BrainBytes staging environment is ready${NC}"
    
    # Start traffic simulation
    echo -e "${BLUE}🚦 Starting traffic simulation for testing...${NC}"
    cd monitoring
    if [ -f "package.json" ]; then
        npm install > /dev/null 2>&1 || print_warning "Failed to install monitoring dependencies"
        echo "You can run traffic simulation with: cd monitoring && node simulate-activity.js"
    fi
    cd ..
    
else
    echo -e "${RED}❌ Deployment completed with issues${NC}"
    echo -e "${YELLOW}Please check the logs: docker-compose -f $COMPOSE_FILE logs${NC}"
fi

# Show running containers
echo -e "${BLUE}📊 Running containers:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

echo -e "${BLUE}🔍 To view logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]${NC}"
echo -e "${BLUE}🛑 To stop: docker-compose -f $COMPOSE_FILE down${NC}"