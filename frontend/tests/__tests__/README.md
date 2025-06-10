# Frontend Test Suite

This directory contains the organized test suite for the BrainBytes frontend application built with Next.js and React.

## Directory Structure

```
__tests__/
├── e2e/                           # End-to-End tests
│   └── chat.test.js              # Chat functionality E2E tests
├── unit/                         # Unit tests (to be added)
│   ├── components/               # Component unit tests
│   └── pages/                    # Page unit tests
├── integration/                  # Integration tests (to be added)
│   └── api/                      # API integration tests
└── helpers/                      # Test utilities and helpers
    └── setup.js                  # Test setup utilities
```

## Test Categories

### End-to-End Tests (`e2e/`)
Tests the complete user workflows using a real browser environment.

- **[`chat.test.js`](e2e/chat.test.js)**: Complete chat functionality testing including login, messaging, and persistence

### Unit Tests (`unit/`) - *To be added*
Tests individual React components and utility functions in isolation.

### Integration Tests (`integration/`) - *To be added*
Tests component interactions and API integrations.

### Helper Utilities (`helpers/`)
Shared utilities and setup functions for tests.

- **[`setup.js`](helpers/setup.js)**: Global test configuration and utilities

## Running Tests

### All Frontend Tests
```bash
npm test
```

### Specific Test Categories
```bash
# E2E tests only
npx jest __tests__/e2e/

# Unit tests only (when added)
npx jest __tests__/unit/

# Specific test file
npx jest __tests__/e2e/chat.test.js
```

### Watch Mode
```bash
npm run test:watch
```

## Test Environment

- **Testing Framework**: Jest with Puppeteer
- **Browser Testing**: Puppeteer (headless Chrome)
- **Test Environment**: jsdom for unit tests, real browser for E2E
- **Base URL**: http://localhost:3001 (configurable in setup.js)

## Configuration Files

- **[`jest.config.js`](../jest.config.js)**: Jest configuration
- **[`jest-puppeteer.config.js`](../jest-puppeteer.config.js)**: Puppeteer configuration

## Environment Variables

Set these variables for testing:

```bash
BASE_URL=http://localhost:3001  # Frontend base URL
```

## Test Dependencies

Key testing packages used:

- `jest`: Testing framework
- `puppeteer`: Browser automation
- `jest-puppeteer`: Jest integration with Puppeteer
- `@testing-library/react`: React component testing utilities (to be added)
- `@testing-library/jest-dom`: Custom Jest matchers (to be added)

## Adding New Tests

### E2E Tests
Add to `e2e/` directory for complete user workflow testing:

```javascript
describe('Feature E2E Tests', () => {
  beforeAll(async () => {
    await page.goto(`${global.BASE_URL}/feature`);
  });

  test('should perform feature workflow', async () => {
    // Test implementation
  });
});
```

### Unit Tests (Future)
Add to `unit/components/` for component testing:

```javascript
import { render, screen } from '@testing-library/react';
import Component from '../../components/Component';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Test Data

Test uses the following test user credentials:
- Email: `test@example.com`
- Password: `Test12345,`

## Browser Configuration

E2E tests run with the following Puppeteer configuration:
- Default navigation timeout: 60 seconds
- Headless mode: configurable
- Browser args: defined in jest-puppeteer.config.js

## Troubleshooting

### Common Issues

1. **Timeout Issues**: Increase timeouts in individual tests or setup.js
2. **Element Not Found**: Use `page.waitForSelector()` before interacting with elements
3. **Navigation Issues**: Ensure proper `waitForNavigation()` usage
4. **Test User Issues**: Verify test user exists in the test database

### Debug Mode

Run tests with debugging:

```bash
# Run with Puppeteer in non-headless mode
HEADLESS=false npm test

# Run with verbose output
npx jest --verbose

# Run specific test with debugging
npx jest __tests__/e2e/chat.test.js --verbose
```

## Future Enhancements

1. **Component Unit Tests**: Add React Testing Library for component testing
2. **Visual Regression Tests**: Add screenshot comparison testing
3. **Accessibility Tests**: Add a11y testing with jest-axe
4. **Performance Tests**: Add Lighthouse integration for performance testing
5. **API Mocking**: Add MSW (Mock Service Worker) for API mocking in tests

## Migration Notes

This organized structure replaces the old flat structure:

- Old: `tests/e2e/chat.test.js` → New: `__tests__/e2e/chat.test.js`
- Old: `tests/e2e/setup.js` → New: `__tests__/helpers/setup.js`

Test configurations have been updated to reflect the new structure.