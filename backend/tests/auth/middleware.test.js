const request = require('supertest');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  authenticate,
  initializePassport,
} = require('../../middleware/security');
const UserProfile = require('../../models/userProfile');
const { generateTestToken } = require('../setup');

// Set up a test Express app
const app = express();
app.use(express.json());

// Set environment variables required for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Initialize passport for testing
initializePassport(passport);
app.use(passport.initialize());

// Create a protected test route
app.get('/api/protected', authenticate, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});

// Import db-handler for MongoDB testing
const dbHandler = require('../helpers/db-handler');

// Setup and teardown for tests
beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

// Test suite for Auth Middleware
describe('Authentication Middleware', () => {
  let testUser;
  let testToken;

  beforeEach(async () => {
    // Create a test user for auth tests
    testUser = new UserProfile({
      email: 'middleware@example.com',
      name: 'middleware',
    });
    await testUser.save();

    // Generate a valid JWT token for the test user
    testToken = generateTestToken(testUser._id, testUser.email);
  });

  test('should allow access with a valid JWT token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Access granted');
  });

  test('should deny access with no token', async () => {
    const response = await request(app).get('/api/protected');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Authentication required');
  });

  test('should deny access with an invalid token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Authentication required');
  });

  test('should deny access with an expired token', async () => {
    // Create an expired token (back-dated by 2 hours)
    const expiredToken = jwt.sign(
      {
        userId: testUser._id,
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      },
      process.env.JWT_SECRET
    );

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Authentication required');
  });
});
