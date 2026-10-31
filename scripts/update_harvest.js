const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/harvest.html');
let html = fs.readFileSync(filePath, 'utf8');

const oldStart = 'function calculateLocalHarvest() {';
const oldEnd = 'loadHarvest();';

const p1 = html.indexOf(oldStart);
const p2 = html.indexOf(oldEnd, p1);

if (p1 !== -1 && p2 !== -1) {
    const newCode = `function calculateLocalHarvest() {
        const attendanceRecord = JSON.parse(localStorage.getItem('my_church_attendance')) || {};
        let attendancePoints = 0;
        Object.keys(attendanceRecord).forEach(dateKey => {
            const list = attendanceRecord[dateKey] || [];
            const myRecord = list.find(a => String(a.code || a.id || '') === studentCode);
            if (myRecord && !myRecord.isAbsentDueToDelay) {
                const isFri = new Date(dateKey).getDay() === 5;
                attendancePoints += (myRecord.points || (isFri ? 5 : 15));
            }
        });

        const localSpiritual = JSON.parse(localStorage.getItem('khedmety_student_spiritual')) || {};
        let spiritualCount = Object.keys(localSpiritual).filter(key => key.endsWith(\`_\${studentCode}\`)).length;

        const bibleReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
        let bibleCount = 0;
        let bibleChaptersCount = 0;
        Object.keys(bibleReadings).forEach(k => {
            if (k.endsWith(\`_\${studentCode}\`) || String((bibleReadings[k] || {}).code || '') === studentCode) {
                bibleCount++;
                const item = bibleReadings[k] || {};
                if (Array.isArray(item.completed_chapters)) {
                    bibleChaptersCount += item.completed_chapters.length;
                } else if (item.chapters_read_count) {
                    bibleChaptersCount += item.chapters_read_count;
                } else {
                    bibleChaptersCount += (item.total_chapters || 1);
                }
            }
        });

        const submittedSheetsMap = JSON.parse(localStorage.getItem('khedmety_submitted_sheets')) || {};
        const submittedSheets = (submittedSheetsMap[studentCode] || []).length;

        return {
            attendancePoints,
            spiritualCount,
            bibleCount,
            bibleChaptersCount,
            totalBibleChapters: 1189,
            submittedSheets,
            totalPlanDays: 366,
            totalSubjects: 7
        };
    }

    async function loadHarvest() {
        if (window.AuthClient) {
            try {
                const response = await AuthClient.fetch(\`/api/harvest?code=\${encodeURIComponent(studentCode)}&level=\${encodeURIComponent(studentLevel)}\`);
                if (response.ok) {
                    const resJson = await response.json();
                    if (resJson && resJson.success && resJson.data) {
                        renderHarvestUI(resJson.data);
                        return;
                    }
                }
            } catch (apiErr) {
                console.warn("API harvest fetch error, fallback to cloud/local:", apiErr);
            }
        }

        try {
            const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const attQuery = (firebase.firestore && firebase.firestore.FieldPath)
                ? fsdb.collection('attendance').where(firebase.firestore.FieldPath.documentId(), '>=', cutoffDate)
                : fsdb.collection('attendance');

            const [attSnap, bibleSnap, spirSnap, sheetsSnap] = await Promise.all([
                attQuery.get(),
                fsdb.collection('students').doc(studentCode).collection('reading_logs').get(),
                fsdb.collection('students').doc(studentCode).collection('daily_logs').get(),
                fsdb.collection('students').doc(studentCode).collection('sheet_submissions').get()
            ]);

            const cloudAtt = JSON.parse(localStorage.getItem('my_church_attendance')) || {};
            attSnap.forEach(doc => { cloudAtt[doc.id] = Object.values(doc.data() || {}).filter(Boolean); });
            if (Object.keys(cloudAtt).length > 0) {
                localStorage.setItem('my_church_attendance', JSON.stringify(cloudAtt));
            }

            const localData = calculateLocalHarvest();

            let bibleSnapChapters = 0;
            bibleSnap.forEach(doc => {
                const d = doc.data() || {};
                if (Array.isArray(d.completed_chapters)) bibleSnapChapters += d.completed_chapters.length;
                else if (d.chapters_read_count) bibleSnapChapters += d.chapters_read_count;
                else if (d.is_completed || d.completed) bibleSnapChapters += (d.total_chapters || 1);
            });

            const mergedBibleCount = Math.max(bibleSnap.size, localData.bibleCount);
            const mergedBibleChapters = Math.max(bibleSnapChapters, localData.bibleChaptersCount || localData.bibleCount);
            const mergedSpiritualCount = Math.max(spirSnap.size, localData.spiritualCount);
            const mergedSheets = Math.max(sheetsSnap.size, localData.submittedSheets);
            const mergedPoints = localData.attendancePoints + (mergedSpiritualCount * 5) + (mergedBibleChapters * 2);

            renderHarvestUI({
                points: mergedPoints,
                bibleCount: mergedBibleCount,
                bibleChaptersCount: mergedBibleChapters,
                totalBibleChapters: 1189,
                totalPlanDays: 366,
                submittedSheets: mergedSheets,
                totalSubjects: 7,
                spiritualCount: mergedSpiritualCount
            });
        } catch (error) {
            console.warn("تم الاعتماد على الحساب المحلي:", error);
            const localData = calculateLocalHarvest();
            localData.points = localData.attendancePoints + (localData.spiritualCount * 5) + ((localData.bibleChaptersCount || localData.bibleCount) * 2);
            renderHarvestUI(localData);
        }
    }

    function renderHarvestUI(data) {
        const ptEl = document.getElementById('stat-points');
        if (ptEl) {
            ptEl.textContent = data.points;
        }

        const totalChapters = data.totalBibleChapters || 1189;
        const chapCount = data.bibleChaptersCount || data.bibleCount || 0;
        const biblePercent = totalChapters > 0 ? Math.min(100, Math.round((chapCount / totalChapters) * 100)) : 0;

        document.getElementById('stat-bible-text').textContent = \`أتممت \${chapCount} إصحاحاً مقروءاً (\${data.bibleCount} يوماً مسجلاً)\`;
        document.getElementById('stat-bible-badge').textContent = \`\${biblePercent}%\`;
        document.getElementById('stat-bible-bar').style.width = \`\${Math.max(biblePercent, chapCount > 0 ? 1 : 0)}%\`;

        const sheetPercent = data.totalSubjects > 0 ? Math.min(100, Math.round((data.submittedSheets / data.totalSubjects) * 100)) : 0;
        document.getElementById('stat-sheets-text').textContent = \`سلمت \${data.submittedSheets} من أصل \${data.totalSubjects} شيتات مطلوبة\`;
        document.getElementById('stat-sheets-badge').textContent = \`\${sheetPercent}%\`;
        document.getElementById('stat-sheets-bar').style.width = \`\${sheetPercent}%\`;

        const noteBadge = document.getElementById('stat-spiritual-badge');
        noteBadge.textContent = \`\${data.spiritualCount} يوم مسجل\`;
        if (data.spiritualCount > 0) {
            noteBadge.classList.replace('bg-danger', 'bg-success');
        }

        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('stats-container').classList.remove('d-none');
    }

    `;

    html = html.substring(0, p1) + newCode + html.substring(p2);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('✅ Replaced functions in harvest.html successfully');
} else {
    console.error('Could not locate markers in harvest.html');
}
