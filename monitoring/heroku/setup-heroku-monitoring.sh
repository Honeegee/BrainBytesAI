#!/bin/bash

# BrainBytesAI Heroku Monitoring Setup Script
# This script sets up comprehensive monitoring for Heroku-deployed BrainBytesAI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App configurations
declare -A STAGING_APPS=(
    ["frontend"]="brainbytes-frontend-staging-7593f4655363"
    ["backend"]="brainbytes-backend-staging-de872da2939f"
    ["ai"]="brainbytes-ai-service-staging-4b75c77cf53a"
)

declare -A PRODUCTION_APPS=(
    ["frontend"]="brainbytes-frontend-production-03d1e6b6b158"
    ["backend"]="brainbytes-backend-production-d355616d0f1f"
    ["ai"]="brainbytes-ai-production-3833f742ba79"
)

print_header() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}  BrainBytesAI Heroku Monitoring Setup${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Please install it first:"
        echo "  https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if user is logged in to Heroku
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Please log in to Heroku first:"
        echo "  heroku login"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

setup_environment_variables() {
    local environment=$1
    print_step "Setting up monitoring environment variables for $environment..."
    
    if [ "$environment" = "staging" ]; then
        declare -n apps=STAGING_APPS
    else
        declare -n apps=PRODUCTION_APPS
    fi
    
    # Check if Grafana Cloud credentials are provided
    if [ -z "$GRAFANA_CLOUD_PROMETHEUS_URL" ] || [ -z "$GRAFANA_CLOUD_PROMETHEUS_USER" ] || [ -z "$GRAFANA_CLOUD_PROMETHEUS_PASSWORD" ]; then
        print_warning "Grafana Cloud credentials not provided as environment variables."
        echo "Please set the following environment variables before running this script:"
        echo "  export GRAFANA_CLOUD_PROMETHEUS_URL='your-prometheus-url'"
        echo "  export GRAFANA_CLOUD_PROMETHEUS_USER='your-prometheus-user'"
        echo "  export GRAFANA_CLOUD_PROMETHEUS_PASSWORD='your-prometheus-password'"
        echo "  export GRAFANA_CLOUD_LOKI_URL='your-loki-url'"
        echo "  export GRAFANA_CLOUD_LOKI_USER='your-loki-user'"
        echo "  export GRAFANA_CLOUD_LOKI_PASSWORD='your-loki-password'"
        echo ""
        echo "Or provide them interactively:"
        read -p "Grafana Cloud Prometheus URL: " GRAFANA_CLOUD_PROMETHEUS_URL
        read -p "Grafana Cloud Prometheus User: " GRAFANA_CLOUD_PROMETHEUS_USER
        read -s -p "Grafana Cloud Prometheus Password: " GRAFANA_CLOUD_PROMETHEUS_PASSWORD
        echo ""
        read -p "Grafana Cloud Loki URL: " GRAFANA_CLOUD_LOKI_URL
        read -p "Grafana Cloud Loki User: " GRAFANA_CLOUD_LOKI_USER
        read -s -p "Grafana Cloud Loki Password: " GRAFANA_CLOUD_LOKI_PASSWORD
        echo ""
    fi
    
    # Set monitoring environment variables for each app
    for service in "${!apps[@]}"; do
        local app_name=${apps[$service]}
        echo "  Configuring $service ($app_name)..."
        
        # Basic monitoring config
        heroku config:set ENABLE_METRICS=true --app $app_name
        heroku config:set ENVIRONMENT=$environment --app $app_name
        heroku config:set MONITORING_ENABLED=true --app $app_name
        
        # Grafana Cloud config (only for backend and ai services)
        if [ "$service" != "frontend" ]; then
            heroku config:set GRAFANA_CLOUD_PROMETHEUS_URL="$GRAFANA_CLOUD_PROMETHEUS_URL" --app $app_name
            heroku config:set GRAFANA_CLOUD_PROMETHEUS_USER="$GRAFANA_CLOUD_PROMETHEUS_USER" --app $app_name
            heroku config:set GRAFANA_CLOUD_PROMETHEUS_PASSWORD="$GRAFANA_CLOUD_PROMETHEUS_PASSWORD" --app $app_name
            heroku config:set GRAFANA_CLOUD_LOKI_URL="$GRAFANA_CLOUD_LOKI_URL" --app $app_name
            heroku config:set GRAFANA_CLOUD_LOKI_USER="$GRAFANA_CLOUD_LOKI_USER" --app $app_name
            heroku config:set GRAFANA_CLOUD_LOKI_PASSWORD="$GRAFANA_CLOUD_LOKI_PASSWORD" --app $app_name
        fi
    done
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
}

setup_log_drains() {
    local environment=$1
    print_step "Setting up log drains for $environment..."
    
    if [ "$environment" = "staging" ]; then
        declare -n apps=STAGING_APPS
    else
        declare -n apps=PRODUCTION_APPS
    fi
    
    # Set up Grafana Cloud log drains if Loki URL is provided
    if [ -n "$GRAFANA_CLOUD_LOKI_URL" ] && [ -n "$GRAFANA_CLOUD_LOKI_USER" ] && [ -n "$GRAFANA_CLOUD_LOKI_PASSWORD" ]; then
        for service in "${!apps[@]}"; do
            local app_name=${apps[$service]}
            echo "  Setting up log drain for $service ($app_name)..."
            
            # Create a log drain URL with basic auth
            local loki_drain_url="https://${GRAFANA_CLOUD_LOKI_USER}:${GRAFANA_CLOUD_LOKI_PASSWORD}@${GRAFANA_CLOUD_LOKI_URL#https://}/loki/api/v1/push"
            
            # Add log drain (this might fail if already exists, that's ok)
            heroku drains:add "$loki_drain_url" --app $app_name || echo "    Log drain may already exist"
        done
    else
        print_warning "Grafana Cloud Loki credentials not provided, skipping log drains setup"
    fi
    
    echo -e "${GREEN}✅ Log drains configured${NC}"
}

test_monitoring_endpoints() {
    local environment=$1
    print_step "Testing monitoring endpoints for $environment..."
    
    if [ "$environment" = "staging" ]; then
        declare -n apps=STAGING_APPS
    else
        declare -n apps=PRODUCTION_APPS
    fi
    
    for service in "${!apps[@]}"; do
        local app_name=${apps[$service]}
        echo "  Testing $service ($app_name)..."
        
        # Test health endpoint
        local health_url="https://${app_name}.herokuapp.com"
        if [ "$service" != "frontend" ]; then
            health_url="${health_url}/health"
        fi
        
        if curl -f -s "$health_url" > /dev/null; then
            echo -e "    ${GREEN}✅ Health endpoint: OK${NC}"
        else
            echo -e "    ${RED}❌ Health endpoint: Failed${NC}"
        fi
        
        # Test metrics endpoint (only for backend and ai services)
        if [ "$service" != "frontend" ]; then
            local metrics_url="https://${app_name}.herokuapp.com/metrics"
            if curl -f -s "$metrics_url" | head -n 1 | grep -q "HELP"; then
                echo -e "    ${GREEN}✅ Metrics endpoint: OK${NC}"
            else
                echo -e "    ${RED}❌ Metrics endpoint: Failed${NC}"
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Endpoint testing completed${NC}"
}

setup_uptime_monitoring() {
    print_step "Setting up uptime monitoring recommendations..."
    
    echo "Recommended uptime monitoring services:"
    echo "1. UptimeRobot (https://uptimerobot.com/) - Free tier available"
    echo "2. Pingdom (https://www.pingdom.com/)"
    echo "3. StatusCake (https://www.statuscake.com/)"
    echo "4. Better Uptime (https://betteruptime.com/)"
    echo ""
    echo "URLs to monitor:"
    
    for env in "staging" "production"; do
        echo "  $env environment:"
        if [ "$env" = "staging" ]; then
            declare -n apps=STAGING_APPS
        else
            declare -n apps=PRODUCTION_APPS
        fi
        
        for service in "${!apps[@]}"; do
            local app_name=${apps[$service]}
            local url="https://${app_name}.herokuapp.com"
            if [ "$service" != "frontend" ]; then
                url="${url}/health"
            fi
            echo "    $service: $url"
        done
    done
    
    echo -e "${GREEN}✅ Uptime monitoring recommendations provided${NC}"
}

generate_dashboard_import() {
    print_step "Generating dashboard import instructions..."
    
    echo "To import the BrainBytesAI dashboard to Grafana Cloud:"
    echo "1. Log in to your Grafana Cloud instance"
    echo "2. Go to Dashboards > Browse"
    echo "3. Click 'New' > 'Import'"
    echo "4. Upload the file: monitoring/heroku/dashboards/brainbytes-heroku-dashboard.json"
    echo "5. Configure the data source to point to your Prometheus instance"
    echo "6. Click 'Import'"
    echo ""
    echo "Alert rules can be imported from: monitoring/heroku/alerts/heroku-alert-rules.yml"
    
    echo -e "${GREEN}✅ Dashboard import instructions provided${NC}"
}

main() {
    print_header
    
    local environment=${1:-"staging"}
    
    if [ "$environment" != "staging" ] && [ "$environment" != "production" ]; then
        print_error "Invalid environment. Use 'staging' or 'production'"
        exit 1
    fi
    
    echo "Setting up monitoring for: $environment"
    echo ""
    
    check_prerequisites
    setup_environment_variables "$environment"
    setup_log_drains "$environment"
    test_monitoring_endpoints "$environment"
    setup_uptime_monitoring
    generate_dashboard_import
    
    echo ""
    echo -e "${GREEN}=================================================${NC}"
    echo -e "${GREEN}  Monitoring setup completed successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Import the dashboard to Grafana Cloud"
    echo "2. Set up uptime monitoring with your preferred service"
    echo "3. Configure alert notification channels"
    echo "4. Test the monitoring setup with some traffic"
    echo ""
    echo "Monitor your applications at:"
    echo "  Grafana Cloud: https://grafana.com/"
    echo "  Heroku Metrics: https://dashboard.heroku.com/"
    echo ""
}

# Run main function with all arguments
main "$@"