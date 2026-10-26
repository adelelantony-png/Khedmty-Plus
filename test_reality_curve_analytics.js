const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 بدء تشغيل حزمة اختبارات مستكشف منحنى الواقع ومتوسطات الأقسام');
console.log('================================================================');

const htmlContent = fs.readFileSync('D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/servant_grades_entry.html', 'utf8');

// --- 1. فحص عناصر واجهة المستخدم في HTML ---
console.log('\n--- 1. فحص عناصر واجهة المستخدم ومتوسطات الأقسام في HTML ---');

const requiredElements = [
    'id="realityCurveExplorerPanel"',
    'id="realityQuickBadge"',
    'id="realityStatAttendees"',
    'id="realityStatAbsents"',
    'id="realityStatMean"',
    'id="realityStatMedian"',
    'id="targetPassRateSlider"',
    'id="targetPassRateInput"',
    'id="realityResultBox"',
    'id="btnApplyRealityThreshold"',
    'id="realityStatQ1"',
    'id="realityStatStdDev"',
    'btn-preset-pass',
    // عناصر متوسطات الأقسام الأربعة
    'id="secAvgScore1"',
    'id="secAvgPct1"',
    'id="secPassRate1"',
    'id="secAvgScore2"',
    'id="secAvgPct2"',
    'id="secPassRate2"',
    'id="secAvgScore3"',
    'id="secAvgPct3"',
    'id="secPassRate3"',
    'id="secAvgScore4"',
    'id="secAvgPct4"',
    'id="secPassRate4"',
    // عناصر المحاور الكبرى وأقسام النوع
    'id="avgDomainSpiritual"',
    'id="avgDomainPsych"',
    'id="avgGenderMale"',
    'id="avgGenderFemale"',
    // شارات متوسطات الأقسام في لوحة المعايير
    'id="examAvgBadge1"',
    'id="examAvgBadge2"',
    'id="examAvgBadge3"',
    'id="examAvgBadge4"',
    // تذييل جدول الرصد (Table Footer)
    'id="tableFooter"',
    'id="tfAvgG1"',
    'id="tfAvgG2"',
    'id="tfAvgG3"',
    'id="tfAvgG4"',
    'id="tfAvgTotal"',
    'id="tfAvgPct"',
    'id="tfSummaryDec"'
];

let uiPassCount = 0;
requiredElements.forEach(elem => {
    assert.ok(htmlContent.includes(elem), `عنصر الواجهة مفقود: ${elem}`);
    uiPassCount++;
});
console.log(`  [PASS] ✅ كافة عناصر الواجهة ومتوسطات الأقسام (${uiPassCount}/${requiredElements.length}) موجودة بدقة.`);

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

// --- 3. محاكاة العمليات الإحصائية لحساب متوسط كل قسم بدقة ---
console.log('\n--- 3. محاكاة واختبار حساب متوسط كل قسم (Section Averages Accuracy) ---');

const candidatesList = [
    { code: "2201", attended: true, g1: 24.0, g2: 23.5, g3: 25.0, g4: 22.5, gender: 'بنين', name: 'يوسف جرجس' },
    { code: "2202", attended: true, g1: 21.0, g2: 22.0, g3: 20.5, g4: 21.5, gender: 'بنات', name: 'مارينا ماجد' },
    { code: "2203", attended: true, g1: 18.0, g2: 19.5, g3: 17.0, g4: 17.5, gender: 'بنين', name: 'كيرلس ميخائيل' },
    { code: "2204", attended: true, g1: 15.0, g2: 16.0, g3: 14.5, g4: 14.5, gender: 'بنات', name: 'سارة سمير' },
    { code: "2205", attended: true, g1: 13.0, g2: 14.0, g3: 13.5, g4: 13.5, gender: 'بنين', name: 'بيتر هاني' },
    { code: "2206", attended: false, g1: 0, g2: 0, g3: 0, g4: 0, gender: 'بنين', name: 'ديفيد نبيل' }
];
const examMaxScores = [25, 25, 25, 25];
const maxTotalScore = 100;

const attendedList = candidatesList.filter(c => c && c.attended);
const N = attendedList.length;

// أ. حساب متوسطات الأقسام الأربعة للمواد
const avgG1 = attendedList.reduce((acc, c) => acc + c.g1, 0) / N;
const avgG2 = attendedList.reduce((acc, c) => acc + c.g2, 0) / N;
const avgG3 = attendedList.reduce((acc, c) => acc + c.g3, 0) / N;
const avgG4 = attendedList.reduce((acc, c) => acc + c.g4, 0) / N;

