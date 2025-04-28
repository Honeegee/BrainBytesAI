const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { securityHeaders } = require('./middleware/security');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads', 'avatars');
fs.mkdirSync(uploadDir, { recursive: true });

// Import routes
const messagesRouter = require('./routes/messages');
const userProfilesRouter = require('./routes/userProfiles');
const learningMaterialsRouter = require('./routes/learningMaterials');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Performance optimizations for MongoDB
mongoose.set('debug', false); // Disable debug mode in production
mongoose.set('bufferCommands', false); // Disable mongoose buffering

// Middleware
// Security middleware
app.use(securityHeaders);
app.use(cookieParser());

// CORS configuration
// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Enable pre-flight for all routes
app.options('*', cors());

// Serve static files from public directory
app.use('/uploads', express.static('public/uploads'));

app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Handle URL-encoded bodies

// Add response compression
const compression = require('compression');
app.use(compression());

// Connect to MongoDB with optimized settings
mongoose.connect('mongodb://mongo:27017/brainbytes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
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

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the BrainBytes API',
    endpoints: {
      messages: '/api/messages',
      userProfiles: '/api/users',
      learningMaterials: '/api/materials'
    }
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', userProfilesRouter);
app.use('/api/materials', learningMaterialsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
