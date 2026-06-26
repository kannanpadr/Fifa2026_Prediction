const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');

// 1. Hide the old games
code = code.replace('grid.appendChild(quizCard);', '// grid.appendChild(quizCard);');
code = code.replace('grid.appendChild(jugglingCard);', '// grid.appendChild(jugglingCard);');
code = code.replace('grid.appendChild(penaltyCard);', '// grid.appendChild(penaltyCard);');
code = code.replace('grid.appendChild(gameCard);', '// grid.appendChild(gameCard);');

// 2. Add Rapid Fire game
if (!code.includes('grid.appendChild(rapidFireCard)')) {
  const rapidFireCode = `
    const rapidFireLocked = status.rapidFire && status.rapidFire.completedToday && !isAdmin;
    const rapidFireCard = document.createElement('div');
    rapidFireCard.className = 'glass-card interactive-hover';
    rapidFireCard.style.padding = '1.75rem';
    if (rapidFireLocked) {
      rapidFireCard.style.opacity = '0.6';
      rapidFireCard.style.cursor = 'not-allowed';
      rapidFireCard.classList.remove('interactive-hover');
    } else {
      rapidFireCard.style.cursor = 'pointer';
    }
    rapidFireCard.style.border = '1px solid var(--accent-green)';
    rapidFireCard.style.display = 'flex';
    rapidFireCard.style.flexDirection = 'column';
    rapidFireCard.style.justifyContent = 'space-between';
    rapidFireCard.addEventListener('click', () => {
      if (rapidFireLocked) {
        window.showToast("Rapid Fire is locked! You have already played today.", 'error');
      } else {
        window.location.href = 'rapid_fire.html';
      }
    });

    rapidFireCard.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <span style="background: rgba(0, 230, 118, 0.2); color: var(--accent-green); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">⏱️ Rapid Fire</span>
        \${rapidFireLocked ? '<span style="font-size: 1.2rem;">🔒</span>' : ''}
      </div>
      <div>
        <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: \${rapidFireLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">Min to Win</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; line-height: 1.3;">40 questions in 60 seconds.</p>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.6);">
          <span>Status: \${rapidFireLocked ? 'Completed' : 'Available'}</span>
        </div>
      </div>
    \`;
    grid.appendChild(rapidFireCard);
  `;
  code = code.replace('grid.appendChild(rpCard);', 'grid.appendChild(rpCard);\n' + rapidFireCode);
}

