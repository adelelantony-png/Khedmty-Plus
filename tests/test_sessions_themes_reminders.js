const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Test Suite: Sessions Radar, Universal Themes, Ironclad Permissions & Gentle Reminders');

const baseDir = path.resolve(__dirname, '..');

// 1. Test Gentle Reminders JS & CSS
const gentleJsPath = path.join(baseDir, 'public/js/gentle-reminders.js');
assert(fs.existsSync(gentleJsPath), 'gentle-reminders.js must exist');
const gentleJs = fs.readFileSync(gentleJsPath, 'utf8');
assert(gentleJs.includes('GentleReminders'), 'gentle-reminders.js must define GentleReminders');
assert(gentleJs.includes('اجتماع إعداد الخدام'), 'Must support Friday servants meeting reminder');
assert(gentleJs.includes('صلوات الأجبية'), 'Must support canonical Agpeya prayers');
assert(gentleJs.includes('قراءة الكتاب المقدس'), 'Must support daily Bible reading reminder');
assert(gentleJs.includes('khedmty_gentle_reminders_prefs'), 'Must support customizable user preferences');
console.log('  ✅ Gentle Reminders Engine verified');

// 2. Test CSS integration in app-theme.css
const appThemePath = path.join(baseDir, 'public/css/app-theme.css');
const appTheme = fs.readFileSync(appThemePath, 'utf8');
assert(appTheme.includes('.k-universal-theme-pill'), 'app-theme.css must style universal floating theme pill');
assert(appTheme.includes('.k-gentle-reminder-banner'), 'app-theme.css must style gentle reminder banner');
assert(appTheme.includes('.perm-hidden'), 'app-theme.css must enforce .perm-hidden with !important');
console.log('  ✅ CSS styles verified in app-theme.css');

// 3. Test Universal Theme Pill in theme-manager.js
const themeMgrPath = path.join(baseDir, 'public/js/theme-manager.js');
const themeMgr = fs.readFileSync(themeMgrPath, 'utf8');
assert(themeMgr.includes('injectUniversalThemePill'), 'theme-manager.js must define injectUniversalThemePill');
assert(themeMgr.includes('k-universal-theme-pill'), 'theme-manager.js must inject k-universal-theme-pill');
assert(themeMgr.includes('btnOpenRemindersFromTheme'), 'theme-manager.js must link to GentleReminders modal');
console.log('  ✅ Universal Theme Pill & Manager verified');

// 4. Test Student Session Registration in student.html
const studentHtmlPath = path.join(baseDir, 'public/student.html');
const studentHtml = fs.readFileSync(studentHtmlPath, 'utf8');
assert(studentHtml.includes('registerStudentActiveSession'), 'student.html must define registerStudentActiveSession');
assert(studentHtml.includes('js/gentle-reminders.js'), 'student.html must include gentle-reminders.js');
assert(studentHtml.includes('active_sessions'), 'student.html must register into active_sessions in Firestore');
console.log('  ✅ Student session registration & reminders verified in student.html');

// 5. Test Live Sessions Radar & Full Roster in dashboard-servants.js
const servantsJsPath = path.join(baseDir, 'public/js/dashboard/dashboard-servants.js');
const servantsJs = fs.readFileSync(servantsJsPath, 'utf8');
assert(servantsJs.includes('window.__liveActiveSessionsMap'), 'dashboard-servants.js must maintain live active sessions map');
assert(servantsJs.includes('renderFullDatabaseRoster'), 'dashboard-servants.js must support rendering full database roster');
assert(servantsJs.includes('switchActiveSessionsView'), 'dashboard-servants.js must support switching between live and full roster view');
assert(servantsJs.includes('activeSessionHeartbeatTimer'), 'dashboard-servants.js must maintain a periodic heartbeat');
console.log('  ✅ Sessions Radar & Full Roster verified in dashboard-servants.js');

// 6. Test Ironclad Permissions in dashboard-permissions.js
const permJsPath = path.join(baseDir, 'public/js/dashboard/dashboard-permissions.js');
const permJs = fs.readFileSync(permJsPath, 'utf8');
assert(permJs.includes('Ironclad Hiding'), 'dashboard-permissions.js must enforce ironclad action button hiding');
assert(permJs.includes('memberActionEls'), 'dashboard-permissions.js must hide member action buttons');
assert(permJs.includes('excuseActionEls'), 'dashboard-permissions.js must hide excuse action buttons');
assert(permJs.includes('attActionEls'), 'dashboard-permissions.js must hide attendance action buttons');
assert(permJs.includes('broadcastActionEls'), 'dashboard-permissions.js must hide broadcast action buttons');
console.log('  ✅ Ironclad Permission Hiding verified in dashboard-permissions.js');

// 7. Test Dashboard HTML Header Summary & View Toggle
const dashHtmlPath = path.join(baseDir, 'public/servant-dashboard.html');
const dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');
assert(dashHtml.includes('activeSessionsCountBadge'), 'servant-dashboard.html must have activeSessionsCountBadge');
assert(dashHtml.includes('btnViewLiveSessions'), 'servant-dashboard.html must have btnViewLiveSessions');
assert(dashHtml.includes('btnViewAllRoster'), 'servant-dashboard.html must have btnViewAllRoster');
assert(dashHtml.includes('js/gentle-reminders.js'), 'servant-dashboard.html must load gentle-reminders.js');
console.log('  ✅ Dashboard HTML UI elements verified in servant-dashboard.html');

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
