const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

// Define a simple schema for messages
const messageSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  isAiResponse: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BrainBytes API' });
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message and get AI response
app.post('/api/messages', async (req, res) => {
  try {
    // Save user message
    const userMessage = new Message({
      text: req.body.text,
      isAiResponse: false
    });
    await userMessage.save();

    // Generate AI response using OpenRouter Gemini Pro
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'google/gemini-pro',
        messages: [
          {
            role: 'user',
            content: req.body.text
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'Content-Type': 'application/json'
        }
      });

      // Save AI response
      const aiMessage = new Message({
        text: response.data.choices[0].message.content,
        isAiResponse: true
      });
      await aiMessage.save();

      // Return both messages
      res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (aiError) {
      console.error('AI Error:', aiError);
      // If AI fails, still return user message
      res.status(201).json({
        userMessage,
        error: 'AI response generation failed'
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
