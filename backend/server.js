// Load environment-specific configuration
const envFile =
  process.env.NODE_ENV === 'staging'
    ? '.env.staging'
    : process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env';
require('dotenv').config({ path: envFile });

// External dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

// Internal dependencies
const {
  securityHeaders,
  initializePassport,
} = require('./middleware/security');
const { connectDatabase } = require('./config/database');
const messagesRouter = require('./routes/messages');
const usersRouter = require('./routes/users');
const learningMaterialsRouter = require('./routes/learningMaterials');
const authRouter = require('./routes/auth');

// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads', 'avatars');

// Performance optimizations for MongoDB
mongoose.set('debug', false); // Disable debug mode in production
// Note: Don't disable bufferCommands until after connection is established

// Ensure uploads directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// CORS configuration - Must be first
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3001', // Development
      'http://localhost:3000', // Development backend
    ];
    
    // Allow all brainbytes heroku apps (handles dynamic URLs)
    const isHerokuApp = origin.includes('brainbytes-frontend-production') && origin.includes('.herokuapp.com');
    const isStagingApp = origin.includes('brainbytes-frontend-staging') && origin.includes('.herokuapp.com');
    const isAllowedOrigin = allowedOrigins.includes(origin);
    
    // Add environment-specific frontend URL if provided
    const envFrontendUrl = process.env.FRONTEND_URL;
    const isEnvUrl = envFrontendUrl && origin === envFrontendUrl;
    
    if (isAllowedOrigin || isHerokuApp || isStagingApp || isEnvUrl) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};
app.use(cors(corsOptions));

// Basic middleware setup
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(securityHeaders);

// Session configuration
// Get MongoDB URL for session store (will use same connection as main DB)
const getSessionStoreUrl = () => {
  // Try new environment variables first
  let mongoUrl =
    process.env.PROD_DATABASE_URL ||
    process.env.STAGING_DATABASE_URL ||
    process.env.LOCAL_DATABASE_URL;

  // Fallback to legacy environment variables
  if (!mongoUrl) {
    mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;
  }

  // Final fallback to constructed URL
  if (!mongoUrl) {
    const mongoUser = process.env.STAGING_MONGO_USER || process.env.MONGO_USER;
    const mongoPassword =
      process.env.STAGING_MONGO_PASSWORD || process.env.MONGO_PASSWORD;
    const mongoHost = process.env.MONGO_HOST || 'mongo';
    const mongoPort = process.env.MONGO_PORT || '27017';
    const mongoDb = process.env.MONGO_DB || 'brainbytes_staging';

    if (mongoUser && mongoPassword) {
      mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;
    } else {
      mongoUrl = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;
    }
  }

  return mongoUrl;
};

const mongoUrl = getSessionStoreUrl();

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from public directory
app.use('/uploads', express.static('public/uploads'));

// Detect if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Database connection promise for non-test environments
let dbConnectionPromise = Promise.resolve();

if (!isTestEnvironment) {
  dbConnectionPromise = connectDatabase();

  // Handle MongoDB connection events
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
  });
}

// API routes configuration
const apiRoutes = {
  auth: '/api/auth',
  messages: '/api/messages',
  users: '/api/users',
  materials: '/api/materials',
};

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the BrainBytes API',
    endpoints: apiRoutes,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      state: dbStates[dbState] || 'unknown',
      stateCode: dbState,
    },
    port: PORT,
    pid: process.pid,
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  // Redirect to main health endpoint for consistency
  res.redirect('/health');
});

// Routes
app.use(apiRoutes.auth, authRouter);
app.use(apiRoutes.messages, messagesRouter);
app.use(apiRoutes.users, usersRouter);
app.use(apiRoutes.materials, learningMaterialsRouter);

// Error handling middleware
app.use((err, req, res) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl,
    },
  });
});

// Server configuration and startup
const startServer = async () => {
  try {
    // Wait for database connection before starting server
    console.log('Starting server initialization...');

    // Add a timeout to the database connection for CI environments
    const dbTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 30000);
    });

    try {
      await Promise.race([dbConnectionPromise, dbTimeout]);
      console.log('✅ Database connection established');
    } catch (dbError) {
      console.error('⚠️ Database connection failed:', dbError.message);
      if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
        console.log('🔧 Continuing in test/CI mode without database...');
      } else {
        throw dbError;
      }
    }

    // Now it's safe to disable buffering since we have a connection
    if (!isTestEnvironment) {
      mongoose.set('bufferCommands', false);
    }

    const server = await app.listen(PORT);
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API root: http://localhost:${PORT}/`);
    console.log(`📖 API Documentation available at http://localhost:${PORT}`);

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

startServer();
