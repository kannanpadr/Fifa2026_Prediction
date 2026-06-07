const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  matchId: { type: Number, required: true },
  team1Score: { type: Number, required: true },
  team2Score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
