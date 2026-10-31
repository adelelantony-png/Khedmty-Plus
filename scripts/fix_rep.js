const fs = require('fs');
let content = fs.readFileSync('public/servant_spiritual_report.html', 'utf8');

const regex = /let bible = Object\.keys\(bibleReadings\)\.filter\([\s\S]*?\)\.length;/;

const replacement = `let bible = 0;
            Object.keys(bibleReadings).forEach(k => {
                if (k.endsWith('_' + code) || String((bibleReadings[k] || {}).code || '') === code) {
                    const item = bibleReadings[k] || {};
                    if (Array.isArray(item.completed_chapters)) {
                        bible += item.completed_chapters.length;
                    } else if (item.chapters_read_count) {
                        bible += item.chapters_read_count;
                    } else if (item.is_completed || item.completed) {
                        bible += (item.total_chapters || 1);
                    } else {
                        bible += 1;
                    }
                }
            });`;

content = content.replace(regex, replacement);
fs.writeFileSync('public/servant_spiritual_report.html', content, 'utf8');
console.log('✅ servant_spiritual_report.html updated successfully');
