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
        return res.status(403).json({ success: false, message: 'غير مصرح لك باستعراض بيانات هذا المخدوم' });
    }

    try {
        const db = getDb();

        // 1. جلب جميع المواد الخاصة بفرقة الطالب
        const subjectsSnapshot = await db.collection('subjects').where('level', '==', level).get();
        let subjects = [];
        subjectsSnapshot.forEach(doc => {
            subjects.push({ id: doc.id, ...doc.data() });
        });

        // 2. جلب الشيتات التي سلمها الطالب مسبقاً
        const submittedSnapshot = await db.collection('students').doc(String(code).trim()).collection('sheet_submissions').get();
        let submitted = [];
        submittedSnapshot.forEach(doc => {
            submitted.push(doc.data().subject_name);
        });

        return res.status(200).json({ success: true, subjects, submitted });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في الاتصال بالخادم' });
    }
};