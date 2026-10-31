const fs = require('fs');
const content = fs.readFileSync('public/servant_followup.html', 'utf8');

const idx = content.indexOf('<div class="stats-grid">');
console.log(content.slice(idx + 1000, idx + 1800));
