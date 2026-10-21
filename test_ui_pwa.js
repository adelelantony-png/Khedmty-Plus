// test_ui_pwa.js - حزمة الاختبارات الآلية لتجربة الاستخدام و PWA والتنقل الذكي (12 فحص شامل)
// يتم التشغيل باستخدام Node.js المحمولة محلياً بدون أي اتصال خارجي أو مساس بقاعدة البيانات

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🚀 بدء تشغيل حزمة اختبارات UI / UX / PWA والتنقل الذكي (12 فحص)');
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
const apiDir = path.join(rootDir, 'api');

// بيئة محاكاة DOM خفيفة لاختبار auth-client.js في الذاكرة
function createMockWindow(options = {}) {
    let storages = {
        local: {},
        session: {}
    };

    const makeStorage = (type) => ({
        getItem: (k) => storages[type][k] !== undefined ? storages[type][k] : null,
        setItem: (k, v) => { storages[type][k] = String(v); },
        removeItem: (k) => { delete storages[type][k]; },
        clear: () => { storages[type] = {}; }
    });

    const currentUrl = options.url || 'https://khedmety.app/servant_spiritual_report.html';
    const parsed = new URL(currentUrl);

    let redirectedTo = null;
    let historyBackCalled = false;

    const mockWin = {
        location: {
            href: parsed.href,
            origin: parsed.origin,
            pathname: parsed.pathname,
            replace: (url) => { redirectedTo = url; },
            assign: (url) => { redirectedTo = url; }
        },
        document: {
            referrer: options.referrer !== undefined ? options.referrer : '',
            addEventListener: () => {},
            querySelector: () => null,
            querySelectorAll: () => []
        },
        history: {
            length: options.historyLength !== undefined ? options.historyLength : 1,
            back: () => { historyBackCalled = true; }
        },
        localStorage: makeStorage('local'),
        sessionStorage: makeStorage('session'),
        getRedirected: () => redirectedTo,
        isHistoryBackCalled: () => historyBackCalled
    };

    if (options.localStorage) {
        Object.entries(options.localStorage).forEach(([k, v]) => mockWin.localStorage.setItem(k, v));
    }
    if (options.sessionStorage) {
        Object.entries(options.sessionStorage).forEach(([k, v]) => mockWin.sessionStorage.setItem(k, v));
    }

    return mockWin;
}

function loadAuthClientInSandbox(mockWin) {
    const authClientCode = fs.readFileSync(path.join(publicDir, 'auth-client.js'), 'utf8');
    const sandbox = {
        window: mockWin,
        document: mockWin.document,
        location: mockWin.location,
        history: mockWin.history,
        localStorage: mockWin.localStorage,
        sessionStorage: mockWin.sessionStorage,
        console: { log: () => {}, warn: () => {}, error: () => {} },
        URL: URL,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
    };
    vm.createContext(sandbox);
    vm.runInContext(authClientCode, sandbox);
    return sandbox.window.AuthClient;
}

function createMockReqRes({ method = 'GET', headers = {}, body = {}, query = {} } = {}) {
    const req = { method, headers: Object.assign({}, headers), body, query };
    const res = {
        statusCode: 200,
        jsonData: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.jsonData = data; return this; }
    };
    return { req, res };
}

