document.addEventListener('DOMContentLoaded', () => {
  // Global Setup
  initGlobalAuth();

  // Page-specific Initializations
  const path = window.location.pathname;
  if (path.includes('login.html')) {
    initLoginPage();
  } else {
    // If not login page, ensure user is authenticated
    checkAuthRedirect();
    initGlobalUI();

    if (path.includes('schedule.html')) {
      initSchedulePage();
    } else if (path.includes('prediction.html')) {
      initPredictionPage();
    } else if (path.includes('score_update.html')) {
      initScoreUpdatePage();
    } else if (path.includes('leaderboard.html')) {
      initLeaderboardPage();
    } else if (path.includes('standings.html')) {
      initStandingsPage();
    } else if (path.includes('index.html') || path.endsWith('/') || path === '') {
      initDashboardPage();
    }
  }
});

// --- AUTHENTICATION GLOBALS ---
function initGlobalAuth() {
  window.getCurrentUser = function () {
    const userStr = localStorage.getItem('fifa_user');
    return userStr ? JSON.parse(userStr) : null;
  };

  window.setCurrentUser = function (user) {
    if (user) {
      localStorage.setItem('fifa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fifa_user');
    }
  };
}

function checkAuthRedirect() {
  const user = window.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
  }
}

// --- GLOBAL UI (Navbar, Dropdowns) ---
function initGlobalUI() {
  const user = window.getCurrentUser();
  if (!user) return;

  // Set Profile Name and Avatar
  const profileNameEl = document.querySelector('.profile-name');
  const profileAvatarEl = document.querySelector('.profile-avatar');

  if (profileNameEl) profileNameEl.textContent = user.username;
  if (profileAvatarEl) profileAvatarEl.textContent = user.username.charAt(0).toUpperCase();

  // Show Admin Settings link only if user role is admin
  const adminSettingsLink = document.getElementById('adminSettingsLink');
  if (adminSettingsLink) {
    adminSettingsLink.style.display = (user.role === 'admin') ? 'block' : 'none';
  }

  // Dynamic menu rewrite for admin
  const navPredictions = document.getElementById('navPredictions');
  const mobNavPredictions = document.getElementById('mobNavPredictions');
  if (user.role === 'admin') {
    if (navPredictions) {
      navPredictions.href = 'score_update.html';
      navPredictions.innerHTML = '<span>⚙️</span> Score Update';
    }
    if (mobNavPredictions) {
      mobNavPredictions.href = 'score_update.html';
      const iconEl = mobNavPredictions.querySelector('.mobile-nav-icon');
      const textEl = mobNavPredictions.querySelector('.mobile-nav-text');
      if (iconEl) iconEl.textContent = '⚙️';
      if (textEl) textEl.textContent = 'Score Update';
    }
  } else {
    if (navPredictions) {
      navPredictions.href = 'prediction.html';
      navPredictions.innerHTML = '<span>🗳️</span> Predictions';
    }
    if (mobNavPredictions) {
      mobNavPredictions.href = 'prediction.html';
      const iconEl = mobNavPredictions.querySelector('.mobile-nav-icon');
      const textEl = mobNavPredictions.querySelector('.mobile-nav-text');
      if (iconEl) iconEl.textContent = '🗳️';
      if (textEl) textEl.textContent = 'Predict';
    }
  }

  // Set active class on navbars automatically
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-link, .mobile-nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && path.includes(href)) {
      link.classList.add('active');
    } else if (href === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html') || path === '')) {
      link.classList.add('active');
    }
  });

  // Profile Dropdown Toggle
  const profileTrigger = document.getElementById('profileTrigger');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      profileDropdown.classList.remove('show');
    });
  }

  // Logout Handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.setCurrentUser(null);
      window.location.href = 'login.html';
    });
  }
}

