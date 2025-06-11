# Testing Approach Documentation

## Overview

This document provides comprehensive documentation for the BrainBytes AI **testing approach** - the specific methods, tools, patterns, and implementation techniques used to test our application. This focuses on the **HOW** of testing with detailed code examples and best practices.

### Key Distinction:
- **Testing Approach** (this document): **HOW** to test - specific methods, tools, code patterns, implementation details
- **Testing Strategy** ([TESTING_STRATEGY_AND_CHALLENGES.md](./TESTING_STRATEGY_AND_CHALLENGES.md)): **WHAT** to test and **WHY** - goals, priorities, challenges, decision-making

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Frontend Testing Patterns](#frontend-testing-patterns)
3. [Backend Testing Patterns](#backend-testing-patterns)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Testing Best Practices](#testing-best-practices)
7. [Debugging Tests](#debugging-tests)
8. [Common Testing Patterns](#common-testing-patterns)

## Testing Strategy

Our testing approach follows the **testing pyramid** principle:

```
       /\
      /  \     E2E Tests (Few)
     /____\    
    /      \   Integration Tests (Some)
   /________\  
  /          \ Unit Tests (Many)
 /____________\
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user workflows
- **Performance Tests**: Load testing for key endpoints

## Frontend Testing Patterns

### Component Testing with State Management

Our frontend tests focus on component behavior, user interactions, and state management patterns.

#### Example: Form Validation Testing

```javascript
// Pattern: Test input validation logic
describe('Login Form Validation', () => {
  test('validates email format correctly', () => {
    const validateEmail = (email) => {
      if (!email) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
      return null;
    };

    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('invalid-email')).toBe('Email is invalid');
    expect(validateEmail('user@example.com')).toBe(null);
  });
});
```

#### Example: Component State Testing

```javascript
// Pattern: Test state reducer patterns
describe('Form State Management', () => {
  test('handles field updates and error clearing', () => {
    const formReducer = (state, action) => {
      switch (action.type) {
        case 'SET_FIELD':
          return {
            ...state,
            [action.field]: action.value,
            errors: { ...state.errors, [action.field]: null },
          };
        case 'SET_LOADING':
          return { ...state, isLoading: action.loading };
        case 'SET_ERRORS':
          return { ...state, errors: action.errors, isLoading: false };
        default:
          return state;
      }
    };

    const initialState = { email: '', password: '', isLoading: false, errors: {} };
    
    // Test field setting clears errors
    let state = formReducer(initialState, {
      type: 'SET_FIELD',
      field: 'email',
      value: 'user@example.com',
    });
    
    expect(state.email).toBe('user@example.com');
    expect(state.errors.email).toBe(null);
  });
});
```

### Component Interaction Testing

#### Example: User Input Simulation

```javascript
// Pattern: Test user interactions and form submissions
describe('Component Interactions', () => {
  test('prevents empty message submission', () => {
    const validateSubmission = (message) => {
      if (!message.trim()) {
        return { valid: false, error: 'Message cannot be empty' };
      }
      return { valid: true, error: null };
    };

    const emptySubmission = validateSubmission('');
    expect(emptySubmission.valid).toBe(false);
    expect(emptySubmission.error).toBe('Message cannot be empty');

    const validSubmission = validateSubmission('Hello AI');
    expect(validSubmission.valid).toBe(true);
  });
});
```

### Loading and Error State Testing

#### Example: API State Management

```javascript
// Pattern: Test loading states and error handling
describe('API State Management', () => {
  test('handles loading states correctly', () => {
    const apiReducer = (state, action) => {
      switch (action.type) {
        case 'API_START':
          return { ...state, loading: true, error: null };
        case 'API_SUCCESS':
          return { ...state, loading: false, data: action.payload };
        case 'API_ERROR':
          return { ...state, loading: false, error: action.error };
        default:
          return state;
      }
    };

    let state = { loading: false, data: null, error: null };
    
    // Test loading state
    state = apiReducer(state, { type: 'API_START' });
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
    
    // Test error state
    state = apiReducer(state, { type: 'API_ERROR', error: 'Network error' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});
```

## Backend Testing Patterns

### API Endpoint Testing

Our backend tests use **supertest** with **MongoDB Memory Server** for isolated testing.

#### Example: Complete API Testing

```javascript
// Pattern: Comprehensive API endpoint testing
describe('Chat API Endpoints', () => {
  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await UserProfile.create(testUser);
  });

  beforeEach(async () => {
    // Clean data between tests
    await Message.deleteMany({});
  });

  test('POST /api/messages creates message and AI response', async () => {
    const messageData = {
      text: 'Hello AI',
      chatId: 'test-chat-123',
      subject: 'General',
    };

    const res = await request(app)
      .post('/api/messages')
      .send(messageData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userMessage');
    expect(res.body.userMessage.text).toBe('Hello AI');
    expect(res.body).toHaveProperty('aiMessage');
    expect(res.body.aiMessage.isAiResponse).toBe(true);
  });

  test('GET /api/messages retrieves chat history', async () => {
    // Create test messages
    await Message.create([
      {
        text: 'User message',
        chatId: 'test-chat-123',
        userId: testUser._id,
        isAiResponse: false,
      },
      {
        text: 'AI response',
        chatId: 'test-chat-123',
        userId: testUser._id,
        isAiResponse: true,
      },
    ]);

    const res = await request(app)
      .get('/api/messages')
      .query({ chatId: 'test-chat-123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.messages).toHaveLength(2);
    expect(res.body.messages[0].text).toBe('User message');
  });
});
```

### Database Operations Testing with Mocks

#### Example: Database Service Testing

```javascript
// Pattern: Test database operations with proper mocking
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
    expect(savedMessage.chatId).toBe('chat-123');
    expect(savedMessage.createdAt).toBeDefined();
    
    // Verify it's actually in the database
    const foundMessage = await Message.findById(savedMessage._id);
    expect(foundMessage).toBeTruthy();
  });

  test('retrieves messages by session correctly', async () => {
    const chatId = 'session-123';
    
    // Create multiple messages
    await Message.create([
      { text: 'Message 1', chatId, userId: 'user-123', isAiResponse: false },
      { text: 'Response 1', chatId, userId: 'user-123', isAiResponse: true },
      { text: 'Message 2', chatId, userId: 'user-123', isAiResponse: false },
    ]);

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    
    expect(messages).toHaveLength(3);
    expect(messages[0].text).toBe('Message 1');
    expect(messages[1].isAiResponse).toBe(true);
  });
});
```

### Error Handling Middleware Testing

#### Example: Middleware Testing

```javascript
// Pattern: Test error handling and middleware
describe('Error Handling Middleware', () => {
  test('handles authentication errors', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ text: 'Test without auth' });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('handles validation errors', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({}); // Missing required fields
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('validation');
  });
});
```

## End-to-End Testing

### Playwright E2E Patterns

#### Example: Complete User Workflow Testing

```javascript
// Pattern: Test complete user workflows
describe('Chat Workflow E2E', () => {
  test('user can login and send message', async ({ page }) => {
    // Login flow
    await page.goto('http://localhost:3001/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'Test12345,');
    await page.click('[data-testid=login-button]');
    
    // Verify navigation to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Navigate to chat
    await page.click('[data-testid=chat-link]');
    
    // Send message
    await page.fill('[data-testid=message-input]', 'Hello AI');
    await page.click('[data-testid=send-button]');
    
    // Verify message appears
    await expect(page.locator('[data-testid=user-message]')).toContainText('Hello AI');
    
    // Wait for AI response
    await expect(page.locator('[data-testid=ai-message]')).toBeVisible();
  });
});
```

## Performance Testing

### Artillery Load Testing

#### Example: API Performance Testing

```yaml
# artillery configuration
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "Health check"
    weight: 30
    flow:
      - get:
          url: "/api/health"
          
  - name: "Chat messaging"
    weight: 70
    flow:
      - post:
          url: "/api/messages"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            text: "Performance test message"
            chatId: "perf-test-{{ $randomString() }}"
```

## Testing Best Practices

### 1. Test Organization

```
tests/
├── unit/                 # Fast, isolated tests
│   ├── components/       # Component logic tests
│   ├── utils/           # Utility function tests
│   └── services/        # Service layer tests
├── integration/          # API and database tests
│   ├── api/             # API endpoint tests
│   └── database/        # Database operation tests
├── e2e/                 # End-to-end workflows
└── performance/         # Load and performance tests
```

### 2. Test Data Management

```javascript
// Pattern: Use factories for test data
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed-password',
  ...overrides,
});

const createTestMessage = (overrides = {}) => ({
  text: 'Test message',
  chatId: 'test-chat',
  userId: 'test-user',
  isAiResponse: false,
  ...overrides,
});
```

### 3. Mock Management

```javascript
// Pattern: Centralized mock setup
jest.mock('axios', () => ({
  post: jest.fn(() =>
    Promise.resolve({
      data: { response: 'Mocked AI response' },
    })
  ),
}));

// Pattern: Mock cleanup
afterEach(() => {
  jest.clearAllMocks();
});
```

## Debugging Tests

### Console Debugging

```javascript
test('debug with console.log', () => {
  const result = processUserInput('test input');
  console.log('Result:', result);
  console.log('Expected:', expectedResult);
  expect(result).toBe(expectedResult);
});
```

### Component Debugging

```javascript
test('debug component output', () => {
  const { debug } = render(<ChatComponent />);
  debug(); // Prints the component's DOM to console
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Single Test Execution

```bash
# Run specific test file
npm test -- --testNamePattern="Login Form"

# Run single test
npm test -- -t "validates email format"

# Run tests in watch mode
npm test -- --watch
```

### Test Environment Debugging

```javascript
// Pattern: Environment-specific test behavior
const isCI = process.env.CI === 'true';
const testTimeout = isCI ? 30000 : 10000;

test('API call test', async () => {
  // Longer timeout in CI environment
}, testTimeout);
```

## Common Testing Patterns

### 1. Async Testing

```javascript
// Pattern: Testing async operations
test('async API call', async () => {
  const promise = apiCall();
  await expect(promise).resolves.toHaveProperty('data');
  
  const result = await promise;
  expect(result.status).toBe(200);
});
```

### 2. Error Testing

```javascript
// Pattern: Testing error scenarios
test('handles API errors gracefully', async () => {
  const mockError = new Error('Network error');
  jest.spyOn(api, 'call').mockRejectedValue(mockError);
  
  await expect(performAction()).rejects.toThrow('Network error');
  expect(errorHandler).toHaveBeenCalledWith(mockError);
});
```

### 3. State Testing

```javascript
// Pattern: Testing state changes
test('state updates correctly', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### 4. Integration Testing

```javascript
// Pattern: Testing component integration
test('components work together', async () => {
  render(
    <Provider store={store}>
      <ChatApplication />
    </Provider>
  );
  
  // Simulate user interaction
  fireEvent.click(screen.getByText('Send Message'));
  
  // Verify integrated behavior
  await waitFor(() => {
    expect(screen.getByText('Message sent')).toBeInTheDocument();
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.test.{js,jsx}',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};
```

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3001',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
};
```

## Continuous Integration

Our GitHub Actions workflow implements parallel testing with:

- **Matrix Testing**: Node.js versions 18, 20, 22
- **Service Testing**: Frontend, backend, ai-service
- **Coverage Reporting**: Codecov integration
- **Artifact Collection**: Test results and coverage reports
- **Performance Testing**: Artillery load testing
- **E2E Testing**: Playwright browser testing

This comprehensive testing approach ensures code quality, reliability, and performance across all layers of the BrainBytes AI application.