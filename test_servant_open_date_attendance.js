/**
 * test_servant_open_date_attendance.js
 * Verification test for Servant & Student Open-Date Attendance Architecture.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("=== Testing Servant & Student Open-Date Attendance Architecture ===");

// 1. Verify files contain open-date functions and controls
const htmlPath = path.join(__dirname, 'public', 'servant-dashboard.html');
const servantsJsPath = path.join(__dirname, 'public', 'js', 'dashboard', 'dashboard-servants.js');
const attendanceJsPath = path.join(__dirname, 'public', 'js', 'dashboard', 'dashboard-attendance.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const servantsJs = fs.readFileSync(servantsJsPath, 'utf8');
const attendanceJs = fs.readFileSync(attendanceJsPath, 'utf8');

// HTML Servant Attendance controls checks
assert.ok(htmlContent.includes('id="servantAttendanceDatePicker"'), "Missing servantAttendanceDatePicker input in HTML");
assert.ok(htmlContent.includes('id="servantAttendanceSelectedDateLabel"'), "Missing servantAttendanceSelectedDateLabel in HTML");
assert.ok(htmlContent.includes('shiftServantAttendanceDate(-7)'), "Missing previous Friday button in HTML");
assert.ok(htmlContent.includes('shiftServantAttendanceDate(7)'), "Missing next Friday button in HTML");
assert.ok(htmlContent.includes('syncWithStudentAttendanceDate()'), "Missing syncWithStudentAttendanceDate button in HTML");
assert.ok(htmlContent.includes('id="statServantsDateSubtitle"'), "Missing statServantsDateSubtitle in HTML");
assert.ok(htmlContent.includes('id="servantTableDateHeader"'), "Missing servantTableDateHeader in HTML");
console.log("✅ HTML servant open-date controls verified successfully.");

// HTML Student Attendance controls checks (Harmonized Date Bar)
assert.ok(htmlContent.includes('id="studentAttendanceDatePicker"'), "Missing studentAttendanceDatePicker input in HTML");
assert.ok(htmlContent.includes('id="studentAttendanceSelectedDateLabel"'), "Missing studentAttendanceSelectedDateLabel in HTML");
assert.ok(htmlContent.includes('shiftStudentAttendanceDate(-7)'), "Missing shiftStudentAttendanceDate(-7) button in HTML");
assert.ok(htmlContent.includes('shiftStudentAttendanceDate(7)'), "Missing shiftStudentAttendanceDate(7) button in HTML");
assert.ok(htmlContent.includes('syncWithServantAttendanceDate()'), "Missing syncWithServantAttendanceDate button in HTML");
console.log("✅ HTML student open-date controls verified successfully.");

// JS String ID and Quotation checks (Prevent onclick unquoted syntax errors)
assert.ok(servantsJs.includes("manualMarkServant('${s.id}'"), "manualMarkServant in table must quote s.id");
assert.ok(servantsJs.includes("cancelServantAttendance('${s.id}'"), "cancelServantAttendance in table must quote s.id");
console.log("✅ Servant table action buttons safely quote servant IDs.");

// JS functions checks
assert.ok(servantsJs.includes('function getActiveServantDate'), "Missing getActiveServantDate");
assert.ok(servantsJs.includes('function changeServantAttendanceDate'), "Missing changeServantAttendanceDate");
assert.ok(servantsJs.includes('function shiftServantAttendanceDate'), "Missing shiftServantAttendanceDate");
assert.ok(servantsJs.includes('function syncWithStudentAttendanceDate'), "Missing syncWithStudentAttendanceDate");
assert.ok(servantsJs.includes('function setServantAttendanceToday'), "Missing setServantAttendanceToday");
assert.ok(attendanceJs.includes('function shiftStudentAttendanceDate'), "Missing shiftStudentAttendanceDate in attendance.js");
assert.ok(attendanceJs.includes('function syncWithServantAttendanceDate'), "Missing syncWithServantAttendanceDate in attendance.js");
assert.ok(attendanceJs.includes('function formatStudentArabicDate'), "Missing formatStudentArabicDate in attendance.js");
assert.ok(attendanceJs.includes('changeServantAttendanceDate'), "Missing sync in dashboard-attendance.js");
console.log("✅ JavaScript functions exist and verified.");

// 2. Behavioral simulation
const mockServants = [
    { id: "S101", name: "عادل جورج", code: "S101", phone: "01220000000", role: "admin" },
    { id: "SRV_99", name: "مايكل مجدي", code: "102", phone: "01221111111", role: "servant" }
];

let servantsAttendance = {
    "2026-11-06": [{ id: "S101", name: "عادل جورج", code: "S101", phone: "01220000000", time: "18:30" }]
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
    if (!servantsAttendance[d].some(s => String(s.id) === String(servant.id))) {
        servantsAttendance[d].push({
            id: servant.id,
            name: servant.name,
            code: servant.code || servant.id,
            phone: servant.phone || "",
            time: "19:00"
        });
    }
}

function manualMarkServant(servantId, targetDate) {
    let s = mockServants.find(x => String(x.id) === String(servantId) || String(x.code) === String(servantId));
    if (!s) return;
    let d = targetDate || getActiveServantDate();
    recordServantAttendance(s, d);
}

function cancelServantAttendance(servantId, targetDate) {
    let d = targetDate || getActiveServantDate();
    servantsAttendance[d] = (servantsAttendance[d] || []).filter(item => String(item.id) !== String(servantId) && String(item.code || '') !== String(servantId));
}

// Test recording on past Friday 2026-11-06 with alphanumeric string ID
assert.strictEqual(getActiveServantDate(), "2026-11-06");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 1);

// Record servant "SRV_99" via manualMarkServant on 2026-11-06
manualMarkServant("SRV_99", "2026-11-06");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "Servant SRV_99 should be recorded on 2026-11-06");

// Change date to earlier Friday 2026-10-30
activeServantAttendanceDate = "2026-10-30";
assert.strictEqual(getActiveServantDate(), "2026-10-30");

// Record servant S101 on 2026-10-30
manualMarkServant("S101", "2026-10-30");
assert.strictEqual(servantsAttendance["2026-10-30"].length, 1, "Servant S101 recorded on 2026-10-30");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "2026-11-06 records preserved intact");

// Cancel servant S101 on 2026-10-30
cancelServantAttendance("S101", "2026-10-30");
assert.strictEqual(servantsAttendance["2026-10-30"].length, 0, "Servant S101 cancelled on 2026-10-30");
assert.strictEqual(servantsAttendance["2026-11-06"].length, 2, "2026-11-06 unaffected by 2026-10-30 cancellation");

console.log("✅ All behavioral open-date & string-id simulation assertions passed!");
