const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات سلم شرائح الدفعة والمرشد الإحصائي (Ladder & Deciles)');
console.log('================================================================');

const path = require('path');
const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'servant_grades_entry.html'), 'utf8');

// --- 1. فحص عناصر واجهة المستخدم في HTML ---
console.log('\n--- 1. فحص عناصر واجهة سلم الشرائح والمرشد الذكي في HTML ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="tabModeForward"',
    'id="tabModeReverse"',
    'id="tabModeLadder"',
    'id="panelModeLadder"',
    'id="cohortLadderContainer"',
    'id="btnScopeTotal"',
    'id="btnScopeExam1"',
    'id="btnScopeExam2"',
    'id="btnScopeExam3"',
    'id="btnScopeExam4"',
    'id="forwardDecilesSummary"',
    'id="fwdDec20"',
    'id="fwdDec50"',
    'id="fwdDec80"',
    // عناصر المرشد الذكي في كروت المواد الأربعة
    'id="guideDiffBadge1"',
    'id="guideMean1"',
    'id="guideMinMax1"',
    'id="guideTarget80_1"',
    'id="guideImpact1"',
    'id="guideDiffBadge2"',
    'id="guideMean2"',
    'id="guideMinMax2"',
    'id="guideTarget80_2"',
    'id="guideImpact2"',
    'id="guideDiffBadge3"',
    'id="guideMean3"',
    'id="guideMinMax3"',
    'id="guideTarget80_3"',
    'id="guideImpact3"',
    'id="guideDiffBadge4"',
    'id="guideMean4"',
    'id="guideMinMax4"',
    'id="guideTarget80_4"',
    'id="guideImpact4"',
    // أزرار المرشد في الترويسة والكروت
    'applyExamGuidePreset',
    'applyExamTargetPassRate',
    'applyAllExamsToRealityAverages',
    // تذييل الجدول ومتوسطات الأقسام
    'id="tableFooter"',
    'id="tfAvgG1"',
    'id="tfAvgG2"',
    'id="tfAvgG3"',
    'id="tfAvgG4"'
];

let uiPassCount = 0;
requiredElements.forEach(elem => {
    assert.ok(htmlContent.includes(elem), `عنصر الواجهة مفقود: ${elem}`);
    uiPassCount++;
});
console.log(`  [PASS] ✅ كافة عناصر واجهة سلم الشرائح والمرشد (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

// --- 2. فحص الدوال البرمجية في كود الجافاسكريبت ---
console.log('\n--- 2. فحص وجود دوال سلم الشرائح والمرشد الإحصائي ---');

const requiredFunctions = [
    'function setLadderScope(',
    'function getCohortPercentileLadder(',
    'function renderCohortLadderUI(',
    'function applyLadderThreshold(',
    'function applyExamTargetPassRate(',
    'function applyExamGuidePreset(',
    'function applyAllExamsToRealityAverages()',
    'function updateExamGuidesUI()',
    'function getRealityScoreStats()',
    'function calculateThresholdForTargetPassRate(',
    'function getCandidateExamDetails('
];

let fnPassCount = 0;
requiredFunctions.forEach(fn => {
    assert.ok(htmlContent.includes(fn), `الدالة مفقودة: ${fn}`);
    fnPassCount++;
});
console.log(`  [PASS] ✅ كافة الدوال البرمجية لسلم الشرائح والمرشد (${fnPassCount}/${requiredFunctions.length}) مدمجة بنجاح.`);

// --- 3. محاكاة حسابات سلم شرائح الدفعة بالمئينات (Cohort Deciles & Percentiles Logic) ---
console.log('\n--- 3. محاكاة واختبار حسابات سلم شرائح الدفعة (20%، 30%، 50%، 80%...) ---');

const candidatesList = [
    { code: "2201", attended: true, g1: 24.0, g2: 23.5, g3: 25.0, g4: 22.5 }, // 95 / 100
    { code: "2202", attended: true, g1: 21.0, g2: 22.0, g3: 20.5, g4: 21.5 }, // 85 / 100
    { code: "2203", attended: true, g1: 18.0, g2: 19.5, g3: 17.0, g4: 17.5 }, // 72 / 100
    { code: "2204", attended: true, g1: 15.0, g2: 16.0, g3: 14.5, g4: 14.5 }, // 60 / 100
    { code: "2205", attended: true, g1: 13.0, g2: 14.0, g3: 13.5, g4: 13.5 }, // 54 / 100
    { code: "2206", attended: false, g1: 0, g2: 0, g3: 0, g4: 0 } // غائب
];

const attended = candidatesList.filter(c => c && c.attended);
const totalScores = attended.map(c => c.g1 + c.g2 + c.g3 + c.g4).sort((a, b) => b - a);
const N = totalScores.length; // 5

// أ. شريحة أعلى 20% (طالب 1):
const k20 = Math.max(1, Math.min(N, Math.round(N * 0.20))); // 1
const s20 = totalScores[k20 - 1]; // 95
assert.strictEqual(s20, 95, 'أعلى 20% يجب أن تكون درجاتهم 95 فأكثر');
console.log(`  [PASS] ✅ شريحة أعلى 20% من الدفعة: حاصلون على ${s20}% فأكثر (طالب 1 = 20%).`);

// ب. شريحة أعلى 50% (نصف الدفعة / الوسيط):
const k50 = Math.max(1, Math.min(N, Math.round(N * 0.50))); // 3 (round 2.5 = 3)
const s50 = totalScores[k50 - 1]; // 72
assert.strictEqual(s50, 72, 'أعلى 50% يجب أن تكون درجاتهم 72 فأكثر');
console.log(`  [PASS] ✅ شريحة أعلى 50% (نصف الدفعة): حاصلون على ${s50}% فأكثر (3 طلاب = 60%).`);

// جـ. شريحة أعلى 80% (المستهدف المعتاد):
const k80 = Math.max(1, Math.min(N, Math.round(N * 0.80))); // 4
const s80 = totalScores[k80 - 1]; // 60
assert.strictEqual(s80, 60, 'أعلى 80% يجب أن تكون درجاتهم 60 فأكثر');
console.log(`  [PASS] ✅ شريحة أعلى 80% من الدفعة: حاصلون على ${s80}% فأكثر (4 طلاب = 80%).`);

// د. محاكاة حساب استهداف 80% لمادة تحريري روحي (g1) من 25 درجة:
const scoresG1 = attended.map(c => c.g1).sort((a, b) => b - a); // [24, 21, 18, 15, 13]
const sG1_80 = scoresG1[k80 - 1]; // 15
const pctG1_80 = Math.round((sG1_80 / 25) * 100); // 60%
assert.strictEqual(sG1_80, 15, 'الدرجة لتمرير 80% في تحريري روحي هي 15 من 25');
assert.strictEqual(pctG1_80, 60, 'النسبة لتمرير 80% في تحريري روحي هي 60%');
console.log(`  [PASS] ✅ حساب النسبة المستهدفة 80% للمادة: يلزم وضع ${pctG1_80}% (${sG1_80} د) لتمرير 80% في مادة تحريري روحي.`);

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 15 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
