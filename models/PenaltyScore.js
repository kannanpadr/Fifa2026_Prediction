const mongoose = require('mongoose');

const penaltyScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  goals: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // time taken in seconds
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PenaltyScore', penaltyScoreSchema);
