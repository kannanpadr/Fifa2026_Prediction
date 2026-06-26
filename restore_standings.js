const fs = require('fs');

let code = fs.readFileSync('server.js', 'utf8');

const block = `
// ==========================================
// GROUP STANDINGS
// ==========================================

// Predefined groups according to standard format
const INITIAL_GROUPS = {
  A: [
    { name: 'Mexico', code: 'mx' },
    { name: 'Cameroon', code: 'cm' },
    { name: 'Croatia', code: 'hr' },
    { name: 'Saudi Arabia', code: 'sa' }
  ],
  B: [
    { name: 'Canada', code: 'ca' },
    { name: 'Nigeria', code: 'ng' },
    { name: 'South Korea', code: 'kr' },
    { name: 'Costa Rica', code: 'cr' }
  ],
  C: [
    { name: 'USA', code: 'us' },
    { name: 'Algeria', code: 'dz' },
    { name: 'Serbia', code: 'rs' },
    { name: 'Qatar', code: 'qa' }
  ],
  D: [
    { name: 'Argentina', code: 'ar' },
    { name: 'Ivory Coast', code: 'ci' },
    { name: 'Iran', code: 'ir' },
    { name: 'Slovakia', code: 'sk' }
  ],
  E: [
    { name: 'Brazil', code: 'br' },
    { name: 'Mali', code: 'ml' },
    { name: 'Japan', code: 'jp' },
    { name: 'Scotland', code: 'gb-sct' }
  ],
  F: [
    { name: 'France', code: 'fr' },
    { name: 'Morocco', code: 'ma' },
    { name: 'Australia', code: 'au' },
    { name: 'Peru', code: 'pe' }
  ],
  G: [
    { name: 'Spain', code: 'es' },
    { name: 'Senegal', code: 'sn' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'New Zealand', code: 'nz' }
  ],
  H: [
    { name: 'England', code: 'gb-eng' },
    { name: 'Tunisia', code: 'tn' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Jamaica', code: 'jm' }
  ],
  I: [
    { name: 'Belgium', code: 'be' },
    { name: 'Egypt', code: 'eg' },
    { name: 'South Korea', code: 'kr' },
    { name: 'Panama', code: 'pa' }
  ],
  J: [
    { name: 'Portugal', code: 'pt' },
    { name: 'Ghana', code: 'gh' },
    { name: 'Iran', code: 'ir' },
    { name: 'Honduras', code: 'hn' }
  ],
  K: [
    { name: 'Netherlands', code: 'nl' },
    { name: 'South Africa', code: 'za' },
    { name: 'Japan', code: 'jp' },
    { name: 'El Salvador', code: 'sv' }
  ],
  L: [
    { name: 'Germany', code: 'de' },
    { name: 'Cameroon', code: 'cm' },
    { name: 'Australia', code: 'au' },
    { name: 'Haiti', code: 'ht' }
  ]
};

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
`;

const insertPoint = "app.post('/api/admin/matches/update'";
code = code.replace(insertPoint, block + '\n\n' + insertPoint);

fs.writeFileSync('server.js', code);
console.log('Restored standings route successfully!');
