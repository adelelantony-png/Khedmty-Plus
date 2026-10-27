const { execSync } = require('child_process');
const path = require('path');

const tests = [
  'test_batch_a1.js',
  'test_batch_a_design.js',
  'test_phase1_security.js',
  'test_phase3_security.js',
  'test_ui_pwa.js',
  'test_syntax_grades.js',
  'test_reality_curve_analytics.js',
  'test_deep_simulation.js',
  'test_multi_criteria_filtering.js',
  'test_notes_filtering.js',
  'test_excel_formulas_and_notes.js',
  'test_exam_max_scores_persistence.js',
  'test_subject_distribution_table.js',
  'test_spiritual_oral_pending_isolation.js',
  'test_notes_tab_and_category.js',
  'test_ux_declutter_and_enhancements.js',
  'test_interactive_guide_page.js'
];

console.log('================================================================');
console.log(`🚀 Running ALL ${tests.length} Test Suites in Khedmety-Plus`);
console.log('================================================================\n');

let failed = 0;
for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  process.stdout.write(`[${i + 1}/${tests.length}] Running ${t}... `);
  try {
    execSync(`"${process.execPath}" ${t}`, { stdio: 'pipe', cwd: __dirname });
    console.log('✅ PASS');
  } catch (err) {
    console.log('❌ FAIL');
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failed++;
  }
}

console.log('\n================================================================');
if (failed === 0) {
  console.log(`🎉 ALL ${tests.length} TEST SUITES PASSED (100%) SUCCESSFULLY!`);
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`💥 ${failed} TEST SUITE(S) FAILED!`);
  console.log('================================================================\n');
  process.exit(1);
}
