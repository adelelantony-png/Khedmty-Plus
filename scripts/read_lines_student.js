const fs = require('fs');
const lines = fs.readFileSync('public/student.html', 'utf8').split('\n');
console.log(lines.slice(710, 725).map((l, i) => (710 + i) + ': ' + l).join('\n'));
