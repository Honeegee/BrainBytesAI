const { test, expect } = require('@playwright/test');

// Simple health check tests that don't require authentication
test.describe('Health Check Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Add error handling for connection issues
    page.on('pageerror', exception => {
      console.log(`Page error: ${exception}`);
    });
  });

  test('application loads successfully', async ({ page }) => {
    try {
      // Navigate to the home page
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      // Check if the page loads without error
      await expect(page).toHaveTitle(/BrainBytesAI/i);
      
      // Verify the page contains expected content
      const body = page.locator('body');
      await expect(body).toBeVisible();
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('login page is accessible', async ({ page }) => {
    try {
      // Navigate to login page
      await page.goto('/login');
      
      // Check if login page loads
      await expect(page.locator('h1')).toContainText('Login');
      
      // Verify form elements exist (using actual IDs from the component)
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('signup page is accessible', async ({ page }) => {
    try {
      // Navigate to signup page
      await page.goto('/signup');
      
      // Check if signup page loads (or redirects properly)
      // This test will pass if the page loads without throwing an error
      await page.waitForLoadState('networkidle');
      
      // Basic check that we're not getting a 404 or error page
      const title = await page.title();
      expect(title).toBeTruthy();
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('navigation between pages works', async ({ page }) => {
    try {
      // Start at login page
      await page.goto('/login');
      await expect(page.locator('h1')).toContainText('Login');
      
      // Navigate to signup via link
      await page.click('a[href="/signup"]');
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a different page (title or URL changed)
      const currentUrl = page.url();
      expect(currentUrl).toContain('/signup');
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('application responds to basic interactions', async ({ page }) => {
    try {
      // Navigate to login page
      await page.goto('/login');
      
      // Test form interaction without submitting
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'testpassword');
      
      // Verify the values were set
      const emailValue = await page.inputValue('#email');
      const passwordValue = await page.inputValue('#password');
      
      expect(emailValue).toBe('test@example.com');
      expect(passwordValue).toBe('testpassword');
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('error handling - invalid route', async ({ page }) => {
    try {
      // Navigate to a non-existent page
      const response = await page.goto('/nonexistent-page');
      
      // Should handle gracefully (either 404 or redirect)
      // Just verify the app doesn't crash
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      expect(title).toBeTruthy();
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });

  test('responsive design basics', async ({ page }) => {
    try {
      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      
      // Verify page still renders properly on mobile
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      
      // Test on desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      
      // Verify page still renders properly on desktop
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        test.skip('Application server is not running. Please start the frontend server first.');
      }
      throw error;
    }
  });
});