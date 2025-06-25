#!/bin/bash

echo "Starting BrainBytes with Prometheus Monitoring..."
echo

echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker and ensure it's running"
    exit 1
fi

echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not available"
    echo "Please install Docker Compose"
    exit 1
fi

echo
echo "Starting all services with monitoring..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Error starting services"
    exit 1
fi

echo
echo "Waiting for services to start..."
sleep 10

echo
echo "Services started successfully!"
echo
echo "Available endpoints:"
echo "- BrainBytes Frontend: http://localhost:3001"
echo "- BrainBytes Backend: http://localhost:3000"
echo "- AI Service: http://localhost:3002"
echo "- Prometheus UI: http://localhost:9090"
echo "- Alertmanager UI: http://localhost:9093"
echo "- Alert Dashboard: http://localhost:5001"
echo "- cAdvisor: http://localhost:8080"
echo "- Node Exporter: http://localhost:9100"
echo
echo "Metrics endpoints:"
echo "- Backend Metrics: http://localhost:3000/metrics"
echo "- AI Service Metrics: http://localhost:3002/metrics"
echo
echo "To generate test data and alerts:"
echo "  cd monitoring"
echo "  npm run simulate    # generate metrics"
echo "  npm run webhook     # start alert receiver"
echo

read -p "Open Prometheus UI in browser? (y/n): " choice
if [[ $choice == "y" || $choice == "Y" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:9090
    elif command -v open &> /dev/null; then
        open http://localhost:9090
    else
        echo "Please manually open http://localhost:9090 in your browser"
    fi
fi

echo
echo "Press Enter to exit..."
read