// Basic test to ensure test framework is working for Frontend
describe('Frontend Basic Test', () => {
  test('Math works', () => {
    expect(1 + 1).toBe(2);
  });

  test('Environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('React is available', () => {
    const React = require('react');
    expect(React).toBeDefined();
    expect(typeof React.createElement).toBe('function');
  });
});
