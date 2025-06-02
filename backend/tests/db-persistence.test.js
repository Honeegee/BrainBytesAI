const mongoose = require('mongoose');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const Message = require('../models/message');
const UserProfile = require('../models/userProfile');

// This test verifies that data persists in MongoDB across container restarts
// Note: This test requires Docker to be running and the database container to be up

// Connection URI from environment or use default
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/brainbytes';

// Helper to restart the MongoDB container
async function restartMongoContainer() {
  try {
    console.log('Finding MongoDB container...');
    const { stdout: containerId } = await execPromise(
      'docker ps -q --filter "name=mongodb"'
    );

    if (!containerId.trim()) {
      throw new Error(
        'MongoDB container not found. Make sure it is running with a name containing "mongodb"'
      );
    }

    console.log(`Restarting MongoDB container ${containerId.trim()}...`);
    await execPromise(`docker restart ${containerId.trim()}`);

    // Wait for MongoDB to restart (adjust timing as needed)
    console.log('Waiting for MongoDB to restart...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    return true;
  } catch (error) {
    console.error('Error restarting MongoDB container:', error);
    return false;
  }
}

describe('Database Persistence Tests', () => {
  // Unique test data identifiers
  const testId = `test-${Date.now()}`;
  const testUserId = '6123456789abcdef12345678'; // Must match a user ID in your DB or create one

  // Connect to the actual database (not in-memory)
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });

    // Clean up any previous test data
    await Message.deleteMany({ chatId: { $regex: /^test-/ } });
  });

  afterAll(async () => {
    // Clean up test data
    await Message.deleteMany({ chatId: { $regex: /^test-/ } });
    await mongoose.connection.close();
  });

  test('Data should persist across MongoDB container restarts', async () => {
    // Skip test if not running in Docker environment
    if (process.env.SKIP_DOCKER_TESTS) {
      console.log('Skipping Docker-dependent test');
      return;
    }

    // Step 1: Create test data
    const testMessage = new Message({
      text: `Persistence test message ${testId}`,
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

    // Step 2: Restart MongoDB container
    console.log('Restarting MongoDB container...');
    const restarted = await restartMongoContainer();

    // Skip the rest of the test if container restart failed
    if (!restarted) {
      console.warn('Container restart failed, skipping verification');
      return;
    }

    // Step 3: Reconnect to MongoDB after restart
    try {
      await mongoose.connection.close();
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 10000, // Longer timeout after restart
      });
    } catch (error) {
      console.error('Failed to reconnect to MongoDB after restart:', error);
      throw error;
    }

    // Step 4: Verify data still exists after restart
    const retrievedMessage = await Message.findById(testMessage._id);
    expect(retrievedMessage).toBeTruthy();
    expect(retrievedMessage.text).toEqual(testMessage.text);
    console.log(
      'Successfully verified data persistence across container restart'
    );
  });

  test('MongoDB should handle multiple records with persistence', async () => {
    // Skip test if not running in Docker environment
    if (process.env.SKIP_DOCKER_TESTS) {
      console.log('Skipping Docker-dependent test');
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
    await Message.insertMany(messages);
    console.log(`${messageCount} test messages created`);

    // Verify messages were saved
    const savedMessages = await Message.find({ chatId }).sort({ createdAt: 1 });
    expect(savedMessages.length).toEqual(messageCount);

    // Restart MongoDB container
    const restarted = await restartMongoContainer();
    if (!restarted) {
      console.warn('Container restart failed, skipping verification');
      return;
    }

    // Reconnect to MongoDB after restart
    try {
      await mongoose.connection.close();
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 10000,
      });
    } catch (error) {
      console.error('Failed to reconnect to MongoDB after restart:', error);
      throw error;
    }

    // Verify all messages still exist after restart
    const retrievedMessages = await Message.find({ chatId }).sort({
      createdAt: 1,
    });
    expect(retrievedMessages.length).toEqual(messageCount);

    // Check each message's content
    for (let i = 0; i < messageCount; i++) {
      expect(retrievedMessages[i].text).toEqual(messages[i].text);
      expect(retrievedMessages[i].isAiResponse).toEqual(
        messages[i].isAiResponse
      );
    }

    console.log('Successfully verified multi-message persistence');
  });
});
