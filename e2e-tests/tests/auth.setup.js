const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  
  // Click login button
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login - should redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify we're logged in by checking for user profile element
  await expect(page.getByText('Welcome')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});