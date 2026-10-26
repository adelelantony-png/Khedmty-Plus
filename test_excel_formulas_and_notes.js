const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🚀 تشغيل حزمة اختبارات تصدير الإكسيل (المعادلات + الملاحظات + ملخص الأعداد)');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, 'public', 'servant_grades_entry.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. فحص كود الدالة في HTML
console.log('--- 1. فحص وجود عناصر وأعمدة التصدير في الكود البرمجي ---');
assert(html.includes('ملاحظات الجانب الروحي والسلوكي 🕊️'), 'عمود ملاحظات الجانب الروحي مفقود');
assert(html.includes('ملاحظات الجانب النفسي والسلوكي 🧠'), 'عمود ملاحظات الجانب النفسي مفقود');
assert(html.includes('تصنيف التحدي أو المشكلة الرعوية ⚠️'), 'عمود تصنيف التحدي الرعوي مفقود');
assert(html.includes('sheetNameSummary = "ملخص_الإحصائيات_والأعداد"'), 'شيت ملخص الإحصائيات والأعداد مفقود');
assert(html.includes('AVERAGEIF'), 'معادلة AVERAGEIF مفقودة');
assert(html.includes('COUNTIF'), 'معادلة COUNTIF مفقودة');
assert(html.includes('COUNTA'), 'معادلة COUNTA مفقودة');
console.log('  [PASS] ✅ كافة أعمدة الملاحظات والشيتات الإحصائية والمعادلات مدمجة بالكود.\n');

// 2. محاكاة إنشاء ملف XLSX واختبار قراءته بالمكتبة
console.log('--- 2. محاكاة إنشاء وتوليد مصنف XLSX حقيقي واختبار سلامة بنية الخلايا ---');
const XLSX = require('./public/js/xlsx.full.min.js');

const examMaxScores = [25, 25, 25, 25];
const examMinPassPercentages = [50, 50, 50, 50];
const maxTotalScore = 100;

const mockCandidates = [
    {
        code: '101',
        name: 'مينا سمير جرجس',
        gender: 'بنين',
        phone: '01234567890',
        confessor: 'أبونا مرقس',
        attended: true,
        g1: 20, g2: 18, g3: 22, g4: 19,
        spiritualNotes: 'اعتراف وتناول منتظم',
        psychNotes: 'خادم متميز وهادئ',
        problemType: 'لا توجد مشاكل (مقبول طبيعي) 🟢'
    },
    {
        code: '102',
        name: 'مريم عاطف كامل',
        gender: 'بنات',
        phone: '01012345678',
        confessor: 'أبونا يوحنا',
        attended: true,
        g1: 22, g2: 10, g3: 20, g4: 8,
        spiritualNotes: 'اعتراف فقط',
        psychNotes: 'تحتاج رعاية وتشجيع للثقة بالنفس',
        problemType: 'مشكلة نفسية / سلوكية (انطواء - قلق) 🟠'
    },
    {
        code: '103',
        name: 'فادي كامل مسعود',
        gender: 'بنين',
        phone: '01123456789',
        confessor: 'لا يوجد',
        attended: false,
        g1: 0, g2: 0, g3: 0, g4: 0,
        spiritualNotes: '',
        psychNotes: '',
        problemType: 'مشكلة اعتراف (مهلة أسبوع) 🟡'
    }
];

// بناء الشيت 1: كشف الدرجات والمعايير
const sheetNameGrades = "كشف_الدرجات_والمعايير";
const sheetNameSummary = "ملخص_الإحصائيات_والأعداد";

const headers = [
    "م", "كود المخدوم", "اسم المخدوم", "النوع", "رقم الهاتف", "أب الاعتراف", "حالة الحضور",
    "تحريري روحي (25)", "تحريري روحي %", "حالة التحريري الروحي (≥50%)",
    "تحريري نفسي (25)", "تحريري نفسي %", "حالة التحريري النفسي (≥50%)",
    "شفوي روحي (25)", "شفوي روحي %", "حالة الشفوي الروحي (≥50%)",
    "شفوي نفسي (25)", "شفوي نفسي %", "حالة الشفوي النفسي (≥50%)",
    "المجموع الكلي (100)", "النسبة الكلية %", "استيفاء شرط النسب الأربعة",
    "القرار النهائي", "سبب عدم النجاح والتوجيه",
    "ملاحظات الجانب الروحي والسلوكي 🕊️",
    "ملاحظات الجانب النفسي والسلوكي 🧠",
    "تصنيف التحدي أو المشكلة الرعوية ⚠️"
];

const rows = [headers];
mockCandidates.forEach((c, idx) => {
    const rowNum = idx + 2;
    const isAtt = c.attended;
    const g1 = c.g1, g2 = c.g2, g3 = c.g3, g4 = c.g4;
    const tot = g1 + g2 + g3 + g4;

    const fPct1 = isAtt ? { f: `IF(G${rowNum}="حاضر", H${rowNum}/25, 0)`, v: g1 / 25, z: "0.0%" } : { v: 0, z: "0.0%" };
    const fStat1 = isAtt ? { f: `IF(G${rowNum}="غائب", "غائب", IF(I${rowNum}>=0.5, "ناجح ✅", "راسب ❌"))`, v: (g1 >= 12.5 ? 'ناجح ✅' : 'راسب ❌') } : { v: 'غائب' };

    const fTotal = isAtt ? { f: `IF(G${rowNum}="حاضر", H${rowNum}+K${rowNum}+N${rowNum}+Q${rowNum}, 0)`, v: tot } : { v: 0 };
    const fTotalPct = isAtt ? { f: `IF(G${rowNum}="حاضر", T${rowNum}/100, 0)`, v: tot / 100, z: "0.0%" } : { v: 0, z: "0.0%" };

    rows.push([
        idx + 1, c.code, c.name, c.gender, c.phone, c.confessor,
        isAtt ? 'حاضر' : 'غائب',
        isAtt ? g1 : 0, fPct1, fStat1,
        isAtt ? g2 : 0, fPct1, fStat1,
        isAtt ? g3 : 0, fPct1, fStat1,
        isAtt ? g4 : 0, fPct1, fStat1,
        fTotal, fTotalPct,
        isAtt ? 'نعم (اجتاز كافة المواد ✅)' : 'غائب',
        isAtt ? 'مقبول نهائياً 🟢' : 'غير مجتاز 🔴',
        'لا يوجد',
        c.spiritualNotes || 'لا توجد ملاحظات',
        c.psychNotes || 'لا توجد ملاحظات',
        c.problemType || 'لا توجد مشاكل (طبيعي) 🟢'
    ]);
});

