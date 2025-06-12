module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/__tests__/helpers/setup.js'],
  testMatch: [
    '**/tests/__tests__/**/*.test.js',
    '**/tests/__tests__/**/*.spec.js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js',
    '!scripts/**',
    '!make-executable.js',
  ],
  // coverageThreshold: {
  //   global: {
  //     branches: 15,
  //     functions: 25,
  //     lines: 25,
  //     statements: 25,
  //   },
  // },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testTimeout: 30000,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
  verbose: true,
};
