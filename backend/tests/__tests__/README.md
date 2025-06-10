# Backend Test Suite

This directory contains the comprehensive test suite for the BrainBytes backend API built with Node.js, Express, and MongoDB.

## Directory Structure

```
__tests__/
├── unit/                          # Unit tests
│   ├── basic.test.js             # Basic functionality tests
│   └── middleware.test.js        # Middleware unit tests
├── integration/                   # Integration tests
│   ├── api.test.js               # API endpoint integration tests
│   ├── auth.test.js              # Authentication integration tests
│   └── database/                 # Database integration tests
│       └── db-persistence.test.js
├── helpers/                       # Test utilities and helpers
│   ├── setup.js                  # Test setup utilities
│   └── db-handler.js             # Database test helper
└── README.md                     # This file
```

## Test Categories

### Unit Tests (`unit/`)

Tests individual functions and middleware in isolation.

- **[`basic.test.js`](unit/basic.test.js)**: Core functionality and utility testing
- **[`middleware.test.js`](unit/middleware.test.js)**: Security and authentication middleware testing

### Integration Tests (`integration/`)

Tests API endpoints, database operations, and service interactions.

- **[`api.test.js`](integration/api.test.js)**: Comprehensive API endpoint testing with mocked dependencies
- **[`auth.test.js`](integration/auth.test.js)**: Authentication flow and JWT token testing
- **[`db-persistence.test.js`](integration/database/db-persistence.test.js)**: Database operations and data persistence testing

### Helper Utilities (`helpers/`)

Shared utilities and setup functions for tests.

- **[`setup.js`](helpers/setup.js)**: Global test configuration and JWT token generation
- **[`db-handler.js`](helpers/db-handler.js)**: MongoDB Memory Server setup and teardown utilities

## Testing Features Implemented

### ✅ API Endpoint Testing

- Complete CRUD operations for chat messages
- Health endpoint monitoring
- Error handling and validation testing
- Authentication and authorization testing

### ✅ Database Operations Testing

- MongoDB Memory Server for isolated testing
- Message creation and retrieval testing
- Chat session management
- Data persistence verification

### ✅ Mock Database Implementation

- In-memory MongoDB for fast, isolated tests
- Proper setup and teardown between tests
- Test data factories and utilities

### ✅ Error Handling Middleware

- Authentication error scenarios
- Validation error testing
- Security middleware verification

## Running Tests

### All Backend Tests

```bash
cd backend
npm test
```

### With Coverage

```bash
npm run test:coverage
```

### Specific Test Categories

```bash
# Unit tests only
npx jest __tests__/unit/

# Integration tests only
npx jest __tests__/integration/

# Specific test file
npx jest __tests__/integration/api.test.js
```

### Watch Mode

```bash
npm run test:watch
```

## Test Environment

- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **Database Testing**: MongoDB Memory Server
- **Mocking**: Jest mocks for external services
- **Coverage**: Istanbul/NYC

## Configuration Files

- **[`jest.config.js`](../jest.config.js)**: Jest configuration
- **[`package.json`](../package.json)**: Test scripts and dependencies

## Environment Variables

Set these variables for testing:

```bash
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/brainbytes_test
JWT_SECRET=test_jwt_secret_key
SESSION_SECRET=test_session_secret_key
```

## Test Dependencies

Key testing packages used:

- `jest`: Testing framework
- `supertest`: HTTP assertion library
- `mongodb-memory-server`: In-memory MongoDB for testing
- `mongoose`: MongoDB object modeling

## Sample Test Patterns

### API Endpoint Testing

```javascript
describe('Chat API Endpoints', () => {
  test('POST /api/messages should create a new message', async () => {
    const messageData = {
      text: 'Hello AI',
      chatId: 'test-chat-123',
      subject: 'General',
    };

    const res = await request(app).post('/api/messages').send(messageData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userMessage');
    expect(res.body.userMessage.text).toBe('Hello AI');
  });
});
```

### Database Operations Testing

```javascript
describe('Message Service', () => {
  test('saves message to database correctly', async () => {
    const messageData = {
      text: 'Test message',
      chatId: 'chat-123',
      userId: 'user-123',
      isAiResponse: false,
    };

    const savedMessage = await Message.create(messageData);
    expect(savedMessage.text).toBe('Test message');

    const foundMessage = await Message.findById(savedMessage._id);
    expect(foundMessage).toBeTruthy();
  });
});
```

### Error Handling Testing

```javascript
describe('Error Handling', () => {
  test('handles authentication errors', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ text: 'Test without auth' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
```

## Debugging Tests

### Console Debugging

```javascript
test('debug with console.log', () => {
  const result = processMessage(testData);
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

### Database State Debugging

```javascript
test('debug database state', async () => {
  await Message.create(testMessage);

  const count = await Message.countDocuments();
  console.log('Message count:', count);

  const messages = await Message.find();
  console.log('All messages:', messages);
});
```

### Single Test Execution

```bash
# Run specific test
npx jest -t "creates message correctly"

# Run with verbose output
npx jest --verbose

# Run specific file with debugging
npx jest __tests__/integration/api.test.js --verbose
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**: Ensure MongoDB Memory Server starts correctly
2. **Port Conflicts**: Check if test ports are available
3. **Async Test Issues**: Use proper async/await patterns
4. **Mock Issues**: Clear mocks between tests

### Debug Commands

```bash
# Check MongoDB connection
npx jest --verbose __tests__/integration/database/

# Test with longer timeout
npx jest --testTimeout=10000

# Run tests in sequence (not parallel)
npx jest --runInBand
```

## Testing Documentation

For comprehensive testing patterns, best practices, and debugging techniques, see:

- **[Testing Approach Documentation](../../../docs/TESTING_APPROACH.md)**: Complete testing strategy and patterns
- **[CI/CD Documentation](../../../docs/CI_CD_DOCUMENTATION.md)**: GitHub Actions workflow details
- **[Performance Testing](../../../docs/PERFORMANCE_TESTING.md)**: Load testing and performance metrics

## Future Enhancements

1. **API Rate Limiting Tests**: Add tests for rate limiting middleware
2. **File Upload Tests**: Add tests for learning material uploads
3. **Caching Tests**: Add Redis caching layer testing
4. **Microservice Tests**: Add inter-service communication testing
5. **Contract Testing**: Add API contract testing with Pact

This backend test suite ensures robust API functionality, database integrity, and proper error handling across all components of the BrainBytes AI platform.
