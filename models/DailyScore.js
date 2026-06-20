const mongoose = require('mongoose');

const dailyScoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  dateStr: { type: String, required: true }, // "YYYY-MM-DD"
  quizNorm: { type: Number, default: 0 },
  jugglingNorm: { type: Number, default: 0 },
  penaltyNorm: { type: Number, default: 0 },
  soccerNorm: { type: Number, default: 0 },
  soccerAttemptsToday: { type: Number, default: 0 },
  penaltyAttemptsToday: { type: Number, default: 0 },
  dailyTotal: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// A user should have at most one daily score document per day
dailyScoreSchema.index({ username: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('DailyScore', dailyScoreSchema);
