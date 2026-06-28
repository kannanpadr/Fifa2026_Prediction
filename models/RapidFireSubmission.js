const mongoose = require('mongoose');

const rapidFireSubmissionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  dateStr: { type: String, required: true },
  score: { type: Number, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure only one submission per user per day
rapidFireSubmissionSchema.index({ username: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('RapidFireSubmission', rapidFireSubmissionSchema);
