const mongoose = require('mongoose');

const jugglingScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  maxCombo: { type: Number, default: 1 },
  timeSurvived: { type: Number, required: true }, // duration in seconds
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JugglingScore', jugglingScoreSchema);
