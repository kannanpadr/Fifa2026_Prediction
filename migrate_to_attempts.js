const mongoose = require('mongoose');
require('dotenv').config();

const JugglingScore = require('./models/JugglingScore');
const PenaltyScore = require('./models/PenaltyScore');
const SoccerScore = require('./models/SoccerScore');

const JugglingAttempt = require('./models/JugglingAttempt');
const PenaltyAttempt = require('./models/PenaltyAttempt');
const SoccerAttempt = require('./models/SoccerAttempt');
const DailyScore = require('./models/DailyScore');
const QuizSubmission = require('./models/QuizSubmission');

function getTodayDateStr() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

async function recomputeDailyScore(username, dateStr) {
  try {
    const trimmedUsername = username.trim();

    // 1. Quiz Norm
    const quizSub = await QuizSubmission.findOne({ username: trimmedUsername, dateStr });
    const quizRaw = quizSub ? quizSub.points : 0;
    const quizNorm = Math.min(quizRaw, 300) / 300 * 100;

    // 2. Juggling Norm
    const jugglingAttempts = await JugglingAttempt.find({ username: trimmedUsername, dateStr });
    let jugglingNorm = 0;
    if (jugglingAttempts.length > 0) {
      let maxJugglingRaw = 0;
      for (const attempt of jugglingAttempts) {
        const mult = attempt.difficulty === 'hard' ? 2.0 : (attempt.difficulty === 'easy' ? 1.0 : 1.5);
        const attemptNo = attempt.attemptNo || 1;
        const attemptDeduction = (attemptNo - 1) * 15;
        const rawPoints = attempt.score + (attempt.maxCombo * 10) + (attempt.timeSurvived * 20) - attemptDeduction;
        const raw = Math.max(0, rawPoints) * mult;
        if (raw > maxJugglingRaw) {
          maxJugglingRaw = raw;
        }
      }
      jugglingNorm = Math.min(maxJugglingRaw, 12000) / 12000 * 100;
    }

    // 3. Penalty Norm
    const penaltyAttempts = await PenaltyAttempt.find({ username: trimmedUsername, dateStr, winStatus: true });
    let penaltyNorm = 0;
    if (penaltyAttempts.length > 0) {
      let maxPenaltyRaw = 0;
      for (const attempt of penaltyAttempts) {
        const mult = attempt.difficulty === 'hard' ? 2.0 : (attempt.difficulty === 'easy' ? 1.0 : 1.5);
        const rawPoints = (attempt.goals * 20) + Math.max(0, Math.round((50 - attempt.timeTaken) * 2));
        const raw = Math.min(rawPoints, 120) * mult;
        if (raw > maxPenaltyRaw) {
          maxPenaltyRaw = raw;
        }
      }
      penaltyNorm = Math.min(maxPenaltyRaw, 120) / 120 * 100;
    }

    // 4. Soccer Norm
    const soccerAttempts = await SoccerAttempt.find({ username: trimmedUsername, dateStr });
    let soccerNorm = 0;
    if (soccerAttempts.length > 0) {
      let maxSoccerRaw = 0;
      for (const attempt of soccerAttempts) {
        const diff = attempt.userGoals - attempt.aiGoals;
        if (diff > 0) {
          const mult = attempt.difficulty === 'hard' ? 2.0 : (attempt.difficulty === 'easy' ? 1.0 : 1.5);
          const rawPoints = (diff * 10) + 20;
          const raw = rawPoints * mult;
          if (raw > maxSoccerRaw) {
            maxSoccerRaw = raw;
          }
        }
      }
      soccerNorm = Math.min(maxSoccerRaw, 440) / 440 * 100;
    }

    const dailyTotal = (quizNorm * 0.40) + (jugglingNorm * 0.25) + (penaltyNorm * 0.25) + (soccerNorm * 0.10);

    await DailyScore.findOneAndUpdate(
      { username: trimmedUsername, dateStr },
      {
        quizNorm,
        jugglingNorm,
        penaltyNorm,
        soccerNorm,
        dailyTotal,
        updatedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Recomputed DailyScore for ${username}: total = ${dailyTotal.toFixed(2)}`);
  } catch (err) {
    console.error(`Error in recomputeDailyScore for user ${username}:`, err);
  }
}

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifa2026';
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  const todayStr = getTodayDateStr();
  const uniqueUsers = new Set();

  // 1. Migrate Juggling Scores
  console.log('Migrating JugglingScore docs...');
  const jugglingDocs = await JugglingScore.find({});
  for (const doc of jugglingDocs) {
    const username = doc.username.trim();
    uniqueUsers.add(username);
    
    // Check if an attempt already exists to avoid duplicates
    const exists = await JugglingAttempt.findOne({ username, dateStr: todayStr, attemptNo: 1 });
    if (!exists) {
      await JugglingAttempt.create({
        username,
        dateStr: todayStr,
        attemptNo: 1,
        score: doc.score,
        maxCombo: doc.maxCombo || 1,
        timeSurvived: doc.timeSurvived,
        difficulty: doc.difficulty || 'medium',
        createdAt: doc.createdAt || new Date()
      });
      console.log(`Migrated juggling score for user: ${username}`);
    }
  }

  // 2. Migrate Penalty Scores
  console.log('Migrating PenaltyScore docs...');
  const penaltyDocs = await PenaltyScore.find({});
  for (const doc of penaltyDocs) {
    const username = doc.username.trim();
    uniqueUsers.add(username);

    const exists = await PenaltyAttempt.findOne({ username, dateStr: todayStr, attemptNo: 1 });
    if (!exists) {
      await PenaltyAttempt.create({
        username,
        dateStr: todayStr,
        attemptNo: 1,
        goals: doc.goals,
        timeTaken: doc.timeTaken,
        difficulty: doc.difficulty || 'medium',
        winStatus: doc.goals >= 3,
        createdAt: doc.createdAt || new Date()
      });
      console.log(`Migrated penalty score for user: ${username}`);
    }
  }

  // 3. Migrate Soccer Scores
  console.log('Migrating SoccerScore docs...');
  const soccerDocs = await SoccerScore.find({});
  for (const doc of soccerDocs) {
    const username = doc.username.trim();
    uniqueUsers.add(username);

    const exists = await SoccerAttempt.findOne({ username, dateStr: todayStr, attemptNo: 1 });
    if (!exists) {
      const userGoals = doc.playerScore;
      const aiGoals = doc.aiScore;
      await SoccerAttempt.create({
        username,
        dateStr: todayStr,
        attemptNo: 1,
        userGoals,
        aiGoals,
        goalDifference: Math.max(0, userGoals - aiGoals),
        difficulty: doc.difficulty || 'medium',
        createdAt: doc.createdAt || new Date()
      });
      console.log(`Migrated soccer score for user: ${username}`);
    }
  }

  // 4. Recompute daily scores for all unique users
  console.log('Recomputing daily scores...');
  for (const username of uniqueUsers) {
    await recomputeDailyScore(username, todayStr);
  }

  console.log('Migration completed successfully!');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
