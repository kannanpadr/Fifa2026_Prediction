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
  } else if (path.includes('db_diagnostics.html')) {
    // Exclude database diagnostics page from authentication check so it can be accessed
    // directly to diagnose connection issues when login is not working
    initGlobalUI();
    initDbDiagnosticsPage();
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
    } else if (path.includes('winner.html')) {
      initWinnerPage();
    } else if (path.includes('admin_real_penalty.html')) {
      initRealPenaltyAdmin();
    } else if (path.includes('real_penalty_scorecard.html')) {
      initRealPenaltyScorecard();
    } else if (path.includes('index.html') || path.endsWith('/') || path === '') {
      initDashboardPage();
    }
  }
});

// --- GLOBAL CUSTOM CONFIRMATION SYSTEM ---
window.showConfirm = function (title, message, isDanger = true) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const proceedBtn = document.getElementById('confirmProceedBtn');

    if (!modal || !titleEl || !messageEl || !cancelBtn || !proceedBtn) {
      // Fallback to native confirm if DOM elements are missing
      resolve(confirm(`${title}\n\n${message}`));
      return;
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    
    if (isDanger) {
      proceedBtn.style.background = 'rgba(255, 82, 82, 0.12)';
      proceedBtn.style.borderColor = 'rgba(255, 82, 82, 0.3)';
      proceedBtn.style.color = '#ff5252';
    } else {
      proceedBtn.style.background = 'rgba(0, 230, 118, 0.12)';
      proceedBtn.style.borderColor = 'rgba(0, 230, 118, 0.3)';
      proceedBtn.style.color = 'var(--accent-green)';
    }

    modal.style.display = 'flex';

    const cleanup = (result) => {
      modal.style.display = 'none';
      cancelBtn.removeEventListener('click', onCancel);
      proceedBtn.removeEventListener('click', onProceed);
      resolve(result);
    };

    const onCancel = () => cleanup(false);
    const onProceed = () => cleanup(true);

    cancelBtn.addEventListener('click', onCancel);
    proceedBtn.addEventListener('click', onProceed);
  });
};

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

  const adminDownloadDbLink = document.getElementById('adminDownloadDbLink');
  if (adminDownloadDbLink) {
    adminDownloadDbLink.style.display = (user.role === 'admin') ? 'block' : 'none';
  }

  const adminRealPenaltyLink = document.getElementById('adminRealPenaltyLink');
  if (adminRealPenaltyLink) {
    adminRealPenaltyLink.style.display = (user.role === 'admin' || user.role === 'scorer') ? 'block' : 'none';
  }

  const navRealPenaltyAdminMenu = document.getElementById('navRealPenaltyAdminMenu');
  if (navRealPenaltyAdminMenu) {
    navRealPenaltyAdminMenu.style.display = (user.role === 'admin' || user.role === 'scorer') ? 'inline-block' : 'none';
  }

  // Hide other menus for scorer
  if (user.role === 'scorer') {
    const idsToHide = ['navDashboard', 'navSchedule', 'navPredictions', 'navGames', 'navStandings', 'dropdownLeaderboard', 'statsGridContainer', 'nextFixturesCard'];
    idsToHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  // Dynamically inject Admin DB Diagnostics menu item in the profile dropdown if not present
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown && !document.getElementById('adminDbDiagnosticsLink')) {
    const diagLink = document.createElement('a');
    diagLink.href = 'db_diagnostics.html';
    diagLink.className = 'dropdown-item';
    diagLink.id = 'adminDbDiagnosticsLink';
    diagLink.style.display = (user.role === 'admin') ? 'block' : 'none';
    diagLink.innerHTML = '🔌 DB Diagnostics';

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      const divider = logoutBtn.previousElementSibling;
      if (divider && divider.tagName === 'HR') {
        profileDropdown.insertBefore(diagLink, divider);
      } else {
        profileDropdown.insertBefore(diagLink, logoutBtn);
      }
    } else {
      profileDropdown.appendChild(diagLink);
    }
  } else {
    const adminDbDiagnosticsLink = document.getElementById('adminDbDiagnosticsLink');
    if (adminDbDiagnosticsLink) {
      adminDbDiagnosticsLink.style.display = (user.role === 'admin') ? 'block' : 'none';
    }
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

  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      profileDropdown.classList.remove('show');
    });
  }

  // Download DB Handler
  if (adminDownloadDbLink) {
    adminDownloadDbLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.downloadDbBackup(user);
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

  // Global helper for DB backup download
  window.downloadDbBackup = async function (user) {
    if (!user) return;
    if (typeof window.showToast === 'function') {
      window.showToast('Exporting database data...', 'success');
    }
    try {
      const url = `/api/admin/db/export?username=${encodeURIComponent(user.username)}&token=${encodeURIComponent(user.token)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) {
        throw new Error('Export failed');
      }
      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Export failed');
      }
      
      // Trigger a download in the browser
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(responseData.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fifa_db_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (typeof window.showToast === 'function') {
        window.showToast('Database download complete!', 'success');
      }
    } catch (err) {
      console.error(err);
      if (typeof window.showToast === 'function') {
        window.showToast('Failed to download DB data', 'error');
      }
    }
  };
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
    const upcomingMatches = matches.filter(m => {
      if (m.status !== 'Upcoming') return false;
      if (m.date === activeDate) return true;
      const kickoff = new Date(m.date + ' ' + m.time + ' GMT+0530').getTime();
      const now = new Date().getTime();
      const isOpen = (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
      return isOpen;
    });
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

      // Populate dynamic highlights gallery from images folder
      const photoGallery = document.getElementById('dashboardPhotoGallery');
      if (photoGallery) {
        try {
          const galleryResponse = await fetch('/api/gallery-images');
          const galleryData = await galleryResponse.json();
          if (galleryData.success && galleryData.images && galleryData.images.length > 0) {
            const images = galleryData.images;
            let currentZoomIndex = 0;

            photoGallery.innerHTML = '';
            images.forEach((img, idx) => {
              const item = document.createElement('div');
              item.className = 'gallery-item';
              item.dataset.index = idx;
              
              // Human-readable caption formatting
              let caption = img.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
              caption = caption.charAt(0).toUpperCase() + caption.slice(1);
              
              item.innerHTML = `
                <img src="images/${img}" alt="${caption}">
                <div class="gallery-caption">${caption}</div>
              `;
              photoGallery.appendChild(item);
            });

            // Zoom click handlers & elements
            const zoomModal = document.getElementById('imageZoomModal');
            const zoomedImg = document.getElementById('zoomedImage');
            const zoomCap = document.getElementById('zoomCaption');
            const closeZoomBtn = document.getElementById('closeZoomBtn');
            const zoomPrevBtn = document.getElementById('zoomPrevBtn');
            const zoomNextBtn = document.getElementById('zoomNextBtn');
            const galleryPrevBtn = document.getElementById('galleryPrevBtn');
            const galleryNextBtn = document.getElementById('galleryNextBtn');

            // Setup buttons visibility based on count
            const showArrows = images.length > 1;
            if (galleryPrevBtn) galleryPrevBtn.style.display = showArrows ? 'flex' : 'none';
            if (galleryNextBtn) galleryNextBtn.style.display = showArrows ? 'flex' : 'none';
            if (zoomPrevBtn) zoomPrevBtn.style.display = showArrows ? 'block' : 'none';
            if (zoomNextBtn) zoomNextBtn.style.display = showArrows ? 'block' : 'none';

            const updateZoomedImage = (idx) => {
              currentZoomIndex = idx;
              const imgName = images[idx];
              let caption = imgName.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
              caption = caption.charAt(0).toUpperCase() + caption.slice(1);
              zoomedImg.src = `images/${imgName}`;
              zoomCap.textContent = caption;
            };

            const galleryItems = photoGallery.querySelectorAll('.gallery-item');
            galleryItems.forEach((gItem, idx) => {
              gItem.style.cursor = 'zoom-in';
              gItem.addEventListener('click', () => {
                if (zoomModal && zoomedImg && zoomCap) {
                  updateZoomedImage(idx);
                  zoomModal.style.display = 'flex';
                  setTimeout(() => {
                    zoomModal.classList.add('show');
                  }, 10);
                }
              });
            });

            // Zoom modal next / prev functions
            const navigateZoom = (direction) => {
              let newIdx = currentZoomIndex + direction;
              if (newIdx < 0) newIdx = images.length - 1;
              if (newIdx >= images.length) newIdx = 0;
              updateZoomedImage(newIdx);
            };

            if (zoomPrevBtn) {
              zoomPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateZoom(-1);
              });
            }

            if (zoomNextBtn) {
              zoomNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateZoom(1);
              });
            }

            // Carousel scroll buttons implementation
            if (galleryPrevBtn) {
              galleryPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemWidth = photoGallery.clientWidth;
                photoGallery.scrollBy({ left: -itemWidth, behavior: 'smooth' });
              });
            }

            if (galleryNextBtn) {
              galleryNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemWidth = photoGallery.clientWidth;
                photoGallery.scrollBy({ left: itemWidth, behavior: 'smooth' });
              });
            }

            if (zoomModal && closeZoomBtn) {
              const closeZoom = () => {
                zoomModal.classList.remove('show');
                setTimeout(() => {
                  zoomModal.style.display = 'none';
                }, 300);
              };
              
              closeZoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeZoom();
              });

              zoomModal.addEventListener('click', (e) => {
                if (e.target === zoomModal || e.target.classList.contains('zoom-modal-content')) {
                  closeZoom();
                }
              });

              window.addEventListener('keydown', (e) => {
                if (!zoomModal.classList.contains('show')) return;
                if (e.key === 'Escape') {
                  closeZoom();
                } else if (e.key === 'ArrowLeft') {
                  navigateZoom(-1);
                } else if (e.key === 'ArrowRight') {
                  navigateZoom(1);
                }
              });
            }
          } else {
            photoGallery.innerHTML = '<p style="color:var(--text-muted); font-size: 0.85rem; text-align:center; padding:2rem; width:100%;">No highlight photos uploaded yet.</p>';
          }
        } catch (err) {
          console.error('Failed to load highlights gallery:', err);
          photoGallery.innerHTML = '<p style="color:#ff5252; font-size: 0.85rem; text-align:center; padding:2rem; width:100%;">Failed to load gallery.</p>';
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
  let allMatchesList = [];

  // Countdown timer logic to count down to next match kickoff in IST
  function updateCountdown() {
    const now = new Date().getTime();
    let targetTime = null;

    if (allMatchesList.length > 0) {
      // Find the next upcoming match kickoff time
      const futureMatches = allMatchesList
        .map(m => ({
          ...m,
          kickoffTime: new Date(m.date + ' ' + m.time + ' GMT+0530').getTime()
        }))
        .filter(m => m.status === 'Upcoming' && m.kickoffTime > now)
        .sort((a, b) => a.kickoffTime - b.kickoffTime);

      if (futureMatches.length > 0) {
        targetTime = futureMatches[0].kickoffTime;
      }
    }

    let difference = 0;
    if (targetTime) {
      difference = targetTime - now;
    } else {
      // Fallback: rolling 12-hour countdown
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
    allMatchesList = matches;
    updateCountdown(); // Trigger immediate update after load


    const predResponse = await fetch(`/api/predictions/${user.username}`);
    pagePredictions = await predResponse.json();

    // Render list of predict cards
    const now = new Date().getTime();
    const activeDate = getEarliestActiveDate(matches);
    const upcomingMatches = matches.filter(m => {
      if (m.status !== 'Upcoming') return false;
      if (m.date === activeDate) return true;
      const kickoff = new Date(m.date + ' ' + m.time + ' GMT+0530').getTime();
      const isOpen = (now >= kickoff - 24 * 60 * 60 * 1000) && (now < kickoff);
      return isOpen;
    });

    // Calculate if any match is open for prediction within its 24h window
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

// --- COMBINED OVERALL CHAMPIONS PAGE LOGIC ---
async function initWinnerPage() {
  const podiumContainer = document.getElementById('podiumContainer');
  const body = document.getElementById('championsBody');
  const tabChampionship = document.getElementById('tabChampionship');
  const tabDaily = document.getElementById('tabDaily');
  const dailySelectorContainer = document.getElementById('dailySelectorContainer');
  const dailyDateSelect = document.getElementById('dailyDateSelect');

  if (!podiumContainer || !body) return;

  let activeTab = 'championship';

  // Helper to determine today's date and select it in the dropdown if available
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

    listBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">Loading leaderboard...</td></tr>`;

    try {
      const url = activeTab === 'championship'
        ? '/api/games/overall-leaderboard'
        : `/api/games/daily-leaderboard?date=${dailyDateSelect.value}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.leaderboard) {
        const list = data.leaderboard;

        podiumContainer.innerHTML = '';
        if (list.length === 0) {
          podiumContainer.innerHTML = '<div style="color: var(--text-muted); padding: 3rem;">No participants recorded yet.</div>';
          listBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No participants yet.</td></tr>`;
          return;
        }

        const top3 = list.slice(0, 3);
        const podiumOrder = [];
        if (top3[1]) podiumOrder.push({ ...top3[1], place: '2nd', badgeClass: 'badge-2nd', avatarClass: 'avatar-2nd', cardClass: 'podium-2nd' });
        if (top3[0]) podiumOrder.push({ ...top3[0], place: '1st', badgeClass: 'badge-1st', avatarClass: 'avatar-1st', cardClass: 'podium-1st' });
        if (top3[2]) podiumOrder.push({ ...top3[2], place: '3rd', badgeClass: 'badge-3rd', avatarClass: 'avatar-3rd', cardClass: 'podium-3rd' });

        const currentUser = window.getCurrentUser();
        const isAdmin = currentUser && currentUser.role === 'admin';

        // Update leaderboard header title text dynamically
        const leaderboardTitle = document.getElementById('leaderboardTitle');
        if (leaderboardTitle) {
          leaderboardTitle.innerHTML = isAdmin ? '<span>📊</span> Detailed Point Standings' : '<span>📊</span> Point Standings';
        }

        podiumOrder.forEach(item => {
          const card = document.createElement('div');
          card.className = `podium-card ${item.cardClass} ${isAdmin ? '' : 'no-breakdown'}`;

          const rawName = item.username;
          const nameParts = rawName.trim().split(/\s+/);
          let displayName = rawName;
          if (nameParts.length > 1) {
            displayName = `${nameParts[0]} ${nameParts[1].charAt(0).toUpperCase()}.`;
          }

          const pointsVal = activeTab === 'championship' ? item.overallPoints : item.dailyTotal;
          const quizVal = activeTab === 'championship' ? item.quizPoints : item.quizNorm;
          const penaltyVal = activeTab === 'championship' ? item.penaltyPoints : item.penaltyNorm;
          const jugglingVal = activeTab === 'championship' ? item.jugglingPoints : item.jugglingNorm;
          const soccerVal = activeTab === 'championship' ? item.soccerPoints : item.soccerNorm;
          const unit = activeTab === 'championship' ? 'pts' : 'pts';

          let breakdownHtml = '';
          if (isAdmin) {
            breakdownHtml = `
              <div class="podium-breakdown">
                <div class="breakdown-row">
                  <span>Quiz:</span>
                  <span>${quizVal} ${activeTab === 'championship' ? 'pts' : '%'}</span>
                </div>
                <div class="breakdown-row">
                  <span>Penalty:</span>
                  <span>${penaltyVal} ${activeTab === 'championship' ? 'pts' : '%'}</span>
                </div>
                <div class="breakdown-row">
                  <span>Juggling:</span>
                  <span>${jugglingVal} ${activeTab === 'championship' ? 'pts' : '%'}</span>
                </div>
                <div class="breakdown-row">
                  <span>Soccer:</span>
                  <span>${soccerVal} ${activeTab === 'championship' ? 'pts' : '%'}</span>
                </div>
              </div>
            `;
          }

          card.innerHTML = `
            <span class="rank-badge ${item.badgeClass}">${item.place} Place</span>
            <div class="podium-avatar ${item.avatarClass}">${displayName}</div>
            <div class="podium-username" title="${item.username}">${item.username}</div>
            <div class="podium-points">${pointsVal} ${unit}</div>
            ${breakdownHtml}
          `;
          podiumContainer.appendChild(card);
        });

        if (activeTab === 'championship') {
          if (isAdmin) {
            listHead.innerHTML = `
              <tr>
                <th style="width: 8%;">Rank</th>
                <th>Competitor</th>
                <th style="text-align: center; width: 12%;">Days Played</th>
                <th style="text-align: center; width: 12%;">Quiz (40%)</th>
                <th style="text-align: center; width: 12%;">Penalty (25%)</th>
                <th style="text-align: center; width: 12%;">Juggling (25%)</th>
                <th style="text-align: center; width: 12%;">Soccer (10%)</th>
                <th style="text-align: right; width: 15%;">Total Points</th>
              </tr>
            `;
          } else {
            listHead.innerHTML = `
              <tr>
                <th style="width: 10%;">Rank</th>
                <th>Competitor</th>
                <th style="text-align: center; width: 30%;">Days Played</th>
                <th style="text-align: right; width: 30%;">Total Points</th>
              </tr>
            `;
          }
        } else {
          if (isAdmin) {
            listHead.innerHTML = `
              <tr>
                <th style="width: 8%;">Rank</th>
                <th>Competitor</th>
                <th style="text-align: center; width: 15%;">Quiz (40%)</th>
                <th style="text-align: center; width: 15%;">Penalty (25%)</th>
                <th style="text-align: center; width: 15%;">Juggling (25%)</th>
                <th style="text-align: center; width: 15%;">Soccer (10%)</th>
                <th style="text-align: right; width: 20%;">Daily Total</th>
              </tr>
            `;
          } else {
            listHead.innerHTML = `
              <tr>
                <th style="width: 10%;">Rank</th>
                <th>Competitor</th>
                <th style="text-align: right; width: 40%;">Daily Total</th>
              </tr>
            `;
          }
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
            if (isAdmin) {
              row.innerHTML = `
                <td style="font-weight: 700; color: ${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">${rankHtml}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: ${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: ${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">${item.avatar}</div>
                    <span style="font-weight: 600;">${item.username} ${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                  </div>
                </td>
                <td style="text-align: center; color: var(--text-muted); font-weight: 600;">${item.daysPlayed}</td>
                <td style="text-align: center; color: var(--text-muted);">${item.quizPoints} / 240</td>
                <td style="text-align: center; color: var(--text-muted);">${item.penaltyPoints} / 150</td>
                <td style="text-align: center; color: var(--text-muted);">${item.jugglingPoints} / 150</td>
                <td style="text-align: center; color: var(--text-muted);">${item.soccerPoints} / 60</td>
                <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">${item.overallPoints}</td>
              `;
            } else {
              row.innerHTML = `
                <td style="font-weight: 700; color: ${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">${rankHtml}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: ${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: ${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">${item.avatar}</div>
                    <span style="font-weight: 600;">${item.username} ${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                  </div>
                </td>
                <td style="text-align: center; color: var(--text-muted); font-weight: 600;">${item.daysPlayed}</td>
                <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">${item.overallPoints}</td>
              `;
            }
          } else {
            if (isAdmin) {
              row.innerHTML = `
                <td style="font-weight: 700; color: ${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">${rankHtml}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: ${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: ${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">${item.avatar}</div>
                    <span style="font-weight: 600;">${item.username} ${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                  </div>
                </td>
                <td style="text-align: center; color: var(--text-muted);">${item.quizNorm} %</td>
                <td style="text-align: center; color: var(--text-muted);">${item.penaltyNorm} %</td>
                <td style="text-align: center; color: var(--text-muted);">${item.jugglingNorm} %</td>
                <td style="text-align: center; color: var(--text-muted);">${item.soccerNorm} %</td>
                <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">${item.dailyTotal}</td>
              `;
            } else {
              row.innerHTML = `
                <td style="font-weight: 700; color: ${item.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)'};">${rankHtml}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: ${item.rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffa000 100%)' : item.rank === 2 ? '#cbd5e1' : item.rank === 3 ? '#cd7f32' : 'linear-gradient(135deg, var(--accent-green) 0%, #009688 100%)'}; color: ${item.rank === 1 || item.rank === 3 ? 'var(--text-dark)' : 'inherit'}">${item.avatar}</div>
                    <span style="font-weight: 600;">${item.username} ${isSelf ? '<small style="color:var(--accent-green); margin-left:4px;">(You)</small>' : ''}</span>
                  </div>
                </td>
                <td style="text-align: right; font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">${item.dailyTotal}</td>
              `;
            }
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

  // Bind tab buttons
  if (tabChampionship) {
    tabChampionship.addEventListener('click', () => {
      activeTab = 'championship';
      updateTabStyles();
      renderLeaderboard();
    });
  }

  if (tabDaily) {
    tabDaily.addEventListener('click', () => {
      activeTab = 'daily';
      updateTabStyles();
      renderLeaderboard();
    });
  }

  if (dailyDateSelect) {
    dailyDateSelect.addEventListener('change', () => {
      if (activeTab === 'daily') {
        renderLeaderboard();
      }
    });
  }

  updateTabStyles();
  renderLeaderboard();
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

  const user = window.getCurrentUser();
  let allMatches = [];
  let gamesStatus = null;

  try {
    const response = await fetch('/api/matches');
    allMatches = await response.json();

    if (user && user.token) {
      try {
        const statusResponse = await fetch('/api/games/status', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          if (statusResult.success) {
            gamesStatus = statusResult.status;
          }
        }
      } catch (statusErr) {
        console.error('Failed to load games status:', statusErr);
      }
    }

    renderGames(allMatches, gamesStatus);

    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        const val = filterSelect.value;
        if (val === 'All') {
          renderGames(allMatches, gamesStatus);
        } else {
          const filtered = allMatches.filter(m => m.status === val);
          renderGames(filtered, gamesStatus);
        }
      });
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="glass-card" style="color: #ff5252; text-align: center; padding: 3rem;">Failed to load games.</div>';
  }

  function renderGames(matchesList, gamesStatus) {
    container.innerHTML = '';
    const status = gamesStatus || {
      quiz: { completedToday: false, attempts: 0, limit: 1 },
      juggling: { attempts: 0, limit: 5, bestScore: 0 },
      penalty: { attempts: 0, limit: 5, bestScore: 0 },
      soccer: { attempts: 0, limit: 5, bestScore: 0 }
    };
    const isAdmin = user && user.role === 'admin';

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

    // 1. World Cup Quiz (Priority 1)
    const quizLocked = status.quiz.completedToday && !isAdmin;
    const quizCard = document.createElement('div');
    quizCard.className = 'glass-card interactive-hover';
    quizCard.style.padding = '1.75rem';
    if (quizLocked) {
      quizCard.style.opacity = '0.6';
      quizCard.style.cursor = 'not-allowed';
      quizCard.classList.remove('interactive-hover');
    } else {
      quizCard.style.cursor = 'pointer';
    }
    quizCard.style.border = '1px dashed var(--accent-green)';
    quizCard.style.display = 'flex';
    quizCard.style.flexDirection = 'column';
    quizCard.style.justifyContent = 'space-between';
    quizCard.addEventListener('click', () => {
      if (quizLocked) {
        window.showToast("World Cup Quiz is locked! You have already played today's quiz.", 'error');
      } else {
        window.location.href = 'quiz.html';
      }
    });

    const quizBadge = quizLocked
      ? `<span class="badge" style="background-color: #ef5350; color: #fff; font-weight: 700;">LOCKED</span>`
      : `<span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>`;

    const quizTitle = quizLocked ? `🔒 World Cup Quiz` : `🧠 World Cup Quiz`;

    quizCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Quiz • Priority 1</span>
        ${quizBadge}
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🧠</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: ${quizLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">${quizTitle}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Answer trivia questions daily for a chance to win prizes!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
        <span>Attempts: ${status.quiz.attempts}/${status.quiz.limit} today</span>
        <span>Status: ${status.quiz.completedToday ? 'Completed' : 'Available'}</span>
      </div>
    `;
    grid.appendChild(quizCard);

    // 2. Juggling Pro (Priority 2)
    const jugglingLocked = status.juggling.attempts >= status.juggling.limit && !isAdmin;
    const jugglingCard = document.createElement('div');
    jugglingCard.className = 'glass-card interactive-hover';
    jugglingCard.style.padding = '1.75rem';
    if (jugglingLocked) {
      jugglingCard.style.opacity = '0.6';
      jugglingCard.style.cursor = 'not-allowed';
      jugglingCard.classList.remove('interactive-hover');
    } else {
      jugglingCard.style.cursor = 'pointer';
    }
    jugglingCard.style.border = '1px dashed var(--accent-green)';
    jugglingCard.style.display = 'flex';
    jugglingCard.style.flexDirection = 'column';
    jugglingCard.style.justifyContent = 'space-between';
    jugglingCard.addEventListener('click', () => {
      if (jugglingLocked) {
        window.showToast('Juggling Pro is locked! You have exhausted all ' + status.juggling.limit + ' attempts today.', 'error');
      } else {
        window.location.href = 'juggling.html';
      }
    });

    const jugglingBadge = jugglingLocked
      ? `<span class="badge" style="background-color: #ef5350; color: #fff; font-weight: 700;">LOCKED</span>`
      : `<span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>`;

    const jugglingTitle = jugglingLocked ? `🔒 Juggling Pro` : `⚽ Juggling Pro`;

    jugglingCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Juggling • Priority 2</span>
        ${jugglingBadge}
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">⚽</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: ${jugglingLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">${jugglingTitle}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Keep the ball in the air against shifting wind!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
        <span>Attempts: ${status.juggling.attempts}/${status.juggling.limit}</span>
        <span>Best Score: ${status.juggling.bestScore} bounces</span>
      </div>
    `;
    grid.appendChild(jugglingCard);

    // 3. Penalty Challenge (Priority 3)
    const penaltyLocked = status.penalty.attempts >= status.penalty.limit && !isAdmin;
    const penaltyCard = document.createElement('div');
    penaltyCard.className = 'glass-card interactive-hover';
    penaltyCard.style.padding = '1.75rem';
    if (penaltyLocked) {
      penaltyCard.style.opacity = '0.6';
      penaltyCard.style.cursor = 'not-allowed';
      penaltyCard.classList.remove('interactive-hover');
    } else {
      penaltyCard.style.cursor = 'pointer';
    }
    penaltyCard.style.border = '1px dashed var(--accent-green)';
    penaltyCard.style.display = 'flex';
    penaltyCard.style.flexDirection = 'column';
    penaltyCard.style.justifyContent = 'space-between';
    penaltyCard.addEventListener('click', () => {
      if (penaltyLocked) {
        window.showToast('Penalty Challenge is locked! You have exhausted all ' + status.penalty.limit + ' attempts today.', 'error');
      } else {
        window.location.href = 'penalty.html';
      }
    });

    const penaltyBadge = penaltyLocked
      ? `<span class="badge" style="background-color: #ef5350; color: #fff; font-weight: 700;">LOCKED</span>`
      : `<span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>`;

    const penaltyTitle = penaltyLocked ? `🔒 Penalty Challenge` : `🎯 Penalty Challenge`;

    penaltyCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Penalty Challenge • Priority 3</span>
        ${penaltyBadge}
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🎯</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: ${penaltyLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">${penaltyTitle}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Beat the keeper in a 5-shot penalty shootout!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
        <span>Attempts: ${status.penalty.attempts}/${status.penalty.limit}</span>
        <span>Best Score: ${status.penalty.bestScore} goals</span>
      </div>
    `;
    grid.appendChild(penaltyCard);

    // 4. Mini Soccer Showdown (Priority 4)
    const soccerLocked = status.soccer.attempts >= status.soccer.limit && !isAdmin;
    const gameCard = document.createElement('div');
    gameCard.className = 'glass-card interactive-hover';
    gameCard.style.padding = '1.75rem';
    if (soccerLocked) {
      gameCard.style.opacity = '0.6';
      gameCard.style.cursor = 'not-allowed';
      gameCard.classList.remove('interactive-hover');
    } else {
      gameCard.style.cursor = 'pointer';
    }
    gameCard.style.border = '1px dashed var(--accent-green)';
    gameCard.style.display = 'flex';
    gameCard.style.flexDirection = 'column';
    gameCard.style.justifyContent = 'space-between';
    gameCard.addEventListener('click', () => {
      if (soccerLocked) {
        window.showToast('Mini Soccer Showdown is locked! You have exhausted all ' + status.soccer.limit + ' attempts today.', 'error');
      } else {
        window.location.href = 'football.html';
      }
    });

    const soccerBadge = soccerLocked
      ? `<span class="badge" style="background-color: #ef5350; color: #fff; font-weight: 700;">LOCKED</span>`
      : `<span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>`;

    const soccerTitle = soccerLocked ? `🔒 Mini Soccer Showdown` : `⚽ Mini Soccer Showdown`;

    gameCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Soccer Showdown • Priority 4</span>
        ${soccerBadge}
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">🎮</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: ${soccerLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">${soccerTitle}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Defeat the AI in a physics-based soccer match!</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
        <span>Attempts: ${status.soccer.attempts}/${status.soccer.limit}</span>
        <span>Best Score: ${status.soccer.bestScore} goals</span>
      </div>
    `;
    grid.appendChild(gameCard);

    // Show only the 3 game tiles to make a single row (0 matches)
    const firstRowMatches = matchesList.slice(0, 0);

    firstRowMatches.forEach(match => {
      const flag1Url = `https://flagcdn.com/24x18/${match.team1Code}.png`;
      const flag2Url = `https://flagcdn.com/24x18/${match.team2Code}.png`;

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

    
    // Real Penalty Scorecard
    const rpCard = document.createElement('div');
    rpCard.className = 'glass-card interactive-hover';
    rpCard.style.padding = '1.75rem';
    rpCard.style.cursor = 'pointer';
    rpCard.style.border = '1px dashed var(--accent-green)';
    rpCard.style.display = 'flex';
    rpCard.style.flexDirection = 'column';
    rpCard.style.justifyContent = 'space-between';
    rpCard.addEventListener('click', () => {
      window.location.href = 'real_penalty_scorecard.html';
    });

    rpCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Live Event</span>
        <span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">VIEW STANDINGS</span>
      </div>
      <div>
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">⚽</span>
        <h3 style="margin-bottom: 0.5rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700;">Real Penalty Standings</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">Check out the live scores for the physical penalty shootout event.</p>
      </div>
    `;
    grid.appendChild(rpCard);

    container.appendChild(grid);
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
    const confirmed = await window.showConfirm(
      "Confirm User Deletion",
      `Are you sure you want to delete user "${targetUsername}"? This user will not be able to log in or register again with the same number.`
    );
    if (!confirmed) return;

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

  // Bind Database Backup button
  const adminBackupBtn = document.getElementById('adminBackupBtn');
  if (adminBackupBtn) {
    adminBackupBtn.addEventListener('click', () => {
      window.downloadDbBackup(user);
    });
  }

  // Bind Reset Game Data button
  const adminResetGamesBtn = document.getElementById('adminResetGamesBtn');
  if (adminResetGamesBtn) {
    adminResetGamesBtn.addEventListener('click', async () => {
      const confirmed1 = await window.showConfirm(
        "⚠️ Reset Game Data",
        "This will permanently delete ALL submissions and attempts for Quiz, Juggling, Penalty, and Soccer for ALL players! Are you sure you want to proceed?"
      );
      if (!confirmed1) return;

      const confirmed2 = await window.showConfirm(
        "⚠️ Final Confirmation",
        "This action is completely irreversible. All scores and logs will be wiped out. Reset now?"
      );
      if (!confirmed2) return;
      
      try {
        adminResetGamesBtn.disabled = true;
        adminResetGamesBtn.textContent = "⏳ Resetting...";
        
        const response = await fetch('/api/admin/reset-games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            token: user.token
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          window.showToast(result.message || 'Game data reset successfully', 'success');
        } else {
          window.showToast(result.message || 'Failed to reset game data', 'error');
        }
      } catch (err) {
        console.error(err);
        window.showToast('Connection error', 'error');
      } finally {
        adminResetGamesBtn.disabled = false;
        adminResetGamesBtn.textContent = "⚠️ Reset Game Data to 0";
      }
    });
  }

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

// Database Diagnostics check function
window.checkDbDiagnostics = async function() {
  const badgeColors = {
    connected: '#00e676',
    disconnected: '#ff5252',
    connecting: '#ff9800',
    disconnecting: '#ff9800',
    unknown: '#94a3b8'
  };

  try {
    const response = await fetch('/api/db/status');
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const data = await response.json();
    updateDiagnosticsUI(data);
  } catch (err) {
    console.error('[Diagnostics] Failed to fetch database status:', err);
    updateDiagnosticsUI({
      readyState: 0,
      readyStateLabel: 'disconnected',
      host: 'Failed to connect to backend',
      dbName: 'N/A',
      rwTest: `failed: ${err.message}`
    });
  }

  function updateDiagnosticsUI(data) {
    const stateLabel = data.readyStateLabel || 'unknown';
    const color = badgeColors[stateLabel] || badgeColors.unknown;

    // Diagnostics page elements
    const dbStateBadge = document.getElementById('dbStateBadge');
    const dbHost = document.getElementById('dbHost');
    const dbName = document.getElementById('dbName');
    const dbRwTest = document.getElementById('dbRwTest');

    const dbDnsResolved = document.getElementById('dbDnsResolved');
    const dbTcpSocketTest = document.getElementById('dbTcpSocketTest');
    const dbSystemInfo = document.getElementById('dbSystemInfo');
    const ubuntuHintContainer = document.getElementById('ubuntuHintContainer');

    if (dbStateBadge) {
      dbStateBadge.textContent = stateLabel.toUpperCase();
      dbStateBadge.style.backgroundColor = `rgba(${color === '#00e676' ? '0, 230, 118' : color === '#ff5252' ? '255, 82, 82' : '255, 152, 0'}, 0.12)`;
      dbStateBadge.style.color = color;
      dbStateBadge.style.borderColor = `rgba(${color === '#00e676' ? '0, 230, 118' : color === '#ff5252' ? '255, 82, 82' : '255, 152, 0'}, 0.3)`;
    }
    if (dbHost) dbHost.textContent = data.host;
    if (dbName) dbName.textContent = data.dbName;
    if (dbRwTest) {
      dbRwTest.textContent = data.rwTest === 'success' ? 'Success' : data.rwTest;
      dbRwTest.style.color = data.rwTest === 'success' ? '#00e676' : '#ff5252';
    }

    if (data.diagnostics) {
      if (dbDnsResolved) {
        dbDnsResolved.textContent = Array.isArray(data.diagnostics.dnsResolved) 
          ? data.diagnostics.dnsResolved.join(', ') 
          : data.diagnostics.dnsResolved;
      }
      if (dbTcpSocketTest) {
        dbTcpSocketTest.textContent = data.diagnostics.tcpSocketTest;
        dbTcpSocketTest.style.color = data.diagnostics.tcpSocketTest.includes('succeeded') ? '#00e676' : '#ff5252';
      }
      if (dbSystemInfo) {
        dbSystemInfo.textContent = `${data.diagnostics.platform} | Node ${data.diagnostics.nodeVersion}`;
      }
      
      // Show Ubuntu Hint if localhost resolves to IPv6 and TCP fails
      if (ubuntuHintContainer) {
        const hasIPv6 = Array.isArray(data.diagnostics.dnsResolved) && 
                         data.diagnostics.dnsResolved.some(ip => ip.includes('::1') || ip.includes('IPv6'));
        const tcpFailed = data.diagnostics.tcpSocketTest.includes('failed');
        if (hasIPv6 && tcpFailed) {
          ubuntuHintContainer.style.display = 'block';
        } else {
          ubuntuHintContainer.style.display = 'none';
        }
      }
    }
  }
};

// Admin DB Diagnostics Page Initializer
async function initDbDiagnosticsPage() {
  // Load diagnostics initially
  await window.checkDbDiagnostics();

  // Bind reload/refresh button
  const refreshDbDiagBtn = document.getElementById('refreshDbDiagBtn');
  if (refreshDbDiagBtn) {
    refreshDbDiagBtn.addEventListener('click', async () => {
      if (typeof window.showToast === 'function') {
        window.showToast('Refreshing database status...', 'success');
      }
      await window.checkDbDiagnostics();
    });
  }
}
// --- REAL PENALTY SHOOTOUT ---
async function initRealPenaltyAdmin() {
  checkAuthRedirect();
  const user = window.getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'scorer')) {
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
