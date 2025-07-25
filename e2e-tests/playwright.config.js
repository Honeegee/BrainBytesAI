// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['allure-playwright'],
    ['github']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global test timeout */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  
  /* Global test timeout */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - only runs when not skipped
    {
      name: 'setup',
      testMatch: process.env.SKIP_AUTH_SETUP === 'true' ? /^$/ : /.*\.setup\.js/,
      use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3001',
      },
    },
    
    // Health check tests (no auth required)
    {
      name: 'health-check',
      testMatch: /.*health-check\.spec\.js|.*simple-health.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000'
      },
      dependencies: [], // No dependencies on setup
      metadata: {
        description: 'Basic health checks that can run without backend services'
      }
    },
    
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Test-Environment': 'true'
        }
      },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      dependencies: process.env.SKIP_AUTH_SETUP ? [] : ['setup'],
    },
  ],

  /* Output directories */
  outputDir: 'test-results/',
  
  /* Run your local dev server before starting the tests */
  webServer: (process.env.CI || process.env.SKIP_WEBSERVER) ? undefined : {
    command: 'cd ../frontend && npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
