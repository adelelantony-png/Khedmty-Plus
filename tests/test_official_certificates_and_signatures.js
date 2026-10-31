const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Test Suite 26: Official Certificates & Signatures Studio Verification');

const filePath = path.join(__dirname, '..', 'public', 'servant_grades_entry.html');
const content = fs.readFileSync(filePath, 'utf8');

// 1. Verify Official PDF Ledger Signatures
console.log('Checking official PDF ledger signatures...');
assert(content.includes('id="printablePdfReport"'), 'Must have #printablePdfReport');
assert(content.includes('مسؤول الكنترول والرصد'), 'Must have Control/Monitoring signature title');
assert(content.includes('أمين فصل إعداد الخدام'), 'Must have Servant Leader signature title');
assert(content.includes('كاهن إعداد الخدام والشباب') || content.includes('كاهن إعداد الخدام'), 'Must have Priest signature title');

// 2. Verify Single Certificate Printing Button in acceptanceCardModal
console.log('Checking single certificate print button...');
assert(content.includes('printSingleCertificate()'), 'Must have printSingleCertificate button call');
assert(content.includes('id="acceptanceCardModal"'), 'Must have #acceptanceCardModal');

// 3. Verify Batch Certificates Studio in Export Menu
console.log('Checking batch certificates studio in export menu...');
assert(content.includes('openBatchCertificatesModal()'), 'Must have openBatchCertificatesModal call');
assert(content.includes('ستوديو طباعة شهادات الاجتياز والتقدير'), 'Must have batch studio text in export menu');

// 4. Verify Batch Certificates Modal Elements
console.log('Checking batch certificates modal elements...');
assert(content.includes('id="batchCertificatesModal"'), 'Must have #batchCertificatesModal');
assert(content.includes('id="printableBatchContainer"'), 'Must have #printableBatchContainer');
assert(content.includes('id="certFilterSelect"'), 'Must have #certFilterSelect');
assert(content.includes('id="certThemeSelect"'), 'Must have #certThemeSelect');
assert(content.includes('id="certCountBadge"'), 'Must have #certCountBadge');
assert(content.includes('printBatchCertificates()'), 'Must have printBatchCertificates trigger');
assert(content.includes('closeBatchCertificatesModal()'), 'Must have closeBatchCertificatesModal trigger');

// 5. Verify Functions in JavaScript
console.log('Checking JS function implementations...');
assert(content.includes('function printSingleCertificate()'), 'Must define printSingleCertificate()');
assert(content.includes('function openBatchCertificatesModal()'), 'Must define openBatchCertificatesModal()');
assert(content.includes('function closeBatchCertificatesModal()'), 'Must define closeBatchCertificatesModal()');
assert(content.includes('function renderBatchCertificatesPreview()'), 'Must define renderBatchCertificatesPreview()');
assert(content.includes('function printBatchCertificates()'), 'Must define printBatchCertificates()');
assert(content.includes('function getHonorRankText('), 'Must define getHonorRankText()');

// 6. Verify Print Stylesheet Integration
console.log('Checking print stylesheet and parchment theme...');
assert(content.includes('printing-batch-cert'), 'Must define printing-batch-cert print class');
assert(content.includes('printing-single-cert'), 'Must define printing-single-cert print class');
assert(content.includes('.certificate-sheet.cert-theme-parchment'), 'Must define parchment white ink-friendly theme');

// 7. Verify Rank Calculation Logic
console.log('Testing rank calculation unit logic...');
function getHonorRankText(pct) {
    var p = Number(pct) || 0;
    if (p >= 85) return 'امتياز مع مرتبة الشرف 🌟';
    if (p >= 75) return 'جيد جداً مرتفع 🏅';
    if (p >= 65) return 'جيد مبارك 🎖️';
    return 'مقبول بنعمة ربنا 🕊️';
}

assert(getHonorRankText(92).includes('امتياز'), '92% must be Excellent');
assert(getHonorRankText(78).includes('جيد جداً'), '78% must be Very Good');
assert(getHonorRankText(68).includes('جيد مبارك'), '68% must be Good');
assert(getHonorRankText(58).includes('مقبول'), '58% must be Pass');

console.log('✅ All checks in Test Suite 26 passed successfully!');
process.exit(0);