// 3. Patch leaderboard logic by replacing the whole initWinnerPage content simply
const startIdx = code.indexOf('async function initWinnerPage() {');
const endIdx = code.indexOf('// Bind tab buttons', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
  const newInitWinnerPage = `async function initWinnerPage() {
  const podiumContainer = document.getElementById('podiumContainer');
  const body = document.getElementById('championsBody');
  const tabChampionship = document.getElementById('tabChampionship');
  const tabDaily = document.getElementById('tabDaily');
  const dailySelectorContainer = document.getElementById('dailySelectorContainer');
  const dailyDateSelect = document.getElementById('dailyDateSelect');

  if (!podiumContainer || !body) return;

  let activeTab = 'championship';

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  if (dailyDateSelect) {
    for (let i = 0; i < dailyDateSelect.options.length; i++) {
      if (dailyDateSelect.options[i].value === todayStr) {
        dailyDateSelect.selectedIndex = i;
        break;
      }
    }
  }

  function updateTabStyles() {
    if (!tabChampionship || !tabDaily || !dailySelectorContainer) return;
    if (activeTab === 'championship') {
      tabChampionship.style.background = 'var(--accent-green)';
      tabChampionship.style.color = 'var(--text-dark)';
      tabChampionship.style.border = 'none';

      tabDaily.style.background = 'rgba(255,255,255,0.06)';
      tabDaily.style.color = 'var(--text-muted)';
      tabDaily.style.border = '1px solid var(--border-color)';

      dailySelectorContainer.style.display = 'none';
    } else {
      tabDaily.style.background = 'var(--accent-green)';
      tabDaily.style.color = 'var(--text-dark)';
      tabDaily.style.border = 'none';

      tabChampionship.style.background = 'rgba(255,255,255,0.06)';
      tabChampionship.style.color = 'var(--text-muted)';
      tabChampionship.style.border = '1px solid var(--border-color)';

      dailySelectorContainer.style.display = 'flex';
    }
  }

  async function renderLeaderboard() {
    const listHead = document.getElementById('leaderboardHead');
    const listBody = document.getElementById('championsBody');
    if (!podiumContainer || !listBody || !listHead) return;

    listBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">Loading leaderboard...</td></tr>';

    try {
      const url = activeTab === 'championship'
        ? '/api/games/overall-leaderboard'
        : \`/api/games/daily-leaderboard?date=\${dailyDateSelect.value}\`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.leaderboard) {
        const list = data.leaderboard;

        podiumContainer.innerHTML = '';
        if (list.length === 0) {
          podiumContainer.innerHTML = '<div style="color: var(--text-muted); padding: 3rem;">No participants recorded yet.</div>';
          listBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No data available for this selection.</td></tr>';
          return;
        }

        const podiumOrder = [];
        if (list[1]) podiumOrder.push({ ...list[1], cardClass: 'second' });
        if (list[0]) podiumOrder.push({ ...list[0], cardClass: 'first' });
        if (list[2]) podiumOrder.push({ ...list[2], cardClass: 'third' });

        podiumOrder.forEach(item => {
          const card = document.createElement('div');
          card.className = \`podium-card \${item.cardClass} no-breakdown\`;

          const rawName = item.username;
          const nameParts = rawName.trim().split(/\\s+/);
          let displayName = rawName;
          if (nameParts.length > 1) {
            displayName = \`\${nameParts[0]} \${nameParts[1].charAt(0).toUpperCase()}.\`;
          }

          const pointsVal = activeTab === 'championship' ? item.overallPoints : item.dailyTotal;
          
          card.innerHTML = \`
            <div class="podium-rank">\${item.rank}</div>
            <div class="profile-avatar" style="\${item.rank === 1 ? 'border: 3px solid #ffd700;' : ''}">\${item.avatar}</div>
            <h3 class="podium-name">\${displayName}</h3>
            <div class="podium-score">\${pointsVal} <small>pts</small></div>
          \`;
          podiumContainer.appendChild(card);
        });

        if (activeTab === 'championship') {
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

        listBody.innerHTML = '';
        list.forEach(item => {
          const row = document.createElement('tr');
          let rankHtml = item.rank;
          if (item.rank === 1) rankHtml = '👑 1';
          else if (item.rank === 2) rankHtml = '🥈 2';
          else if (item.rank === 3) rankHtml = '🥉 3';

          const isSelf = currentUser && item.username === currentUser.username;
          if (isSelf) {
            row.style.background = 'rgba(0, 230, 118, 0.05)';
          }

          if (activeTab === 'championship') {
            row.innerHTML = \`
              <td style="font-weight: 700; color: \${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">\${rankHtml}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: \${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: \${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">\${item.avatar}</div>
                  <span style="font-weight: 600;">\${item.username} \${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                </div>
              </td>
              <td style="text-align: center; color: var(--text-muted); font-weight: 600;">\${item.daysPlayed || 0}</td>
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
          }
          listBody.appendChild(row);
        });
      } else {
        podiumContainer.innerHTML = '<div style="color: #ff5252; padding: 2rem;">Failed to retrieve standings.</div>';
        listBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #ff5252; padding: 2.5rem;">Failed to load data.</td></tr>';
      }
    } catch (err) {
      console.error('Failed to load champions board:', err);
      podiumContainer.innerHTML = '<div style="color: #ff5252; padding: 2rem;">Failed to connect to backend server.</div>';
      listBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #ff5252; padding: 2.5rem;">Server connection failed.</td></tr>';
    }
  }

  `;
  code = code.substring(0, startIdx) + newInitWinnerPage + code.substring(endIdx);
}

fs.writeFileSync('frontend/app.js', code);
console.log('Fixed app.js fully!');
