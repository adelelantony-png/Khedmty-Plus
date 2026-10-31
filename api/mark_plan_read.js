const { getAdmin, getDb } = require('./_lib/firebase');
const { verifyAuth, canAccessStudent } = require('./_lib/auth');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    // 1. التحقق من توكن المصادقة
    const authResult = await verifyAuth(req);
    if (!authResult.ok) {
        return res.status(authResult.status).json({ success: false, message: authResult.error });
    }

    const { code, month, day, reading, book, chapter, completed_chapters, total_chapters, action } = req.body || {};

    if (!code || !month || !day) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة: مطلوب الكود والشهر واليوم' });
    }

    // 2. التحقق من صلاحية الوصول: صاحب الكود أو فريق الخدمة فقط
    if (!canAccessStudent(authResult.user, code)) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بتسجيل القراءة لمخدوم آخر' });
    }

    try {
        const db = getDb();
        const admin = getAdmin();
        const studentCode = String(code).trim();
        const docId = `${month}-${day}`;
        const stdRef = db.collection('students').doc(studentCode);
        const docRef = stdRef.collection('reading_logs').doc(docId);

        let existingData = {};
        try {
            const docSnap = await docRef.get();
            if (docSnap && docSnap.exists) {
                existingData = docSnap.data() || {};
            }
        } catch (e) {
            existingData = {};
        }

        let chapters = Array.isArray(existingData.completed_chapters) ? [...existingData.completed_chapters] : [];
        if (chapters.length === 0 && (existingData.is_completed === 1 || existingData.completed === 1)) {
            if (Array.isArray(existingData.chapters_plan) && existingData.chapters_plan.length > 0) {
                chapters = [...existingData.chapters_plan];
            }
        }

        const reqChapter = (chapter !== undefined && chapter !== null) ? parseInt(chapter, 10) : null;
        const reqCompletedChapters = Array.isArray(completed_chapters) ? completed_chapters.map(n => parseInt(n, 10)) : null;

        if (reqCompletedChapters !== null) {
            chapters = reqCompletedChapters;
        } else if (reqChapter !== null) {
            if (action === 'unmark_chapter') {
                chapters = chapters.filter(c => c !== reqChapter);
            } else if (action === 'toggle_chapter') {
                if (chapters.includes(reqChapter)) {
                    chapters = chapters.filter(c => c !== reqChapter);
                } else {
                    chapters.push(reqChapter);
                }
            } else {
                if (!chapters.includes(reqChapter)) {
                    chapters.push(reqChapter);
                }
            }
        } else {
            // Legacy: mark all or default
            if (Array.isArray(req.body.chapters_plan) && req.body.chapters_plan.length > 0) {
                chapters = req.body.chapters_plan.map(n => parseInt(n, 10));
            } else if (total_chapters) {
                chapters = [];
                for (let i = 1; i <= parseInt(total_chapters, 10); i++) chapters.push(i);
            } else {
                chapters = [1];
            }
        }

        // إزالة التكرار والترتيب
        chapters = Array.from(new Set(chapters)).filter(n => !isNaN(n)).sort((a, b) => a - b);

        const totalChaps = total_chapters ? parseInt(total_chapters, 10) : (existingData.total_chapters || (chapters.length > 0 ? Math.max(...chapters, 1) : 1));
        const isFullyCompleted = totalChaps > 0 ? (chapters.length >= totalChaps) : (chapters.length > 0);

        // نقطتان لكل إصحاح مقروء + 3 نقاط بونص عند إتمام خطة اليوم كاملة
        const calculatedPoints = (chapters.length * 2) + (isFullyCompleted ? 3 : 0);

        const readingLogData = {
            plan_month: parseInt(month, 10),
            plan_day: parseInt(day, 10),
            reading_text: reading || existingData.reading_text || '',
            book: book || existingData.book || '',
            completed_chapters: chapters,
            chapters_read_count: chapters.length,
            total_chapters: totalChaps,
            is_completed: isFullyCompleted ? 1 : 0,
            completed: isFullyCompleted ? 1 : 0,
            points: calculatedPoints,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
            read_at: existingData.read_at || admin.firestore.FieldValue.serverTimestamp()
        };

        await Promise.all([
            stdRef.collection('reading_logs').doc(docId).set(readingLogData, { merge: true }),
            stdRef.collection('daily_reading_logs').doc(docId).set(readingLogData, { merge: true })
        ]);

        return res.status(200).json({
            success: true,
            message: isFullyCompleted ? 'تم إتمام قراءة اليوم كاملة بنجاح! ✝️' : `تم تسجيل قراءة الإصحاح بنجاح (${chapters.length}/${totalChaps}) 📖`,
            data: {
                completed_chapters: chapters,
                chapters_read_count: chapters.length,
                total_chapters: totalChaps,
                is_fully_completed: isFullyCompleted,
                points: calculatedPoints
            }
        });
    } catch (error) {
        console.error("Firebase Error in mark_plan_read:", error);
        return res.status(500).json({ success: false, message: 'فشل التسجيل في السيرفر' });
    }
};
