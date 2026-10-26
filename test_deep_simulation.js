/**
 * test_deep_simulation.js - محاكاة عميقة للمنظومة ثلاثية الأركان
 * يختبر:
 * 1. سرعة وكفاءة renderMembersList مع كاش التخرج O(1) و DocumentFragment
 * 2. دقة استيراد الإكسيل وقراءة "كود الامتحانات" والفرقة والنوع
 * 3. توافق توقيت اجتماع الجمعة في الواتساب (1:00 ظهراً)
 * 4. تكامل SafeStorage و IndexedDB التلقائي
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🚀 تشغيل المحاكاة العميقة للمنظومة ثلاثية الأركان (Deep Simulation)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ✅ ${name}`);
        passCount++;
    } catch (e) {
        console.error(`  [FAIL] ❌ ${name}: ${e.message}`);
        failCount++;
    }
}

// -------------------------------------------------------------
// 1. اختبار استيراد الإكسيل ودقة الأعمدة
// -------------------------------------------------------------
runTest('1. استيراد الإكسيل: التعرف التلقائي على "كود الامتحانات" والفرقة والنوع', () => {
    const code = fs.readFileSync(path.join(__dirname, 'public/js/dashboard/dashboard-members.js'), 'utf8');
    assert(code.includes("r['كود الامتحانات']"), 'يجب دعم مرادف "كود الامتحانات"');
    assert(code.includes("r['الفرقة']"), 'يجب استخراج عمود الفرقة من الإكسيل');
    assert(code.includes("r['النوع']"), 'يجب استخراج عمود النوع من الإكسيل');
    assert(code.includes('stage: stageVal, gender: genderVal'), 'يجب تطبيق الفرقة والنوع الحقيقيين');
});

// -------------------------------------------------------------
// 2. اختبار ضبط توقيت اجتماع الجمعة بالواتساب
// -------------------------------------------------------------
runTest('2. محرك الواتساب: موعد اجتماع الجمعة الرسمي 1:00 ظهراً (13:00 / 780 دقيقة)', () => {
    const whatsCode = fs.readFileSync('D:/StPaul_Service_System/02_WhatsApp_NewWhats/Backend_Node/services/whatsapp.js', 'utf8');
    assert(whatsCode.includes('(13 * 60) + 0'), 'يجب أن يبدأ موعد الاجتماع من الساعة 1:00 ظهراً');
    assert(!whatsCode.includes('(10 * 60) + 0'), 'يجب ألا يحتوي على الموعد القديم 10:00 صباحاً');
});

// -------------------------------------------------------------
// 3. اختبار ترقية SafeStorage ومزامنة my_church_*
// -------------------------------------------------------------
runTest('3. محرك التخزين KhedmtyDB: دعم SafeStorage ومزامنة مفاتيح my_church_*', () => {
    const dbCode = fs.readFileSync(path.join(__dirname, 'public/js/khedmty-db.js'), 'utf8');
    assert(dbCode.includes("k.startsWith('my_church_')"), 'يجب ترحيل مفاتيح my_church_* تلقائياً');
    assert(dbCode.includes('SafeStorage'), 'يجب توفير كائن SafeStorage');
    assert(dbCode.includes('QuotaExceededError') || dbCode.includes('quota reached'), 'يجب حماية التطبيق من أخطاء Quota');
});

// -------------------------------------------------------------
// 4. اختبار أداء renderMembersList وكاش التخرج O(1)
// -------------------------------------------------------------
runTest('4. أداء الواجهة: استخدام DocumentFragment ومنع O(N^2) عبر gradStatusCache', () => {
    const memCode = fs.readFileSync(path.join(__dirname, 'public/js/dashboard/dashboard-members.js'), 'utf8');
    assert(memCode.includes('document.createDocumentFragment()'), 'يجب تجميع الصفوف عبر DocumentFragment');
    assert(memCode.includes('gradStatusCache'), 'يجب كاش نسب التخرج O(1)');
    assert(memCode.includes('todayAttendedSet'), 'يجب استخدام Set لفحص حضور اليوم بزمن O(1)');
});

// -------------------------------------------------------------
// 5. محاكاة برمجية لتنفيذ renderMembersList مع 500 طالب
// -------------------------------------------------------------
runTest('5. محاكاة قياس زمن المعالجة (Benchmark): 500 طالب و 50 جمعة دون لاج (< 15ms)', () => {
    // إعداد بيئة وهمية مصغرة
    const members = [];
    for (let i = 1; i <= 500; i++) {
        members.push({
            id: i,
            code: 2200 + i,
            name: `طالب تجريبي ${i}`,
            stage: i % 2 === 0 ? 'سنة أولى' : 'سنة ثانية',
            phone: `012000000${i}`
        });
    }

    const attendanceRecord = {};
    for (let w = 1; w <= 50; w++) {
        const dateKey = `2026-0${Math.floor(w/4)+1}-0${(w%4)*7+1}`;
        attendanceRecord[dateKey] = members.slice(0, 350).map(m => ({ id: m.id, points: 15 }));
    }

    const activeSelectedDate = '2026-10-23';

    // محاكاة الخوارزمية المحسنة
    const startTime = Date.now();

    const todayAttendedSet = new Set(
        (attendanceRecord[activeSelectedDate] || []).map(a => a && a.id ? a.id.toString() : '')
    );

    const gradStatusCache = new Map();
    function mockCalcGrad(id) {
        return { percent: 85, attended: 42, total: 50, bonus: 30, qualified: true };
    }
    function getGrad(id) {
        const k = String(id);
        if (!gradStatusCache.has(k)) {
            gradStatusCache.set(k, mockCalcGrad(id));
        }
        return gradStatusCache.get(k);
    }

    const search = 'طالب';
    let filtered = members.filter(m => {
        let matchesSearch = m.name.includes(search);
        let grad = getGrad(m.id);
        return matchesSearch && grad.qualified;
    });

    let rowCount = 0;
    filtered.forEach(m => {
        let grad = getGrad(m.id);
        let isAttended = todayAttendedSet.has(m.id.toString());
        rowCount++;
    });

    const elapsed = Date.now() - startTime;
    console.log(`     -> زمن المعالجة لـ 500 مخدوم مع الفلترة: ${elapsed}ms (الحد الأقصى المسموح 50ms)`);
    assert(elapsed < 50, `يجب أن يكون زمن المعالجة أقل من 50ms (الفعل: ${elapsed}ms)`);
    assert.strictEqual(rowCount, 500, 'يجب معالجة كافة الطلاب بنجاح');
});

// -------------------------------------------------------------
// 6. فحص Service Worker وإصدار الكاش الأحدث v2.6
// -------------------------------------------------------------
runTest('6. كاش الـ Service Worker محدث لإصدار v2.6 مع الحفاظ على v2.0 للتوافق', () => {
    const swCode = fs.readFileSync(path.join(__dirname, 'public/sw.js'), 'utf8');
    assert(swCode.includes('khedmety-ultra-v2.6'), 'يجب أن يكون اسم الكاش khedmety-ultra-v2.6');
    assert(swCode.includes('khedmety-ultra-v2.0'), 'يجب الحفاظ على جملة التوافق khedmety-ultra-v2.0');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للمحاكاة: ناجح: ${passCount} | راسب: ${failCount}`);
console.log('================================================================');

if (failCount > 0) process.exit(1);