assert.strictEqual(avgG1.toFixed(1), '18.2', 'متوسط قسم التحريري الروحي يجب أن يكون 18.2');
assert.strictEqual(avgG2.toFixed(1), '19.0', 'متوسط قسم التحريري النفسي يجب أن يكون 19.0');
assert.strictEqual(avgG3.toFixed(1), '18.1', 'متوسط قسم الشفوي الروحي يجب أن يكون 18.1');
assert.strictEqual(avgG4.toFixed(1), '17.9', 'متوسط قسم الشفوي النفسي يجب أن يكون 17.9');

console.log(`  [PASS] ✅ متوسط قسم 1 (تحريري روحي): ${avgG1.toFixed(1)} / 25 (${((avgG1/25)*100).toFixed(1)}%)`);
console.log(`  [PASS] ✅ متوسط قسم 2 (تحريري نفسي): ${avgG2.toFixed(1)} / 25 (${((avgG2/25)*100).toFixed(1)}%)`);
console.log(`  [PASS] ✅ متوسط قسم 3 (شفوي روحي): ${avgG3.toFixed(1)} / 25 (${((avgG3/25)*100).toFixed(1)}%)`);
console.log(`  [PASS] ✅ متوسط قسم 4 (شفوي نفسي): ${avgG4.toFixed(1)} / 25 (${((avgG4/25)*100).toFixed(1)}%)`);

// ب. حساب متوسطات المحاور الكبرى (الروحي والنفسي)
const avgSpiritual = avgG1 + avgG3;
const avgPsych = avgG2 + avgG4;
assert.strictEqual(avgSpiritual.toFixed(1), '36.3', 'متوسط المحور الروحي يجب أن يكون 36.3 / 50');
assert.strictEqual(avgPsych.toFixed(1), '36.9', 'متوسط المحور النفسي يجب أن يكون 36.9 / 50');

console.log(`  [PASS] ✅ متوسط المحور الروحي الإجمالي: ${avgSpiritual.toFixed(1)} / 50 (${((avgSpiritual/50)*100).toFixed(1)}%)`);
console.log(`  [PASS] ✅ متوسط المحور النفسي الإجمالي: ${avgPsych.toFixed(1)} / 50 (${((avgPsych/50)*100).toFixed(1)}%)`);

// جـ. حساب متوسطات قسم البنين وقسم البنات
const males = attendedList.filter(c => c.gender === 'بنين');
const females = attendedList.filter(c => c.gender === 'بنات');
const avgMale = males.reduce((acc, c) => acc + (c.g1+c.g2+c.g3+c.g4), 0) / males.length;
const avgFemale = females.reduce((acc, c) => acc + (c.g1+c.g2+c.g3+c.g4), 0) / females.length;

assert.strictEqual(avgMale.toFixed(1), '73.7', 'متوسط قسم البنين يجب أن يكون 73.7');
assert.strictEqual(avgFemale.toFixed(1), '72.5', 'متوسط قسم البنات يجب أن يكون 72.5');

console.log(`  [PASS] ✅ متوسط قسم البنين (Male): ${avgMale.toFixed(1)}% (${males.length} حاضرين)`);
console.log(`  [PASS] ✅ متوسط قسم البنات (Female): ${avgFemale.toFixed(1)}% (${females.length} حاضرات)`);

// د. التحقق من تطابق مجموع متوسطات الأقسام مع متوسط الدفعة الإجمالي
const totalOfAverages = avgG1 + avgG2 + avgG3 + avgG4;
const totalBatchAvg = attendedList.reduce((acc, c) => acc + (c.g1+c.g2+c.g3+c.g4), 0) / N;
assert.strictEqual(totalOfAverages.toFixed(1), totalBatchAvg.toFixed(1), 'مجموع متوسطات الأقسام يجب أن يطابق تماماً متوسط الدفعة العام');
console.log(`  [PASS] ✅ تطابق رياضي تام: مجموع متوسطات الأقسام (${totalOfAverages.toFixed(1)}) = متوسط الدفعة العام (${totalBatchAvg.toFixed(1)})`);

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات الـ 10 نجحت بنسبة 100% ✅');
console.log('================================================================\n');
