const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Granular Chapter Implementation...');

// -------------------------------------------------------------
// 1. UPDATE public/student.html
// -------------------------------------------------------------
const studentPath = path.join(__dirname, '../public/student.html');
let studentHtml = fs.readFileSync(studentPath, 'utf8');

// A. Replace the today reading card
const oldCardTarget = `    <!-- بطاقة قراءة اليوم -->

    <div class="card p-3 mb-3 border-0 shadow-sm" style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-right: 5px solid #d97706 !important; border-radius: 18px;">

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

            <div>

                <span class="badge bg-warning text-dark mb-1 fw-bold"><i class="fa-solid fa-bookmark me-1"></i> قراءة اليوم حسب الخطة السنوية</span>

                <h5 class="fw-bold text-dark mb-0" id="ui-today-reading-title">جاري التحديد...</h5>

                <small class="text-muted" id="ui-today-date-text"></small>

            </div>

            <a id="btn-go-reading" href="bible.html" class="btn btn-warning text-dark fw-bold px-3 py-2 shadow-sm rounded-pill">

                <i class="fa-solid fa-book-open-reader me-1"></i> ابدأ القراءة الآن

            </a>

        </div>

    </div>`;

const newCardReplacement = `    <!-- بطاقة قراءة اليوم الإصحاحية التفاعلية -->
    <div class="card p-3 mb-3 border-0 shadow-sm" style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-right: 5px solid #d97706 !important; border-radius: 18px;">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <div>
                <span class="badge bg-warning text-dark mb-1 fw-bold"><i class="fa-solid fa-bookmark me-1"></i> قراءة اليوم حسب الخطة السنوية</span>
                <h5 class="fw-bold text-dark mb-0" id="ui-today-reading-title">جاري التحديد...</h5>
                <small class="text-muted" id="ui-today-date-text"></small>
            </div>
            <div class="d-flex gap-2 align-items-center flex-wrap">
                <a id="btn-go-reading" href="bible.html" class="btn btn-warning text-dark fw-bold px-3 py-2 shadow-sm rounded-pill" style="font-size:0.88rem;">
                    <i class="fa-solid fa-book-open-reader me-1"></i> ابدأ القراءة الآن
                </a>
            </div>
        </div>

        <!-- شريط إنجاز إصحاحات اليوم -->
        <div class="mt-2 pt-2 border-top border-warning border-opacity-25" id="ui-chapters-progress-box">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="fw-bold text-dark" id="ui-chapters-progress-text">إنجاز إصحاحات اليوم: 0 من 0</small>
                <span class="badge bg-light text-dark border border-warning" id="ui-chapters-progress-badge">0%</span>
            </div>
            <div class="progress" style="height: 8px; border-radius: 6px; background: rgba(217, 119, 6, 0.15);">
                <div id="ui-chapters-progress-bar" class="progress-bar bg-warning" role="progressbar" style="width: 0%; transition: width 0.3s ease;"></div>
            </div>
        </div>

        <!-- كبسولات الإصحاحات التفاعلية -->
        <div class="d-flex flex-wrap gap-2 mt-3" id="ui-today-chapters-grid">
            <!-- Dynamically populated chips -->
        </div>

        <!-- رسالة البونص عند الاكتمال -->
        <div id="ui-chapters-completion-banner" class="alert alert-success d-none mt-3 mb-0 py-2 px-3 fw-bold small text-center" style="border-radius: 12px;">
            🎉 مبارك! أتممت قراءة جميع إصحاحات اليوم بنجاح وحصلت على بونص الأمانة (+3 نقاط إضافية)! ✝️
        </div>
    </div>`;

if (studentHtml.includes('id="ui-today-reading-title"')) {
    // Replace the card block
    const cardStart = studentHtml.indexOf('<!-- بطاقة قراءة اليوم -->');
    const cardEnd = studentHtml.indexOf('<!-- بطاقة تخفيضات ومكافآت المؤتمر السنوي', cardStart);
    if (cardStart !== -1 && cardEnd !== -1) {
        studentHtml = studentHtml.substring(0, cardStart) + newCardReplacement + '\n\n    ' + studentHtml.substring(cardEnd);
        console.log('✅ Replaced today reading card in student.html');
    }
}

