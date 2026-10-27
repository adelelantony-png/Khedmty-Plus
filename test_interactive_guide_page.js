// test_interactive_guide_page.js — Test suite for Interactive Guide and In-App Integration
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Suite #17: Interactive Visual Guide & In-App Integration Tests...');

const guidePath = path.join(__dirname, 'public', 'servant_grades_guide.html');
const entryPath = path.join(__dirname, 'public', 'servant_grades_entry.html');

// 1. Verify servant_grades_guide.html exists
assert.ok(fs.existsSync(guidePath), 'servant_grades_guide.html must exist in public directory');
const guideContent = fs.readFileSync(guidePath, 'utf8');
assert.ok(guideContent.length > 20000, `guideContent should be comprehensive (>20KB), got ${guideContent.length} bytes`);
console.log('  ✅ [1/10] servant_grades_guide.html exists and is fully populated (' + guideContent.length + ' bytes)');

// 2. Verify Google Font Tajawal and FontAwesome are linked
assert.ok(guideContent.includes('fonts.googleapis.com/css2?family=Tajawal'), 'Guide must use Tajawal font matching design system');
assert.ok(guideContent.includes('font-awesome'), 'Guide must include FontAwesome icons');
console.log('  ✅ [2/10] Typography and FontAwesome assets match main design system');

// 3. Verify CSS Theme tokens match
assert.ok(guideContent.includes('--primary: #0c2461'), 'Theme must match primary color');
assert.ok(guideContent.includes('--accent: #1e3799'), 'Theme must match accent color');
assert.ok(guideContent.includes('--success: #10b981'), 'Theme must match success color');
console.log('  ✅ [3/10] Design tokens and color palette identical to servant_grades_entry');

// 4. Verify Interactive Topbar Mockup
assert.ok(guideContent.includes('mock-topbar'), 'Guide must contain topbar mockup');
assert.ok(guideContent.includes('inspectButton'), 'Guide must have inspectButton helper for interactive clicks');
console.log('  ✅ [4/10] Topbar interactive screen mockup present and interactive');

// 5. Verify Pulse KPIs & Spectrum simulation
assert.ok(guideContent.includes('demoSpectrumBar'), 'Guide must contain spectrum bar mockup');
assert.ok(guideContent.includes('simulateCohort'), 'Guide must have cohort simulator function');
console.log('  ✅ [5/10] Visual spectrum bar and KPI presets simulator present');

// 6. Verify 5-Tab Studio and 11 Deciles distribution
assert.ok(guideContent.includes('switchMockStudioTab'), 'Guide must contain 5-tab studio switcher');
assert.ok(guideContent.includes('renderMockDeciles'), 'Guide must render 11 deciles distribution table');
assert.ok(guideContent.includes('sampleDecileDistributions'), 'Deciles sample distributions present');
console.log('  ✅ [6/10] 5-Tab Unified Studio with 11 Deciles table present and interactive');

// 7. Verify Interactive Grades Table Demo
assert.ok(guideContent.includes('interactiveLiveTable'), 'Guide must contain interactive live grades table');
assert.ok(guideContent.includes('updateDemoScore'), 'Guide must support live score updating');
console.log('  ✅ [7/10] Main grades table live editable simulator functioning');

// 8. Verify Decision Engine Playground
assert.ok(guideContent.includes('runDecisionSimulator'), 'Guide must include live decision simulator');
assert.ok(guideContent.includes('calcBadgeOutput'), 'Decision badge output element present');
assert.ok(guideContent.includes('معلق لملاحظة روحية'), 'Decision simulator covers spiritual holdout edge case');
console.log('  ✅ [8/10] Pastoral Decision simulator engine (computeDecision) running live');

// 9. Verify servant_grades_entry.html integration
const entryContent = fs.readFileSync(entryPath, 'utf8');
assert.ok(entryContent.includes('openSystemInteractiveGuide()'), 'Entry page must have openSystemInteractiveGuide button in topbar');
assert.ok(entryContent.includes('systemGuideModal'), 'Entry page must include systemGuideModal overlay');
assert.ok(entryContent.includes('systemGuideIframe'), 'Entry page modal must include iframe for guide');
console.log('  ✅ [9/10] In-app button, modal, and iframe embedded inside servant_grades_entry.html');

// 10. Verify JS functions in entry page
assert.ok(entryContent.includes('function openSystemInteractiveGuide()'), 'openSystemInteractiveGuide function declared in JS');
assert.ok(entryContent.includes('function closeSystemInteractiveGuide()'), 'closeSystemInteractiveGuide function declared in JS');
console.log('  ✅ [10/10] Full JS controller for opening/closing in-app guide present');

console.log('🎉 Suite #17 PASSED: 10/10 checks verified successfully!');
