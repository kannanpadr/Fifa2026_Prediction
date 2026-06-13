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

    const today = new Date();
    const dateStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    // Check if user has already completed the quiz today
    const existing = await QuizSubmission.findOne({ username: sessionUser.username, dateStr });
    if (existing) {
      return res.json({ success: true, completedToday: true, score: existing.score, points: existing.points });
    }

    const tournamentStartDate = new Date('2026-06-01T00:00:00+0530');
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - tournamentStartDate.getTime();
    const daySeed = Math.max(0, Math.floor(diffMs / msPerDay));

    // Select 2 Easy, 2 Medium, 1 Hard
    const easyQ1 = questionsPool.easy[(daySeed * 2) % questionsPool.easy.length];
    const easyQ2 = questionsPool.easy[(daySeed * 2 + 1) % questionsPool.easy.length];
    const medQ1 = questionsPool.medium[(daySeed * 2) % questionsPool.medium.length];
    const medQ2 = questionsPool.medium[(daySeed * 2 + 1) % questionsPool.medium.length];
    const hardQ = questionsPool.hard[daySeed % questionsPool.hard.length];

    const dailyQuestions = [easyQ1, easyQ2, medQ1, medQ2, hardQ];

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
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    // Check if submission already exists for this user today
    const existing = await QuizSubmission.findOne({ username: username.trim(), dateStr });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already completed today's quiz!" });
    }

    // Determine today's correct answers on backend securely
    const tournamentStartDate = new Date('2026-06-01T00:00:00+0530');
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - tournamentStartDate.getTime();
    const daySeed = Math.max(0, Math.floor(diffMs / msPerDay));

    const easyQ1 = questionsPool.easy[(daySeed * 2) % questionsPool.easy.length];
    const easyQ2 = questionsPool.easy[(daySeed * 2 + 1) % questionsPool.easy.length];
    const medQ1 = questionsPool.medium[(daySeed * 2) % questionsPool.medium.length];
    const medQ2 = questionsPool.medium[(daySeed * 2 + 1) % questionsPool.medium.length];
    const hardQ = questionsPool.hard[daySeed % questionsPool.hard.length];

    const dailyQuestions = [easyQ1, easyQ2, medQ1, medQ2, hardQ];

    let score = 0;
    let easyCorrect = 0;
    let mediumCorrect = 0;
    let hardCorrect = 0;

    dailyQuestions.forEach((q, idx) => {
      if (answers[idx] === q.a) {
        score++;
        if (q.d === 'easy') easyCorrect++;
        else if (q.d === 'medium') mediumCorrect++;
        else if (q.d === 'hard') hardCorrect++;
      }
    });

    // Calculate points: Easy (10 pts), Medium (20 pts), Hard (30 pts)
    const basePoints = (easyCorrect * 10) + (mediumCorrect * 20) + (hardCorrect * 30);
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

      // Only allow prediction if status is 'Upcoming' and the date matches the earliest active matchday date
      if (match.date !== earliestDateStr || match.status !== 'Upcoming') {
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

const INITIAL_GROUPS = {
  A: [
    { name: 'Mexico', code: 'mx' },
    { name: 'South Korea', code: 'kr' },
    { name: 'South Africa', code: 'za' },
    { name: 'Czechia', code: 'cz' }
  ],
  B: [
    { name: 'Canada', code: 'ca' },
    { name: 'Bosnia and Herzegovina', code: 'ba' },
    { name: 'Qatar', code: 'qa' },
    { name: 'Switzerland', code: 'ch' }
  ],
  C: [
    { name: 'Brazil', code: 'br' },
    { name: 'Morocco', code: 'ma' },
    { name: 'Scotland', code: 'gb-sct' },
    { name: 'Haiti', code: 'ht' }
  ],
  D: [
    { name: 'USA', code: 'us' },
    { name: 'Paraguay', code: 'py' },
    { name: 'Australia', code: 'au' },
    { name: 'Türkiye', code: 'tr' }
  ],
  E: [
    { name: 'Germany', code: 'de' },
    { name: 'Ecuador', code: 'ec' },
    { name: 'Ivory Coast', code: 'ci' },
    { name: 'Curaçao', code: 'cw' }
  ],
  F: [
    { name: 'Netherlands', code: 'nl' },
    { name: 'Japan', code: 'jp' },
    { name: 'Sweden', code: 'se' },
    { name: 'Tunisia', code: 'tn' }
  ],
  G: [
    { name: 'Belgium', code: 'be' },
    { name: 'Egypt', code: 'eg' },
    { name: 'Iran', code: 'ir' },
    { name: 'New Zealand', code: 'nz' }
  ],
  H: [
    { name: 'Spain', code: 'es' },
    { name: 'Uruguay', code: 'uy' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Cape Verde', code: 'cv' }
  ],
  I: [
    { name: 'France', code: 'fr' },
    { name: 'Senegal', code: 'sn' },
    { name: 'Norway', code: 'no' },
    { name: 'Iraq', code: 'iq' }
  ],
  J: [
    { name: 'Argentina', code: 'ar' },
    { name: 'Austria', code: 'at' },
    { name: 'Algeria', code: 'dz' },
    { name: 'Jordan', code: 'jo' }
  ],
  K: [
    { name: 'Portugal', code: 'pt' },
    { name: 'Colombia', code: 'co' },
    { name: 'Uzbekistan', code: 'uz' },
    { name: 'DR Congo', code: 'cd' }
  ],
  L: [
    { name: 'England', code: 'gb-eng' },
    { name: 'Croatia', code: 'hr' },
    { name: 'Ghana', code: 'gh' },
    { name: 'Panama', code: 'pa' }
  ]
};

// Get Group Standings (Calculated Dynamically from Matches)
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

// Admin Match Score Management
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
    const [users, matches, predictions, quizSubmissions, leaderboardEntries, visitorCounters] = await Promise.all([
      User.find({}, { pinHash: 0, sessionToken: 0 }), // Exclude pinHash and sessionToken for safety/security
      Match.find().sort({ id: 1 }),
      Prediction.find().sort({ submittedAt: -1 }),
      QuizSubmission.find().sort({ createdAt: -1 }),
      LeaderboardEntry.find(),
      VisitorCounter.find()
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
        visitorCounters
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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FIFA 2026 Prediction Portal Backend running on http://localhost:${PORT}`);
});
