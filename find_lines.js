const fs = require('fs');
const lines = fs.readFileSync('frontend/app.js', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('Status: ${rapidFireLocked ? \\'Completed\\' : \\'Available\\'}'));
console.log(lines.slice(start - 5, start + 5).map((l, i) => (start - 5 + i + 1) + ': ' + l).join('\n'));
