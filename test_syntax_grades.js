const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, 'public', 'servant_grades_entry.html'), 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
let errors = 0;

while ((match = scriptRegex.exec(content)) !== null) {
    scriptIdx++;
    const code = match[1];
    if (!code.trim()) continue;
    try {
        new Function(code);
        console.log(`[PASS] Script block #${scriptIdx} is valid JavaScript (Syntax OK)!`);
    } catch(e) {
        console.error(`[FAIL] Syntax error in script block #${scriptIdx}:`, e.message);
        errors++;
    }
}

if (errors === 0) {
    console.log('🎉 ALL inline scripts in servant_grades_entry.html are 100% syntactically valid!');
    process.exit(0);
} else {
    process.exit(1);
}
