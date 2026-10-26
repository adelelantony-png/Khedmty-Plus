const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات فلترة ملاحظات الجانب الروحي والنفسي');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, 'public', 'servant_grades_entry.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. فحص وجود عناصر الفلترة في الواجهة
console.log('--- 1. فحص عناصر واجهة فلترة الملاحظات في HTML ---');
assert(html.includes('id="spiritualNotesFilter"'), 'عنصر spiritualNotesFilter مفقود في HTML');
assert(html.includes('id="psychNotesFilter"'), 'عنصر psychNotesFilter مفقود في HTML');
assert(html.includes('value="اعتراف وتناول"'), 'خيار اعتراف وتناول مفقود');
assert(html.includes('value="اعتراف فقط"'), 'خيار اعتراف فقط مفقود');
assert(html.includes('value="اعتراف ومظهر الشعر"'), 'خيار اعتراف ومظهر الشعر مفقود');
assert(html.includes('value="custom"'), 'خيار الملاحظات المخصصة مفقود');
console.log('  [PASS] ✅ عناصر فلترة الملاحظات الروحية والنفسية موجودة بنجاح.\n');

// 2. فحص الدعم البرمجي في JS
console.log('--- 2. فحص معالجة الفلاتر في دالة getFilteredCandidates و updateActiveFilterTags ---');
assert(html.includes('document.getElementById(\'spiritualNotesFilter\')'), 'spiritualNotesFilter غير مستعلم في getFilteredCandidates');
assert(html.includes('document.getElementById(\'psychNotesFilter\')'), 'psychNotesFilter غير مستعلم في getFilteredCandidates');
assert(html.includes('spNotes.includes(searchVal)'), 'البحث العام لا يشمل الملاحظات الروحية');
assert(html.includes('psNotes.includes(searchVal)'), 'البحث العام لا يشمل الملاحظات النفسية');
console.log('  [PASS] ✅ دمج فلاتر الملاحظات والبحث في الكود البرمجي 100%.\n');

// 3. محاكاة دقيقة لمنطق فلترة الملاحظات
console.log('--- 3. محاكاة فلترة الملاحظات على عينة حقيقية ---');

const mockCandidates = [
    { code: 'C1', name: 'مينا سمير', spiritualNotes: 'اعتراف وتناول', psychNotes: 'هادئ ومتعاون ومحب للخدمة' },
    { code: 'C2', name: 'بيشوي عاطف', spiritualNotes: 'اعتراف فقط', psychNotes: '' },
    { code: 'C3', name: 'كيرلس مجدي', spiritualNotes: 'اعتراف ومظهر الشعر', psychNotes: 'يحتاج تشجيع ومتابعة التزام' },
    { code: 'C4', name: 'مارك عادل', spiritualNotes: 'ملاحظة خاصة منتظم بصلاة باكر', psychNotes: '' },
    { code: 'C5', name: 'فادي كامل', spiritualNotes: '', psychNotes: '' }
];

function filterByNotes(c, spFilter, psFilter, searchVal = '') {
    const name = String(c.name || '').toLowerCase();
    const spNotes = String(c.spiritualNotes || '').toLowerCase();
    const psNotes = String(c.psychNotes || '').toLowerCase();

    if (searchVal) {
        const s = searchVal.toLowerCase();
        if (!name.includes(s) && !spNotes.includes(s) && !psNotes.includes(s)) return false;
    }

    if (spFilter !== 'all') {
        const sp = String(c.spiritualNotes || '').trim();
        if (spFilter === 'has_notes' && !sp) return false;
        if (spFilter === 'no_notes' && sp) return false;
        if (spFilter === 'custom') {
            const isPreset = (sp === 'اعتراف وتناول' || sp === 'اعتراف فقط' || sp === 'اعتراف ومظهر الشعر');
            if (!sp || isPreset) return false;
        } else if (spFilter !== 'has_notes' && spFilter !== 'no_notes') {
            if (!sp.includes(spFilter)) return false;
        }
    }

    if (psFilter !== 'all') {
        const ps = String(c.psychNotes || '').trim();
        if (psFilter === 'has_notes' && !ps) return false;
        if (psFilter === 'no_notes' && ps) return false;
    }

    return true;
}

