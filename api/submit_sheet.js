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

    const { code, subject, q1, q2 } = req.body || {};

    if (!code || !subject || !q1 || !q2) {
        return res.status(400).json({ success: false, message: 'تأكد من كتابة جميع الإجابات واكتمال البيانات' });
    }

    // 2. التحقق من صلاحية الوصول: صاحب الكود أو فريق الخدمة فقط
    if (!canAccessStudent(authResult.user, code)) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بتسليم إجابات شيت لمخدوم آخر' });
    }

    try {
        const db = getDb();
        const admin = getAdmin();
        const studentCode = String(code).trim();
        const subjectDocId = String(subject).trim();

        // حفظ الإجابات في مجموعة فرعية (sheet_submissions) داخل وثيقة الطالب
        const submissionRef = db.collection('students').doc(studentCode).collection('sheet_submissions').doc(subjectDocId);

        await submissionRef.set({
            subject_name: subject,
            q1_answer: q1,
            q2_answer: q2,
            submitted_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return res.status(200).json({ success: true, message: 'تم تسليم إجابات الشيت بنجاح ورصدها في درجاتك!' });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الإجابات' });
    }
};