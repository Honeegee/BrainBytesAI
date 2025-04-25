const express = require('express');
const router = express.Router();
const axios = require('axios');
const Message = require('../models/message');

// Get all messages with optional subject filter
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    const query = subject ? { subject } : {};
    const messages = await Message.find(query).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new message and get AI response
router.post('/', async (req, res) => {
  console.log('Received message request:', {
    body: req.body,
    headers: req.headers
  });
  
  try {
    // Save user message with subject
    const userMessage = new Message({
      text: req.body.text,
      subject: req.body.subject || '',
      isAiResponse: false
    });
    await userMessage.save();

    // Generate AI response using OpenRouter Gemini Pro
    try {
      // Prepare AI prompt with context
      const prompt = req.body.subject 
        ? `As a tutor, help the student with this ${req.body.subject} question: ${req.body.text}\nProvide a clear and educational response.`
        : `As a tutor, help the student with this question: ${req.body.text}\nProvide a clear and educational response.`;

      console.log('Sending request to OpenRouter API with prompt:', prompt);

      // Call OpenRouter API
      const aiRequestData = {
        model: 'nousresearch/nous-hermes-llama2-13b',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational tutor.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      console.log('AI Request Data:', JSON.stringify(aiRequestData, null, 2));

      let response;
      let retries = 3;
      
      while (retries > 0) {
        try {
          response = await axios.post('https://openrouter.ai/api/v1/chat/completions', 
            aiRequestData,
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.OPENROUTER_REFERRER,
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 second timeout
            }
          );
          break; // Success, exit loop
        } catch (error) {
          retries--;
          console.log(`API request failed. Retries left: ${retries}`);
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }

      // Verify AI response
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid AI response format');
      }

      // Save AI response with same subject
      const aiMessage = new Message({
        text: response.data.choices[0].message.content,
        subject: req.body.subject || '',
        isAiResponse: true
      });

      console.log('Received AI response:', response.data);
      console.log('Processed AI Response:', aiMessage.text);
      await aiMessage.save();

      // Return both messages
      res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (aiError) {
      console.error('AI Error:', aiError.response?.data || aiError.message);
      console.error('Full error object:', aiError);
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

module.exports = router;
