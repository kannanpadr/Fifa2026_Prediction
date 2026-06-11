// Global Toast Notification System
window.showToast = function (message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '24px';
    container.style.right = '24px';
    container.style.zIndex = '99999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.background = type === 'success' ? 'rgba(0, 230, 118, 0.95)' : 'rgba(239, 83, 80, 0.95)';
  toast.style.color = type === 'success' ? '#070d19' : '#ffffff';
  toast.style.padding = '14px 28px';
  toast.style.borderRadius = '12px';
  toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  toast.style.fontSize = '0.9rem';
  toast.style.fontWeight = '700';
  toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  toast.style.transform = 'translateX(120%)';
  toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.opacity = '0';

  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger entering animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 50);

  // Hide and remove after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 4000);
};

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
    } else if (path.includes('games.html')) {
      initGamesPage();
    } else if (path.includes('score_update.html')) {
      initScoreUpdatePage();
    } else if (path.includes('settings.html')) {
      initSettingsPage();
    } else if (path.includes('admin_predictions.html')) {
      initAdminPredictionsPage();
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
  if (!user || !user.token) {
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

  const adminPredictionsLink = document.getElementById('adminPredictionsLink');
  if (adminPredictionsLink) {
    adminPredictionsLink.style.display = (user.role === 'admin') ? 'block' : 'none';
  }

  // Dynamic menu rewrite for admin
  const navPredictions = document.getElementById('navPredictions');
  const mobNavPredictions = document.getElementById('mobNavPredictions');
  if (user.role === 'admin') {
    if (navPredictions) {
      navPredictions.href = 'score_update.html';
      navPredictions.innerHTML = '<span>⚙️</span> Score Mgmt';
    }
    if (mobNavPredictions) {
      mobNavPredictions.href = 'score_update.html';
      const iconEl = mobNavPredictions.querySelector('.mobile-nav-icon');
      const textEl = mobNavPredictions.querySelector('.mobile-nav-text');
      if (iconEl) iconEl.textContent = '⚙️';
      if (textEl) textEl.textContent = 'Score Mgmt';
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

  // Tab Switcher Logic
  const tabUser = document.getElementById('tabUser');
  const tabAdmin = document.getElementById('tabAdmin');
  const usernameLabel = document.getElementById('usernameLabel');
  const usernameInput = document.getElementById('username');
  const usernameIcon = document.getElementById('usernameIcon');
  const passwordLabel = document.getElementById('passwordLabel');
  const signupPrompt = document.getElementById('signupPrompt');
  const adminHelperText = document.getElementById('adminHelperText');
  const loginError = document.getElementById('loginError');

  let activeRole = 'user'; // 'user' or 'admin'

  if (tabUser && tabAdmin) {
    tabUser.addEventListener('click', () => {
      if (activeRole === 'user') return;
      activeRole = 'user';
      tabUser.classList.add('active');
      tabAdmin.classList.remove('active');
      
      // Update UI for User Mode
      if (usernameLabel) usernameLabel.textContent = 'Mobile number';
      if (usernameInput) {
        usernameInput.placeholder = 'Enter mobile number';
        usernameInput.type = 'text';
        usernameInput.value = '';
      }
      if (usernameIcon) usernameIcon.textContent = '👤';
      if (passwordLabel) passwordLabel.textContent = 'Password';
      if (signupPrompt) signupPrompt.style.display = 'block';
      if (adminHelperText) adminHelperText.style.display = 'none';
      if (loginError) loginError.textContent = '';
      passwordInput.value = '';
    });

    tabAdmin.addEventListener('click', () => {
      if (activeRole === 'admin') return;
      activeRole = 'admin';
      tabAdmin.classList.add('active');
      tabUser.classList.remove('active');
      
      // Update UI for Admin Mode
      if (usernameLabel) usernameLabel.textContent = 'Admin Username / Phone';
      if (usernameInput) {
        usernameInput.placeholder = 'Enter admin username';
        usernameInput.type = 'text';
        usernameInput.value = '';
      }
      if (usernameIcon) usernameIcon.textContent = '🛡️';
      if (passwordLabel) passwordLabel.textContent = 'PIN / Password';
      if (signupPrompt) signupPrompt.style.display = 'none';
      if (adminHelperText) adminHelperText.style.display = 'block';
      if (loginError) loginError.textContent = '';
      passwordInput.value = '';
    });
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
          showToast('Registration successful! Please login.', 'success');
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

  // Fetch and display page visits count
  try {
    const visitsResponse = await fetch('/api/visits');
    const visitsData = await visitsResponse.json();
    const countValEl = document.getElementById('visitCountVal');
    if (countValEl) {
      countValEl.textContent = visitsData.count;
    }
  } catch (err) {
    console.error('Failed to fetch visits count:', err);
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

      const limitUpcoming = upcomingMatches;
      if (limitUpcoming.length === 0) {
        dashboardPredictList.innerHTML = '<p style="color:var(--text-muted); font-size: 0.85rem;">No upcoming matches to predict.</p>';
      } else {
        limitUpcoming.forEach(match => {
          const userPred = predictions[match.id];
          const hasPred = !!userPred;
          const predLabel = hasPred ? `${userPred.team1Score} - ${userPred.team2Score}` : 'Not Predicted';

          // Calculate 24-hour prediction window for this match
          const kickoff = new Date(match.date + ' ' + match.time + ' GMT+0530').getTime();
          const now = new Date().getTime();
          const isOpen = (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
          const isClosed = now >= kickoff;

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
              ${isOpen ? `
                <a href="prediction.html" class="btn btn-outline-green" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                  ${hasPred ? 'Edit Prediction' : 'Predict Now'}
                </a>
              ` : `
                <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" disabled>
                  ${isClosed ? 'Closed' : 'Not Open'}
                </button>
              `}
            </div>
          `;
          dashboardPredictList.appendChild(card);
        });

        // Auto-scroll loop if there are more than 2 fixtures
        if (limitUpcoming.length > 2) {
          dashboardPredictList.style.maxHeight = '320px';
          dashboardPredictList.style.overflowY = 'hidden';
          dashboardPredictList.style.position = 'relative';

          // Clone elements for seamless loop
          const originalCount = dashboardPredictList.children.length;
          for (let i = 0; i < originalCount; i++) {
            const clone = dashboardPredictList.children[i].cloneNode(true);
            dashboardPredictList.appendChild(clone);
          }

          let scrollSpeed = 0.5; // Slow smooth scroll
          let scrollInterval = 25; // Millisecond steps
          let scrollPos = 0;
          let hoverPaused = false;

          dashboardPredictList.addEventListener('mouseenter', () => { hoverPaused = true; });
          dashboardPredictList.addEventListener('mouseleave', () => { hoverPaused = false; });

          const scrollTicker = () => {
            if (hoverPaused) return;
            scrollPos += scrollSpeed;
            const halfHeight = dashboardPredictList.scrollHeight / 2;
            if (halfHeight > 0 && scrollPos >= halfHeight) {
              scrollPos = 0;
            }
            dashboardPredictList.scrollTop = Math.floor(scrollPos);
          };

          setInterval(scrollTicker, scrollInterval);
        }
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

      // Find kickoff time and check 24-hour prediction window
      const kickoff = new Date(match.date + ' ' + match.time + ' GMT+0530').getTime();
      const now = new Date().getTime();
      const isOpen = (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
      const isClosed = now >= kickoff;
 
      let actionHTML = '';
      if (match.status === 'Upcoming' && isOpen) {
        actionHTML = `<a href="prediction.html" class="btn btn-outline-green" style="padding: 0.4rem 0.8rem; font-size:0.75rem;">Predict</a>`;
      } else {
        actionHTML = `<button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size:0.75rem;" disabled>${isClosed ? 'Closed' : 'Not Open'}</button>`;
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
  // Let's count down to the first match of the World Cup in IST
  const targetDate = new Date('Jun 07, 2026 10:00:00 GMT+0530').getTime();

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

    // Calculate if any match is open for prediction within its 24h window
    const now = new Date().getTime();
    const anyOpen = upcomingMatches.some(m => {
      const kickoff = new Date(m.date + ' ' + m.time + ' GMT+0530').getTime();
      return (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
    });
 
    // Update page subtitle to show active date
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle && activeDate) {
      if (anyOpen) {
        pageSubtitle.textContent = `Active Matchday: ${activeDate} (Enter predictions for open matches)`;
        pageSubtitle.style.color = '';
      } else {
        pageSubtitle.textContent = `Active Matchday: ${activeDate} (No matches currently open for prediction)`;
        pageSubtitle.style.color = '#ff5252';
      }
    }
 
    // Disable main submit button if no matches are open
    const submitPredictionsBtn = document.getElementById('submitPredictionsBtn');
    if (submitPredictionsBtn) {
      if (!anyOpen) {
        submitPredictionsBtn.disabled = true;
        submitPredictionsBtn.textContent = 'PREDICTIONS LOCKED (OUTSIDE WINDOW)';
        submitPredictionsBtn.style.opacity = '0.6';
        submitPredictionsBtn.style.cursor = 'not-allowed';
      } else {
        submitPredictionsBtn.disabled = false;
        submitPredictionsBtn.textContent = 'SUBMIT PREDICTIONS';
        submitPredictionsBtn.style.opacity = '';
        submitPredictionsBtn.style.cursor = '';
      }
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
 
    renderPredictCards(upcomingMatches, now);
  } catch (err) {
    console.error('Failed to load predictions page:', err);
  }

  function renderPredictCards(upcomingList, now) {
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

      // Calculate state for this specific match
      const kickoff = new Date(match.date + ' ' + match.time + ' GMT+0530').getTime();
      const isOpen = (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
      const isClosed = now >= kickoff;
      const isNotOpenYet = now < kickoff - 24 * 60 * 60 * 1000;
 
      const isDisabled = isOpen ? '' : 'disabled';
 
      // Visual badge
      let badgeHTML = '';
      if (isOpen) {
        badgeHTML = `<span class="badge" style="background-color: var(--accent-green); color: black; font-weight: 700; padding: 2px 8px; border-radius: 4px;">Open</span>`;
      } else if (isClosed) {
        badgeHTML = `<span class="badge" style="background-color: #ff5252; color: white; font-weight: 700; padding: 2px 8px; border-radius: 4px;">Closed</span>`;
      } else if (isNotOpenYet) {
        badgeHTML = `<span class="badge" style="background-color: #555; color: #ccc; font-weight: 700; padding: 2px 8px; border-radius: 4px;">Not Open</span>`;
      }
 
      const card = document.createElement('div');
      card.className = 'match-predict-card';
      card.innerHTML = `
        <div class="predict-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Group ${match.group} • ${match.venue}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>Deadline: ${match.date} | ${match.time}</span>
            ${badgeHTML}
          </div>
        </div>
        <div class="predict-body">
          <div class="predict-team">
            <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
            <span class="predict-team-name">${match.team1}</span>
          </div>
 
          <div class="predict-inputs">
            <div class="score-stepper">
              <button class="stepper-btn dec" data-match-id="${match.id}" data-team="1" type="button" ${isDisabled}>-</button>
              <input class="score-input" data-match-id="${match.id}" data-team="1" type="number" min="0" value="${pred.team1Score}" ${isDisabled}>
              <button class="stepper-btn inc" data-match-id="${match.id}" data-team="1" type="button" ${isDisabled}>+</button>
            </div>
            
            <span class="predict-vs-text">VS</span>
            
            <div class="score-stepper">
              <button class="stepper-btn dec" data-match-id="${match.id}" data-team="2" type="button" ${isDisabled}>-</button>
              <input class="score-input" data-match-id="${match.id}" data-team="2" type="number" min="0" value="${pred.team2Score}" ${isDisabled}>
              <button class="stepper-btn inc" data-match-id="${match.id}" data-team="2" type="button" ${isDisabled}>+</button>
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
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            username: user.username,
            token: user.token,
            predictions: pagePredictions
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          showToast('Success! Your predictions have been saved.', 'success');
          // Update prediction count statistic
          const userPredictedMatchesEl = document.getElementById('statUserPredicted');
          if (userPredictedMatchesEl) {
            userPredictedMatchesEl.textContent = Object.keys(pagePredictions).length;
          }
        } else {
          showToast('Failed to save predictions: ' + result.message, 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Server connection failed. Could not save predictions.', 'error');
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
  const now = new Date().getTime();
  const activeMatches = matches.filter(m => {
    const kickoff = new Date(m.date + ' ' + m.time + ' GMT+0530').getTime();
    return (m.status === 'Upcoming' || m.status === 'Live') && (now < kickoff);
  });

  if (activeMatches.length === 0) {
    if (matches.length === 0) return null;
    let latestTime = 0;
    let latestDateStr = null;
    matches.forEach(m => {
      const time = new Date(m.date).getTime();
      if (time > latestTime) {
        latestTime = time;
        latestDateStr = m.date;
      }
    });
    return latestDateStr;
  }

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

// --- ADMIN SCORE MGMT PAGE LOGIC ---
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
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({
                username: user.username,
                token: user.token,
                matchId,
                team1Score,
                team2Score,
                status
              })
            });

            const result = await updateResponse.json();
            if (updateResponse.ok && result.success) {
              showToast(`Match ${matchId} updated successfully!`, 'success');
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
              showToast('Failed to update match: ' + result.message, 'error');
            }
          } catch (err) {
            console.error('Update match failed:', err);
            showToast('Server error: failed to update match.', 'error');
          }
        }
      });
    });
  }
}

// --- GAMES PAGE LOGIC ---
async function initGamesPage() {
  const container = document.getElementById('gamesContainer');
  const filterSelect = document.getElementById('gamesStatusFilter');
  if (!container) return;

  let allMatches = [];

  try {
    const response = await fetch('/api/matches');
    allMatches = await response.json();
    renderGames(allMatches);

    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const val = filterSelect.value;
        if (val === 'All') {
          renderGames(allMatches);
        } else {
          const filtered = allMatches.filter(m => m.status === val);
          renderGames(filtered);
        }
      });
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="glass-card" style="color: #ff5252; text-align: center; padding: 3rem;">Failed to load matches.</div>';
  }

  function renderGames(matchesList) {
    container.innerHTML = '';
    if (matchesList.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 4rem;">
          <span style="font-size: 3.5rem; display: block; margin-bottom: 1.5rem;">⚽</span>
          <h3 style="margin-bottom: 0.75rem; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700;">No Matches Found</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">There are no matches under the selected filter.</p>
        </div>`;
      return;
    }

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    grid.style.gap = '1.5rem';

    // Special Mini Soccer Showdown Promo Tile
    const gameCard = document.createElement('div');
    gameCard.className = 'glass-card interactive-hover';
    gameCard.style.padding = '1.75rem';
    gameCard.style.cursor = 'pointer';
    gameCard.style.border = '1px dashed var(--accent-green)';
    gameCard.style.display = 'flex';
    gameCard.style.flexDirection = 'column';
    gameCard.style.justifyContent = 'space-between';
    gameCard.addEventListener('click', () => {
      window.location.href = 'football.html';
    });
    gameCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Mini Game</span>
        <span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🎮</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--accent-green); margin-bottom: 2px;">Mini Soccer Showdown</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Defeat the AI in a physics-based soccer match!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.25rem;">
        Click to play this game for fun!
      </div>
    `;
    grid.appendChild(gameCard);

    // Penalty Shootout Promo Tile
    const penaltyCard = document.createElement('div');
    penaltyCard.className = 'glass-card interactive-hover';
    penaltyCard.style.padding = '1.75rem';
    penaltyCard.style.cursor = 'pointer';
    penaltyCard.style.border = '1px dashed var(--accent-green)';
    penaltyCard.style.display = 'flex';
    penaltyCard.style.flexDirection = 'column';
    penaltyCard.style.justifyContent = 'space-between';
    penaltyCard.addEventListener('click', () => {
      window.location.href = 'penalty.html';
    });
    penaltyCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Penalty Shootout</span>
        <span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🎯</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--accent-green); margin-bottom: 2px;">Penalty Challenge</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Beat the keeper in a 5-shot penalty shootout!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.25rem;">
        Click to play this game for fun!
      </div>
    `;
    grid.appendChild(penaltyCard);

    // Quiz Game Promo Tile
    const quizCard = document.createElement('div');
    quizCard.className = 'glass-card interactive-hover';
    quizCard.style.padding = '1.75rem';
    quizCard.style.cursor = 'pointer';
    quizCard.style.border = '1px dashed var(--accent-green)';
    quizCard.style.display = 'flex';
    quizCard.style.flexDirection = 'column';
    quizCard.style.justifyContent = 'space-between';
    quizCard.addEventListener('click', () => {
      window.location.href = 'quiz.html';
    });
    quizCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 World Cup Quiz</span>
        <span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY DAILY</span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🧠</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--accent-green); margin-bottom: 2px;">World Cup Quiz</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Answer trivia questions daily for a chance to win prizes!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.25rem;">
        Click to test your skills and compete with others.
      </div>
    `;
    grid.appendChild(quizCard);

    // Show only the 3 game tiles to make a single row (0 matches)
    const firstRowMatches = matchesList.slice(0, 0);

    firstRowMatches.forEach(match => {
      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

      // Status badge class
      let statusBadgeClass = 'badge-upcoming';
      if (match.status === 'Live') statusBadgeClass = 'badge-live';
      if (match.status === 'Completed') statusBadgeClass = 'badge-completed';

      let scoreHTML = '';
      if (match.status === 'Completed' || match.status === 'Live') {
        scoreHTML = `
          <div style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; background: rgba(0, 230, 118, 0.15); padding: 6px 16px; border-radius: 8px; color: var(--accent-green); letter-spacing: 2px;">
            ${match.team1Score} - ${match.team2Score}
          </div>`;
      } else {
        scoreHTML = `
          <div style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; background: rgba(255, 255, 255, 0.05); padding: 6px 14px; border-radius: 8px; color: var(--text-muted); letter-spacing: 1px;">
            VS
          </div>`;
      }

      const card = document.createElement('div');
      card.className = 'glass-card interactive-hover';
      card.style.padding = '1.75rem';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
          <span>Group ${match.group} • ${match.venue}</span>
          <span class="badge ${statusBadgeClass}">${match.status}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 0.5rem;">
          <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
            <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
            <span style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 600;">${match.team1}</span>
          </div>
          ${scoreHTML}
          <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-direction: row-reverse; text-align: right;">
            <img class="flag-icon" src="${flag2Url}" alt="${match.team2}">
            <span style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 600;">${match.team2}</span>
          </div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.25rem;">
          Kickoff: ${match.date} • ${match.time} (IST)
        </div>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Render Weekly Quiz Leaderboard on games.html
    const leaderboardSection = document.getElementById('quizLeaderboardSection');
    if (leaderboardSection) {
      leaderboardSection.style.display = 'block';
      const user = window.getCurrentUser();
      
      fetch('/api/quiz/weekly-leaderboard')
        .then(res => res.json())
        .then(leaderboard => {
          const header = document.getElementById('leaderboardHeader');
          const body = document.getElementById('leaderboardBody');
          if (header && body) {
            const isAdmin = user && user.role === 'admin';
            if (isAdmin) {
              header.innerHTML = `
                <tr>
                  <th style="padding: 1rem 0.75rem; width: 10%;">Rank</th>
                  <th style="padding: 1rem 0.75rem;">User</th>
                  <th style="padding: 1rem 0.75rem; text-align: center; width: 15%;">Plays</th>
                  <th style="padding: 1rem 0.75rem; text-align: center; width: 20%;">Scores</th>
                  <th style="padding: 1rem 0.75rem; text-align: center; width: 20%;">Avg Time</th>
                  <th style="padding: 1rem 0.75rem; text-align: right; width: 15%;">Points</th>
                </tr>`;
            } else {
              header.innerHTML = `
                <tr>
                  <th style="padding: 1rem 0.75rem; width: 15%;">Rank</th>
                  <th style="padding: 1rem 0.75rem;">Username</th>
                  <th style="padding: 1rem 0.75rem; text-align: center; width: 25%;">Days Played</th>
                  <th style="padding: 1rem 0.75rem; text-align: right; width: 20%;">Points</th>
                </tr>`;
            }

            body.innerHTML = '';
            if (leaderboard.length === 0) {
              body.innerHTML = `<tr><td colspan="${isAdmin ? 6 : 4}" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No submissions yet this week.</td></tr>`;
            } else {
              leaderboard.forEach(entry => {
                const isWinner = entry.rank === 1;
                const row = document.createElement('tr');
                if (isWinner) {
                  row.style.background = 'rgba(255, 215, 0, 0.03)';
                }
                
                if (isAdmin) {
                  row.innerHTML = `
                    <td style="padding: 1rem 0.75rem; font-weight: 700; color: ${isWinner ? '#ffd700' : 'var(--text-muted)'};">
                      ${isWinner ? '👑 1' : entry.rank}
                    </td>
                    <td style="padding: 1rem 0.75rem; font-weight: 600; color: ${isWinner ? '#ffd700' : 'var(--text-main)'};">
                      ${entry.username}
                    </td>
                    <td style="padding: 1rem 0.75rem; text-align: center; color: var(--text-muted);">${entry.attempts}</td>
                    <td style="padding: 1rem 0.75rem; text-align: center;">${entry.totalScore} / ${entry.attempts * 5}</td>
                    <td style="padding: 1rem 0.75rem; text-align: center; color: var(--text-muted);">${entry.avgTime}s</td>
                    <td style="padding: 1rem 0.75rem; text-align: right; font-weight: 700; color: var(--accent-green);">${entry.totalPoints}</td>
                  `;
                } else {
                  row.innerHTML = `
                    <td style="padding: 1rem 0.75rem; font-weight: 700; color: ${isWinner ? '#ffd700' : 'var(--text-muted)'};">
                      ${isWinner ? '👑 1' : entry.rank}
                    </td>
                    <td style="padding: 1rem 0.75rem; font-weight: 600; color: ${isWinner ? '#ffd700' : 'var(--text-main)'};">
                      ${entry.username}
                    </td>
                    <td style="padding: 1rem 0.75rem; text-align: center; color: var(--text-muted);">${entry.attempts}</td>
                    <td style="padding: 1rem 0.75rem; text-align: right; font-weight: 700; color: var(--accent-green);">${entry.totalPoints}</td>
                  `;
                }
                body.appendChild(row);
              });
            }
          }
        })
        .catch(err => console.error('Failed to load weekly leaderboard:', err));
    }
  }
}

// --- ADMIN SETTINGS PAGE LOGIC ---
async function initSettingsPage() {
  const user = window.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?username=${encodeURIComponent(user.username)}&token=${encodeURIComponent(user.token)}`);
      const data = await response.json();
      if (data.success) {
        renderUsers(data.users);
      } else {
        window.showToast(data.message || 'Failed to fetch users', 'error');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      window.showToast('Error connecting to server', 'error');
    }
  };

  const renderUsers = (users) => {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    container.innerHTML = '';

    if (users.length === 0) {
      container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No users found.</td></tr>';
      return;
    }

    // Calculate stats
    let total = users.length;
    let active = users.filter(u => u.status !== 'deleted').length;
    let deleted = users.filter(u => u.status === 'deleted').length;

    const totalEl = document.getElementById('statTotalUsers');
    const activeEl = document.getElementById('statActiveUsers');
    const deletedEl = document.getElementById('statDeletedUsers');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (deletedEl) deletedEl.textContent = deleted;

    users.forEach(u => {
      const row = document.createElement('tr');

      const isDeleted = u.status === 'deleted';
      const statusBadge = isDeleted 
        ? '<span class="badge badge-deleted">Deleted</span>' 
        : '<span class="badge badge-active">Active</span>';

      const isSelf = u.username === user.username;
      const isAdmin = u.role === 'admin';

      // Delete button: disabled if self or admin or already deleted
      const canDelete = !isSelf && !isAdmin && !isDeleted;
      const deleteBtn = `<button class="btn-danger" ${canDelete ? '' : 'disabled'} onclick="deleteUser('${u.username}')">
        <span>🗑️</span> Delete
      </button>`;

      row.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>
            <span style="font-weight:600;">${u.username} ${isSelf ? '<small style="color:var(--accent-green); margin-left:6px;">(You)</small>' : ''}</span>
          </div>
        </td>
        <td>${u.phone}</td>
        <td style="text-align:center;">
          <span style="text-transform: capitalize; font-weight:500; color:${isAdmin ? 'var(--accent-green)' : 'var(--text-muted)'}">${u.role}</span>
        </td>
        <td style="text-align:center;">${statusBadge}</td>
        <td style="text-align:right;">${deleteBtn}</td>
      `;
      container.appendChild(row);
    });
  };

  window.deleteUser = async (targetUsername) => {
    if (!confirm(`Are you sure you want to delete user "${targetUsername}"?\nThis user will not be able to log in or register again with the same number.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          token: user.token,
          targetUsername: targetUsername
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        window.showToast(result.message || 'User deleted successfully', 'success');
        fetchUsers(); // Refresh list
      } else {
        window.showToast(result.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Connection error', 'error');
    }
  };

  // Initial load
  await fetchUsers();
}

// --- ADMIN PREDICTIONS TRACKING PAGE LOGIC ---
async function initAdminPredictionsPage() {
  const user = window.getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const container = document.getElementById('adminPredictionsContainer');
  const filterMatch = document.getElementById('filterMatch');
  const filterOutcome = document.getElementById('filterOutcome');
  const searchPlayer = document.getElementById('searchPlayer');

  if (!container) return;

  let allMatches = [];
  let allPredictions = [];
  let allUsers = [];

  const getPredictionOutcome = (pred, match) => {
    if (match.status === 'Upcoming') {
      return { label: 'Pending', points: 0, badge: 'badge-pending' };
    }
    const ap1 = match.team1Score;
    const ap2 = match.team2Score;
    const pp1 = pred.team1Score;
    const pp2 = pred.team2Score;

    if (ap1 === null || ap2 === null) {
      return { label: 'Pending', points: 0, badge: 'badge-pending' };
    }

    if (pp1 === ap1 && pp2 === ap2) {
      return { label: 'Exact Score', points: 5, badge: 'badge-exact' };
    } else if (
      (pp1 > pp2 && ap1 > ap2) ||
      (pp1 < pp2 && ap1 < ap2) ||
      (pp1 === pp2 && ap1 === ap2)
    ) {
      return { label: 'Correct Winner', points: 3, badge: 'badge-winner' };
    } else {
      return { label: 'Wrong Outcome', points: 0, badge: 'badge-wrong' };
    }
  };

  const calculateOverallStats = () => {
    const totalPredictionsEl = document.getElementById('statTotalPredictions');
    const totalPredictorsEl = document.getElementById('statTotalPredictors');
    const exactScoresEl = document.getElementById('statExactScores');
    const avgPointsEl = document.getElementById('statAvgPoints');

    const totalPreds = allPredictions.length;
    
    // Count unique predictors
    const uniquePredictors = new Set(allPredictions.map(p => p.username));
    const totalPredictors = uniquePredictors.size;

    // Count exact matches and calculate total points distributed
    let exactCount = 0;
    let totalPoints = 0;

    allPredictions.forEach(pred => {
      const match = allMatches.find(m => m.id === pred.matchId);
      if (match) {
        const outcome = getPredictionOutcome(pred, match);
        totalPoints += outcome.points;
        if (outcome.label === 'Exact Score') {
          exactCount++;
        }
      }
    });

    const avgPoints = totalPredictors > 0 ? (totalPoints / totalPredictors).toFixed(1) : '0.0';

    if (totalPredictionsEl) totalPredictionsEl.textContent = totalPreds;
    if (totalPredictorsEl) totalPredictorsEl.textContent = totalPredictors;
    if (exactScoresEl) exactScoresEl.textContent = exactCount;
    if (avgPointsEl) avgPointsEl.textContent = avgPoints;
  };

  const populateMatchFilter = () => {
    if (!filterMatch) return;
    filterMatch.innerHTML = '<option value="All">All Matches</option>';
    allMatches.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.team1} vs ${m.team2} (${m.group})`;
      filterMatch.appendChild(opt);
    });
  };

  const renderPredictions = (predsList) => {
    container.innerHTML = '';

    if (predsList.length === 0) {
      container.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 3rem;">No predictions found matching the filters.</td></tr>';
      return;
    }

    predsList.forEach(pred => {
      const match = allMatches.find(m => m.id === pred.matchId);
      if (!match) return;

      const outcome = getPredictionOutcome(pred, match);
      const row = document.createElement('tr');

      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

      let actualScoreText = 'VS';
      if (match.status === 'Completed' || match.status === 'Live') {
        actualScoreText = `${match.team1Score} - ${match.team2Score}`;
      }

      row.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="user-avatar">${pred.username.charAt(0).toUpperCase()}</div>
            <span style="font-weight:600;">${pred.username}</span>
          </div>
        </td>
        <td>
          <div class="match-display">
            <div class="team-info">
              <img class="flag-icon" src="${flag1Url}" alt="${match.team1}">
              <span>${match.team1}</span>
            </div>
            <span class="match-vs">VS</span>
            <div class="team-info">
              <span>${match.team2}</span>
              <img class="flag-icon" src="${flag2Url}" alt="${match.team2}">
            </div>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600;">${match.group}</td>
        <td style="text-align: center; font-weight: 700; color: var(--accent-green);">
          ${pred.team1Score} - ${pred.team2Score}
        </td>
        <td style="text-align: center;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-weight: 700; font-family: var(--font-display);">${actualScoreText}</span>
            <span class="badge ${outcome.badge}" style="font-size: 0.6rem; padding: 1px 6px;">${outcome.label}</span>
          </div>
        </td>
        <td style="text-align: right; font-weight: 700; color: ${outcome.points > 0 ? 'var(--accent-green)' : 'var(--text-muted)'};">
          +${outcome.points} pts
        </td>
      `;
      container.appendChild(row);
    });
  };

  const applyFilters = () => {
    const searchVal = searchPlayer ? searchPlayer.value.toLowerCase().trim() : '';
    const matchVal = filterMatch ? filterMatch.value : 'All';
    const outcomeVal = filterOutcome ? filterOutcome.value : 'All';

    const filtered = allPredictions.filter(pred => {
      const match = allMatches.find(m => m.id === pred.matchId);
      if (!match) return false;

      // 1. Player Search Filter
      const matchesSearch = pred.username.toLowerCase().includes(searchVal);

      // 2. Match Filter
      const matchesMatch = matchVal === 'All' || pred.matchId.toString() === matchVal;

      // 3. Outcome Filter
      let matchesOutcome = true;
      if (outcomeVal !== 'All') {
        const outcome = getPredictionOutcome(pred, match);
        if (outcomeVal === 'Exact') {
          matchesOutcome = outcome.label === 'Exact Score';
        } else if (outcomeVal === 'Winner') {
          matchesOutcome = outcome.label === 'Correct Winner';
        } else if (outcomeVal === 'Wrong') {
          matchesOutcome = outcome.label === 'Wrong Outcome';
        } else if (outcomeVal === 'Pending') {
          matchesOutcome = outcome.label === 'Pending';
        }
      }

      return matchesSearch && matchesMatch && matchesOutcome;
    });

    renderPredictions(filtered);
  };

  try {
    const response = await fetch(`/api/admin/predictions?username=${encodeURIComponent(user.username)}&token=${encodeURIComponent(user.token)}`);
    const data = await response.json();
    
    if (data.success) {
      allMatches = data.matches;
      allPredictions = data.predictions;
      allUsers = data.users;

      // Sort predictions by username first, and then matchId
      allPredictions.sort((a, b) => {
        const userCompare = a.username.localeCompare(b.username);
        if (userCompare !== 0) return userCompare;
        return a.matchId - b.matchId;
      });

      calculateOverallStats();
      populateMatchFilter();
      renderPredictions(allPredictions);

      // Bind events
      if (searchPlayer) searchPlayer.addEventListener('input', applyFilters);
      if (filterMatch) filterMatch.addEventListener('change', applyFilters);
      if (filterOutcome) filterOutcome.addEventListener('change', applyFilters);
    } else {
      window.showToast(data.message || 'Failed to load predictions', 'error');
    }
  } catch (err) {
    console.error('Failed to initialize admin predictions page:', err);
    window.showToast('Server connection failed', 'error');
  }
}