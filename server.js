const express = require('express');
const path = require('path');
const app = express();
const crypto = require('crypto');

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB with detailed diagnostics and debugging (especially for Ubuntu)
const mongoUri = process.env.MONGODB_URI;
console.log(`[DB Debug] Attempting to connect to MONGODB_URI: "${mongoUri}"`);

if (!mongoUri) {
  console.error('❌ MongoDB Connection Error: MONGODB_URI environment variable is undefined or empty!');
}

const connectionOptions = {
  serverSelectionTimeoutMS: 5000 // Timeout in 5 seconds to fail fast on connection errors
};

function runDbConnectionDiagnostics(uri) {
  const os = require('os');
  const dns = require('dns');
  const net = require('net');

  console.log('\n==================================================================');
  console.log('🔍 RUNNING DATABASE CONNECTION DIAGNOSTICS');
  console.log('==================================================================');
  console.log(`OS Platform:      ${process.platform} (${process.arch})`);
  console.log(`Node.js Version:  ${process.version}`);
  console.log(`System Name:      ${os.hostname()}`);
  console.log(`Configured URI:   "${uri}"`);

  let host = 'localhost';
  let port = 27017;
  try {
    if (uri) {
      const cleanedUri = uri.replace(/^mongodb(\+srv)?:\/\//, '');
      const mainPart = cleanedUri.split('/')[0];
      const hostPort = mainPart.split('@').pop();
      const parts = hostPort.split(':');
      host = parts[0];
      if (parts.length > 1) {
        port = parseInt(parts[1]);
      }
    }
  } catch (e) {
    console.error('[Diagnostics] Failed parsing host/port from URI:', e.message);
  }

  console.log(`Parsed Host:      "${host}"`);
  console.log(`Parsed Port:      ${port}`);

  // 1. DNS Resolution Test
  dns.lookup(host, { all: true }, (err, addresses) => {
    if (err) {
      console.error(`❌ DNS Lookup failed for host "${host}":`, err.message);
    } else {
      console.log(`🔍 DNS Lookup for "${host}" returned:`);
      addresses.forEach(addr => {
        console.log(`  - IP Address: ${addr.address} (IPv${addr.family})`);
      });

      // Special Ubuntu diagnostic alert (IPv6 vs IPv4 bind issue)
      const hasIPv6 = addresses.some(a => a.family === 6);
      if (host === 'localhost' && hasIPv6 && process.platform !== 'win32') {
        console.warn('\n💡 UBUNTU DIAGNOSTIC HINT:');
        console.warn('   "localhost" resolved to IPv6 (::1). MongoDB on Ubuntu defaults to binding to IPv4 only (127.0.0.1).');
        console.warn('   If the connection fails, change MONGODB_URI host from "localhost" to "127.0.0.1" in .env!');
      }
    }

    // 2. Raw TCP Port Socket Test
    console.log(`\n🔌 Opening TCP Socket to ${host}:${port}...`);
    const socket = net.createConnection({ host, port, timeout: 3000 });

    socket.on('connect', () => {
      console.log(`✅ TCP socket connection to ${host}:${port} SUCCEEDED! Port is listening.`);
      console.log('   -> MongoDB service is running. If mongoose still fails, verify credentials/authSource.');
      socket.end();
    });

    socket.on('error', (sockErr) => {
      console.error(`❌ TCP socket connection to ${host}:${port} FAILED:`, sockErr.message);
      if (sockErr.code === 'ECONNREFUSED') {
        console.error('   -> Port is closed (ECONNREFUSED). MongoDB is likely stopped or not running on this host/port.');
        console.error('   -> Ubuntu commands to start/verify MongoDB:');
        console.error('      sudo systemctl status mongod');
        console.error('      sudo systemctl start mongod');
      } else if (sockErr.code === 'ETIMEDOUT') {
        console.error('   -> Connection timed out (ETIMEDOUT). Check Ubuntu UFW firewall rules or security groups.');
      }
    });

    socket.on('timeout', () => {
      console.error(`❌ TCP socket connection to ${host}:${port} timed out (3000ms reached).`);
      socket.destroy();
    });
  });
}

mongoose.connect(mongoUri, connectionOptions)
  .then(() => {
    // Handled by mongoose.connection.on('connected') listener
  })
  .catch(err => {
    console.error('❌ MongoDB connection attempt failed:');
    console.error('--- BEGIN CONNECTION ERROR DETAILS ---');
    console.error(`Error Name:    ${err.name}`);
    console.error(`Error Message: ${err.message}`);
    if (err.code) console.error(`Error Code:    ${err.code}`);
    if (err.syscall) console.error(`Syscall:       ${err.syscall}`);
    if (err.hostname) console.error(`Hostname:      ${err.hostname}`);
    if (err.port) console.error(`Port:          ${err.port}`);
    console.error(err.stack);
    console.error('--- END CONNECTION ERROR DETAILS ---');

    // Run custom deep network/system diagnostics
    runDbConnectionDiagnostics(mongoUri);
  });

mongoose.connection.on('connected', async () => {
  console.log(`✅ MongoDB connected successfully to database: "${mongoose.connection.name}" on host: "${mongoose.connection.host}" and port: "${mongoose.connection.port}"`);
  await seedAdmin();
});

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error event triggered:');
  console.error(err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection disconnected!');
});

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('🌱 No admin user found. Seeding default admin user...');
      const pinHash = await bcrypt.hash('123456', 10);
      const defaultAdmin = new User({
        username: 'admin',
        phone: '9999999999',
        pinHash: pinHash,
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin user created. Username: admin, PIN: 123456');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    const scorerExists = await User.findOne({ role: 'scorer' });
    if (!scorerExists) {
      console.log('🌱 No scorer user found. Seeding default scorer user...');
      const pinHash = await bcrypt.hash('123456', 10);
      const defaultScorer = new User({
        username: 'scorer',
        phone: 'scorer_123',
        pinHash: pinHash,
        role: 'scorer'
      });
      await defaultScorer.save();
      console.log('✅ Default scorer user created. Username: scorer, PIN: 123456');
    }
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
  }
}

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, './frontend')));

// Import models
const Match = require('./models/Match');
const Prediction = require('./models/Prediction');
const LeaderboardEntry = require('./models/LeaderboardEntry');
const User = require('./models/User');
const VisitorCounter = require('./models/VisitorCounter');
const QuizSubmission = require('./models/QuizSubmission');
const RapidFireSubmission = require('./models/RapidFireSubmission');
const PenaltyScore = require('./models/PenaltyScore');
const JugglingScore = require('./models/JugglingScore');
const SoccerScore = require('./models/SoccerScore');
const PenaltyAttempt = require('./models/PenaltyAttempt');
const JugglingAttempt = require('./models/JugglingAttempt');
const SoccerAttempt = require('./models/SoccerAttempt');
const DailyScore = require('./models/DailyScore');
const RealPenaltyScore = require('./models/RealPenaltyScore');
const questionsPool = require('./data/questionsPool');

