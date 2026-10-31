const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, '../public/bible.html');
let html = fs.readFileSync(biblePath, 'utf8');

// 1. Add #btnMarkRead container right below #versesArea
const versesAreaEnd = '        </div>\n\n    </div>\n\n</div>';
const buttonContainer = `        </div>

        <!-- زر تسجيل قراءة الإصحاح المعروض في نهاية الصفحة -->
        <div class="text-center mt-3 mb-4" id="versesBottomActionArea">
            <button id="btnMarkRead" class="btn btn-success fw-bold px-4 py-2 shadow-sm rounded-pill" onclick="markCurrentChapterRead()" style="font-size: 0.95rem;">
                <i class="fa-solid fa-check me-1"></i> سجّل قراءة هذا الإصحاح (+2 نقطة ⭐)
            </button>
        </div>

    </div>

</div>`;

if (html.includes('id="versesArea"') && !html.includes('id="versesBottomActionArea"')) {
    const vEnd = html.indexOf('</div>\n\n    </div>\n\n</div>');
    if (vEnd !== -1) {
        html = html.substring(0, vEnd) + buttonContainer + html.substring(vEnd + versesAreaEnd.length);
        console.log('✅ Added versesBottomActionArea with #btnMarkRead');
    }
}

// 2. Safe-guard btnMark inside detectTodayPlan
const oldDetectCompleted = `    if (isCompleted) {

        const btnMark = document.getElementById('btnMarkRead');

        btnMark.className = 'btn btn-outline-success fw-bold px-3 py-2';

        btnMark.innerHTML = '<i class="fa-solid fa-check-double me-1"></i> أتممت قراءة هذا اليوم بنجاح ✔️';

    }`;

const safeDetectCompleted = `    if (isCompleted) {
        const btnMark = document.getElementById('btnMarkRead');
        if (btnMark) {
            btnMark.className = 'btn btn-outline-success fw-bold px-3 py-2';
            btnMark.innerHTML = '<i class="fa-solid fa-check-double me-1"></i> أتممت قراءة هذا اليوم بنجاح ✔️';
        }
    }`;

if (html.includes("btnMark.className = 'btn btn-outline-success fw-bold px-3 py-2';")) {
    html = html.replace(oldDetectCompleted, safeDetectCompleted);
    console.log('✅ Safe-guarded btnMark in detectTodayPlan');
}

