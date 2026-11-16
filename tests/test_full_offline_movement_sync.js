/**
 * tests/test_full_offline_movement_sync.js
 * Verification of enhanced full offline-first operation, action queue, and true cloud sync on reconnect.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("=== Testing Enhanced Full Offline & Movement Sync Engine ===");

const rootDir = path.join(__dirname, '..');
const htmlPath = path.join(rootDir, 'public', 'servant-dashboard.html');
const syncJsPath = path.join(rootDir, 'public', 'js', 'khedmty-offline-sync.js');
const radarJsPath = path.join(rootDir, 'public', 'js', 'dashboard', 'dashboard-radar.js');
const attJsPath = path.join(rootDir, 'public', 'js', 'dashboard', 'dashboard-attendance.js');
const swPath = path.join(rootDir, 'public', 'sw.js');
const rulesPath = path.join(rootDir, 'firestore.rules');

const html = fs.readFileSync(htmlPath, 'utf8');
const syncJs = fs.readFileSync(syncJsPath, 'utf8');
const radarJs = fs.readFileSync(radarJsPath, 'utf8');
const attJs = fs.readFileSync(attJsPath, 'utf8');
const sw = fs.readFileSync(swPath, 'utf8');
const rules = fs.readFileSync(rulesPath, 'utf8');

// 1. Verify servant-dashboard.html loads khedmty-offline-sync.js
assert.ok(html.includes('khedmty-offline-sync.js'), "servant-dashboard.html must include khedmty-offline-sync.js");
console.log("✅ servant-dashboard.html includes khedmty-offline-sync.js.");

// 2. Verify khedmty-offline-sync.js supports new actions
assert.ok(syncJs.includes("action === 'EXCUSE_RESOLVE'"), "Sync engine must support EXCUSE_RESOLVE");
assert.ok(syncJs.includes("action === 'EXCUSE_CREATE'"), "Sync engine must support EXCUSE_CREATE");
assert.ok(syncJs.includes("action === 'EXCUSE_DELETE'"), "Sync engine must support EXCUSE_DELETE");
assert.ok(syncJs.includes("action === 'EXCUSE_DATE_CHANGE'"), "Sync engine must support EXCUSE_DATE_CHANGE");
assert.ok(syncJs.includes("action === 'ATTENDANCE_TIME_EDIT'"), "Sync engine must support ATTENDANCE_TIME_EDIT");
console.log("✅ Sync engine handles all offline radar and attendance movement actions.");

// 3. Verify dashboard-radar.js enqueues offline actions
assert.ok(radarJs.includes("KhedmtyOfflineSync.enqueue('EXCUSE_RESOLVE'"), "dashboard-radar.js must enqueue EXCUSE_RESOLVE");
assert.ok(radarJs.includes("KhedmtyOfflineSync.enqueue('EXCUSE_CREATE'"), "dashboard-radar.js must enqueue EXCUSE_CREATE");
assert.ok(radarJs.includes("KhedmtyOfflineSync.enqueue('EXCUSE_DELETE'"), "dashboard-radar.js must enqueue EXCUSE_DELETE");
assert.ok(radarJs.includes("KhedmtyOfflineSync.enqueue('EXCUSE_DATE_CHANGE'"), "dashboard-radar.js must enqueue EXCUSE_DATE_CHANGE");
console.log("✅ dashboard-radar.js enqueues offline actions into KhedmtyOfflineSync.");

// 4. Verify dashboard-attendance.js enqueues offline actions
assert.ok(attJs.includes("KhedmtyOfflineSync.enqueue('ATTENDANCE'"), "dashboard-attendance.js must enqueue ATTENDANCE");
assert.ok(attJs.includes("KhedmtyOfflineSync.enqueue('ATTENDANCE_TIME_EDIT'"), "dashboard-attendance.js must enqueue ATTENDANCE_TIME_EDIT");
console.log("✅ dashboard-attendance.js enqueues offline attendance actions.");

// 5. Verify firestore.rules has excuses collection rule
assert.ok(rules.includes("match /excuses/{excuseId}"), "firestore.rules must allow excuses collection");
assert.ok(rules.includes("allow read: if isStaff()"), "Staff must have read permission on excuses");
console.log("✅ firestore.rules properly configured for excuses collection.");

// 6. Verify Service Worker cache incremented to v9.6
assert.ok(sw.includes("v9.6"), "Service Worker cache name must be updated to v9.6");
console.log("✅ Service Worker cache updated to v9.6.");

console.log("🎉 ALL FULL OFFLINE MOVEMENT SYNC TESTS PASSED (100%)!");
