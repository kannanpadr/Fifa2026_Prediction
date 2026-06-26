const fs = require('fs');

let code = fs.readFileSync('frontend/rapid_fire.html', 'utf8');

// Replace escaped backticks with actual backticks
code = code.split('\\`').join('`');

// Replace escaped dollar signs with actual dollar signs
code = code.split('\\$').join('$');

fs.writeFileSync('frontend/rapid_fire.html', code);
console.log('Fixed syntax errors in rapid_fire.html');
