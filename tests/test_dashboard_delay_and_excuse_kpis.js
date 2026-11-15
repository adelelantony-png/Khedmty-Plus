const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Dashboard Delay/Excuse KPIs & Radar Friday Filtering...');

const htmlPath = path.join(__dirname, '../public/servant-dashboard.html');
const radarPath = path.join(__dirname, '../public/js/dashboard/dashboard-radar.js');
const attPath = path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const radar = fs.readFileSync(radarPath, 'utf8');
const att = fs.readFileSync(attPath, 'utf8');

// 1. Check openAttendanceWithFilter
assert(html.includes('window.openAttendanceWithFilter = function'), 'openAttendanceWithFilter must be defined');

// 2. Check interactive cards on Dashboard
assert(html.includes('id="statTodayMinorDelay"'), 'statTodayMinorDelay must exist');
assert(html.includes('id="statTodaySevereDelay"'), 'statTodaySevereDelay must exist');
assert(html.includes('id="statTodayExcused"'), 'statTodayExcused must exist');
assert(html.includes("openAttendanceWithFilter('late')"), "openAttendanceWithFilter('late') button must exist");
assert(html.includes("openAttendanceWithFilter('severe')"), "openAttendanceWithFilter('severe') button must exist");
assert(html.includes("openAttendanceWithFilter('excuses')"), "openAttendanceWithFilter('excuses') button must exist");

// 3. Check Friday selector in Radar Excuses
assert(html.includes('id="radarExcuseFridayFilterSelect"'), 'radarExcuseFridayFilterSelect must exist in HTML');
assert(radar.includes('window.filterRadarExcusesByDate = filterRadarExcusesByDate'), 'filterRadarExcusesByDate must be exported');

// 4. Check promptChangeExcuseFridayDate in excuse rows
assert(radar.includes('promptChangeExcuseFridayDate'), 'promptChangeExcuseFridayDate must exist in radar');
assert(radar.includes('📅 تعديل الجمعة'), 'Change Friday date button must be in excuse row');

// 5. Check attendance chip filter support
assert(att.includes('filterAttendanceByChip(chipType, forceSet = false)'), 'filterAttendanceByChip should accept forceSet parameter');
assert(att.includes('!(a.hasApprovedDelay || a.isLate)'), 'Late filter must check hasApprovedDelay and isLate');

console.log('✅ All delay, excuse, and Radar Friday filter tests passed successfully!');
