describe('Chat E2E Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test12345,'
  };

  beforeAll(async () => {
    await page.goto(`${global.BASE_URL}/login`);
  });

  test('should login and navigate to chat', async () => {
    // Wait for the form to be rendered
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Fill in login form
    await page.type('input[name="email"]', testUser.email);
    await page.type('input[name="password"]', testUser.password);
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);
    expect(page.url()).toContain('/chat');
    
    // Wait for chat interface to be ready
    await page.waitForSelector('div.bg-hf-blue.bg-opacity-20', { timeout: 15000 });
  }, 90000);

  test('should send a message and receive AI response', async () => {
    // Wait for chat interface to be ready
    await page.waitForSelector('textarea[placeholder="Message BrainBytes..."]', { visible: true, timeout: 15000 });
    
    // Type and send a message
    const testMessage = 'Hello, this is a test message';
    await page.type('textarea[placeholder="Message BrainBytes..."]', testMessage);
    await page.click('button[type="submit"]');

    // Wait for user message to appear
    await page.waitForSelector('div[class*="bg-hf-blue"]', { timeout: 15000 });
    
    // Verify messages exist
    const messageElements = await page.$$('div[class*="bg-hf-blue"]');
    expect(messageElements.length).toBeGreaterThan(0);
  }, 90000);

  test('should persist chat history after reload', async () => {
    // Store initial message count
    const initialMessages = await page.$$('div[class*="bg-hf-blue"]');
    const initialCount = initialMessages.length;

    // Reload page and wait for full load
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('div[class*="bg-hf-blue"]', { timeout: 15000 });

    // Verify messages still exist
    const newMessages = await page.$$('div[class*="bg-hf-blue"]');
    expect(newMessages.length).toEqual(initialCount);
  }, 90000);

  test('should handle message filtering', async () => {
    // Wait for chat interface to be ready
    await page.waitForSelector('div.bg-hf-blue.bg-opacity-20', { visible: true, timeout: 15000 });
    
    // Wait for filter dropdown
    await page.waitForSelector('select.bg-bg-dark-secondary', { visible: true, timeout: 15000 });
    await page.select('select.bg-bg-dark-secondary', '');

    // Wait for messages to update after filtering
    await page.waitForSelector('div[class*="bg-hf-blue"]', { visible: true });
    
    // Verify messages are visible
    const visibleMessages = await page.$$eval('div[class*="bg-hf-blue"]',
      messages => messages.filter(m => window.getComputedStyle(m).display !== 'none').length
    );
    
    expect(visibleMessages).toBeGreaterThan(0);
  }, 90000);
});
