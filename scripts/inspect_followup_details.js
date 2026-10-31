const fs = require('fs');
const lines = fs.readFileSync('public/servant_followup.html', 'utf8').split('\n');
console.log(lines.slice(190, 230).join('\n'));
