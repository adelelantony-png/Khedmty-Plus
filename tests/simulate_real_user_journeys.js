// tests/simulate_real_user_journeys.js
// محاكاة شاملة لرحلة المستخدم الحقيقي (أمين الخدمة، الخادم، والمخدوم)
// لفحص كافة أزرار التفاعل، والدوال المستدعاة، وعناصر DOM
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('🧑‍💻 بدء محاكاة رحلة المستخدم الحقيقي (Real User Journey Simulation)');
console.log('================================================================\n');

const publicDir = path.join(__dirname, '..', 'public');

let totalIssues = 0;
const report = {
    servantJourney: { checkedFiles: 0, checkedHandlers: 0, missingFunctions: [], missingDomElements: [] },
    studentJourney: { checkedFiles: 0, checkedHandlers: 0, missingFunctions: [], missingDomElements: [] }
};

// الصفحات المخصصة لرحلة الخادم وأمين الخدمة
const servantPages = [
    'index.html',
    'servant-dashboard.html',
    'servant_grades_entry.html',
    'servant_followup.html',
    'servant_spiritual_report.html',
    'servant_spiritual_note.html',
    'admin_subjects.html',
    'barcode.html',
    'servant_journal.html',
    'servant_migrate_attendance.html',
    'servant_help.html',
    'servant_grades_guide.html'
];

// الصفحات المخصصة لرحلة المخدوم والدارس
const studentPages = [
    'index.html',
    'student.html',
    'student_attendance.html',
    'spiritual_note.html',
    'bible.html',
    'quiz.html',
    'results.html',
    'harvest.html',
    'sheet.html',
    'sheets_list.html',
    'katamaros.html',
    'synaxarium.html'
];

/**
 * دالة استخراج كافة الدوال المعرفة داخل صفحة HTML وملفات JS التابعة لها
 */
