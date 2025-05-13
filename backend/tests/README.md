# BrainBytes API Testing Suite

## Quick Start

To verify that the testing setup is working correctly, run the basic test first:

```bash
npm install jest supertest mongodb-memory-server --save-dev
npx jest tests/basic.test.js
```

This simple test should pass and confirm that Jest is working properly.

This directory contains automated tests for the BrainBytes API. The tests ensure that the API endpoints work as expected and help catch regressions during development.

## Authentication Tests

The authentication tests verify that the registration, login, and authentication middleware components work correctly.

### Test Files

- `auth.test.js`: Tests the registration and login API endpoints
- `middleware.test.js`: Tests the authentication middleware that protects routes

## Running the Tests

### Option 1: Using the Provided Script

The simplest way to run the authentication tests is to use the provided shell script:

```bash
# Make sure the script is executable
node make-executable.js

# Run the tests
./run-auth-tests.sh
```

This script will:
1. Check if Jest and other testing dependencies are installed
2. Install them if necessary
3. Run the authentication tests
4. Report the results

### Option 2: Running Tests Manually

If you prefer to run the tests manually, follow these steps:

1. Make sure you have the required testing dependencies installed:

```bash
# Copy the updated package.json and install dependencies
cp tests/package.json.update package.json
npm install
```

2. Run the authentication tests:

```bash
npm run test:auth
```

3. To run specific test files:

```bash
# Run only the auth API tests
npx jest tests/auth/auth.test.js

# Run only the middleware tests
npx jest tests/auth/middleware.test.js
```

4. To run tests with a watcher (automatically reruns when files change):

```bash
npm run test:watch
```

## Test Environment

The tests use the following setup:

- **MongoDB Memory Server**: Tests run against an in-memory MongoDB instance, so they don't affect your development database
- **Supertest**: Used to make HTTP requests to the API endpoints
- **Jest**: The testing framework that runs the tests and provides assertions

## Adding More Tests

To add more tests for other API endpoints:

1. Create a new directory under `tests` for the feature you want to test
2. Create test files following the patterns in the existing tests
3. Run the tests to ensure they work

## Troubleshooting

If you encounter issues with the tests:

1. Make sure all dependencies are installed
2. Check that environment variables are set correctly in the test setup
3. Clear the Jest cache if needed: `npx jest --clearCache`
4. Check the test output for specific errors

## Checking Test Coverage

To check test coverage:

```bash
npx jest --coverage
```

This will generate a coverage report in the `coverage` directory.
