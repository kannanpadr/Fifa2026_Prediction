
// --- REAL PENALTY SHOOTOUT ---
async function initRealPenaltyAdmin() {
  checkAuthRedirect();
  const user = window.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }
  
  const userSelect = document.getElementById('rpUserSelect');
  const levelSelect = document.getElementById('rpLevelSelect');
  const shotSelects = document.querySelectorAll('.rp-shot');
  const tieBreakerCheck = document.getElementById('rpTieBreaker');
  const tieBreakerGroup = document.getElementById('tieBreakerGroup');
  const tieShotSelect = document.querySelector('.rp-tie-shot');
  const form = document.getElementById('realPenaltyAdminForm');

  // Load active users
  try {
    const res = await fetch('/api/real-penalty/users');
    const data = await res.json();
    if (data.success) {
      userSelect.innerHTML = '<option value="">-- Select User --</option>';
      data.users.forEach(u => {
        userSelect.innerHTML += '<option value="' + u + '">' + u + '</option>';
      });
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }

  const updateShotOptions = () => {
    const isHard = levelSelect.value === 'Hard';
    const options = isHard ? 
      '<option value="0">Miss (0)</option><option value="3">Ground (3)</option><option value="6"><=3 Bounce (6)</option><option value="10">Direct (10)</option>' :
      '<option value="0">Miss (0)</option><option value="2">Ground (2)</option><option value="3"><=3 Bounce (3)</option><option value="5">Direct (5)</option>';
    
    shotSelects.forEach(s => s.innerHTML = options);
    if (isHard) {
      tieShotSelect.innerHTML = '<option value="0">Miss (0)</option><option value="6"><=3 Bounce (6)</option><option value="10">Direct (10)</option>';
    } else {
      tieShotSelect.innerHTML = options; // Tie breaker not explicitly defined for easy, fallback
    }
  };

  levelSelect.addEventListener('change', updateShotOptions);
  updateShotOptions();

  tieBreakerCheck.addEventListener('change', (e) => {
    tieBreakerGroup.style.display = e.target.checked ? 'block' : 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shots = Array.from(shotSelects).map(s => s.value);
    if (tieBreakerCheck.checked) {
      shots.push(tieShotSelect.value);
    }
    
    try {
      const res = await fetch('/api/real-penalty/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userSelect.value,
          level: levelSelect.value,
          shots: shots,
          isTieBreaker: tieBreakerCheck.checked
        })
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('Score submitted successfully!');
        form.reset();
        updateShotOptions();
        tieBreakerGroup.style.display = 'none';
      } else {
        window.showToast(data.message, 'error');
      }
    } catch (err) {
      window.showToast('Error submitting score', 'error');
    }
  });
}

async function initRealPenaltyScorecard() {
  try {
    const res = await fetch('/api/real-penalty/leaderboard');
    const data = await res.json();
    if (data.success) {
      const easyScores = data.scores.filter(s => s.level === 'Easy');
      const hardScores = data.scores.filter(s => s.level === 'Hard');
      
      const renderTable = (scores, tableId) => {
        const tbody = document.querySelector('#' + tableId + ' tbody');
        tbody.innerHTML = '';
        if (scores.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No scores yet</td></tr>';
          return;
        }
        scores.forEach((score, index) => {
          let rankHtml = (index + 1);
          if (index === 0) rankHtml = '<span class="medal">🥇</span>';
          else if (index === 1) rankHtml = '<span class="medal">🥈</span>';
          else if (index === 2) rankHtml = '<span class="medal">🥉</span>';
          
          tbody.innerHTML += '<tr><td>' + rankHtml + '</td><td><strong>' + score.username + '</strong></td><td style="font-size: 1.2rem; font-weight: bold; color: var(--accent-green);">' + score.totalScore + '</td><td>' + score.shots.join(' + ') + (score.isTieBreaker ? ' (Tie Breaker)' : '') + '</td></tr>';
        });
      };
      
      renderTable(easyScores, 'easyTable');
      renderTable(hardScores, 'hardTable');
    }
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }
}
