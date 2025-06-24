const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('../middleware/security');
const { avatarUpload } = require('../middleware/fileUpload');
const Message = require('../models/message');
const LearningMaterial = require('../models/learningMaterial');
const UserProfile = require('../models/userProfile');

// Apply authentication to all routes
router.use(authenticate);

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    // Only allow users to access their own profile
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const profile = await UserProfile.findById(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity
router.get('/:userId/activity', async (req, res) => {
  try {
    // Only allow users to access their own activity
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get recent messages
    const recentMessages = await Message.find({
      userId: new mongoose.Types.ObjectId(req.user._id),
      isAiResponse: false, // Only show user messages in recent activity
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get user's learning materials grouped by subject
    const learningMaterials = await LearningMaterial.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$subject',
          interactions: { $sum: 1 },
        },
      },
      {
        $project: {
          subject: '$_id',
          interactions: 1,
          level: {
            $cond: {
              if: { $gte: ['$interactions', 30] },
              then: 'Expert',
              else: {
                $cond: {
                  if: { $gte: ['$interactions', 20] },
                  then: 'Advanced',
                  else: {
                    $cond: {
                      if: { $gte: ['$interactions', 10] },
                      then: 'Intermediate',
                      else: 'Beginner',
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // Calculate total stats
    const totalInteractions = learningMaterials.reduce(
      (sum, subject) => sum + subject.interactions,
      0
    );
    const activeSubjects = learningMaterials.length;

    res.json({
      recentActivity: {
        messages: recentMessages,
      },
      progress: learningMaterials,
      stats: {
        totalInteractions,
        activeSubjects,
      },
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', avatarUpload.single('avatar'), async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      // Get current user profile to check for existing avatar
      const currentProfile = await UserProfile.findById(req.params.userId);
      if (currentProfile && currentProfile.avatar) {
        // Delete old avatar file if it exists
        try {
          await fs.unlink(path.join(process.cwd(), currentProfile.avatar));
        } catch (err) {
          console.error('Error deleting old avatar:', err);
          // Continue with update even if delete fails
        }
      }

      // Update with new avatar path
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Handle arrays (like preferredSubjects) that come as form data
    if (req.body.preferredSubjects) {
      try {
        // Parse if it's a string
        const subjects =
          typeof req.body.preferredSubjects === 'string'
            ? JSON.parse(req.body.preferredSubjects)
            : req.body.preferredSubjects;
        updateData.preferredSubjects = subjects;
      } catch (e) {
        console.error('Error parsing preferredSubjects:', e);
      }
    }

    updateData.updatedAt = new Date();

    const updatedProfile = await UserProfile.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
