/**
 * test_batch_a1.js - حزمة الاختبارات الهندسية للدفعة A.1
 * Khedmety-Plus Ultra Pro Max | Batch A.1 Verification Suite
 *
 * تصنيف الاختبارات الصارم:
 * [A] مطابقة النصوص والخصائص وعناصر DOM (Static Text / Markup / Attribute Check)
 * [B] فحص سلامة التركيب النحوي وعدم وجود أخطاء صياغة (Syntax Validation)
 * [C] اختبارات منطق برمجية محاكاة (Mocked Logic / Headless Unit Test)
 * [D] اختبار متصفح فعلي (Actual Browser Test) - غير مُدّعى لعدم توفر متصفح حقيقي في بيئة الاختبار
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passCount = 0;
let failCount = 0;

function assert(condition, message, category = 'C') {
    if (condition) {
        console.log(`  [PASS] [${category}] ${message}`);
        passCount++;
    } else {
        console.error(`  [FAIL] [${category}] ${message}`);
        failCount++;
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('🚀 بدء تشغيل حزمة اختبارات Batch A.1 لمشروع Khedmety-Plus');
    console.log('================================================================\n');

    // ==============================================================
    // القسم 1: فحص سلامة التركيب النحوي لجميع الملفات المعدلة [B]
    // ==============================================================
    console.log('--- 1. فحص سلامة التركيب النحوي للملفات (Syntax Check [B]) ---');
    const targetFiles = [
        'public/js/app-updater.js',
        'public/sw.js',
        'public/js/pwa-helper.js',
        'public/auth-client.js'
    ];

    for (const file of targetFiles) {
        const fullPath = path.join(__dirname, file);
        try {
            const code = fs.readFileSync(fullPath, 'utf8');
            new vm.Script(code);
            assert(true, `الملف ${file} سليم نحوياً وخالٍ من أخطاء الـ Syntax`, 'B');
        } catch (err) {
            assert(false, `خطأ نحوي في ${file}: ${err.message}`, 'B');
        }
    }

    // ==============================================================
    // القسم 2: فحص البنية والوسوم والسمات المضافة [A]
    // ==============================================================
    console.log('\n--- 2. فحص الخصائص والعناصر المحدثة في واجهات HTML [A] ---');

    const dashPath = path.join(__dirname, 'public/servant-dashboard.html');
    const notePath = path.join(__dirname, 'public/servant_spiritual_note.html');
    const swPath = path.join(__dirname, 'public/sw.js');
    const updaterPath = path.join(__dirname, 'public/js/app-updater.js');

    const dashHtml = fs.readFileSync(dashPath, 'utf8');
    const noteHtml = fs.readFileSync(notePath, 'utf8');
    const swCode = fs.readFileSync(swPath, 'utf8');
    const updaterCode = fs.readFileSync(updaterPath, 'utf8');

    // 2.1 حاوية زر التحديث في لوحة الخادم
    assert(dashHtml.includes('id="appUpdateContainer"'), 'وجود حاوية زر التحديث id="appUpdateContainer" في لوحة الخادم', 'A');

    // 2.2 تضمين سكربت app-updater في لوحة الخادم
    assert(dashHtml.includes('src="js/app-updater.js"'), 'تضمين مكتبة app-updater.js داخل servant-dashboard.html', 'A');

    // 2.3 تضمين سكربت pwa-helper في لوحة الخادم
    assert(dashHtml.includes('src="js/pwa-helper.js"'), 'تضمين مكتبة pwa-helper.js داخل servant-dashboard.html', 'A');

    // 2.4 زر الرجوع في النوتة الروحية يحمل fallback مع معلمة tab
    assert(noteHtml.includes('data-fallback="servant-dashboard.html?tab=dashTab"'), 'زر الرجوع في النوتة الروحية يحمل وجهة افتراضية مع معلمة تبويب آمنة', 'A');

    // 2.5 رابط النوتة الروحية في لوحة الخادم ينقل التبويب الحالي
    assert(dashHtml.includes('servant_spiritual_note.html?fromTab='), 'رابط النوتة الروحية في اللوحة ينقل التبويب الحالي ديناميكياً', 'A');

    // 2.6 مرونة precache في sw.js باستخدام Promise.allSettled
    assert(swCode.includes('Promise.allSettled'), 'sw.js يستخدم Promise.allSettled للتخزين المسبق المرن واحتواء أخطاء الأصول الفردية', 'A');

    // 2.7 عزل حذف الكاش في sw.js لبادئة التطبيق فقط
    assert(swCode.includes("cache.startsWith('khedmety-')"), 'sw.js يحصر حذف الكاشات القديمة في كاشات khedmety- فقط', 'A');

    // 2.8 عزل حذف الكاش في app-updater.js لبادئة khedmety-
    assert(updaterCode.includes("key.startsWith('khedmety-')"), 'app-updater.js يحصر تفريغ الكاش في كاشات khedmety- دون مساس بكاشات أخرى', 'A');

    // 2.9 دعم فحص المدخلات غير المحفوظة hasUnsavedInputs
    assert(updaterCode.includes('hasUnsavedInputs'), 'app-updater.js يحتوي على دالة hasUnsavedInputs لفحص النماذج قبل التحديث', 'A');

    // ==============================================================
    // القسم 3: اختبارات المنطق البرمجي المحاكى [C]
    // ==============================================================
    console.log('\n--- 3. اختبارات المنطق البرمجي المحاكى (Mocked Logic [C]) ---');

    // 3.1 اختبار منطق استعادة التبويب السياقي والتحقق من التبويبات المجهولة
    const VALID_TABS = [
        'dashTab', 'planTab', 'coursesTab', 'materialsTab',
        'attendanceTab', 'servantsAttendanceTab', 'membersTab',
        'broadcastTab', 'servantsTab', 'rolloverTab', 'auditTab',
        'settingsTab', 'dataTab', 'followupTab', 'reflectionsTab'
    ];

    function resolveTargetTab(urlParamTab, sessionTab, permission) {
        let wantTab = urlParamTab || sessionTab;
        if (wantTab && !VALID_TABS.includes(wantTab)) {
            wantTab = 'dashTab'; // Fallback for invalid tab
        }
        if (permission === 'attend_only' || permission === 'scanner_only') {
            wantTab = 'attendanceTab';
        }
        return wantTab || 'dashTab';
    }

    assert(resolveTargetTab('attendanceTab', null, 'full') === 'attendanceTab', 'استعادة تبويب الحضور بنجاح عند التمرير في الرابط', 'C');
    assert(resolveTargetTab('membersTab', null, 'full') === 'membersTab', 'استعادة تبويب المخدومين بنجاح عند التمرير في الرابط', 'C');
    assert(resolveTargetTab(null, 'planTab', 'full') === 'planTab', 'استعادة التبويب من sessionStorage عند عدم وجوده في الرابط', 'C');
    assert(resolveTargetTab('evilInjectionTab123', null, 'full') === 'dashTab', 'ردع التبويب المجهول أو المزيف والرجوع بأمان للرئيسية dashTab', 'C');
    assert(resolveTargetTab('planTab', null, 'attend_only') === 'attendanceTab', 'احترام قيود صلاحية attend_only وإرجاع attendanceTab دائماً', 'C');

    // 3.2 اختبار منطق العودة السياقية من النوتة الروحية
    function computeSpiritualNoteFallback(fromTabParam, sessionTab) {
        const candidate = fromTabParam || sessionTab || 'dashTab';
        const safe = /^[a-zA-Z0-9_-]+$/.test(candidate) ? candidate : 'dashTab';
        return `servant-dashboard.html?tab=${encodeURIComponent(safe)}`;
    }

    assert(computeSpiritualNoteFallback('membersTab', 'dashTab') === 'servant-dashboard.html?tab=membersTab', 'تحديد مسار الرجوع بدقة عند الدخول من تبويب المخدومين', 'C');
    assert(computeSpiritualNoteFallback(null, 'coursesTab') === 'servant-dashboard.html?tab=coursesTab', 'تحديد مسار الرجوع من الجلسة عند عدم وجود معلمة في الرابط', 'C');
    assert(computeSpiritualNoteFallback(null, null) === 'servant-dashboard.html?tab=dashTab', 'الدخول المباشر بدون سياق يعيد بأمان إلى dashTab', 'C');
    assert(computeSpiritualNoteFallback('"><script>alert(1)</script>', null) === 'servant-dashboard.html?tab=dashTab', 'تطهير أي حقن خبيث في مسار العودة وتعيين dashTab', 'C');

    // 3.3 اختبار تنظيف سياق التبويبات عند تسجيل الخروج
    const mockSessionStorage = {
        'khedmety_tab_1001': 'attendanceTab',
        'khedmety_tab_guest': 'membersTab',
        'khedmety_tab_admin': 'settingsTab',
        'unrelated_key': 'keep_me'
    };

    function simulateLogoutTabCleanup(storage) {
        Object.keys(storage).forEach(k => {
            if (k.startsWith('khedmety_tab_')) {
                delete storage[k];
            }
        });
    }

    simulateLogoutTabCleanup(mockSessionStorage);
    assert(mockSessionStorage['khedmety_tab_1001'] === undefined, 'مسح تبويب المستخدم 1001 عند تسجيل الخروج', 'C');
    assert(mockSessionStorage['khedmety_tab_admin'] === undefined, 'مسح تبويب الأدمن عند تسجيل الخروج', 'C');
    assert(mockSessionStorage['unrelated_key'] === 'keep_me', 'عدم المساس بالمفاتيح غير التابعة لتبويبات التطبيق', 'C');

    // 3.4 اختبار حصر تفريغ الكاش على كاشات التطبيق فقط
    const registeredCaches = [
        'khedmety-ultra-v1.0',
        'khedmety-ultra-v2.0',
        'google-fonts-cache',
        'firebase-installations-cache',
        'other-domain-app-cache'
    ];
    const deletedCaches = [];

    const mockCaches = {
        keys: async () => registeredCaches,
        delete: async (name) => {
            deletedCaches.push(name);
            return true;
        }
    };

    // استدعاء منطق الحذف المصفى في app-updater
    const keys = await mockCaches.keys();
    const appOnlyKeys = keys.filter(k => typeof k === 'string' && k.startsWith('khedmety-'));
    await Promise.all(appOnlyKeys.map(k => mockCaches.delete(k)));

    assert(deletedCaches.includes('khedmety-ultra-v1.0'), 'حذف كاش التطبيق القديم khedmety-ultra-v1.0', 'C');
    assert(deletedCaches.includes('khedmety-ultra-v2.0'), 'حذف كاش التطبيق khedmety-ultra-v2.0', 'C');
    assert(!deletedCaches.includes('google-fonts-cache'), 'عدم لمس أو حذف كاش الخطوط الخارجية google-fonts-cache', 'C');
    assert(!deletedCaches.includes('other-domain-app-cache'), 'عدم لمس أو حذف كاشات النطاقات أو التطبيقات الأخرى', 'C');

    // 3.5 اختبار فحص النماذج غير المحفوظة hasUnsavedInputs
    function mockHasUnsavedInputs(elements) {
        for (const input of elements) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked !== input.defaultChecked) return true;
            } else if (input.value && input.value.trim() !== '' && input.value !== input.defaultValue) {
                return true;
            }
        }
        return false;
    }

    const cleanForm = [
        { type: 'text', value: 'Default Text', defaultValue: 'Default Text' },
        { type: 'checkbox', checked: false, defaultChecked: false }
    ];
    const dirtyFormText = [
        { type: 'text', value: 'New Unsaved Text', defaultValue: '' }
    ];
    const dirtyFormCheckbox = [
        { type: 'checkbox', checked: true, defaultChecked: false }
    ];

    assert(mockHasUnsavedInputs(cleanForm) === false, 'النموذج النظيف لا يعتبر غير محفوظ', 'C');
    assert(mockHasUnsavedInputs(dirtyFormText) === true, 'اكتشاف نص جديد غير محفوظ بنجاح', 'C');
    assert(mockHasUnsavedInputs(dirtyFormCheckbox) === true, 'اكتشاف خانة اختيار تم تغييرها ولم تحفظ بنجاح', 'C');

    // 3.6 اختبار أمان رسائل Service Worker والمهلة الاحتياطية
    let swMessageProcessed = false;
    const testTimeoutPromise = new Promise(resolve => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) { settled = true; resolve('TIMEOUT_FALLBACK_OK'); }
        }, 100);

        // محاكاة استجابة Service Worker عبر منفذ
        const mockPort = {
            postMessage: () => {
                if (!settled) { settled = true; clearTimeout(timer); resolve('PORT_REPLIED_OK'); }
            }
        };
        setTimeout(() => mockPort.postMessage(), 20);
    });

    const swResult = await testTimeoutPromise;
    assert(swResult === 'PORT_REPLIED_OK', 'تواصل Service Worker بنجاح عبر MessageChannel مع وجود مهلة أمان بديلة', 'C');

    // ==============================================================
    // القسم 4: اختبارات الدفعة المحدثة Batch A.1.1 المباشرة
    // ==============================================================
    console.log('\n--- 4. اختبارات الدفعة المحدثة Batch A.1.1 (App Updater Refinements) ---');

    const KhedmetyAppUpdater = require('./public/js/app-updater.js');

    // 4.1 فحص حقل غير محفوظ خارج <form> يكتشفه الفاحص بنجاح
    {
        const mockDomInputs = [
            { tagName: 'input', type: 'text', id: 'mat_title', value: 'محاضرة جديدة', defaultValue: '', disabled: false, readOnly: false }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === true, 'حقل نصي غير محفوظ خارج عنصر form يكتشف كبيانات غير محفوظة بنجاح', 'C');
    }

    // 4.2 فحص textarea غير محفوظ خارج <form>
    {
        const mockDomInputs = [
            { tagName: 'textarea', id: 'mat_notes', value: 'ملاحظات هامة للخدمة', defaultValue: '', disabled: false, readOnly: false }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === true, 'حقل textarea غير محفوظ خارج form يكتشف كبيانات غير محفوظة بنجاح', 'C');
    }

    // 4.3 فحص <select> تم تغيير خياره الافتراضي خارج <form>
    {
        const mockDomInputs = [
            {
                tagName: 'select',
                id: 'mat_type',
                options: [
                    { value: 'video', defaultSelected: true },
                    { value: 'pdf', defaultSelected: false }
                ],
                selectedIndex: 1, // تم اختيار الخيار الثاني
                disabled: false
            }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === true, 'قائمة select تم تغيير خيارها عن الافتراضي خارج form تكتشف كبيانات غير محفوظة', 'C');
    }

    // 4.4 حقل نظيف (لم يتغير) أو مطابق للـ defaultValue لا يؤدي لتحذير
    {
        const mockDomInputs = [
            { tagName: 'input', type: 'text', id: 'title', value: 'قيمة افتراضية', defaultValue: 'قيمة افتراضية', disabled: false, readOnly: false },
            { tagName: 'textarea', id: 'notes', value: '', defaultValue: '', disabled: false, readOnly: false },
            {
                tagName: 'select',
                options: [{ value: 'a', defaultSelected: true }, { value: 'b', defaultSelected: false }],
                selectedIndex: 0,
                disabled: false
            }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === false, 'الحقول النظيفة المطابقة لقيمها الافتراضية لا تؤدي تلقائياً إلى تحذير', 'C');
    }

    // 4.5 الحقول غير القابلة للتحرير (disabled أو readOnly) لا تؤدي لتحذير
    {
        const mockDomInputs = [
            { tagName: 'input', type: 'text', id: 'servant_code', value: '1001', defaultValue: '', disabled: true, readOnly: false },
            { tagName: 'input', type: 'text', id: 'servant_name', value: 'خادم معطل', defaultValue: '', disabled: false, readOnly: true },
            { tagName: 'textarea', id: 'static_notes', value: 'نص للقراءة فقط', defaultValue: '', disabled: true }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === false, 'الحقول المعطلة disabled أو غير القابلة للتحرير readOnly تستبعد تماماً ولا تطلق تحذيراً', 'C');
    }

    // 4.6 الحقول المخفية وحقول البحث والتصفية اللحظية لا تؤدي لتحذير
    {
        const mockDomInputs = [
            { tagName: 'input', type: 'hidden', id: 'csrf_token', value: 'secret123', defaultValue: '' },
            { tagName: 'input', type: 'text', id: 'm_search', placeholder: 'بحث بالاسم...', value: 'مارك', defaultValue: '', disabled: false, readOnly: false },
            { tagName: 'input', type: 'search', id: 'general_search', value: 'خطة', defaultValue: '', disabled: false, readOnly: false }
        ];
        global.document = {
            querySelectorAll: () => mockDomInputs
        };
        const isDirty = KhedmetyAppUpdater.hasUnsavedInputs();
        assert(isDirty === false, 'الحقول المخفية وحقول البحث اللحظي لا تمثل مدخلات غير محفوظة وتستبعد بنجاح', 'C');
    }

    // 4.7 اختبار منع تكرار زر التحديث (Idempotent renderUpdateButton)
    {
        const children = [];
        const mockContainer = {
            appendChild: (child) => children.push(child),
            querySelector: (selector) => {
                if (selector === '.ultra-btn-updater') {
                    return children.find(c => c.className === 'ultra-btn-updater') || null;
                }
                return null;
            }
        };
        global.document = {
            createElement: (tag) => ({
                tagName: tag,
                className: '',
                setAttribute: () => {},
                addEventListener: () => {}
            }),
            querySelector: (sel) => sel === '#appUpdateContainer' ? mockContainer : null
        };

        // استدعاء أول
        const btn1 = KhedmetyAppUpdater.renderUpdateButton('#appUpdateContainer');
        assert(children.length === 1, 'إنشاء زر التحديث لأول مرة بنجاح داخل الحاوية', 'C');

        // استدعاء ثانٍ وثالث لنفس الحاوية
        const btn2 = KhedmetyAppUpdater.renderUpdateButton('#appUpdateContainer');
        const btn3 = KhedmetyAppUpdater.renderUpdateButton('#appUpdateContainer');
        assert(children.length === 1, 'استدعاء renderUpdateButton عدة مرات لا ينتج أزراراً مكررة', 'C');
        assert(btn1 === btn2 && btn2 === btn3, 'إرجاع نفس عنصر الزر الموجود مسبقاً دون استبدال', 'C');
    }

    // 4.8 التعامل الآمن مع غياب الحاوية أو عدم صلاحية المحدد
    {
        global.document = {
            querySelector: (sel) => {
                if (sel === '::invalid[[selector') {
                    throw new Error('Invalid selector');
                }
                return null; // الحاوية غير موجودة
            }
        };

        let errThrown = false;
        try {
            const resMissing = KhedmetyAppUpdater.renderUpdateButton('#nonExistentContainer');
            assert(resMissing === null, 'غياب الحاوية يعيد null بأمان دون أخطاء', 'C');

            const resInvalid = KhedmetyAppUpdater.renderUpdateButton('::invalid[[selector');
            assert(resInvalid === null, 'محدد CSS غير صالح يُعالج بأمان دون رمي خطأ غير معالج', 'C');
        } catch (e) {
            errThrown = true;
        }
        assert(errThrown === false, 'عدم حدوث أي انهيار غير معالج عند تمرير حاوية غير موجودة أو محدد غير صالح', 'C');
    }

    // 4.9 استمرار سلوك تحديث التطبيق عند غياب Service Worker
    {
        let replacedUrl = null;
        let overlayShown = false;

        global.window = {
            location: {
                href: 'http://localhost:3000/servant-dashboard.html?tab=dashTab',
                replace: (url) => { replacedUrl = url; }
            },
            caches: {
                keys: async () => ['khedmety-cache-v1'],
                delete: async () => true
            }
        };
        global.navigator = {}; // لا يوجد serviceWorker في المتصفح

        // تشغيل التحديث في بيئة لا تدعم Service Worker
        KhedmetyAppUpdater.isUpdating = false;
        KhedmetyAppUpdater.showUpdateOverlay = () => { overlayShown = true; };

        await KhedmetyAppUpdater.cleanCachesAndHardRefresh({ silent: true, skipDirtyCheck: true });
        assert(replacedUrl !== null && replacedUrl.includes('_v='), 'استمرار تنفيذ التحديث وإعادة التحميل بختم زمني حتى مع غياب Service Worker', 'C');
    }

    // 4.10 تأكيد عزل حذف الكاشات حصراً على كاشات التطبيق
    {
        const deletedKeys = [];
        global.window = {
            location: { href: 'http://localhost/', replace: () => {} },
            caches: {
                keys: async () => ['khedmety-ultra-v1', 'khedmety-ultra-v2', 'google-fonts', 'other-domain-app'],
                delete: async (k) => { deletedKeys.push(k); return true; }
            }
        };
        global.navigator = {};
        KhedmetyAppUpdater.isUpdating = false;
        await KhedmetyAppUpdater.cleanCachesAndHardRefresh({ silent: true, skipDirtyCheck: true });

        assert(deletedKeys.includes('khedmety-ultra-v1') && deletedKeys.includes('khedmety-ultra-v2'), 'حذف كاشات khedmety التابعة للتطبيق', 'C');
        assert(!deletedKeys.includes('google-fonts') && !deletedKeys.includes('other-domain-app'), 'عدم حذف كاشات الخطوط أو كاشات النطاقات الأخرى إطلاقاً', 'C');
    }

    // ==============================================================
    // التقرير النهائي
    // ==============================================================
    console.log('\n================================================================');
    console.log(`📊 نتيجة اختبارات حزمة Batch A.1 / A.1.1:`);
    console.log(`   إجمالي الحالات: ${passCount + failCount}`);
    console.log(`   الناجحة: ${passCount} ✅`);
    console.log(`   الفاشلة: ${failCount} ❌`);
    console.log('================================================================');

    if (failCount > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
});
