#!/bin/bash

echo "🚀 Starting staging deployment..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services with staging configuration
echo "🔧 Building and starting staging services..."
docker-compose -f docker-compose.staging.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Run deployment verification
echo "🔍 Running deployment verification..."
node scripts/test-atlas-cicd.js

echo "✅ Staging deployment completed!"