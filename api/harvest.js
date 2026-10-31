const { getDb } = require('./_lib/firebase');
const { verifyAuth, canAccessStudent } = require('./_lib/auth');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    // 1. التحقق من توكن المصادقة
    const authResult = await verifyAuth(req);
    if (!authResult.ok) {
        return res.status(authResult.status).json({ success: false, message: authResult.error });
    }

    const { code, level } = req.query || {};

    if (!code || !level) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة: مطلوب الكود والفرقة' });
    }

    // 2. التحقق من صلاحية الوصول: صاحب الكود أو فريق الخدمة فقط
    if (!canAccessStudent(authResult.user, code)) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك باستعراض حصاد هذا المخدوم' });
    }

    try {
        const db = getDb();
        const studentCode = String(code).trim();

        // 1. حساب عدد أيام وإصحاحات قراءة الكتاب المقدس المنجزة بدقة
        const readingsSnapshot = await db.collection('students').doc(studentCode).collection('reading_logs').get();
        const bibleCount = readingsSnapshot.size;
        let bibleChaptersCount = 0;
        let fullyCompletedDays = 0;

        readingsSnapshot.forEach(doc => {
            const d = doc.data() || {};
            if (Array.isArray(d.completed_chapters)) {
                bibleChaptersCount += d.completed_chapters.length;
            } else if (d.chapters_read_count) {
                bibleChaptersCount += d.chapters_read_count;
            } else if (d.is_completed || d.completed) {
                bibleChaptersCount += (d.total_chapters || 1);
            }
            if (d.is_completed || d.completed) {
                fullyCompletedDays++;
            }
        });

        // 2. حساب عدد الشيتات المسلمة
        const sheetsSnapshot = await db.collection('students').doc(studentCode).collection('sheet_submissions').get();
        const submittedSheets = sheetsSnapshot.size;

        // 3. حساب إجمالي عدد الشيتات المطلوبة لهذه الفرقة
        const totalSubjectsSnapshot = await db.collection('subjects').where('level', '==', level).get();
        const totalSubjects = totalSubjectsSnapshot.size;

        // 4. حساب عدد أيام النوتة الروحية المسجلة
        const spiritualSnapshot = await db.collection('students').doc(studentCode).collection('daily_logs').get();
        const spiritualCount = spiritualSnapshot.size;

        // 5. جلب بيانات ونقاط المخدوم مع دعم المجموعتين (students و members)
        let studentDoc = await db.collection('students').doc(studentCode).get();
        let memberDoc = null;
        if (!studentDoc.exists) {
            const mSnap = await db.collection('members').where('code', '==', studentCode).limit(1).get();
            if (!mSnap.empty) {
                memberDoc = mSnap.docs[0];
            } else {
                const directDoc = await db.collection('members').doc(studentCode).get();
                if (directDoc.exists) memberDoc = directDoc;
            }
        }

        const baseBonus = (studentDoc.exists ? (studentDoc.data().bonus || 0) : (memberDoc ? (memberDoc.data().bonus || 0) : 0));
        const storedPoints = (studentDoc.exists ? (studentDoc.data().points || 0) : (memberDoc ? (memberDoc.data().points || 0) : 0));
        
        // حساب النقاط التراكمية الموحدة: (أيام النوتة * 5) + (قراءات الإصحاحات * 2 + بونص الأيام الكاملة) + البونص والدرجات المسجلة
        const bibleReadingPoints = Math.max(bibleCount * 5, (bibleChaptersCount * 2) + (fullyCompletedDays * 3));
        const points = Math.max(storedPoints, baseBonus + (spiritualCount * 5) + bibleReadingPoints);

        return res.status(200).json({
            success: true,
            data: {
                points: points,
                bibleCount: bibleCount,
                bibleChaptersCount: bibleChaptersCount,
                totalBibleChapters: 1189,
                totalPlanDays: 366,
                submittedSheets: submittedSheets,
                totalSubjects: totalSubjects,
                spiritualCount: spiritualCount
            }
        });
    } catch (error) {
        console.error("Firebase Error in harvest:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في جلب بيانات الحصاد' });
    }
};
