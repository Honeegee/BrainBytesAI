const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  subject: { type: String, default: '' },
  chatId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  createdAt: { type: Date, default: Date.now },
  isAiResponse: { type: Boolean, default: false },
  sentiment: {
    score: { type: Number, default: 0 }, // -1 to 1 scale
    label: { type: String, enum: ['negative', 'neutral', 'positive'], default: 'neutral' }
  }
});

// Index for efficient querying
messageSchema.index({ chatId: 1, userId: 1, createdAt: -1 });
messageSchema.index({ subject: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
