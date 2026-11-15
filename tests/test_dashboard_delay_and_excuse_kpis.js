const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Dashboard Delay/Excuse KPIs, Excel 14m/15m Rules & WhatsApp Time Extractor...');

const htmlPath = path.join(__dirname, '../public/servant-dashboard.html');
const attPath = path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const att = fs.readFileSync(attPath, 'utf8');

// 1. Check openAttendanceWithFilter
assert(html.includes('window.openAttendanceWithFilter = function'), 'openAttendanceWithFilter must be defined');

// 2. Check interactive cards on Dashboard
assert(html.includes('id="statTodayMinorDelay"'), 'statTodayMinorDelay must exist');
assert(html.includes('id="statTodaySevereDelay"'), 'statTodaySevereDelay must exist');
assert(html.includes('id="statTodayExcused"'), 'statTodayExcused must exist');
assert(html.includes("openAttendanceWithFilter('late')"), "openAttendanceWithFilter('late') button must exist");
assert(html.includes("openAttendanceWithFilter('severe')"), "openAttendanceWithFilter('severe') button must exist");

// 3. Check WhatsApp Announcement extractor & Excel delay evaluator functions
assert(att.includes('function extractMeetingTimeFromMessage'), 'extractMeetingTimeFromMessage must exist');
assert(att.includes('function getEffectiveMeetingStartTime'), 'getEffectiveMeetingStartTime must exist');
assert(att.includes('function evaluateAttendanceDelayStatus'), 'evaluateAttendanceDelayStatus must exist');

// Test evaluateAttendanceDelayStatus logic in isolation
const evalScope = {};
const fnCode = att.match(/(function extractMeetingTimeFromMessage[\s\S]*?window\.evaluateAttendanceDelayStatus = evaluateAttendanceDelayStatus;)/)[1];
eval(fnCode.replace(/window\./g, 'evalScope.'));

// Basic 13:00 default
const t1 = extractMeetingTimeFromMessage("⏱️ *ميعاد التواجد*: الساعة 12:30 ظهراً بالضبط");
assert.strictEqual(t1, '12:30', 'Should extract 12:30 from WhatsApp broadcast message');

const t2 = extractMeetingTimeFromMessage("بإذن المسيح اللقاء الجمعة الساعة 1:00 م");
assert.strictEqual(t2, '13:00', 'Should extract 13:00 from 1:00 م');

const t3 = extractMeetingTimeFromMessage("الاجتماع هيبدأ الساعة 12 ونص");
assert.strictEqual(t3, '12:30', 'Should extract 12:30 from 12 ونص');

// Test 14 min / 15 min Excel delay rules (Default start 13:00)
// Helper to simulate parseAnyTimeTo24h
global.parseAnyTimeTo24h = function(str) {
    if (str.includes(':')) {
        const parts = str.split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (str.includes('م') && h < 12) h += 12;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return str;
};
global.settings = { startTime: "13:00" };

// On time: 13:00
const resOnTime = evaluateAttendanceDelayStatus("13:00", "2026-11-13");
assert.strictEqual(resOnTime.isLate, false);
assert.strictEqual(resOnTime.isAbsentDueToDelay, false);
assert.strictEqual(resOnTime.status, 'ontime');

// Minor Delay: 13:10 (10 min <= 14 min) -> Late = true, Absent = false (Present according to Excel)
const resMinor1 = evaluateAttendanceDelayStatus("13:10", "2026-11-13");
assert.strictEqual(resMinor1.isLate, true, '13:10 should be minor delay');
assert.strictEqual(resMinor1.isAbsentDueToDelay, false, '13:10 should NOT be absent');
assert.strictEqual(resMinor1.status, 'late');

// Minor Delay: 13:14 (14 min <= 14 min) -> Late = true, Absent = false
const resMinor2 = evaluateAttendanceDelayStatus("13:14", "2026-11-13");
assert.strictEqual(resMinor2.isLate, true, '13:14 should be minor delay');
assert.strictEqual(resMinor2.isAbsentDueToDelay, false, '13:14 should NOT be absent');

// Major Delay: 13:15 (15 min >= 15 min) -> Late = false, Absent = true (ABSENT according to Excel rules!)
const resMajor1 = evaluateAttendanceDelayStatus("13:15", "2026-11-13");
assert.strictEqual(resMajor1.isLate, false);
assert.strictEqual(resMajor1.isAbsentDueToDelay, true, '13:15 MUST be absent due to major delay');
assert.strictEqual(resMajor1.status, 'severe');

// Major Delay: 13:30 (30 min) -> Absent = true
const resMajor2 = evaluateAttendanceDelayStatus("13:30", "2026-11-13");
assert.strictEqual(resMajor2.isAbsentDueToDelay, true, '13:30 MUST be absent due to major delay');

// 4. Check dynamic modal preset grid & rule banner in HTML
assert(html.includes('id="modalTimePresetButtonsGrid"'), 'modalTimePresetButtonsGrid must exist');
assert(html.includes('id="modalTimeRuleBanner"'), 'modalTimeRuleBanner must exist');
assert(html.includes('id="attMeetingStartTimeBadge"'), 'attMeetingStartTimeBadge must exist');

console.log('✅ ALL TESTS PASSED (100%): Excel 14m/15m delay rules & WhatsApp time parser verified!');
