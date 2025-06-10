# Backend Test Suite

This directory contains the organized test suite for the BrainBytes backend API. Tests are categorized by type and functionality for better maintainability and clarity.

## Directory Structure

```
__tests__/
├── unit/                           # Unit tests
│   ├── basic.test.js              # Basic functionality tests
│   └── middleware.test.js         # Authentication middleware tests
├── integration/                    # Integration tests
│   ├── api.test.js               # API endpoint integration tests
│   ├── auth.test.js              # Authentication API tests
│   └── database/                 # Database-specific tests
│       └── db-persistence.test.js # Database persistence tests
└── helpers/                      # Test utilities and helpers
    ├── db-handler.js            # Database connection management
    └── setup.js                 # Test setup utilities
```

## Test Categories

### Unit Tests (`unit/`)

Tests individual components in isolation with minimal dependencies.

- **[`basic.test.js`](unit/basic.test.js)**: Simple functionality verification
- **[`middleware.test.js`](unit/middleware.test.js)**: Authentication middleware testing

### Integration Tests (`integration/`)

Tests that verify component interactions and API endpoints.

- **[`api.test.js`](integration/api.test.js)**: API endpoint testing with mocked dependencies
- **[`auth.test.js`](integration/auth.test.js)**: Authentication API endpoint testing
- **[`database/db-persistence.test.js`](integration/database/db-persistence.test.js)**: Database persistence across container restarts

### Helper Utilities (`helpers/`)

Shared utilities and setup functions for tests.

- **[`db-handler.js`](helpers/db-handler.js)**: MongoDB Memory Server management
- **[`setup.js`](helpers/setup.js)**: JWT token generation and test utilities

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Categories

```bash
# Unit tests only
npx jest __tests__/unit/

# Integration tests only
npx jest __tests__/integration/

# Specific test file
npx jest __tests__/unit/basic.test.js
```

### Test Scripts

The backend provides several convenience scripts:

```bash
# Run auth-specific tests
./run-auth-tests.sh

# Run API tests
./run-api-tests.sh

# Run basic tests
./run-basic-test.sh
```

## Test Environment

- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server (for most tests)
- **Authentication**: JWT with test tokens

## Environment Variables

Set these variables for testing:

```bash
JWT_SECRET=test-jwt-secret
SKIP_DOCKER_TESTS=true  # Skip Docker-dependent tests
```

## Test Dependencies

Key testing packages used:

- `jest`: Testing framework
- `supertest`: HTTP assertion library
- `mongodb-memory-server`: In-memory MongoDB for testing
- `mongoose`: MongoDB object modeling

## Adding New Tests

1. **Unit Tests**: Add to `unit/` directory for isolated component testing
2. **Integration Tests**: Add to `integration/` directory for API and component interaction testing
3. **Database Tests**: Add to `integration/database/` for database-specific functionality
4. **Helpers**: Add shared utilities to `helpers/` directory

### Test File Naming Convention

- Use descriptive names ending with `.test.js`
- Group related tests in subdirectories
- Follow the pattern: `[feature].[type].test.js`

## Coverage

Generate test coverage reports:

```bash
npx jest --coverage
```

Coverage reports are generated in the `coverage/` directory.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**: Ensure MongoDB Memory Server dependencies are installed
2. **JWT Token Issues**: Verify JWT_SECRET environment variable is set
3. **Docker Tests Failing**: Set `SKIP_DOCKER_TESTS=true` to skip Docker-dependent tests
4. **Import Path Issues**: Check that relative paths match the new directory structure

### Debug Mode

Run tests with debugging:

```bash
# Enable Jest debug mode
npx jest --detectOpenHandles --forceExit

# Run with verbose output
npx jest --verbose
```

## Migration Notes

This organized structure replaces the old flat structure:

- Old: `tests/auth/auth.test.js` → New: `__tests__/integration/auth.test.js`
- Old: `tests/helpers/db-handler.js` → New: `__tests__/helpers/db-handler.js`
- Old: `tests/basic.test.js` → New: `__tests__/unit/basic.test.js`

All import paths have been updated to reflect the new structure.
