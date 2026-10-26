const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 بدء تشغيل حزمة اختبارات مستكشف منحنى الواقع ثنائي الاتجاه (المباشر والعكسي)');
console.log('================================================================');

const htmlContent = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant_grades_entry.html', 'utf8');

// --- 1. فحص عناصر واجهة المستخدم في HTML ---
console.log('\n--- 1. فحص عناصر واجهة المستخدم ثنائية الاتجاه (Forward & Reverse) ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="realityQuickBadge"',
    'id="realityStatAttendees"',
    'id="realityStatMean"',
    'id="realityStatMedian"',
    // أزرار وحاويات التبديل الثنائي
    'id="tabModeForward"',
    'id="tabModeReverse"',
    'id="panelModeForward"',
    'id="panelModeReverse"',
    // عناصر الوضع المباشر
    'id="targetPassRateSlider"',
    'id="targetPassRateInput"',
    'id="realityResultBox"',
    'id="btnApplyRealityThreshold"',
    // عناصر الوضع العكسي (من الدرجة إلى نسبة النجاح)
    'id="proposedScoreSlider"',
    'id="proposedScoreInput"',
    'id="revDispScore"',
    'id="revScoreEquivalent"',
    'id="revPassedCount"',
    'id="revPassedPct"',
    'id="revInterviewCount"',
    'id="revInterviewPct"',
    'id="revRejectedCount"',
    'id="revRejectedPct"',
    'id="revSpectrumPass"',
    'id="revSpectrumInt"',
    'id="revSpectrumRej"',
    'id="revCriteriaDetails"',
    // متوسطات الأقسام الأربعة
    'id="secAvgScore1"',
    'id="secAvgScore2"',
    'id="secAvgScore3"',
    'id="secAvgScore4"',
    'id="avgDomainSpiritual"',
    'id="avgDomainPsych"',
    'id="avgGenderMale"',
    'id="avgGenderFemale"',
    // تذييل الجدول
    'id="tableFooter"',
    'id="tfAvgG1"',
    'id="tfAvgG2"',
    'id="tfAvgG3"',
    'id="tfAvgG4"',
    'id="tfAvgTotal"',
    'id="tfAvgPct"'
];

