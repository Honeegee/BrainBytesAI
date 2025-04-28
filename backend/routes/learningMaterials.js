const express = require('express');
const router = express.Router();
const LearningMaterial = require('../models/learningMaterial');

// Create a new learning material
router.post('/', async (req, res) => {
  try {
    const learningMaterial = new LearningMaterial(req.body);
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// Get distinct subjects (cached response)
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await LearningMaterial.distinct('subject').lean();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
