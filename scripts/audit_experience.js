// scripts/audit_experience.js
// Deep expert inspection of all buttons, tabs, interactions, and user flows
// From the perspective of Head of Ministry (أمين الخدمة) and Student (المخدوم)

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('================================================================');
console.log('🧐 COMPREHENSIVE EXPERT AUDIT: KHIDMETY PRO');
console.log('================================================================\n');

// 1. Audit Tab Buttons in servant-dashboard.html
const dashHtml = fs.readFileSync(path.join(publicDir, 'servant-dashboard.html'), 'utf8');

const tabBtnRegex = /<([a-z]+)[^>]*class="[^"]*tab-btn[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
const tabButtons = [];
while ((match = tabBtnRegex.exec(dashHtml)) !== null) {
    const full = match[0];
    const tag = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const onclick = (full.match(/onclick="([^"]+)"/) || [])[1] || null;
    const href = (full.match(/href="([^"]+)"/) || [])[1] || null;
    const id = (full.match(/id="([^"]+)"/) || [])[1] || null;
    const dataGroup = (full.match(/data-group="([^"]+)"/) || [])[1] || null;
    const adminOnly = full.includes('admin-only');
    const canAttend = full.includes('can-attend');
    const targetTab = onclick ? (onclick.match(/switchTab\('([^']+)'/) || [])[1] : null;

    tabButtons.push({
        text,
        tag,
        id,
        onclick,
        href,
        dataGroup,
        adminOnly,
        canAttend,
        targetTab
    });
}

console.log('--- 1. TAB BUTTONS AUDIT IN SERVANT-DASHBOARD (' + tabButtons.length + ' buttons) ---');
tabButtons.forEach((b, i) => {
    let status = 'OK';
    let note = '';

    if (b.targetTab) {
        const tabEl = dashHtml.includes('id="' + b.targetTab + '"');
        if (!tabEl) {
            status = 'BROKEN_TARGET';
            note = `Target element #${b.targetTab} not found!`;
        } else {
            note = `Opens #${b.targetTab}`;
        }
    } else if (b.href) {
        const targetFile = b.href.split('?')[0];
        const fileExists = fs.existsSync(path.join(publicDir, targetFile));
        if (!fileExists) {
            status = 'BROKEN_LINK';
            note = `Linked file ${targetFile} does not exist!`;
        } else {
            note = `Navigates to external page ${targetFile}`;
        }
    }

    console.log(`[${(i + 1).toString().padStart(2, '0')}] ${b.text.padEnd(30, ' ')} | Tag: ${b.tag.padEnd(4, ' ')} | Group: ${(b.dataGroup || 'auto').padEnd(7, ' ')} | ${note} [${status}]`);
});

// 2. Check all tab-content containers in servant-dashboard.html
console.log('\n--- 2. TAB-CONTENT CONTAINERS IN SERVANT-DASHBOARD ---');
const contentRegex = /<div[^>]*class="[^"]*tab-content[^"]*"[^>]*id="([^"]+)"[^>]*>/gi;
const tabContainers = [];
while ((match = contentRegex.exec(dashHtml)) !== null) {
    tabContainers.push(match[1]);
}
// Also check id before class
const contentRegex2 = /<div[^>]*id="([^"]+)"[^>]*class="[^"]*tab-content[^"]*"[^>]*>/gi;
while ((match = contentRegex2.exec(dashHtml)) !== null) {
    if (!tabContainers.includes(match[1])) tabContainers.push(match[1]);
}

console.log('Total tab-content containers found:', tabContainers.length);
tabContainers.forEach((id, i) => {
    const hasTrigger = tabButtons.some(b => b.targetTab === id);
    console.log(`[${(i + 1).toString().padStart(2, '0')}] #${id.padEnd(25, ' ')} | Has Tab Button: ${hasTrigger ? 'YES' : 'NO (Orphan container or sub-tab)'}`);
});

// 3. Audit Navigation Groups in dashboard-navigation.js
console.log('\n--- 3. NAVIGATION GROUPS MAPPING AUDIT ---');
const navJs = fs.readFileSync(path.join(publicDir, 'js', 'dashboard', 'dashboard-navigation.js'), 'utf8');
const tabGroupMatch = navJs.match(/const TAB_GROUP = \{([\s\S]*?)\};/);
if (tabGroupMatch) {
    console.log('TAB_GROUP entries:');
    const entries = tabGroupMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    entries.forEach(e => console.log('  ' + e));
}

// 4. Audit Student Portal (student.html)
console.log('\n--- 4. STUDENT PORTAL AUDIT (student.html) ---');
const studentHtml = fs.readFileSync(path.join(publicDir, 'student.html'), 'utf8');
const studentButtons = [...studentHtml.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Student action buttons:', studentButtons.filter(Boolean));
const studentLinks = [...studentHtml.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
console.log('Student navigation links:');
studentLinks.forEach(l => console.log(`  -> ${l.text} (${l.href})`));

// 5. Audit all 24 HTML pages existence & connectivity
console.log('\n--- 5. PLATFORM PAGES MAP ---');
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
console.log('Total HTML pages in /public:', htmlFiles.length);
htmlFiles.forEach(f => {
    const c = fs.readFileSync(path.join(publicDir, f), 'utf8');
    const title = (c.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || 'No title';
    console.log(`  📄 ${f.padEnd(30, ' ')} : ${title.trim()}`);
});