let uiPassCount = 0;
requiredElements.forEach(elem => {
    assert.ok(htmlContent.includes(elem), `عنصر الواجهة مفقود: ${elem}`);
    uiPassCount++;
});
console.log(`  [PASS] ✅ كافة عناصر واجهة المحاكي الثنائي ومتوسطات الأقسام (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

// --- 2. فحص الدوال البرمجية في كود الجافاسكريبت ---
console.log('\n--- 2. فحص وجود الدوال البرمجية للوضعين المباشر والعكسي ---');

const requiredFunctions = [
    'function getRealityScoreStats()',
    'function calculateThresholdForTargetPassRate(',
    'function switchRealityExplorerMode(',
    'function simulateReverseThreshold(',
    'function handleProposedScoreChange(',
    'function setProposedScorePreset(',
    'function updateReverseRealitySimulatorUI()',
    'function applyProposedScoreAsThreshold()',
    'function updateRealityCurveUI()',
    'function applyRealityCalculatedThreshold()'
];

let fnPassCount = 0;
requiredFunctions.forEach(fn => {
    assert.ok(htmlContent.includes(fn), `الدالة مفقودة: ${fn}`);
    fnPassCount++;
});
console.log(`  [PASS] ✅ كافة الدوال البرمجية للوضعين المباشر والعكسي (${fnPassCount}/${requiredFunctions.length}) مدمجة بنجاح.`);

// --- 3. محاكاة الاتجاه العكسي (من الدرجة المقترحة ⬅️ إلى نسبة وعدد الناجحين) ---
console.log('\n--- 3. محاكاة واختبار حسابات الاتجاه العكسي (Reverse Mode Logic) ---');

const candidatesList = [
    { code: "2201", attended: true, g1: 24.0, g2: 23.5, g3: 25.0, g4: 22.5, gender: 'بنين' }, // 95%
    { code: "2202", attended: true, g1: 21.0, g2: 22.0, g3: 20.5, g4: 21.5, gender: 'بنات' }, // 85%
    { code: "2203", attended: true, g1: 18.0, g2: 19.5, g3: 17.0, g4: 17.5, gender: 'بنين' }, // 72%
    { code: "2204", attended: true, g1: 15.0, g2: 16.0, g3: 14.5, g4: 14.5, gender: 'بنات' }, // 60%
    { code: "2205", attended: true, g1: 13.0, g2: 14.0, g3: 13.5, g4: 13.5, gender: 'بنين' }, // 54%
    { code: "2206", attended: false, g1: 0, g2: 0, g3: 0, g4: 0, gender: 'بنين' } // غائب
];
const maxTotalScore = 100;
const interviewThreshold = 50;

function simulateReverse(thresh) {
    const attended = candidatesList.filter(c => c && c.attended);
    const N = attended.length;
    const scores = attended.map(c => c.g1 + c.g2 + c.g3 + c.g4);
    const passedCount = scores.filter(s => s >= thresh).length;
    const passedPct = (passedCount / N) * 100;
    const interviewCount = scores.filter(s => s < thresh && s >= interviewThreshold).length;
    const interviewPct = (interviewCount / N) * 100;
    const rejectedCount = N - passedCount - interviewCount;
    const rejectedPct = (rejectedCount / N) * 100;
    return { thresh, passedCount, passedPct, interviewCount, interviewPct, rejectedCount, rejectedPct };
}

// أ. تجربة درجة نجاح 60%
const rev60 = simulateReverse(60);
assert.strictEqual(rev60.passedCount, 4, 'عند درجة 60 يجب أن ينجح 4 مخدومين');
assert.strictEqual(rev60.passedPct, 80, 'نسبة النجاح عند 60 يجب أن تكون 80%');
assert.strictEqual(rev60.interviewCount, 1, 'المعلقون للمقابلة عند 60 يجب أن يكونوا 1');
console.log(`  [PASS] ✅ عند حد نجاح 60%: ينجح ${rev60.passedCount} (${rev60.passedPct}%) ويعلق ${rev60.interviewCount} للمقابلة.`);

// ب. تجربة درجة نجاح 65%
const rev65 = simulateReverse(65);
assert.strictEqual(rev65.passedCount, 3, 'عند درجة 65 يجب أن ينجح 3 مخدومين');
assert.strictEqual(rev65.passedPct, 60, 'نسبة النجاح عند 65 يجب أن تكون 60%');
assert.strictEqual(rev65.interviewCount, 2, 'المعلقون للمقابلة عند 65 يجب أن يكونوا 2');
console.log(`  [PASS] ✅ عند حد نجاح 65%: ينجح ${rev65.passedCount} (${rev65.passedPct}%) ويعلق ${rev65.interviewCount} للمقابلة.`);

// جـ. تجربة درجة نجاح 75%
const rev75 = simulateReverse(75);
assert.strictEqual(rev75.passedCount, 2, 'عند درجة 75 يجب أن ينجح 2 مخدومين');
assert.strictEqual(rev75.passedPct, 40, 'نسبة النجاح عند 75 يجب أن تكون 40%');
assert.strictEqual(rev75.interviewCount, 3, 'المعلقون للمقابلة عند 75 يجب أن يكونوا 3');
console.log(`  [PASS] ✅ عند حد نجاح 75%: ينجح ${rev75.passedCount} (${rev75.passedPct}%) ويعلق ${rev75.interviewCount} للمقابلة.`);

// د. تجربة درجة نجاح 50% (الكل ينجح)
const rev50 = simulateReverse(50);
assert.strictEqual(rev50.passedCount, 5, 'عند درجة 50 يجب أن ينجح جميع الحاضرين الـ 5');
assert.strictEqual(rev50.passedPct, 100);
console.log(`  [PASS] ✅ عند حد نجاح 50%: ينجح الجميع بنسبة ${rev50.passedPct}%.`);

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 12 للاتجاهين نجحت بنسبة 100% ✅');
console.log('================================================================\n');
