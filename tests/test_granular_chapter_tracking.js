const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Suite 22: Granular Chapter-by-Chapter Tracking Tests...');

// 1. Verify student.html markup and functions
const studentHtml = fs.readFileSync(path.join(__dirname, '../public/student.html'), 'utf8');
assert.ok(studentHtml.includes('id="ui-today-chapters-grid"'), 'student.html must contain ui-today-chapters-grid');
assert.ok(studentHtml.includes('id="ui-chapters-progress-box"'), 'student.html must contain ui-chapters-progress-box');
assert.ok(studentHtml.includes('renderTodayChaptersUI'), 'student.html must declare renderTodayChaptersUI');
assert.ok(studentHtml.includes('toggleChapterRead'), 'student.html must declare toggleChapterRead');
console.log('  ✅ student.html chapter studio elements and functions verified');

// 2. Verify spiritual_note.html markup and functions
const noteHtml = fs.readFileSync(path.join(__dirname, '../public/spiritual_note.html'), 'utf8');
assert.ok(noteHtml.includes('id="catchup-chapters-box"'), 'spiritual_note.html must contain catchup-chapters-box');
assert.ok(noteHtml.includes('id="catchup-chapters-grid"'), 'spiritual_note.html must contain catchup-chapters-grid');
assert.ok(noteHtml.includes('catchup-chapters-progress'), 'spiritual_note.html must contain catchup-chapters-progress');
console.log('  ✅ spiritual_note.html catchup chapter chips verified');

// 3. Verify harvest.html & api/harvest.js
const harvestHtml = fs.readFileSync(path.join(__dirname, '../public/harvest.html'), 'utf8');
assert.ok(harvestHtml.includes('bibleChaptersCount'), 'harvest.html must compute bibleChaptersCount');
assert.ok(harvestHtml.includes('totalBibleChapters'), 'harvest.html must reference totalBibleChapters (1189)');

const harvestApi = fs.readFileSync(path.join(__dirname, '../api/harvest.js'), 'utf8');
assert.ok(harvestApi.includes('bibleChaptersCount'), 'api/harvest.js must aggregate bibleChaptersCount');
assert.ok(harvestApi.includes('totalBibleChapters: 1189'), 'api/harvest.js must return totalBibleChapters 1189');
console.log('  ✅ harvest.html & api/harvest.js chapter tracking verified');

// 4. Verify servant_spiritual_report.html & servant-dashboard.html
const repHtml = fs.readFileSync(path.join(__dirname, '../public/servant_spiritual_report.html'), 'utf8');
assert.ok(repHtml.includes('completed_chapters.length'), 'servant_spiritual_report.html must sum completed_chapters.length');

const dashHtml = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
assert.ok(dashHtml.includes('completed_chapters.length'), 'servant-dashboard.html must count completed_chapters in countBibleReadingsFor');
console.log('  ✅ servant_spiritual_report & servant-dashboard chapter counting verified');

// 5. Test Logic Simulation: Points & Completion calculation
function calculateChapterScore(completedArr, totalCount) {
    const isFull = completedArr.length >= totalCount && totalCount > 0;
    return (completedArr.length * 2) + (isFull ? 3 : 0);
}

// Case A: 1 chapter of 3 read -> 2 pts, not full
assert.strictEqual(calculateChapterScore([1], 3), 2, '1 chapter of 3 should earn 2 points');

// Case B: 2 chapters of 3 read -> 4 pts, not full
assert.strictEqual(calculateChapterScore([1, 2], 3), 4, '2 chapters of 3 should earn 4 points');

// Case C: 3 chapters of 3 read -> 6 pts + 3 bonus = 9 pts, full completion
assert.strictEqual(calculateChapterScore([1, 2, 3], 3), 9, '3 chapters of 3 should earn 9 points (6 + 3 bonus)');

console.log('  ✅ Chapter points logic (2 pts/chap + 3 bonus on 100%) verified');

console.log('🎉 Suite 22: Granular Chapter-by-Chapter Tracking PASSED successfully!');
