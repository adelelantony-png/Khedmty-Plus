/**
 * tests/test_student_mobile_tabs.js
 * Test Suite 24: Student Portal Mobile Bottom Navigation & 4 Liturgical Panes Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Student Portal Mobile Bottom Navigation & 4 Liturgical Panes...');

const studentHtmlPath = path.resolve(__dirname, '../public/student.html');
assert.ok(fs.existsSync(studentHtmlPath), 'student.html must exist');
const content = fs.readFileSync(studentHtmlPath, 'utf8');

// 1. Verify Top Tabs & Mobile Bottom Navigation Bar presence
assert.ok(content.includes('student-top-tabs'), 'student.html must contain .student-top-tabs');
assert.ok(content.includes('student-bottom-nav'), 'student.html must contain .student-bottom-nav');
assert.ok(content.includes('bottom-nav-item'), 'student.html must contain .bottom-nav-item');

// 2. Verify 4 Panes exist
assert.ok(content.includes('id="pane-home"'), 'Pane Home must exist');
assert.ok(content.includes('id="pane-spiritual"'), 'Pane Spiritual must exist');
assert.ok(content.includes('id="pane-grades"'), 'Pane Grades must exist');
assert.ok(content.includes('id="pane-badges"'), 'Pane Badges must exist');

// 3. Verify Pane 1: Home contains Streak, Feasts, Reading Plan
assert.ok(content.includes('ui-streak-count'), 'Pane Home must contain ui-streak-count');
assert.ok(content.includes('ui-today-reading-title'), 'Pane Home must contain ui-today-reading-title');
assert.ok(content.includes('ui-today-chapters-grid'), 'Pane Home must contain ui-today-chapters-grid');
assert.ok(content.includes('student-birthday-banner'), 'Pane Home must contain student-birthday-banner');

// 4. Verify Pane 2: Spiritual contains Confession & Reading shelf
assert.ok(content.includes('ui-last-confession-date'), 'Pane Spiritual must contain ui-last-confession-date');
assert.ok(content.includes('href="bible.html"'), 'Pane Spiritual must contain link to bible.html');
assert.ok(content.includes('href="katamaros.html"'), 'Pane Spiritual must contain link to katamaros.html');
assert.ok(content.includes('href="synaxarium.html"'), 'Pane Spiritual must contain link to synaxarium.html');

// 5. Verify Pane 3: Grades contains Conference & Services shelf
assert.ok(content.includes('conferenceDiscountStudentCard'), 'Pane Grades must contain conferenceDiscountStudentCard');
assert.ok(content.includes('href="barcode.html"'), 'Pane Grades must contain link to barcode.html');
assert.ok(content.includes('href="student_attendance.html"'), 'Pane Grades must contain link to student_attendance.html');
assert.ok(content.includes('href="results.html"'), 'Pane Grades must contain link to results.html');

// 6. Verify Pane 4: Badges contains Badges Grid & Feedback
assert.ok(content.includes('badgesGrid'), 'Pane Badges must contain badgesGrid');
assert.ok(content.includes('badge-week'), 'Pane Badges must contain badge-week');
assert.ok(content.includes('badge-month'), 'Pane Badges must contain badge-month');
assert.ok(content.includes('href="harvest.html"'), 'Pane Badges must contain link to harvest.html');
assert.ok(content.includes('feedbackRatingContainer'), 'Pane Badges must contain feedbackRatingContainer');

// 7. Verify switchStudentTab logic
assert.ok(content.includes('function switchStudentTab'), 'student.html must define switchStudentTab()');
assert.ok(content.includes('window.switchStudentTab'), 'switchStudentTab must be exposed on window');

console.log('🎉 Suite 24: Student Portal Mobile Bottom Navigation & 4 Liturgical Panes PASSED successfully!\n');
process.exit(0);
