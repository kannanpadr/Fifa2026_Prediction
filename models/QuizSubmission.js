const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  points: { type: Number, required: true },
  dateStr: { type: String, required: true }, // "YYYY-MM-DD"
  createdAt: { type: Date, default: Date.now }
});

// To ensure a user can only submit once per day, make the combination of username + dateStr unique
quizSubmissionSchema.index({ username: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
