const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        })
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    const { code, month, day, reading } = req.body;

    if (!code || !month || !day) {
        return res.status(400).json({ success: false, message: 'بيانات غير مكتملة' });
    }

    try {
        // حفظ القراءة اليومية في مجموعة daily_reading_logs داخل وثيقة المخدوم
        const planLogRef = db.collection('students').doc(code).collection('daily_reading_logs').doc(`${month}-${day}`);

        await planLogRef.set({
            plan_month: parseInt(month),
            plan_day: parseInt(day),
            reading_text: reading,
            is_completed: 1,
            read_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Firebase Error:", error);
        return res.status(500).json({ success: false, message: 'فشل التسجيل في السيرفر' });
    }
};