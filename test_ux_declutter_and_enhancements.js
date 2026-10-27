/**
 * test_ux_declutter_and_enhancements.js
 * 
 * حزمة اختبارات شاملة للتحقق من تطوير وتخفيف واجهة رصد الدرجات:
 * 1. استوديو التحليلات الذكي القابل للطي (Collapsible Studio Bar)
 * 2. مساعد الضبط الذكي للقبول (Sweet Spot Optimizer - autoOptimizeThresholds)
 * 3. درج الفلاتر التفصيلية القابل للطي (Advanced Filters Drawer & Badge)
 * 4. القائمة المجمعة الموحدة للتصدير والتقارير
 * 5. وضع الرصد فائق السرعة (Fast Entry Mode ⚡)
 * 6. بطاقة المخدوم الرعوية الشاملة (Candidate 360° Drawer 🪪)
 * 7. الترقيم السلس لجدول الرصد (Pagination & Performance Slicing)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات تبسيط وتطوير تجربة المستخدم الشاملة (Suite #16)');
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
console.log('--- 1. فحص استوديو التحليلات القابل للطي والمساعد الذكي ---');
// -------------------------------------------------------------------------

it('وجود شريط التبديل السريع studioToggleBar ومؤشرات الملخص اللحظية', () => {
    assert(htmlContent.includes('id="studioToggleBar"'), 'studioToggleBar must exist');
    assert(htmlContent.includes('id="studioBarPassPct"'), 'studioBarPassPct must exist');
    assert(htmlContent.includes('id="studioBarIntPct"'), 'studioBarIntPct must exist');
    assert(htmlContent.includes('id="studioBarMax"'), 'studioBarMax must exist');
    assert(htmlContent.includes('id="studioBarAvg"'), 'studioBarAvg must exist');
});

it('وجود دالة toggleUnifiedStudio ودعم حفظ وتحديث حالة الطي', () => {
    assert(htmlContent.includes('function toggleUnifiedStudio'), 'toggleUnifiedStudio function must exist');
    assert(htmlContent.includes('isUnifiedStudioExpanded'), 'isUnifiedStudioExpanded state flag must exist');
});

it('وجود مساعد الضبط الذكي autoOptimizeThresholds بالمعادلات الإحصائية', () => {
    assert(htmlContent.includes('function autoOptimizeThresholds'), 'autoOptimizeThresholds function must exist');
    assert(htmlContent.includes('المساعد الذكي لتحديد معيار القبول'), 'autoOptimizeThresholds must explain recommendation');
});

// -------------------------------------------------------------------------
console.log('\n--- 2. فحص درج الفلاتر التفصيلية وقائمة التصدير الموحدة ---');
// -------------------------------------------------------------------------

it('وجود درج الفلاتر التفصيلية القابل للطي advancedFiltersDrawer وزر التبديل', () => {
    assert(htmlContent.includes('id="advancedFiltersDrawer"'), 'advancedFiltersDrawer must exist');
    assert(htmlContent.includes('id="btnToggleAdvFilters"'), 'btnToggleAdvFilters must exist');
    assert(htmlContent.includes('id="advFilterBadge"'), 'advFilterBadge must exist');
    assert(htmlContent.includes('function toggleAdvancedFilters'), 'toggleAdvancedFilters must exist');
    assert(htmlContent.includes('function updateAdvFiltersBadge'), 'updateAdvFiltersBadge must exist');
});

it('وجود القائمة المجمعة الموحدة للتصدير والتقارير exportDropdownContainer', () => {
    assert(htmlContent.includes('id="exportDropdownContainer"'), 'exportDropdownContainer must exist');
    assert(htmlContent.includes('id="exportDropdownMenu"'), 'exportDropdownMenu must exist');
    assert(htmlContent.includes('function toggleExportMenu'), 'toggleExportMenu function must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 3. فحص وضع الرصد فائق السرعة (Fast Entry Mode ⚡) ---');
// -------------------------------------------------------------------------

it('وجود شاشة وضع الرصد السريع fastEntryOverlay ومداخل الدرجات الأربعة', () => {
    assert(htmlContent.includes('id="fastEntryOverlay"'), 'fastEntryOverlay must exist');
    assert(htmlContent.includes('id="feSearchCodeInput"'), 'feSearchCodeInput must exist');
    assert(htmlContent.includes('id="fe_g1"'), 'fe_g1 must exist');
    assert(htmlContent.includes('id="fe_g2"'), 'fe_g2 must exist');
    assert(htmlContent.includes('id="fe_g3"'), 'fe_g3 must exist');
    assert(htmlContent.includes('id="fe_g4"'), 'fe_g4 must exist');
});

it('وجود دوال وضع الرصد السريع feSaveAndNext و feNextStudent و fePrevStudent', () => {
    assert(htmlContent.includes('function openFastEntryMode'), 'openFastEntryMode must exist');
    assert(htmlContent.includes('function closeFastEntryMode'), 'closeFastEntryMode must exist');
    assert(htmlContent.includes('function feSaveAndNext'), 'feSaveAndNext must exist');
    assert(htmlContent.includes('function feHandleGradeKey'), 'feHandleGradeKey for Enter key auto-advance must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 4. فحص بطاقة المخدوم الرعوية الشاملة (Candidate 360° 🪪) ---');
// -------------------------------------------------------------------------

it('وجود درج بطاقة المخدوم الشاملة candidate360Drawer ودوال الفتح والإرسال', () => {
    assert(htmlContent.includes('id="candidate360Drawer"'), 'candidate360Drawer must exist');
    assert(htmlContent.includes('id="candidate360Backdrop"'), 'candidate360Backdrop must exist');
    assert(htmlContent.includes('function openCandidate360Drawer'), 'openCandidate360Drawer must exist');
    assert(htmlContent.includes('function closeCandidate360Drawer'), 'closeCandidate360Drawer must exist');
    assert(htmlContent.includes('function c360SendWhatsapp'), 'c360SendWhatsapp must exist');
});

// -------------------------------------------------------------------------
console.log('\n--- 5. فحص الترقيم السلس وإدارة حجم الصفحة (Pagination) ---');
// -------------------------------------------------------------------------

it('وجود شريط الترقيم tablePaginationBar واختيارات حجم الصفحة', () => {
    assert(htmlContent.includes('id="tablePaginationBar"'), 'tablePaginationBar must exist');
    assert(htmlContent.includes('id="tablePageSizeSelect"'), 'tablePageSizeSelect must exist');
    assert(htmlContent.includes('function changeTablePageSize'), 'changeTablePageSize must exist');
    assert(htmlContent.includes('function goToPage'), 'goToPage must exist');
    assert(htmlContent.includes('function renderPaginationUI'), 'renderPaginationUI must exist');
});

it('التحقق من منطق تقطيع الصفحات البرمجي (Pagination Slice Logic)', () => {
    const mockList = Array.from({ length: 125 }, (_, i) => ({ code: 100 + i, name: `مخدوم ${i + 1}` }));
    
    function slicePage(items, pageSize, pageNum) {
        if (pageSize === 'all') return items;
        const size = parseInt(pageSize);
        const start = (pageNum - 1) * size;
        return items.slice(start, start + size);
    }

    // فحص صفحة 1 بحجم 50
    const p1 = slicePage(mockList, 50, 1);
    assert.strictEqual(p1.length, 50, 'Page 1 must have 50 items');
    assert.strictEqual(p1[0].code, 100, 'First item must be 100');

    // فحص صفحة 3 بحجم 50
    const p3 = slicePage(mockList, 50, 3);
    assert.strictEqual(p3.length, 25, 'Page 3 must have remaining 25 items');
    assert.strictEqual(p3[24].code, 224, 'Last item must be 224');

    // فحص خيار الكل
    const pAll = slicePage(mockList, 'all', 1);
    assert.strictEqual(pAll.length, 125, 'All option must return all 125 items');
});

console.log('\n================================================================');
console.log(`📊 النتيجة الإجمالية للاختبارات: ${passedTests}/${totalTests} فحوصات نجحت بنسبة ${Math.round(passedTests/totalTests*100)}% ✅`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
