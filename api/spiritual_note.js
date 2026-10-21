const { getAdmin, getDb } = require('./_lib/firebase');
const { verifyAuth, canAccessStudent } = require('./_lib/auth');

module.exports = async (req, res) => {
    // التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    // 1. التحقق من توكن المصادقة
    const authResult = await verifyAuth(req);
    if (!authResult.ok) {
        return res.status(authResult.status).json({ success: false, message: authResult.error });
    }

    const { code, date, baker, ghoroub, noam, fasting, mass } = req.body || {};

    if (!code || !date) {
        return res.status(400).json({ success: false, message: 'تأكد من إدخال الكود والتاريخ' });
    }

    // 2. التحقق من صلاحية الوصول: صاحب الكود أو فريق الخدمة فقط
    if (!canAccessStudent(authResult.user, code)) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بتسجيل النوتة الروحية لمخدوم آخر' });
    }

    try {
        const db = getDb();
        const admin = getAdmin();
        const studentCode = String(code).trim();
        const recordDate = String(date).trim();

        // المرجع لمكان حفظ النوتة: students/{code}/daily_logs/{date}
        const dailyLogRef = db.collection('students').doc(studentCode).collection('daily_logs').doc(recordDate);

        // حفظ أو تحديث بيانات اليوم
        await dailyLogRef.set({
            prayed_baker: baker ? 1 : 0,
            prayed_ghoroub: ghoroub ? 1 : 0,
            prayed_noam: noam ? 1 : 0,
            fasting: fasting ? 1 : 0,
            attended_mass: mass ? 1 : 0,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return res.status(200).json({ success: true, message: 'تم تسجيل وسائط النعمة بنجاح!' });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحفظ في الخادم' });
    }
};