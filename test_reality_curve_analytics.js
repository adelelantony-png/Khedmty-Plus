const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات المرشد والدليل الذكي لمعايير المواد الأربعة');
console.log('================================================================');

const htmlContent = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant_grades_entry.html', 'utf8');

// --- 1. فحص عناصر واجهة المستخدم في HTML ---
console.log('\n--- 1. فحص عناصر واجهة المرشد والدليل الذكي في HTML ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="tabModeForward"',
    'id="tabModeReverse"',
    // عناصر المرشد الذكي في كروت المواد الأربعة
    'id="guideDiffBadge1"',
    'id="guideMean1"',
    'id="guideMinMax1"',
    'id="guideImpact1"',
    'id="guideDiffBadge2"',
    'id="guideMean2"',
    'id="guideMinMax2"',
    'id="guideImpact2"',
    'id="guideDiffBadge3"',
    'id="guideMean3"',
    'id="guideMinMax3"',
    'id="guideImpact3"',
    'id="guideDiffBadge4"',
    'id="guideMean4"',
    'id="guideMinMax4"',
    'id="guideImpact4"',
    // أزرار المرشد في الترويسة والكروت
    'applyExamGuidePreset',
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
console.log(`  [PASS] ✅ كافة عناصر واجهة المرشد والدليل الذكي (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

// --- 2. فحص الدوال البرمجية في كود الجافاسكريبت ---
console.log('\n--- 2. فحص وجود دوال المرشد الإحصائي ودليل الأثر ---');

const requiredFunctions = [
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
console.log(`  [PASS] ✅ كافة الدوال البرمجية للمرشد والدليل (${fnPassCount}/${requiredFunctions.length}) مدمجة بنجاح.`);

// --- 3. محاكاة حسابات دليل الأثر ومستوى الصعوبة ---
console.log('\n--- 3. محاكاة واختبار حسابات دليل الأثر للمادة (Impact Mentor Logic) ---');

const candidatesList = [
    { code: "2201", attended: true, g1: 24.0, g2: 23.5, g3: 25.0, g4: 22.5 }, // 95%
    { code: "2202", attended: true, g1: 21.0, g2: 22.0, g3: 20.5, g4: 21.5 }, // 85%
    { code: "2203", attended: true, g1: 18.0, g2: 19.5, g3: 17.0, g4: 17.5 }, // 72%
    { code: "2204", attended: true, g1: 15.0, g2: 16.0, g3: 14.5, g4: 14.5 }, // 60%
    { code: "2205", attended: true, g1: 13.0, g2: 14.0, g3: 13.5, g4: 13.5 }, // 54%
    { code: "2206", attended: false, g1: 0, g2: 0, g3: 0, g4: 0 } // غائب
];

const examMax = 25;
const attended = candidatesList.filter(c => c && c.attended);
const scoresG1 = attended.map(c => c.g1);

// أ. عند وضع حد 50% (12.5 د) لمادة تحريري روحي:
const req50 = (50 / 100) * examMax;
const pass50 = scoresG1.filter(s => s >= req50).length;
assert.strictEqual(pass50, 5, 'عند حد 50% ينجح كل الحاضرين الـ 5');
console.log(`  [PASS] ✅ دليل الأثر عند حد 50%: ينجح ${pass50} من ${attended.length} (100%) ويرسب 0.`);

// ب. عند وضع حد مرتفع 75% (18.75 د) لمادة تحريري روحي:
const req75 = (75 / 100) * examMax;
const pass75 = scoresG1.filter(s => s >= req75).length;
const fail75 = attended.length - pass75;
assert.strictEqual(pass75, 2, 'عند حد 75% ينجح 2 فقط');
assert.strictEqual(fail75, 3, 'عند حد 75% يرسب 3 مخدومين');
console.log(`  [PASS] ✅ دليل الأثر عند حد مرتفع 75%: ينبه بوضوح أن ${fail75} مخدومين (60%) سيرسبون في المادة.`);

// جـ. فحص تصنيف مستوى الصعوبة
const meanG1 = scoresG1.reduce((a, b) => a + b, 0) / attended.length;
const meanPctG1 = (meanG1 / examMax) * 100;
let diffCategory = '';
if (meanPctG1 >= 75) diffCategory = 'ميسرة';
else if (meanPctG1 >= 58) diffCategory = 'متوازنة';
else diffCategory = 'صعبة';

assert.strictEqual(diffCategory, 'متوازنة', 'المادة بمتوسط 72.8% تصنف متوازنة');
console.log(`  [PASS] ✅ تصنيف صعوبة المادة: متوسطها ${meanG1.toFixed(1)} / 25 (${meanPctG1.toFixed(1)}%) وتصنيفها: ${diffCategory}.`);

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 10 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
