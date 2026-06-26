const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Add Import
if (!code.includes("const RapidFireSubmission = require('./models/RapidFireSubmission');")) {
  code = code.replace("const QuizSubmission = require('./models/QuizSubmission');", "const QuizSubmission = require('./models/QuizSubmission');\nconst RapidFireSubmission = require('./models/RapidFireSubmission');");
}

// 2. Add API Endpoints
const rapidFireCode = `
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

    const clientQuestions = dailyQuestions.map(q => ({
      q: q.q,
      o: q.o,
      d: q.d,
      a: Buffer.from(q.a.toString()).toString('base64')
    }));

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

`;

if (!code.includes("app.get('/api/rapid-fire/daily'")) {
  // Insert before the standard quiz endpoints
  code = code.replace("// Get Daily Quiz Questions", rapidFireCode + "// Get Daily Quiz Questions");
}

// 3. Update Status API
const rapidFireStatusLogic = `
    const rapidFireCount = await RapidFireSubmission.countDocuments({ username, dateStr });
    const rapidFireCompleted = rapidFireCount > 0;
`;

if (!code.includes("const rapidFireCount = await RapidFireSubmission")) {
  code = code.replace("const quizCount = await QuizSubmission.countDocuments({ username, dateStr });", rapidFireStatusLogic + "\n    const quizCount = await QuizSubmission.countDocuments({ username, dateStr });");
  
  // Inject into response
  const newStatusResponse = `quiz: {
          completedToday: quizCompletedToday,
          attempts: quizCompletedToday ? 1 : 0,
          limit: 1
        },
        rapidFire: {
          completedToday: rapidFireCompleted,
          attempts: rapidFireCompleted ? 1 : 0,
          limit: 1
        },`;
  code = code.replace(/quiz:\s*{\s*completedToday: quizCompletedToday,\s*attempts: quizCompletedToday \? 1 : 0,\s*limit: 1\s*},/, newStatusResponse);
}

// 4. Update Delete All (Reset DB)
if (!code.includes("RapidFireSubmission.deleteMany({})")) {
  code = code.replace("QuizSubmission.deleteMany({}),", "QuizSubmission.deleteMany({}),\n      RapidFireSubmission.deleteMany({}),");
  code = code.replace("const [users, matches, predictions, quizSubmissions,", "const [users, matches, predictions, quizSubmissions, rapidFireSubmissions,");
  code = code.replace("quizSubmissions,\\n        leaderboardEntries", "quizSubmissions,\n        rapidFireSubmissions,\n        leaderboardEntries");
}

fs.writeFileSync('server.js', code);
console.log('server.js updated with Rapid Fire endpoints and status logic.');
