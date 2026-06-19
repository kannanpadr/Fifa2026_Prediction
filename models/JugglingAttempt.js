const mongoose = require('mongoose');

const jugglingAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  dateStr: { type: String, required: true }, // "YYYY-MM-DD"
  attemptNo: { type: Number, required: true },
  score: { type: Number, required: true },
  maxCombo: { type: Number, default: 1 },
  timeSurvived: { type: Number, required: true }, // duration in seconds
  difficulty: { type: String, default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

jugglingAttemptSchema.index({ username: 1, dateStr: 1 });

module.exports = mongoose.model('JugglingAttempt', jugglingAttemptSchema);
