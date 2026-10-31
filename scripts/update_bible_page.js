const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, '../public/bible.html');
let html = fs.readFileSync(biblePath, 'utf8');

// 1. Add updateReadingStatusForCurrentChapter and call it in renderVerses()
const renderVersesTarget = `    document.getElementById('versesArea').innerHTML = html || '<div class="text-center text-muted py-4">لا توجد آيات متوفرة لهذا الإصحاح.</div>';

    window.scrollTo({ top: 180, behavior: 'smooth' });

}`;

const renderVersesReplacement = `    document.getElementById('versesArea').innerHTML = html || '<div class="text-center text-muted py-4">لا توجد آيات متوفرة لهذا الإصحاح.</div>';

    updateReadingStatusForCurrentChapter();

    window.scrollTo({ top: 180, behavior: 'smooth' });

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
        btnMark.className = 'btn btn-outline-success fw-bold px-3 py-2';
        btnMark.innerHTML = \`<i class=\"fa-solid fa-circle-check me-1\"></i> أتممت قراءة إصحاح \${chapNum} بنجاح ✔️\`;
    } else {
        btnMark.className = 'btn btn-success fw-bold px-3 py-2 shadow-sm';
        btnMark.innerHTML = \`<i class=\"fa-solid fa-check me-1\"></i> سجّل قراءة إصحاح \${chapNum} (+2 نقطة ⭐)\`;
    }
}`;

if (html.includes("document.getElementById('versesArea').innerHTML = html") && !html.includes('updateReadingStatusForCurrentChapter')) {
    html = html.replace(renderVersesTarget, renderVersesReplacement);
    console.log('✅ Injected updateReadingStatusForCurrentChapter into renderVerses');
}

// 2. Replace markCurrentChapterRead implementation
const funcStart = 'async function markCurrentChapterRead() {';
const funcEnd = 'function handleBibleBack(e) {';

const p1 = html.indexOf(funcStart);
const p2 = html.indexOf(funcEnd, p1);

if (p1 !== -1 && p2 !== -1) {
    const newMarkFunc = `async function markCurrentChapterRead() {
    if (!studentCode) {
        alert('يرجى تسجيل الدخول أولاً لحفظ قراءتك ونقاطك الروحية.');
        return;
    }

    const btnMark = document.getElementById('btnMarkRead');
    btnMark.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري التسجيل...';
    btnMark.disabled = true;

    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const planKey = \`\${curMonth}-\${curDay}_\${studentCode}\`;

    const bookIndex = document.getElementById('bookSelect').value;
    const chapNum = parseInt(document.getElementById('chapterSelect').value, 10) + 1;
    const book = bibleData[bookIndex];
    const bookTitle = book ? (arabicBookNames[book.name] || book.name) : (targetBookName || 'قراءة يومية');

    let localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
    let savedLog = localReadings[planKey] || {
        code: studentCode,
        month: curMonth,
        day: curDay,
        book: bookTitle,
        reading: bookTitle + ' ' + chapNum,
        completed_chapters: [],
        _synced: false
    };

    let completed = Array.isArray(savedLog.completed_chapters) ? [...savedLog.completed_chapters] : [];
    if (!completed.includes(chapNum)) {
        completed.push(chapNum);
    }
    completed = Array.from(new Set(completed)).sort((a, b) => a - b);

    const totalCount = (targetChapterEnd && targetChapter) ? (targetChapterEnd - targetChapter + 1) : Math.max(...completed, 1);
    const isAll = (completed.length >= totalCount && totalCount > 0);

    savedLog.code = String(studentCode);
    savedLog.name = studentName;
    savedLog.book = bookTitle;
    savedLog.chapter = chapNum;
    savedLog.completed_chapters = completed;
    savedLog.chapters_read_count = completed.length;
    savedLog.total_chapters = totalCount;
    savedLog.is_completed = isAll ? 1 : 0;
    savedLog.completed = isAll ? 1 : 0;
    savedLog.points = (completed.length * 2) + (isAll ? 3 : 0);
    savedLog._synced = false;

    localReadings[planKey] = savedLog;
    localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));

    if (window.AuthClient) {
        try {
            const resp = await AuthClient.fetch('/api/mark_plan_read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: studentCode,
                    month: curMonth,
                    day: curDay,
                    book: bookTitle,
                    reading: bookTitle + ' ' + chapNum,
                    chapter: chapNum,
                    action: 'mark_chapter',
                    completed_chapters: completed,
                    total_chapters: totalCount
                })
            });
            if (resp.ok) {
                savedLog._synced = true;
                localReadings[planKey] = savedLog;
                localStorage.setItem('khedmety_bible_readings', JSON.stringify(localReadings));
            }
        } catch (e) {
            console.warn('API sync warning:', e);
        }
    }

    if (fsdb) {
        try {
            await fsdb.collection('students').doc(studentCode).collection('reading_logs').doc(\`\${curMonth}-\${curDay}\`).set(savedLog, { merge: true });
        } catch(e) {}
    }

    btnMark.disabled = false;
    updateReadingStatusForCurrentChapter();

    if (isAll) {
        alert('🎉 مبارك! أتممت قراءة جميع إصحاحات اليوم بنجاح وحصلت على بونص الأمانة (+3 نقاط)! ✝️');
    }
}

window.onload = async function() {
    await detectTodayPlan();
    await loadBibleData();
};

`;
    html = html.substring(0, p1) + newMarkFunc + html.substring(p2);
    console.log('✅ Replaced markCurrentChapterRead in bible.html');
}

fs.writeFileSync(biblePath, html, 'utf8');
console.log('✅ bible.html saved successfully');