// B. Add the chapter functions to student.html
const loadTodayOld = `        if (todayItem) {

            const endChap = todayItem.chapter_end || todayItem.chapter;

            let displayTitle = todayItem.reading;

            if (!displayTitle) {

                const cleanBook = todayItem.book.replace(/^سفر\\s+/, '').trim();

                if (todayItem.chapter && endChap && endChap > todayItem.chapter) {

                    displayTitle = \`\${cleanBook} (الإصحاحات \${todayItem.chapter} إلى \${endChap})\`;

                } else if (todayItem.chapter) {

                    displayTitle = \`\${cleanBook} (الإصحاح \${todayItem.chapter})\`;

                }

            }

            const dayPrefix = todayItem.dayNumber ? \`اليوم (\${todayItem.dayNumber}): \` : '';

            document.getElementById('ui-today-reading-title').textContent = \`\${dayPrefix}\${displayTitle}\`;

            document.getElementById('btn-go-reading').href = \`bible.html?book=\${encodeURIComponent(todayItem.book)}&chapter=\${todayItem.chapter}&chapter_end=\${endChap}\`;

        } else {

            document.getElementById('ui-today-reading-title').textContent = "قراءة حرة وتأمل يومي";

            document.getElementById('btn-go-reading').href = "bible.html";

        }`;

const loadTodayNew = `        if (todayItem) {
            const startChap = todayItem.chapter || 1;
            const endChap = todayItem.chapter_end || startChap;
            let displayTitle = todayItem.reading;
            if (!displayTitle) {
                const cleanBook = (todayItem.book || '').replace(/^سفر\\s+/, '').trim();
                if (startChap && endChap && endChap > startChap) {
                    displayTitle = \`\${cleanBook} (الإصحاحات \${startChap} إلى \${endChap})\`;
                } else if (startChap) {
                    displayTitle = \`\${cleanBook} (الإصحاح \${startChap})\`;
                }
            }
            const dayPrefix = todayItem.dayNumber ? \`اليوم (\${todayItem.dayNumber}): \` : '';
            document.getElementById('ui-today-reading-title').textContent = \`\${dayPrefix}\${displayTitle}\`;
            document.getElementById('btn-go-reading').href = \`bible.html?book=\${encodeURIComponent(todayItem.book)}&chapter=\${startChap}&chapter_end=\${endChap}\`;
            
            // رسم كبسولات الإصحاحات الفردية
            renderTodayChaptersUI(todayItem, month, day);
        } else {
            document.getElementById('ui-today-reading-title').textContent = "قراءة حرة وتأمل يومي";
            document.getElementById('btn-go-reading').href = "bible.html";
            const grid = document.getElementById('ui-today-chapters-grid');
            if (grid) grid.innerHTML = '<span class="text-muted small">يمكنك قراءة وتأمل أي سفر وإصحاح ترغب به اليوم في قارئ الإنجيل.</span>';
        }`;

// Let's replace loadTodayBiblePlan content
const funcStartMarker = 'async function loadTodayBiblePlan() {';
const funcEndMarker = 'syncCloudAttendance();';

