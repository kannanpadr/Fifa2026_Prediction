const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const PenaltyScore = require('./models/PenaltyScore');
const JugglingScore = require('./models/JugglingScore');
const SoccerScore = require('./models/SoccerScore');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const pRes = await PenaltyScore.deleteMany({});
  console.log('Deleted Penalty Scores:', pRes.deletedCount);

  const jRes = await JugglingScore.deleteMany({});
  console.log('Deleted Juggling Scores:', jRes.deletedCount);

  const sRes = await SoccerScore.deleteMany({});
  console.log('Deleted Soccer Scores:', sRes.deletedCount);

  await mongoose.disconnect();
  console.log('Disconnected from DB. Reset completed successfully.');
}

run().catch(console.error);
