const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const authRouter = require('../../routes/auth');
const Auth = require('../../models/auth');
const UserProfile = require('../../models/userProfile');
const { generateTestToken } = require('../setup');

// Set environment variables required for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Create an Express app for testing
const testApp = express();
testApp.use(express.json());
testApp.use('/api/auth', authRouter);

// Import db-handler for MongoDB testing
const dbHandler = require('../helpers/db-handler');

// Setup and teardown for tests
beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

// Test suite for Auth API
describe('Authentication API', () => {
  // Test registration endpoint
  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      jest.setTimeout(10000); // Increase timeout for this test
      const userData = {
        email: 'test@example.com',
        password: 'Test123!@#'
      };

      const response = await request(testApp)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);
      
      // Check status and properties
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      
      // Verify user was created in the database
      const user = await Auth.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
      
      // Verify user profile was created
      const userProfile = await UserProfile.findById(user.userProfile);
      expect(userProfile).toBeTruthy();
      expect(userProfile.email).toBe(userData.email);
    });

    test('should return 400 if email is already registered', async () => {
      // Create a user first
      const userProfile = new UserProfile({
        email: 'existing@example.com',
        name: 'existing'
      });
      await userProfile.save();
      
      const existingAuth = new Auth({
        email: 'existing@example.com',
        password: 'Existing123!@#',
        userProfile: userProfile._id
      });
      await existingAuth.save();
      
      // Try to register with the same email
      const userData = {
        email: 'existing@example.com',
        password: 'Test123!@#'
      };
      
      const response = await request(testApp)
        .post('/api/auth/register')
        .send(userData)
        .expect('Content-Type', /json/);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Email already registered');
    });
    
    test('should return 400 if email format is invalid', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test123!@#'
      };
      
      const response = await request(testApp)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email format');
    });
    
    test('should return 400 if password does not meet requirements', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak'
      };
      
      const response = await request(testApp)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Password does not meet requirements');
    });
  });

  // Test login endpoint
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const userProfile = new UserProfile({
        email: 'login@example.com',
        name: 'login'
      });
      await userProfile.save();
      
      const auth = new Auth({
        email: 'login@example.com',
        password: 'Login123!@#',
        userProfile: userProfile._id
      });
      await auth.save();
    });
    
    test('should log in a user with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Login123!@#'
      };
      
      const response = await request(testApp)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Login successful');
    });
    
    test('should return 401 if email is not registered', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Login123!@#'
      };
      
      const response = await request(testApp)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    test('should return 401 if password is incorrect', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!@#'
      };
      
      const response = await request(testApp)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  // Test logout endpoint
  describe('POST /api/auth/logout', () => {
    test('should log out a user successfully', async () => {
      // Create a new app and set up mock for logout
      const logoutApp = express();
      logoutApp.use(express.json());
      
      // Create a mock logout function
      const mockLogout = jest.fn((callback) => callback());
      
      // Apply mock middleware *before* mounting the router
      logoutApp.use((req, res, next) => {
        req.logout = mockLogout;
        next();
      });
      
      // Use the auth router
      logoutApp.use('/api/auth', authRouter);
      
      // Test the logout endpoint
      const response = await request(logoutApp)
        .post('/api/auth/logout');
      
      // Verify the mock was called and the response is correct
      expect(mockLogout).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
});
