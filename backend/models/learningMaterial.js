const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['definition', 'explanation', 'example', 'practice'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for efficient sorting
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
learningMaterialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create compound indexes for efficient querying
learningMaterialSchema.index({ subject: 1, topic: 1 });
learningMaterialSchema.index({ tags: 1 });
learningMaterialSchema.index({ resourceType: 1, difficulty: 1 });

// Add index hints for common queries
learningMaterialSchema.statics.findBySubject = function(subject) {
  return this.find({ subject }).hint({ subject: 1, topic: 1 });
};

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);