// 3. Insert the 4 functions right before window.onload
const functionsToInsert = `
function selectChapterInReader(bookName, chapterNum) {
    const bookSelect = document.getElementById('bookSelect');
    const chapterSelect = document.getElementById('chapterSelect');
    if (!bookSelect || !chapterSelect || !bibleData || !bibleData.length) return;

    const cleanTarget = normalizeBookName(bookName);
    let foundIndex = -1;
    bibleData.forEach((b, idx) => {
        const arName = arabicBookNames[b.name] || b.name;
        if (normalizeBookName(arName) === cleanTarget || arName === bookName || b.name === bookName) {
            foundIndex = idx;
        }
    });

    if (foundIndex !== -1) {
        bookSelect.selectedIndex = foundIndex;
        onBookChanged(false);
        if (chapterNum > 0 && chapterNum <= chapterSelect.options.length) {
            chapterSelect.selectedIndex = chapterNum - 1;
            renderVerses();
        }
    }
}

function renderPlanBannerChapters(planItem, curMonth, curDay) {
    const grid = document.getElementById('planBannerChaptersGrid');
    const summaryBadge = document.getElementById('planBannerSummaryBadge');
    const completionAlert = document.getElementById('planBannerCompletionAlert');
    if (!grid) return;
    grid.innerHTML = '';

    if (!planItem) {
        if (summaryBadge) summaryBadge.textContent = 'قراءة حرة وتأمل يومي';
        return;
    }

    const startChap = planItem.chapter || 1;
    const endChap = planItem.chapter_end || startChap;
    const totalCount = (endChap - startChap + 1);

    const planKey = \`\${curMonth}-\${curDay}_\${studentCode}\`;
    const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
    const savedLog = localReadings[planKey] || localReadings[\`\${curMonth}-\${curDay}\`] || {};

    let completed = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
    if (completed.length === 0 && (savedLog.completed || savedLog.is_completed)) {
        for (let c = startChap; c <= endChap; c++) completed.push(c);
    }

    const readCount = completed.length;
    const isAll = (readCount >= totalCount && totalCount > 0);

    if (summaryBadge) {
        if (isAll) {
            summaryBadge.innerHTML = '<i class="fa-solid fa-circle-check text-success me-1"></i> أتممت اليوم كاملاً (100%)';
            summaryBadge.className = 'badge bg-success text-white px-3 py-2 fw-bold';
        } else {
            const percent = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;
            summaryBadge.innerHTML = \`أتممت \${readCount} من \${totalCount} إصحاحات (\${percent}%)\`;
            summaryBadge.className = 'badge bg-light text-dark border border-warning px-3 py-2 fw-bold';
        }
    }

    if (completionAlert) {
        if (isAll) completionAlert.classList.remove('d-none');
        else completionAlert.classList.add('d-none');
    }

    for (let c = startChap; c <= endChap; c++) {
        const isRead = completed.includes(c);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = \`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 \${isRead ? 'btn-success text-white' : 'btn-outline-dark bg-white'}\`;
        btn.style.borderRadius = '12px';
        btn.style.fontWeight = '700';
        btn.style.fontSize = '0.85rem';
        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
        btn.style.cursor = 'pointer';

        btn.innerHTML = \`
            <span>\${isRead ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-regular fa-circle"></i>'}</span>
            <span>إصحاح \${c}</span>
            <span class="badge \${isRead ? 'bg-light text-success' : 'bg-warning text-dark'} ms-1" style="font-size:0.75rem;">
                \${isRead ? 'تم ✔️' : '+2 نقطة'}
            </span>
        \`;

        btn.onclick = async () => {
            selectChapterInReader(planItem.book, c);
            await toggleChapterFromBanner(planItem, curMonth, curDay, c);
        };

        grid.appendChild(btn);
    }
}

async function toggleChapterFromBanner(planItem, curMonth, curDay, chapterNum) {
    if (!studentCode) {
        alert('يرجى تسجيل الدخول أولاً لحفظ قراءتك ونقاطك الروحية.');
        return;
    }

    const startChap = planItem.chapter || 1;
    const endChap = planItem.chapter_end || startChap;
    const totalCount = (endChap - startChap + 1);

    const planKey = \`\${curMonth}-\${curDay}_\${studentCode}\`;
    const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
    let savedLog = localReadings[planKey] || {
        code: studentCode,
        month: curMonth,
        day: curDay,
        book: planItem.book,
        reading: planItem.reading,
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
    completed = Array.from(new Set(completed)).sort((a,b)=>a-b);

    const isAll = (completed.length >= totalCount && totalCount > 0);
    savedLog.code = String(studentCode);
    savedLog.month = curMonth;
    savedLog.day = curDay;
    savedLog.book = planItem.book;
    savedLog.reading = planItem.reading;
    savedLog.completed_chapters = completed;
    savedLog.chapters_read_count = completed.length;
    savedLog.total_chapters = totalCount;
    savedLog.is_completed = isAll ? 1 : 0;
    savedLog.completed = isAll ? 1 : 0;
    savedLog.points = (completed.length * 2) + (isAll ? 3 : 0);
    savedLog._synced = false;

    localReadings[planKey] = savedLog;
    localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));

    renderPlanBannerChapters(planItem, curMonth, curDay);
    updateReadingStatusForCurrentChapter();

    try {
        const fetchFn = window.AuthClient ? AuthClient.fetch.bind(AuthClient) : fetch;
        const resp = await fetchFn('/api/mark_plan_read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: studentCode,
                month: curMonth,
                day: curDay,
                book: planItem.book,
                reading: planItem.reading,
                chapter: chapterNum,
                action: 'toggle_chapter',
                completed_chapters: completed,
                total_chapters: totalCount
            })
        });
        if (resp.ok) {
            savedLog._synced = true;
            localReadings[planKey] = savedLog;
            localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));
        }
    } catch (e) {}

    if (isAll) {
        alert('🎉 مبارك! أتممت قراءة جميع إصحاحات اليوم بالكامل وحصلت على بونص الأمانة (+3 نقاط)! ✝️');
    }
}

function updateReadingStatusForCurrentChapter() {
    const btnMark = document.getElementById('btnMarkRead');
    if (!btnMark) return;
    const chapIndex = document.getElementById('chapterSelect')?.value;
    if (chapIndex === undefined || chapIndex === null) return;
    const chapNum = parseInt(chapIndex, 10) + 1;

    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const planKey = \`\${curMonth}-\${curDay}_\${studentCode}\`;

    const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
    const savedLog = localReadings[planKey] || localReadings[\`\${curMonth}-\${curDay}\`] || {};

    let completed = Array.isArray(savedLog.completed_chapters) ? savedLog.completed_chapters : [];
    if (completed.length === 0 && (savedLog.completed || savedLog.is_completed)) {
        completed = [chapNum];
    }

    const isRead = completed.includes(chapNum);
    if (isRead) {
        btnMark.className = 'btn btn-outline-success fw-bold px-4 py-2 shadow-sm rounded-pill';
        btnMark.innerHTML = \`<i class="fa-solid fa-circle-check me-1"></i> أتممت قراءة إصحاح \${chapNum} بنجاح ✔️\`;
    } else {
        btnMark.className = 'btn btn-success fw-bold px-4 py-2 shadow-sm rounded-pill';
        btnMark.innerHTML = \`<i class="fa-solid fa-check me-1"></i> سجّل قراءة إصحاح \${chapNum} (+2 نقطة ⭐)\`;
    }
}
`;

const onloadMarker = 'window.onload = async function() {';
if (html.includes(onloadMarker) && !html.includes('function selectChapterInReader')) {
    html = html.replace(onloadMarker, functionsToInsert + '\n' + onloadMarker);
    console.log('✅ Injected all 4 functions right before window.onload in bible.html');
}

fs.writeFileSync(biblePath, html, 'utf8');
console.log('✅ bible.html fixed and saved successfully');