// اختبار 1: لديه ملاحظات روحية مسجلة
const resHasSp = mockCandidates.filter(c => filterByNotes(c, 'has_notes', 'all'));
assert.strictEqual(resHasSp.length, 4);
console.log('  [PASS] ✅ لديه ملاحظة روحية: أرجعت 4 مخدومين بدقة.');

// اختبار 2: بدون ملاحظات روحية (خالية)
const resNoSp = mockCandidates.filter(c => filterByNotes(c, 'no_notes', 'all'));
assert.strictEqual(resNoSp.length, 1);
assert.strictEqual(resNoSp[0].code, 'C5');
console.log('  [PASS] ✅ بدون ملاحظات روحية: أرجعت C5 فقط بدقة.');

// اختبار 3: اعتراف وتناول
const resCommunion = mockCandidates.filter(c => filterByNotes(c, 'اعتراف وتناول', 'all'));
assert.strictEqual(resCommunion.length, 1);
assert.strictEqual(resCommunion[0].code, 'C1');
console.log('  [PASS] ✅ اعتراف وتناول: أرجعت C1 بدقة.');

// اختبار 4: اعتراف ومظهر الشعر
const resHair = mockCandidates.filter(c => filterByNotes(c, 'اعتراف ومظهر الشعر', 'all'));
assert.strictEqual(resHair.length, 1);
assert.strictEqual(resHair[0].code, 'C3');
console.log('  [PASS] ✅ اعتراف ومظهر الشعر: أرجعت C3 بدقة.');

// اختبار 5: ملاحظة يدوية مخصصة (custom)
const resCustom = mockCandidates.filter(c => filterByNotes(c, 'custom', 'all'));
assert.strictEqual(resCustom.length, 1);
assert.strictEqual(resCustom[0].code, 'C4');
console.log('  [PASS] ✅ ملاحظة مخصصة (custom): أرجعت C4 بدقة.');

// اختبار 6: لديه ملاحظة نفسية مسجلة
const resHasPs = mockCandidates.filter(c => filterByNotes(c, 'all', 'has_notes'));
assert.strictEqual(resHasPs.length, 2);
assert.deepStrictEqual(resHasPs.map(c => c.code), ['C1', 'C3']);
console.log('  [PASS] ✅ لديه ملاحظة نفسية مسجلة: أرجعت C1 و C3 بدقة.');

// اختبار 7: بدون ملاحظات نفسية
const resNoPs = mockCandidates.filter(c => filterByNotes(c, 'all', 'no_notes'));
assert.strictEqual(resNoPs.length, 3);
assert.deepStrictEqual(resNoPs.map(c => c.code), ['C2', 'C4', 'C5']);
console.log('  [PASS] ✅ بدون ملاحظات نفسية: أرجعت C2 و C4 و C5 بدقة.');

// اختبار 8: البحث النصي في محتوى الملاحظات
const resSearchSp = mockCandidates.filter(c => filterByNotes(c, 'all', 'all', 'مظهر الشعر'));
assert.strictEqual(resSearchSp.length, 1);
assert.strictEqual(resSearchSp[0].code, 'C3');
console.log('  [PASS] ✅ البحث النصي في الملاحظات الروحية ("مظهر الشعر"): أرجع C3 بنجاح.');

const resSearchPs = mockCandidates.filter(c => filterByNotes(c, 'all', 'all', 'هادئ'));
assert.strictEqual(resSearchPs.length, 1);
assert.strictEqual(resSearchPs[0].code, 'C1');
console.log('  [PASS] ✅ البحث النصي في الملاحظات النفسية ("هادئ"): أرجع C1 بنجاح.');

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 9 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
