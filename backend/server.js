require('dotenv').config();

// External dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

// Internal dependencies
const { securityHeaders } = require('./middleware/security');
const messagesRouter = require('./routes/messages');
const userProfilesRouter = require('./routes/userProfiles');
const learningMaterialsRouter = require('./routes/learningMaterials');
const authRouter = require('./routes/auth');

// Constants
const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads', 'avatars');

// MongoDB configuration
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Performance optimizations for MongoDB
mongoose.set('debug', false); // Disable debug mode in production
mongoose.set('bufferCommands', false); // Disable mongoose buffering

// Ensure uploads directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Basic middleware setup
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Enable pre-flight for all routes
app.options('*', cors());

// Serve static files from public directory
app.use('/uploads', express.static('public/uploads'));

// Connect to MongoDB with optimized settings
mongoose.connect(process.env.MONGODB_URI, mongoConfig)
  .then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1); // Exit if DB connection fails
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

// API routes configuration
const apiRoutes = {
  auth: '/api/auth',
  messages: '/api/messages',
  users: '/api/users',
  materials: '/api/materials'
};

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the BrainBytes API',
    endpoints: apiRoutes
  });
});

// Routes
app.use(apiRoutes.auth, authRouter);
app.use(apiRoutes.messages, messagesRouter);
app.use(apiRoutes.users, userProfilesRouter);
app.use(apiRoutes.materials, learningMaterialsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
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
