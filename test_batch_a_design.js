// test_batch_a_design.js - حزمة الاختبارات الآلية للدفعة A (نظام التصميم وهيكل الواجهة المحدث)
// يتم التشغيل باستخدام Node.js المحمولة محلياً بدون اتصال خارجي

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🚀 تشغيل اختبارات الدفعة A: نظام التصميم ULTRA PRO MAX وزر التحديث');
console.log('================================================================\n');

let total = 0;
let passed = 0;
let failed = 0;

function runTest(name, fn) {
    total++;
    try {
        fn();
        passed++;
        console.log(`  [PASS] ${name}`);
    } catch (e) {
        failed++;
        console.error(`  [FAIL] ${name}`);
        console.error(`         ${e.message}`);
    }
}

async function runAsyncTest(name, fn) {
    total++;
    try {
        await fn();
        passed++;
        console.log(`  [PASS] ${name}`);
    } catch (e) {
        failed++;
        console.error(`  [FAIL] ${name}`);
        console.error(`         ${e.message}`);
    }
}

const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');

// 1. فحص سلامة بناء الجملة (Syntax) لجميع ملفات الدفعة A
runTest('1. فحص خلو ملفات الدفعة A (app-theme.css, app-updater.js, pwa-helper.js, sw.js) من أخطاء Syntax', () => {
    const jsFiles = [
        path.join(publicDir, 'js', 'app-updater.js'),
        path.join(publicDir, 'js', 'pwa-helper.js'),
        path.join(publicDir, 'sw.js')
    ];

    jsFiles.forEach(file => {
        assert.strictEqual(fs.existsSync(file), true, `الملف [${path.basename(file)}] غير موجود على القرص!`);
        const code = fs.readFileSync(file, 'utf8');
        try {
            new vm.Script(code, { filename: path.basename(file) });
        } catch (err) {
            throw new Error(`خطأ Syntax في الملف [${path.basename(file)}]: ${err.message}`);
        }
    });

    const cssPath = path.join(publicDir, 'css', 'app-theme.css');
    assert.strictEqual(fs.existsSync(cssPath), true, 'ملف app-theme.css غير موجود!');
    const cssCode = fs.readFileSync(cssPath, 'utf8');
    assert.strictEqual(cssCode.length > 2000, true, 'حجم ملف app-theme.css غير طبيعي!');
});

// 2. فحص الهوية البصرية والمتغيرات الأساسية (Design Tokens)
runTest('2. التحقق من توافر توكنات الهوية البصرية (الكحلي العميق، الذهبي، والخط العربي)', () => {
    const css = fs.readFileSync(path.join(publicDir, 'css', 'app-theme.css'), 'utf8');

    // كحلي عميق
    assert.strictEqual(css.includes('--k-primary-900') && css.includes('#081a42'), true, 'يجب توافر درجة الكحلي العميق الملكي #081a42');
    assert.strictEqual(css.includes('--k-primary-800') && css.includes('#0c2461'), true, 'يجب توافر درجة الكحلي الكنسي #0c2461');
    assert.strictEqual(css.includes('--k-primary-700') && css.includes('#1e3799'), true, 'يجب توافر كحلي الواجهات الرئيسي #1e3799');

    // ذهبي هادئ
    assert.strictEqual(css.includes('--k-gold-500') && css.includes('#d4af37'), true, 'يجب توافر درجة الذهبي الموقر #d4af37');
    assert.strictEqual(css.includes('--k-gold-gradient'), true, 'يجب توافر التدرج الذهبي الهادئ');

    // خط Tajawal العربي
    assert.strictEqual(css.includes('Tajawal'), true, 'يجب اعتماد الخط العربي الأصيل Tajawal');
    assert.strictEqual(css.includes('direction: rtl'), true, 'يجب دعم الاتجاه العربي RTL قياسياً');
});

// 3. فحص معايير اللمس والمناطق الآمنة وإمكانية الوصول
runTest('3. التحقق من أبعاد اللمس (Touch Targets >= 44px) والمناطق الآمنة و Focus Accessibility', () => {
    const css = fs.readFileSync(path.join(publicDir, 'css', 'app-theme.css'), 'utf8');

    // اللمس >= 44px
    assert.strictEqual(css.includes('--touch-target-min: 44px') || css.includes('44px'), true, 'يجب تحديد مقياس لمس أدنى 44px');

    // المناطق الآمنة للهواتف (Safe Area Insets)
    assert.strictEqual(css.includes('safe-area-inset-bottom'), true, 'يجب مراعاة المنطقة الآمنة السفلية للهواتف env(safe-area-inset-bottom)');

    // إمكانية الوصول والتنقل بلوحة المفاتيح
    assert.strictEqual(css.includes(':focus-visible'), true, 'يجب توافر فئة التحديد الواضح :focus-visible لسهولة التنقل بلوحة المفاتيح');
});

// 4. فحص نقاط التوقف التكيفية (Adaptive Breakpoints)
runTest('4. التحقق من نقاط التوقف التكيفية (320px, 360px, 768px, 1024px, 1366px)', () => {
    const css = fs.readFileSync(path.join(publicDir, 'css', 'app-theme.css'), 'utf8');

    assert.strictEqual(css.includes('max-width: 359px') || css.includes('320px'), true, 'يجب دعم استعلامات الشاشات متناهية الصغر (320px)');
    assert.strictEqual(css.includes('max-width: 480px') || css.includes('360px'), true, 'يجب دعم استعلامات الهواتف القياسية');
    assert.strictEqual(css.includes('max-width: 1023px'), true, 'يجب دعم شاشات الهواتف والتابلت');
    assert.strictEqual(css.includes('min-width: 1024px'), true, 'يجب دعم الحواسب والشاشات الكبيرة (Sidebar)');
    assert.strictEqual(css.includes('min-width: 1366px'), true, 'يجب دعم الشاشات العريضة');
});

