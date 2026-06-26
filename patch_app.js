const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');

const rfCardCode = `
    // 5. Rapid Fire Quiz
    let rapidFireLocked = false;
    if (status && status.rapidFire) {
      rapidFireLocked = status.rapidFire.completedToday && !isAdmin;
    }
    
    const rfCard = document.createElement('div');
    rfCard.className = 'glass-card interactive-hover';
    rfCard.style.padding = '1.75rem';
    if (rapidFireLocked) {
      rfCard.style.opacity = '0.6';
      rfCard.style.cursor = 'not-allowed';
      rfCard.classList.remove('interactive-hover');
    } else {
      rfCard.style.cursor = 'pointer';
    }
    rfCard.style.border = '1px dashed var(--accent-green)';
    rfCard.style.display = 'flex';
    rfCard.style.flexDirection = 'column';
    rfCard.style.justifyContent = 'space-between';
    rfCard.addEventListener('click', () => {
      if (rapidFireLocked) {
        window.showToast("Rapid Fire is locked! You have already played today.", 'error');
      } else {
        window.location.href = 'rapid_fire.html';
      }
    });

    const rfBadge = rapidFireLocked
      ? \`<span class="badge" style="background-color: #ef5350; color: #fff; font-weight: 700;">LOCKED</span>\`
      : \`<span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">PLAY NOW</span>\`;

    const rfTitle = rapidFireLocked ? \`🔒 Rapid Fire Quiz\` : \`⚡ Rapid Fire Quiz\`;

    rfCard.innerHTML = \`
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>⏱️ Min to Win</span>
        \${rfBadge}
      </div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 0.5rem;">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 0 10px rgba(0, 230, 118, 0.4));">⚡</span>
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: \${rapidFireLocked ? 'var(--text-muted)' : 'var(--accent-green)'}; margin-bottom: 2px;">\${rfTitle}</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted);">60 seconds. 40 questions. Can you beat the clock?</p>
        </div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
        <span>Attempts: \${status.rapidFire ? (status.rapidFire.completedToday ? 1 : 0) : 0}/1</span>
        <span>Status: \${status.rapidFire && status.rapidFire.completedToday ? 'Completed' : 'Available'}</span>
      </div>
    \`;
    grid.appendChild(rfCard);
`;

if (!code.includes('Rapid Fire Quiz')) {
  code = code.replace('// grid.appendChild(gameCard);', '// grid.appendChild(gameCard);\n' + rfCardCode);
  fs.writeFileSync('frontend/app.js', code);
  console.log('Injected Rapid Fire card into app.js');
} else {
  console.log('Rapid Fire card already in app.js');
}
