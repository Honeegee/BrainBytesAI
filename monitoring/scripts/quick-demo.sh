#!/bin/bash

# BrainBytes Incident Simulator - Quick Demo
# This script demonstrates the incident simulation system

echo "🚨 BrainBytes Incident Simulator - Quick Demo"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "incident-simulator.js" ]; then
    echo "❌ Please run this script from the monitoring/scripts directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "1️⃣ Checking system status..."
node incident-simulator.js status
echo ""

echo "2️⃣ Triggering a HIGH_ERROR_RATE incident..."
echo "   This will generate HTTP errors to test alert monitoring"
node incident-simulator.js trigger HIGH_ERROR_RATE &
INCIDENT_PID=$!
echo ""

echo "3️⃣ Waiting 30 seconds for metrics to be collected..."
sleep 30
echo ""

echo "4️⃣ Checking system status again (should show active incident)..."
node incident-simulator.js status
echo ""

echo "5️⃣ Resolving the incident..."
node incident-simulator.js resolve HIGH_ERROR_RATE
echo ""

echo "6️⃣ Final status check..."
node incident-simulator.js status
echo ""

echo "✅ Demo completed!"
echo ""
echo "🔗 Check your monitoring dashboards:"
echo "   • Prometheus Alerts: http://localhost:9090/alerts"
echo "   • Alertmanager: http://localhost:9093"
echo "   • Grafana: http://localhost:3003"
echo "   • cAdvisor: http://localhost:8081"
echo ""
echo "📚 For more options, run: node incident-simulator.js"