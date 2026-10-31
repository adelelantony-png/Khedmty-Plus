const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/spiritual_note.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add catchup-chapters-box into catchup-section HTML
const oldBibleCatchupRow = '<div class="d-flex justify-content-between align-items-center bg-white p-2 rounded-3 border">\n' +
'                                        <div>\n' +
'                                            <span class="small fw-bold d-block"><i class="fa-solid fa-book-bible text-primary me-1"></i> قراءة إنجيل اليوم:</span>\n' +
'                                            <small class="text-muted" id="catchup-reading-name">جاري الفحص...</small>\n' +
'                                        </div>\n' +
'                                        <a id="btn-catchup-bible" href="bible.html" class="btn btn-sm btn-outline-primary fw-bold">\n' +
'                                            اقرأ الآن 📖\n' +
'                                        </a>\n' +
'                                    </div>';

const newBibleCatchupRow = '<div class="d-flex justify-content-between align-items-center bg-white p-2 rounded-3 border">\n' +
'                                        <div>\n' +
'                                            <span class="small fw-bold d-block"><i class="fa-solid fa-book-bible text-primary me-1"></i> قراءة إنجيل اليوم:</span>\n' +
'                                            <small class="text-muted" id="catchup-reading-name">جاري الفحص...</small>\n' +
'                                        </div>\n' +
'                                        <a id="btn-catchup-bible" href="bible.html" class="btn btn-sm btn-outline-primary fw-bold">\n' +
'                                            اقرأ الآن 📖\n' +
'                                        </a>\n' +
'                                    </div>\n' +
'                                    <!-- كبسولات إصحاحات التاريخ المحدد التفاعلية -->\n' +
'                                    <div id="catchup-chapters-box" class="bg-white p-2 rounded-3 border mt-1 d-none">\n' +
'                                        <div class="d-flex justify-content-between align-items-center mb-1">\n' +
'                                            <small class="fw-bold text-dark"><i class="fa-solid fa-list-check text-success me-1"></i> الإصحاحات المقروءة:</small>\n' +
'                                            <span id="catchup-chapters-progress" class="badge bg-warning text-dark border">0 من 0</span>\n' +
'                                        </div>\n' +
'                                        <div id="catchup-chapters-grid" class="d-flex flex-wrap gap-2 mt-2">\n' +
'                                            <!-- Dynamically injected chapter chips -->\n' +
'                                        </div>\n' +
'                                    </div>';

if (html.includes('id="btn-catchup-bible"') && !html.includes('id="catchup-chapters-box"')) {
    html = html.replace(oldBibleCatchupRow, newBibleCatchupRow);
    console.log('✅ Injected catchup-chapters-box into spiritual_note.html markup');
}

// 2. Replace checkDayCatchup implementation
const startMarker = 'async function checkDayCatchup(selectedDate) {';
const endMarker = 'function loadSavedDailyLog(selectedDate) {';

