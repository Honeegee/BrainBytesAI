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

// Get all learning materials with optional filters
router.get('/', async (req, res) => {
  try {
    const { subject, topic, resourceType, difficulty, tags } = req.query;
    const query = {};

    // Add filters if they exist
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (resourceType) query.resourceType = resourceType;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };

    const learningMaterials = await LearningMaterial.find(query);
    res.json(learningMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get materials by subject
router.get('/subjects/:subject', async (req, res) => {
  try {
    const materials = await LearningMaterial.find({ 
      subject: req.params.subject 
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get distinct subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await LearningMaterial.distinct('subject');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific learning material
router.get('/:id', async (req, res) => {
  try {
    const learningMaterial = await LearningMaterial.findById(req.params.id);
    if (!learningMaterial) {
      return res.status(404).json({ error: 'Learning material not found' });
    }
    res.json(learningMaterial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a learning material
router.put('/:id', async (req, res) => {
  try {
    const learningMaterial = await LearningMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!learningMaterial) {
      return res.status(404).json({ error: 'Learning material not found' });
    }
    res.json(learningMaterial);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
