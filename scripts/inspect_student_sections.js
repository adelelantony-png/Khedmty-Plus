const fs = require('fs');
const content = fs.readFileSync('public/student.html', 'utf8');

const regex = /<div[^>]*id=["']([^"']+)["'][^>]*>/g;
let match;
const ids = [];
while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
}

console.log('Total div IDs in student.html:', ids.length);
console.log('Sample IDs:', ids.slice(0, 35));
