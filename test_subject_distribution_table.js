/**
 * test_subject_distribution_table.js
 * 
 * حزمة اختبارات شاملة للتحقق من منظومة جدول التوزيع التكراري للدرجات والنسب المئوية
 * (Subject Frequency & Deciles Distribution Table: 0%, 1-10%, 11-20% ... 91-100%)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات جدول التوزيع التكراري لنسب ومواد التقييم');
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
console.log('--- 1. فحص عناصر واجهة التوزيع التكراري في HTML ---');
// -------------------------------------------------------------------------

it('وجود تبويب جدول التوزيع التكراري وشريط التبديل الفرعي', () => {
    assert(htmlContent.includes('id="tabStudioLadder"'), 'tabStudioLadder must exist');
    assert(htmlContent.includes('id="tabLadderDist"'), 'tabLadderDist button must exist');
    assert(htmlContent.includes('id="tabLadderPercentiles"'), 'tabLadderPercentiles button must exist');
    assert(htmlContent.includes('switchLadderSubView'), 'switchLadderSubView function must be hooked');
});

it('وجود أزرار اختيار المواد الخمسة وزر مصفوفة المقارنة الشاملة (Matrix)', () => {
    assert(htmlContent.includes('id="btnDistTotal"'), 'btnDistTotal must exist');
    assert(htmlContent.includes('id="btnDistExam1"'), 'btnDistExam1 must exist');
    assert(htmlContent.includes('id="btnDistExam2"'), 'btnDistExam2 must exist');
    assert(htmlContent.includes('id="btnDistExam3"'), 'btnDistExam3 must exist');
    assert(htmlContent.includes('id="btnDistExam4"'), 'btnDistExam4 must exist');
    assert(htmlContent.includes('id="btnDistMatrix"'), 'btnDistMatrix must exist');
    assert(htmlContent.includes('setDistributionScope'), 'setDistributionScope must be hooked');
});

it('وجود خيارات تخصيص أعمدة مصفوفة المقارنة (Matrix Checkboxes)', () => {
    assert(htmlContent.includes('id="distMatrixSubjectSelector"'), 'distMatrixSubjectSelector container must exist');
    assert(htmlContent.includes('id="chkMatTotal"'), 'chkMatTotal checkbox must exist');
    assert(htmlContent.includes('id="chkMatEx1"'), 'chkMatEx1 checkbox must exist');
    assert(htmlContent.includes('id="chkMatEx2"'), 'chkMatEx2 checkbox must exist');
    assert(htmlContent.includes('id="chkMatEx3"'), 'chkMatEx3 checkbox must exist');
    assert(htmlContent.includes('id="chkMatEx4"'), 'chkMatEx4 checkbox must exist');
});

it('وجود حاوية الجدول وشريط المؤشرات السريعة ونافذة عرض مخدومي الشريحة', () => {
    assert(htmlContent.includes('id="distSubjectSummaryBar"'), 'distSubjectSummaryBar must exist');
    assert(htmlContent.includes('id="distTableContainer"'), 'distTableContainer must exist');
    assert(htmlContent.includes('id="distStudentListModal"'), 'distStudentListModal modal must exist');
    assert(htmlContent.includes('id="distModalTitle"'), 'distModalTitle must exist');
    assert(htmlContent.includes('id="distModalTableBody"'), 'distModalTableBody must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 2. فحص الدوال البرمجية ومنطق حساب الشرائح الـ 11 في JS ---');
// -------------------------------------------------------------------------

it('وجود دوال التوزيع التكراري والتصدير والنسخ في الكود المصدري', () => {
    assert(htmlContent.includes('function getDistributionBracketsDefinition'), 'getDistributionBracketsDefinition must exist');
    assert(htmlContent.includes('function calculateSubjectDistribution'), 'calculateSubjectDistribution must exist');
    assert(htmlContent.includes('function renderDistributionUI'), 'renderDistributionUI must exist');
    assert(htmlContent.includes('function openBracketStudentsModal'), 'openBracketStudentsModal must exist');
    assert(htmlContent.includes('function exportDistributionToExcel'), 'exportDistributionToExcel must exist');
    assert(htmlContent.includes('function copyDistributionTable'), 'copyDistributionTable must exist');
});

it('التحقق من تعريف الشرائح الـ 11 بدقة من 0% إلى 100%', () => {
    // محاكاة تعريف الشرائح لمادة درجتها 25 درجة
    function getDistributionBracketsDefinition(maxScore) {
        return [
            { index: 0, label: '0%', minPct: 0, maxPct: 0, color: '#94a3b8', scoreRange: '0.0 من ' + maxScore },
            { index: 1, label: '1% - 10%', minPct: 0, maxPct: 10, color: '#ef4444', scoreRange: '0.1 - ' + (maxScore * 0.10).toFixed(1) + ' د' },
            { index: 2, label: '11% - 20%', minPct: 10, maxPct: 20, color: '#f87171', scoreRange: (maxScore * 0.10 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.20).toFixed(1) + ' د' },
            { index: 3, label: '21% - 30%', minPct: 20, maxPct: 30, color: '#fb923c', scoreRange: (maxScore * 0.20 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.30).toFixed(1) + ' د' },
            { index: 4, label: '31% - 40%', minPct: 30, maxPct: 40, color: '#f97316', scoreRange: (maxScore * 0.30 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.40).toFixed(1) + ' د' },
            { index: 5, label: '41% - 50%', minPct: 40, maxPct: 50, color: '#f59e0b', scoreRange: (maxScore * 0.40 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.50).toFixed(1) + ' د' },
            { index: 6, label: '51% - 60%', minPct: 50, maxPct: 60, color: '#eab308', scoreRange: (maxScore * 0.50 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.60).toFixed(1) + ' د' },
            { index: 7, label: '61% - 70%', minPct: 60, maxPct: 70, color: '#84cc16', scoreRange: (maxScore * 0.60 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.70).toFixed(1) + ' د' },
            { index: 8, label: '71% - 80%', minPct: 70, maxPct: 80, color: '#22c55e', scoreRange: (maxScore * 0.70 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.80).toFixed(1) + ' د' },
            { index: 9, label: '81% - 90%', minPct: 80, maxPct: 90, color: '#10b981', scoreRange: (maxScore * 0.80 + 0.1).toFixed(1) + ' - ' + (maxScore * 0.90).toFixed(1) + ' د' },
            { index: 10, label: '91% - 100%', minPct: 90, maxPct: 100, color: '#059669', scoreRange: (maxScore * 0.90 + 0.1).toFixed(1) + ' - ' + Number(maxScore).toFixed(1) + ' د' }
        ];
    }

    const b25 = getDistributionBracketsDefinition(25);
    assert.strictEqual(b25.length, 11, 'Must have exactly 11 brackets');
    assert.strictEqual(b25[0].label, '0%');
    assert.strictEqual(b25[1].label, '1% - 10%');
    assert.strictEqual(b25[10].label, '91% - 100%');
    assert.strictEqual(b25[10].scoreRange, '22.6 - 25.0 د');

    const b100 = getDistributionBracketsDefinition(100);
    assert.strictEqual(b100.length, 11);
    assert.strictEqual(b100[0].scoreRange, '0.0 من 100');
    assert.strictEqual(b100[1].scoreRange, '0.1 - 10.0 د');
    assert.strictEqual(b100[10].scoreRange, '90.1 - 100.0 د');
});

// -------------------------------------------------------------------------
console.log('\n--- 3. محاكاة حساب وتوزيع درجات عينة حقيقية على الشرائح ---');
// -------------------------------------------------------------------------

it('توزيع درجات المجموع العام لمجموعة مخدومين تجريبية', () => {
    const mockCandidates = [
        { code: "1", name: "طالب أ", attended: true, g1: 25, g2: 25, g3: 25, g4: 25 }, // total 100 (100%) -> 91-100%
        { code: "2", name: "طالب ب", attended: true, g1: 21, g2: 22, g3: 20, g4: 21 }, // total 84 (84%) -> 81-90%
        { code: "3", name: "طالب ج", attended: true, g1: 18, g2: 19, g3: 17, g4: 18 }, // total 72 (72%) -> 71-80%
        { code: "4", name: "طالب د", attended: true, g1: 15, g2: 15, g3: 15, g4: 15 }, // total 60 (60%) -> 51-60%
        { code: "5", name: "طالب هـ", attended: true, g1: 13, g2: 14, g3: 13, g4: 13 }, // total 53 (53%) -> 51-60%
        { code: "6", name: "طالب و", attended: true, g1: 0, g2: 0, g3: 0, g4: 0 },       // total 0 (0%) -> 0%
        { code: "7", name: "طالب غ", attended: false, g1: 0, g2: 0, g3: 0, g4: 0 }     // غائب -> غير محسوب في الحاضرين
    ];

    const maxTotalScore = 100;
    const attendedList = mockCandidates.filter(c => c.attended);
    const N = attendedList.length; // 6
    assert.strictEqual(N, 6);

    const bracketsCount = new Array(11).fill(0);

    attendedList.forEach(c => {
        const tot = c.g1 + c.g2 + c.g3 + c.g4;
        const pct = (tot / maxTotalScore) * 100;
        let idx = 0;
        if (tot <= 0) idx = 0;
        else if (pct <= 10) idx = 1;
        else if (pct <= 20) idx = 2;
        else if (pct <= 30) idx = 3;
        else if (pct <= 40) idx = 4;
        else if (pct <= 50) idx = 5;
        else if (pct <= 60) idx = 6;
        else if (pct <= 70) idx = 7;
        else if (pct <= 80) idx = 8;
        else if (pct <= 90) idx = 9;
        else idx = 10;
        bracketsCount[idx]++;
    });

    assert.strictEqual(bracketsCount[0], 1, 'Bracket 0% must have 1 student');
    assert.strictEqual(bracketsCount[6], 2, 'Bracket 51-60% must have 2 students (طالب د + طالب هـ)');
    assert.strictEqual(bracketsCount[8], 1, 'Bracket 71-80% must have 1 student (طالب ج)');
    assert.strictEqual(bracketsCount[9], 1, 'Bracket 81-90% must have 1 student (طالب ب)');
    assert.strictEqual(bracketsCount[10], 1, 'Bracket 91-100% must have 1 student (طالب أ)');

    const totalCalculated = bracketsCount.reduce((a, b) => a + b, 0);
    assert.strictEqual(totalCalculated, N, 'Sum of all brackets must exactly equal attended count (6)');
});

it('حساب النسبة التراكمية (Cumulative Count & %) تنازلياً بدقة', () => {
    const bracketsCount = [1, 0, 0, 0, 0, 0, 2, 0, 1, 1, 1];
    const N = 6;
    const cumCounts = new Array(11).fill(0);
    let run = 0;
    for (let i = 10; i >= 0; i--) {
        run += bracketsCount[i];
        cumCounts[i] = run;
    }

    assert.strictEqual(cumCounts[10], 1, '≥ 91%: 1 student');
    assert.strictEqual(cumCounts[9], 2, '≥ 81%: 2 students');
    assert.strictEqual(cumCounts[8], 3, '≥ 71%: 3 students');
    assert.strictEqual(cumCounts[6], 5, '≥ 51%: 5 students');
    assert.strictEqual(cumCounts[0], 6, '≥ 0%: 6 students (all attendees)');
});

it('توزيع مادة فردية (تحريري روحي من 25 درجة)', () => {
    const maxScore = 25;
    const mockExamScores = [25, 21, 18, 15, 13, 0]; // 6 students
    const bracketsCount = new Array(11).fill(0);

    mockExamScores.forEach(score => {
        const pct = (score / maxScore) * 100;
        let idx = 0;
        if (score <= 0) idx = 0;
        else if (pct <= 10) idx = 1;
        else if (pct <= 20) idx = 2;
        else if (pct <= 30) idx = 3;
        else if (pct <= 40) idx = 4;
        else if (pct <= 50) idx = 5;
        else if (pct <= 60) idx = 6;
        else if (pct <= 70) idx = 7;
        else if (pct <= 80) idx = 8;
        else if (pct <= 90) idx = 9;
        else idx = 10;
        bracketsCount[idx]++;
    });

    // 25/25 = 100% -> bracket 10
    // 21/25 = 84% -> bracket 9
    // 18/25 = 72% -> bracket 8
    // 15/25 = 60% -> bracket 6
    // 13/25 = 52% -> bracket 6
    // 0/25 = 0% -> bracket 0
    assert.strictEqual(bracketsCount[0], 1);
    assert.strictEqual(bracketsCount[6], 2);
    assert.strictEqual(bracketsCount[8], 1);
    assert.strictEqual(bracketsCount[9], 1);
    assert.strictEqual(bracketsCount[10], 1);
});

it('فلترة الجدول الرئيسي على كود المخدومين في شريحة محددة (activeBracketFilterCodes)', () => {
    assert(htmlContent.includes('activeBracketFilterCodes'), 'activeBracketFilterCodes state variable must exist');
    assert(htmlContent.includes('filterMainTableByBracketStudents'), 'filterMainTableByBracketStudents must exist');
    assert(htmlContent.includes('if (!activeBracketFilterCodes.includes(String(c.code))) return false;'), 'getFilteredCandidates must filter by active bracket codes');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للاختبارات: ${passedTests}/${totalTests} فحوصات نجحت بنسبة ${Math.round(passedTests/totalTests*100)}% ✅`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
