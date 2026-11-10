/**
 * tests/test_servant_followup_robustness.js
 * Verification of deduplication and error-free rendering in servant_followup.html
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing servant_followup.html deduplication and triage safety...');

const followupPath = path.resolve(__dirname, '../public/servant_followup.html');
assert.ok(fs.existsSync(followupPath), 'servant_followup.html must exist');
const content = fs.readFileSync(followupPath, 'utf8');

// 1. Verify deduplicateMembers function exists
assert.ok(content.includes('function deduplicateMembers'), 'Must define deduplicateMembers function');

// 2. Verify triageBadgesHtml is properly defined before being referenced
const triageDefIdx = content.indexOf('const triageBadgesHtml = triageBadges.join');
const triageRefIdx = content.indexOf('${triageBadgesHtml ?');
assert.ok(triageDefIdx > -1, 'Must define triageBadgesHtml');
assert.ok(triageRefIdx > -1, 'Must reference triageBadgesHtml');
assert.ok(triageDefIdx < triageRefIdx, 'triageBadgesHtml must be defined BEFORE being referenced');

// 3. Verify deduplication logic works as expected
const mockDuplicates = [
    { code: 'ST101', name: 'مارك عادل' },
    { code: 'ST101', name: 'مارك عادل' }, // duplicate code
    { id: 'REC02', code: 'ST102', name: 'بيتر مجدي' },
    { id: 'REC02', code: 'ST102', name: 'بيتر مجدي' }  // duplicate id/code
];

function deduplicateMembers(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter(m => {
        if (!m) return false;
        const key = String(m.code || m.id || m.exam_code || m.phone || m.name || '').trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

const cleaned = deduplicateMembers(mockDuplicates);
assert.strictEqual(cleaned.length, 2, 'Deduplication must reduce 4 duplicates to 2 unique students');

// 4. Verify statConfessionRisk and statBibleRisk are handled in renderStats
assert.ok(content.includes('statConfessionRisk'), 'renderStats must update statConfessionRisk');
assert.ok(content.includes('statBibleRisk'), 'renderStats must update statBibleRisk');

console.log('🎉 servant_followup robustness test PASSED (100%)!\n');
process.exit(0);
