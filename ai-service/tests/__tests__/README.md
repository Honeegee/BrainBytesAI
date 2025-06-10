# AI Service Test Suite

This directory contains the organized test suite for the BrainBytes AI service. The AI service handles AI response generation and common response processing.

## Directory Structure

```
__tests__/
├── unit/                         # Unit tests
│   ├── basic.test.js            # Basic functionality tests
│   └── utils.test.js            # Utility function tests
├── integration/                 # Integration tests (to be added)
│   └── api/                     # API endpoint tests
└── helpers/                     # Test utilities and helpers (to be added)
    └── setup.js                 # Test setup utilities
```

## Test Categories

### Unit Tests (`unit/`)
Tests individual functions and components in isolation.

- **[`basic.test.js`](unit/basic.test.js)**: Basic environment and setup verification
- **[`utils.test.js`](unit/utils.test.js)**: Tests for utility functions like `normalizePrompt` and `handleMathExpression`

### Integration Tests (`integration/`) - *To be added*
Tests API endpoints and external service integrations.

### Helper Utilities (`helpers/`) - *To be added*
Shared utilities and setup functions for tests.

## Running Tests

### All AI Service Tests
```bash
npm test
```

### Specific Test Categories
```bash
# Unit tests only
npx jest __tests__/unit/

# Specific test file
npx jest __tests__/unit/utils.test.js
```

### Watch Mode
```bash
npm run test:watch
```

## Test Environment

- **Testing Framework**: Jest
- **Service Port**: 3002 (configurable via PORT environment variable)
- **Dependencies**: Express, Axios, CORS

## Configuration Files

- **[`jest.config.js`](../jest.config.js)**: Jest configuration

## Environment Variables

Set these variables for testing:

```bash
PORT=3002              # AI service port
NODE_ENV=test         # Environment
```

## Test Dependencies

Key testing packages used:

- `jest`: Testing framework
- Additional packages as needed for API testing

## Tested Functions

### normalizePrompt
Tests the prompt normalization utility that:
- Trims whitespace
- Replaces multiple spaces with single space
- Normalizes smart quotes
- Handles non-string inputs

### handleMathExpression
Tests the math expression handler that:
- Evaluates basic arithmetic (addition, subtraction, multiplication, division)
- Returns original input for non-math expressions
- Handles edge cases and invalid inputs

## Adding New Tests

### Unit Tests
Add to `unit/` directory for isolated function testing:

```javascript
describe('Function Name', () => {
  test('should do something', () => {
    // Test implementation
  });
});
```

### Integration Tests (Future)
Add to `integration/` directory for API endpoint testing:

```javascript
const request = require('supertest');
const app = require('../../server');

describe('API Endpoints', () => {
  test('POST /ai should return response', async () => {
    const response = await request(app)
      .post('/ai')
      .send({ prompt: 'test' });
    
    expect(response.status).toBe(200);
  });
});
```

## Service Architecture

The AI service includes:
- Express.js server
- CORS configuration for frontend communication
- Prompt normalization utilities
- Math expression handling
- Common response checking
- External AI API integration

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure port 3002 is available
2. **Environment Variables**: Check that required env vars are set
3. **Dependencies**: Verify all npm packages are installed

### Debug Mode

Run tests with debugging:

```bash
# Run with verbose output
npx jest --verbose

# Run specific test with debugging
npx jest __tests__/unit/utils.test.js --verbose
```

## Future Enhancements

1. **API Integration Tests**: Add tests for external AI service calls
2. **Performance Tests**: Add response time testing
3. **Error Handling Tests**: Add comprehensive error scenario testing
4. **Mock External APIs**: Add proper mocking for external dependencies
5. **Load Testing**: Add tests for concurrent request handling

## Coverage

Generate test coverage reports:

```bash
npx jest --coverage
```

Coverage reports are generated in the `coverage/` directory.

## Security Considerations

The AI service tests should verify:
- Input validation and sanitization
- Rate limiting (when implemented)
- API key security (when using external services)
- CORS policy enforcement