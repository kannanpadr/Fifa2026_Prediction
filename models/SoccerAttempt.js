const mongoose = require('mongoose');

const soccerAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  dateStr: { type: String, required: true }, // "YYYY-MM-DD"
  attemptNo: { type: Number, required: true },
  userGoals: { type: Number, required: true },
  aiGoals: { type: Number, required: true },
  goalDifference: { type: Number, required: true }, // max(0, userGoals - aiGoals)
  difficulty: { type: String, default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

soccerAttemptSchema.index({ username: 1, dateStr: 1 });

module.exports = mongoose.model('SoccerAttempt', soccerAttemptSchema);
