const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, request }) => {
  const testUser = {
    email: 'e2etest@example.com',
    password: 'TestPassword123!'
  };

  // Get backend URL (different from frontend URL)
  const backendUrl = process.env.API_URL || 'http://localhost:3000';

  // First, try to register the test user (in case it doesn't exist)
  try {
    await request.post(`${backendUrl}/api/auth/register`, {
      data: testUser
    });
    console.log('Test user registered successfully');
  } catch (error) {
    // User might already exist, which is fine
    console.log('Test user registration skipped (user may already exist)');
  }

  // Now go to login page
  await page.goto('/login');
  
  // Fill login form using actual form field IDs
  await page.fill('#email', testUser.email);
  await page.fill('#password', testUser.password);
  
  // Click login button using actual selector
  await page.click('button[type="submit"]');
  
  // Wait for successful login - should redirect to chat page
  try {
    await page.waitForURL('/chat', { timeout: 10000 });
  } catch (error) {
    // If redirect fails, check for error messages
    const errorMessage = await page.locator('[class*="red"]').textContent().catch(() => null);
    if (errorMessage) {
      throw new Error(`Login failed: ${errorMessage}`);
    }
    throw error;
  }
  
  // Verify we're logged in by checking for a common element on the chat page
  await expect(page.locator('body')).toBeVisible();
  
  // Additional verification - check if we have the proper page structure
  await page.waitForLoadState('networkidle');
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('Authentication setup completed successfully');
});