// --- LOGIN PAGE LOGIC ---
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toRegisterLink = document.getElementById('toRegister');
  const toLoginLink = document.getElementById('toLogin');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // If already logged in, redirect to index
  if (window.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  // Toggle Forms
  if (toRegisterLink && loginForm && registerForm) {
    toRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });
  }

  if (toLoginLink && loginForm && registerForm) {
    toLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
  }

  // Handle Login Submit
  const loginSubmitForm = document.getElementById('loginSubmitForm');
  if (loginSubmitForm) {
    loginSubmitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('username');
      const passwordInputVal = passwordInput.value;
      const errorMsg = document.getElementById('loginError');

      if (errorMsg) errorMsg.textContent = '';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInputVal
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          window.setCurrentUser(result.user);
          window.location.href = 'index.html';
        } else {
          if (errorMsg) errorMsg.textContent = result.message || 'Login failed';
        }
      } catch (err) {
        console.error(err);
        if (errorMsg) errorMsg.textContent = 'Server connection failed';
      }
    });
  }

  // Handle Register Submit
  const registerSubmitForm = document.getElementById('registerSubmitForm');
  if (registerSubmitForm) {
    registerSubmitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const regUsername = document.getElementById('regUsername').value;
      const regPhone = document.getElementById('regPhone').value;
      const regPin = document.getElementById('regPin').value;
      const regConfirmPin = document.getElementById('regConfirmPin').value;
      const errorMsg = document.getElementById('registerError');

      if (errorMsg) errorMsg.textContent = '';

      if (regPin !== regConfirmPin) {
        if (errorMsg) errorMsg.textContent = 'PINs do not match';
        return;
      }

      if (!/^\d{6}$/.test(regPin)) {
        if (errorMsg) errorMsg.textContent = 'PIN must be exactly 6 digits';
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: regUsername,
            phone: regPhone,
            pin: regPin,
            confpin: regConfirmPin
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          alert('Registration successful! Please login.');
          registerForm.style.display = 'none';
          loginForm.style.display = 'block';
        } else {
          if (errorMsg) errorMsg.textContent = result.message || 'Registration failed';
        }
      } catch (err) {
        console.error(err);
        if (errorMsg) errorMsg.textContent = 'Server connection failed';
      }
    });
  }
}