const newFunction = `async function checkDayCatchup(selectedDate) {
        const d = new Date(selectedDate);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const planKey = \`\${m}-\${day}\`;

        document.getElementById('catchup-date-badge').textContent = \`\${day}/\${m}\`;

        const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
        const savedLog = localReadings[\`\${planKey}_\${studentCode}\`] || {};

        const btnBible = document.getElementById('btn-catchup-bible');
        const readingName = document.getElementById('catchup-reading-name');
        const chapsBox = document.getElementById('catchup-chapters-box');
        const chapsGrid = document.getElementById('catchup-chapters-grid');
        const chapsProgress = document.getElementById('catchup-chapters-progress');

        let plan = window.BIBLE_PLAN_DATA || null;
        if (!plan) {
            try {
                const res = await fetch('bible_plan.json');
                if (res.ok) plan = await res.json();
            } catch(e) {}
        }
        let planItem = null;
        if (typeof window !== 'undefined' && typeof window.getBiblePlanReading === 'function') {
            planItem = window.getBiblePlanReading(d);
        }
        if (!planItem && plan) {
            planItem = plan[planKey];
        }

        if (planItem) {
            const startChap = planItem.chapter || 1;
            const endChap = planItem.chapter_end || startChap;
            const totalCount = (endChap - startChap + 1);
            const dayPrefix = planItem.dayNumber ? \`(اليوم \${planItem.dayNumber}): \` : '';
            const title = planItem.reading ? \`\${dayPrefix}\${planItem.reading}\` : \`\${dayPrefix}\${planItem.book} \${startChap}\`;
            readingName.textContent = title;
            btnBible.href = \`bible.html?book=\${encodeURIComponent(planItem.book)}&chapter=\${startChap}&chapter_end=\${endChap}&from=spiritual_note\`;

            if (chapsBox && chapsGrid) {
                chapsBox.classList.remove('d-none');
                chapsGrid.innerHTML = '';

                let completed = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
                if (completed.length === 0 && (savedLog.completed || savedLog.is_completed)) {
                    for (let c = startChap; c <= endChap; c++) completed.push(c);
                }

                if (chapsProgress) {
                    const percent = totalCount > 0 ? Math.round((completed.length / totalCount) * 100) : 0;
                    chapsProgress.textContent = \`\${completed.length} من \${totalCount} (\${percent}%)\`;
                    chapsProgress.className = percent === 100 ? 'badge bg-success text-white' : 'badge bg-warning text-dark';
                }

                if (completed.length >= totalCount && totalCount > 0) {
                    btnBible.className = 'btn btn-sm btn-success fw-bold';
                    btnBible.innerHTML = 'مُنجز كامل ✔️';
                } else if (completed.length > 0) {
                    btnBible.className = 'btn btn-sm btn-warning text-dark fw-bold';
                    btnBible.innerHTML = \`مُنجز (\${completed.length}/\${totalCount})\`;
                } else {
                    btnBible.className = 'btn btn-sm btn-outline-primary fw-bold';
                    btnBible.innerHTML = 'اقرأ الآن 📖';
                }

                for (let chap = startChap; chap <= endChap; chap++) {
                    const isRead = completed.includes(chap);
                    const pill = document.createElement('div');
                    pill.className = \`badge d-inline-flex align-items-center gap-1 p-2 \${isRead ? 'bg-success text-white' : 'bg-light text-dark border'}\`;
                    pill.style.cursor = 'pointer';
                    pill.style.fontSize = '0.82rem';
                    pill.style.borderRadius = '8px';

                    pill.innerHTML = \`
                        <span>\${isRead ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-regular fa-square"></i>'}</span>
                        <span>إصحاح \${chap}</span>
                    \`;

                    pill.onclick = async () => {
                        let curCompleted = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
                        if (curCompleted.length === 0 && (savedLog.completed || savedLog.is_completed)) {
                            for (let c = startChap; c <= endChap; c++) curCompleted.push(c);
                        }
                        if (curCompleted.includes(chap)) {
                            curCompleted = curCompleted.filter(c => c !== chap);
                        } else {
                            curCompleted.push(chap);
                        }
                        curCompleted = Array.from(new Set(curCompleted)).sort((a,b)=>a-b);
                        const isAll = (curCompleted.length >= totalCount && totalCount > 0);

                        savedLog.code = studentCode;
                        savedLog.month = m;
                        savedLog.day = day;
                        savedLog.book = planItem.book;
                        savedLog.reading = planItem.reading;
                        savedLog.completed_chapters = curCompleted;
                        savedLog.chapters_read_count = curCompleted.length;
                        savedLog.total_chapters = totalCount;
                        savedLog.is_completed = isAll ? 1 : 0;
                        savedLog.completed = isAll ? 1 : 0;
                        savedLog.points = (curCompleted.length * 2) + (isAll ? 3 : 0);
                        savedLog._synced = false;

                        localReadings[\`\${planKey}_\${studentCode}\`] = savedLog;
                        localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));

                        checkDayCatchup(selectedDate);

                        try {
                            const fetchFn = window.AuthClient ? AuthClient.fetch.bind(AuthClient) : fetch;
                            await fetchFn('/api/mark_plan_read', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    code: studentCode,
                                    month: m,
                                    day: day,
                                    book: planItem.book,
                                    reading: planItem.reading,
                                    chapter: chap,
                                    action: 'toggle_chapter',
                                    completed_chapters: curCompleted,
                                    total_chapters: totalCount
                                })
                            });
                        } catch(e) {}
                    };

                    chapsGrid.appendChild(pill);
                }
            }
        } else {
            readingName.textContent = "قراءة وتأمل حر";
            btnBible.href = \`bible.html?from=spiritual_note\`;
            if (chapsBox) chapsBox.classList.add('d-none');
            btnBible.className = 'btn btn-sm btn-outline-primary fw-bold';
            btnBible.innerHTML = 'اقرأ الآن 📖';
        }
    }

    `;

const p1 = html.indexOf(startMarker);
const p2 = html.indexOf(endMarker, p1);
if (p1 !== -1 && p2 !== -1) {
    html = html.substring(0, p1) + newFunction + html.substring(p2);
    console.log('✅ Updated checkDayCatchup in spiritual_note.html');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ spiritual_note.html saved successfully');
