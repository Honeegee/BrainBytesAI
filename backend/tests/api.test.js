const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const express = require('express');
const Message = require('../models/message');
const UserProfile = require('../models/userProfile');
const { generateTestToken } = require('./setup');

// Create a minimal Express app for testing
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const messagesRouter = require('../routes/messages');
const usersRouter = require('../routes/users');
const { securityHeaders, authenticate } = require('../middleware/security');

// Mock authentication for tests
jest.mock('../middleware/security', () => ({
  securityHeaders: (req, res, next) => next(),
  authenticate: (req, res, next) => {
    req.user = {
      _id: '6123456789abcdef12345678',
      email: 'test@example.com',
    };
    next();
  },
  initializePassport: jest.fn()
}));

// Basic middleware
app.use(cors());
app.use(bodyParser.json());
app.use(securityHeaders);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Register routes
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Define test variables
let mongoServer;
const testUser = {
  _id: '6123456789abcdef12345678',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'test-hash'
};

// Setup and teardown
beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

  // Create test user
  await UserProfile.create(testUser);
});

afterAll(async () => {
  // Clean up and close connections
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear test data before each test
  await Message.deleteMany({});
});

// Tests
describe('API Endpoints', () => {
  // Health endpoint test
  test('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('mongodb');
  });

  // Root endpoint test
  test('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to the BrainBytes API');
  });

  // Chat endpoints tests
  describe('Chat Endpoints', () => {
    const testChatId = 'test-chat-123';
    
    // Test creating a message
    test('POST /api/messages should create a new message', async () => {
      // Mock the AI service response
      jest.spyOn(global, 'fetch').mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'AI response text' })
        })
      );
      
      const messageData = {
        text: 'Hello AI',
        chatId: testChatId,
        subject: 'General'
      };
      
      // We'll need to handle the AI response part differently, mocking the external service
      // For now, this test may fail but it demonstrates the approach
      const res = await request(app)
        .post('/api/messages')
        .send(messageData);
      
      // Even if the AI part fails, the endpoint should create the user message
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('userMessage');
      expect(res.body.userMessage).toHaveProperty('text', 'Hello AI');
      expect(res.body.userMessage).toHaveProperty('chatId', testChatId);
      
      global.fetch.mockRestore();
    });

    // Test fetching chat history
    test('GET /api/messages/chats should return chat history', async () => {
      // Create some test messages
      await Message.create([
        {
          text: 'First message',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: false
        },
        {
          text: 'AI response',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: true
        }
      ]);
      
      const res = await request(app).get('/api/messages/chats');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id', testChatId);
    });
    
    // Test fetching messages for a specific chat
    test('GET /api/messages should return messages for a chat', async () => {
      // Create some test messages
      await Message.create([
        {
          text: 'Message 1',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: false
        },
        {
          text: 'AI response 1',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: true
        }
      ]);
      
      const res = await request(app)
        .get('/api/messages')
        .query({ chatId: testChatId });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('messages');
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(res.body.messages.length).toBe(2);
    });
    
    // Test deleting a chat
    test('DELETE /api/messages/chats/:chatId should delete all messages in a chat', async () => {
      // Create some test messages
      await Message.create([
        {
          text: 'Delete me',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: false
        },
        {
          text: 'Delete me too',
          chatId: testChatId,
          userId: testUser._id,
          isAiResponse: true
        }
      ]);
      
      const res = await request(app)
        .delete(`/api/messages/chats/${testChatId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      
      // Verify the messages are gone
      const count = await Message.countDocuments({ chatId: testChatId });
      expect(count).toBe(0);
    });
  });
});
