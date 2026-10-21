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
    // حماية مؤقتة: هذا الملف بلا تحقق من الصلاحية، فهو مغلق افتراضياً حتى المرحلة 2.
    if (process.env.ADMIN_API_ENABLED !== 'true') {
        return res.status(403).json({ success: false, message: 'هذه الواجهة مغلقة حتى إعداد نظام الصلاحيات' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    const { action, payload } = req.body;

    try {
        // 1. إضافة مقرر دراسي جديد
        if (action === 'add_subject') {
            await db.collection('subjects').add({
                level: payload.level,
                title: payload.title,
                sheet_url: payload.sheet_url,
                attachment_file: payload.attachment_file || null, // رابط لملف على درايف أو فايربيز
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(200).json({ success: true, message: 'تمت إضافة المادة بنجاح!' });
        }

        // 2. استيراد المخدومين من إكسيل (Batch Write)
        if (action === 'import_students') {
            const batch = db.batch();
            let count = 0;
            
            payload.students.forEach(std => {
                if (std.code && std.name) {
                    const studentRef = db.collection('students').doc(String(std.code));
                    batch.set(studentRef, {
                        name: String(std.name).trim(),
                        phone: std.phone ? String(std.phone).trim() : '',
                        confession_father: std.confession_father ? String(std.confession_father).trim() : '',
                        level: payload.import_level || 'الفرقة الأولى',
                        points: 0
                    }, { merge: true }); // Merge للحفاظ على النقاط إن كان مسجلاً سابقاً
                    count++;
                }
            });

            await batch.commit();
            return res.status(200).json({ success: true, message: `تم سحب وحفظ ${count} مخدوم بنجاح!` });
        }

        // 3. ضبط مواعيد الخدمة
        if (action === 'save_settings') {
            await db.collection('settings').doc('service_info').set({
                service_year_name: payload.service_year_name,
                start_date: payload.start_date,
                end_date: payload.end_date,
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return res.status(200).json({ success: true, message: 'تم تحديث مواعيد السنة الخدمية بنجاح!' });
        }

        return res.status(400).json({ success: false, message: 'إجراء غير معروف' });

    } catch (error) {
        console.error("Firebase Admin Error:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في تنفيذ طلب الأدمن' });
    }
};