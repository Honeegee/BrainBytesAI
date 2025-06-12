const mongoose = require('mongoose');
const Message = require('../../../../models/message');

// This test verifies that data persists in MongoDB Atlas across connections
// and database operations work correctly with Atlas test database.

// Skip these tests if SKIP_DOCKER_TESTS is set (CI environment)
const shouldSkipAtlasTests = process.env.SKIP_DOCKER_TESTS === 'true';

// Use Atlas test database URI
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'mongodb+srv://honeygden:xGeo64nUbYhtK5UM@brainbytes.bpmgicl.mongodb.net/brainbytes_test?retryWrites=true&w=majority&appName=BrainBytes';

describe('Database Persistence Tests', () => {
  // Skip all tests in this suite if SKIP_DOCKER_TESTS is set
  beforeAll(() => {
    if (shouldSkipAtlasTests) {
      console.log(
        'Skipping Atlas persistence tests due to SKIP_DOCKER_TESTS=true'
      );
    }
  });
  // Unique test data identifiers
  const testId = `test-${Date.now()}`;
  const testUserId = '6123456789abcdef12345678'; // Test user ID

  // Connect to Atlas test database
  beforeAll(async () => {
    if (shouldSkipAtlasTests) {
      console.log(
        'Skipping Atlas connection setup due to SKIP_DOCKER_TESTS=true'
      );
      return;
    }

    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(TEST_DATABASE_URL, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for Atlas
    });

    console.log('Connected to Atlas test database for persistence tests');

    // Clean up any previous test data
    await Message.deleteMany({ chatId: { $regex: /^test-/ } });
  });

  afterAll(async () => {
    if (shouldSkipAtlasTests) {
      return;
    }

    // Clean up test data
    await Message.deleteMany({ chatId: { $regex: /^test-/ } });
    await mongoose.connection.close();
  });

  test('Data should persist in Atlas across disconnection/reconnection', async () => {
    if (shouldSkipAtlasTests) {
      console.log(
        'Skipping Atlas persistence test due to SKIP_DOCKER_TESTS=true'
      );
      return;
    }
    // Step 1: Create test data
    const testMessage = new Message({
      text: `Atlas persistence test message ${testId}`,
      chatId: `test-chat-${testId}`,
      userId: testUserId,
      isAiResponse: false,
      createdAt: new Date(),
    });

    await testMessage.save();
    console.log(`Test message created with ID: ${testMessage._id}`);

    // Verify data was saved
    const savedMessage = await Message.findById(testMessage._id);
    expect(savedMessage).toBeTruthy();
    expect(savedMessage.text).toEqual(testMessage.text);

    // Step 2: Disconnect and reconnect to Atlas to simulate connection reset
    console.log('Disconnecting from Atlas...');
    await mongoose.connection.close();

    console.log('Reconnecting to Atlas...');
    await mongoose.connect(TEST_DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    // Step 3: Verify data still exists after reconnection
    const retrievedMessage = await Message.findById(testMessage._id);
    expect(retrievedMessage).toBeTruthy();
    expect(retrievedMessage.text).toEqual(testMessage.text);
    expect(retrievedMessage.chatId).toEqual(testMessage.chatId);
    expect(retrievedMessage.userId).toEqual(testMessage.userId);

    console.log(
      'Successfully verified data persistence across Atlas reconnection'
    );
  });

  test('Atlas should handle multiple records with persistence', async () => {
    if (shouldSkipAtlasTests) {
      console.log(
        'Skipping Atlas multiple records test due to SKIP_DOCKER_TESTS=true'
      );
      return;
    }
    // Create multiple test messages
    const chatId = `test-chat-multi-${testId}`;
    const messageCount = 5;
    const messages = [];

    for (let i = 0; i < messageCount; i++) {
      messages.push({
        text: `Multi-persistence test message ${i} for ${testId}`,
        chatId,
        userId: testUserId,
        isAiResponse: i % 2 === 0, // Alternate between user and AI messages
        createdAt: new Date(Date.now() + i * 1000), // Stagger timestamps
      });
    }

    // Save all messages
    const savedMessages = await Message.insertMany(messages);
    console.log(`${messageCount} test messages created in Atlas`);

    // Verify messages were saved
    const initialMessages = await Message.find({ chatId }).sort({
      createdAt: 1,
    });
    expect(initialMessages.length).toEqual(messageCount);

    // Test Atlas transaction and rollback capabilities
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Add another message in transaction
        const transactionMessage = new Message({
          text: `Transaction test message for ${testId}`,
          chatId,
          userId: testUserId,
          isAiResponse: false,
          createdAt: new Date(),
        });
        await transactionMessage.save({ session });

        // Verify transaction message exists within transaction
        const transactionMessages = await Message.find({ chatId }).session(
          session
        );
        expect(transactionMessages.length).toEqual(messageCount + 1);
      });
    } finally {
      await session.endSession();
    }

    // Verify transaction was committed
    const finalMessages = await Message.find({ chatId }).sort({ createdAt: 1 });
    expect(finalMessages.length).toEqual(messageCount + 1);

    // Disconnect and reconnect to test persistence across connections
    await mongoose.connection.close();
    await mongoose.connect(TEST_DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    // Verify all messages still exist after reconnection
    const retrievedMessages = await Message.find({ chatId }).sort({
      createdAt: 1,
    });
    expect(retrievedMessages.length).toEqual(messageCount + 1);

    // Separate original messages from transaction message
    const originalMessages = retrievedMessages.filter(msg =>
      msg.text.includes('Multi-persistence test message')
    );
    const transactionMessages = retrievedMessages.filter(msg =>
      msg.text.includes('Transaction test message')
    );

    expect(originalMessages.length).toEqual(messageCount);
    expect(transactionMessages.length).toEqual(1);

    // Check each original message's content
    for (let i = 0; i < messageCount; i++) {
      expect(originalMessages[i].text).toEqual(messages[i].text);
      expect(originalMessages[i].isAiResponse).toEqual(
        messages[i].isAiResponse
      );
    }

    // Check transaction message
    expect(transactionMessages[0].text).toContain('Transaction test message');

    console.log(
      'Successfully verified multi-message persistence and transactions in Atlas'
    );
  });

  test('Atlas should handle concurrent operations correctly', async () => {
    if (shouldSkipAtlasTests) {
      console.log(
        'Skipping Atlas concurrent operations test due to SKIP_DOCKER_TESTS=true'
      );
      return;
    }
    const concurrentChatId = `test-concurrent-${testId}`;
    const operationCount = 10;

    // Create concurrent write operations
    const writePromises = [];
    for (let i = 0; i < operationCount; i++) {
      writePromises.push(
        Message.create({
          text: `Concurrent message ${i} for ${testId}`,
          chatId: concurrentChatId,
          userId: testUserId,
          isAiResponse: i % 3 === 0,
          createdAt: new Date(Date.now() + i * 100),
        })
      );
    }

    // Execute all writes concurrently
    const results = await Promise.all(writePromises);
    expect(results.length).toEqual(operationCount);

    // Verify all messages were saved correctly
    const concurrentMessages = await Message.find({
      chatId: concurrentChatId,
    }).sort({ createdAt: 1 });
    expect(concurrentMessages.length).toEqual(operationCount);

    // Test concurrent reads
    const readPromises = [];
    for (let i = 0; i < 5; i++) {
      readPromises.push(Message.find({ chatId: concurrentChatId }));
    }

    const readResults = await Promise.all(readPromises);
    readResults.forEach(result => {
      expect(result.length).toEqual(operationCount);
    });

    console.log('Successfully verified concurrent operations in Atlas');
  });
});
