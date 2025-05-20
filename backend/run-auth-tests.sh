#!/bin/bash

# Display header
echo "====================================================="
echo "       BrainBytes API Authentication Test Suite      "
echo "====================================================="
echo ""

# Check if Jest is installed
if ! npm list jest --depth=0 > /dev/null 2>&1; then
  echo "Jest is not installed. Installing required dependencies..."
  echo ""
  
  # Install jest and test dependencies
  echo "Installing test dependencies..."
  npm install jest mongodb-memory-server supertest --save-dev
else
  echo "Jest is already installed. Continuing with tests..."
fi

# Make sure MongoDB is running (if using local MongoDB instead of memory server)
if [[ "$1" == "--use-local-mongodb" ]]; then
  echo "Checking if MongoDB is running..."
  if nc -z localhost 27017 > /dev/null 2>&1; then
    echo "MongoDB is running on port 27017."
  else
    echo "ERROR: MongoDB is not running on port 27017."
    echo "Please start your MongoDB server and try again."
    exit 1
  fi
fi

# Set the environment to test to prevent server.js from connecting to MongoDB
export NODE_ENV=test

echo ""
echo "====================================================="
echo "Running authentication tests..."
echo "====================================================="

# Run the tests with cleanup
NODE_ENV=test npm run test:auth

# Force close any remaining MongoDB memory servers
echo "Cleaning up MongoDB memory servers..."
npx jest --forceExit --detectOpenHandles

# Check the exit code of the test command
TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
  echo ""
  echo "Success: All authentication tests passed!"
else
  echo ""
  echo "Warning: Some tests failed. Please check the output above for details."
fi

echo ""
echo "====================================================="
echo "Test run complete."
echo "====================================================="
