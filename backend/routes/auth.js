const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');
const UserProfile = require('../models/userProfile');
const { authLimiter, validateAuthInput } = require('../middleware/security');

// Register new user
router.post('/register', validateAuthInput, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Check if user already exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email already registered',
        errors: {
          email: 'This email address is already in use'
        }
      });
    }

    // Create user profile first
    const userProfile = new UserProfile({
      email,
      name: email.split('@')[0] // Use part of email as temporary name
    });
    await userProfile.save();

    // Create auth record
    const auth = new Auth({
      email,
      password,
      userProfile: userProfile._id
    });
    await auth.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userProfile._id, 
        email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        algorithm: 'HS256'
      }
    );

    // Set secure cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days if remember me, else 24 hours
    });

    res.status(201).json({
      token,
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: userProfile._id,
        email: userProfile.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      errors: {
        server: 'An unexpected error occurred. Please try again later.'
      }
    });
  }
});

// Login user
router.post('/login', authLimiter, validateAuthInput, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find auth record
    const auth = await Auth.findOne({ email }).populate('userProfile');
    if (!auth) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        errors: {
          auth: 'Email or password is incorrect'
        }
      });
    }

    // Verify password
    const isValidPassword = await auth.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        errors: {
          auth: 'Email or password is incorrect'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: auth.userProfile._id, 
        email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        algorithm: 'HS256'
      }
    );

    // Set secure cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days if remember me, else 24 hours
    });

    res.json({
      token, // Include token in response for local storage
      status: 'success',
      message: 'Login successful',
      data: {
        userId: auth.userProfile._id,
        email: auth.userProfile.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      errors: {
        server: 'An unexpected error occurred. Please try again later.'
      }
    });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

module.exports = router;
