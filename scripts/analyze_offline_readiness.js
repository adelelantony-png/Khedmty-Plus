const fs = require('fs');
const path = require('path');

const publicDir = 'D:/StPaul_Service_System/03_Web_Khedmty_Plus/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const cdns = new Set();
const pagesAnalysis = [];

files.forEach(f => {
    const fullPath = path.join(publicDir, f);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Find external scripts & stylesheets
    const regex = /(?:src|href)=["'](https:\/\/[^"']+)["']/g;
    let match;
    const pageCdns = [];
    while ((match = regex.exec(content)) !== null) {
        cdns.add(match[1]);
        pageCdns.push(match[1]);
    }

    pagesAnalysis.push({
        file: f,
        hasManifest: content.includes('manifest.json'),
        hasPwaHelper: content.includes('pwa-helper.js'),
        hasKhedmtyDB: content.includes('khedmty-db.js'),
        hasOfflineUI: content.includes('networkStatusPill') || content.includes('online') || content.includes('offline'),
        cdnsCount: pageCdns.length
    });
});

console.log('--- ALL EXTERNAL CDNS DETECTED ---');
console.log(Array.from(cdns));

console.log('\n--- PAGES ANALYSIS ---');
console.table(pagesAnalysis);
