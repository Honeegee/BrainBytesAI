const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  subject: { type: String, default: '' },
  chatId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isAiResponse: { type: Boolean, default: false }
});

// Index for efficient querying by chatId and subject
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ subject: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