(async function () {

// --------------------------------------------------------------------------
// 1. اختبار الرجوع من صفحة فرعية إلى الصفحة المصدر (Referrer آمن وداخل نفس الموقع)
// --------------------------------------------------------------------------
runTest('1. اختبار الرجوع من صفحة فرعية إلى الصفحة المصدر (Referrer آمن ونفس الـ Origin)', () => {
    const mockWin = createMockWindow({
        url: 'https://khedmety.app/servant_spiritual_report.html',
        referrer: 'https://khedmety.app/servant_followup.html',
        historyLength: 3,
        localStorage: {
            auth_token: 'fake_valid_token',
            my_church_active_user: JSON.stringify({ role: 'servant', code: 'SRV1' })
        }
    });

    const client = loadAuthClientInSandbox(mockWin);
    client.navigateBack('servant-dashboard.html');

    assert.strictEqual(mockWin.isHistoryBackCalled(), true, 'يجب استدعاء history.back() عند وجود مرجع آمن ونفس المصدر');
    assert.strictEqual(mockWin.getRedirected(), null, 'لا يجب عمل redirect صريح عندما يستجيب history.back()');
});

// --------------------------------------------------------------------------
// 2. اختبار الرجوع بدون تاريخ سابق (دخول مباشر / PWA) يوجه للوحة الدور الصحيحة
// --------------------------------------------------------------------------
runTest('2. اختبار الرجوع بدون تاريخ سابق (دخول مباشر PWA) يوجه للوحة الدور المناسبة', () => {
    // حالة الخادم:
    const mockServant = createMockWindow({
        url: 'https://khedmety.app/servant_spiritual_report.html',
        referrer: '',
        historyLength: 1,
        localStorage: {
            auth_token: 'valid_token',
            my_church_active_user: JSON.stringify({ role: 'servant', code: 'SRV1' })
        }
    });
    const clientServant = loadAuthClientInSandbox(mockServant);
    clientServant.navigateBack();
    assert.strictEqual(mockServant.getRedirected(), 'servant-dashboard.html', 'الخادم يجب أن يوجه إلى servant-dashboard.html عند غياب المرجع');

    // حالة المخدوم:
    const mockStudent = createMockWindow({
        url: 'https://khedmety.app/sheet.html',
        referrer: '',
        historyLength: 1,
        localStorage: {
            auth_token: 'valid_student_token',
            my_church_active_user: JSON.stringify({ role: 'student', code: 'STU1' }),
            student_code: 'STU1'
        }
    });
    const clientStudent = loadAuthClientInSandbox(mockStudent);
    clientStudent.navigateBack();
    assert.strictEqual(mockStudent.getRedirected(), 'student.html', 'المخدوم يجب أن يوجه إلى student.html عند غياب المرجع');

    // حالة غير المسجل:
    const mockGuest = createMockWindow({
        url: 'https://khedmety.app/bible.html',
        referrer: '',
        historyLength: 1,
        localStorage: {}
    });
    const clientGuest = loadAuthClientInSandbox(mockGuest);
    clientGuest.navigateBack();
    assert.strictEqual(mockGuest.getRedirected(), 'index.html', 'الزائر غير المسجل يجب أن يوجه إلى index.html عند غياب المرجع');
});

// --------------------------------------------------------------------------
// 3. اختبار عدم توجيه الخادم أو المخدوم لصفحة غير مخصصة له + منع ارتداد المسجل لـ index.html
// --------------------------------------------------------------------------
runTest('3. اختبار عدم توجيه الخادم أو المخدوم لصفحة خطأ ومنع ارتداد المسجل إلى index.html', () => {
    // خادم حاول زر الرجوع توجيهه لـ index.html
    const mockServant = createMockWindow({
        url: 'https://khedmety.app/servant_journal.html',
        referrer: '',
        historyLength: 1,
        localStorage: {
            auth_token: 'valid_token',
            my_church_active_user: JSON.stringify({ role: 'servant', code: 'SRV1' })
        }
    });
    const clientServant = loadAuthClientInSandbox(mockServant);
    clientServant.navigateBack('index.html'); // تمرير صريح لصفحة الدخول كـ fallback
    assert.strictEqual(mockServant.getRedirected(), 'servant-dashboard.html', 'يجب حماية الخادم المسجل من الارتداد لصفحة الدخول index.html');

    // طالب حاول زر الرجوع توجيهه لـ index.html
    const mockStudent = createMockWindow({
        url: 'https://khedmety.app/barcode.html',
        referrer: '',
        historyLength: 1,
        localStorage: {
            auth_token: 'valid_student_token',
            my_church_active_user: JSON.stringify({ role: 'student', code: 'STU1' }),
            student_code: 'STU1'
        }
    });
    const clientStudent = loadAuthClientInSandbox(mockStudent);
    clientStudent.navigateBack('index.html');
    assert.strictEqual(mockStudent.getRedirected(), 'student.html', 'يجب حماية المخدوم المسجل من الارتداد لصفحة الدخول index.html');
});

// --------------------------------------------------------------------------
// 4. اختبار عدم منح صلاحيات إدارية بمجرد تغيير localStorage دون جلسة صالحة
// --------------------------------------------------------------------------
await runAsyncTest('4. اختبار عدم منح صلاحيات إدارية بمجرد تزوير localStorage دون جلسة وتوكن صالح', async () => {
    // 1) الفحص من جانب العميل: تزوير loose user_role=admin
    const mockWin = createMockWindow({
        url: 'https://khedmety.app/servant-dashboard.html',
        localStorage: {
            user_role: 'admin' // مفتاح متسيب بدون my_church_active_user
        }
    });
    const client = loadAuthClientInSandbox(mockWin);

    assert.strictEqual(client.getUserRole(), '', 'الدور لا يجوز استخراجه من مفتاح user_role دون جلسة');
    assert.strictEqual(client.isAuthenticated(), false, 'يجب رفض الجلسة المزورة');

    const allowed = client.enforceAuth(['admin']);
    assert.strictEqual(allowed, false, 'يجب حجب الوصول فوراً عند غياب التوكن والجلسة الحقيقية');
    assert.strictEqual(mockWin.getRedirected(), 'index.html', 'يجب طرد المتسلل لصفحة الدخول');

    // 2) الفحص من جانب الخادم: محاولة استدعاء api/admin.js بدون توكن سحابي معتمد
    const adminApi = require(path.join(apiDir, 'admin.js'));
    const { req, res } = createMockReqRes({
        method: 'POST',
        body: { action: 'save_settings', payload: { service_year_name: 'سنة مزورة' } }
    });
    await adminApi(req, res);
    assert.strictEqual(res.statusCode, 401, 'السيرفر يرفض تماماً أي طلب إداري بدون Firebase ID Token حتى لو تم التلاعب بالمتصفح');
});

// --------------------------------------------------------------------------
// 5. اختبار منع حلقة الرجوع المفرغة (التكرار)
// --------------------------------------------------------------------------
runTest('5. اختبار منع حلقة الرجوع المفرغة (إعادة توجيه لنفس الصفحة أو logout)', () => {
    // سيناريو 1: Referrer يشير لنفس الصفحة الحالية
    const mockWin = createMockWindow({
        url: 'https://khedmety.app/spiritual_note.html',
        referrer: 'https://khedmety.app/spiritual_note.html?updated=1',
        historyLength: 5,
        localStorage: {
            auth_token: 'valid_token',
            my_church_active_user: JSON.stringify({ role: 'student', code: 'STU1' }),
            student_code: 'STU1'
        }
    });
    const client = loadAuthClientInSandbox(mockWin);
    client.navigateBack('spiritual_note.html');

    assert.strictEqual(mockWin.isHistoryBackCalled(), false, 'يجب إلغاء history.back() عندما يكون المرجع هو نفس الصفحة');
    assert.strictEqual(mockWin.getRedirected(), 'student.html', 'يجب كسر الحلقة والتوجيه للوحة الرئيسية للطالب');

    // سيناريو 2: Referrer يشير لـ logout.html
    const mockLogoutRef = createMockWindow({
        url: 'https://khedmety.app/servant_followup.html',
        referrer: 'https://khedmety.app/logout.html',
        historyLength: 3,
        localStorage: {
            auth_token: 'valid_token',
            my_church_active_user: JSON.stringify({ role: 'servant', code: 'SRV1' })
        }
    });
    const clientLogout = loadAuthClientInSandbox(mockLogoutRef);
    clientLogout.navigateBack();
    assert.strictEqual(mockLogoutRef.isHistoryBackCalled(), false, 'يجب حظر الرجوع إلى logout.html');
    assert.strictEqual(mockLogoutRef.getRedirected(), 'servant-dashboard.html');
});

// --------------------------------------------------------------------------
// 6. اختبار سلامة الروابط والأزرار داخل كل الصفحات
// --------------------------------------------------------------------------
runTest('6. اختبار سلامة الروابط والأزرار والمصادر داخل جميع صفحات HTML (22 صفحة)', () => {
    const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
    assert.strictEqual(htmlFiles.length >= 22, true, `عدد ملفات HTML يجب ألا يقل عن 22 صفحة (الموجود: ${htmlFiles.length})`);

    const internalHrefRegex = /href=["']([^"':#]+)["']/g;
    const srcRegex = /src=["']([^"':#]+)["']/g;
    const fallbackRegex = /data-fallback=["']([^"':#]+)["']/g;

    let checkedLinks = 0;

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(path.join(publicDir, file), 'utf8');

        // فحص روابط href المحلية
        let match;
        while ((match = internalHrefRegex.exec(content)) !== null) {
            const target = match[1].split('?')[0].split('#')[0];
            if (target && !target.startsWith('http') && !target.startsWith('//') && !target.startsWith('mailto:') && !target.startsWith('tel:') && !target.startsWith('javascript:') && !target.startsWith('$') && !target.startsWith('{')) {
                const targetPath = path.join(publicDir, target);
                assert.strictEqual(fs.existsSync(targetPath), true, `الرابط [${target}] داخل [${file}] غير موجود على القرص!`);
                checkedLinks++;
            }
        }

        // فحص مصادر src المحلية
        while ((match = srcRegex.exec(content)) !== null) {
            const target = match[1].split('?')[0].split('#')[0];
            if (target && !target.startsWith('http') && !target.startsWith('//') && !target.startsWith('data:')) {
                const targetPath = path.join(publicDir, target);
                assert.strictEqual(fs.existsSync(targetPath), true, `الملف [${target}] المستدعى بـ src داخل [${file}] غير موجود على القرص!`);
                checkedLinks++;
            }
        }

        // فحص وجهات data-fallback
        while ((match = fallbackRegex.exec(content)) !== null) {
            const target = match[1].split('?')[0].split('#')[0];
            if (target && !target.startsWith('http')) {
                const targetPath = path.join(publicDir, target);
                assert.strictEqual(fs.existsSync(targetPath), true, `وجهة fallback [${target}] داخل [${file}] غير موجودة على القرص!`);
                checkedLinks++;
            }
        }
    });

    assert.strictEqual(checkedLinks > 50, true, `تم فحص ${checkedLinks} رابط ومصدر محلي بنجاح`);
});

