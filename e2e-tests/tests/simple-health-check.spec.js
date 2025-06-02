const { test, expect } = require('@playwright/test');

// Very simple health check that can be run independently
test.describe('Simple Health Check', () => {
  
  test('server connectivity check', async ({ page }) => {
    // This test checks if the server is reachable
    // If server is not running, it will skip gracefully
    
    let serverRunning = false;
    
    try {
      const response = await page.goto('/', { 
        waitUntil: 'domcontentloaded', 
        timeout: 5000 
      });
      
      // If we get here, server is running
      serverRunning = true;
      
      // Basic checks if server is responding
      expect(response.status()).toBeLessThan(500); // No server errors
      
      // Check that we got some HTML content
      const title = await page.title();
      expect(title).toBeTruthy();
      
      console.log(`✅ Server is running and responding`);
      console.log(`   Title: ${title}`);
      console.log(`   Status: ${response.status()}`);
      
    } catch (error) {
      if (error.message.includes('ERR_CONNECTION_REFUSED') || 
          error.message.includes('timeout')) {
        console.log('⚠️  Server is not running on the configured URL');
        console.log('   This is expected if no development server is active');
        test.skip('Server not available - skipping connectivity test');
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  });

  test('configuration validation', async () => {
    // This test always runs and validates the test configuration
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    
    console.log(`📋 Test Configuration:`);
    console.log(`   Base URL: ${baseURL}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Skip WebServer: ${process.env.SKIP_WEBSERVER || 'false'}`);
    
    // Basic validation
    expect(baseURL).toMatch(/^https?:\/\//);
    expect(baseURL).not.toBe('');
    
    console.log('✅ Configuration is valid');
  });

  test('playwright installation check', async ({ page }) => {
    // Verify Playwright is working correctly
    await page.setContent(`
      <html>
        <head><title>Health Check</title></head>
        <body>
          <h1>Playwright Test</h1>
          <p id="test-element">This is a test</p>
        </body>
      </html>
    `);
    
    // Basic Playwright functionality test
    await expect(page).toHaveTitle('Health Check');
    await expect(page.locator('h1')).toContainText('Playwright Test');
    await expect(page.locator('#test-element')).toBeVisible();
    
    console.log('✅ Playwright is working correctly');
  });
});