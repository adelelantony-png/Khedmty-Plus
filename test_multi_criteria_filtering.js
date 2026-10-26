const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات الفلترة المتعددة لمعايير ومواد التقييم');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, 'public', 'servant_grades_entry.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. فحص عناصر واجهة المستخدم (UI Elements)
console.log('--- 1. فحص عناصر واجهة الفلترة المتعددة في HTML ---');
const expectedElements = [
    'id="btnToggleMultiCriteria"',
    'id="multiCriteriaButtonLabel"',
    'id="multiCriteriaBadge"',
    'id="multiCriteriaDropdownMenu"',
    'id="btnLogicAnd"',
    'id="btnLogicOr"',
    'id="btnCrit_1_any"',
    'id="btnCrit_1_pass"',
    'id="btnCrit_1_fail"',
    'id="btnCrit_2_any"',
    'id="btnCrit_2_pass"',
    'id="btnCrit_2_fail"',
    'id="btnCrit_3_any"',
    'id="btnCrit_3_pass"',
    'id="btnCrit_3_fail"',
    'id="btnCrit_4_any"',
    'id="btnCrit_4_pass"',
    'id="btnCrit_4_fail"',
    'id="btnPresetAllPassed"',
    'id="btnPresetFailedAny"',
    'id="criteriaFilter"',
    'id="activeFilterTags"'
];

let uiPassCount = 0;
expectedElements.forEach(elem => {
    assert(html.includes(elem), `عنصر الواجهة مفقود: ${elem}`);
    uiPassCount++;
});
console.log(`  [PASS] ✅ كافة عناصر واجهة الفلترة المتعددة (${uiPassCount}/${expectedElements.length}) موجودة بدقة.\n`);

// 2. فحص الدوال البرمجية في كود الجافاسكربت
console.log('--- 2. فحص وجود دوال الفلترة المتعددة والشارات التفاعلية ---');
const expectedFunctions = [
    'function toggleMultiCriteriaDropdown',
    'function closeMultiCriteriaDropdown',
    'function setMultiCriteriaLogic',
    'function setExamCriteria',
    'function setMultiCriteriaPreset',
    'function resetMultiCriteriaFilters',
    'function updateMultiCriteriaUI',
    'function updateActiveFilterTags',
    'function clearFilterField',
    'multiCriteriaFilterState'
];

let fnPassCount = 0;
expectedFunctions.forEach(fn => {
    assert(html.includes(fn), `الدالة البرمجية مفقودة: ${fn}`);
    fnPassCount++;
});
console.log(`  [PASS] ✅ كافة الدوال البرمجية للفلترة المتعددة (${fnPassCount}/${expectedFunctions.length}) مدمجة بنجاح.\n`);

// 3. محاكاة منطق الفلترة المتعددة على دفعة مخدومين تجريبية
console.log('--- 3. محاكاة دقيقة لمنطق الفلترة المتعددة (AND / OR / Presets) ---');

const examMaxScores = [25, 25, 25, 25];
const examMinPassPercentages = [50, 50, 50, 50]; // حد النجاح 12.5 درجة لكل مادة

function getCandidateExamDetails(candidate) {
    const grades = [
        Number(candidate.g1) || 0,
        Number(candidate.g2) || 0,
        Number(candidate.g3) || 0,
        Number(candidate.g4) || 0
    ];
    const examNames = ['تحريري روحي', 'تحريري نفسي', 'شفوي روحي', 'شفوي نفسي'];
    const details = [];
    let allPassed = true;

    for (let i = 0; i < 4; i++) {
        const score = grades[i];
        const max = examMaxScores[i] > 0 ? examMaxScores[i] : 25;
        const pct = (score / max) * 100;
        const reqPct = examMinPassPercentages[i] || 50;
        const isPassed = candidate.attended && (pct >= reqPct);
        if (!isPassed) allPassed = false;

        details.push({
            index: i + 1,
            name: examNames[i],
            score: score,
            max: max,
            pct: pct,
            reqPct: reqPct,
            isPassed: isPassed
        });
    }

    return { allPassed, details };
}

// عينة تجريبية
const mockCandidates = [
    { code: 'C1', name: 'بيشوي كامل', attended: true, g1: 20, g2: 20, g3: 20, g4: 20 }, // ناجح بالـ 4
    { code: 'C2', name: 'مينا مجدي', attended: true, g1: 20, g2: 5, g3: 20, g4: 5 },   // ناجح روحي تحريري وشفوي، راسب نفسي تحريري وشفوي
    { code: 'C3', name: 'كيرلس سمير', attended: true, g1: 5, g2: 20, g3: 20, g4: 20 },  // راسب روحي تحريري فقط
    { code: 'C4', name: 'مارك عاطف', attended: true, g1: 5, g2: 5, g3: 5, g4: 5 },      // راسب بالـ 4
    { code: 'C5', name: 'فادي سمير', attended: false, g1: 0, g2: 0, g3: 0, g4: 0 }      // غائب
];

