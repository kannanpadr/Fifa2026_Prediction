const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  date: String,
  time: String,
  team1: String,
  team2: String,
  team1Code: String,
  team2Code: String,
  group: String,
  venue: String,
  status: String,
  team1Score: { type: Number, default: null },
  team2Score: { type: Number, default: null },
  penaltyWinner: { type: String, default: null }
});

module.exports = mongoose.model('Match', matchSchema);
