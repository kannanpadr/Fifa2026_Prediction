const fs = require('fs');
const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));
const ts = Date.now();
files.forEach(f => {
  let content = fs.readFileSync('frontend/' + f, 'utf8');
  if (content.includes('src="app.js"')) {
    content = content.replace(/src="app.js"/g, 'src="app.js?v=' + ts + '"');
    fs.writeFileSync('frontend/' + f, content);
  }
});
console.log('Cache busting applied to all HTML files');
