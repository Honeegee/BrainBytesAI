const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { checkCommonResponse } = require('./commonResponses');
const { callAI, getProvidersStatus } = require('./aiProviders');
const {
  register,
  collectAiMetrics,
  recordAiResponse,
  recordAiError,
  recordSubjectRequest,
} = require('./metrics');
require('dotenv').config();

// Normalize prompt by cleaning and standardizing input
const normalizePrompt = input => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/['']/g, "'") // Normalize smart quotes
    .replace(/[""]/g, '"'); // Normalize smart double quotes
};

// Handle basic math expressions
const handleMathExpression = input => {
  if (typeof input !== 'string') {
    return input;
  }

  const mathPattern = /^(\d+)\s*([+\-*/])\s*(\d+)$/;
  const match = input.match(mathPattern);

  if (!match) {
    return input;
  }

  const [, num1, operator, num2] = match;
  try {
    // Use Function instead of eval for safer execution
    const result = new Function('return ' + num1 + operator + num2)();
    return `${input} = ${result}`;
  } catch (error) {
    console.error('Math expression evaluation error:', error);
    return input;
  }
};

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Prometheus metrics collection middleware
app.use(collectAiMetrics);

app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;

    const rawQuery =
      typeof prompt === 'string'
        ? prompt
        : typeof prompt === 'object' && prompt.currentQuery
          ? prompt.currentQuery
          : '';

    const query = handleMathExpression(normalizePrompt(rawQuery));
    const subject =
      typeof prompt === 'object' ? prompt.learningContext?.subject : null;

    console.log('Normalized query:', query);

    // Check for common, predefined responses
    const commonResponse = checkCommonResponse(query, subject);
    if (commonResponse?.found) {
      // Record metrics for predefined response
      recordAiResponse(commonResponse.response, 'predefined', subject);
      recordSubjectRequest(subject || 'general', 'unknown');

      return res.json({
        response: commonResponse.response,
        metadata: {
          source: 'predefined',
          complexity: commonResponse.complexity,
        },
      });
    }

    // Ensure API key is present
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key is missing in environment variables.');
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI tutor. Respond in a clear, student-friendly manner. Structure your answers with:
1. Brief acknowledgment
2. Clear explanation with examples
3. Practical applications
4. Invitation for follow-up questions

Keep responses concise, avoid jargon, and use examples when helpful.`,
      },
      {
        role: 'user',
        content: (() => {
          // Limit conversation history to prevent token overflow
          const maxHistoryLength = 1000;
          let limitedHistory = conversationHistory;

          if (
            conversationHistory &&
            conversationHistory.length > maxHistoryLength
          ) {
            limitedHistory =
              '...' + conversationHistory.slice(-maxHistoryLength);
          }

          const commonAffirmatives = [
            'yes',
            'yeah',
            'yep',
            'sure',
            'ok',
            'okay',
            'alright',
          ];
          const commonNegatives = ['no', 'nope', 'nah'];
          const lowerRawQuery = rawQuery.toLowerCase().trim();

          if (
            limitedHistory &&
            (commonAffirmatives.includes(lowerRawQuery) ||
              commonNegatives.includes(lowerRawQuery))
          ) {
            return `Context: ${limitedHistory}\n\nUser: "${rawQuery}"\n\nContinue the conversation appropriately.`;
          }

          return limitedHistory
            ? `Context: ${limitedHistory}\n\nQuery: ${prompt}`
            : `Query: ${prompt}`;
        })(),
      },
    ];

    // Call AI using the new provider system
    const aiResult = await callAI(messages, {
      subject: subject || 'general',
    });

    const rawResponse = aiResult?.choices?.[0]?.message?.content;

    if (!rawResponse) {
      throw new Error('Received an invalid response from the AI service.');
    }

    // Minimal cleaning - removed formatting logic that's now in the frontend
    const cleanResponse = text => {
      if (typeof text !== 'string') {
        return '';
      }
      return text
        .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove think tags
        .trim();
    };

    const finalResponse = cleanResponse(rawResponse);

    // Record metrics for AI response
    recordAiResponse(finalResponse, aiResult.model || 'unknown', subject);
    recordSubjectRequest(subject || 'general', 'unknown');

    res.json({
      response: finalResponse,
      metadata: {
        model: aiResult.model || 'unknown',
        provider: aiResult.provider || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error.message);

    // Record error metrics
    recordAiError(
      error.message.includes('timeout') ? 'timeout' : 'api_error',
      'deepseek-r1-distill-llama-70b'
    );

    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  const providersStatus = getProvidersStatus();
  const hasAnyProvider = Object.values(providersStatus).some(
    p => p.enabled && p.configured
  );

  res.json({
    status: 'healthy',
    aiProviders: providersStatus,
    hasConfiguredProvider: hasAnyProvider,
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

// New endpoint to check AI providers status
app.get('/api/providers', (req, res) => {
  const providersStatus = getProvidersStatus();
  res.json({
    providers: providersStatus,
    recommendations: {
      development: 'Use Ollama (free, local) or Mock AI for development',
      staging: 'Use Groq (free tier) or OpenAI',
      production: 'Use OpenAI or Anthropic for best reliability',
    },
  });
});

app.get('/api/test', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'GROQ_API_KEY not configured',
        configured: false,
      });
    }

    // Test API connection with a simple request
    await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'deepseek-r1-distill-llama-70b',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    res.json({
      status: 'API connection successful',
      configured: true,
      model: 'deepseek-r1-distill-llama-70b',
    });
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'API connection failed',
      configured: !!process.env.GROQ_API_KEY,
      details: error.response?.data?.error || error.message,
    });
  }
});

// Add root route to provide service information
app.get('/', (req, res) => {
  res.json({
    service: 'BrainBytes AI Service',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      test: '/api/test',
    },
    message: 'AI service is running. Use /api/chat for chat functionality.',
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});


app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
