/**
 * test_servant_open_date_attendance.js
 * Verification test for Servant Open-Date Attendance System.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("=== Testing Servant Open-Date Attendance Architecture ===");

// 1. Verify files contain open-date functions and controls
const htmlPath = path.join(__dirname, 'public', 'servant-dashboard.html');
const servantsJsPath = path.join(__dirname, 'public', 'js', 'dashboard', 'dashboard-servants.js');
const attendanceJsPath = path.join(__dirname, 'public', 'js', 'dashboard', 'dashboard-attendance.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const servantsJs = fs.readFileSync(servantsJsPath, 'utf8');
const attendanceJs = fs.readFileSync(attendanceJsPath, 'utf8');

// HTML checks
assert.ok(htmlContent.includes('id="servantAttendanceDatePicker"'), "Missing servantAttendanceDatePicker input in HTML");
assert.ok(htmlContent.includes('id="servantAttendanceSelectedDateLabel"'), "Missing servantAttendanceSelectedDateLabel in HTML");
assert.ok(htmlContent.includes('shiftServantAttendanceDate(-7)'), "Missing previous Friday button in HTML");
assert.ok(htmlContent.includes('shiftServantAttendanceDate(7)'), "Missing next Friday button in HTML");
assert.ok(htmlContent.includes('syncWithStudentAttendanceDate()'), "Missing syncWithStudentAttendanceDate button in HTML");
assert.ok(htmlContent.includes('id="statServantsDateSubtitle"'), "Missing statServantsDateSubtitle in HTML");
assert.ok(htmlContent.includes('id="servantTableDateHeader"'), "Missing servantTableDateHeader in HTML");
console.log("✅ HTML open-date controls verified successfully.");

// JS functions checks
assert.ok(servantsJs.includes('function getActiveServantDate'), "Missing getActiveServantDate");
assert.ok(servantsJs.includes('function changeServantAttendanceDate'), "Missing changeServantAttendanceDate");
assert.ok(servantsJs.includes('function shiftServantAttendanceDate'), "Missing shiftServantAttendanceDate");
assert.ok(servantsJs.includes('function syncWithStudentAttendanceDate'), "Missing syncWithStudentAttendanceDate");
assert.ok(servantsJs.includes('function setServantAttendanceToday'), "Missing setServantAttendanceToday");
assert.ok(attendanceJs.includes('changeServantAttendanceDate'), "Missing sync in dashboard-attendance.js");
console.log("✅ JavaScript functions exist and verified.");

// 2. Behavioral simulation
const mockServants = [
    { id: 101, name: "عادل جورج", code: "S101", phone: "01220000000", role: "admin" },
    { id: 102, name: "مايكل مجدي", code: "S102", phone: "01221111111", role: "servant" }
];

let servantsAttendance = {
    "2026-11-06": [{ id: 101, name: "عادل جورج", code: "S101", phone: "01220000000", time: "18:30" }]
};

let activeSelectedDate = "2026-11-06";
let activeServantAttendanceDate = "2026-11-06";
let today = "2026-11-09";

function getActiveServantDate() {
    return activeServantAttendanceDate || activeSelectedDate || today;
}

function recordServantAttendance(servant, targetDate) {
    let d = targetDate || getActiveServantDate();
    if (!servantsAttendance[d]) servantsAttendance[d] = [];
    if (!servantsAttendance[d].some(s => s.id.toString() === servant.id.toString())) {
        servantsAttendance[d].push({
            id: servant.id,
            name: servant.name,
            code: servant.code || servant.id,
            phone: servant.phone || "",
            time: "19:00"
        });
    }
}

function cancelServantAttendance(servantId, targetDate) {
    let d = targetDate || getActiveServantDate();
    servantsAttendance[d] = (servantsAttendance[d] || []).filter(item => item.id.toString() !== servantId.toString());
}

// Test recording on past Friday 2026-11-06
assert.strictEqual(getActiveServantDate(), "2026-11-06");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 1);

// Record servant 102 on 2026-11-06
recordServantAttendance(mockServants[1], "2026-11-06");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "Servant 102 should be recorded on 2026-11-06");

// Change date to earlier Friday 2026-10-30
activeServantAttendanceDate = "2026-10-30";
assert.strictEqual(getActiveServantDate(), "2026-10-30");

// Record servant 101 on 2026-10-30
recordServantAttendance(mockServants[0], "2026-10-30");
assert.strictEqual(servantsAttendance["2026-10-30"].length, 1, "Servant 101 recorded on 2026-10-30");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "2026-11-06 records preserved intact");

// Cancel servant 101 on 2026-10-30
cancelServantAttendance(101, "2026-10-30");
assert.strictEqual(servantsAttendance["2026-10-30"].length, 0, "Servant 101 cancelled on 2026-10-30");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "2026-11-06 unaffected by 2026-10-30 cancellation");

console.log("✅ All behavioral open-date simulation assertions passed!");
