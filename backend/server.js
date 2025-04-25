const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const messagesRouter = require('./routes/messages');
const userProfilesRouter = require('./routes/userProfiles');
const learningMaterialsRouter = require('./routes/learningMaterials');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add options handling for preflight requests
app.options('*', cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/brainbytes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
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
app.use('/api/messages', messagesRouter);
app.use('/api/users', userProfilesRouter);
app.use('/api/materials', learningMaterialsRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
