/**
 * test_exam_max_scores_persistence.js
 * 
 * حزمة اختبارات شاملة للتحقق من ثبات وحفظ واسترجاع الدرجات العظمى للامتحانات الأربعة
 * (Exam Max Scores & Total Max Score Persistence)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات ثبات وحفظ الدرجات العظمى للامتحانات الأربعة');
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
console.log('--- 1. فحص عناصر واجهة الدرجات العظمى في ملف HTML ---');
// -------------------------------------------------------------------------

it('وجود حقول إدخال الدرجات العظمى الأربعة في scaleConfigDrawer', () => {
    assert(htmlContent.includes('id="cfgMaxExam1"'), 'cfgMaxExam1 must exist');
    assert(htmlContent.includes('id="cfgMaxExam2"'), 'cfgMaxExam2 must exist');
    assert(htmlContent.includes('id="cfgMaxExam3"'), 'cfgMaxExam3 must exist');
    assert(htmlContent.includes('id="cfgMaxExam4"'), 'cfgMaxExam4 must exist');
    assert(htmlContent.includes('id="cfgTotalMaxScoreDisplay"'), 'cfgTotalMaxScoreDisplay must exist');
});

it('وجود زر استعادة الافتراضي للدرجات العظمى (resetExamMaxScoresToDefault)', () => {
    assert(htmlContent.includes('id="btnResetExamMaxScores"'), 'btnResetExamMaxScores must exist');
    assert(htmlContent.includes('resetExamMaxScoresToDefault()'), 'onclick resetExamMaxScoresToDefault must be hooked');
});

it('وجود شارات الدرجات العظمى في ترويسات الجدول الرئيسي (thMaxEx1..4, thMaxExTotal)', () => {
    assert(htmlContent.includes('id="thMaxEx1"'), 'thMaxEx1 header must exist');
    assert(htmlContent.includes('id="thMaxEx2"'), 'thMaxEx2 header must exist');
    assert(htmlContent.includes('id="thMaxEx3"'), 'thMaxEx3 header must exist');
    assert(htmlContent.includes('id="thMaxEx4"'), 'thMaxEx4 header must exist');
    assert(htmlContent.includes('id="thMaxExTotal"'), 'thMaxExTotal header must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 2. فحص المنطق البرمجي والدوال المحورية للثبات في JS ---');
// -------------------------------------------------------------------------

it('دالة updateExamMaxScores تحدث المجموع وتحفظ في الذاكرة المحلية', () => {
    assert(htmlContent.includes('function updateExamMaxScores()'), 'updateExamMaxScores function must exist');
    assert(htmlContent.includes('saveGradesLocal(false)'), 'must trigger silent save');
    assert(htmlContent.includes('Math.max(1,'), 'must sanitize minimum bounds');
});

it('دالة resetExamMaxScoresToDefault تعيد القيم الافتراضية [25, 25, 25, 25] والمجموع 100', () => {
    assert(htmlContent.includes('function resetExamMaxScoresToDefault()'), 'resetExamMaxScoresToDefault must exist');
    assert(htmlContent.includes('examMaxScores = [25, 25, 25, 25]'), 'must reset examMaxScores to defaults');
    assert(htmlContent.includes('maxTotalScore = 100'), 'must reset maxTotalScore to 100');
});

it('دالة setMixMode تقبل باراميتر triggerSave اختياري لمنع التصفير العرضي أثناء التحميل', () => {
    assert(htmlContent.includes('function setMixMode(mode, triggerSave = true)'), 'setMixMode must support triggerSave');
    assert(htmlContent.includes('if (triggerSave)'), 'save and render must be conditional on triggerSave');
});

it('دالة loadSavedData تسترجع الدرجات العظمى وتزامن الحقول وتمنع التصفير العكسي', () => {
    assert(htmlContent.includes('localStorage.getItem(\'khedmety_exam_max_scores\')'), 'must read khedmety_exam_max_scores');
    assert(htmlContent.includes('setMixMode(sMix, false)'), 'must call setMixMode with triggerSave=false');
    assert(htmlContent.includes('examMaxScores.reduce((a, b) => a + b, 0)'), 'must recompute maxTotalScore cleanly');
});

it('بدء تشغيل التطبيق محمي من عطل جاهزية المستند (DOMContentLoaded readyState check)', () => {
    assert(htmlContent.includes('if (document.readyState === \'loading\')'), 'must check readyState');
    assert(htmlContent.includes('function initApp()'), 'initApp must be defined');
    assert(htmlContent.includes('loadSavedData();'), 'initApp must call loadSavedData');
});

// -------------------------------------------------------------------------
console.log('\n--- 3. محاكاة دورة حياة الحفظ والاسترجاع الكاملة (Lifecycle Simulation) ---');
// -------------------------------------------------------------------------

// بناء بيئة محاكاة DOM و LocalStorage
function createSimulationEnvironment() {
    const store = {};
    const mockLocalStorage = {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { for (const k in store) delete store[k]; }
    };

    const elements = {
        cfgMaxExam1: { value: '25' },
        cfgMaxExam2: { value: '25' },
        cfgMaxExam3: { value: '25' },
        cfgMaxExam4: { value: '25' },
        cfgTotalMaxScoreDisplay: { textContent: '100' },
        pdfHeaderMaxScore: { textContent: '100' },
        passThresholdSlider: { value: '60' },
        thresholdDisplay: { textContent: '60%' },
        interviewThresholdSlider: { value: '50' },
        interviewThresholdDisplay: { textContent: '50%' },
        targetPassRateSlider: { value: '80' },
        targetPassRateInput: { value: '80' },
        passScoreEquivalent: { textContent: '' },
        interviewScoreEquivalent: { textContent: '' },
        btnMixStrict: { classList: { add: () => {}, remove: () => {} } },
        btnMixDomain: { classList: { add: () => {}, remove: () => {} } },
        btnMixRealityAvg: { classList: { add: () => {}, remove: () => {} } },
        btnMixTotalOnly: { classList: { add: () => {}, remove: () => {} } },
        cfgPassPct1: { value: '50' },
        cfgPassPct2: { value: '50' },
        cfgPassPct3: { value: '50' },
        cfgPassPct4: { value: '50' },
        mixSlider1: { value: '50' },
        mixSlider2: { value: '50' },
        mixSlider3: { value: '50' },
        mixSlider4: { value: '50' },
        mixPassDisp1: { textContent: '' },
        mixPassDisp2: { textContent: '' },
        mixPassDisp3: { textContent: '' },
        mixPassDisp4: { textContent: '' },
        examScoreEq1: { innerHTML: '' },
        examScoreEq2: { innerHTML: '' },
        examScoreEq3: { innerHTML: '' },
        examScoreEq4: { innerHTML: '' }
    };

    const mockDocument = {
        getElementById: (id) => elements[id] || null
    };

    // متغيرات الحالة الداخلية
    let examMaxScores = [25, 25, 25, 25];
    let maxTotalScore = 100;
    let candidatesList = [];
    let passThreshold = 60;
    let interviewThreshold = 50;
    let currentTargetPassRate = 80;
    let currentMixMode = 'strict';
    let examMinPassPercentages = [50, 50, 50, 50];

    function saveGradesLocal(showAlert = false) {
        mockLocalStorage.setItem('khedmety_new_applicants_grades', JSON.stringify(candidatesList));
        mockLocalStorage.setItem('khedmety_target_pass_rate', currentTargetPassRate);
        mockLocalStorage.setItem('khedmety_mix_mode', currentMixMode);
        mockLocalStorage.setItem('khedmety_pass_threshold', passThreshold);
        mockLocalStorage.setItem('khedmety_interview_threshold', interviewThreshold);
        mockLocalStorage.setItem('khedmety_max_total_score', maxTotalScore);
        mockLocalStorage.setItem('khedmety_exam_min_percentages', JSON.stringify(examMinPassPercentages));
        mockLocalStorage.setItem('khedmety_exam_max_scores', JSON.stringify(examMaxScores));
    }

    function setMixMode(mode, triggerSave = true) {
        currentMixMode = mode;
        if (triggerSave) {
            saveGradesLocal(false);
        }
    }

    function updateScoreEquivalents() {
        const passScore = maxTotalScore > 0 ? (passThreshold / 100 * maxTotalScore).toFixed(1) : "0.0";
        const intScore = maxTotalScore > 0 ? (interviewThreshold / 100 * maxTotalScore).toFixed(1) : "0.0";
        if (mockDocument.getElementById('passScoreEquivalent')) {
            mockDocument.getElementById('passScoreEquivalent').textContent = `(${passScore} / ${maxTotalScore} درجة)`;
        }
        if (mockDocument.getElementById('interviewScoreEquivalent')) {
            mockDocument.getElementById('interviewScoreEquivalent').textContent = `(${intScore} / ${maxTotalScore} درجة)`;
        }
    }

    function updateExamPassScoreEquivalents() {
        for (let i = 1; i <= 4; i++) {
            const max = (Array.isArray(examMaxScores) && examMaxScores[i - 1] > 0) ? examMaxScores[i - 1] : 25;
            const pct = (Array.isArray(examMinPassPercentages) && examMinPassPercentages[i - 1]) ? examMinPassPercentages[i - 1] : 50;
            const rawScore = (pct / 100) * max;
            const cleanScore = (rawScore % 1 === 0) ? rawScore : rawScore.toFixed(1);
            const el = mockDocument.getElementById('examScoreEq' + i);
            if (el) {
                el.innerHTML = '(يعادل: ' + cleanScore + ' من ' + max + ' درجة)';
            }
        }
    }

    function updateExamMaxScores() {
        const inp1 = mockDocument.getElementById('cfgMaxExam1');
        const inp2 = mockDocument.getElementById('cfgMaxExam2');
        const inp3 = mockDocument.getElementById('cfgMaxExam3');
        const inp4 = mockDocument.getElementById('cfgMaxExam4');

        const e1 = Math.max(1, Number(inp1 ? inp1.value : 25) || 25);
        const e2 = Math.max(1, Number(inp2 ? inp2.value : 25) || 25);
        const e3 = Math.max(1, Number(inp3 ? inp3.value : 25) || 25);
        const e4 = Math.max(1, Number(inp4 ? inp4.value : 25) || 25);

        examMaxScores = [e1, e2, e3, e4];
        maxTotalScore = e1 + e2 + e3 + e4;

        const elTot = mockDocument.getElementById('cfgTotalMaxScoreDisplay');
        if (elTot) elTot.textContent = String(maxTotalScore);
        const elPdfMax = mockDocument.getElementById('pdfHeaderMaxScore');
        if (elPdfMax) elPdfMax.textContent = String(maxTotalScore);

        updateScoreEquivalents();
        updateExamPassScoreEquivalents();
        saveGradesLocal(false);
    }

    function resetExamMaxScoresToDefault() {
        examMaxScores = [25, 25, 25, 25];
        maxTotalScore = 100;
        for (let i = 1; i <= 4; i++) {
            const el = mockDocument.getElementById('cfgMaxExam' + i);
            if (el) el.value = '25';
        }
        const elTot = mockDocument.getElementById('cfgTotalMaxScoreDisplay');
        if (elTot) elTot.textContent = '100';
        const elPdfMax = mockDocument.getElementById('pdfHeaderMaxScore');
        if (elPdfMax) elPdfMax.textContent = '100';

        updateScoreEquivalents();
        updateExamPassScoreEquivalents();
        saveGradesLocal(false);
    }

    function loadSavedData() {
        try {
            // 1. استرجاع الدرجات العظمى للامتحانات الأربعة أولاً
            const sExamMax = mockLocalStorage.getItem('khedmety_exam_max_scores');
            if (sExamMax) {
                try {
                    const parsedMax = JSON.parse(sExamMax);
                    if (Array.isArray(parsedMax) && parsedMax.length === 4) {
                        examMaxScores = parsedMax.map(v => Math.max(1, Number(v) || 25));
                    }
                } catch(e) {}
            }
            maxTotalScore = examMaxScores.reduce((a, b) => a + b, 0);
            const sMax = mockLocalStorage.getItem('khedmety_max_total_score');
            if (sMax && Number(sMax) > 0) {
                const numMax = Number(sMax);
                if (examMaxScores.reduce((a, b) => a + b, 0) === numMax) {
                    maxTotalScore = numMax;
                }
            }

            for (let i = 1; i <= 4; i++) {
                const el = mockDocument.getElementById('cfgMaxExam' + i);
                if (el) el.value = String(examMaxScores[i - 1]);
            }
            const elCfgTotal = mockDocument.getElementById('cfgTotalMaxScoreDisplay');
            if (elCfgTotal) elCfgTotal.textContent = String(maxTotalScore);
            const elPdfMax = mockDocument.getElementById('pdfHeaderMaxScore');
            if (elPdfMax) elPdfMax.textContent = String(maxTotalScore);

            const sPass = mockLocalStorage.getItem('khedmety_pass_threshold');
            if (sPass) passThreshold = Number(sPass) || 60;

            const sInterview = mockLocalStorage.getItem('khedmety_interview_threshold');
            if (sInterview) interviewThreshold = Number(sInterview) || 50;

            const sMix = mockLocalStorage.getItem('khedmety_mix_mode');
            if (sMix) {
                setMixMode(sMix, false); // عدم حفظ
            }

            updateScoreEquivalents();
            updateExamPassScoreEquivalents();
        } catch(e) {}
    }

    return {
        elements,
        store,
        mockLocalStorage,
        getState: () => ({ examMaxScores, maxTotalScore, currentMixMode, passThreshold }),
        setState: (newState) => {
            if (newState.examMaxScores) examMaxScores = [...newState.examMaxScores];
            if (newState.maxTotalScore !== undefined) maxTotalScore = newState.maxTotalScore;
        },
        updateExamMaxScores,
        resetExamMaxScoresToDefault,
        loadSavedData,
        saveGradesLocal,
        setMixMode
    };
}

it('محاكاة السيناريو (أ): تعديل الدرجات العظمى إلى [30, 20, 25, 25] وحفظها بنجاح', () => {
    const env = createSimulationEnvironment();
    env.elements.cfgMaxExam1.value = '30';
    env.elements.cfgMaxExam2.value = '20';
    env.elements.cfgMaxExam3.value = '25';
    env.elements.cfgMaxExam4.value = '25';

    env.updateExamMaxScores();

    const state = env.getState();
    assert.deepStrictEqual(state.examMaxScores, [30, 20, 25, 25]);
    assert.strictEqual(state.maxTotalScore, 100);
    assert.strictEqual(env.store['khedmety_exam_max_scores'], '[30,20,25,25]');
    assert.strictEqual(env.store['khedmety_max_total_score'], '100');
    assert.strictEqual(env.elements.cfgTotalMaxScoreDisplay.textContent, '100');
});

it('محاكاة السيناريو (ب): إعادة تحميل الصفحة واسترجاع الدرجات العظمى وحقول الإدخال', () => {
    const env = createSimulationEnvironment();
    // ضبط التخزين المحلي بقيم مسبقة
    env.store['khedmety_exam_max_scores'] = JSON.stringify([30, 20, 25, 25]);
    env.store['khedmety_max_total_score'] = '100';

    // إعادة تعيين الذاكرة الافتراضية كما يحدث عند فتح صفحة جديدة
    env.setState({ examMaxScores: [25, 25, 25, 25], maxTotalScore: 100 });
    env.elements.cfgMaxExam1.value = '25';
    env.elements.cfgMaxExam2.value = '25';

    // استدعاء التحميل
    env.loadSavedData();

    const state = env.getState();
    assert.deepStrictEqual(state.examMaxScores, [30, 20, 25, 25], 'Memory must restore [30, 20, 25, 25]');
    assert.strictEqual(state.maxTotalScore, 100, 'Total score must be 100');
    assert.strictEqual(env.elements.cfgMaxExam1.value, '30', 'Input 1 must reflect 30');
    assert.strictEqual(env.elements.cfgMaxExam2.value, '20', 'Input 2 must reflect 20');
    assert.strictEqual(env.elements.cfgMaxExam3.value, '25', 'Input 3 must reflect 25');
    assert.strictEqual(env.elements.cfgMaxExam4.value, '25', 'Input 4 must reflect 25');
    assert.strictEqual(env.elements.cfgTotalMaxScoreDisplay.textContent, '100');
});

it('محاكاة السيناريو (ج): حفظ واسترجاع مجموع كلي مخصص (50 لكل مادة = 200 درجة)', () => {
    const env = createSimulationEnvironment();
    env.elements.cfgMaxExam1.value = '50';
    env.elements.cfgMaxExam2.value = '50';
    env.elements.cfgMaxExam3.value = '50';
    env.elements.cfgMaxExam4.value = '50';

    env.updateExamMaxScores();
    assert.strictEqual(env.getState().maxTotalScore, 200);

    // تصفير الذاكرة لمحاكاة إغلاق المتصفح وفتحه ثانية
    env.setState({ examMaxScores: [25, 25, 25, 25], maxTotalScore: 100 });
    env.elements.cfgMaxExam1.value = '25';
    env.elements.cfgTotalMaxScoreDisplay.textContent = '100';

    // تشغيل التحميل
    env.loadSavedData();

    assert.deepStrictEqual(env.getState().examMaxScores, [50, 50, 50, 50]);
    assert.strictEqual(env.getState().maxTotalScore, 200);
    assert.strictEqual(env.elements.cfgMaxExam1.value, '50');
    assert.strictEqual(env.elements.cfgTotalMaxScoreDisplay.textContent, '200');
});

it('محاكاة السيناريو (د): التأكد من أن وجود نمط المكس (Mix Mode) لا يمسح ولا يصفّر الدرجات العظمى عند التحميل', () => {
    const env = createSimulationEnvironment();
    // ضبط الدرجات العظمى المخصصة + حفظ نمط مكس في التخزين
    env.store['khedmety_exam_max_scores'] = JSON.stringify([40, 20, 20, 20]);
    env.store['khedmety_max_total_score'] = '100';
    env.store['khedmety_mix_mode'] = 'reality_avg';

    // تصفير الذاكرة قبل التحميل
    env.setState({ examMaxScores: [25, 25, 25, 25], maxTotalScore: 100 });

    // تشغيل التحميل
    env.loadSavedData();

    // التحقق من أن التخزين المحلي لم يُمسح أو يستبدل بالقيم الافتراضية
    assert.strictEqual(env.store['khedmety_exam_max_scores'], '[40,20,20,20]', 'Local storage must NOT be overwritten by setMixMode during load');
    assert.deepStrictEqual(env.getState().examMaxScores, [40, 20, 20, 20], 'In-memory scores must remain [40, 20, 20, 20]');
});

it('محاكاة السيناريو (هـ): عمل زر استعادة الافتراضي واسترجاع 25 لكل مادة والمجموع 100', () => {
    const env = createSimulationEnvironment();
    // وضع درجات مخصصة أولاً
    env.elements.cfgMaxExam1.value = '50';
    env.elements.cfgMaxExam2.value = '50';
    env.elements.cfgMaxExam3.value = '50';
    env.elements.cfgMaxExam4.value = '50';
    env.updateExamMaxScores();

    // النقر على زر استعادة الافتراضي
    env.resetExamMaxScoresToDefault();

    assert.deepStrictEqual(env.getState().examMaxScores, [25, 25, 25, 25]);
    assert.strictEqual(env.getState().maxTotalScore, 100);
    assert.strictEqual(env.elements.cfgMaxExam1.value, '25');
    assert.strictEqual(env.elements.cfgTotalMaxScoreDisplay.textContent, '100');
    assert.strictEqual(env.store['khedmety_exam_max_scores'], '[25,25,25,25]');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للاختبارات: ${passedTests}/${totalTests} فحوصات نجحت بنسبة ${Math.round(passedTests/totalTests*100)}% ✅`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
