// tests/test_full_platform_syntax_and_ui.js - فحص شامل لصحة جميع واجهات المنظومة (27 صفحة HTML)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🌐 فحص جودة واجهات المنظومة (Full Platform UI & Syntax)');
console.log('====================================================\n');

const publicDir = path.join(__dirname, '..', 'public');
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html') && !f.includes('.bak') && !f.includes('backup'));

console.log(`تم العثور على ${htmlFiles.length} صفحة HTML رسمية للفحص.\n`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  [PASS] ${testName}`);
    } catch (err) {
        failedTests++;
        console.error(`  [FAIL] ${testName}`);
        console.error(`         ${err.message}`);
    }
}

// 1. فحص دعم اللغة العربية واتجاه RTL والتصميم المتجاوب في كل صفحة
htmlFiles.forEach(file => {
    runTest(`فحص ترويسة وتجاوب الصفحة: ${file}`, () => {
        const content = fs.readFileSync(path.join(publicDir, file), 'utf8');

        // فحص اتجاه RTL واللغة العربية
        assert.ok(
            content.includes('dir="rtl"') || content.includes("dir='rtl'"),
            `الصفحة ${file} يجب أن تتضمن dir="rtl"`
        );
        assert.ok(
            content.includes('lang="ar"') || content.includes("lang='ar'"),
            `الصفحة ${file} يجب أن تتضمن lang="ar"`
        );

        // فحص وسم viewport للأجهزة الذكية
        assert.ok(
            content.includes('name="viewport"'),
            `الصفحة ${file} يجب أن تتضمن وسم viewport لتجاوب الهواتف والأجهزة اللوحية`
        );

        // فحص سلامة التشفير (عدم وجود أحرف غير قابلة للتعرف \uFFFD)
        assert.ok(
            !content.includes('\uFFFD'),
            `الصفحة ${file} لا يجب أن تتضمن محارف نصية مشوهة`
        );
    });
});

// 2. فحص التركيب النحوي لجميع سكربتات JS المضمنة في صفحات HTML
htmlFiles.forEach(file => {
    runTest(`فحص سلامة أكواد JavaScript في: ${file}`, () => {
        const content = fs.readFileSync(path.join(publicDir, file), 'utf8');
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        let blockIndex = 0;

        while ((match = scriptRegex.exec(content)) !== null) {
            blockIndex++;
            const scriptCode = match[1].trim();
            // تخطي السكربتات الفارغة أو التي تستورد src خارجي فقط
            if (!scriptCode || match[0].includes('type="application/ld+json"') || match[0].includes('type="text/template"')) {
                continue;
            }
            try {
                new Function(scriptCode);
            } catch (err) {
                throw new Error(`خطأ نحوي في السكربت الداخلي رقم #${blockIndex} في ${file}: ${err.message}`);
            }
        }
    });
});

// 3. فحص الروابط المحلية للملفات (CSS / JS / Icons) لضمان عدم وجود روابط ميتة
htmlFiles.forEach(file => {
    runTest(`فحص الروابط والمكتبات المحلية في: ${file}`, () => {
        const content = fs.readFileSync(path.join(publicDir, file), 'utf8');
        const assetRegex = /(?:src|href)=["']([^"':#?]+(?:\.css|\.js|\.json|\.png|\.ico))["']/gi;
        let match;

        while ((match = assetRegex.exec(content)) !== null) {
            const assetRelPath = match[1].replace(/^\.\//, '');
            // استبعاد الروابط السحابية والمطلقة
            if (assetRelPath.startsWith('http') || assetRelPath.startsWith('//')) continue;

            const assetFullPath = path.join(publicDir, assetRelPath);
            assert.ok(
                fs.existsSync(assetFullPath),
                `الملف المرجعي [${assetRelPath}] غير موجود في المسار المطلوب بالصفحة ${file}`
            );
        }
    });
});

console.log('\n====================================================');
console.log(`إجمالي الفحوصات: ${totalTests} | الناجحة: ${passedTests} | الفاشلة: ${failedTests}`);
console.log('====================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
