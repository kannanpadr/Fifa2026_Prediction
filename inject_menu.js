const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const injection = '            <li id="navRealPenaltyAdminMenu" style="display: none;"><a href="admin_real_penalty.html" class="navbar-link">⚽ Real Penalty Admin</a></li>\n          </ul>';

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('id="navRealPenaltyAdminMenu"')) {
    content = content.replace('          </ul>', injection);
    fs.writeFileSync(filePath, content);
  }
});
console.log('Injected navRealPenaltyAdminMenu into all HTML files');
