const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Banner & Spiritual Note Chapter Polish...');

// =========================================================================
// 1. UPDATE public/bible.html
// =========================================================================
const biblePath = path.join(__dirname, '../public/bible.html');
let bibleHtml = fs.readFileSync(biblePath, 'utf8');

const newBannerMarkup = '<div id="planBanner" class="plan-alert mb-3" style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-right: 5px solid #d97706 !important; border-radius: 16px; padding: 14px 18px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.08);">\n' +
'            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">\n' +
'                <div>\n' +
'                    <span class="badge bg-warning text-dark mb-1 fw-bold"><i class="fa-solid fa-calendar-day me-1"></i> قراءة اليوم المقررة</span>\n' +
'                    <div class="fw-bold text-dark fs-6" id="planBannerTitle">جاري فحص الخطة...</div>\n' +
'                </div>\n' +
'                <div id="planBannerSummaryBadge" class="badge bg-light text-dark border border-warning px-3 py-2 fw-bold" style="font-size:0.85rem;">\n' +
'                    جاري فحص الإصحاحات...\n' +
'                </div>\n' +
'            </div>\n' +
'            <!-- كبسولات الإصحاحات الفردية التفاعلية -->\n' +
'            <div class="d-flex flex-wrap gap-2 align-items-center mt-2 pt-2 border-top border-warning border-opacity-25" id="planBannerChaptersGrid">\n' +
'                <!-- Dynamically populated chapter buttons -->\n' +
'            </div>\n' +
'            <!-- رسالة إتمام اليوم بالكامل -->\n' +
'            <div id="planBannerCompletionAlert" class="alert alert-success d-none mt-2 mb-0 py-2 px-3 fw-bold small text-center" style="border-radius: 10px;">\n' +
'                🎉 مبارك! أتممت قراءة جميع إصحاحات اليوم بالكامل وحصلت على بونص الأمانة الذهبي (+3 نقاط)! ✝️\n' +
'            </div>\n' +
'        </div>';

if (bibleHtml.includes('id="planBanner"')) {
    const pStart = bibleHtml.indexOf('<div id="planBanner"');
    const pEnd = bibleHtml.indexOf('<div class="filter-box">', pStart);
    if (pStart !== -1 && pEnd !== -1) {
        bibleHtml = bibleHtml.substring(0, pStart) + newBannerMarkup + '\n\n        ' + bibleHtml.substring(pEnd);
        console.log('✅ Updated planBanner HTML markup in bible.html');
    }
}

// B. Add helper functions in bible.html
const bibleHelperFunctions = `
function selectChapterInReader(bookName, chapterNum) {
    const bookSelect = document.getElementById('bookSelect');
    const chapterSelect = document.getElementById('chapterSelect');
    if (!bookSelect || !chapterSelect || !bibleData.length) return;

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
    if (typeof updateReadingStatusForCurrentChapter === 'function') {
        updateReadingStatusForCurrentChapter();
    }

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
`;

// Inject into detectTodayPlan
const detectMarker = 'bannerTitle.textContent = bannerTxt;';
const newDetectCode = 'bannerTitle.textContent = bannerTxt;\n        renderPlanBannerChapters(todayItem, curMonth, curDay);';

if (bibleHtml.includes(detectMarker) && !bibleHtml.includes('renderPlanBannerChapters(todayItem')) {
    bibleHtml = bibleHtml.replace(detectMarker, newDetectCode);
}

// Append helper functions before </script>
const scriptEnd = '</script>\n\n</body>';
if (!bibleHtml.includes('function renderPlanBannerChapters')) {
    bibleHtml = bibleHtml.replace(scriptEnd, bibleHelperFunctions + '\n' + scriptEnd);
    console.log('✅ Injected renderPlanBannerChapters & toggleChapterFromBanner into bible.html');
}

fs.writeFileSync(biblePath, bibleHtml, 'utf8');
console.log('✅ Saved updated bible.html');


// =========================================================================
// 2. UPDATE public/spiritual_note.html
// =========================================================================
const notePath = path.join(__dirname, '../public/spiritual_note.html');
let noteHtml = fs.readFileSync(notePath, 'utf8');

const updateNoteCheckCatchup = `
                // حساب وعرض الإصحاحات المتبقية التي لم يقرأها المخدوم بشكل لطيف
                let remainingBox = document.getElementById('catchup-remaining-card');
                if (!remainingBox) {
                    remainingBox = document.createElement('div');
                    remainingBox.id = 'catchup-remaining-card';
                    chapsBox.parentNode.insertBefore(remainingBox, chapsBox.nextSibling);
                }

                const remainingChaps = [];
                for (let c = startChap; c <= endChap; c++) {
                    if (!completed.includes(c)) remainingChaps.push(c);
                }

                if (remainingChaps.length > 0) {
                    remainingBox.className = 'mt-2 p-3 rounded-3';
                    remainingBox.style.cssText = 'background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px dashed #d97706; border-radius: 14px;';
                    remainingBox.innerHTML = \`
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold text-dark" style="font-size: 0.9rem;">
                                <i class="fa-solid fa-hourglass-half text-warning me-1"></i> متبقي لك في قراءة هذا اليوم:
                            </span>
                            <span class="badge bg-warning text-dark fw-bold">\${remainingChaps.length} إصحاح متبقي</span>
                        </div>
                        <p class="small text-muted mb-2">
                            أتممت <strong>\${completed.length}</strong> من أصل <strong>\${totalCount}</strong> إصحاحات. أكمل الإصحاحات التالية للحصول على بونص الأمانة (+3 نقاط):
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                            \${remainingChaps.map(c => \`
                                <a href="bible.html?book=\${encodeURIComponent(planItem.book)}&chapter=\${c}&from=spiritual_note" class="badge bg-white text-dark border border-warning text-decoration-none px-3 py-2 shadow-sm d-inline-flex align-items-center gap-1" style="font-size:0.84rem; border-radius:8px;">
                                    <i class="fa-solid fa-book-bible text-warning"></i>
                                    <span>قراءة إصحاح \${c} 📖</span>
                                </a>
                            \`).join('')}
                        </div>
                    \`;
                } else if (totalCount > 0) {
                    remainingBox.className = 'mt-2 p-2 rounded-3 alert alert-success d-flex align-items-center gap-2 mb-0';
                    remainingBox.style.borderRadius = '12px';
                    remainingBox.innerHTML = \`
                        <i class="fa-solid fa-circle-check fs-5 text-success"></i>
                        <div>
                            <strong class="d-block small">رائع! أتممت قراءة جميع إصحاحات هذا اليوم بنجاح ✝️</strong>
                            <small class="text-muted">حصلت على كامل نقاط القراءة وبونص الأمانة الذهبي (+3 نقاط)!</small>
                        </div>
                    \`;
                } else {
                    remainingBox.innerHTML = '';
                    remainingBox.className = 'd-none';
                }
`;

const catchupInsertMarker = 'chapsGrid.appendChild(pill);';
if (noteHtml.includes(catchupInsertMarker) && !noteHtml.includes('catchup-remaining-card')) {
    const loopEnd = noteHtml.indexOf('}', noteHtml.indexOf(catchupInsertMarker)) + 1;
    noteHtml = noteHtml.substring(0, loopEnd) + '\n' + updateNoteCheckCatchup + '\n' + noteHtml.substring(loopEnd);
    fs.writeFileSync(notePath, noteHtml, 'utf8');
    console.log('✅ Added remaining chapters card presentation to spiritual_note.html');
}
