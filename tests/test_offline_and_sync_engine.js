/**
 * tests/test_offline_and_sync_engine.js
 * Test Suite 23: Complete Offline & Online PWA Sync Engine Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Offline & Online PWA Sync Engine...');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// 1. Verify sw.js configuration and precache list
const swPath = path.join(publicDir, 'sw.js');
assert.ok(fs.existsSync(swPath), 'sw.js must exist in public directory');
const swContent = fs.readFileSync(swPath, 'utf8');
assert.ok(swContent.includes('khedmety-ultra-v3.0'), 'sw.js must use CACHE_NAME v3.0');
assert.ok(swContent.includes('./servant_grades_entry.html'), 'sw.js must precache servant_grades_entry.html');
assert.ok(swContent.includes('./bible-data.js'), 'sw.js must precache bible-data.js');
assert.ok(swContent.includes('./harvest.html'), 'sw.js must precache harvest.html');
assert.ok(swContent.includes('./js/khedmty-offline-sync.js'), 'sw.js must precache khedmty-offline-sync.js');
assert.ok(swContent.includes('fetchWithTimeout'), 'sw.js must implement fast timeout navigation fallback');
assert.ok(swContent.includes('ALLOWED_CDN_HOSTS'), 'sw.js must handle CDN caching for offline fonts and styles');
console.log('  ✔ sw.js v3.0 ultra precache and timeout strategies verified');

// 2. Verify manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.display, 'standalone', 'PWA display must be standalone');
assert.ok(manifest.icons && manifest.icons.length >= 2, 'manifest.json must provide multi-resolution icons');
console.log('  ✔ manifest.json standalone configuration verified');

// 3. Verify khedmty-offline-sync.js engine
const syncEnginePath = path.join(publicDir, 'js', 'khedmty-offline-sync.js');
assert.ok(fs.existsSync(syncEnginePath), 'khedmty-offline-sync.js must exist');
const syncContent = fs.readFileSync(syncEnginePath, 'utf8');
assert.ok(syncContent.includes('khedmty_offline_sync_queue'), 'Offline sync must use khedmty_offline_sync_queue');
assert.ok(syncContent.includes('enqueue'), 'Offline sync must expose enqueue()');
assert.ok(syncContent.includes('processQueue'), 'Offline sync must expose processQueue()');
assert.ok(syncContent.includes('syncSingleItem'), 'Offline sync must implement syncSingleItem()');
console.log('  ✔ khedmty-offline-sync.js engine structure verified');

// 4. Test Offline Queue simulation in Node environment
const mockLocalStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

global.localStorage = mockLocalStorage;
global.navigator = { onLine: false };
global.window = {
    addEventListener: () => {},
    localStorage: mockLocalStorage
};
global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    body: { appendChild: () => {} },
    createElement: () => ({ style: {}, setAttribute: () => {} })
};

const KhedmtyOfflineSync = require(syncEnginePath);
assert.ok(KhedmtyOfflineSync, 'KhedmtyOfflineSync should export properly');

// Enqueue an action while offline
const item = KhedmtyOfflineSync.enqueue('MARK_PLAN_READ', {
    code: 'ST101',
    month: 10,
    day: 31,
    book: 'تكوين',
    reading: 'تكوين 4 إلى 7',
    chapter: 4,
    action: 'toggle_chapter',
    completed_chapters: [4],
    total_chapters: 4
}, { dedupKey: '10-31_ST101' });

assert.ok(item && item.id, 'Enqueued item must have an ID');
const currentQueue = KhedmtyOfflineSync.getQueue();
assert.strictEqual(currentQueue.length, 1, 'Queue must contain 1 action');
assert.strictEqual(currentQueue[0].action, 'MARK_PLAN_READ', 'Action must match MARK_PLAN_READ');
assert.strictEqual(currentQueue[0].payload.code, 'ST101', 'Payload code must be preserved');
console.log('  ✔ Offline action queueing and persistence simulation passed');

// 5. Verify HTML pages include PWA and Offline scripts
const targetPages = [
    'student.html',
    'bible.html',
    'spiritual_note.html',
    'servant-dashboard.html',
    'servant_grades_entry.html',
    'servant_followup.html',
    'servant_spiritual_report.html',
    'harvest.html'
];

targetPages.forEach(page => {
    const pPath = path.join(publicDir, page);
    assert.ok(fs.existsSync(pPath), `Page ${page} must exist`);
    const content = fs.readFileSync(pPath, 'utf8');
    assert.ok(content.includes('pwa-helper.js'), `${page} must include pwa-helper.js`);
    assert.ok(content.includes('manifest.json'), `${page} must link manifest.json`);
});
console.log(`  ✔ All ${targetPages.length} core pages include pwa-helper.js and manifest.json`);

// 6. Verify Firestore Offline Persistence initialization
const firestorePages = ['bible.html', 'spiritual_note.html', 'servant_followup.html', 'student.html'];
firestorePages.forEach(page => {
    const pPath = path.join(publicDir, page);
    const content = fs.readFileSync(pPath, 'utf8');
    assert.ok(content.includes('initKhedmtyFirestore'), `${page} must use initKhedmtyFirestore for offline cache`);
});
console.log('  ✔ All core Firestore pages use initKhedmtyFirestore for offline persistence');

console.log('🎉 Suite 23: Complete Offline & Online PWA Sync Engine PASSED successfully!\n');
process.exit(0);