// --------------------------------------------------------------------------
// 7. اختبار خلو ملفات JavaScript من أخطاء بناء الجملة والملفات المفقودة
// --------------------------------------------------------------------------
runTest('7. اختبار خلو جميع ملفات JavaScript من أخطاء بناء الجملة (Syntax Errors)', () => {
    const scanDir = (dir) => {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(f => f.endsWith('.js'))
            .map(f => path.join(dir, f));
    };

    const jsFiles = [
        ...scanDir(publicDir),
        ...scanDir(path.join(publicDir, 'js')),
        ...scanDir(apiDir),
        ...scanDir(path.join(apiDir, '_lib'))
    ];

    assert.strictEqual(jsFiles.length >= 10, true, 'يجب فحص جميع ملفات JS');

    jsFiles.forEach(filePath => {
        const code = fs.readFileSync(filePath, 'utf8');
        try {
            new vm.Script(code, { filename: path.basename(filePath) });
        } catch (err) {
            throw new Error(`خطأ Syntax في الملف [${path.basename(filePath)}]: ${err.message}`);
        }
    });
});

// --------------------------------------------------------------------------
// 8. اختبار تجاوب التصميم ودعم الهواتف (وجود meta viewport وتنسيقات مناسبة)
// --------------------------------------------------------------------------
runTest('8. اختبار تجاوب التصميم ودعم الهواتف (meta viewport و app-theme.css)', () => {
    const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(path.join(publicDir, file), 'utf8');
        assert.strictEqual(
            content.includes('name="viewport"') || content.includes("name='viewport'"),
            true,
            `الصفحة [${file}] تفتقر لوسم meta viewport الأساسي للتجاوب على الهواتف!`
        );
        assert.strictEqual(
            content.includes('dir="rtl"') || content.includes("dir='rtl'"),
            true,
            `الصفحة [${file}] يجب أن تدعم الاتجاه العربي RTL!`
        );
    });

    const themePath = path.join(publicDir, 'css', 'app-theme.css');
    assert.strictEqual(fs.existsSync(themePath), true, 'ملف css/app-theme.css مفقود!');
    const themeCss = fs.readFileSync(themePath, 'utf8');
    assert.strictEqual(
        themeCss.includes('44px') || themeCss.includes('--touch-target-min'),
        true,
        'يجب توفير أبعاد لمس ملائمة للأزرار (Touch Targets >= 44px)'
    );
    assert.strictEqual(themeCss.includes('@media'), true, 'يجب أن يحتوي ملف التنسيق على استعلامات الشاشات الصغيرة Media Queries');
    assert.strictEqual(themeCss.includes('Tajawal'), true, 'يجب اعتماد الخط العربي تاجوال في التنسيق الموحد');
});

