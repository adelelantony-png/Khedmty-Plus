const fs = require('fs');
const content = fs.readFileSync('public/student.html', 'utf8');

console.log('Includes birthday banner:', content.includes('id="student-birthday-banner"'));
console.log('Includes streak flame:', content.includes('id="ui-streak-count"'));
console.log('Includes today reading title:', content.includes('id="ui-today-reading-title"'));
console.log('Includes conference card:', content.includes('id="conferenceDiscountStudentCard"'));
console.log('Includes badgesGrid:', content.includes('id="badgesGrid"'));
console.log('Includes feedbackText:', content.includes('id="feedbackText"'));
