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

    const { code, month, day, reading } = req.body || {};

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

        // حفظ القراءة اليومية في مجموعة reading_logs ومجموعة daily_reading_logs لتوافق جميع الواجهات
        const readingLogData = {
            plan_month: parseInt(month, 10),
            plan_day: parseInt(day, 10),
            reading_text: reading || '',
            is_completed: 1,
            completed: 1,
            points: 5,
            read_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const stdRef = db.collection('students').doc(studentCode);
        await Promise.all([
            stdRef.collection('reading_logs').doc(`${month}-${day}`).set(readingLogData, { merge: true }),
            stdRef.collection('daily_reading_logs').doc(`${month}-${day}`).set(readingLogData, { merge: true })
        ]);

        return res.status(200).json({ success: true, message: 'تم تسجيل قراءة الخطة بنجاح' });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, message: 'فشل التسجيل في السيرفر' });
    }
};