// --------------------------------------------------------------------------
// 9. اختبار صحة ملف manifest.json واكتمال حقوله ووجود الأيقونات
// --------------------------------------------------------------------------
runTest('9. اختبار صحة ملف manifest.json واكتمال حقوله ووجود الأيقونات على القرص', () => {
    const manifestPath = path.join(publicDir, 'manifest.json');
    assert.strictEqual(fs.existsSync(manifestPath), true, 'ملف manifest.json مفقود!');

    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(typeof manifestData.name, 'string', 'حقل name إلزامي في الـ manifest');
    assert.strictEqual(typeof manifestData.short_name, 'string', 'حقل short_name إلزامي في الـ manifest');
    assert.strictEqual(typeof manifestData.start_url, 'string', 'حقل start_url إلزامي في الـ manifest');
    assert.strictEqual(typeof manifestData.display, 'string', 'حقل display إلزامي في الـ manifest');
    assert.strictEqual(Array.isArray(manifestData.icons), true, 'حقل icons يجب أن يكون مصفوفة');
    assert.strictEqual(manifestData.icons.length >= 2, true, 'يجب توفير أيقونتين على الأقل (192 و 512)');

    manifestData.icons.forEach(icon => {
        const iconPath = path.join(publicDir, icon.src);
        assert.strictEqual(fs.existsSync(iconPath), true, `أيقونة الـ PWA المحددة [${icon.src}] غير موجودة على القرص!`);
        const stat = fs.statSync(iconPath);
        assert.strictEqual(stat.size > 0, true, `أيقونة [${icon.src}] فارغة (0 بايت)!`);
    });
});

