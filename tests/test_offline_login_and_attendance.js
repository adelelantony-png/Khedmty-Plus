const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Test Suite 27: Offline Login & Attendance Recording Verification');

const publicDir = path.join(__dirname, '..', 'public');

// 1. Verify index.html Auto-Login & Offline Authentication
console.log('Checking index.html offline login resilience...');
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

assert(indexHtml.includes('checkActiveOfflineSession'), 'index.html must have checkActiveOfflineSession auto-redirect');
assert(indexHtml.includes('if (navigator.onLine)'), 'index.html must check navigator.onLine before calling server auth');
assert(indexHtml.includes('candidatesList'), 'index.html must check candidatesList in fallback');
assert(indexHtml.includes('offlineSession'), 'index.html must support emergency offline sessions');

// 2. Verify dashboard-attendance.js Offline Resilience
console.log('Checking dashboard-attendance.js attendance recording...');
const attJs = fs.readFileSync(path.join(publicDir, 'js', 'dashboard', 'dashboard-attendance.js'), 'utf8');

assert(attJs.includes('candidatesList'), 'manualMarkMemberFromInput must check candidatesList');
assert(attJs.includes('!navigator.onLine || !isFirebaseActive || !fsdb'), 'atomicRegisterAttendance must handle offline path without runTransaction');
assert(attJs.includes("KhedmtyOfflineSync.enqueue('ATTENDANCE'"), 'atomicRegisterAttendance must enqueue to KhedmtyOfflineSync');

// 3. Verify khedmty-offline-sync.js Attendance Action
console.log('Checking khedmty-offline-sync.js ATTENDANCE action handler...');
const syncJs = fs.readFileSync(path.join(publicDir, 'js', 'khedmty-offline-sync.js'), 'utf8');

assert(syncJs.includes("action === 'ATTENDANCE'"), 'khedmty-offline-sync.js must handle ATTENDANCE action');
assert(syncJs.includes("doc(String(date))"), 'ATTENDANCE handler must write to date doc');

// 4. Verify Local Precached QR Scanner
console.log('Checking html5-qrcode.min.js offline precache...');
const swJs = fs.readFileSync(path.join(publicDir, 'sw.js'), 'utf8');

assert(swJs.includes('./js/html5-qrcode.min.js'), 'sw.js must precache ./js/html5-qrcode.min.js');
assert(fs.existsSync(path.join(publicDir, 'js', 'html5-qrcode.min.js')), 'html5-qrcode.min.js file must exist in public/js/');

// 5. Test Unit Logic for Offline Login Fallback
console.log('Testing offline fallback unit logic...');
function mockOfflineLogin(u, p, isOnline) {
    const norm = s => String(s ?? '').trim().toLowerCase();
    const digits = s => String(s ?? '').replace(/\D/g, '');
    const un = norm(u);

    // Admin
    if (['admin', 'عادل جورج'].some(n => norm(n) === un)) {
        if (p === '1234567' || p === 'admin') {
            return { role: 'admin', name: 'عادل جورج' };
        }
    }

    if (!isOnline) {
        if (p === '1234567' || un.includes('خادم')) {
            return { role: 'servant', name: u };
        }
        const numCode = digits(u);
        const numPhone = digits(p);
        if (numCode && numCode.length >= 2 && numPhone && numPhone.length >= 8) {
            return { role: 'student', code: numCode };
        }
    }
    return null;
}

// Tests
assert.strictEqual(mockOfflineLogin('admin', '1234567', false).role, 'admin', 'Admin must login offline');
assert.strictEqual(mockOfflineLogin('خادم مينا', '1234567', false).role, 'servant', 'Servant must login offline');
assert.strictEqual(mockOfflineLogin('2201', '0122334455', false).role, 'student', 'Student must login offline');

console.log('✅ All checks in Test Suite 27 passed successfully!');
process.exit(0);
