const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');

const injection = `
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

    rpCard.innerHTML = \`
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; align-items: center;">
        <span>🏆 Live Event</span>
        <span class="badge" style="background-color: var(--accent-green); color: var(--text-dark); font-weight: 700;">VIEW STANDINGS</span>
      </div>
      <div>
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">⚽</span>
        <h3 style="margin-bottom: 0.5rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700;">Real Penalty Standings</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.4;">Check out the live scores for the physical penalty shootout event.</p>
      </div>
    \`;
    grid.appendChild(rpCard);
`;

code = code.replace('container.appendChild(grid);', injection + '\n    container.appendChild(grid);');
fs.writeFileSync('frontend/app.js', code);
