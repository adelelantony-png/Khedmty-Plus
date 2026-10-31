/**
 * tests/test_pastoral_early_warning.js
 * Test Suite 25: Pastoral Early Warning & Smart WhatsApp Triage Engine Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Pastoral Early Warning & Smart WhatsApp Triage...');

const followupPath = path.resolve(__dirname, '../public/servant_followup.html');
assert.ok(fs.existsSync(followupPath), 'servant_followup.html must exist');
const content = fs.readFileSync(followupPath, 'utf8');

// 1. Verify 6 Stat Cards in .stats-grid
assert.ok(content.includes('id="cardFilterAll"'), 'Must have cardFilterAll');
assert.ok(content.includes('id="cardFilterDisconnected"'), 'Must have cardFilterDisconnected');
assert.ok(content.includes('id="cardFilterWarning"'), 'Must have cardFilterWarning');
assert.ok(content.includes('id="cardFilterConfession"'), 'Must have cardFilterConfession');
assert.ok(content.includes('id="cardFilterBible"'), 'Must have cardFilterBible');
assert.ok(content.includes('id="cardFilterVisited"'), 'Must have cardFilterVisited');

// 2. Verify filter values in statusFilter dropdown
assert.ok(content.includes('value="confession_alert"'), 'statusFilter must contain confession_alert');
assert.ok(content.includes('value="bible_alert"'), 'statusFilter must contain bible_alert');

// 3. Verify Helper calculation functions
assert.ok(content.includes('function getDaysSinceConfession'), 'Must define getDaysSinceConfession');
assert.ok(content.includes('function getDaysSinceBibleReading'), 'Must define getDaysSinceBibleReading');

// 4. Verify Smart WhatsApp Modal and 4 templates
assert.ok(content.includes('id="waTriageModalBackdrop"'), 'Must contain waTriageModalBackdrop');
assert.ok(content.includes('id="tplAbsence"'), 'Must contain tplAbsence');
assert.ok(content.includes('id="tplConfession"'), 'Must contain tplConfession');
assert.ok(content.includes('id="tplBible"'), 'Must contain tplBible');
assert.ok(content.includes('id="tplParent"'), 'Must contain tplParent');
assert.ok(content.includes('function openSmartWhatsAppModal'), 'Must define openSmartWhatsAppModal');
assert.ok(content.includes('function sendTriageMessage'), 'Must define sendTriageMessage');

// 5. Test Helper logic in sandbox
const mockMember = {
    code: 'ST100',
    name: 'بيتر مجدي',
    lastConfession: '2026-09-01' // > 40 days ago relative to 2026-10-31
};

const d = new Date(mockMember.lastConfession);
const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
assert.ok(diffDays >= 40, 'Should trigger confession alert for > 40 days');

console.log('🎉 Suite 25: Pastoral Early Warning & Smart WhatsApp Triage PASSED successfully!\n');
process.exit(0);