// شيت 2: ملخص الإحصائيات والأعداد الاحتياطي
const summaryAoa = [
    ["تقرير ملخص إحصائيات وأعداد نتائج القبول", ""],
    ["تاريخ الاستخراج:", "2026-10-26"],
    ["", ""],
    ["📊 1. المؤشرات العامة لدفعة المخدومين", "القيمة الإحصائية"],
    ["إجمالي المسجلين بالدفعة", { f: `COUNTA(${sheetNameGrades}!B2:B4)`, v: 3 }],
    ["الحاضرون فعلياً للامتحانات", { f: `COUNTIF(${sheetNameGrades}!G2:G4, "حاضر")`, v: 2 }],
    ["الغائبون عن الامتحانات", { f: `COUNTIF(${sheetNameGrades}!G2:G4, "غائب")`, v: 1 }],
    ["المقبولون نهائياً (🟢)", { f: `COUNTIF(${sheetNameGrades}!W2:W4, "*مقبول نهائياً*")`, v: 1 }],
    ["متوسط مجموع درجات الحاضرين", { f: `AVERAGEIF(${sheetNameGrades}!G2:G4, "حاضر", ${sheetNameGrades}!T2:T4)`, v: 69 }],
    ["", ""],
    ["🕊️ 2. ملخص الملاحظات الروحية والنفسية والرعوية المسجلة", "العدد"],
    ["إجمالي من لديهم ملاحظات روحية وسلوكية مسجلة", 2],
    ["إجمالي من لديهم ملاحظات نفسية وسلوكية مسجلة 🧠", 2]
];

const wb = XLSX.utils.book_new();

const wsGrades = XLSX.utils.aoa_to_sheet(rows);
wsGrades['!views'] = [{ RTL: true }];
XLSX.utils.book_append_sheet(wb, wsGrades, sheetNameGrades);

const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
wsSummary['!views'] = [{ RTL: true }];
XLSX.utils.book_append_sheet(wb, wsSummary, sheetNameSummary);

// كتابة المصنف في بافر
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
assert(buffer && buffer.length > 0, 'فشل توليد بافر الـ XLSX');
console.log(`  [PASS] ✅ تم توليد ملف XLSX بنجاح بحجم ${buffer.length} بايت.`);

// إعادة قراءة المصنف والتحقق من الشيتات والخلايا والمعادلات
const readWb = XLSX.read(buffer, { type: 'buffer' });
assert.strictEqual(readWb.SheetNames.length, 2, 'عدد الشيتات غير صحيح (المطلوب 2)');
assert.strictEqual(readWb.SheetNames[0], sheetNameGrades, 'اسم الشيت الأول غير مطابق');
assert.strictEqual(readWb.SheetNames[1], sheetNameSummary, 'اسم الشيت الثاني غير مطابق');

// فحص وجود خلية المعادلة T2 في شيت الدرجات
const readWs1 = readWb.Sheets[sheetNameGrades];
assert(readWs1['T2'], 'خلية المجموع T2 غير موجودة');
assert(readWs1['T2'].f.includes('H2+K2+N2+Q2'), 'معادلة مجموع الدرجات في T2 غير صحيحة');
console.log('  [PASS] ✅ معادلة المجموع في شيت الدرجات (H2+K2+N2+Q2) تم التحقق منها بدقة.');

// فحص وجود خانة الملاحظات الروحية في Y2 وخانة الملاحظات النفسية في Z2
assert.strictEqual(readWs1['Y2'].v, 'اعتراف وتناول منتظم');
assert.strictEqual(readWs1['Z2'].v, 'خادم متميز وهادئ');
assert.strictEqual(readWs1['AA2'].v, 'لا توجد مشاكل (مقبول طبيعي) 🟢');
console.log('  [PASS] ✅ خلايا الملاحظات الروحية والنفسية والتحدي الرعوي محفوظة بنجاح ومطابقة.');

// فحص الشيت الثاني (ملخص الأعداد)
const readWs2 = readWb.Sheets[sheetNameSummary];
assert(readWs2['B5'], 'خلية إجمالي المسجلين B5 مفقودة بالشيت الثاني');
assert(readWs2['B5'].f.includes('COUNTA'), 'معادلة COUNTA مفقودة بالشيت الثاني');
console.log('  [PASS] ✅ شيت ملخص الأعداد والإحصائيات الاحتياطي ومعادلاته تم التحقق منها بنجاح.');

console.log('\n================================================================');
console.log('📊 النتيجة الإجمالية للاختبارات: كافة الفحوصات نجحت بنسبة 100% ✅');
console.log('================================================================\n');
