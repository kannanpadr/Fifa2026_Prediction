const mongoose = require('mongoose');

const soccerScoreSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  playerScore: { type: Number, required: true }, // Player 1 goals
  aiScore: { type: Number, required: true },     // AI Opponent goals
  difficulty: { type: String, default: 'medium' },
  attemptsToday: { type: Number, default: 0 },
  lastPlayedDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoccerScore', soccerScoreSchema);
