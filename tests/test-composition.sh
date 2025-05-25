#!/bin/bash
# test-composition.sh

# Start all containers
docker-compose up -d

# Wait for services to be ready
echo "Waiting for containers to initialize..."
sleep 15

# Check Frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)

# Check Backend health endpoint
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

# Check MongoDB by running a basic command inside the container
db_status=$(docker-compose exec -T mongo mongo --quiet --eval "db.stats().ok")

# Verify if services are healthy
if [[ "$frontend_status" == "200" && "$backend_status" == "200" && "$db_status" == "1" ]]; then
  echo "✅ All services are running properly."
  exit 0
else
  echo "❌ Service check failed!"
  echo "Frontend status: $frontend_status"
  echo "Backend status: $backend_status"
  echo "Database status: $db_status"
  exit 1
fi
