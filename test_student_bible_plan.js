/**
 * Unit Test: Student Portal Bible Plan Loading & Safe Execution Shield
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Student Bible Plan & Safety Shield Verification...');

const studentHtml = fs.readFileSync(path.join(__dirname, 'public/student.html'), 'utf8');

// 1. Check Global Stubs Shield in <head>
assert.ok(studentHtml.includes('window.renderConferenceDiscountCard = window.renderConferenceDiscountCard || function() {};'), 'Global stub shield must exist for renderConferenceDiscountCard');
assert.ok(studentHtml.includes('window.loadTodayBiblePlan = window.loadTodayBiblePlan || function() {};'), 'Global stub shield must exist for loadTodayBiblePlan');

// 2. Check bible_plan.js versioned script tag
assert.ok(studentHtml.includes('src="bible_plan.js?v='), 'bible_plan.js must be loaded with cache busting version');

// 3. Check loadTodayBiblePlan safety
assert.ok(studentHtml.includes('window.loadTodayBiblePlan = loadTodayBiblePlan;'), 'loadTodayBiblePlan must be attached to window');
assert.ok(studentHtml.includes('try { syncCloudAttendance(); } catch(e)'), 'syncCloudAttendance call must be try-catch guarded');
assert.ok(studentHtml.includes('try { loadTodayBiblePlan(); } catch(e)'), 'loadTodayBiblePlan call must be try-catch guarded');

// 4. Verify Bible reading calculation for today and arbitrary dates
const biblePlan = require('./public/bible_plan.js');
const todayReading = biblePlan.getBiblePlanReading(new Date(2026, 10, 9));
assert.strictEqual(todayReading.book, 'صموئيل الأول', 'Nov 9 reading book should be صموئيل الأول');
assert.strictEqual(todayReading.chapter, 16, 'Nov 9 start chapter should be 16');
assert.strictEqual(todayReading.chapter_end, 19, 'Nov 9 end chapter should be 19');
assert.strictEqual(todayReading.dayNumber, 70, 'Nov 9 dayNumber should be 70');

console.log('✅ Student Bible Plan & Safety Shield Verification PASSED 100%!');
