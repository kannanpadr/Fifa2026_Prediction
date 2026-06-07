const express = require('express');
const path = require('path');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Import models
const Match = require('./models/Match');
const Prediction = require('./models/Prediction');
const LeaderboardEntry = require('./models/LeaderboardEntry');
const User = require('./models/User');

// Data will be fetched from MongoDB via Mongoose models.
// No in-memory mock data is used.

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username or PIN are required" });
  }
  try {
    // Allow login via username or phone number
    const user = await User.findOne({ $or: [{ username: username.trim() }, { phone: username.trim() }] });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    let authOk = false;
    if (password) {
      const pinMatch = await bcrypt.compare(password, user.pinHash);
      authOk = authOk || pinMatch;
    }
    if (!authOk) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    return res.json({ success: true, user: { username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
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
  try {
    const allMatches = await Match.find();
    
    // Find the earliest date with uncompleted matches (Upcoming or Live)
    const activeMatches = allMatches.filter(m => m.status === 'Upcoming' || m.status === 'Live');
    let earliestDateStr = null;
    let earliestTime = Infinity;

    activeMatches.forEach(m => {
      const time = new Date(m.date).getTime();
      if (time < earliestTime) {
        earliestTime = time;
        earliestDateStr = m.date;
      }
    });

    // Allowed matches to predict must match this earliest active date and have status 'Upcoming'
    const allowedMatchIds = new Set(
      allMatches
        .filter(m => m.date === earliestDateStr && m.status === 'Upcoming')
        .map(m => m.id)
    );

    const ops = [];
    Object.entries(predictions).forEach(([matchIdStr, scores]) => {
      const matchId = parseInt(matchIdStr);
      if (allowedMatchIds.has(matchId)) {
        ops.push({
          updateOne: {
            filter: { username: username.trim(), matchId: matchId },
            update: { team1Score: parseInt(scores.team1Score), team2Score: parseInt(scores.team2Score) },
            upsert: true
          }
        });
      }
    });

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
    const users = await User.find({ role: 'user' });
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

// Admin Match Score Update
app.post('/api/admin/matches/update', async (req, res) => {
  const { username, matchId, team1Score, team2Score, status } = req.body;
  if (!username || matchId === undefined || !status) {
    return res.status(400).json({ success: false, message: "Invalid parameters" });
  }

  try {
    // Verify admin role
    const adminUser = await User.findOne({ username: username.trim(), role: 'admin' });
    if (!adminUser && username.trim().toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Admin role required" });
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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FIFA 2026 Prediction Portal Backend running on http://localhost:${PORT}`);
});
