const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("================================================================");
console.log("🧪 Testing Permanent Offline Resilience & Fallback Roster Suite");
console.log("================================================================");

const publicDir = 'D:/StPaul_Service_System/03_Web_Khedmty_Plus/public';

// 1. Verify khedmty-offline-roster.js exists and contains official students and servants
const rosterPath = path.join(publicDir, 'js/khedmty-offline-roster.js');
assert(fs.existsSync(rosterPath), "khedmty-offline-roster.js must exist");
const rosterContent = fs.readFileSync(rosterPath, 'utf8');
assert(rosterContent.includes('KHEDMETY_OFFICIAL_STUDENTS'), "Roster must export KHEDMETY_OFFICIAL_STUDENTS");
assert(rosterContent.includes('KHEDMETY_OFFICIAL_SERVANTS'), "Roster must export KHEDMETY_OFFICIAL_SERVANTS");
assert(rosterContent.includes('localStorage.setItem(\'my_church_class\''), "Roster must seed my_church_class if empty");
assert(rosterContent.includes('localStorage.setItem(\'my_church_servants\''), "Roster must seed my_church_servants if empty");
console.log("  ✅ [PASS] Pre-seeded Offline Roster file verified with students & servants data.");

// 2. Verify servant-dashboard.html does not wipe members or kick servants on empty snapshot
const srvDashPath = path.join(publicDir, 'servant-dashboard.html');
const srvDash = fs.readFileSync(srvDashPath, 'utf8');
assert(!srvDash.includes('localStorage.removeItem(STORAGE_KEYS.MEMBERS);'), "Must NOT delete local members on empty snapshot");
assert(srvDash.includes('isTrulyOnline && currentUser && currentUser.code !== \'admin\''), "Security kickout must only run when truly online");
assert(srvDash.includes('js/khedmty-offline-roster.js'), "servant-dashboard must load khedmty-offline-roster.js");
assert(srvDash.includes('js/firebase-config.js'), "servant-dashboard must load firebase-config.js for offline persistence");
assert(!srvDash.includes('unpkg.com/html5-qrcode'), "Must use local html5-qrcode.min.js");
assert(!srvDash.includes('cdnjs.cloudflare.com/ajax/libs/xlsx'), "Must use local xlsx.full.min.js");
console.log("  ✅ [PASS] servant-dashboard.html offline protections verified.");

// 3. Verify index.html offline login & roster integration
const indexPath = path.join(publicDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
assert(indexHtml.includes('js/khedmty-offline-roster.js'), "index.html must load khedmty-offline-roster.js");
assert(indexHtml.includes('js/firebase-config.js'), "index.html must load firebase-config.js");
assert(indexHtml.includes('1234567'), "index.html must support emergency servant login");
console.log("  ✅ [PASS] index.html offline login & roster verified.");

// 4. Verify sw.js caching strategies and ignoreSearch
const swPath = path.join(publicDir, 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('khedmety-ultra-v5.0'), "Service worker cache version must be v5.0");
assert(swContent.includes('khedmty-offline-roster.js'), "sw.js precache must include khedmty-offline-roster.js");
assert(swContent.includes('ignoreSearch: true'), "sw.js navigation must ignore query parameters");
console.log("  ✅ [PASS] sw.js v5.0 offline navigation and precache verified.");

console.log("\n🎉 ALL PERMANENT OFFLINE RESILIENCE CHECKS PASSED 100%!");
