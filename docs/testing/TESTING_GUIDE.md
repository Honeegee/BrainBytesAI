# BrainBytes AI Testing Guide

## Overview

This comprehensive guide covers all testing aspects of the BrainBytes AI tutoring platform. It provides clear instructions for developers, QA engineers, and stakeholders on how to implement, run, and maintain tests across the entire application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Architecture](#testing-architecture)
3. [Testing Types](#testing-types)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Quick Start

### Prerequisites
- Node.js (v18, 20, or 22)
- Docker Desktop
- Git

### Running All Tests
```bash
# Install dependencies
npm ci

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage
```

### Service-Specific Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# AI Service tests
cd ai-service && npm test

# E2E tests
cd e2e-tests && npm test
```

## Testing Architecture

### Testing Pyramid
```
       /\
      /  \     E2E Tests (Few)
     /____\    - User workflows
    /      \   Integration Tests (Some)  
   /________\  - API endpoints, Database
  /          \ Unit Tests (Many)
 /____________\ - Components, Functions
```

### Technology Stack
- **Jest**: Primary testing framework
- **Playwright**: Cross-browser E2E testing
- **Puppeteer**: Browser automation (legacy E2E)
- **Supertest**: API testing
- **MongoDB Memory Server**: Isolated database testing
- **Artillery**: Performance testing

### Test Organization
```
BrainBytesAI/
├── frontend/tests/__tests__/     # Frontend tests
│   ├── unit/                     # Component tests
│   ├── integration/              # API integration tests
│   ├── e2e/                      # Browser automation tests
│   └── helpers/                  # Test utilities
├── backend/tests/__tests__/      # Backend tests
│   ├── unit/                     # Function tests
│   ├── integration/              # Database & API tests
│   └── helpers/                  # Test utilities
├── e2e-tests/                    # Cross-service E2E tests
│   ├── tests/                    # Playwright tests
│   └── playwright.config.js     # E2E configuration
└── docs/                         # Testing documentation
```

## Testing Types

### 1. Unit Tests
**Purpose**: Test individual components and functions in isolation.

**Coverage**: 80%+ for business logic

**Examples**:
- Form validation logic
- Component state management
- API endpoint handlers
- Database models

### 2. Integration Tests
**Purpose**: Test interactions between components and services.

**Coverage**: All API endpoints and database operations

**Examples**:
- API request/response cycles
- Database CRUD operations
- Service-to-service communication
- Authentication flows

### 3. End-to-End Tests
**Purpose**: Test complete user workflows.

**Coverage**: Critical user journeys

**Examples**:
- User registration and login
- Chat conversations
- File uploads
- Dashboard navigation

### 4. Performance Tests
**Purpose**: Validate system performance under load.

**Coverage**: Key endpoints and workflows

**Examples**:
- API response times
- Concurrent user handling
- Resource utilization
- Scalability limits

## Running Tests

### Local Development

#### All Tests
```bash
# Run complete test suite
npm run test:all

# Run with coverage reports
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### By Service
```bash
# Frontend only
cd frontend && npm test

# Backend only
cd backend && npm test

# AI Service only
cd ai-service && npm test
```

#### By Type
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Performance tests only
npm run test:performance
```

#### Specific Tests
```bash
# Run specific test file
npx jest src/components/LoginForm.test.js

# Run tests matching pattern
npx jest --testNamePattern="login"

# Run single test
npx jest -t "should validate email format"
```

### Docker Environment
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run tests in containers
docker-compose exec frontend npm test
docker-compose exec backend npm test

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### Performance Testing
```bash
# Install Artillery globally
npm install -g artillery

# Quick performance test
artillery run performance-test-quick.yml

# Full performance suite
artillery run performance-test.yml --output report.json
artillery report report.json --output report.html
```

## Writing Tests

### Frontend Unit Tests

#### Component Testing
```javascript
// components/LoginForm.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  test('validates email format', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
});
```

#### State Management Testing
```javascript
// hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react';
import useAuth from './useAuth';

describe('useAuth', () => {
  test('handles login flow', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.email).toBe('test@example.com');
  });
});
```

### Backend Unit Tests

#### API Endpoint Testing
```javascript
// routes/messages.test.js
import request from 'supertest';
import app from '../app';
import { setupDatabase, cleanupDatabase } from '../tests/helpers/db-handler';

describe('Messages API', () => {
  beforeAll(setupDatabase);
  afterAll(cleanupDatabase);

  test('POST /api/messages creates message and AI response', async () => {
    const messageData = {
      text: 'Hello AI',
      chatId: 'test-chat-123',
      subject: 'General'
    };

    const res = await request(app)
      .post('/api/messages')
      .send(messageData);

    expect(res.statusCode).toBe(201);
    expect(res.body.userMessage.text).toBe('Hello AI');
    expect(res.body.aiMessage.isAiResponse).toBe(true);
  });
});
```

#### Database Testing
```javascript
// models/Message.test.js
import Message from './Message';
import { connectDB, clearDB, closeDB } from '../tests/helpers/db-handler';

describe('Message Model', () => {
  beforeAll(connectDB);
  afterEach(clearDB);
  afterAll(closeDB);

  test('saves message with required fields', async () => {
    const messageData = {
      text: 'Test message',
      chatId: 'chat-123',
      userId: 'user-123',
      isAiResponse: false
    };

    const message = await Message.create(messageData);
    
    expect(message.text).toBe('Test message');
    expect(message.createdAt).toBeDefined();
  });
});
```

### End-to-End Tests

#### Complete User Workflow
```javascript
// e2e-tests/tests/chat-workflow.spec.js
import { test, expect } from '@playwright/test';

