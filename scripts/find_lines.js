const fs = require('fs');
const lines = fs.readFileSync('public/student.html', 'utf8').split('\n');

const markers = [
    'student-birthday-banner',
    'ui-streak-count',
    'ui-last-confession-date',
    'badgesGrid',
    'ui-today-reading-title',
    'conferenceDiscountStudentCard',
    'barcode.html',
    'spiritual_note.html',
    'feedbackText'
];

markers.forEach(m => {
    const idx = lines.findIndex(l => l.includes(m));
    console.log(`${m}: line ${idx + 1}`);
});
