require('dotenv').config();

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
const messagesRouter = require('./routes/messages');
const usersRouter = require('./routes/users');
const learningMaterialsRouter = require('./routes/learningMaterials');
const authRouter = require('./routes/auth');

// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads', 'avatars');

// MongoDB configuration
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true, // Use createIndex instead of ensureIndex
};

// Performance optimizations for MongoDB
mongoose.set('debug', false); // Disable debug mode in production
mongoose.set('bufferCommands', false); // Disable mongoose buffering

// Ensure uploads directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// CORS configuration - Must be first
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
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
// Build MongoDB URL with authentication if credentials are provided
let mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL;

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

console.log(
  'MongoDB URL configured:',
  mongoUrl.replace(/\/\/.*@/, '//***:***@')
); // Hide credentials in logs

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

// Connect to MongoDB with optimized settings - skip if in test environment
if (!isTestEnvironment) {
  mongoose
    .connect(mongoUrl, mongoConfig)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1); // Exit if DB connection fails
    });
}

// Handle MongoDB connection events - skip if in test environment
if (!isTestEnvironment) {
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
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Routes
app.use(apiRoutes.auth, authRouter);
app.use(apiRoutes.messages, messagesRouter);
app.use(apiRoutes.users, usersRouter);
app.use(apiRoutes.materials, learningMaterialsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
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
    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
