/**
 * scripts/implement_full_offline_engine.js
 * تفعيل منظومة العمل الكامل دون اتصال بالإنترنت (Full 100% Offline & Online Engine)
 * عبر كافة صفحات المشروع والربط بمحرك المزامنة التلقائية KhedmtyOfflineSync.
 */

const fs = require('fs');
const path = require('path');

const publicDir = 'D:/StPaul_Service_System/03_Web_Khedmty_Plus/public';

function updateFile(fileName, updater) {
    const filePath = path.join(publicDir, fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${fileName}`);
        return;
    }
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = updater(original);
    if (original !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`✅ Updated ${fileName} successfully.`);
    } else {
        console.log(`ℹ️ No changes needed for ${fileName}.`);
    }
}

// 1. تحديث bible.html
updateFile('bible.html', content => {
    let res = content;

    // إضافة سكريبتات PWA و Offline
    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="bible_plan.js"></script>',
            `<script src="bible_plan.js"></script>\n<script src="js/firebase-config.js"></script>\n<script src="js/khedmty-db.js"></script>\n<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    // تفعيل initKhedmtyFirestore
    res = res.replace(
        'const fsdb = firebase.firestore();',
        'const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : firebase.firestore());'
    );

    // إضافة طابور المزامنة في toggleChapterFromBanner
    if (!res.includes("KhedmtyOfflineSync.enqueue('MARK_PLAN_READ'")) {
        const targetCatch = "localReadings[planKey] = savedLog;\n            localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));\n        }\n    } catch (e) {}";
        const replCatch = `localReadings[planKey] = savedLog;\n            localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));\n        } else {\n            throw new Error('Offline API');\n        }\n    } catch (e) {\n        if (window.KhedmtyOfflineSync) {\n            KhedmtyOfflineSync.enqueue('MARK_PLAN_READ', {\n                code: studentCode,\n                month: curMonth,\n                day: curDay,\n                book: planItem.book,\n                reading: planItem.reading,\n                chapter: chapterNum,\n                action: 'toggle_chapter',\n                completed_chapters: completed,\n                total_chapters: totalCount\n            }, { dedupKey: \`\${curMonth}-\${curDay}_\${studentCode}\` });\n        }\n    }`;
        res = res.replace(targetCatch, replCatch);
    }

    // إضافة مستمع online لمزامنة القراءات في bible.html
    if (!res.includes('async function syncOfflineBibleReadings()')) {
        const syncFunction = `
// مزامنة قراءات الإنجيل المحفوظة محلياً عند عودة الإنترنت
async function syncOfflineBibleReadings() {
    if (!navigator.onLine || !studentCode) return;
    try {
        const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
        const keys = Object.keys(localReadings).filter(k => k.endsWith(\`_\${studentCode}\`));
        let count = 0;
        for (const k of keys) {
            const item = localReadings[k];
            if (item && item._synced === false) {
                try {
                    const fetchFn = window.AuthClient ? AuthClient.fetch.bind(AuthClient) : fetch;
                    const res = await fetchFn('/api/mark_plan_read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: studentCode,
                            month: item.month,
                            day: item.day,
                            book: item.book,
                            reading: item.reading,
                            action: 'toggle_chapter',
                            completed_chapters: item.completed_chapters || [],
                            total_chapters: item.total_chapters || 0
                        })
                    });
                    if (res.ok) {
                        item._synced = true;
                        localReadings[k] = item;
                        count++;
                    }
                } catch(err) {}
            }
        }
        if (count > 0) {
            localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));
            console.log(\`[BibleOffline] تمت مزامنة \${count} قراءة معلقة مع السحابة.\`);
        }
    } catch(e) {}
}
window.addEventListener('online', syncOfflineBibleReadings);
window.addEventListener('load', () => { setTimeout(syncOfflineBibleReadings, 2000); });
`;
        res = res.replace('</script>\n</body>', `${syncFunction}\n</script>\n</body>`);
    }

    return res;
});

// 2. تحديث spiritual_note.html
updateFile('spiritual_note.html', content => {
    let res = content;

    // إضافة سكريبتات PWA و Offline
    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="auth-client.js"></script>',
            `<script src="auth-client.js"></script>\n<script src="js/firebase-config.js"></script>\n<script src="js/khedmty-db.js"></script>\n<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    // تفعيل initKhedmtyFirestore
    res = res.replace(
        'fsdb = firebase.firestore();',
        'fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : firebase.firestore());'
    );

    // إضافة مستمع online لـ syncPendingLocalNotes
    if (!res.includes("window.addEventListener('online', syncPendingLocalNotes)")) {
        res = res.replace(
            'window.addEventListener("load", function () {',
            `window.addEventListener('online', syncPendingLocalNotes);\n    window.addEventListener("load", function () {`
        );
    }

    return res;
});

// 3. تحديث servant_followup.html
updateFile('servant_followup.html', content => {
    let res = content;

    // إضافة سكريبتات PWA و Offline
    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="auth-client.js"></script>',
            `<script src="auth-client.js"></script>\n<script src="js/firebase-config.js"></script>\n<script src="js/khedmty-db.js"></script>\n<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    // تفعيل initKhedmtyFirestore
    res = res.replace(
        'fsdb = firebase.firestore();',
        'fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : firebase.firestore());'
    );

    return res;
});

// 4. تحديث servant_spiritual_report.html
updateFile('servant_spiritual_report.html', content => {
    let res = content;

    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="auth-client.js"></script>',
            `<script src="auth-client.js"></script>\n<script src="js/firebase-config.js"></script>\n<script src="js/khedmty-db.js"></script>\n<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    res = res.replace(
        'const fsdb = firebase.firestore();',
        'const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : firebase.firestore());'
    );

    return res;
});

// 5. تحديث harvest.html
updateFile('harvest.html', content => {
    let res = content;

    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="auth-client.js"></script>',
            `<script src="auth-client.js"></script>\n<script src="js/firebase-config.js"></script>\n<script src="js/khedmty-db.js"></script>\n<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    res = res.replace(
        'const fsdb = firebase.firestore();',
        'const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : firebase.firestore());'
    );

    return res;
});

// 6. تحديث student.html
updateFile('student.html', content => {
    let res = content;

    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="js/pwa-helper.js"></script>',
            `<script src="js/khedmty-offline-sync.js"></script>\n<script src="js/pwa-helper.js"></script>`
        );
    }

    // تحديث مزامنة القراءات في syncOfflineQueue لتمرير تفاصيل الإصحاحات كاملة
    if (res.includes("res = await fetchFn('/api/mark_plan_read', {")) {
        res = res.replace(
            `body: JSON.stringify({\n                                code: code,\n                                month: item.month,\n                                day: item.day,\n                                reading: item.reading\n                            })`,
            `body: JSON.stringify({\n                                code: code,\n                                month: item.month,\n                                day: item.day,\n                                book: item.book,\n                                reading: item.reading,\n                                action: 'toggle_chapter',\n                                completed_chapters: item.completed_chapters || [],\n                                total_chapters: item.total_chapters || 0\n                            })`
        );
    }

    return res;
});

// 7. تحديث servant_grades_entry.html
updateFile('servant_grades_entry.html', content => {
    let res = content;

    if (!res.includes('js/khedmty-offline-sync.js')) {
        res = res.replace(
            '<script src="js/khedmty-db.js"></script>',
            `<script src="js/khedmty-db.js"></script>\n    <script src="js/khedmty-offline-sync.js"></script>`
        );
    }

    return res;
});

console.log('🎉 Full Offline Engine injection completed.');
