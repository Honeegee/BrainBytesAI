#!/bin/bash

echo "========================================"
echo " BrainBytes Grafana Homework Setup"
echo "========================================"
echo

echo "1. Starting Docker services..."
docker-compose up -d

echo
echo "2. Waiting for services to initialize (30 seconds)..."
sleep 30

echo
echo "3. Checking service status..."
docker-compose ps

echo
echo "========================================"
echo " Grafana Homework is Ready!"
echo "========================================"
echo
echo "🌐 Access URLs:"
echo "  Grafana:    http://localhost:3000"
echo "  Prometheus: http://localhost:9090"
echo "  Backend:    http://localhost:3000/metrics"
echo
echo "🔐 Grafana Login:"
echo "  Username: admin"
echo "  Password: brainbytes"
echo
echo "📊 Pre-built Dashboards:"
echo "  - BrainBytes - System Overview"
echo "  - BrainBytes - Application Performance"
echo "  - BrainBytes - User Experience"
echo
echo "🚀 Generate Test Data:"
echo "  cd monitoring/scripts"
echo "  node simulate-traffic.js"
echo
echo "📖 Full Guide: monitoring-docs/GRAFANA-HOMEWORK-GUIDE.md"
echo