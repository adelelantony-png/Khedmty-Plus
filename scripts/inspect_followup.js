const fs = require('fs');
const content = fs.readFileSync('public/servant_followup.html', 'utf8');

console.log('File size in bytes:', content.length);

// Find filter functions and stat renderers
const functions = content.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g) || [];
console.log('Functions found:', functions.map(f => f.replace(/function\s+|\(/g, '').trim()));

// Find KPI / stats cards in HTML
const statsMatch = content.match(/<div class="row[^>]*id="statsContainer"[^>]*>[\s\S]*?<\/div>/);
console.log('Stats container found:', Boolean(statsMatch));

// Check quick filter types
const quickFilterMatch = content.match(/function applyQuickFilter\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
if (quickFilterMatch) {
    console.log('applyQuickFilter implementation:\n', quickFilterMatch[0].slice(0, 500));
}
