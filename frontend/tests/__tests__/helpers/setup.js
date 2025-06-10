// Set default navigation timeout and base URL for all tests
beforeAll(async () => {
  // Set default navigation timeout
  await page.setDefaultNavigationTimeout(60000);
});

// Make base URL accessible in all tests
global.BASE_URL = 'http://localhost:3001';