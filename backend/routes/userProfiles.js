const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile');

// Create a new user profile
router.post('/', async (req, res) => {
  try {
    const userProfile = new UserProfile(req.body);
    await userProfile.save();
    res.status(201).json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all user profiles
router.get('/', async (req, res) => {
  try {
    const userProfiles = await UserProfile.find();
    res.json(userProfiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user profile
router.get('/:id', async (req, res) => {
  try {
    const userProfile = await UserProfile.findById(req.params.id);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user profile
router.put('/:id', async (req, res) => {
  try {
    const userProfile = await UserProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user profile
router.delete('/:id', async (req, res) => {
  try {
    const userProfile = await UserProfile.findByIdAndDelete(req.params.id);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
