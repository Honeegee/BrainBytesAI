#!/bin/bash

echo "======================================================"
echo "          BrainBytes API Basic Test Runner            "
echo "======================================================"
echo ""

# Check if Jest is installed
if ! npm list jest --depth=0 > /dev/null 2>&1; then
  echo "Jest is not installed. Installing required dependencies..."
  echo ""
  
  # Install jest and test dependencies
  echo "Installing test dependencies..."
  npm install jest --save-dev
else
  echo "Jest is already installed. Continuing with tests..."
fi

echo ""
echo "======================================================"
echo "Running basic test to verify setup..."
echo "======================================================"

# Run the basic test
npx jest tests/basic.test.js --verbose

# Check the exit code of the test command
if [ $? -eq 0 ]; then
  echo ""
  echo "Success: Basic test passed!"
  echo ""
  echo "Now you can run the full auth tests with:"
  echo "./run-auth-tests.sh"
else
  echo ""
  echo "Warning: Basic test failed. Please check your Jest setup."
fi

echo ""
echo "======================================================"
echo "Test run complete."
echo "======================================================"
