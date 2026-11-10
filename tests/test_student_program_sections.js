const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Test Suite: Student Program Sections & WhatsApp Kiosk Integration');

const baseDir = path.resolve(__dirname, '..');

// 1. Verify student-program-sections.js exists
const sectionsJsPath = path.join(baseDir, 'public/js/student-program-sections.js');
assert(fs.existsSync(sectionsJsPath), 'student-program-sections.js must exist');
const code = fs.readFileSync(sectionsJsPath, 'utf8');

// 2. Verify all 4 functional modules are defined
assert(code.includes('openStudentCoursesModal'), 'Must define openStudentCoursesModal');
assert(code.includes('openStudentEventsModal'), 'Must define openStudentEventsModal');
assert(code.includes('openStudentMaterialsModal'), 'Must define openStudentMaterialsModal');
assert(code.includes('openStudentProgressModal'), 'Must define openStudentProgressModal');
console.log('  ✅ 4 Functional Modal Controllers verified');

// 3. Verify WhatsApp Kiosk Integration
assert(code.includes('WhatsApp Kiosk'), 'Must support WhatsApp Kiosk integration');
assert(code.includes('wa.me'), 'Must generate WhatsApp deep link');
assert(code.includes('كشك الاستعلام الذاتي'), 'Must brand as church self-service kiosk');
console.log('  ✅ WhatsApp Kiosk & Deep Linking verified');

// 4. Verify Courses and Progress logic
assert(code.includes('DEFAULT_COURSES'), 'Must have structured courses list');
assert(code.includes('in_progress'), 'Must support course status filters');
assert(code.includes('qualificationScore'), 'Must compute servant qualification score');
console.log('  ✅ Courses & Progress Analytics verified');

// 5. Verify student.html markup integration
const studentHtmlPath = path.join(baseDir, 'public/student.html');
const studentHtml = fs.readFileSync(studentHtmlPath, 'utf8');
assert(studentHtml.includes('js/student-program-sections.js'), 'student.html must include student-program-sections.js');
assert(studentHtml.includes('openStudentCoursesModal()'), 'Card 1 must call openStudentCoursesModal()');
assert(studentHtml.includes('openStudentEventsModal()'), 'Card 2 must call openStudentEventsModal()');
assert(studentHtml.includes('openStudentMaterialsModal()'), 'Card 3 must call openStudentMaterialsModal()');
assert(studentHtml.includes('openStudentProgressModal()'), 'Card 4 must call openStudentProgressModal()');
console.log('  ✅ student.html Program Section Grid correctly wired');

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
