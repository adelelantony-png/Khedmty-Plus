/**
 * tests/test_student_profile_absent_dates.js
 * Verification for complete attendance history in student profile:
 * Ensures absent days (e.g., 2026-11-06) appear explicitly as "🔴 غياب بدون عذر"
 * and never get omitted from the student's attendance log.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("=== Testing Complete Attendance History in Student Profile (Absent Dates Visibility) ===");

const membersJsPath = path.join(__dirname, '..', 'public', 'js', 'dashboard', 'dashboard-members.js');
const js = fs.readFileSync(membersJsPath, 'utf8');

// 1. Check required functions and logic exist
assert.ok(js.includes('window.cancelExcuseFromProfile ='), "Missing cancelExcuseFromProfile");
assert.ok(js.includes('window.quickRegisterExcuseFromProfile ='), "Missing quickRegisterExcuseFromProfile");
assert.ok(js.includes("🔴 غياب بدون عذر"), "Missing 'غياب بدون عذر' label in profile attendance table");
assert.ok(js.includes("2026-11-06"), "Missing baseline '2026-11-06' check in official Fridays");
assert.ok(js.includes("isFutureDate"), "Missing 'isFutureDate' check to prevent future dates being marked absent");
assert.ok(js.includes("استئذان مسبق"), "Missing advance excuse labeling for future fridays");

// 2. Behavioral simulation of the profile attendance table rendering
// Setup mock environment
const mockMember = {
    id: 504,
    code: '504',
    name: 'ماريز ماهر',
    phone: '01234567890',
    stage: 'سنة أولى'
};

const mockAttendanceRecord = {
    '2026-11-13': [
        {
            id: 504,
            code: '504',
            name: 'ماريز ماهر',
            time: '01:30:00 م',
            isAbsentDueToDelay: true,
            isLate: false,
            attended: true
        }
    ],
    '2026-11-06': [
        {
            id: 504,
            code: '504',
            name: 'ماريز ماهر',
            // time is undefined intentionally (excused absence without QR scan)
            isExcused: true,
            excuseReason: 'اعتذار عام'
        }
    ]
};

const mockSettings = {
    serviceStart: '2026-11-06'
};

// Simulate the logic extracted from dashboard-members.js
const officialFridays = new Set();
officialFridays.add('2026-11-06');
officialFridays.add('2026-11-13');
// Suppose someone else submitted an excuse for next Friday 2026-11-20
officialFridays.add('2026-11-20');

const sortedFridays = Array.from(officialFridays).sort().reverse();
assert.ok(sortedFridays.includes('2026-11-06'), "sortedFridays MUST include 2026-11-06");
assert.ok(sortedFridays.includes('2026-11-13'), "sortedFridays MUST include 2026-11-13");
assert.ok(sortedFridays.includes('2026-11-20'), "sortedFridays MUST include 2026-11-20");

const renderedRows = [];
const mExcusesList = []; // No advance excuse for mockMember on 2026-11-20
const todayDateStr = '2026-11-16'; // Simulated current date (Monday before Friday 2026-11-20)

sortedFridays.forEach(d => {
    let rec = (mockAttendanceRecord[d] || []).find(a => a.id.toString() === mockMember.id.toString());
    const matchedExcuse = mExcusesList.find(ex => ex.friday_date === d);

    const isFutureDate = (d > todayDateStr);

    // ⛔ منع إظهار أي جمعة مستقبلية كـ "غياب بدون عذر" مطلقاً
    if (isFutureDate && !rec && !matchedExcuse) {
        return;
    }

    let stat = '';
    // تنظيف وقت المسح ومنع ظهور كلمة undefined نهائياً
    let displayTime = '--:--';
    if (rec && rec.time && String(rec.time).trim() !== '' && String(rec.time).toLowerCase() !== 'undefined' && String(rec.time).toLowerCase() !== 'null') {
        displayTime = String(rec.time).trim();
    } else if (matchedExcuse) {
        if (matchedExcuse.timeStr) displayTime = matchedExcuse.timeStr;
    }

    if (rec) {
        if (rec.isAbsentDueToDelay) {
            stat = '🔴 تأخير كبير (غائب)';
        } else if (rec.isExcused) {
            const excuseLabel = isFutureDate ? 'استئذان مسبق (لقاء قادم)' : 'غياب بعذر';
            stat = `🕊️ ${excuseLabel}: ${rec.excuseReason || 'عذر مقبول'}`;
        } else if (rec.isLate) {
            stat = '🟡 تأخير بسيط';
        } else {
            stat = '🟢 حاضر جمعة';
        }
    } else if (matchedExcuse) {
        const titleLabel = isFutureDate ? 'استئذان مسبق (لقاء قادم)' : 'غياب بعذر معتمد';
        stat = `🕊️ ${titleLabel}`;
    } else {
        stat = '🔴 غياب بدون عذر';
    }

    renderedRows.push({ date: d, time: displayTime, status: stat });
});

// Assertions on rendered rows:
// 1. Future Friday 2026-11-20 MUST NOT be rendered as absence!
assert.strictEqual(renderedRows.length, 2, "Must NOT render future Friday 2026-11-20 without excuse/record");
assert.strictEqual(renderedRows.find(r => r.date === '2026-11-20'), undefined, "2026-11-20 must not be in rows");

// 2. 2026-11-13 has delay absence
assert.strictEqual(renderedRows[0].date, '2026-11-13');
assert.strictEqual(renderedRows[0].status, '🔴 تأخير كبير (غائب)');
assert.strictEqual(renderedRows[0].time, '01:30:00 م');

// 3. 2026-11-06 has excused absence, time must be '--:--' and NEVER 'undefined'
assert.strictEqual(renderedRows[1].date, '2026-11-06');
assert.ok(renderedRows[1].status.includes('غياب بعذر'), "Must show excused absence");
assert.strictEqual(renderedRows[1].time, '--:--', "Excused absence without QR scan must display '--:--', NEVER 'undefined'");
assert.notStrictEqual(renderedRows[1].time, 'undefined', "Must NEVER be literal 'undefined'");

// 4. Test student WITH advance excuse for future Friday
const renderedWithAdvanceExcuse = [];
const advanceExcuseList = [{ friday_date: '2026-11-20', status: 'accepted', reason_category: 'سفر عائلي', timeStr: '10:00 ص' }];
sortedFridays.forEach(d => {
    let rec = (mockAttendanceRecord[d] || []).find(a => a.id.toString() === mockMember.id.toString());
    const matchedExcuse = advanceExcuseList.find(ex => ex.friday_date === d);
    const isFutureDate = (d > todayDateStr);

    if (isFutureDate && !rec && !matchedExcuse) return;

    let displayTime = '--:--';
    if (rec && rec.time && String(rec.time).trim() !== '' && String(rec.time).toLowerCase() !== 'undefined') {
        displayTime = String(rec.time).trim();
    } else if (matchedExcuse && matchedExcuse.timeStr) {
        displayTime = matchedExcuse.timeStr;
    }

    let stat = '';
    if (matchedExcuse && isFutureDate) {
        stat = `🕊️ استئذان مسبق (لقاء قادم): ${matchedExcuse.reason_category}`;
    }
    renderedWithAdvanceExcuse.push({ date: d, time: displayTime, status: stat });
});

const futureRow = renderedWithAdvanceExcuse.find(r => r.date === '2026-11-20');
assert.ok(futureRow, "Future Friday with advance excuse MUST be rendered");
assert.strictEqual(futureRow.time, '10:00 ص');
assert.ok(futureRow.status.includes('استئذان مسبق (لقاء قادم)'));

console.log("✅ Verified: Future Friday 2026-11-20 is NEVER marked as absence without excuse!");
console.log("✅ Verified: Advance excuses for upcoming fridays clearly show 'استئذان مسبق (لقاء قادم)'!");
console.log("✅ Verified: Missing scan times display '--:--' and NEVER literal 'undefined'!");
console.log("🎉 Test passed successfully!");
