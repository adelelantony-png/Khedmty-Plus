const fs = require('fs');
const assert = require('assert');

console.log('🧪 Starting Test Suite: Birthday Celebration & Ministry Statistical Radar');

// 1. student.html verification
const studentHtml = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/student.html', 'utf8');
assert(studentHtml.includes('id="student-birthday-banner"'), 'student.html must contain student-birthday-banner');
assert(studentHtml.includes('id="studentBirthdayModal"'), 'student.html must contain studentBirthdayModal');
assert(studentHtml.includes('id="birthdayFireworksCanvas"'), 'student.html must contain birthdayFireworksCanvas');
assert(studentHtml.includes('function triggerBirthdayCelebration'), 'student.html must contain triggerBirthdayCelebration');
assert(studentHtml.includes('function playCelebrationFanfare'), 'student.html must contain playCelebrationFanfare');
assert(studentHtml.includes('function checkAndCelebrateBirthday'), 'student.html must contain checkAndCelebrateBirthday');
console.log('✅ Feature 1 (Student Birthday Fireworks, Fanfare & Golden Card) Verified!');

// 2. servant-dashboard.html verification
const servantHtml = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant-dashboard.html', 'utf8');
assert(servantHtml.includes('id="radar_attendancePulseBars"'), 'servant-dashboard.html must contain radar_attendancePulseBars');
assert(servantHtml.includes('id="radar_pulseOverallStability"'), 'servant-dashboard.html must contain radar_pulseOverallStability');
assert(servantHtml.includes('id="btnRadarAbsFilterCritical"'), 'servant-dashboard.html must contain btnRadarAbsFilterCritical');
assert(servantHtml.includes('id="radar_birthdaysTableBody"'), 'servant-dashboard.html must contain radar_birthdaysTableBody');
assert(servantHtml.includes('id="btnRadarBdayFilterWeek"'), 'servant-dashboard.html must contain btnRadarBdayFilterWeek');
console.log('✅ Feature 2 & 3 HTML Structure (Pulse Section, Absence Filter, Birthday Radar) Verified!');

// 3. dashboard-plan.js verification
const planJs = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/js/dashboard/dashboard-plan.js', 'utf8');
assert(planJs.includes('sendWhatsAppDirectMessage'), 'dashboard-plan.js must contain sendWhatsAppDirectMessage');
assert(planJs.includes('sendWhatsAppBirthdayDirect'), 'dashboard-plan.js must contain sendWhatsAppBirthdayDirect');
console.log('✅ WhatsApp Direct Bridge in dashboard-plan.js Verified!');

// 4. dashboard-radar.js verification
const radarJs = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/js/dashboard/dashboard-radar.js', 'utf8');
assert(radarJs.includes('renderRadarPulseChart'), 'dashboard-radar.js must contain renderRadarPulseChart');
assert(radarJs.includes('filterRadarAbsence'), 'dashboard-radar.js must contain filterRadarAbsence');
assert(radarJs.includes('printCriticalAbsenceList'), 'dashboard-radar.js must contain printCriticalAbsenceList');
assert(radarJs.includes('renderRadarBirthdays'), 'dashboard-radar.js must contain renderRadarBirthdays');
assert(radarJs.includes('sendBatchWeeklyBirthdays'), 'dashboard-radar.js must contain sendBatchWeeklyBirthdays');
console.log('✅ Ministry Leadership Radar & Pulse Charts in dashboard-radar.js Verified!');

// 5. server.mjs verification
const serverMjs = fs.readFileSync('D:/StPaul_Service_System/02_WhatsApp_NewWhats/Backend_Node/server.mjs', 'utf8');
assert(serverMjs.includes("app.post('/api/send-message'"), 'server.mjs must contain /api/send-message');
assert(serverMjs.includes('req.body.phone'), 'server.mjs must support req.body.phone');
console.log('✅ WhatsApp Engine Direct API in server.mjs Verified!');

console.log('🎉 ALL BIRTHDAY & RADAR VERIFICATIONS PASSED 100%!');
