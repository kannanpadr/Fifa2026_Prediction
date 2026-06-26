const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('`r`n')) {
    content = content.split('`r`n').join('\n');
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', file);
  }
});