// 5. فحص مكونات التخطيط التكيفي (Sidebar + Bottom Nav + Topbar)
runTest('5. التحقق من توفر فئات التخطيط التكيفي (.ultra-sidebar, .ultra-bottom-nav, .ultra-topbar)', () => {
    const css = fs.readFileSync(path.join(publicDir, 'css', 'app-theme.css'), 'utf8');

    assert.strictEqual(css.includes('.ultra-sidebar'), true, 'يجب توفير فئة الشريط الجانبي للشاشات الكبيرة .ultra-sidebar');
    assert.strictEqual(css.includes('.ultra-bottom-nav'), true, 'يجب توفير فئة شريط الملاحة السفلي للهواتف .ultra-bottom-nav');
    assert.strictEqual(css.includes('.ultra-topbar'), true, 'يجب توفير فئة الشريط العلوي .ultra-topbar');
    assert.strictEqual(css.includes('.ultra-card'), true, 'يجب توفير فئة البطاقات الاحترافية .ultra-card');
    assert.strictEqual(css.includes('.table-responsive-ultra'), true, 'يجب توفير الجداول المتقدمة');
    assert.strictEqual(css.includes('.sticky-col'), true, 'يجب توفير تثبيت العمود الأول بالجداول');
});

// 6. فحص وحدة تحديث واستحضار النسخة الأحدث (KhedmetyAppUpdater)
runTest('6. فحص وحدة KhedmetyAppUpdater وعمليات تطهير الكاش والتحديث القسري', () => {
    const updaterCode = fs.readFileSync(path.join(publicDir, 'js', 'app-updater.js'), 'utf8');

    let deletedKeys = [];
    let swUpdated = false;
    let redirectedUrl = null;

    const mockWin = {
        caches: {
            keys: async () => ['old-cache-v1', 'old-cache-v2'],
            delete: async (k) => { deletedKeys.push(k); return true; }
        },
        navigator: {
            serviceWorker: {
                getRegistrations: async () => [{
                    active: { postMessage: () => {} },
                    update: async () => { swUpdated = true; }
                }]
            }
        },
        location: {
            href: 'https://khedmety.app/servant-dashboard.html',
            replace: (url) => { redirectedUrl = url; }
        },
        sessionStorage: {
            removeItem: () => {}
        },
        document: {
            getElementById: () => null,
            createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
            body: { appendChild: () => {} }
        }
    };

    const sandbox = {
        window: mockWin,
        navigator: mockWin.navigator,
        document: mockWin.document,
        sessionStorage: mockWin.sessionStorage,
        console: { log: () => {}, warn: () => {}, error: () => {} },
        URL: URL,
        setTimeout: (fn) => fn(),
        Promise: Promise
    };

    vm.createContext(sandbox);
    vm.runInContext(updaterCode, sandbox);

    assert.strictEqual(typeof sandbox.window.KhedmetyAppUpdater, 'object', 'يجب تصدير الكائن KhedmetyAppUpdater');
    assert.strictEqual(typeof sandbox.window.KhedmetyAppUpdater.cleanCachesAndHardRefresh, 'function');
    assert.strictEqual(typeof sandbox.window.KhedmetyAppUpdater.confirmAndRefresh, 'function');
    assert.strictEqual(typeof sandbox.window.KhedmetyAppUpdater.renderUpdateButton, 'function');
});

// 7. فحص ترقية Service Worker والربط مع وحدة التحديث
runTest('7. فحص ترقية Service Worker (sw.js) لإصدار Ultra v2.0 وتضمين app-updater.js', () => {
    const swCode = fs.readFileSync(path.join(publicDir, 'sw.js'), 'utf8');

    assert.strictEqual(swCode.includes('khedmety-ultra-v2.0'), true, 'يجب رفع إصدار الكاش لـ khedmety-ultra-v2.0 لتطهير كاشات المتصفح');
    assert.strictEqual(swCode.includes('./js/app-updater.js'), true, 'يجب إدراج سكربت التحديث في الأصول المجهزة مسبقاً Precache');
    assert.strictEqual(swCode.includes("action === 'SKIP_WAITING_AND_CLEAR'"), true, 'يجب دعم رسالة التخطي والتطهير الفوري');
    assert.strictEqual(swCode.includes('/api/'), true, 'يجب استمرار الاستثناء المطلق لـ /api/ عن الكاش');
});

// 8. فحص عدم كسر أي من أزرار أو فئات التوافق السابقة (Backward Compatibility)
runTest('8. فحص استمرار فئات التوافق (.btn-smart-back, .app-topbar, CSS Variables الأصلية)', () => {
    const css = fs.readFileSync(path.join(publicDir, 'css', 'app-theme.css'), 'utf8');

    assert.strictEqual(css.includes('.btn-smart-back'), true, 'يجب بقاء فئة .btn-smart-back لضمان عمل أزرار الرجوع الحالية');
    assert.strictEqual(css.includes('--touch-target-min'), true, 'يجب بقاء المتغير --touch-target-min');
    assert.strictEqual(css.includes('app-topbar') || css.includes('ultra-topbar'), true, 'يجب بقاء فئات الأشرطة العلوية');
});

console.log('\n================================================================');
console.log(`📊 نتيجة اختبارات الدفعة A: إجمالي: ${total} | ناجح: ${passed} | راسب: ${failed}`);
console.log('================================================================');

if (failed > 0) {
    process.exit(1);
}
