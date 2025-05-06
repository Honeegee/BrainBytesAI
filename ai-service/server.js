const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    const openAiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a conversational AI that understands natural dialogue and context. Pay attention to pronouns and references like "it" or "that" in the user\'s messages, and connect them to the previous context. When the user refers back to previous topics, maintain the context of what was being discussed. Keep responses natural but concise, focusing on what the user is actually asking about rather than explaining how to use the chat interface.'
          },
          {
            role: 'user',
            content: conversationHistory ? `${conversationHistory}\n\nUser: ${prompt}\n\nAssistant:` : prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.OPENROUTER_REFERRER || 'https://brainbytes.ai',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!openAiResponse.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from AI service');
    }

    res.json({
      response: openAiResponse.data.choices[0].message.content
    });

  } catch (error) {
    console.error('AI service error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI request'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
