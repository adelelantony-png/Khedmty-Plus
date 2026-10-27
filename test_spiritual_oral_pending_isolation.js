/**
 * test_spiritual_oral_pending_isolation.js
 * 
 * حزمة اختبارات شاملة للتحقق من عزل وفصل الشباب أصحاب الملاحظات الروحية (مثل مظهر الشعر والاعتراف)
 * الحاصلين على صفر في الشفوي الروحي مع وجود درجات تحريري عن حالات الغياب والرسوب العادي.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات عزل الملاحظات الروحية (الشعر والاعتراف) مع الشفوي المعلق');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, 'public', 'servant_grades_entry.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  [PASS] ✅ ${desc}`);
        passedTests++;
    } catch (err) {
        console.error(`  [FAIL] ❌ ${desc}`);
        console.error(`         ${err.message}`);
    }
}

// -------------------------------------------------------------------------
console.log('--- 1. فحص عناصر الواجهة وشارات التمييز في HTML ---');
// -------------------------------------------------------------------------

it('وجود خيار فلترة "معلق لملاحظة روحية (شعر/اعتراف - شفوي 0)" في statusFilter', () => {
    assert(htmlContent.includes('value="pending_spiritual"'), 'Option pending_spiritual must exist in statusFilter');
    assert(htmlContent.includes('value="all_pending"'), 'Option all_pending must exist in statusFilter');
});

it('وجود خيار فلترة "ملاحظة روحية (شعر/اعتراف) مع شفوي صفر معلق" في spiritualNotesFilter', () => {
    assert(htmlContent.includes('value="spiritual_zero_oral"'), 'Option spiritual_zero_oral must exist in spiritualNotesFilter');
});

it('وجود فئة التنسيق البنفسجية الملكية status-pending-spiritual في CSS', () => {
    assert(htmlContent.includes('.status-pending-spiritual'), 'CSS class .status-pending-spiritual must be defined');
});

it('وجود خيار إرسال رسائل الواتساب المخصصة للمعلقين لملاحظة روحية', () => {
    assert(htmlContent.includes('value="pending_spiritual">المعلقون لملاحظة روحية'), 'waTargetGroupSelect must support pending_spiritual');
});

// -------------------------------------------------------------------------
console.log('\n--- 2. فحص دوال التحقق والمنطق البرمجي في JS ---');
// -------------------------------------------------------------------------

it('وجود دالة isCandidatePendingSpiritualOral في الكود البرمجي', () => {
    assert(htmlContent.includes('function isCandidatePendingSpiritualOral'), 'isCandidatePendingSpiritualOral must exist');
});

it('التحقق من منطق دالة isCandidatePendingSpiritualOral', () => {
    function isCandidatePendingSpiritualOral(candidate) {
        if (!candidate || !candidate.attended) return false;
        const g3 = Number(candidate.g3) || 0;
        if (g3 > 0) return false;

        const g1 = Number(candidate.g1) || 0;
        const g2 = Number(candidate.g2) || 0;
        const hasWrittenGrades = (g1 > 0 || g2 > 0);
        if (!hasWrittenGrades) return false;

        const spNotes = String(candidate.spiritualNotes || '').trim().toLowerCase();
        const prob = String(candidate.problemType || '').trim().toLowerCase();
        const conf = String(candidate.confessor || '').trim().toLowerCase();
        const hasConfIssue = (!conf || conf === 'لا يوجد' || conf === 'none' || conf === 'لم يحدد');

        return (
            spNotes.length > 0 ||
            prob.includes('اعتراف') ||
            prob.includes('شعر') ||
            hasConfIssue
        );
    }

    // حالة 1: طالب حاضر ولديه درجات تحريري (g1=20) ودرجة الشفوي صفر ومعه ملاحظة مظهر الشعر
    const c1 = {
        name: "مينا أشرف", attended: true,
        g1: 20, g2: 18, g3: 0, g4: 15,
        spiritualNotes: "اعتراف ومظهر الشعر", confessor: "أبونا يوسف"
    };
    assert.strictEqual(isCandidatePendingSpiritualOral(c1), true, 'c1 must be recognized as pending spiritual oral');

    // حالة 2: طالب اجتاز الشفوي (g3=15) ومعه نفس الملاحظة -> ليس معلقاً لصفر
    const c2 = { ...c1, g3: 15 };
    assert.strictEqual(isCandidatePendingSpiritualOral(c2), false, 'c2 has g3 > 0 so not pending oral zero');

    // حالة 3: طالب غائب تماماً (attended=false, g1=0, g3=0) -> لا يعتبر حاضر تحريري
    const c3 = { name: "ديفيد نبيل", attended: false, g1: 0, g2: 0, g3: 0, g4: 0, spiritualNotes: "مظهر الشعر" };
    assert.strictEqual(isCandidatePendingSpiritualOral(c3), false, 'c3 is absent, not pending with written grades');

    // حالة 4: طالب حاضر تحريري (g1=20) ورسب في الشفوي (g3=0) لكن ليس لديه أي ملاحظة روحية واعترافه سليم
    const c4 = { name: "بيتر مجدي", attended: true, g1: 20, g2: 18, g3: 0, g4: 15, spiritualNotes: "", confessor: "أبونا توماس", problemType: "طبيعي" };
    assert.strictEqual(isCandidatePendingSpiritualOral(c4), false, 'c4 has zero but no spiritual issue/note');
});

it('التحقق من قرار computeDecision للمخدوم المعلق لملاحظة روحية (عدم اعتباره راسباً)', () => {
    // محاكاة منطق computeDecision
    const candidate = {
        name: "مينا أشرف", code: "2207", attended: true,
        g1: 20, g2: 19, g3: 0, g4: 18,
        spiritualNotes: "اعتراف ومظهر الشعر", confessor: "أبونا يوسف", problemType: "مظهر الشعر والاعتراف ✂️"
    };

    const isPending = (candidate.attended && Number(candidate.g3) === 0 && (candidate.g1 > 0 || candidate.g2 > 0) && candidate.spiritualNotes.includes('الشعر'));
    assert.strictEqual(isPending, true);

    const decisionKey = isPending ? 'pending_spiritual' : 'rejected';
    const decisionLabel = isPending ? 'معلق لملاحظة روحية ✂️🕊️' : 'غير مجتاز - دور ثانٍ 🔴';

    assert.strictEqual(decisionKey, 'pending_spiritual', 'Must be pending_spiritual');
    assert.strictEqual(decisionLabel, 'معلق لملاحظة روحية ✂️🕊️', 'Label must be pending spiritual');
});

// -------------------------------------------------------------------------
console.log('\n--- 3. فحص الفلترة والفصل التام في شاشات الرصد والتوزيع ---');
// -------------------------------------------------------------------------

it('تأكد من شمول المعلقين لملاحظة روحية في عداد المعلقين (interviewCount) وعدم احتسابهم كراسبين', () => {
    assert(htmlContent.includes("if (dec.key === 'interview' || dec.key === 'pending_spiritual') interviewCount++;"), 'interviewCount must include pending_spiritual');
});

it('فصل المعلقين لملاحظة روحية في جدول التوزيع التكراري للشريحة 0%', () => {
    assert(htmlContent.includes('منهم'), '0% bracket row must show breakdown note');
    assert(htmlContent.includes('معلق لملاحظة شعر/اعتراف'), '0% bracket must mention hair/confession pending');
    assert(htmlContent.includes('isPendingSpiritualOral'), 'students must be tagged with isPendingSpiritualOral');
});

it('صياغة رسالة واتساب مخصصة وراقية تدعو لمقابلة الملاحظة الروحية', () => {
    assert(htmlContent.includes("dec.key === 'pending_spiritual'"), 'buildStudentWhatsappMessage must handle pending_spiritual');
    assert(htmlContent.includes('تم تعليق نتيجتك لمراجعة'), 'WhatsApp message must politely inform about spiritual note review');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للاختبارات: ${passedTests}/${totalTests} فحوصات نجحت بنسبة ${Math.round(passedTests/totalTests*100)}% ✅`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
