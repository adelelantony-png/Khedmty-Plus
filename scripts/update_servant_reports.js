const fs = require('fs');
const path = require('path');

// 1. Update servant_spiritual_report.html
const repPath = path.join(__dirname, '../public/servant_spiritual_report.html');
let repHtml = fs.readFileSync(repPath, 'utf8');

const oldRepTarget = `            // قراءات الإنجيل
            let bible = Object.keys(bibleReadings).filter(k =>
                k.endsWith('_' + code) || String((bibleReadings[k] || {}).code || '') === code).length;`;

const newRepTarget = `            // قراءات الإنجيل: حساب عدد الإصحاحات الفعلي بدقة
            let bible = 0;
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

if (repHtml.includes("k.endsWith('_' + code)")) {
    repHtml = repHtml.replace(oldRepTarget, newRepTarget);
    fs.writeFileSync(repPath, repHtml, 'utf8');
    console.log('✅ Updated servant_spiritual_report.html with granular chapters sum');
}

// 2. Update servant-dashboard.html countBibleReadingsFor
const dashPath = path.join(__dirname, '../public/servant-dashboard.html');
let dashHtml = fs.readFileSync(dashPath, 'utf8');

const oldDashFuncStart = 'function countBibleReadingsFor(readings, sCode) {';
const oldDashFuncEnd = 'return n;\n\n}';

const pStart = dashHtml.indexOf(oldDashFuncStart);
if (pStart !== -1) {
    const pEnd = dashHtml.indexOf('return n;', pStart);
    if (pEnd !== -1) {
        const fullEnd = dashHtml.indexOf('}', pEnd) + 1;
        const newDashFunc = `function countBibleReadingsFor(readings, sCode) {
if (!readings || !sCode) return 0;
let n = 0;
Object.keys(readings).forEach(k => {
    let v = readings[k];
    let matches = (k.endsWith('_' + sCode) || k.startsWith(sCode + '_')) ||
                  (v && typeof v === 'object' && !Array.isArray(v) && (String(v.code || v.studentCode || '') === String(sCode)));
    if (matches) {
        if (v && Array.isArray(v.completed_chapters)) {
            n += v.completed_chapters.length;
        } else if (v && v.chapters_read_count) {
            n += v.chapters_read_count;
        } else if (v && (v.is_completed || v.completed)) {
            n += (v.total_chapters || 1);
        } else {
            n++;
        }
    }
});
return n;
}`;
        dashHtml = dashHtml.substring(0, pStart) + newDashFunc + dashHtml.substring(fullEnd);
        fs.writeFileSync(dashPath, dashHtml, 'utf8');
        console.log('✅ Updated servant-dashboard.html countBibleReadingsFor');
    }
}
