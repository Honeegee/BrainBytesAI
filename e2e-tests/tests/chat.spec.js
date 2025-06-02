const { test, expect } = require('@playwright/test');

test.describe('Chat Functionality', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible();
    await expect(page.getByTestId('message-input')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible();
    await expect(page.getByTestId('chat-history')).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');
    const sendButton = page.getByTestId('send-button');
    const testMessage = 'Hello, this is a test message';

    await messageInput.fill(testMessage);
    await sendButton.click();

    // Check that message appears in chat history
    await expect(page.getByText(testMessage)).toBeVisible();
    
    // Check that input is cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should send message with Enter key', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');
    const testMessage = 'Message sent with Enter key';

    await messageInput.fill(testMessage);
    await messageInput.press('Enter');

    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should not send empty message', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');
    
    await sendButton.click();
    
    // Should not add any new messages to chat
    const messages = page.getByTestId('chat-message');
    const initialCount = await messages.count();
    
    await sendButton.click();
    
    const newCount = await messages.count();
    expect(newCount).toBe(initialCount);
  });

  test('should receive AI response', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');
    const testMessage = 'What is machine learning?';

    await messageInput.fill(testMessage);
    await messageInput.press('Enter');

    // Wait for AI response
    await expect(page.getByTestId('ai-response')).toBeVisible({ timeout: 10000 });
    
    // Check that response contains some content
    const response = page.getByTestId('ai-response').last();
    await expect(response).not.toBeEmpty();
  });

  test('should display typing indicator', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');
    const testMessage = 'Tell me about AI';

    await messageInput.fill(testMessage);
    await messageInput.press('Enter');

    // Should show typing indicator
    await expect(page.getByTestId('typing-indicator')).toBeVisible();
    
    // Typing indicator should disappear when response arrives
    await expect(page.getByTestId('typing-indicator')).not.toBeVisible({ timeout: 15000 });
  });

  test('should filter chat history', async ({ page }) => {
    // Send a few messages first
    const messages = ['Machine learning', 'Artificial intelligence', 'Deep learning'];
    
    for (const message of messages) {
      await page.getByTestId('message-input').fill(message);
      await page.getByTestId('message-input').press('Enter');
      await page.waitForTimeout(1000); // Wait between messages
    }

    // Use filter
    const filterInput = page.getByTestId('chat-filter');
    await filterInput.fill('machine');

    // Should only show messages containing 'machine'
    await expect(page.getByText('Machine learning')).toBeVisible();
    await expect(page.getByText('Artificial intelligence')).not.toBeVisible();
    await expect(page.getByText('Deep learning')).not.toBeVisible();
  });

  test('should clear chat history', async ({ page }) => {
    // Send a message first
    await page.getByTestId('message-input').fill('Test message for clearing');
    await page.getByTestId('message-input').press('Enter');

    // Clear chat
    await page.getByTestId('clear-chat-button').click();
    
    // Confirm in dialog
    await page.getByTestId('confirm-clear-button').click();

    // Chat should be empty
    const messages = page.getByTestId('chat-message');
    await expect(messages).toHaveCount(0);
  });

  test('should export chat history', async ({ page }) => {
    // Send a few messages
    await page.getByTestId('message-input').fill('Export test message');
    await page.getByTestId('message-input').press('Enter');
    await page.waitForTimeout(2000);

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-chat-button').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/chat-history.*\.json/);
  });

  test('should handle long messages', async ({ page }) => {
    const longMessage = 'This is a very long message that should test how the chat interface handles lengthy text content. '.repeat(10);
    
    await page.getByTestId('message-input').fill(longMessage);
    await page.getByTestId('send-button').click();

    // Message should be visible and properly formatted
    await expect(page.getByText(longMessage).first()).toBeVisible();
    
    // Check that message container doesn't overflow
    const messageContainer = page.getByTestId('chat-message').last();
    const isOverflowing = await messageContainer.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isOverflowing).toBe(false);
  });

  test('should maintain chat scroll position', async ({ page }) => {
    // Send multiple messages to create scroll
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('message-input').fill(`Message ${i + 1}`);
      await page.getByTestId('message-input').press('Enter');
      await page.waitForTimeout(500);
    }

    // Scroll up
    await page.getByTestId('chat-history').evaluate(el => el.scrollTop = 0);
    
    // Send new message
    await page.getByTestId('message-input').fill('New message');
    await page.getByTestId('message-input').press('Enter');

    // Should auto-scroll to bottom
    const chatHistory = page.getByTestId('chat-history');
    const scrollTop = await chatHistory.evaluate(el => el.scrollTop);
    const scrollHeight = await chatHistory.evaluate(el => el.scrollHeight);
    const clientHeight = await chatHistory.evaluate(el => el.clientHeight);
    
    expect(scrollTop).toBeGreaterThan(scrollHeight - clientHeight - 100);
  });
});