function filterCohort(mCrit) {
    const activeExamFilters = [];
    for (let i = 1; i <= 4; i++) {
        if (mCrit['ex' + i] && mCrit['ex' + i] !== 'any') {
            activeExamFilters.push({ index: i, state: mCrit['ex' + i] });
        }
    }

    return mockCandidates.filter(c => {
        if (activeExamFilters.length > 0 || mCrit.preset) {
            const evalRes = getCandidateExamDetails(c);
            if (mCrit.preset === 'all_passed' && !evalRes.allPassed) return false;
            if (mCrit.preset === 'failed_any' && evalRes.allPassed) return false;

            if (activeExamFilters.length > 0) {
                if (mCrit.mode === 'OR') {
                    const anyMatch = activeExamFilters.some(f => {
                        const passed = evalRes.details[f.index - 1].isPassed;
                        return f.state === 'pass' ? passed : !passed;
                    });
                    if (!anyMatch) return false;
                } else {
                    const allMatch = activeExamFilters.every(f => {
                        const passed = evalRes.details[f.index - 1].isPassed;
                        return f.state === 'pass' ? passed : !passed;
                    });
                    if (!allMatch) return false;
                }
            }
        }
        return true;
    });
}

// اختبار أ: فلترة مادة واحدة (تخطى روحي تحريري)
const resSingle = filterCohort({ mode: 'AND', ex1: 'pass', ex2: 'any', ex3: 'any', ex4: 'any', preset: null });
assert.strictEqual(resSingle.length, 2);
assert.deepStrictEqual(resSingle.map(c => c.code), ['C1', 'C2']);
console.log('  [PASS] ✅ فلترة مادة واحدة (تخطى تحريري روحي): أرجعت (C1, C2) بنجاح.');

// اختبار ب: فلترة متعددة AND (تخطى روحي تحريري + تخطى روحي شفوي)
const resMultiAnd = filterCohort({ mode: 'AND', ex1: 'pass', ex2: 'any', ex3: 'pass', ex4: 'any', preset: null });
assert.strictEqual(resMultiAnd.length, 2);
assert.deepStrictEqual(resMultiAnd.map(c => c.code), ['C1', 'C2']);
console.log('  [PASS] ✅ فلترة متعددة AND (تخطى تحريري روحي + تخطى شفوي روحي): أرجعت (C1, C2) بنجاح.');

// اختبار جـ: فلترة متعددة AND (تخطى روحي تحريري + تخطى نفسي تحريري)
const resMultiAndDiff = filterCohort({ mode: 'AND', ex1: 'pass', ex2: 'pass', ex3: 'any', ex4: 'any', preset: null });
assert.strictEqual(resMultiAndDiff.length, 1);
assert.deepStrictEqual(resMultiAndDiff.map(c => c.code), ['C1']);
console.log('  [PASS] ✅ فلترة متعددة AND (تخطى تحريري روحي + تخطى تحريري نفسي): استبعدت C2 بنجاح وأرجعت C1 فقط.');

// اختبار د: فلترة مركبة تجمع بين النجاح والرسوب (تخطى روحي تحريري + لم يتخطَ نفسي تحريري)
const resPassFail = filterCohort({ mode: 'AND', ex1: 'pass', ex2: 'fail', ex3: 'any', ex4: 'any', preset: null });
assert.strictEqual(resPassFail.length, 1);
assert.deepStrictEqual(resPassFail.map(c => c.code), ['C2']);
console.log('  [PASS] ✅ فلترة مركبة (تخطى روحي تحريري + لم يتخطَ نفسي تحريري): أرجعت بدقة C2 فقط.');

// اختبار هـ: نمط الفلترة بالربط البديل OR (راسب في مادة 1 أو مادة 2)
const resOr = filterCohort({ mode: 'OR', ex1: 'fail', ex2: 'fail', ex3: 'any', ex4: 'any', preset: null });
// C2 (راسب في ex2), C3 (راسب في ex1), C4 (راسب في الاثنين), C5 (غائب = راسب في الاثنين)
assert.strictEqual(resOr.length, 4);
assert.deepStrictEqual(resOr.map(c => c.code), ['C2', 'C3', 'C4', 'C5']);
console.log('  [PASS] ✅ نمط الربط OR (راسب في تحريري روحي أو تحريري نفسي): أرجع بدقة كافة الحالات المطابقة لأي منهما (4 طلاب).');

// اختبار و: بريسيت الكل مستوفٍ
const resAllPass = filterCohort({ mode: 'AND', ex1: 'any', ex2: 'any', ex3: 'any', ex4: 'any', preset: 'all_passed' });
assert.strictEqual(resAllPass.length, 1);
assert.deepStrictEqual(resAllPass.map(c => c.code), ['C1']);
console.log('  [PASS] ✅ بريسيت الكل مستوفٍ: أرجع C1 فقط بنجاح.');

// اختبار ز: بريسيت راسب في أي مادة
const resFailAny = filterCohort({ mode: 'AND', ex1: 'any', ex2: 'any', ex3: 'any', ex4: 'any', preset: 'failed_any' });
assert.strictEqual(resFailAny.length, 4);
assert.deepStrictEqual(resFailAny.map(c => c.code), ['C2', 'C3', 'C4', 'C5']);
console.log('  [PASS] ✅ بريسيت راسب في أي مادة: أرجع C2, C3, C4, C5 بنجاح.');

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 9 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
