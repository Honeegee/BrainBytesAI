const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LearningMaterial = require('../models/learningMaterial');
const upload = require('../middleware/fileUpload');
const fs = require('fs');
const path = require('path');

// Download a learning material
router.get('/download/:id', async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Learning material not found' });
    }

    // If it's a file, send the file for download
    if (material.content.startsWith('uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', material.content);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      return res.download(filePath);
    }

    // If it's text content, send as a text file
    const fileName = `${material.topic.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(material.content);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Create a new learning material with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Parse tags if they exist
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    // Create learning material with properly processed data
    const learningMaterial = new LearningMaterial({
      subject: req.body.subject,
      topic: req.body.topic,
      resourceType: req.body.resourceType,
      difficulty: req.body.difficulty,
      tags: tags,
      content: req.file ? `uploads/materials/${req.file.filename}` : (req.body.content || '')
    });
    await learningMaterial.save();
    res.status(201).json(learningMaterial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all learning materials with pagination, filters, and field selection
router.get('/', async (req, res) => {
  try {
    const { 
      subject, 
      topic, 
      resourceType, 
      difficulty, 
      tags,
      page = 1,
      limit = 10,
      fields
    } = req.query;

    const query = {};
    const options = {
      lean: true, // Return plain objects instead of Mongoose documents
      select: fields ? fields.split(',').join(' ') : '',
      limit: Math.min(parseInt(limit), 50), // Cap at 50 items per page
      skip: (Math.max(1, parseInt(page)) - 1) * parseInt(limit),
      sort: { createdAt: -1 }
    };

    // Add filters if they exist
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (req.query.subjects) {
      const subjectList = req.query.subjects.split(',');
      query.subject = { $in: subjectList };
    }
    if (topic) query.topic = { $regex: topic, $options: 'i' };
    if (resourceType) query.resourceType = resourceType;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };
    if (req.query.search) query.content = { $regex: req.query.search, $options: 'i' };

    // Execute query with pagination
    const [materials, total] = await Promise.all([
      LearningMaterial.find(query, null, options),
      LearningMaterial.countDocuments(query)
    ]);

    // Send paginated response
    res.json({
      materials,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    console.error('Error in subject creation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    } else if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ error: 'Subject already exists' });
    }
    res.status(500).json({ error: 'Internal server error while creating subject' });
  }
});

// Get materials by subject (with pagination)
router.get('/subjects/:subject', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const fields = req.query.fields ? req.query.fields.split(',').join(' ') : '';

    const [materials, total] = await Promise.all([
      LearningMaterial.find(
        { subject: req.params.subject },
        fields,
        {
          lean: true,
          limit,
          skip: (Math.max(1, page) - 1) * limit,
          sort: { createdAt: -1 }
        }
      ),
      LearningMaterial.countDocuments({ subject: req.params.subject })
    ]);

    res.json({
      materials,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in subject creation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    } else if (error.code === 11000) {
      return res.status(400).json({ error: 'Subject already exists' });
    } else if (error.message === 'Database connection is not ready') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    res.status(500).json({ error: 'Internal server error while creating subject' });
  }
});

// Create a new subject
router.post('/subjects', async (req, res) => {
  try {
    // Check MongoDB connection state
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }

    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    // Check if subject already exists
    const existingSubjects = await LearningMaterial.distinct('subject');
    if (existingSubjects.includes(subject)) {
      return res.status(400).json({ error: 'Subject already exists' });
    }

    // Create a placeholder learning material to establish the subject
    const learningMaterial = new LearningMaterial({
      subject,
      topic: 'Introduction',
      content: `Welcome to ${subject}`,
      resourceType: 'definition',
      difficulty: 'beginner'
    });
    await learningMaterial.save();

    res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a subject and all its materials
router.delete('/subjects', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    // Delete all materials for this subject
    await LearningMaterial.deleteMany({ subject });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Get distinct subjects (cached response)
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await LearningMaterial.distinct('subject');
    res.json(subjects);
  } catch (error) {
    console.error('Error in subject creation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error while creating subject' });
  }
});

// Get a specific learning material
router.get('/:id', async (req, res) => {
  try {
    const fields = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    const learningMaterial = await LearningMaterial
      .findById(req.params.id)
      .select(fields)
      .lean();

    if (!learningMaterial) {
      return res.status(404).json({ error: 'Learning material not found' });
    }
    res.json(learningMaterial);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a learning material
router.put('/:id', async (req, res) => {
  try {
    const learningMaterial = await LearningMaterial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true,
        lean: true 
      }
    );
    
    if (!learningMaterial) {
      return res.status(404).json({ error: 'Learning material not found' });
    }
    res.json(learningMaterial);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete a learning material
router.delete('/:id', async (req, res) => {
  try {
    const learningMaterial = await LearningMaterial.findByIdAndDelete(req.params.id);
    if (!learningMaterial) {
      return res.status(404).json({ error: 'Learning material not found' });
    }
    res.json({ message: 'Learning material deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
