const express = require('express');
const router = express.Router();
const axios = require('axios');
const Sentiment = require('sentiment');
const Message = require('../models/message');
const LearningMaterial = require('../models/learningMaterial');
const { authenticate } = require('../middleware/security');
const mongoose = require('mongoose');

const sentiment = new Sentiment();

// Apply authentication middleware to all routes
router.use(authenticate);

// Helper function to get sentiment label from score
const getSentimentLabel = score => {
  if (score < -0.1) {
    return 'negative';
  }
  if (score > 0.1) {
    return 'positive';
  }
  return 'neutral';
};

// Update chat title
router.put('/chats/:chatId/title', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Update the first message of the chat to set its title
    const firstMessage = await Message.findOne({ chatId }).sort({
      createdAt: 1,
    });
    if (!firstMessage) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    firstMessage.text = title;
    await firstMessage.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating chat title:', err);
    res.status(500).json({ error: 'Failed to update chat title' });
  }
});

// Delete a chat and all its messages for the current user
router.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Delete all messages for this chat and user
    await Message.deleteMany({ chatId, userId });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Get all chat sessions
router.get('/chats', async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from authenticated user

    // Delete any empty chats or chats with only "New chat" messages
    await Message.deleteMany({
      userId,
      $or: [
        { chatId: null }, // Delete messages with null chatId
        { chatId: 'null' }, // Delete messages with 'null' string chatId
        {
          $and: [{ text: 'New chat' }, { isAiResponse: false }],
        },
      ],
    });

    // Aggregate to get unique chatIds and their first messages
    const chats = await Message.aggregate([
      // Match documents for this user first
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      // Group by chatId to get first message and count of messages
      {
        $group: {
          _id: '$chatId',
          firstMessage: { $first: '$text' },
          messageCount: { $sum: 1 },
          createdAt: { $first: '$createdAt' },
        },
      },
      // Only include chats that have messages
      {
        $match: {
          messageCount: { $gt: 0 },
        },
      },
      // Sort by creation date, newest first
      { $sort: { createdAt: -1 } },
      // Project the fields we want to return
      {
        $project: {
          id: '$_id',
          title: {
            $cond: {
              if: { $gt: [{ $strLenCP: '$firstMessage' }, 30] },
              then: {
                $concat: [{ $substrCP: ['$firstMessage', 0, 30] }, '...'],
              },
              else: '$firstMessage',
            },
          },
          messageCount: 1,
          createdAt: 1,
        },
      },
    ]);

    res.json(chats);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get messages with enhanced filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      subject,
      chatId,
      sentiment,
      messageType,
      page = 1,
      limit = 50,
    } = req.query;
    const userId = req.user._id; // Get userId from authenticated user

    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    // Build query with userId filter
    const query = { chatId, userId };

    // Apply subject filter
    if (subject && subject !== 'All Subjects' && subject !== '') {
      query.subject = subject;
    }

    // Apply sentiment filter
    if (sentiment && sentiment !== '') {
      query['sentiment.label'] = sentiment.toLowerCase();
    }

    // Apply message type filter
    if (messageType && messageType !== '') {
      query.isAiResponse = messageType === 'ai';
    }

    // Get total count for pagination
    const totalMessages = await Message.countDocuments(query);

    // Execute paginated query
    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get unique subjects for this chat and user
    const uniqueSubjects = await Message.distinct('subject', {
      chatId,
      userId,
    });

    res.json({
      messages,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        pages: Math.ceil(totalMessages / limit),
      },
      subjects: uniqueSubjects.filter(s => s), // Filter out empty subjects
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message and get AI response
router.post('/', async (req, res) => {
  let userMessage, aiMessage, openAiResponse;

  try {
    if (!req.body.text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Validate required fields
    if (!req.body.chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    // Analyze sentiment and create the user message
    const sentimentResult = sentiment.analyze(req.body.text);
    const normalizedScore = sentimentResult.comparative; // Get normalized score (-1 to 1)

    const userId = req.user._id; // Get userId from authenticated user

    userMessage = new Message({
      text: req.body.text,
      subject: req.body.subject || '',
      chatId: req.body.chatId,
      userId,
      isAiResponse: false,
      createdAt: new Date(),
      sentiment: {
        score: normalizedScore,
        label: getSentimentLabel(normalizedScore),
      },
    });

    try {
      await userMessage.save();
    } catch (error) {
      console.error('Error saving user message:', error);
      return res.status(500).json({ error: 'Failed to save user message' });
    }

    // Find relevant learning materials
    let relevantMaterial = null;
    if (req.body.subject) {
      const keywords = req.body.text.toLowerCase().split(' ');
      relevantMaterial = await LearningMaterial.findOne({
        subject: req.body.subject,
        $or: [
          { topic: { $regex: keywords.join('|'), $options: 'i' } },
          { content: { $regex: keywords.join('|'), $options: 'i' } },
          { tags: { $in: keywords } },
        ],
      }).lean();
    }

    // Get previous messages for context
    const previousMessages = await Message.find({
      chatId: req.body.chatId,
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(10);

    const conversationHistory = previousMessages
      .map(msg => `${msg.isAiResponse ? 'Assistant' : 'User'}: ${msg.text}`)
      .join('\n');

    // Prepare prompt
    const prompt = relevantMaterial
      ? `${conversationHistory}\n\nUser: ${req.body.text}\n\nReference material: ${relevantMaterial.content}\n\nAssistant:`
      : `${conversationHistory}\n\nUser: ${req.body.text}\n\nAssistant:`;

    // Call AI service with better error handling
    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || 'http://localhost:3002';

      // Check if AI service URL is configured
      if (!aiServiceUrl) {
        throw new Error('AI service URL is not configured');
      }

      openAiResponse = await axios
        .post(
          `${aiServiceUrl}/api/chat`,
          {
            prompt,
            conversationHistory,
          },
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .catch(error => {
          console.error('AI service request failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: aiServiceUrl,
          });
          throw new Error(`AI service connection failed: ${error.message}`);
        });

      if (!openAiResponse?.data?.response) {
        console.error('Invalid AI response format:', openAiResponse?.data);
        throw new Error('Invalid response format from AI service');
      }

      // Analyze sentiment and save AI response
      const aiSentimentResult = sentiment.analyze(openAiResponse.data.response);
      const aiNormalizedScore = aiSentimentResult.comparative;

      aiMessage = new Message({
        text: openAiResponse.data.response,
        subject: req.body.subject || '',
        chatId: req.body.chatId,
        userId,
        isAiResponse: true,
        createdAt: new Date(),
        sentiment: {
          score: aiNormalizedScore,
          label: getSentimentLabel(aiNormalizedScore),
        },
      });
    } catch (error) {
      console.error('AI service error:', error);

      // Provide fallback response when AI service is unavailable
      aiMessage = new Message({
        text: 'I apologize, but the AI service is currently unavailable. Please try again later, or contact support if this issue persists.',
        subject: req.body.subject || '',
        chatId: req.body.chatId,
        userId,
        isAiResponse: true,
        createdAt: new Date(),
        sentiment: {
          score: 0,
          label: 'neutral',
        },
      });
    }
    await aiMessage.save();

    // Return both messages
    res.status(201).json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Send detailed error response
    if (userMessage) {
      return res.status(500).json({
        userMessage,
        error:
          error.message || 'AI response generation failed. Please try again.',
        details: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        },
      });
    }

    // If we couldn't even save the user message
    res.status(500).json({
      error: error.message || 'Failed to process message',
      details: {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      },
    });
  }
});

module.exports = router;
