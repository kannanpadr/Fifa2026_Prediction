const mongoose = require('mongoose');

const realPenaltyScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  level: { type: String, enum: ['Easy', 'Hard'], required: true },
  shots: { type: [Number], required: true }, // Array storing points for each shot
  totalScore: { type: Number, required: true },
  isTieBreaker: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RealPenaltyScore', realPenaltyScoreSchema);
