const mongoose = require('mongoose');

const soccerScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  playerScore: { type: Number, required: true }, // Player 1 goals
  aiScore: { type: Number, required: true },     // AI Opponent goals
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoccerScore', soccerScoreSchema);