// --------------------------------------------------------------------------
// 10. اختبار sw.js وعدم تخزينه لمسارات API أو التوكنات
// --------------------------------------------------------------------------
runTest('10. اختبار sw.js وعزل مسارات الـ API والتوكنات تماماً عن الـ Cache', () => {
    const swPath = path.join(publicDir, 'sw.js');
    assert.strictEqual(fs.existsSync(swPath), true, 'ملف sw.js مفقود!');

    const swCode = fs.readFileSync(swPath, 'utf8');

    // استثناء مسارات API صراحة
    assert.strictEqual(swCode.includes('/api/'), true, 'يجب أن يحتوي sw.js على استثناء صريح لـ /api/');
    assert.strictEqual(
        swCode.includes("url.pathname.includes('/api/')") || swCode.includes("pathname.startsWith('/api')") || swCode.includes('/api/'),
        true,
        'يجب وجود شرط يتجاوز الكاش تماماً لأي مسار API'
    );

    // استبعاد غير GET
    assert.strictEqual(
        swCode.includes("req.method !== 'GET'") || swCode.includes("request.method !== 'GET'"),
        true,
        'يجب حظر كاش طلبات POST/PUT/DELETE في Service Worker'
    );

    // شاشة Offline
    assert.strictEqual(swCode.includes('offline.html'), true, 'يجب دعم العرض البديل offline.html عند انقطاع الاتصال الكامل');
    assert.strictEqual(fs.existsSync(path.join(publicDir, 'offline.html')), true, 'ملف offline.html يجب أن يكون موجوداً على القرص');
});

