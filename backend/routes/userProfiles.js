const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const UserProfile = require('../models/userProfile');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/avatars');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
}).single('avatar');

// Create a new user profile
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const profileData = { ...req.body };
      
      // Handle preferredSubjects array
      const subjects = [];
      for (let key in req.body) {
        if (key.startsWith('preferredSubjects[')) {
          subjects.push(req.body[key]);
        }
      }
      if (subjects.length > 0) {
        profileData.preferredSubjects = subjects;
      }

      if (req.file) {
        profileData.avatar = `/uploads/avatars/${req.file.filename}`;
      } else if (req.body.removeAvatar === 'true') {
        profileData.avatar = '';
      }

      const userProfile = new UserProfile(profileData);
      await userProfile.save();
      res.status(201).json(userProfile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
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
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ error: 'Invalid user ID provided' });
    }
    
    const userProfile = await UserProfile.findById(req.params.id);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a user profile
router.put('/:id', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const updateData = { ...req.body };
      
      // Handle preferredSubjects array
      const subjects = [];
      for (let key in req.body) {
        if (key.startsWith('preferredSubjects[')) {
          subjects.push(req.body[key]);
        }
      }
      if (subjects.length > 0) {
        updateData.preferredSubjects = subjects;
      }

      if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      } else if (req.body.removeAvatar === 'true') {
        updateData.avatar = '';
      }

      const userProfile = await UserProfile.findByIdAndUpdate(
        req.params.id,
        updateData,
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
