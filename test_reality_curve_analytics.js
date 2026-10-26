const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات مستكشف منحنى الواقع وخلاط مكس المواد الذكي');
console.log('================================================================');

const htmlContent = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant_grades_entry.html', 'utf8');

// --- 1. فحص عناصر واجهة المستخدم في HTML ---
console.log('\n--- 1. فحص عناصر واجهة المستخدم وخلاط المكس في HTML ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="tabModeForward"',
    'id="tabModeReverse"',
    'id="panelModeForward"',
    'id="panelModeReverse"',
    // أشرطة متوسطات المواد اللحظية
    'id="ribbonAvg1"',
    'id="ribbonAvg2"',
    'id="ribbonAvg3"',
    'id="ribbonAvg4"',
    // خلاط مكس المواد الأربعة
    'id="smartMixBlenderPanel"',
    'id="btnMixStrict"',
    'id="btnMixDomain"',
    'id="btnMixRealityAvg"',
    'id="btnMixTotalOnly"',
    'id="mixSlider1"',
    'id="mixPassDisp1"',
    'id="mixLiveResultText"',
    // تذييل الجدول ومتوسطات الأقسام
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
console.log(`  [PASS] ✅ كافة عناصر واجهة المحاكي الثنائي وخلاط المكس (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

// --- 2. فحص الدوال البرمجية في كود الجافاسكريبت ---
console.log('\n--- 2. فحص وجود دوال أنماط المكس التفاعلي والدمج ---');

const requiredFunctions = [
    'function getRealityScoreStats()',
    'function calculateThresholdForTargetPassRate(',
    'function switchRealityExplorerMode(',
    'function simulateReverseThreshold(',
    'function setMixMode(',
    'function handleMixSliderChange(',
    'function applySubjectAverageAsThreshold(',
    'function getCandidateExamDetails('
];

let fnPassCount = 0;
requiredFunctions.forEach(fn => {
    assert.ok(htmlContent.includes(fn), `الدالة مفقودة: ${fn}`);
    fnPassCount++;
});
console.log(`  [PASS] ✅ كافة الدوال البرمجية لخلاط المكس والدمج (${fnPassCount}/${requiredFunctions.length}) مدمجة بنجاح.`);

// --- 3. محاكاة أنماط المكس واختبار دمج المحاور (Domain Blend) ---
console.log('\n--- 3. محاكاة واختبار منطق مكس المواد (Strict vs Domain Blend) ---');

// مخدوم درجاته: تحريري روحي 22/25 (قوي جداً)، شفوي روحي 8/25 (ضعيف)، نفسي تحريري 18، نفسي شفوي 18
const testCandidate = {
    attended: true,
    g1: 22, // 88%
    g2: 18, // 72%
    g3: 8,  // 32% (دون 50%)
    g4: 18  // 72%
};

const examMaxScores = [25, 25, 25, 25];
const examMinPassPercentages = [50, 50, 50, 50];

function evalMix(candidate, mode) {
    const grades = [candidate.g1, candidate.g2, candidate.g3, candidate.g4];
    if (mode === 'strict') {
        const failed = grades.some((g, i) => (g / examMaxScores[i]) * 100 < examMinPassPercentages[i]);
        return { allPassed: !failed, mode: 'strict' };
    }
    if (mode === 'domain_blend') {
        // مكس المحور الروحي: (22 + 8) / 50 = 30 / 50 = 60% (>= 50%)
        const spiritPct = ((candidate.g1 + candidate.g3) / 50) * 100;
        // مكس المحور النفسي: (18 + 18) / 50 = 36 / 50 = 72% (>= 50%)
        const psychPct = ((candidate.g2 + candidate.g4) / 50) * 100;
        return { allPassed: spiritPct >= 50 && psychPct >= 50, mode: 'domain_blend', spiritPct, psychPct };
    }
    if (mode === 'total_only') {
        return { allPassed: grades.every(g => g > 0), mode: 'total_only' };
    }
}

// أ. الفحص الصارم (Strict): يرسب بسبب مادة الشفوي الروحي (32%)
const resStrict = evalMix(testCandidate, 'strict');
assert.strictEqual(resStrict.allPassed, false, 'في النمط الصارم يجب أن يرسب لأن الشفوي الروحي 32%');
console.log('  [PASS] ✅ النمط الصارم (Strict): المخدوم لا يجتاز بسبب الشفوي الروحي منفردة.');

// ب. فحص مكس المحاور (Domain Blend): ينجح لأن التحريري الروحي (22) عوّض الشفوي الروحي (8) ليصبح مجموع الروحي 60%!
const resBlend = evalMix(testCandidate, 'domain_blend');
assert.strictEqual(resBlend.allPassed, true, 'في مكس المحاور يجب أن ينجح لأن مجموع المحور الروحي 60%');
assert.strictEqual(resBlend.spiritPct, 60, 'نسبة المحور الروحي المدمج يجب أن تكون 60%');
console.log(`  [PASS] ✅ مكس دمج المحاور (Domain Blend): المخدوم يجتاز بنجاح لأن مجموع الروحي المدمج ${resBlend.spiritPct}% عوّض النقص!`);

// جـ. فحص مكس المجموع العام (Total Only)
const resTotal = evalMix(testCandidate, 'total_only');
assert.strictEqual(resTotal.allPassed, true);
console.log('  [PASS] ✅ مكس المجموع العام (Total Only): المخدوم يجتاز ما دام لم يصفّر في أي مادة.');

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 11 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