const helperCode = `
    function renderTodayChaptersUI(item, month, day) {
        const grid = document.getElementById('ui-today-chapters-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const startChap = item.chapter || 1;
        const endChap = item.chapter_end || startChap;
        const totalCount = (endChap - startChap + 1);

        const code = (window.AuthClient && AuthClient.getUserCode()) || localStorage.getItem('student_code');
        const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
        const planKey = \`\${month}-\${day}_\${code}\`;
        const savedLog = localReadings[planKey] || {};

        let completed = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
        if (completed.length === 0 && (savedLog.completed || savedLog.is_completed)) {
            for (let c = startChap; c <= endChap; c++) completed.push(c);
        }

        const readCount = completed.length;
        const percent = totalCount > 0 ? Math.min(100, Math.round((readCount / totalCount) * 100)) : 0;
        const pText = document.getElementById('ui-chapters-progress-text');
        const pBadge = document.getElementById('ui-chapters-progress-badge');
        const pBar = document.getElementById('ui-chapters-progress-bar');
        const banner = document.getElementById('ui-chapters-completion-banner');

        if (pText) pText.textContent = \`إنجاز إصحاحات اليوم: \${readCount} من \${totalCount} إصحاحات\`;
        if (pBadge) {
            pBadge.textContent = \`\${percent}%\`;
            pBadge.className = percent === 100 ? 'badge bg-success text-white' : 'badge bg-warning text-dark';
        }
        if (pBar) {
            pBar.style.width = \`\${percent}%\`;
            pBar.className = percent === 100 ? 'progress-bar bg-success' : 'progress-bar bg-warning';
        }
        if (banner) {
            if (percent === 100 && totalCount > 0) banner.classList.remove('d-none');
            else banner.classList.add('d-none');
        }

        for (let chap = startChap; chap <= endChap; chap++) {
            const isRead = completed.includes(chap);
            const card = document.createElement('div');
            card.className = \`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 \${isRead ? 'btn-success text-white' : 'btn-outline-dark bg-white'}\`;
            card.style.borderRadius = '12px';
            card.style.fontWeight = '700';
            card.style.cursor = 'pointer';
            card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
            card.style.transition = 'all 0.2s ease';

            card.innerHTML = \`
                <span>\${isRead ? '<i class=\"fa-solid fa-circle-check\"></i>' : '<i class=\"fa-regular fa-circle\"></i>'}</span>
                <span>إصحاح \${chap}</span>
                <a href=\"bible.html?book=\${encodeURIComponent(item.book)}&chapter=\${chap}\" class=\"badge \${isRead ? 'bg-light text-success' : 'bg-primary text-white'} text-decoration-none px-2 py-1 ms-1\" style=\"font-size:0.75rem;\" title=\"فتح الإصحاح في القارئ\" onclick=\"event.stopPropagation();\">
                    <i class=\"fa-solid fa-book-bible\"></i>
                </a>
            \`;

            card.onclick = () => toggleChapterRead(item, month, day, chap);
            grid.appendChild(card);
        }
    }

    async function toggleChapterRead(item, month, day, chapterNum) {
        const code = (window.AuthClient && AuthClient.getUserCode()) || localStorage.getItem('student_code');
        if (!code) return;

        const startChap = item.chapter || 1;
        const endChap = item.chapter_end || startChap;
        const totalCount = (endChap - startChap + 1);

        const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
        const planKey = \`\${month}-\${day}_\${code}\`;
        let savedLog = localReadings[planKey] || {
            code: code,
            month: month,
            day: day,
            reading: item.reading,
            book: item.book,
            total_chapters: totalCount,
            completed_chapters: [],
            _synced: false
        };

        let completed = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
        if (completed.length === 0 && (savedLog.completed || savedLog.is_completed)) {
            for (let c = startChap; c <= endChap; c++) completed.push(c);
        }

        if (completed.includes(chapterNum)) {
            completed = completed.filter(c => c !== chapterNum);
        } else {
            completed.push(chapterNum);
        }
        completed = Array.from(new Set(completed)).sort((a, b) => a - b);

        const isFullyCompleted = (completed.length >= totalCount && totalCount > 0);
        savedLog.completed_chapters = completed;
        savedLog.chapters_read_count = completed.length;
        savedLog.total_chapters = totalCount;
        savedLog.is_completed = isFullyCompleted ? 1 : 0;
        savedLog.completed = isFullyCompleted ? 1 : 0;
        savedLog.points = (completed.length * 2) + (isFullyCompleted ? 3 : 0);
        savedLog._synced = false;

        localReadings[planKey] = savedLog;
        localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));

        renderTodayChaptersUI(item, month, day);
        if (typeof renderLocalPoints === 'function') renderLocalPoints();

        try {
            const fetchFn = window.AuthClient ? AuthClient.fetch.bind(AuthClient) : fetch;
            const res = await fetchFn('/api/mark_plan_read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    month: month,
                    day: day,
                    book: item.book,
                    reading: item.reading,
                    chapter: chapterNum,
                    action: 'toggle_chapter',
                    completed_chapters: completed,
                    total_chapters: totalCount
                })
            });
            if (res.ok) {
                savedLog._synced = true;
                localReadings[planKey] = savedLog;
                localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));
            }
        } catch(e) {
            console.warn('Background sync failed, queued for offline:', e);
        }
    }
`;

const p1 = studentHtml.indexOf(funcStartMarker);
const p2 = studentHtml.indexOf(funcEndMarker, p1);
if (p1 !== -1 && p2 !== -1) {
    let funcBody = studentHtml.substring(p1, p2);
    // Replace the inner branch
    const startBranch = funcBody.indexOf('const todayItem = getPlanItemForDate');
    const endBranch = funcBody.lastIndexOf('}');
    if (startBranch !== -1 && endBranch !== -1) {
        const newFuncBody = `async function loadTodayBiblePlan() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        document.getElementById('ui-today-date-text').textContent = \`تاريخ اليوم: \${day}/\${month}\`;

        let planData = window.BIBLE_PLAN_DATA || null;
        if (!planData) {
            try {
                const res = await fetch('bible_plan.json');
                if (res.ok) planData = await res.json();
            } catch (e) {}
        }

        const todayItem = getPlanItemForDate(planData, month, day);
${loadTodayNew}
    }
${helperCode}
    `;
        studentHtml = studentHtml.substring(0, p1) + newFuncBody + '\n    ' + studentHtml.substring(p2);
        console.log('✅ Updated loadTodayBiblePlan with chapter-by-chapter renderer');
    }
}

fs.writeFileSync(studentPath, studentHtml, 'utf8');
console.log('✅ student.html saved successfully');
