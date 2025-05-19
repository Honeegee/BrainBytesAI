const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const UserProfile = require('../models/userProfile');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Default 15 minutes
  max: process.env.RATE_LIMIT_MAX || 5, // Default 5 attempts
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

// Passport configuration
const initializePassport = (passport) => {
  // Session serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserProfile.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // JWT Strategy for token-based auth
  const jwtStrategy = new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await UserProfile.findById(payload.userId);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  );

  passport.use(jwtStrategy);

};

// Authentication middleware - supports both session and JWT
const authenticate = (req, res, next) => {
  // Try JWT first
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
      return next();
    }
    // If no JWT, fall back to session
    if (req.isAuthenticated()) {
      return next();
    }
    // No authentication found
    res.status(401).json({ error: 'Authentication required' });
  })(req, res, next);
};

module.exports = {
  authLimiter,
  validateAuthInput,
  securityHeaders,
  validatePassword,
  initializePassport,
  authenticate
};