test('user can complete chat workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'Test12345,');
  await page.click('[data-testid=login-button]');
  
  // Navigate to chat
  await expect(page).toHaveURL(/dashboard/);
  await page.click('[data-testid=chat-link]');
  
  // Send message
  await page.fill('[data-testid=message-input]', 'Hello AI');
  await page.click('[data-testid=send-button]');
  
  // Verify response
  await expect(page.locator('[data-testid=user-message]')).toContainText('Hello AI');
  await expect(page.locator('[data-testid=ai-message]')).toBeVisible();
});
```

### Performance Tests

#### API Load Testing
```yaml
# performance-test.yml
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
  - name: "Chat API"
    weight: 70
    flow:
      - post:
          url: "/api/messages"
          json:
            text: "Performance test message"
            chatId: "perf-test-{{ $randomString() }}"
  - name: "Health Check"
    weight: 30
    flow:
      - get:
          url: "/api/health"
```

## CI/CD Integration

### GitHub Actions Workflow

Our CI/CD pipeline consists of three main workflows:

1. **Code Quality & Security** (`code-quality.yml`)
   - ESLint and Prettier checks
   - Security vulnerability scanning
   - Code analysis and secret detection

2. **CI/CD Pipeline** (`ci-cd.yml`)
   - Multi-version Node.js testing (18, 20, 22)
   - Unit, integration, and E2E tests
   - Performance testing
   - Coverage reporting

3. **Deployment** (`deploy.yml`)
   - Docker image building
   - Staging and production deployment
   - Health checks and rollback

### Running Tests in CI

Tests automatically run on:
- Push to `main` or `development` branches
- Pull requests
- Manual workflow dispatch

### Manual CI Execution
```bash
# Trigger CI/CD pipeline manually
gh workflow run "CI/CD Pipeline" --ref main

# Run specific workflow
gh workflow run "Code Quality & Security" --ref development
```

## Troubleshooting

### Common Issues

#### Test Failures

**Flaky Tests**:
```bash
# Run tests multiple times
npx jest --testNamePattern="flaky test" --verbose --runInBand

# Use longer timeouts
npx jest --testTimeout=10000
```

**Database Issues**:
```bash
# Clear test database
npm run test:db:clear

# Reset MongoDB Memory Server
npm run test:db:reset
```

**Port Conflicts**:
```bash
# Linux/macOS
sudo lsof -ti:3000,3001,3002 | xargs -r sudo kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

#### Performance Test Issues

**Artillery Connection Errors**:
```bash
# Check service health
curl http://localhost:3000/api/health
curl http://localhost:3001/

# Verify Docker services
docker-compose ps
```

**High Response Times**:
- Check system resources
- Reduce load test intensity
- Review application logs

#### E2E Test Issues

**Element Not Found**:
```javascript
// Add explicit waits
await page.waitForSelector('[data-testid=element]');
await page.waitForLoadState('networkidle');
```

**Browser Timeout**:
```javascript
// Increase timeouts
test.setTimeout(60000);
await page.goto('/login', { timeout: 30000 });
```

### Debug Commands

#### Verbose Output
```bash
# Jest with detailed output
npx jest --verbose --detectOpenHandles

# Playwright with debug mode
npx playwright test --debug

# Artillery with verbose logging
artillery run config.yml --quiet=false
```

#### Test Isolation
```bash
# Run tests in sequence
npx jest --runInBand

# Run single test file
npx jest path/to/test.js --verbose
```

## Best Practices

### Test Organization

1. **Follow the Testing Pyramid**: More unit tests, fewer E2E tests
2. **Use Descriptive Names**: Test names should explain what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Test One Thing**: Each test should verify one specific behavior

### Test Data Management

```javascript
// Use factories for test data
const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed-password',
  ...overrides
});

const createTestMessage = (overrides = {}) => ({
  text: 'Test message',
  chatId: 'test-chat',
  userId: 'test-user',
  isAiResponse: false,
  ...overrides
});
```

### Mock Management

```javascript
// Centralized mocks
jest.mock('../services/aiService', () => ({
  generateResponse: jest.fn(() => Promise.resolve('Mocked AI response'))
}));

// Clean up mocks
afterEach(() => {
  jest.clearAllMocks();
});
```

### Async Testing

```javascript
// Always use async/await
test('async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Use proper error testing
test('handles errors', async () => {
  await expect(functionThatThrows()).rejects.toThrow('Expected error');
});
```

### Environment Consistency

```javascript
// Environment-specific configurations
const config = {
  timeout: process.env.CI ? 30000 : 10000,
  retries: process.env.CI ? 2 : 0
};
```

### Performance Considerations

1. **Parallel Execution**: Use Jest's parallel execution for unit tests
2. **Test Isolation**: Use fresh database instances for integration tests
3. **Resource Cleanup**: Always clean up resources after tests
4. **Selective Testing**: Use test patterns to run only relevant tests during development

---

## Additional Resources

- [Frontend Testing Guide](../frontend/tests/__tests__/README.md)
- [Backend Testing Guide](../backend/tests/__tests__/README.md)
- [Performance Testing Details](./PERFORMANCE_TESTING.md)
- [CI/CD Pipeline Documentation](./CI_CD_DOCUMENTATION.md)

This comprehensive testing guide ensures consistent, reliable, and maintainable testing practices across the BrainBytes AI platform.