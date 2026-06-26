const mongoose = require('mongoose');
require('dotenv').config();
const RealPenaltyScore = require('./models/RealPenaltyScore');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB.");
  const scores = await RealPenaltyScore.find().sort({ createdAt: -1 });
  const seen = new Set();
  const toDelete = [];
  
  for (const s of scores) {
    const key = s.username + '_' + s.level;
    if (seen.has(key)) {
      toDelete.push(s._id);
    } else {
      seen.add(key);
    }
  }
  
  if (toDelete.length > 0) {
    await RealPenaltyScore.deleteMany({ _id: { $in: toDelete } });
    console.log('Deleted ' + toDelete.length + ' duplicate entries.');
  } else {
    console.log('No duplicates found.');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error("DB error:", err);
});
