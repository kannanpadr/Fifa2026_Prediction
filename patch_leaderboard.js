const fs = require('fs');

// Patch server.js
let serverCode = fs.readFileSync('server.js', 'utf8');

// Replace overall-leaderboard logic
const overallRegex = /app\.get\('\/api\/games\/overall-leaderboard'[\s\S]*?(?=app\.get\('\/api\/games\/daily-leaderboard')/m;
const newOverall = `app.get('/api/games/overall-leaderboard', async (req, res) => {
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

`;
serverCode = serverCode.replace(overallRegex, newOverall);

// Replace daily-leaderboard logic
const dailyRegex = /app\.get\('\/api\/games\/daily-leaderboard'[\s\S]*?(?=\/\/ ==========================================|\/\/ Record Daily|app\.post)/m;
const newDaily = `app.get('/api/games/daily-leaderboard', async (req, res) => {
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

`;
serverCode = serverCode.replace(dailyRegex, newDaily);
fs.writeFileSync('server.js', serverCode);
console.log('Patched server.js');

// Patch app.js
let appCode = fs.readFileSync('frontend/app.js', 'utf8');

// Replace table header logic
appCode = appCode.replace(/if \(activeTab === 'championship'\) {[\s\S]*?listBody\.innerHTML = '';/, `if (activeTab === 'championship') {
          listHead.innerHTML = \`
            <tr>
              <th style="width: 8%;">Rank</th>
              <th>Competitor</th>
              <th style="text-align: center; width: 15%;">Days Played</th>
              <th style="text-align: right; width: 15%;">Rapid Fire Points</th>
            </tr>
          \`;
        } else {
          listHead.innerHTML = \`
            <tr>
              <th style="width: 10%;">Rank</th>
              <th>Competitor</th>
              <th style="text-align: right; width: 40%;">Rapid Fire Points</th>
            </tr>
          \`;
        }

        listBody.innerHTML = '';`);

// Replace row logic
appCode = appCode.replace(/if \(activeTab === 'championship'\) {[\s\S]*?\} else {[\s\S]*?if \(isAdmin\) {[\s\S]*?\}\s*\}/, `if (activeTab === 'championship') {
            row.innerHTML = \`
              <td style="font-weight: 700; color: \${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">\${rankHtml}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: \${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: \${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">\${item.avatar}</div>
                  <span style="font-weight: 600;">\${item.username} \${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                </div>
              </td>
              <td style="text-align: center; color: var(--text-muted); font-weight: 600;">\${item.daysPlayed}</td>
              <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">\${item.overallPoints}</td>
            \`;
          } else {
            row.innerHTML = \`
              <td style="font-weight: 700; color: \${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">\${rankHtml}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: \${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: \${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">\${item.avatar}</div>
                  <span style="font-weight: 600;">\${item.username} \${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                </div>
              </td>
              <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">\${item.dailyTotal}</td>
            \`;
          }`);

fs.writeFileSync('frontend/app.js', appCode);
console.log('Patched frontend/app.js');

// Patch winner.html
let winnerCode = fs.readFileSync('frontend/winner.html', 'utf8');
winnerCode = winnerCode.replace(/<th style="text-align: center; width: 12%;">Quiz Pts<\/th>[\s\S]*?<th style="text-align: right; width: 15%;">Total Points<\/th>/, `<th style="text-align: center; width: 15%;">Days Played</th>
                <th style="text-align: right; width: 15%;">Rapid Fire Points</th>`);
fs.writeFileSync('frontend/winner.html', winnerCode);
console.log('Patched frontend/winner.html');
