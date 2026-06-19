const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const QuizSubmission = require('./models/QuizSubmission');
const PenaltyScore = require('./models/PenaltyScore');
const JugglingScore = require('./models/JugglingScore');
const SoccerScore = require('./models/SoccerScore');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const quizzes = await QuizSubmission.find();
  console.log('\n--- Quiz Submissions ---');
  quizzes.forEach(q => console.log(JSON.stringify(q, null, 2)));

  const penalties = await PenaltyScore.find();
  console.log('\n--- Penalty Scores ---');
  penalties.forEach(p => console.log(JSON.stringify(p, null, 2)));

  const jugglings = await JugglingScore.find();
  console.log('\n--- Juggling Scores ---');
  jugglings.forEach(j => console.log(JSON.stringify(j, null, 2)));

  const soccers = await SoccerScore.find();
  console.log('\n--- Soccer Scores ---');
  soccers.forEach(s => console.log(JSON.stringify(s, null, 2)));

  await mongoose.disconnect();
}

run().catch(console.error);
