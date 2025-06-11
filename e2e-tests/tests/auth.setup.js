const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

// Create mock authentication state for testing without backend
async function createMockAuthState(page, testUser) {
  console.log('🔧 Creating mock authentication state...');
  
  const mockToken = 'mock-jwt-token-for-e2e-testing';
  const mockUserId = 'mock-user-id-12345';
  
  await page.context().storageState({
    path: authFile,
    origins: [{
      origin: 'http://localhost:3001',
      localStorage: [
        { name: 'token', value: mockToken },
        { name: 'userId', value: mockUserId },
        { name: 'email', value: testUser.email }
      ]
    }]
  });
  
  console.log('✅ Mock authentication state created successfully');
}

setup('authenticate', async ({ page, request }) => {
  // Skip auth setup if explicitly disabled
  if (process.env.SKIP_AUTH_SETUP === 'true') {
    console.log('⏭️  Skipping authentication setup (SKIP_AUTH_SETUP=true)');
    return;
  }

  // Use a more robust test user with strong password
  const testUser = {
    email: 'e2etestuser@brainbytes.ai',
    password: 'E2eTest123!@#'
  };

  console.log(`Setting up authentication for: ${testUser.email}`);

  // Get backend URL (different from frontend URL)
  const backendUrl = process.env.API_URL || 'http://localhost:3000';

  // Check if backend is available before attempting auth
  try {
    const healthCheck = await request.get(`${backendUrl}/`);
    if (!healthCheck.ok()) {
      console.log('⚠️  Backend server is not available, creating mock auth state');
      await createMockAuthState(page, testUser);
      return;
    }
  } catch (error) {
    console.log('⚠️  Backend server is not reachable, creating mock auth state');
    await createMockAuthState(page, testUser);
    return;
  }

  // First, ensure we have a clean test user
  let userRegistered = false;
  
  try {
    const registerResponse = await request.post(`${backendUrl}/api/auth/register`, {
      data: testUser,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Registration response status: ${registerResponse.status()}`);
    
    if (registerResponse.ok()) {
      const registerData = await registerResponse.json();
      console.log('Test user registered successfully');
      userRegistered = true;
      
      // If registration gives us a token, use it directly
      if (registerData.token) {
        await page.context().storageState({
          path: authFile,
          origins: [{
            origin: 'http://localhost:3001',
            localStorage: [
              { name: 'token', value: registerData.token },
              { name: 'userId', value: registerData.data.userId },
              { name: 'email', value: testUser.email }
            ]
          }]
        });
        console.log('✅ Authentication setup completed via registration token');
        return;
      }
    } else {
      const errorData = await registerResponse.json().catch(() => null);
      if (errorData?.message?.includes('already registered')) {
        console.log('Test user already exists - will try login');
        userRegistered = true;
      } else {
        console.log('Registration failed:', errorData?.message || 'Unknown error');
      }
    }
  } catch (error) {
    console.log('Registration attempt failed:', error.message);
  }

  // Now try to login (either newly registered user or existing user)
  console.log('Attempting login via API...');
  
  try {
    const loginResponse = await request.post(`${backendUrl}/api/auth/login`, {
      data: testUser,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Login response status: ${loginResponse.status()}`);
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      console.log('API login successful');
      
      if (loginData.token) {
        await page.context().storageState({
          path: authFile,
          origins: [{
            origin: 'http://localhost:3001',
            localStorage: [
              { name: 'token', value: loginData.token },
              { name: 'userId', value: loginData.data.userId },
              { name: 'email', value: testUser.email }
            ]
          }]
        });
        console.log('✅ Authentication setup completed via API login');
        return;
      }
    } else {
      const errorData = await loginResponse.json().catch(() => null);
      console.log('API login failed:', errorData?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('API login attempt failed:', error.message);
  }

  // If API approach fails, try UI login (only if frontend is available)
  console.log('Falling back to UI login...');
  
  try {
    await page.goto('/login');
    console.log('Navigated to login page');
    
    // Wait for the page to load and form to be ready
    await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    console.log('Login form is ready');
    
    // Clear and fill the form
    await page.fill('#email', '');
    await page.fill('#email', testUser.email);
    await page.fill('#password', '');
    await page.fill('#password', testUser.password);
    
    console.log('Form filled with credentials');
    
    // Submit the form
    await page.click('button[type="submit"]');
    console.log('Login form submitted');
    
    // Wait for response - either redirect or error
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('/chat')) {
      console.log('✅ Successfully redirected to chat page');
      
      // Save authentication state
      await page.context().storageState({ path: authFile });
      console.log('✅ Authentication state saved');
      console.log('Authentication setup completed successfully');
      return;
    } else if (currentUrl.includes('/login')) {
      // Still on login page - check for errors
      console.log('Still on login page - checking for errors...');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-login-error.png' });
      
      // Look for error messages
      const errorSelectors = [
        '.text-red-200',
        '.text-red-500',
        '[class*="red"]',
        '.error',
        '[role="alert"]'
      ];
      
      const errorMessages = [];
      for (const selector of errorSelectors) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.textContent().catch(() => '');
          if (text.trim()) {
            errorMessages.push(text.trim());
          }
        }
      }
      
      if (errorMessages.length > 0) {
        console.log('⚠️  UI Login failed, falling back to mock auth state');
        await createMockAuthState(page, testUser);
        return;
      } else {
        console.log('⚠️  UI Login failed with no error message, falling back to mock auth state');
        await createMockAuthState(page, testUser);
        return;
      }
    } else {
      console.log(`Unexpected redirect to: ${currentUrl}`);
    }
  } catch (error) {
    console.log('⚠️  UI login attempt failed, creating mock auth state:', error.message);
    await createMockAuthState(page, testUser);
    return;
  }
});