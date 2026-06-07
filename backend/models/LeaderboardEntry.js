const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  user: { type: String, required: true },
  avatar: { type: String },
  totalPoints: { type: Number, required: true },
  exactScore: { type: Number },
  correctWinner: { type: Number },
  matchesPlayed: { type: Number }
});

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
