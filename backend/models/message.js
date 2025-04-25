const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  subject: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  isAiResponse: { type: Boolean, default: false }
});

// Index for efficient querying by subject
messageSchema.index({ subject: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
