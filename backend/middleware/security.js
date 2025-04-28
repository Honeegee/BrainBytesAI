const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for failed attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Password validation
const validatePassword = (password) => {
  if (!password) return false;
  
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Email validation
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Validation middleware
const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required',
      errors: {
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null
      }
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ 
      message: 'Invalid email format',
      errors: {
        email: 'Please enter a valid email address'
      }
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password does not meet requirements',
      errors: {
        password: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters'
      }
    });
  }

  next();
};

// Security headers middleware using helmet
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
});

module.exports = {
  authLimiter,
  validateAuthInput,
  securityHeaders,
  validatePassword
};
