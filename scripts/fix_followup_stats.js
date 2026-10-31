const fs = require('fs');
let content = fs.readFileSync('public/servant_followup.html', 'utf8');

const oldSelect = '<select class="filter-select" id="statusFilter" onchange="filterAndRender()">';
const idxSelect = content.indexOf(oldSelect);
console.log('statusFilter found at:', idxSelect);

const endSelect = '</select>';
const idxEnd = content.indexOf(endSelect, idxSelect);
console.log('Current options in statusFilter:');
console.log(content.slice(idxSelect, idxEnd + 9));

const newSelect = `<select class="filter-select" id="statusFilter" onchange="filterAndRender()">
                <option value="all">كل حالات المتابعة الرعوية</option>
                <option value="disconnected">🚨 منقطعون (3 جمعات فأكثر)</option>
                <option value="warning">⚠️ إنذار غياب جمعتين</option>
                <option value="confession_alert">🕊️ إنذار سر الاعتراف (> 40 يوماً)</option>
                <option value="bible_alert">📖 إنذار قراءة الإنجيل (> 7 أيام)</option>
                <option value="last_friday">🔔 غائب الجمعة الماضية</option>
                <option value="unvisited">⏳ لم يُفتقد قط / يحتاج افتقاد</option>
                <option value="regular">✔️ منتظم (حاضر آخر جمعة)</option>
            </select>`;

content = content.substring(0, idxSelect) + newSelect + content.substring(idxEnd + 9);
fs.writeFileSync('public/servant_followup.html', content, 'utf8');
console.log('✅ Successfully updated statusFilter options!');
