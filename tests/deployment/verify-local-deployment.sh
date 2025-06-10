#!/bin/bash

echo "🔍 Running local deployment verification..."

# Local service URLs
FRONTEND_URL="http://localhost:3001"
BACKEND_URL="http://localhost:3000"
AI_SERVICE_URL="http://localhost:3002"

echo "Testing frontend health..."
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
  echo "✅ Frontend is responding at $FRONTEND_URL"
else
  echo "❌ Frontend health check failed at $FRONTEND_URL"
  echo "Trying to get more details..."
  curl -I "$FRONTEND_URL" 2>/dev/null || echo "Could not connect to frontend"
fi

echo "Testing backend API health..."
if curl -f "$BACKEND_URL" > /dev/null 2>&1; then
  echo "✅ Backend API is responding at $BACKEND_URL"
else
  echo "❌ Backend API health check failed at $BACKEND_URL"
  echo "Trying to get more details..."
  curl -I "$BACKEND_URL" 2>/dev/null || echo "Could not connect to backend"
fi

echo "Testing AI service health..."
if curl -f "$AI_SERVICE_URL" > /dev/null 2>&1; then
  echo "✅ AI Service is responding at $AI_SERVICE_URL"
else
  echo "❌ AI Service health check failed at $AI_SERVICE_URL"
  echo "Trying to get more details..."
  curl -I "$AI_SERVICE_URL" 2>/dev/null || echo "Could not connect to AI service"
fi

# Test specific endpoints
echo "Testing backend API endpoint..."
BACKEND_RESPONSE=$(curl -s "$BACKEND_URL/api/health" 2>/dev/null || echo "")
if [ ! -z "$BACKEND_RESPONSE" ]; then
  echo "✅ Backend API /api/health endpoint responded: $BACKEND_RESPONSE"
else
  echo "❌ Backend API /api/health endpoint not responding"
fi

echo "Testing container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep brainbytesai

echo "🎉 Local deployment verification completed!"