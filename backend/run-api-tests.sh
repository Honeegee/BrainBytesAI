#!/bin/bash

# Run API and database tests
# This script runs the API and database persistence tests

# Set test environment variables
export NODE_ENV=test
export JWT_SECRET=test-jwt-secret

# Determine if we're running in a Docker environment
if [[ -f /.dockerenv ]] || grep -q docker /proc/1/cgroup 2>/dev/null; then
  echo "Running in Docker environment"
else
  echo "Not running in Docker environment - will skip Docker-specific tests"
  export SKIP_DOCKER_TESTS=true
fi

# Run API tests
echo "Running API tests..."
npx jest tests/api.test.js --verbose

# Only run DB persistence tests if we're in a Docker environment
if [[ -z "$SKIP_DOCKER_TESTS" ]]; then
  echo "Running database persistence tests..."
  npx jest tests/db-persistence.test.js --verbose
else
  echo "Skipping database persistence tests (requires Docker environment)"
fi
