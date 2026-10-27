/**
 * test_notes_tab_and_category.js
 * 
 * حزمة اختبارات شاملة للتحقق من إضافة تبويب وفئة "لديهم ملاحظات" (روحي/نفسي/معلقين):
 * 1. شريط التبويبات السريعة (Quick Tabs Bar) فوق جدول الرصد
 * 2. تبويب "لديهم ملاحظات" المميز مع عداد لحظي ديناميكي
 * 3. البطاقة الخامسة الجديدة في شبكة معايير الشرائح الإحصائية (cardNotesBox)
 * 4. خيار الفلترة المباشر في قائمة القبول (has_notes)
 * 5. تبويب الاستوديو 5 (سجل ومتابعة أصحاب الملاحظات والمعلقين)
 * 6. محاكاة دقيقة لمنطق الفلترة والمزامنة التفاعلية
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات تبويب وفئة "لديهم ملاحظات" والمعلقين (Suite #15)');
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
console.log('--- 1. فحص عناصر شريط التبويبات السريعة (Quick Tabs Bar) في HTML ---');
// -------------------------------------------------------------------------

it('وجود شريط التبويبات السريعة statusQuickTabsBar في الواجهة', () => {
    assert(htmlContent.includes('id="statusQuickTabsBar"'), 'statusQuickTabsBar must exist');
    assert(htmlContent.includes('class="status-quick-tabs-bar"'), 'CSS class status-quick-tabs-bar must exist');
});

it('وجود تبويب "لديهم ملاحظات (روحي/نفسي)" وزر tabQuick_has_notes والعداد badgeQuick_has_notes', () => {
    assert(htmlContent.includes('id="tabQuick_has_notes"'), 'tabQuick_has_notes button must exist');
    assert(htmlContent.includes('لديهم ملاحظات (روحي/نفسي)'), 'Label must mention spiritual/psych notes');
    assert(htmlContent.includes('id="badgeQuick_has_notes"'), 'badgeQuick_has_notes counter must exist');
});

it('وجود تبويب "معلق لملاحظة روحية" وزر tabQuick_pending_spiritual والعداد badgeQuick_pending_spiritual', () => {
    assert(htmlContent.includes('id="tabQuick_pending_spiritual"'), 'tabQuick_pending_spiritual button must exist');
    assert(htmlContent.includes('id="badgeQuick_pending_spiritual"'), 'badgeQuick_pending_spiritual counter must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 2. فحص البطاقة الخامسة وشبكة المعايير الإحصائية ---');
// -------------------------------------------------------------------------

it('وجود بطاقة "لديهم ملاحظات / معلقون" الخامسة cardNotesBox في شبكة المعايير', () => {
    assert(htmlContent.includes('id="cardNotesBox"'), 'cardNotesBox must exist');
    assert(htmlContent.includes('class="criteria-card card-notes"'), 'cardNotesBox must have card-notes class');
    assert(htmlContent.includes('id="cardNotesCount"'), 'cardNotesCount must exist');
    assert(htmlContent.includes('id="cardNotesPct"'), 'cardNotesPct must exist');
});

it('وجود خيار فلترة "كل من لديهم ملاحظات (روحية أو نفسية)" في قائمة statusFilter', () => {
    assert(htmlContent.includes('value="has_notes"'), 'Option value="has_notes" must exist in statusFilter');
    assert(htmlContent.includes('كل من لديهم ملاحظات (روحية أو نفسية)'), 'Option label must be descriptive');
});

// -------------------------------------------------------------------------
console.log('\n--- 3. فحص تبويب الاستوديو 5 (سجل ومتابعة أصحاب الملاحظات) ---');
// -------------------------------------------------------------------------

it('وجود زر التبويب الخامس tabStudioNotes في شريط الاستوديو الرئيسي', () => {
    assert(htmlContent.includes('id="tabStudioNotes"'), 'tabStudioNotes button must exist');
    assert(htmlContent.includes('5. حصر ومتابعة أصحاب الملاحظات والمعلقين'), 'Tab 5 label must be present');
});

it('وجود حاوية التبويب الخامس paneStudioNotes مع جدول الحصر الديناميكي والإحصائيات', () => {
    assert(htmlContent.includes('id="paneStudioNotes"'), 'paneStudioNotes container must exist');
    assert(htmlContent.includes('id="studioNotesListView"'), 'studioNotesListView container must exist');
    assert(htmlContent.includes('id="studioNotesTotalCount"'), 'studioNotesTotalCount counter must exist');
    assert(htmlContent.includes('id="studioNotesPendingSpCount"'), 'studioNotesPendingSpCount counter must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 4. فحص الدوال البرمجية ومنطق الفلترة والمزامنة في JS ---');
// -------------------------------------------------------------------------

it('وجود دوال التبويبات selectQuickFilterTab و syncQuickTabsUI و renderStudioNotesList', () => {
    assert(htmlContent.includes('function selectQuickFilterTab'), 'selectQuickFilterTab must exist');
    assert(htmlContent.includes('function syncQuickTabsUI'), 'syncQuickTabsUI must exist');
    assert(htmlContent.includes('function renderStudioNotesList'), 'renderStudioNotesList must exist');
});

it('تأكد من معالجة statusVal === "has_notes" داخل دالة getFilteredCandidates', () => {
    assert(htmlContent.includes("statusVal === 'has_notes'"), 'getFilteredCandidates must handle statusVal === has_notes');
});

it('محاكاة دقيقة لمنطق فرز وفلترة تبويب "لديهم ملاحظات" على عينات حقيقية', () => {
    function isCandidatePendingSpiritualOral(c) {
        if (!c || !c.attended) return false;
        const g3 = Number(c.g3) || 0;
        if (g3 > 0) return false;
        const g1 = Number(c.g1) || 0;
        const g2 = Number(c.g2) || 0;
        if (g1 <= 0 && g2 <= 0) return false;
        const spNotes = String(c.spiritualNotes || '').trim().toLowerCase();
        const prob = String(c.problemType || '').trim().toLowerCase();
        const conf = String(c.confessor || '').trim().toLowerCase();
        const hasConfIssue = (!conf || conf === 'لا يوجد' || conf === 'none' || conf === 'لم يحدد');
        return (spNotes.length > 0 || prob.includes('اعتراف') || prob.includes('شعر') || hasConfIssue);
    }

    function checkCandidateHasNotes(c) {
        const hasSp = !!(c.spiritualNotes && c.spiritualNotes.trim().length > 0);
        const hasPs = !!(c.psychNotes && c.psychNotes.trim().length > 0);
        const prob = String(c.problemType || '').trim();
        const hasProb = (prob && !prob.includes('لا توجد') && !prob.includes('طبيعي'));
        const isPendingSp = isCandidatePendingSpiritualOral(c);
        return hasSp || hasPs || hasProb || isPendingSp;
    }

    const testCandidates = [
        // 1. طالب لديه ملاحظة روحية (اعتراف ومظهر الشعر) مع شفوي معلق
        { code: '101', name: 'أبانوب رفعت', attended: true, g1: 22, g2: 20, g3: 0, spiritualNotes: 'اعتراف ومظهر الشعر' },
        // 2. طالب لديه ملاحظة نفسية فقط
        { code: '102', name: 'مينا مجدي', attended: true, g1: 20, g2: 20, g3: 20, psychNotes: 'يحتاج تشجيع في القيادة' },
        // 3. طالب لديه تصنيف مشكلة رعوية (مشكلة اعتراف)
        { code: '103', name: 'بيشوي عادل', attended: true, g1: 18, g2: 18, g3: 15, problemType: 'مشكلة اعتراف 🟡' },
        // 4. طالب نظيف تماماً بدون أي ملاحظات
        { code: '104', name: 'فادي سمير', attended: true, g1: 24, g2: 23, g3: 22, spiritualNotes: '', psychNotes: '', problemType: 'لا توجد مشاكل (طبيعي) 🟢', confessor: 'أبونا مرقس' },
        // 5. طالب غائب تماماً وبدون أي ملاحظة
        { code: '105', name: 'ديفيد أيمن', attended: false, g1: 0, g2: 0, g3: 0, spiritualNotes: '', psychNotes: '', problemType: 'طبيعي' }
    ];

    const notesGroup = testCandidates.filter(c => checkCandidateHasNotes(c));
    assert.strictEqual(notesGroup.length, 3, 'Exactly 3 candidates must have notes');
    assert.strictEqual(notesGroup.some(c => c.code === '101'), true, 'Candidate 101 must be in notes tab');
    assert.strictEqual(notesGroup.some(c => c.code === '102'), true, 'Candidate 102 must be in notes tab');
    assert.strictEqual(notesGroup.some(c => c.code === '103'), true, 'Candidate 103 must be in notes tab');
    assert.strictEqual(notesGroup.some(c => c.code === '104'), false, 'Candidate 104 has no notes');
    assert.strictEqual(notesGroup.some(c => c.code === '105'), false, 'Candidate 105 has no notes');
});

it('مزامنة شريط التبويبات السريعة عند تفريغ الفلاتر resetAllFilters', () => {
    assert(htmlContent.includes("syncQuickTabsUI('all')"), 'resetAllFilters must reset quick tabs UI to all');
});

it('تحديث switchStudioTab لدعم التبويب الخامس notes واستدعاء renderStudioNotesList', () => {
    assert(htmlContent.includes("notes: document.getElementById('paneStudioNotes')"), 'paneStudioNotes must be registered in switchStudioTab');
    assert(htmlContent.includes("renderStudioNotesList()"), 'renderStudioNotesList must be called when switching to notes tab');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للاختبارات: ${passedTests}/${totalTests} فحوصات نجحت بنسبة ${Math.round(passedTests/totalTests*100)}% ✅`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