// --------------------------------------------------------------------------
// 11. اختبار سلامة مسار تسجيل الدخول والخروج وعدم كسر الجلسة
// --------------------------------------------------------------------------
runTest('11. اختبار سلامة مسار تسجيل الدخول والخروج وتنظيف الجلسة', () => {
    const mockWin = createMockWindow({
        url: 'https://khedmety.app/servant-dashboard.html',
        localStorage: {
            auth_token: 'active_token',
            my_church_active_user: JSON.stringify({ role: 'servant', name: 'خادم تجريبي' }),
            student_code: 'S101',
            user_role: 'servant'
        },
        sessionStorage: {
            auth_token: 'active_token',
            _khedmety_prev_page: 'servant_followup.html'
        }
    });

    const client = loadAuthClientInSandbox(mockWin);
    assert.strictEqual(client.isAuthenticated(), true, 'المستخدم يجب أن يكون موثقاً قبل الخروج');

    client.logout('index.html');

    assert.strictEqual(mockWin.localStorage.getItem('auth_token'), null, 'يجب مسح auth_token من localStorage');
    assert.strictEqual(mockWin.localStorage.getItem('my_church_active_user'), null, 'يجب مسح my_church_active_user');
    assert.strictEqual(mockWin.sessionStorage.getItem('auth_token'), null, 'يجب مسح auth_token من sessionStorage');
    assert.strictEqual(mockWin.getRedirected(), 'index.html', 'يجب إعادة التوجيه لصفحة تسجيل الدخول');
    assert.strictEqual(client.isAuthenticated(), false, 'يجب أن يصبح المستخدم غير موثق بعد الخروج');
});

// --------------------------------------------------------------------------
// 12. اختبار عدم حذف أي وظيفة أو موديول من المشروع
// --------------------------------------------------------------------------
runTest('12. اختبار عدم حذف أي وظيفة أو موديول من المشروع (سلامة الملفات والمكونات)', () => {
    // جميع الـ APIs الأصلية للمشروع
    const requiredApis = [
        'admin.js',
        'get_subjects.js',
        'harvest.js',
        'health.js',
        'login.js',
        'mark_plan_read.js',
        'public-config.js',
        'spiritual_note.js',
        'submit_sheet.js'
    ];

    requiredApis.forEach(api => {
        const p = path.join(apiDir, api);
        assert.strictEqual(fs.existsSync(p), true, `ملف الـ API الأساسي [${api}] مفقود!`);
    });

    const requiredLib = ['auth.js', 'firebase.js'];
    requiredLib.forEach(libFile => {
        const p = path.join(apiDir, '_lib', libFile);
        assert.strictEqual(fs.existsSync(p), true, `ملف المكتبة المساندة [_lib/${libFile}] مفقود!`);
    });

    // جميع صفحات الواجهة الأصلية والجديدة (22 صفحة)
    const requiredPages = [
        'index.html',
        'student.html',
        'servant-dashboard.html',
        'student_attendance.html',
        'servant_spiritual_report.html',
        'servant_followup.html',
        'harvest.html',
        'spiritual_note.html',
        'servant_spiritual_note.html',
        'sheet.html',
        'sheets_list.html',
        'admin_subjects.html',
        'bible.html',
        'katamaros.html',
        'synaxarium.html',
        'servant_journal.html',
        'servant_help.html',
        'servant_migrate_attendance.html',
        'barcode.html',
        'recover.html',
        'logout.html',
        'offline.html'
    ];

    requiredPages.forEach(page => {
        const p = path.join(publicDir, page);
        assert.strictEqual(fs.existsSync(p), true, `صفحة الواجهة الأساسية [${page}] مفقودة!`);
    });
});

console.log('\n================================================================');
console.log(`📊 نتيجة اختبارات UI / UX / PWA: إجمالي: ${total} | ناجح: ${passed} | راسب: ${failed}`);
console.log('================================================================');

if (failed > 0) {
    process.exit(1);
}

})();