// --- DASHBOARD PAGE LOGIC ---
async function initDashboardPage() {
  const user = window.getCurrentUser();
  if (!user) return;

  // Set personalized welcome message
  const welcomeText = document.getElementById('welcomeText');
  if (welcomeText) {
    welcomeText.textContent = `Welcome Back, ${user.username}!`;
  }

  // Load Dashboard Overview Predictions & Schedules
  try {
    const matchesResponse = await fetch('/api/matches');
    const matches = await matchesResponse.json();

    const predResponse = await fetch(`/api/predictions/${user.username}`);
    const predictions = await predResponse.json();

    // Calculate prediction percentage/stats
    const activeDate = getEarliestActiveDate(matches);
    const upcomingMatches = matches.filter(m => m.status === 'Upcoming' && m.date === activeDate);
    const totalPredictedCount = Object.keys(predictions).length;

    const matchesPredictedEl = document.getElementById('statPredictedMatches');
    if (matchesPredictedEl) {
      matchesPredictedEl.textContent = `${totalPredictedCount} / ${matches.length}`;
    }

    // Populate Quick Predict list on Dashboard
    const dashboardPredictList = document.getElementById('dashboardPredictList');
    if (dashboardPredictList) {
      dashboardPredictList.innerHTML = '';

      const limitUpcoming = upcomingMatches.slice(0, 2);
      if (limitUpcoming.length === 0) {
        dashboardPredictList.innerHTML = '<p style="color:var(--text-muted); font-size: 0.85rem;">No upcoming matches to predict.</p>';
      } else {
        limitUpcoming.forEach(match => {
          const userPred = predictions[match.id];
          const hasPred = !!userPred;
          const predLabel = hasPred ? `${userPred.team1Score} - ${userPred.team2Score}` : 'Not Predicted';

          const card = document.createElement('div');
          card.className = 'glass-card interactive-hover';
          card.style.padding = '1.25rem';
          card.style.marginBottom = '1rem';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
              <span>Group ${match.group} • ${match.date}</span>
              <span class="badge badge-upcoming">${match.status}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
              <span style="font-weight:600; font-size:0.95rem;">
                ${match.team1} vs ${match.team2}
              </span>
              <span style="font-size:0.85rem; font-weight:700; color:${hasPred ? 'var(--accent-green)' : 'var(--text-muted)'};">
                Prediction: ${predLabel}
              </span>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <a href="prediction.html" class="btn btn-outline-green" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                ${hasPred ? 'Edit Prediction' : 'Predict Now'}
              </a>
            </div>
          `;
          dashboardPredictList.appendChild(card);
        });
      }
    }

    // Fetch and populate Leaderboard Preview & User Stats
    try {
      const lbResponse = await fetch('/api/leaderboard');
      const lbEntries = await lbResponse.json();

      // Find current user's entry
      const userEntry = lbEntries.find(e => e.user === user.username);
      if (userEntry) {
        const rankEl = document.getElementById('statUserRank');
        const pointsEl = document.getElementById('statUserPoints');
        const exactEl = document.getElementById('statUserExact');

        if (rankEl) rankEl.textContent = `#${userEntry.rank}`;
        if (pointsEl) pointsEl.textContent = userEntry.totalPoints;
        if (exactEl) exactEl.textContent = userEntry.exactScore;
      }

      // Populate top 3 preview
      const previewContainer = document.getElementById('dashboardLeaderboardPreview');
      if (previewContainer) {
        previewContainer.innerHTML = '';
        const top3 = lbEntries.slice(0, 3);
        if (top3.length === 0) {
          previewContainer.innerHTML = '<p style="color:var(--text-muted); font-size: 0.85rem; text-align:center; padding:1rem;">No participants yet.</p>';
        } else {
          top3.forEach(entry => {
            let medal = '🥉';
            if (entry.rank === 1) medal = '🥇';
            else if (entry.rank === 2) medal = '🥈';

            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '0.75rem 0.5rem';
            row.style.borderBottom = '1px solid var(--border-color)';
            row.innerHTML = `
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.2rem;">${medal}</span>
                <span style="font-weight:600; font-size:0.9rem;">${entry.user}</span>
              </div>
              <span style="font-weight:700; color:var(--accent-green); font-size:0.9rem;">${entry.totalPoints} pts</span>
            `;
            previewContainer.appendChild(row);
          });
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard stats:', err);
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

// --- SCHEDULE PAGE LOGIC ---
async function initSchedulePage() {
  let allMatches = [];
  const searchInput = document.getElementById('searchTeam');
  const groupFilter = document.getElementById('filterGroup');
  const statusFilter = document.getElementById('filterStatus');
  const scheduleTableBody = document.getElementById('scheduleTableBody');

  // Load schedule data
  try {
    const response = await fetch('/api/matches');
    allMatches = await response.json();
    renderSchedule(allMatches);
  } catch (err) {
    console.error('Failed to fetch matches:', err);
    if (scheduleTableBody) {
      scheduleTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff5252;">Failed to load match schedule.</td></tr>';
    }
  }

  // Event Listeners for Filters
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (groupFilter) groupFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);

  function applyFilters() {
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const groupVal = groupFilter ? groupFilter.value : 'All';
    const statusVal = statusFilter ? statusFilter.value : 'All';

    const filtered = allMatches.filter(match => {
      const matchesSearch = match.team1.toLowerCase().includes(searchVal) || match.team2.toLowerCase().includes(searchVal);
      const matchesGroup = groupVal === 'All' || match.group === groupVal;
      const matchesStatus = statusVal === 'All' || match.status === statusVal;

      return matchesSearch && matchesGroup && matchesStatus;
    });

    renderSchedule(filtered);
  }

  function renderSchedule(matchesList) {
    if (!scheduleTableBody) return;
    scheduleTableBody.innerHTML = '';

    if (matchesList.length === 0) {
      scheduleTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 2rem;">No matches found matching the criteria.</td></tr>';
      return;
    }

    matchesList.forEach(match => {
      let statusBadgeClass = 'badge-upcoming';
      if (match.status === 'Live') statusBadgeClass = 'badge-live';
      if (match.status === 'Completed') statusBadgeClass = 'badge-completed';

      let scoreOrVS = `<span class="match-vs">VS</span>`;
      if (match.status === 'Completed' || match.status === 'Live') {
        scoreOrVS = `<span style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; letter-spacing: 2px;">${match.team1Score} - ${match.team2Score}</span>`;
      }

      let actionHTML = '';
      if (match.status === 'Upcoming') {
        actionHTML = `<a href="prediction.html" class="btn btn-outline-green" style="padding: 0.4rem 0.8rem; font-size:0.75rem;">Predict</a>`;
      } else {
        actionHTML = `<button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size:0.75rem;" disabled>Closed</button>`;
      }

      // Flag icons generator
      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="white-space: nowrap;">
          <div style="font-weight: 600;">${match.date}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${match.time}</div>
        </td>
        <td>
          <div class="match-display">
            <div class="team-info">
              <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
              <span>${match.team1}</span>
            </div>
            ${scoreOrVS}
            <div class="team-info">
              <span>${match.team2}</span>
              <img class="flag-icon" src="${flag2Url}" alt="${match.team2}">
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">${match.group}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${match.venue}</td>
        <td>
          <span class="badge ${statusBadgeClass}">${match.status}</span>
        </td>
        <td>
          ${actionHTML}
        </td>
      `;
      scheduleTableBody.appendChild(row);
    });
  }
}

// --- PREDICTIONS PAGE LOGIC ---
async function initPredictionPage() {
  const user = window.getCurrentUser();
  if (!user) return;

  if (user.role === 'admin') {
    window.location.href = 'score_update.html';
    return;
  }

  const predictionMatchesContainer = document.getElementById('predictionMatchesContainer');
  const countdownDays = document.getElementById('countdownDays');
  const countdownHours = document.getElementById('countdownHours');
  const countdownMins = document.getElementById('countdownMins');
  const countdownSecs = document.getElementById('countdownSecs');

  let pagePredictions = {};

  // Countdown timer logic
  // Let's count down to 11 June 2026 01:00 AM (First match of the World Cup)
  const targetDate = new Date('Jun 11, 2026 01:00:00 GMT-0600').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    let difference = targetDate - now;

    // Fallback if target date has passed in the actual year (e.g. testing in late 2026),
    // make a fake rolling 12-hour countdown so the countdown widget always ticks!
    if (difference <= 0) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 12);
      difference = tomorrow.getTime() - now;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((difference % (1000 * 60)) / 1000);

    if (countdownDays) countdownDays.textContent = days.toString().padStart(2, '0');
    if (countdownHours) countdownHours.textContent = hours.toString().padStart(2, '0');
    if (countdownMins) countdownMins.textContent = mins.toString().padStart(2, '0');
    if (countdownSecs) countdownSecs.textContent = secs.toString().padStart(2, '0');
  }

  // Start ticking
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Load matches and existing predictions
  try {
    const matchesResponse = await fetch('/api/matches');
    const matches = await matchesResponse.json();

    const predResponse = await fetch(`/api/predictions/${user.username}`);
    pagePredictions = await predResponse.json();

    // Render list of predict cards
    const activeDate = getEarliestActiveDate(matches);
    const upcomingMatches = matches.filter(m => m.status === 'Upcoming' && m.date === activeDate);

    // Update page subtitle to show active date
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle && activeDate) {
      pageSubtitle.textContent = `Active Matchday: ${activeDate} (Submit predictions before matches kick off)`;
    }

    // Set statistics
    const totalTodayMatchesEl = document.getElementById('statTotalMatches');
    const userPredictedMatchesEl = document.getElementById('statUserPredicted');

    if (totalTodayMatchesEl) totalTodayMatchesEl.textContent = upcomingMatches.length;
    
    // Count predictions for currently displayed active matches
    let predictedCountForActiveDate = 0;
    upcomingMatches.forEach(m => {
      if (pagePredictions[m.id]) predictedCountForActiveDate++;
    });
    if (userPredictedMatchesEl) userPredictedMatchesEl.textContent = predictedCountForActiveDate;

    renderPredictCards(upcomingMatches);
  } catch (err) {
    console.error('Failed to load predictions page:', err);
  }

  function renderPredictCards(upcomingList) {
    if (!predictionMatchesContainer) return;
    predictionMatchesContainer.innerHTML = '';

    if (upcomingList.length === 0) {
      predictionMatchesContainer.innerHTML = '<p style="text-align:center; padding: 3rem 0; color:var(--text-muted);">No upcoming matches available for predictions at this moment.</p>';
      return;
    }

    upcomingList.forEach(match => {
      const pred = pagePredictions[match.id] || { team1Score: 0, team2Score: 0 };

      // Initialize internal store for score inputs
      if (!pagePredictions[match.id]) {
        pagePredictions[match.id] = pred;
      }

      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

      const card = document.createElement('div');
      card.className = 'match-predict-card';
      card.innerHTML = `
        <div class="predict-header">
          <span>Group ${match.group} • ${match.venue}</span>
          <span>Deadline: ${match.date} | ${match.time}</span>
        </div>
        <div class="predict-body">
          <div class="predict-team">
            <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
            <span class="predict-team-name">${match.team1}</span>
          </div>

          <div class="predict-inputs">
            <div class="score-stepper">
              <button class="stepper-btn dec" data-match-id="${match.id}" data-team="1" type="button">-</button>
              <input class="score-input" data-match-id="${match.id}" data-team="1" type="number" min="0" value="${pred.team1Score}">
              <button class="stepper-btn inc" data-match-id="${match.id}" data-team="1" type="button">+</button>
            </div>
            
            <span class="predict-vs-text">VS</span>
            
            <div class="score-stepper">
              <button class="stepper-btn dec" data-match-id="${match.id}" data-team="2" type="button">-</button>
              <input class="score-input" data-match-id="${match.id}" data-team="2" type="number" min="0" value="${pred.team2Score}">
              <button class="stepper-btn inc" data-match-id="${match.id}" data-team="2" type="button">+</button>
            </div>
          </div>

          <div class="predict-team team-right">
            <img class="flag-icon" src="${flag2Url}" alt="${match.team2}">
            <span class="predict-team-name">${match.team2}</span>
          </div>
        </div>
      `;
      predictionMatchesContainer.appendChild(card);
    });

    // Add Stepper click listeners
    const stepperBtns = predictionMatchesContainer.querySelectorAll('.stepper-btn');
    stepperBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const matchId = btn.getAttribute('data-match-id');
        const team = btn.getAttribute('data-team');
        const isInc = btn.classList.contains('inc');
        const input = predictionMatchesContainer.querySelector(`input[data-match-id="${matchId}"][data-team="${team}"]`);

        if (input) {
          let val = parseInt(input.value) || 0;
          if (isInc) {
            val += 1;
          } else {
            val = Math.max(0, val - 1);
          }
          input.value = val;
          updateLocalPredictionStore(matchId, team, val);
        }
      });
    });

    // Add Input change listeners
    const scoreInputs = predictionMatchesContainer.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
      input.addEventListener('change', () => {
        const matchId = input.getAttribute('data-match-id');
        const team = input.getAttribute('data-team');
        let val = parseInt(input.value);
        if (isNaN(val) || val < 0) {
          val = 0;
        }
        input.value = val;
        updateLocalPredictionStore(matchId, team, val);
      });
    });
  }

  function updateLocalPredictionStore(matchId, team, value) {
    if (!pagePredictions[matchId]) {
      pagePredictions[matchId] = { team1Score: 0, team2Score: 0 };
    }
    if (team === "1") {
      pagePredictions[matchId].team1Score = value;
    } else {
      pagePredictions[matchId].team2Score = value;
    }
  }

  // Submit Logic
  const submitPredictionsBtn = document.getElementById('submitPredictionsBtn');
  if (submitPredictionsBtn) {
    submitPredictionsBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            predictions: pagePredictions
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          alert('Success! Your predictions have been saved.');
          // Update prediction count statistic
          const userPredictedMatchesEl = document.getElementById('statUserPredicted');
          if (userPredictedMatchesEl) {
            userPredictedMatchesEl.textContent = Object.keys(pagePredictions).length;
          }
        } else {
          alert('Failed to save predictions: ' + result.message);
        }
      } catch (err) {
        console.error(err);
        alert('Server connection failed. Could not save predictions.');
      }
    });
  }
}

// --- LEADERBOARD PAGE LOGIC ---
async function initLeaderboardPage() {
  const leaderboardTableBody = document.getElementById('leaderboardTableBody');

  try {
    const response = await fetch('/api/leaderboard');
    const rankingList = await response.json();

    if (leaderboardTableBody) {
      leaderboardTableBody.innerHTML = '';

      rankingList.forEach(row => {
        let rankHTML = `<span class="rank-cell">${row.rank}</span>`;
        if (row.rank === 1) {
          rankHTML = `<span class="rank-podium">🥇</span>`;
        } else if (row.rank === 2) {
          rankHTML = `<span class="rank-podium">🥈</span>`;
        } else if (row.rank === 3) {
          rankHTML = `<span class="rank-podium">🥉</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${rankHTML}</td>
          <td>
            <div class="user-cell">
              <span class="user-avatar">${row.avatar}</span>
              <span>${row.user}</span>
            </div>
          </td>
          <td class="points-cell">${row.totalPoints} pts</td>
          <td style="text-align:center;">${row.exactScore}</td>
          <td style="text-align:center;">${row.correctWinner}</td>
          <td style="text-align:center;">${row.matchesPlayed}</td>
        `;
        leaderboardTableBody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    if (leaderboardTableBody) {
      leaderboardTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff5252;">Failed to load standings.</td></tr>';
    }
  }
}

// --- STANDINGS PAGE LOGIC ---
async function initStandingsPage() {
  const standingsContainer = document.getElementById('standingsContainer');

  try {
    const response = await fetch('/api/standings');
    const standings = await response.json();

    if (standingsContainer) {
      standingsContainer.innerHTML = '';

      Object.entries(standings).forEach(([groupLetter, groupTeams]) => {
        const groupCard = document.createElement('div');
        groupCard.className = 'glass-card';
        groupCard.style.padding = '0'; // Custom inner padding for tabular structure

        let tableRowsHTML = '';
        groupTeams.forEach((team, index) => {
          // Flag icon
          const flagUrl = `https://flagcdn.com/24x18/${team.code}.png`;

          tableRowsHTML += `
            <tr>
              <td><span class="rank-num">${index + 1}</span></td>
              <td class="team-col">
                <div class="team-cell">
                  <img class="flag-icon" src="${flagUrl}" alt="${team.name}">
                  <span class="team-name">${team.name}</span>
                </div>
              </td>
              <td>${team.played}</td>
              <td>${team.wins}</td>
              <td>${team.draws}</td>
              <td>${team.losses}</td>
              <td>${team.gf}</td>
              <td>${team.ga}</td>
              <td>${team.gd > 0 ? '+' + team.gd : team.gd}</td>
              <td><span class="pts-val">${team.pts}</span></td>
            </tr>
          `;
        });

        groupCard.innerHTML = `
          <div class="group-header">
            <h3 class="group-title"><span>🏆</span> Group ${groupLetter}</h3>
          </div>
          <div class="table-responsive">
            <table class="standings-table">
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th class="team-col" style="width: 40%;">Team</th>
                  <th style="width: 7%;">P</th>
                  <th style="width: 7%;">W</th>
                  <th style="width: 7%;">D</th>
                  <th style="width: 7%;">L</th>
                  <th style="width: 7%;">GF</th>
                  <th style="width: 7%;">GA</th>
                  <th style="width: 8%;">GD</th>
                  <th style="width: 10%;">Pts</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHTML}
              </tbody>
            </table>
          </div>
        `;
        standingsContainer.appendChild(groupCard);
      });
    }
  } catch (err) {
    console.error('Failed to load standings:', err);
    if (standingsContainer) {
      standingsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #ff5252;">Failed to load standings from the server.</div>';
    }
  }
}
function getEarliestActiveDate(matches) {
  const activeMatches = matches.filter(m => m.status === 'Upcoming' || m.status === 'Live');
  if (activeMatches.length === 0) return null;

  let earliestTime = Infinity;
  let earliestDateStr = null;

  activeMatches.forEach(m => {
    const time = new Date(m.date).getTime();
    if (time < earliestTime) {
      earliestTime = time;
      earliestDateStr = m.date;
    }
  });

  return earliestDateStr;
}

// --- ADMIN SCORE UPDATE PAGE LOGIC ---
async function initScoreUpdatePage() {
  const user = window.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const adminMatchesContainer = document.getElementById('adminMatchesContainer');
  const statUpcomingMatches = document.getElementById('statUpcomingMatches');
  const statLiveMatches = document.getElementById('statLiveMatches');
  const statCompletedMatches = document.getElementById('statCompletedMatches');

  if (!adminMatchesContainer) return;

  try {
    const response = await fetch('/api/matches');
    const matches = await response.json();

    // Populate stats
    let upcomingCount = 0;
    let liveCount = 0;
    let completedCount = 0;

    matches.forEach(m => {
      if (m.status === 'Upcoming') upcomingCount++;
      else if (m.status === 'Live') liveCount++;
      else if (m.status === 'Completed') completedCount++;
    });

    if (statUpcomingMatches) statUpcomingMatches.textContent = upcomingCount;
    if (statLiveMatches) statLiveMatches.textContent = liveCount;
    if (statCompletedMatches) statCompletedMatches.textContent = completedCount;

    renderAdminMatchCards(matches);
  } catch (err) {
    console.error('Failed to load admin matches:', err);
    adminMatchesContainer.innerHTML = '<p style="text-align:center; padding: 3rem 0; color:#ff5252;">Failed to load match schedule.</p>';
  }

  function renderAdminMatchCards(matchesList) {
    adminMatchesContainer.innerHTML = '';
    if (matchesList.length === 0) {
      adminMatchesContainer.innerHTML = '<p style="text-align:center; padding: 3rem 0; color:var(--text-muted);">No matches found.</p>';
      return;
    }

    matchesList.forEach(match => {
      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

      const card = document.createElement('div');
      card.className = 'match-predict-card admin-card';
      card.innerHTML = `
        <div class="predict-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Group ${match.group} • ${match.venue}</span>
          <span style="font-weight: 700; color: var(--accent-green);">${match.date} | ${match.time}</span>
        </div>
        <div class="predict-body">
          <div class="predict-team">
            <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
            <span class="predict-team-name">${match.team1}</span>
          </div>

          <div class="predict-inputs">
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%;">
              <div class="score-stepper">
                <button class="stepper-btn dec" data-match-id="${match.id}" data-team="1" type="button">-</button>
                <input class="score-input" data-match-id="${match.id}" data-team="1" type="number" min="0" value="${match.team1Score !== null && match.team1Score !== undefined ? match.team1Score : 0}">
                <button class="stepper-btn inc" data-match-id="${match.id}" data-team="1" type="button">+</button>
              </div>
              
              <span class="predict-vs-text" style="font-size: 0.85rem; margin: 0 0.25rem;">-</span>
              
              <div class="score-stepper">
                <button class="stepper-btn dec" data-match-id="${match.id}" data-team="2" type="button">-</button>
                <input class="score-input" data-match-id="${match.id}" data-team="2" type="number" min="0" value="${match.team2Score !== null && match.team2Score !== undefined ? match.team2Score : 0}">
                <button class="stepper-btn inc" data-match-id="${match.id}" data-team="2" type="button">+</button>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
              <select class="status-select" data-match-id="${match.id}">
                <option value="Upcoming" ${match.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                <option value="Live" ${match.status === 'Live' ? 'selected' : ''}>Live</option>
                <option value="Completed" ${match.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
              <button class="btn btn-primary update-match-btn" data-match-id="${match.id}" type="button">Update</button>
            </div>
          </div>

          <div class="predict-team team-right">
            <img class="flag-icon" src="${flag2Url}" alt="${match.team2}">
            <span class="predict-team-name">${match.team2}</span>
          </div>
        </div>
      `;
      adminMatchesContainer.appendChild(card);
    });

    // Add Stepper click listeners
    const stepperBtns = adminMatchesContainer.querySelectorAll('.stepper-btn');
    stepperBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const matchId = btn.getAttribute('data-match-id');
        const team = btn.getAttribute('data-team');
        const isInc = btn.classList.contains('inc');
        const input = adminMatchesContainer.querySelector(`input[data-match-id="${matchId}"][data-team="${team}"]`);

        if (input) {
          let val = parseInt(input.value) || 0;
          if (isInc) {
            val += 1;
          } else {
            val = Math.max(0, val - 1);
          }
          input.value = val;
        }
      });
    });

    // Add Input change listeners
    const scoreInputs = adminMatchesContainer.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
      input.addEventListener('change', () => {
        const matchId = input.getAttribute('data-match-id');
        const team = input.getAttribute('data-team');
        let val = parseInt(input.value);
        if (isNaN(val) || val < 0) {
          val = 0;
        }
        input.value = val;
      });
    });

    // Add Update click listeners
    const updateBtns = adminMatchesContainer.querySelectorAll('.update-match-btn');
    updateBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const matchId = parseInt(btn.getAttribute('data-match-id'));
        const input1 = adminMatchesContainer.querySelector(`input[data-match-id="${matchId}"][data-team="1"]`);
        const input2 = adminMatchesContainer.querySelector(`input[data-match-id="${matchId}"][data-team="2"]`);
        const statusSelect = adminMatchesContainer.querySelector(`select[data-match-id="${matchId}"]`);

        if (input1 && input2 && statusSelect) {
          const team1Score = parseInt(input1.value) || 0;
          const team2Score = parseInt(input2.value) || 0;
          const status = statusSelect.value;

          try {
            const updateResponse = await fetch('/api/admin/matches/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: user.username,
                matchId,
                team1Score,
                team2Score,
                status
              })
            });

            const result = await updateResponse.json();
            if (updateResponse.ok && result.success) {
              alert(`Match ${matchId} updated successfully!`);
              // Reload page-specific stats dynamically
              const matchesResponse = await fetch('/api/matches');
              const matches = await matchesResponse.json();
              let upcomingCount = 0;
              let liveCount = 0;
              let completedCount = 0;

              matches.forEach(m => {
                if (m.status === 'Upcoming') upcomingCount++;
                else if (m.status === 'Live') liveCount++;
                else if (m.status === 'Completed') completedCount++;
              });

              if (statUpcomingMatches) statUpcomingMatches.textContent = upcomingCount;
              if (statLiveMatches) statLiveMatches.textContent = liveCount;
              if (statCompletedMatches) statCompletedMatches.textContent = completedCount;
            } else {
              alert('Failed to update match: ' + result.message);
            }
          } catch (err) {
            console.error('Update match failed:', err);
            alert('Server error: failed to update match.');
          }
        }
      });
    });
  }
}