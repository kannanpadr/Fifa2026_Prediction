const mongoose = require('mongoose');

const penaltyAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  dateStr: { type: String, required: true }, // "YYYY-MM-DD"
  attemptNo: { type: Number, required: true },
  goals: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // duration in seconds
  difficulty: { type: String, default: 'medium' },
  winStatus: { type: Boolean, required: true }, // true if goals >= 3
  createdAt: { type: Date, default: Date.now }
});

penaltyAttemptSchema.index({ username: 1, dateStr: 1 });

module.exports = mongoose.model('PenaltyAttempt', penaltyAttemptSchema);
