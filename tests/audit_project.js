const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const apiDir = path.join(__dirname, '..', 'api');

console.log('====================================================');
console.log('🔍 KHIDMETY PRO — PHASE 1 DEEP PROJECT AUDIT');
console.log('====================================================\n');

// 1. Audit HTML Pages
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
console.log(`Found ${htmlFiles.length} HTML pages in public/:\n`);

let pageAudit = [];
htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const hasRTL = /dir=["']rtl["']/i.test(content);
    const hasLangAr = /lang=["']ar["']/i.test(content);
    const hasAuthClient = /auth-client\.js/i.test(content);
    const hasFirebase = /firebase/i.test(content);
    const hasBootstrap = /bootstrap/i.test(content);
    const hasFontAwesome = /font-awesome/i.test(content);
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '(No title)';

    // Check script src references
    const scriptSrcMatches = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    const localScripts = scriptSrcMatches.filter(s => !s.startsWith('http') && !s.startsWith('//'));
    const missingScripts = localScripts.filter(s => {
        const clean = s.split('?')[0];
        return !fs.existsSync(path.join(publicDir, clean));
    });

    pageAudit.push({
        file,
        title,
        hasRTL,
        hasLangAr,
        hasAuthClient,
        hasFirebase,
        missingScripts
    });
});

console.table(pageAudit.map(p => ({
    File: p.file,
    RTL: p.hasRTL ? '✅' : '❌',
    LangAr: p.hasLangAr ? '✅' : '❌',
    AuthClient: p.hasAuthClient ? '✅' : '⚠️',
    MissingScripts: p.missingScripts.length > 0 ? p.missingScripts.join(', ') : 'None'
})));

// 2. Audit API Endpoints
console.log('\n====================================================');
console.log('🔍 AUDITING API ENDPOINTS (api/):');
console.log('====================================================\n');

const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
let apiAudit = [];

apiFiles.forEach(file => {
    const filePath = path.join(apiDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const usesVerifyAuth = /verifyAuth/i.test(content);
    const usesGetDb = /getDb/i.test(content);
    const hasAdminCheck = /isAdmin/i.test(content);
    const hasStaffCheck = /isStaff/i.test(content);

    apiAudit.push({
        file,
        usesVerifyAuth: usesVerifyAuth ? '✅ YES' : (file === 'health.js' || file === 'login.js' || file === 'public-config.js' ? '⚪ PUBLIC' : '❌ MISSING'),
        usesGetDb: usesGetDb ? '✅ YES' : 'NO',
        hasAdminCheck: hasAdminCheck ? 'YES' : 'NO',
        hasStaffCheck: hasStaffCheck ? 'YES' : 'NO'
    });
});

console.table(apiAudit);

// 3. Check for any SQLite/MySQL/Postgres leaks in public/ or api/
console.log('\n====================================================');
console.log('🔍 AUDITING NON-FIRESTORE DATABASE ENGINE REFERENCES:');
console.log('====================================================\n');

function scanForDbEngines(dir) {
    const files = fs.readdirSync(dir);
    let violations = [];
    files.forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            if (f !== 'node_modules' && f !== '.git' && f !== '_backups_archive') {
                violations = violations.concat(scanForDbEngines(full));
            }
        } else if (f.endsWith('.js') || f.endsWith('.html')) {
            const txt = fs.readFileSync(full, 'utf8');
            if (/require\(["']sqlite3["']\)/i.test(txt) || /require\(["']mysql["']\)/i.test(txt) || /require\(["']pg["']\)/i.test(txt)) {
                violations.push({ file: full, issue: 'Prohibited DB driver import' });
            }
        }
    });
    return violations;
}

const dbViolations = scanForDbEngines(path.join(__dirname, '..'));
if (dbViolations.length === 0) {
    console.log('✅ ZERO prohibited database imports found in web application.');
} else {
    console.warn('⚠️ Violations found:', dbViolations);
}

console.log('\nAudit complete.');
