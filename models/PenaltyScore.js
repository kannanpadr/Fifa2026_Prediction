const mongoose = require('mongoose');

const penaltyScoreSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  goals: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // time taken in seconds
  difficulty: { type: String, default: 'medium' },
  attemptsToday: { type: Number, default: 0 },
  lastPlayedDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PenaltyScore', penaltyScoreSchema);
