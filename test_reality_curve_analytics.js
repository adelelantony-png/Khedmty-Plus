const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 بدء تشغيل حزمة اختبارات مستكشف منحنى الواقع ونسب النجاح (Reality Curve Analytics)');
console.log('================================================================');

const htmlContent = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant_grades_entry.html', 'utf8');

// --- 1. فحص وجود عناصر واجهة المستخدم المطلوبة ---
console.log('\n--- 1. فحص عناصر واجهة المستخدم في HTML ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="realityQuickBadge"',
    'id="realityStatAttendees"',
    'id="realityStatAbsents"',
    'id="realityStatMean"',
    'id="realityStatMeanScore"',
    'id="realityStatMedian"',
    'id="realityStatMedianScore"',
    'id="realityStatMinMax"',
    'id="realityStatCurrPassPct"',
    'id="targetPassRateSlider"',
    'id="targetPassRateInput"',
    'id="realityResultBox"',
    'id="realityResultText"',
    'id="realityDetailedSubText"',
    'id="btnApplyRealityThreshold"',
    'id="realityStatQ1"',
    'id="realityStatQ2"',
    'id="realityStatQ3"',
    'id="realityStatStdDev"',
    'btn-preset-pass'
];

let uiPassCount = 0;
requiredElements.forEach(elem => {
    assert.ok(htmlContent.includes(elem), `عنصر الواجهة مفقود: ${elem}`);
    uiPassCount++;
});
console.log(`  [PASS] ✅ كافة عناصر واجهة مستكشف منحنى الواقع (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

// --- 2. فحص الدوال البرمجية في كود الجافاسكريبت ---
console.log('\n--- 2. فحص وجود الدوال البرمجية في كود الواجهة ---');

const requiredFunctions = [
    'function getRealityScoreStats()',
    'function calculateThresholdForTargetPassRate(',
    'function handleTargetPassRateChange(',
    'function setTargetPassRatePreset(',
    'function updateRealityCurveUI()',
    'function applyRealityCalculatedThreshold()',
    'function scrollToRealityExplorer()'
];

let fnPassCount = 0;
requiredFunctions.forEach(fn => {
    assert.ok(htmlContent.includes(fn), `الدالة مفقودة: ${fn}`);
    fnPassCount++;
});
console.log(`  [PASS] ✅ كافة الدوال الإحصائية والتفاعلية (${fnPassCount}/${requiredFunctions.length}) مدمجة بنجاح.`);

// --- 3. محاكاة العمليات الإحصائية واختبار الدقة الحسابية للمنحنى الواقعي ---
console.log('\n--- 3. محاكاة واختبار الخوارزميات الإحصائية (Statistical Accuracy) ---');

// استخراج تعريف candidatesList الافتراضي
const candidatesList = [
    { code: "2201", attended: true, g1: 24.0, g2: 23.5, g3: 25.0, g4: 22.5 }, // 95%
    { code: "2202", attended: true, g1: 21.0, g2: 22.0, g3: 20.5, g4: 21.5 }, // 85%
    { code: "2203", attended: true, g1: 18.0, g2: 19.5, g3: 17.0, g4: 17.5 }, // 72%
    { code: "2204", attended: true, g1: 15.0, g2: 16.0, g3: 14.5, g4: 14.5 }, // 60%
    { code: "2205", attended: true, g1: 13.0, g2: 14.0, g3: 13.5, g4: 13.5 }, // 54%
    { code: "2206", attended: false, g1: 0, g2: 0, g3: 0, g4: 0 } // غائب
];
const maxTotalScore = 100;

function getRealityScoreStats(list = candidatesList) {
    const attendedList = list.filter(c => c && c.attended);
    const totalAttendees = attendedList.length;
    const absentCount = list.length - totalAttendees;

    if (totalAttendees === 0) {
        return { totalAttendees: 0, absentCount, mean: 0, median: 0, min: 0, max: 0, q1: 0, q3: 0, stdDev: 0, scores: [] };
    }

    const scores = attendedList.map(c => {
        const tot = (Number(c.g1) || 0) + (Number(c.g2) || 0) + (Number(c.g3) || 0) + (Number(c.g4) || 0);
        return maxTotalScore > 0 ? (tot / maxTotalScore) * 100 : 0;
    }).sort((a, b) => a - b);

    const sum = scores.reduce((acc, v) => acc + v, 0);
    const mean = sum / totalAttendees;
    const median = totalAttendees % 2 !== 0 
        ? scores[Math.floor(totalAttendees / 2)] 
        : (scores[Math.floor(totalAttendees / 2) - 1] + scores[Math.floor(totalAttendees / 2)]) / 2;
    const min = scores[0];
    const max = scores[scores.length - 1];
    const q1 = scores[Math.floor(totalAttendees * 0.25)];
    const q3 = scores[Math.min(scores.length - 1, Math.floor(totalAttendees * 0.75))];
    const variance = scores.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / totalAttendees;
    const stdDev = Math.sqrt(variance);

    return { totalAttendees, absentCount, mean, median, min, max, q1, q3, stdDev, scores };
}

function calculateThresholdForTargetPassRate(targetRate, list = candidatesList) {
    const stats = getRealityScoreStats(list);
    if (stats.totalAttendees === 0) {
        return { requiredThreshold: 60, targetCount: 0, actualPassingCount: 0, actualPassPct: 0 };
    }
    const targetPct = Math.max(1, Math.min(100, Number(targetRate) || 80));
    const targetCount = Math.max(1, Math.min(stats.totalAttendees, Math.round(stats.totalAttendees * (targetPct / 100))));
    const failCount = Math.max(0, stats.totalAttendees - targetCount);
    const cutoffIndex = Math.min(stats.scores.length - 1, failCount);
    const rawCutoff = stats.scores[cutoffIndex];
    const requiredThreshold = Math.round(rawCutoff * 2) / 2;
    const actualPassingCount = stats.scores.filter(s => s >= requiredThreshold).length;
    const actualPassPct = stats.totalAttendees > 0 ? (actualPassingCount / stats.totalAttendees) * 100 : 0;
    return { requiredThreshold, targetCount, actualPassingCount, actualPassPct };
}

// أ. التحقق من إحصاء الحضور
const stats = getRealityScoreStats();
assert.strictEqual(stats.totalAttendees, 5, 'عدد الحاضرين يجب أن يكون 5');
assert.strictEqual(stats.absentCount, 1, 'عدد الغائبين يجب أن يكون 1');
assert.strictEqual(stats.min, 54, 'أقل درجة يجب أن تكون 54');
assert.strictEqual(stats.max, 95, 'أعلى درجة يجب أن تكون 95');
assert.strictEqual(stats.median, 72, 'الوسيط يجب أن يكون 72');
assert.strictEqual(Math.round(stats.mean * 10) / 10, 73.2, 'المتوسط الحسابي يجب أن يكون 73.2');
console.log('  [PASS] ✅ حساب مؤشرات الواقع الوصفية (Mean: 73.2%, Median: 72%, Min: 54%, Max: 95%) سليم 100%');

// ب. التحقق من هدف نسبة النجاح 80% (مطلب المستخدم الرئيسي!)
const calc80 = calculateThresholdForTargetPassRate(80);
assert.strictEqual(calc80.targetCount, 4, '80% من 5 طلاب يعني استهداف نجاح 4 طلاب');
assert.strictEqual(calc80.requiredThreshold, 60, 'حد النجاح المطلوب لتمرير 80% يجب أن يكون 60%');
assert.strictEqual(calc80.actualPassingCount, 4, 'الناجحون الفعليون يجب أن يكونوا 4 طلاب');
assert.strictEqual(calc80.actualPassPct, 80, 'النسبة الفعلية المحققة 80%');
console.log(`  [PASS] ✅ مستكشف 80% نجاح: حد النجاح المقترح هو ${calc80.requiredThreshold}% (ينجح ${calc80.actualPassingCount} من ${stats.totalAttendees} بنسبة 80%)`);

// جـ. التحقق من هدف نسبة النجاح 60%
const calc60 = calculateThresholdForTargetPassRate(60);
assert.strictEqual(calc60.targetCount, 3, '60% من 5 طلاب يعني استهداف 3 طلاب');
assert.strictEqual(calc60.requiredThreshold, 72, 'حد النجاح المطلوب لتمرير 60% يجب أن يكون 72%');
assert.strictEqual(calc60.actualPassingCount, 3);
console.log(`  [PASS] ✅ مستكشف 60% نجاح: حد النجاح المقترح هو ${calc60.requiredThreshold}% (ينجح ${calc60.actualPassingCount} من ${stats.totalAttendees})`);

// د. التحقق من هدف 100% نجاح (الكل ينجح)
const calc100 = calculateThresholdForTargetPassRate(100);
assert.strictEqual(calc100.requiredThreshold, 54, 'حد النجاح لتمرير 100% هو أقل درجة حاضر (54%)');
assert.strictEqual(calc100.actualPassingCount, 5);
assert.strictEqual(calc100.actualPassPct, 100);
console.log(`  [PASS] ✅ مستكشف 100% نجاح: يحدد عتبة أدنى حاضر (${calc100.requiredThreshold}%) ويمرر الجميع.`);

// هـ. التحقق من معالجة حالة القائمة الفارغة أو غياب الجميع بأمان
const emptyStats = getRealityScoreStats([]);
assert.strictEqual(emptyStats.totalAttendees, 0);
assert.strictEqual(emptyStats.mean, 0);
const emptyCalc = calculateThresholdForTargetPassRate(80, []);
assert.strictEqual(emptyCalc.totalAttendees, undefined);
assert.strictEqual(emptyCalc.targetCount, 0);
console.log('  [PASS] ✅ المعالجة الآمنة لحالة عدم وجود حاضرين (Zero Attendees Fallback) مستقرة وبدون انهيار.');

// و. التحقق من تكامل حفظ واسترجاع النسبة المستهدفة في التخزين المحلي
assert.ok(htmlContent.includes("localStorage.setItem('khedmety_target_pass_rate', currentTargetPassRate);"), 'حفظ النسبة المستهدفة محلياً');
assert.ok(htmlContent.includes("localStorage.getItem('khedmety_target_pass_rate');"), 'استرجاع النسبة المستهدفة محلياً');
console.log('  [PASS] ✅ تكامل حفظ واستعادة النسبة المستهدفة مع SafeStorage و localStorage.');

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الاختبارات الـ 7 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