// Data will be fetched from MongoDB via Mongoose models.
// No in-memory mock data is used.

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[Login Debug] Login attempt started for username/phone: "${username}"`);
  if (!username || !password) {
    console.log('[Login Debug] Validation failed: Missing username or password');
    return res.status(400).json({ success: false, message: "Username or PIN are required" });
  }
  try {
    // Allow login via username or phone number
    const trimmedUsername = username.trim();
    console.log(`[Login Debug] Querying database for user: "${trimmedUsername}"`);
    const user = await User.findOne({ $or: [{ username: trimmedUsername }, { phone: trimmedUsername }] });
    if (!user) {
      console.log(`[Login Debug] User lookup failed: No user found matching "${trimmedUsername}"`);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`[Login Debug] User found: "${user.username}" | Role: "${user.role}" | Status: "${user.status}"`);

    if (user.status === 'deleted') {
      console.log(`[Login Debug] Login blocked: User account status is 'deleted'`);
      return res.status(403).json({ success: false, message: "This account has been deleted/disabled. Please contact admin." });
    }
    let authOk = false;
    if (password) {
      console.log('[Login Debug] Comparing PIN with bcrypt pinHash');
      const pinMatch = await bcrypt.compare(password, user.pinHash);
      console.log(`[Login Debug] bcrypt compare outcome: ${pinMatch}`);
      authOk = authOk || pinMatch;
    }
    if (!authOk) {
      console.log('[Login Debug] Authentication failed: PIN does not match');
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    user.sessionToken = token;
    console.log(`[Login Debug] Generating session token for "${user.username}"`);
    await user.save();
    console.log(`[Login Debug] Login successful for "${user.username}", session token saved`);

    return res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        token: token
      }
    });
  } catch (err) {
    console.error('[Login Debug] Server error during login:', err);
    return res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, phone, pin, confpin } = req.body;
  // Basic validation
  if (!username || !phone || !pin || !confpin) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }
  // PIN must be exactly 6 digits
  const pinPattern = /^\d{6}$/;
  if (!pinPattern.test(pin)) {
    return res.status(400).json({ success: false, message: 'PIN must be exactly 6 digits' });
  }
  if (pin !== confpin) {
    return res.status(400).json({ success: false, message: 'PINs do not match' });
  }
  try {
    // Ensure username or phone not already taken
    const existing = await User.findOne({ $or: [{ username: username.trim() }, { phone: phone.trim() }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const pinHash = await bcrypt.hash(pin, 10);
    const newUser = new User({
      username: username.trim(),
      phone: phone.trim(),
      pinHash,
      role: 'user'
    });
    await newUser.save();
    return res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Visits Counter API
app.get('/api/visits', async (req, res) => {
  try {
    const counter = await VisitorCounter.findOneAndUpdate(
      { name: 'global' },
      { $inc: { count: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    res.json({ count: counter.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ count: 0 });
  }
});


// ==========================================
// RAPID FIRE QUIZ ENDPOINTS
// ==========================================

// Get Daily Rapid Fire Questions (40 questions, seeded by date)
app.get('/api/rapid-fire/daily', async (req, res) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const sessionUser = await User.findOne({ sessionToken: token });
    if (!sessionUser) return res.status(403).json({ success: false, message: "Forbidden" });

    const dateStr = getTodayDateStr();

    // Check if user has already completed the rapid fire quiz today
    const existing = await RapidFireSubmission.findOne({ username: sessionUser.username, dateStr });
    if (existing && sessionUser.role !== 'admin') {
      return res.json({ success: true, completedToday: true, score: existing.score, correct: existing.correct, incorrect: existing.incorrect, unattempted: existing.unattempted });
    }

    // Flatten all questions from the pool
    let allQuestions = [];
    for (const key in questionsPool) {
      allQuestions = allQuestions.concat(questionsPool[key]);
    }

    // Seeded random shuffle based on today's date
    const tournamentStartDate = new Date('2026-06-01T00:00:00+0530');
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - tournamentStartDate.getTime();
    const daySeed = Math.max(0, Math.floor(diffMs / msPerDay));

    // Simple seeded random function
    function seededRandom(seed) {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }

    // Shuffle using the seed
    let seed = daySeed;
    let shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed++) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Pick exactly 40 questions
    const dailyQuestions = shuffled.slice(0, 40);

    const clientQuestions = dailyQuestions.map((q, idx) => {
      let optionsWithIndex = q.o.map((text, origIdx) => ({ text, origIdx }));
      let qSeed = daySeed + (idx + 1) * 100;
      for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(qSeed++) * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
      }
      const newCorrectIdx = optionsWithIndex.findIndex(opt => opt.origIdx === q.a);

      return {
        q: q.q,
        o: optionsWithIndex.map(opt => opt.text),
        d: q.d,
        a: Buffer.from(newCorrectIdx.toString()).toString('base64')
      };
    });

    return res.json({ success: true, completedToday: false, questions: clientQuestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error fetching rapid fire questions" });
  }
});

// Submit Rapid Fire Quiz
app.post('/api/rapid-fire/submit', async (req, res) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const sessionUser = await User.findOne({ sessionToken: token });
    if (!sessionUser) return res.status(403).json({ success: false, message: "Forbidden" });

    const { correct, incorrect, unattempted } = req.body;
    
    // Validate bounds
    if (correct + incorrect + unattempted > 40) {
      return res.status(400).json({ success: false, message: "Invalid question count" });
    }

    // Calculate score server-side to prevent spoofing
    const score = (correct * 5) - (incorrect * 3) - (unattempted * 1);

    const dateStr = getTodayDateStr();

    if (sessionUser.role !== 'admin') {
      const existing = await RapidFireSubmission.findOne({ username: sessionUser.username, dateStr });
      if (existing) {
        return res.status(409).json({ success: false, message: "You have already played Rapid Fire today!" });
      }
    } else {
      await RapidFireSubmission.deleteOne({ username: sessionUser.username, dateStr });
    }

    const submission = new RapidFireSubmission({
      username: sessionUser.username,
      dateStr,
      score,
      correct,
      incorrect,
      unattempted
    });
    await submission.save();

    return res.json({ success: true, message: "Rapid Fire completed!", score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error saving submission" });
  }
});

// Get Daily Quiz Questions
app.get('/api/quiz/daily', async (req, res) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid session" });
    }

    const dateStr = getTodayDateStr();

    // Check if user has already completed the quiz today
    const existing = await QuizSubmission.findOne({ username: sessionUser.username, dateStr });
    if (existing && sessionUser.role !== 'admin') {
      return res.json({ success: true, completedToday: true, score: existing.score, points: existing.points });
    }

    const tournamentStartDate = new Date('2026-06-01T00:00:00+0530');
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - tournamentStartDate.getTime();
    const daySeed = Math.max(0, Math.floor(diffMs / msPerDay));

    // Select day-specific questions from the pool
    const dayKey = 'day' + ((daySeed % 30) + 1);
    const dailyQuestions = questionsPool[dayKey] || questionsPool['day1'];

    // Strip/obfuscate correct answer index to prevent simple client-side page source or network inspection
    const clientQuestions = dailyQuestions.map(q => ({
      q: q.q,
      o: q.o,
      d: q.d,
      a: Buffer.from(q.a.toString()).toString('base64')
    }));

    return res.json({ success: true, completedToday: false, questions: clientQuestions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error fetching daily quiz questions" });
  }
});

// Daily Quiz Submission Endpoint
app.post('/api/quiz/submit', async (req, res) => {
  const { username, answers, timeTaken } = req.body;
  if (!username || !answers || !Array.isArray(answers) || answers.length !== 5 || timeTaken === undefined) {
    return res.status(400).json({ success: false, message: "Invalid parameters: answers array must contain exactly 5 elements" });
  }

  // Session token check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ username: username.trim(), sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid session" });
    }

    // Determine current date string (YYYY-MM-DD)
    const dateStr = getTodayDateStr();

    // Check if submission already exists for this user today
    const existing = await QuizSubmission.findOne({ username: username.trim(), dateStr });
    if (existing) {
      if (sessionUser.role === 'admin') {
        // Delete previous submission for testing purposes
        await QuizSubmission.deleteOne({ username: username.trim(), dateStr });
      } else {
        return res.status(409).json({ success: false, message: "You have already completed today's quiz!" });
      }
    }

    // Determine today's correct answers on backend securely
    const tournamentStartDate = new Date('2026-06-01T00:00:00+0530');
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - tournamentStartDate.getTime();
    const daySeed = Math.max(0, Math.floor(diffMs / msPerDay));

    // Select day-specific questions from the pool
    const dayKey = 'day' + ((daySeed % 30) + 1);
    const dailyQuestions = questionsPool[dayKey] || questionsPool['day1'];

    let score = 0;
    let easyCorrect = 0;
    let mediumCorrect = 0;
    let hardCorrect = 0;
    let expertCorrect = 0;

    dailyQuestions.forEach((q, idx) => {
      if (answers[idx] === q.a) {
        score++;
        if (q.d === 'easy') easyCorrect++;
        else if (q.d === 'medium') mediumCorrect++;
        else if (q.d === 'hard') hardCorrect++;
        else if (q.d === 'expert') expertCorrect++;
      }
    });

    // Calculate points: Easy (10 pts), Medium (20 pts), Hard (30 pts), Expert (40 pts)
    const basePoints = (easyCorrect * 10) + (mediumCorrect * 20) + (hardCorrect * 30) + (expertCorrect * 40);
    // Speed bonus: up to 120 extra points if basePoints > 0
    const speedBonus = basePoints > 0 ? Math.max(0, 120 - parseInt(timeTaken)) : 0;
    // Score * 10 guarantees additional points for correct answers
    const points = (parseInt(score) * 10) + basePoints + speedBonus;

    const submission = new QuizSubmission({
      username: username.trim(),
      score: parseInt(score),
      timeTaken: parseInt(timeTaken),
      points,
      dateStr
    });

    await submission.save();
    await recomputeDailyScore(username, dateStr);
    return res.json({ success: true, points, score: submission.score, timeTaken: submission.timeTaken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error saving quiz submission" });
  }
});

// Weekly Quiz Leaderboard Endpoint
app.get('/api/quiz/weekly-leaderboard', async (req, res) => {
  try {
    const now = new Date();

    // Custom reset boundaries: 19th June, 26 June, 03 july, 10 july (2026)
    const boundaries = [
      new Date('2026-06-19T00:00:00+05:30'),
      new Date('2026-06-26T00:00:00+05:30'),
      new Date('2026-07-03T00:00:00+05:30'),
      new Date('2026-07-10T00:00:00+05:30')
    ];

    let start = new Date(0); // Epoch start
    let end = new Date(boundaries[0]);

    for (let i = 0; i < boundaries.length; i++) {
      if (now >= boundaries[i]) {
        start = boundaries[i];
        end = (i + 1 < boundaries.length) ? boundaries[i + 1] : new Date('9999-12-31T23:59:59');
      }
    }

    const submissions = await QuizSubmission.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$username",
          totalPoints: { $sum: "$points" },
          totalScore: { $sum: "$score" },
          avgTime: { $avg: "$timeTaken" },
          attempts: { $sum: 1 }
        }
      },
      {
        $sort: { totalPoints: -1, totalScore: -1, avgTime: 1 }
      }
    ]);

    const leaderboard = submissions.map((s, idx) => ({
      rank: idx + 1,
      username: s._id,
      totalPoints: s.totalPoints,
      totalScore: s.totalScore,
      avgTime: Math.round(s.avgTime),
      attempts: s.attempts
    }));

    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch weekly quiz leaderboard" });
  }
});

// Matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ id: 1 });
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch matches" });
  }
});

// Predictions
app.get('/api/predictions/:username', async (req, res) => {
  const username = req.params.username.trim();
  try {
    const preds = await Prediction.find({ username });
    // Convert to map of matchId -> scores
    const result = {};
    preds.forEach(p => {
      result[p.matchId] = { team1Score: p.team1Score, team2Score: p.team2Score };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch predictions" });
  }
});

app.post('/api/predictions', async (req, res) => {
  const { username, predictions } = req.body;
  if (!username || !predictions) {
    return res.status(400).json({ success: false, message: "Invalid prediction request" });
  }

  // Session token authorization check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing active session token" });
  }

  try {
    const user = await User.findOne({ username: username.trim(), sessionToken: token });
    if (!user) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid or expired session" });
    }
    const allMatches = await Match.find();

    const now = new Date().getTime();

    // Find active matches that have not started yet
    const activeMatches = allMatches.filter(m => {
      const kickoff = new Date(m.date + ' ' + m.time + ' GMT+0530').getTime();
      return (m.status === 'Upcoming' || m.status === 'Live') && (now < kickoff);
    });

    let earliestDateStr = null;
    if (activeMatches.length > 0) {
      let earliestTime = Infinity;
      activeMatches.forEach(m => {
        const time = new Date(m.date).getTime();
        if (time < earliestTime) {
          earliestTime = time;
          earliestDateStr = m.date;
        }
      });
    } else {
      // Fallback: if all matches are in the past, return the date of the latest match
      let latestTime = 0;
      allMatches.forEach(m => {
        const time = new Date(m.date).getTime();
        if (time > latestTime) {
          latestTime = time;
          earliestDateStr = m.date;
        }
      });
    }

    const ops = [];

    for (const [matchIdStr, scores] of Object.entries(predictions)) {
      const matchId = parseInt(matchIdStr);
      const match = allMatches.find(m => m.id === matchId);
      if (!match) continue;

      // Only allow prediction if status is 'Upcoming'
      if (match.status !== 'Upcoming') {
        continue;
      }

      // Calculate 24-hour prediction window for this specific match
      const kickoff = new Date(match.date + ' ' + match.time + ' GMT+0530').getTime();
      const openTime = kickoff - 24 * 60 * 60 * 1000;

      // Skip predictions that are outside the allowed window (not open yet, or deadline passed)
      if (now < openTime || now >= kickoff) {
        continue;
      }

      ops.push({
        updateOne: {
          filter: { username: username.trim(), matchId: matchId },
          update: { team1Score: parseInt(scores.team1Score), team2Score: parseInt(scores.team2Score) },
          upsert: true
        }
      });
    }

    if (ops.length) {
      await Prediction.bulkWrite(ops);
      return res.json({ success: true, message: "Predictions updated successfully!" });
    }
    return res.json({ success: true, message: "No active upcoming match predictions to update." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to save predictions" });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', status: { $ne: 'deleted' } });
    const matches = await Match.find({ status: { $in: ['Completed', 'Live'] } });
    const predictions = await Prediction.find({});

    // Create lookup: username -> matchId -> scores
    const predMap = {};
    predictions.forEach(p => {
      if (!predMap[p.username]) {
        predMap[p.username] = {};
      }
      predMap[p.username][p.matchId] = {
        team1Score: p.team1Score,
        team2Score: p.team2Score
      };
    });

    const entries = users.map(user => {
      let totalPoints = 0;
      let exactScore = 0;
      let correctWinner = 0;
      let matchesPlayed = 0;

      const userPreds = predMap[user.username] || {};

      matches.forEach(match => {
        const pred = userPreds[match.id];
        if (pred) {
          matchesPlayed++;
          const ap1 = match.team1Score;
          const ap2 = match.team2Score;
          const pp1 = pred.team1Score;
          const pp2 = pred.team2Score;

          if (pp1 === ap1 && pp2 === ap2) {
            totalPoints += 5;
            exactScore++;
          } else if (
            (pp1 > pp2 && ap1 > ap2) ||
            (pp1 < pp2 && ap1 < ap2) ||
            (pp1 === pp2 && ap1 === ap2)
          ) {
            totalPoints += 3;
            correctWinner++;
          }
        }
      });

      return {
        user: user.username,
        avatar: user.username.charAt(0).toUpperCase(),
        totalPoints,
        exactScore,
        correctWinner,
        matchesPlayed
      };
    });

    // Sort: totalPoints desc, exactScore desc, correctWinner desc, matchesPlayed desc, user asc
    entries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactScore !== a.exactScore) return b.exactScore - a.exactScore;
      if (b.correctWinner !== a.correctWinner) return b.correctWinner - a.correctWinner;
      if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
      return a.user.localeCompare(b.user);
    });

    // Assign rank
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
});

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
        const raw = rawPoints * mult; // Removed Math.min(rawPoints, 120) cap to ensure higher scores scale properly
        if (raw > maxPenaltyRaw) {
          maxPenaltyRaw = raw;
        }
      }
      penaltyNorm = Math.min(maxPenaltyRaw, 300) / 300 * 100; // Normalized against max limit of 300 points
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
  } catch (err) {
    console.error(`Error in recomputeDailyScore for user ${username} on date ${dateStr}:`, err);
  }
}

// --- PENALTY SHOOTOUT ENDPOINTS ---

// Get current global top score (highest goals, then lowest time)
app.get('/api/penalty/top', async (req, res) => {
  try {
    const topScores = await PenaltyAttempt.aggregate([
      { $match: { winStatus: true } },
      { $sort: { goals: -1, timeTaken: 1 } },
      {
        $group: {
          _id: "$username",
          goals: { $first: "$goals" },
          timeTaken: { $first: "$timeTaken" },
          difficulty: { $first: "$difficulty" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          username: "$_id",
          goals: 1,
          timeTaken: 1,
          difficulty: 1,
          createdAt: 1
        }
      },
      { $sort: { goals: -1, timeTaken: 1 } },
      { $limit: 1 }
    ]);
    res.json({ success: true, topScore: topScores[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top score" });
  }
});

// Submit a new penalty shootout score
app.post('/api/penalty/submit', async (req, res) => {
  const { username, goals, timeTaken, difficulty } = req.body;
  if (!username || goals === undefined || timeTaken === undefined) {
    return res.status(400).json({ success: false, message: "Invalid parameters: username, goals, timeTaken are required" });
  }

  // Session token authorization check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ username: username.trim(), sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid or expired session" });
    }

    const todayStr = getTodayDateStr();

    // Find or create DailyScore to track penalty attempts count
    let dailyScore = await DailyScore.findOne({ username: username.trim(), dateStr: todayStr });
    if (!dailyScore) {
      dailyScore = new DailyScore({
        username: username.trim(),
        dateStr: todayStr,
        penaltyAttemptsToday: 0
      });
    }

    const currentAttemptsCount = dailyScore.penaltyAttemptsToday || 0;

    if (sessionUser.role !== 'admin') {
      if (currentAttemptsCount >= 5) {
        return res.status(403).json({ success: false, message: "Game locked: You have reached the maximum of 5 attempts today!" });
      }
    }

    const goalsScored = parseInt(goals);
    const secondsTaken = parseFloat(timeTaken);

    if (isNaN(goalsScored) || isNaN(secondsTaken) || goalsScored < 0 || goalsScored > 5) {
      return res.status(400).json({ success: false, message: "Invalid score or time. Goals must be between 0 and 5." });
    }

    const newAttemptsCount = currentAttemptsCount + 1;
    dailyScore.penaltyAttemptsToday = newAttemptsCount;
    await dailyScore.save();

    const winStatus = goalsScored >= 3;

    // Retrieve existing attempt for today
    let bestAttempt = await PenaltyAttempt.findOne({ username: username.trim(), dateStr: todayStr });

    const isBetter = !bestAttempt || 
      (goalsScored > bestAttempt.goals) || 
      (goalsScored === bestAttempt.goals && secondsTaken < bestAttempt.timeTaken);

    if (isBetter) {
      if (bestAttempt) {
        // Overwrite the existing attempt
        bestAttempt.goals = goalsScored;
        bestAttempt.timeTaken = secondsTaken;
        bestAttempt.difficulty = difficulty || 'medium';
        bestAttempt.winStatus = winStatus;
        bestAttempt.attemptNo = newAttemptsCount;
        bestAttempt.createdAt = new Date();
        await bestAttempt.save();
      } else {
        // Create a new attempt
        bestAttempt = new PenaltyAttempt({
          username: username.trim(),
          dateStr: todayStr,
          attemptNo: newAttemptsCount,
          goals: goalsScored,
          timeTaken: secondsTaken,
          difficulty: difficulty || 'medium',
          winStatus,
          createdAt: new Date()
        });
        await bestAttempt.save();
      }
      
      // Update normalized points
      await recomputeDailyScore(username, todayStr);
    }

    // Determine attempts left
    const attemptsLeft = sessionUser.role === 'admin' ? 9999 : Math.max(0, 5 - newAttemptsCount);

    return res.json({
      success: true,
      message: isBetter ? "Score submitted successfully!" : "Attempt logged. Score did not exceed your daily best.",
      attemptNo: newAttemptsCount,
      attemptsLeft,
      topScore: bestAttempt
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error saving penalty score" });
  }
});

// --- JUGGLING PRO ENDPOINTS ---

// Get current global top score and top 10 leaderboard entries
app.get('/api/juggling/top', async (req, res) => {
  try {
    const topScores = await JugglingAttempt.aggregate([
      { $sort: { score: -1, timeSurvived: 1, maxCombo: -1 } },
      {
        $group: {
          _id: "$username",
          score: { $first: "$score" },
          maxCombo: { $first: "$maxCombo" },
          timeSurvived: { $first: "$timeSurvived" },
          difficulty: { $first: "$difficulty" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          username: "$_id",
          score: 1,
          maxCombo: 1,
          timeSurvived: 1,
          difficulty: 1,
          createdAt: 1
        }
      },
      { $sort: { score: -1, timeSurvived: 1, maxCombo: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, topScore: topScores[0] || null, topScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top juggling scores" });
  }
});

// Submit a new juggling score
app.post('/api/juggling/submit', async (req, res) => {
  const { username, score, maxCombo, timeSurvived, difficulty } = req.body;
  if (!username || score === undefined || maxCombo === undefined || timeSurvived === undefined) {
    return res.status(400).json({ success: false, message: "Invalid parameters: username, score, maxCombo, timeSurvived are required" });
  }

  // Session token authorization check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ username: username.trim(), sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid or expired session" });
    }

    const todayStr = getTodayDateStr();
    const attemptsCount = await JugglingAttempt.countDocuments({ username: username.trim(), dateStr: todayStr });

    if (sessionUser.role !== 'admin') {
      if (attemptsCount >= 5) {
        return res.status(403).json({ success: false, message: "Game locked: You have reached the maximum of 5 attempts today!" });
      }
    }

    const finalScore = parseInt(score);
    const finalCombo = parseInt(maxCombo);
    const secondsSurvived = parseFloat(timeSurvived);

    if (isNaN(finalScore) || isNaN(finalCombo) || isNaN(secondsSurvived) || finalScore < 0) {
      return res.status(400).json({ success: false, message: "Invalid score, combo, or time." });
    }

    const currentAttemptNo = attemptsCount + 1;

    const newAttempt = new JugglingAttempt({
      username: username.trim(),
      dateStr: todayStr,
      attemptNo: currentAttemptNo,
      score: finalScore,
      maxCombo: finalCombo,
      timeSurvived: secondsSurvived,
      difficulty: difficulty || 'medium',
      createdAt: new Date()
    });

    await newAttempt.save();
    await recomputeDailyScore(username, todayStr);

    // Find today's best attempt to return in response
    const todayAttempts = await JugglingAttempt.find({ username: username.trim(), dateStr: todayStr });
    let bestAttempt = null;
    for (const att of todayAttempts) {
      if (!bestAttempt) {
        bestAttempt = att;
      } else if (att.score > bestAttempt.score) {
        bestAttempt = att;
      } else if (att.score === bestAttempt.score && att.timeSurvived < bestAttempt.timeSurvived) {
        bestAttempt = att;
      } else if (att.score === bestAttempt.score && att.timeSurvived === bestAttempt.timeSurvived && att.maxCombo > bestAttempt.maxCombo) {
        bestAttempt = att;
      }
    }

    // Determine attempts left
    const attemptsLeft = sessionUser.role === 'admin' ? 9999 : Math.max(0, 5 - currentAttemptNo);

    return res.json({
      success: true,
      message: "Score submitted successfully!",
      attemptNo: currentAttemptNo,
      attemptsLeft,
      topScore: bestAttempt
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error saving juggling score" });
  }
});

// --- MINI SOCCER SHOWDOWN ENDPOINTS ---

// Get current global top score and top 10 leaderboard entries
app.get('/api/soccer/top', async (req, res) => {
  try {
    const topScores = await SoccerAttempt.aggregate([
      { $sort: { goalDifference: -1, userGoals: -1, createdAt: 1 } },
      {
        $group: {
          _id: "$username",
          playerScore: { $first: "$userGoals" },
          aiScore: { $first: "$aiGoals" },
          goalDifference: { $first: "$goalDifference" },
          difficulty: { $first: "$difficulty" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          username: "$_id",
          playerScore: 1,
          aiScore: 1,
          goalDifference: 1,
          difficulty: 1,
          createdAt: 1
        }
      },
      { $sort: { goalDifference: -1, playerScore: -1, createdAt: 1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, topScore: topScores[0] || null, topScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top soccer scores" });
  }
});

// Submit a new soccer showdown score
app.post('/api/soccer/submit', async (req, res) => {
  const { username, playerScore, aiScore, difficulty } = req.body;
  if (!username || playerScore === undefined || aiScore === undefined) {
    return res.status(400).json({ success: false, message: "Invalid parameters: username, playerScore, aiScore are required" });
  }

  // Session token authorization check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ username: username.trim(), sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid or expired session" });
    }

    const todayStr = getTodayDateStr();

    // Find or create DailyScore to track soccer attempts count
    let dailyScore = await DailyScore.findOne({ username: username.trim(), dateStr: todayStr });
    if (!dailyScore) {
      dailyScore = new DailyScore({
        username: username.trim(),
        dateStr: todayStr,
        soccerAttemptsToday: 0
      });
    }

    const currentAttemptsCount = dailyScore.soccerAttemptsToday || 0;

    if (sessionUser.role !== 'admin') {
      if (currentAttemptsCount >= 5) {
        return res.status(403).json({ success: false, message: "Game locked: You have reached the maximum of 5 attempts today!" });
      }
    }

    const pScore = parseInt(playerScore);
    const aScore = parseInt(aiScore);

    if (isNaN(pScore) || isNaN(aScore) || pScore < 0 || aScore < 0) {
      return res.status(400).json({ success: false, message: "Invalid score details." });
    }

    const newAttemptsCount = currentAttemptsCount + 1;
    dailyScore.soccerAttemptsToday = newAttemptsCount;
    await dailyScore.save();

    const goalDifference = Math.max(0, pScore - aScore);
    const isScoreSaved = pScore >= 3;

    // Retrieve existing attempt for today
    let bestAttempt = await SoccerAttempt.findOne({ username: username.trim(), dateStr: todayStr });

    const isBetter = !bestAttempt || 
      (goalDifference > bestAttempt.goalDifference) || 
      (goalDifference === bestAttempt.goalDifference && pScore > bestAttempt.userGoals);

    if (isScoreSaved && isBetter) {
      if (bestAttempt) {
        // Overwrite the existing attempt
        bestAttempt.userGoals = pScore;
        bestAttempt.aiGoals = aScore;
        bestAttempt.goalDifference = goalDifference;
        bestAttempt.difficulty = difficulty || 'medium';
        bestAttempt.attemptNo = newAttemptsCount;
        bestAttempt.createdAt = new Date();
        await bestAttempt.save();
      } else {
        // Create new attempt
        bestAttempt = new SoccerAttempt({
          username: username.trim(),
          dateStr: todayStr,
          attemptNo: newAttemptsCount,
          userGoals: pScore,
          aiGoals: aScore,
          goalDifference,
          difficulty: difficulty || 'medium',
          createdAt: new Date()
        });
        await bestAttempt.save();
      }
      
      // Update normalized points
      await recomputeDailyScore(username, todayStr);
    }

    // Determine attempts left
    const attemptsLeft = sessionUser.role === 'admin' ? 9999 : Math.max(0, 5 - newAttemptsCount);

    // Map bestAttempt to old fields for compatibility
    const formattedBestAttempt = bestAttempt ? {
      playerScore: bestAttempt.userGoals,
      aiScore: bestAttempt.aiGoals,
      difficulty: bestAttempt.difficulty,
      attemptsToday: newAttemptsCount,
      lastPlayedDate: todayStr,
      createdAt: bestAttempt.createdAt
    } : null;

    return res.json({
      success: true,
      message: isScoreSaved && isBetter 
        ? "Score submitted successfully!" 
        : (isScoreSaved ? "Attempt logged. Score did not exceed your daily best." : "Attempt logged. Score below 3 not saved, but counts towards your daily attempts."),
      attemptNo: newAttemptsCount,
      attemptsLeft,
      topScore: formattedBestAttempt
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error saving soccer score" });
  }
});

// --- GALLERY IMAGES DIRECTORY LISTING ---
app.get('/api/gallery-images', (req, res) => {
  const fs = require('fs');
  const dirPath = path.join(__dirname, './frontend/images');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    const files = fs.readdirSync(dirPath);
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    return res.json({ success: true, images });
  } catch (err) {
    console.error('Error reading images directory:', err);
    return res.status(500).json({ success: false, message: 'Failed to read images folder' });
  }
});

// --- GAMES ATTEMPTS & STATUS ENDPOINT ---
app.get('/api/games/status', async (req, res) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session token" });
  }

  try {
    const sessionUser = await User.findOne({ sessionToken: token });
    if (!sessionUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid session" });
    }

    const username = sessionUser.username.trim();
    const dateStr = getTodayDateStr();

    // 1. Daily Quiz Status
    
    const rapidFireCount = await RapidFireSubmission.countDocuments({ username, dateStr });
    const rapidFireCompleted = rapidFireCount > 0;

    const quizCount = await QuizSubmission.countDocuments({ username, dateStr });
    const quizCompletedToday = quizCount > 0;

    const dailyScore = await DailyScore.findOne({ username, dateStr });

    // 2. Penalty attempts and best raw score
    const penaltyAttempts = dailyScore ? (dailyScore.penaltyAttemptsToday || 0) : 0;
    const penaltyAttemptsDocs = await PenaltyAttempt.find({ username, dateStr, winStatus: true });
    let bestPenaltyScore = 0;
    if (penaltyAttemptsDocs.length > 0) {
      bestPenaltyScore = Math.max(...penaltyAttemptsDocs.map(a => a.goals));
    }

    // 3. Juggling attempts and best raw score
    const jugglingAttempts = await JugglingAttempt.countDocuments({ username, dateStr });
    const jugglingAttemptsDocs = await JugglingAttempt.find({ username, dateStr });
    let bestJugglingScore = 0;
    if (jugglingAttemptsDocs.length > 0) {
      bestJugglingScore = Math.max(...jugglingAttemptsDocs.map(a => a.score));
    }

    // 4. Soccer attempts and best raw score
    const soccerAttempts = dailyScore ? (dailyScore.soccerAttemptsToday || 0) : 0;
    const soccerAttemptsDocs = await SoccerAttempt.find({ username, dateStr });
    let bestSoccerScore = 0;
    if (soccerAttemptsDocs.length > 0) {
      bestSoccerScore = Math.max(...soccerAttemptsDocs.map(a => a.userGoals));
    }

    return res.json({
      success: true,
      role: sessionUser.role,
      status: {
        quiz: {
          completedToday: quizCompletedToday,
          attempts: quizCompletedToday ? 1 : 0,
          limit: 1
        },
        rapidFire: {
          completedToday: rapidFireCompleted,
          attempts: rapidFireCompleted ? 1 : 0,
          limit: 1
        },
        juggling: {
          attempts: jugglingAttempts,
          limit: 5,
          bestScore: bestJugglingScore
        },
        penalty: {
          attempts: penaltyAttempts,
          limit: 5,
          bestScore: bestPenaltyScore
        },
        soccer: {
          attempts: soccerAttempts,
          limit: 5,
          bestScore: bestSoccerScore
        }
      }
    });
  } catch (err) {
    console.error('Error fetching games status:', err);
    return res.status(500).json({ success: false, message: "Server error fetching games status" });
  }
});

// --- OVERALL GALAXY CHAMPIONS LEADERBOARD ---
app.get('/api/games/overall-leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', status: { $ne: 'deleted' } });
    const userNames = users.map(u => u.username.trim());

    const week2Dates = ['2026-6-21', '2026-6-22', '2026-6-23', '2026-6-24', '2026-6-25', '2026-6-26'];
    const dailyScores = await RapidFireSubmission.aggregate([
      { $match: { username: { $in: userNames }, dateStr: { $in: week2Dates } } },
      {
        $group: {
          _id: "$username",
          championshipScore: { $sum: "$score" },
          daysPlayed: { $sum: 1 }
        }
      }
    ]);

    const scoreMap = {};
    dailyScores.forEach(item => {
      scoreMap[item._id] = item;
    });

    const entries = users.map(user => {
      const username = user.username.trim();
      const scoreData = scoreMap[username] || { championshipScore: 0, daysPlayed: 0 };

      return {
        username,
        avatar: username.charAt(0).toUpperCase(),
        championshipScore: parseFloat(scoreData.championshipScore.toFixed(2)),
        daysPlayed: scoreData.daysPlayed,
        overallPoints: parseFloat(scoreData.championshipScore.toFixed(2))
      };
    });

    entries.sort((a, b) => {
      if (b.championshipScore !== a.championshipScore) {
        return b.championshipScore - a.championshipScore;
      }
      return a.username.localeCompare(b.username);
    });

    entries.forEach((e, idx) => { e.rank = idx + 1; });

    res.json({ success: true, leaderboard: entries });
  } catch (err) {
    console.error("Error fetching overall championship board:", err);
    res.status(500).json({ success: false, message: "Failed to generate overall championship board" });
  }
});

app.get('/api/games/daily-leaderboard', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: "Date parameter is required (format: YYYY-M-D)" });
  }

  try {
    const users = await User.find({ role: 'user', status: { $ne: 'deleted' } });
    const userNames = users.map(u => u.username.trim());

    const scores = await RapidFireSubmission.find({ dateStr: date, username: { $in: userNames } })
      .sort({ score: -1, username: 1 })
      .exec();

    const scoreMap = {};
    scores.forEach(item => {
      scoreMap[item.username] = item;
    });

    const leaderboard = users.map(user => {
      const username = user.username.trim();
      const scoreData = scoreMap[username] || { score: 0 };

      return {
        username,
        avatar: username.charAt(0).toUpperCase(),
        dailyTotal: parseFloat(scoreData.score.toFixed(2))
      };
    });

    leaderboard.sort((a, b) => {
      if (b.dailyTotal !== a.dailyTotal) return b.dailyTotal - a.dailyTotal;
      return a.username.localeCompare(b.username);
    });

    leaderboard.forEach((e, idx) => { e.rank = idx + 1; });

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error("Error fetching daily leaderboard:", err);
    res.status(500).json({ success: false, message: "Failed to fetch daily leaderboard" });
  }
});


// ==========================================
// GROUP STANDINGS
// ==========================================

// Predefined groups according to standard format
const INITIAL_GROUPS = {
  A: [
    { name: 'Mexico', code: 'mx' },
    { name: 'Cameroon', code: 'cm' },
    { name: 'Croatia', code: 'hr' },
    { name: 'Saudi Arabia', code: 'sa' }
  ],
  B: [
    { name: 'Canada', code: 'ca' },
    { name: 'Nigeria', code: 'ng' },
    { name: 'South Korea', code: 'kr' },
    { name: 'Costa Rica', code: 'cr' }
  ],
  C: [
    { name: 'USA', code: 'us' },
    { name: 'Algeria', code: 'dz' },
    { name: 'Serbia', code: 'rs' },
    { name: 'Qatar', code: 'qa' }
  ],
  D: [
    { name: 'Argentina', code: 'ar' },
    { name: 'Ivory Coast', code: 'ci' },
    { name: 'Iran', code: 'ir' },
    { name: 'Slovakia', code: 'sk' }
  ],
  E: [
    { name: 'Brazil', code: 'br' },
    { name: 'Mali', code: 'ml' },
    { name: 'Japan', code: 'jp' },
    { name: 'Scotland', code: 'gb-sct' }
  ],
  F: [
    { name: 'France', code: 'fr' },
    { name: 'Morocco', code: 'ma' },
    { name: 'Australia', code: 'au' },
    { name: 'Peru', code: 'pe' }
  ],
  G: [
    { name: 'Spain', code: 'es' },
    { name: 'Senegal', code: 'sn' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'New Zealand', code: 'nz' }
  ],
  H: [
    { name: 'England', code: 'gb-eng' },
    { name: 'Tunisia', code: 'tn' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Jamaica', code: 'jm' }
  ],
  I: [
    { name: 'Belgium', code: 'be' },
    { name: 'Egypt', code: 'eg' },
    { name: 'South Korea', code: 'kr' },
    { name: 'Panama', code: 'pa' }
  ],
  J: [
    { name: 'Portugal', code: 'pt' },
    { name: 'Ghana', code: 'gh' },
    { name: 'Iran', code: 'ir' },
    { name: 'Honduras', code: 'hn' }
  ],
  K: [
    { name: 'Netherlands', code: 'nl' },
    { name: 'South Africa', code: 'za' },
    { name: 'Japan', code: 'jp' },
    { name: 'El Salvador', code: 'sv' }
  ],
  L: [
    { name: 'Germany', code: 'de' },
    { name: 'Cameroon', code: 'cm' },
    { name: 'Australia', code: 'au' },
    { name: 'Haiti', code: 'ht' }
  ]
};

app.get('/api/standings', async (req, res) => {
  try {
    const matches = await Match.find();

    // Initialize stats for all groups
    const standings = {};
    Object.keys(INITIAL_GROUPS).forEach(groupLetter => {
      standings[groupLetter] = INITIAL_GROUPS[groupLetter].map(team => ({
        name: team.name,
        code: team.code,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        form: []
      }));
    });

    // Process match results
    matches.forEach(match => {
      const groupLetter = match.group;
      if (!standings[groupLetter]) return; // Match is not in groups A-L

      // Only process Completed or Live matches
      if (match.status === 'Completed' || match.status === 'Live') {
        const team1Name = match.team1.trim().toLowerCase();
        const team2Name = match.team2.trim().toLowerCase();
        const score1 = match.team1Score;
        const score2 = match.team2Score;

        if (score1 !== null && score2 !== null) {
          const t1 = standings[groupLetter].find(t => t.name.trim().toLowerCase() === team1Name);
          const t2 = standings[groupLetter].find(t => t.name.trim().toLowerCase() === team2Name);

          if (t1 && t2) {
            t1.played++;
            t2.played++;
            t1.gf += score1;
            t1.ga += score2;
            t2.gf += score2;
            t2.ga += score1;

            if (score1 > score2) {
              t1.wins++;
              t1.pts += 3;
              t1.form.push('W');
              t2.losses++;
              t2.form.push('L');
            } else if (score1 < score2) {
              t2.wins++;
              t2.pts += 3;
              t2.form.push('W');
              t1.losses++;
              t1.form.push('L');
            } else {
              t1.draws++;
              t2.draws++;
              t1.pts += 1;
              t2.pts += 1;
              t1.form.push('D');
              t2.form.push('D');
            }
          }
        }
      }
    });

    // Finalize GD and Sort within each group
    Object.keys(standings).forEach(groupLetter => {
      standings[groupLetter].forEach(team => {
        team.gd = team.gf - team.ga;
        // Limit form to last 5 matches
        if (team.form.length > 5) {
          team.form = team.form.slice(-5);
        }
      });

      // Sort
      standings[groupLetter].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; // 1. Points
        if (b.gd !== a.gd) return b.gd - a.gd;     // 2. Goal Difference
        if (b.gf !== a.gf) return b.gf - a.gf;     // 3. Goals For
        return a.name.localeCompare(b.name);       // 4. Alphabetical
      });
    });

    res.json(standings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to calculate standings" });
  }
});


app.post('/api/admin/matches/update', async (req, res) => {
  const { username, matchId, team1Score, team2Score, status } = req.body;
  if (!username || matchId === undefined || !status) {
    return res.status(400).json({ success: false, message: "Invalid parameters" });
  }

  // Session token authorization check
  const authHeader = req.headers.authorization;
  let token = req.body.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing active session token" });
  }

  try {
    // Verify admin role and session token
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    const match = await Match.findOne({ id: parseInt(matchId) });
    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found" });
    }

    // Update match scores & status
    match.status = status;
    match.team1Score = (team1Score !== null && team1Score !== undefined && team1Score !== '') ? parseInt(team1Score) : null;
    match.team2Score = (team2Score !== null && team2Score !== undefined && team2Score !== '') ? parseInt(team2Score) : null;

    await match.save();
    return res.json({ success: true, message: "Match updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error during match update" });
  }
});

// Admin User Management - List Users
app.get('/api/admin/users', async (req, res) => {
  const username = req.query.username || req.headers['x-username'];
  const authHeader = req.headers.authorization;
  let token = req.query.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!username || !token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing username or token" });
  }

  try {
    // Verify admin role and session token
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    // Return list of all users, sorted by creation date, excluding sensitive hashes
    const users = await User.find({}, { pinHash: 0 }).sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (err) {
    console.error('Error listing users:', err);
    return res.status(500).json({ success: false, message: "Server error listing users" });
  }
});

// Admin Predictions Management - List All Predictions
app.get('/api/admin/predictions', async (req, res) => {
  const username = req.query.username || req.headers['x-username'];
  const authHeader = req.headers.authorization;
  let token = req.query.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!username || !token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing username or token" });
  }

  try {
    // Verify admin role and session token
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    const matches = await Match.find().sort({ id: 1 });
    const users = await User.find({ role: 'user', status: { $ne: 'deleted' } }, { pinHash: 0 }).sort({ username: 1 });
    const predictions = await Prediction.find({});

    return res.json({ success: true, matches, users, predictions });
  } catch (err) {
    console.error('Error fetching admin predictions:', err);
    return res.status(500).json({ success: false, message: "Server error listing predictions" });
  }
});


// Admin User Management - Delete (Soft Delete) User
app.post('/api/admin/users/delete', async (req, res) => {
  const { username, token, targetUsername } = req.body;
  if (!username || !token || !targetUsername) {
    return res.status(400).json({ success: false, message: "Invalid parameters" });
  }

  try {
    // Verify admin role and session token
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    const targetUser = await User.findOne({ username: targetUsername.trim() });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, message: "Cannot delete admin users" });
    }

    targetUser.status = 'deleted';
    targetUser.sessionToken = null; // Invalidate current session
    await targetUser.save();

    return res.json({ success: true, message: `User ${targetUsername} deleted successfully` });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ success: false, message: "Server error deleting user" });
  }
});

// Admin Games Management - Reset all 4 games scores to 0
app.post('/api/admin/reset-games', async (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    return res.status(400).json({ success: false, message: "Username and token are required" });
  }

  try {
    // Validate admin role
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    // Delete all submissions & attempts
    await Promise.all([
      QuizSubmission.deleteMany({}),
      RapidFireSubmission.deleteMany({}),
      JugglingAttempt.deleteMany({}),
      PenaltyAttempt.deleteMany({}),
      SoccerAttempt.deleteMany({}),
      DailyScore.deleteMany({})
    ]);

    return res.json({ success: true, message: "All 4 games have been successfully reset to 0 for all users!" });
  } catch (err) {
    console.error("Error resetting games data:", err);
    return res.status(500).json({ success: false, message: "Server error resetting games data" });
  }
});

// Admin DB Management - Export Database Data
app.get('/api/admin/db/export', async (req, res) => {
  const username = req.query.username || req.headers['x-username'];
  const authHeader = req.headers.authorization;
  let token = req.query.token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!username || !token) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing username or token" });
  }

  try {
    // Verify admin role and session token
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin', sessionToken: token });
    if (!adminUser) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role and valid session required" });
    }

    // Fetch all collections in parallel
    const [users, matches, predictions, quizSubmissions, rapidFireSubmissions, leaderboardEntries, visitorCounters, penaltyScores, jugglingScores, soccerScores] = await Promise.all([
      User.find({}, { pinHash: 0, sessionToken: 0 }), // Exclude pinHash and sessionToken for safety/security
      Match.find().sort({ id: 1 }),
      Prediction.find().sort({ submittedAt: -1 }),
      QuizSubmission.find().sort({ createdAt: -1 }),
      LeaderboardEntry.find(),
      VisitorCounter.find(),
      PenaltyScore.find().sort({ createdAt: -1 }),
      JugglingScore.find().sort({ createdAt: -1 }),
      SoccerScore.find().sort({ createdAt: -1 })
    ]);

    return res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      data: {
        users,
        matches,
        predictions,
        quizSubmissions,
        leaderboardEntries,
        visitorCounters,
        penaltyScores,
        jugglingScores,
        soccerScores
      }
    });
  } catch (err) {
    console.error('Error exporting database:', err);
    return res.status(500).json({ success: false, message: "Server error during database export" });
  }
});

// Database diagnostics API with deep DNS and TCP checks
app.get('/api/db/status', async (req, res) => {
  const dnsPromises = require('dns').promises;
  const net = require('net');

  const status = {
    readyState: mongoose.connection.readyState,
    readyStateLabel: 'unknown',
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port || 'unknown',
    dbName: mongoose.connection.name || 'unknown',
    rwTest: 'pending',
    diagnostics: {
      platform: process.platform,
      nodeVersion: process.version,
      dnsResolved: [],
      tcpSocketTest: 'pending'
    }
  };

  switch(status.readyState) {
    case 0: status.readyStateLabel = 'disconnected'; break;
    case 1: status.readyStateLabel = 'connected'; break;
    case 2: status.readyStateLabel = 'connecting'; break;
    case 3: status.readyStateLabel = 'disconnecting'; break;
  }

  // Parse host/port from URI to test raw TCP connection if mongoose failed to connect
  let targetHost = status.host;
  let targetPort = status.port;

  if (targetHost === 'unknown' || targetHost === 'localhost') {
    try {
      const uri = process.env.MONGODB_URI || '';
      const cleanedUri = uri.replace(/^mongodb(\+srv)?:\/\//, '');
      const mainPart = cleanedUri.split('/')[0];
      const hostPort = mainPart.split('@').pop();
      const parts = hostPort.split(':');
      targetHost = parts[0] || 'localhost';
      targetPort = parts[1] ? parseInt(parts[1]) : 27017;
    } catch (e) {
      // ignore parsing error
    }
  }

  // Perform DNS resolution in background/promise
  try {
    const lookupResult = await dnsPromises.lookup(targetHost, { all: true });
    status.diagnostics.dnsResolved = lookupResult.map(addr => `${addr.address} (IPv${addr.family})`);
  } catch (dnsErr) {
    status.diagnostics.dnsResolved = [`Lookup failed: ${dnsErr.message}`];
  }

  // Perform TCP port test
  status.diagnostics.tcpSocketTest = await new Promise((resolve) => {
    const socket = net.createConnection({ host: targetHost, port: targetPort, timeout: 2000 });
    socket.on('connect', () => {
      resolve('succeeded (port is open)');
      socket.end();
    });
    socket.on('error', (err) => {
      resolve(`failed: ${err.message}`);
    });
    socket.on('timeout', () => {
      resolve('failed: timed out after 2000ms');
      socket.destroy();
    });
  });

  try {
    if (status.readyState === 1) {
      // Run quick query test to verify read/write works
      // We do a simple findOne on User (does not write, but tests read queries)
      await User.findOne({ username: '___nonexistent_diagnostics_user___' });
      status.rwTest = 'success';
    } else {
      status.rwTest = 'failed (database not connected)';
    }
  } catch (err) {
    console.error('[DB Diagnostics Debug] Read/Write test failed:', err);
    status.rwTest = `failed: ${err.message}`;
  }

  return res.json(status);
});

// --- REAL PENALTY SHOOTOUT (ADMIN) ---
app.get('/api/real-penalty/users', async (req, res) => {
  try {
    const users = await User.find({ status: 'active', role: 'user' }).select('username -_id');
    res.json({ success: true, users: users.map(u => u.username) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching active users" });
  }
});

app.post('/api/real-penalty/score', async (req, res) => {
  const { username, level, shots, isTieBreaker } = req.body;
  if (!username || !level || !shots || !Array.isArray(shots)) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const totalScore = shots.reduce((a, b) => a + Number(b), 0);

  try {
    const filter = { username, level };
    const update = {
      shots: shots.map(Number),
      totalScore,
      isTieBreaker: Boolean(isTieBreaker)
    };
    
    const newScore = await RealPenaltyScore.findOneAndUpdate(filter, update, { new: true, upsert: true });
    res.json({ success: true, message: "Score saved successfully", score: newScore });
  } catch (err) {
    console.error("Error saving real penalty score:", err);
    res.status(500).json({ success: false, message: "Server error saving score" });
  }
});

app.get('/api/real-penalty/leaderboard', async (req, res) => {
  try {
    const scores = await RealPenaltyScore.find().sort({ totalScore: -1, createdAt: 1 });
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching leaderboard" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FIFA 2026 Prediction Portal Backend running on http://localhost:${PORT}`);
});
