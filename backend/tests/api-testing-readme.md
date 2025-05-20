# API and Database Testing

This directory contains test files for the BrainBytes API and database persistence.

## Tests Overview

### API Tests (api.test.js)

The API tests verify that the backend API endpoints are working correctly. Key features tested:

- Health check endpoint
- Root welcome endpoint
- Chat creation and management
- Message creation and retrieval
- Chat history functionality

To run the API tests:

```bash
cd backend
./run-api-tests.sh
# Or directly with Jest
npx jest tests/api.test.js --verbose
```

### Database Persistence Tests (db-persistence.test.js)

These tests verify that data persists in MongoDB across container restarts, which is crucial for a production environment. Key features tested:

- Creating test data in MongoDB
- Restarting the MongoDB container
- Verifying data still exists after restart
- Testing with multiple records

To run the database persistence tests:

```bash
cd backend
./run-api-tests.sh
# Or directly with Jest
npx jest tests/db-persistence.test.js --verbose
```

> Note: The database persistence tests require Docker to be running with a MongoDB container. They will be skipped if not running in a Docker environment.

## Making Scripts Executable

To make the test scripts executable:

```bash
cd backend
node make-executable.js
# Or use chmod directly
chmod +x run-api-tests.sh
```

## Troubleshooting

If you encounter connection issues with MongoDB during tests:

1. Make sure MongoDB is running: `docker ps | grep mongodb`
2. Check that the container name matches what's expected in the tests
3. Verify the MongoDB connection URI in your .env file

If the POST /api/messages test fails:

1. Check that the axios mock is correctly implemented
2. Verify that the AI service URL in routes/messages.js matches the environment
3. For local testing, you may need to modify the URL from 'http://ai-service:3002/api/chat' to match your local setup

For any other test failures, check the error message and stack trace carefully. Most issues are related to either:
- Missing or incorrect environment variables
- Container connectivity issues
- Mock implementations that don't match the actual service behavior

## Adding More Tests

To add more API tests:
1. Add new test cases to api.test.js
2. Follow the existing patterns for request and response validation

To add more database tests:
1. Add new test cases to db-persistence.test.js
2. Create unique test data for each test to avoid conflicts