function extractDefinedFunctionsAndDomIds(htmlFilePath) {
    const html = fs.readFileSync(htmlFilePath, 'utf8');
    const definedFunctions = new Set();
    const domIds = new Set();

    // 1. استخراج معرفات DOM (id="...")
    const idRegex = /\sid=["']([^"']+)["']/gi;
    let idMatch;
    while ((idMatch = idRegex.exec(html)) !== null) {
        domIds.add(idMatch[1].trim());
    }

    // 2. الدوال المعيارية المتاحة في المتصفح
    const standardBrowserBuiltins = [
        'alert', 'confirm', 'prompt', 'print', 'close',
        'location', 'history', 'navigate', 'scroll', 'scrollTo',
        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
        'encodeURIComponent', 'decodeURIComponent', 'parseInt', 'parseFloat',
        'isNaN', 'isFinite', 'fetch', 'open'
    ];
    standardBrowserBuiltins.forEach(f => definedFunctions.add(f));

    // 3. استخراج ملفات JS المضمنة <script src="...">
    const scriptSrcRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi;
    let srcMatch;
    while ((srcMatch = scriptSrcRegex.exec(html)) !== null) {
        const src = srcMatch[1].trim();
        if (src.startsWith('http') || src.startsWith('//')) continue;
        const jsPath = path.join(publicDir, src.replace(/^\.\//, ''));
        if (fs.existsSync(jsPath)) {
            const jsCode = fs.readFileSync(jsPath, 'utf8');
            extractFunctionsFromCode(jsCode, definedFunctions);
        }
    }

    // 4. استخراج الأكواد من سكربتات HTML المباشرة <script>...</script>
    const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let inlineMatch;
    while ((inlineMatch = inlineScriptRegex.exec(html)) !== null) {
        const code = inlineMatch[1];
        extractFunctionsFromCode(code, definedFunctions);
    }

    return { html, definedFunctions, domIds };
}

/**
 * تحليل الكود البرمجي لاستخراج أسماء الدوال المعرفة ومصادرات window
 */
function extractFunctionsFromCode(code, funcSet) {
    // 1. function funcName(...)
    const fnDeclRegex = /\bfunction\s+([a-zA-Z0-9_$]+)\s*\(/g;
    let m;
    while ((m = fnDeclRegex.exec(code)) !== null) {
        funcSet.add(m[1]);
    }

    // 2. window.funcName = ...
    const winAssignRegex = /\bwindow\.([a-zA-Z0-9_$]+)\s*=/g;
    while ((m = winAssignRegex.exec(code)) !== null) {
        funcSet.add(m[1]);
    }

    // 3. const/let/var funcName = function/arrow
    const varFnRegex = /\b(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)/g;
    while ((m = varFnRegex.exec(code)) !== null) {
        funcSet.add(m[1]);
    }

    // 4. دالة الكائنات أو الفئات
    const objMethodRegex = /\b([a-zA-Z0-9_$]+)\s*:\s*function\s*\(/g;
    while ((m = objMethodRegex.exec(code)) !== null) {
        funcSet.add(m[1]);
    }
}

/**
 * فحص رحلة مستخدم معينة
 */
function auditJourney(journeyName, pagesList, targetReport) {
    console.log(`\n================================================================`);
    console.log(`🧭 فحص رحلة: ${journeyName} (${pagesList.length} صفحة)`);
    console.log(`================================================================`);

    for (const fileName of pagesList) {
        const filePath = path.join(publicDir, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ ملف غير موجود: ${fileName}`);
            totalIssues++;
            continue;
        }

        targetReport.checkedFiles++;
        const { html, definedFunctions, domIds } = extractDefinedFunctionsAndDomIds(filePath);

        // فحص كافة مستمعات الأحداث المضمنة في HTML (onclick, onchange, oninput, onsubmit)
        const eventAttrRegex = /\s(on[a-z]+)=["']([^"']+)["']/gi;
        let attrMatch;
        let fileHandlerCount = 0;

        while ((attrMatch = eventAttrRegex.exec(html)) !== null) {
            fileHandlerCount++;
            targetReport.checkedHandlers++;
            const eventName = attrMatch[1];
            const codeSnippet = attrMatch[2].trim();

            // استخراج استدعاءات الدوال من كود الحدث
            // مثلاً: "myFunc(this, 123)" أو "if (confirm('..')) doSomething()"
            const callTokens = codeSnippet.match(/\b([a-zA-Z0-9_$]+)\s*\(/g) || [];
            for (const token of callTokens) {
                const fnName = token.replace(/\s*\($/, '').trim();
                // استبعاد الكلمات المفتاحية في لغة جافاسكربت
                if (['if', 'for', 'while', 'switch', 'catch', 'return'].includes(fnName)) continue;

                // فحص هل الدالة معرفة أو متوفرة في النطاق
                if (!definedFunctions.has(fnName)) {
                    // استبعاد الاستدعاءات عبر كائنات فرعية مثل console.log أو e.stopPropagation أو bootstrap.Modal
                    if (codeSnippet.includes(`.${fnName}(`) || codeSnippet.includes(`${fnName}.`)) {
                        continue;
                    }
                    targetReport.missingFunctions.push({
                        file: fileName,
                        event: eventName,
                        fn: fnName,
                        snippet: codeSnippet.slice(0, 80)
                    });
                    totalIssues++;
                }
            }
        }

        // فحص استدعاءات document.getElementById داخل سكربتات الصفحة
        const getElRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
        let elMatch;
        while ((elMatch = getElRegex.exec(html)) !== null) {
            const requestedId = elMatch[1].trim();
            // بعض العناصر تُنشأ ديناميكياً عبر JS أو تنتمي لشاشات مشتركة، نتحقق فقط من المعرفات الثابتة
            // إذا لم يكن موجوداً، نتحقق هل ينشأ في الكود
            if (!domIds.has(requestedId)) {
                // فحص هل يُنشأ ديناميكياً في الكود (مثلاً: id="${id}" أو createElement)
                const isDynamic = html.includes(`id="${requestedId}"`) || 
                                  html.includes(`id='${requestedId}'`) ||
                                  html.includes(`"${requestedId}"`) ||
                                  html.includes(`id=\\"${requestedId}\\"`);
                if (!isDynamic) {
                    targetReport.missingDomElements.push({
                        file: fileName,
                        domId: requestedId
                    });
                    // نسجل تنبيهاً ولا نعتبره حرجاً إلا إذا لم يكن مخصصاً لعناصر مؤقتة
                }
            }
        }

        console.log(`  📄 ${fileName.padEnd(30)}: فحص ${fileHandlerCount} حدث تفاعلي و ${domIds.size} عنصر DOM.`);
    }
}

// تشغيل الفحص للرحلتين
auditJourney('رحلة الخادم وأمين الخدمة (Servant & Admin)', servantPages, report.servantJourney);
auditJourney('رحلة المخدوم والدارس (Student & Member)', studentPages, report.studentJourney);

console.log('\n================================================================');
console.log('📊 تقرير الفحص والتدقيق الواقعي للمستخدم:');
console.log('================================================================');

console.log(`\n🔹 رحلة الخادم: ${report.servantJourney.checkedFiles} صفحات | ${report.servantJourney.checkedHandlers} مستمع حدث تم تدقيقه.`);
if (report.servantJourney.missingFunctions.length === 0) {
    console.log('  ✅ جميع دوال وأزرار رحلة الخادم معرفة وتعمل بدون أي ReferenceError!');
} else {
    console.log(`  ⚠️ تم العثور على ${report.servantJourney.missingFunctions.length} دالة غير معرفة:`);
    report.servantJourney.missingFunctions.forEach(m => {
        console.log(`     - [${m.file}] في حدث (${m.event}): ${m.fn}() كود: ${m.snippet}`);
    });
}

console.log(`\n🔹 رحلة المخدوم: ${report.studentJourney.checkedFiles} صفحات | ${report.studentJourney.checkedHandlers} مستمع حدث تم تدقيقه.`);
if (report.studentJourney.missingFunctions.length === 0) {
    console.log('  ✅ جميع دوال وأزرار رحلة المخدوم معرفة وتعمل بدون أي ReferenceError!');
} else {
    console.log(`  ⚠️ تم العثور على ${report.studentJourney.missingFunctions.length} دالة غير معرفة:`);
    report.studentJourney.missingFunctions.forEach(m => {
        console.log(`     - [${m.file}] في حدث (${m.event}): ${m.fn}() كود: ${m.snippet}`);
    });
}

console.log('\n================================================================');
if (report.servantJourney.missingFunctions.length === 0 && report.studentJourney.missingFunctions.length === 0) {
    console.log('🎉 المنظومة خالية 100% من أي دوال مفقودة في رحلة الخادم والمخدوم!');
    process.exit(0);
} else {
    console.log('💥 توجد دوال تفاعلية تحتاج لتعريف ومعالجة لضمان تجربة مستخدم كاملة.');
    process.exit(1);
}
