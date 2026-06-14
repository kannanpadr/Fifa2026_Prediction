const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const users = await User.find();
  console.log('Total users found:', users.length);
  users.forEach(u => {
    console.log(`Username: ${u.username} | Role: ${u.role} | Phone: ${u.phone}`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
