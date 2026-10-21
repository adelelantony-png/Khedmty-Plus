const { getAdmin, getDb } = require('./_lib/firebase');
const { verifyAuth, isAdmin } = require('./_lib/auth');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    // 1. التحقق الحقيقي من توكن المصادقة
    const authResult = await verifyAuth(req);
    if (!authResult.ok) {
        return res.status(authResult.status).json({ success: false, message: authResult.error });
    }

    // 2. التحقق من صلاحية الأدمن (أمين الخدمة)
    if (!isAdmin(authResult.user)) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بالوصول: هذه الواجهة مخصصة لأمين الخدمة فقط' });
    }

    const { action, payload } = req.body || {};
    if (!action) {
        return res.status(400).json({ success: false, message: 'لم يتم تحديد الإجراء المطلوب' });
    }

    try {
        const db = getDb();
        const admin = getAdmin();

        // 1. إضافة مقرر دراسي جديد
        if (action === 'add_subject') {
            if (!payload || !payload.title || !payload.level) {
                return res.status(400).json({ success: false, message: 'بيانات المقرر غير مكتملة' });
            }
            await db.collection('subjects').add({
                level: payload.level,
                title: payload.title,
                sheet_url: payload.sheet_url || '',
                attachment_file: payload.attachment_file || null, // رابط لملف على درايف أو فايربيز
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(200).json({ success: true, message: 'تمت إضافة المادة بنجاح!' });
        }

        // 2. استيراد المخدومين من إكسيل (Batch Write)
        if (action === 'import_students') {
            if (!payload || !Array.isArray(payload.students) || payload.students.length === 0) {
                return res.status(400).json({ success: false, message: 'قائمة الطلاب فارغة أو غير صحيحة' });
            }
            const batch = db.batch();
            let count = 0;
            
            payload.students.forEach(std => {
                if (std && std.code && std.name) {
                    const studentRef = db.collection('students').doc(String(std.code).trim());
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
            if (!payload || !payload.service_year_name) {
                return res.status(400).json({ success: false, message: 'بيانات السنة الخدمية غير مكتملة' });
            }
            await db.collection('settings').doc('service_info').set({
                service_year_name: payload.service_year_name,
                start_date: payload.start_date || '',
                end_date: payload.end_date || '',
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return res.status(200).json({ success: true, message: 'تم تحديث مواعيد السنة الخدمية بنجاح!' });
        }

        // 4. إنشاء / تفعيل حساب خادم في Firebase Auth بأمان دون إسقاط جلسة الأدمن
        if (action === 'create_servant_auth') {
            if (!payload || (!payload.servantId && !payload.code)) {
                return res.status(400).json({ success: false, message: 'بيانات الخادم غير مكتملة' });
            }
            const servantCode = String(payload.code || payload.servantId).trim();
            const servantName = String(payload.name || '').trim();
            const servantRole = payload.permission || payload.role || 'servant';
            const cleanCode = servantCode.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `servant_${payload.servantId}`;
            const servantEmail = `${cleanCode}@khedmty.local`;
            const uid = `srv_${cleanCode}`;

            const auth = admin.auth();
            if (auth) {
                if (typeof auth.getUser === 'function' && typeof auth.createUser === 'function') {
                    try {
                        await auth.getUser(uid);
                    } catch (err) {
                        if (err.code === 'auth/user-not-found') {
                            await auth.createUser({
                                uid: uid,
                                email: servantEmail,
                                displayName: servantName || servantCode,
                                disabled: false
                            });
                        }
                    }
                }

                if (typeof auth.setCustomUserClaims === 'function') {
                    await auth.setCustomUserClaims(uid, {
                        role: 'servant',
                        perm: servantRole,
                        code: servantCode,
                        name: servantName
                    });
                }
            }

            // تحديث وثيقة الخادم في firestore
            await db.collection('servants').doc(String(payload.servantId || servantCode)).set({
                name: servantName,
                code: servantCode,
                role: servantRole,
                isCloudLinked: true,
                cloudUid: uid,
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return res.status(200).json({
                success: true,
                message: `تم اعتماد وتفعيل حساب الخادم (${servantName || servantCode}) سحابياً بنجاح`,
                uid: uid
            });
        }

        return res.status(400).json({ success: false, message: 'إجراء غير معروف' });

    } catch (error) {
        console.error("Firebase Admin Error:", error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في تنفيذ طلب الأدمن' });
    }
};