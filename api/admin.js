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

        // 2. حذف مخدوم نهائياً من السحابة والمنظومة

        if (action === 'delete_member' || action === 'delete_student') {

            const { code, id, phone } = payload || {};

            const cleanCode = String(code || '').trim();

            const cleanId = String(id || '').trim();

            const cleanPhone = String(phone || '').trim();

            const batch = db.batch();

            let touched = false;

            if (cleanId) {

                batch.delete(db.collection('members').doc(cleanId));

                touched = true;

            }

            if (cleanCode) {

                batch.delete(db.collection('students').doc(cleanCode));

                batch.delete(db.collection('members').doc(cleanCode));

                touched = true;

            }

            if (touched) {

                await batch.commit();

            }

            // فحص إضافي بالهاتف إن لم يتوفر كود أو ID

            if (cleanPhone && !cleanCode) {

                const snap = await db.collection('members').where('phone', '==', cleanPhone).get();

                if (!snap.empty) {

                    const phoneBatch = db.batch();

                    snap.forEach(d => phoneBatch.delete(d.ref));

                    await phoneBatch.commit();

                }

            }

            return res.status(200).json({ success: true, message: 'تم حذف المخدوم من السحابة بنجاح!' });

        }

        // 2c. حذف خادم نهائياً من السحابة وقواعد البيانات

        if (action === 'delete_servant') {

            const { code, id, phone } = payload || {};

            const cleanCode = String(code || '').trim();

            const cleanId = String(id || '').trim();

            const cleanPhone = String(phone || '').trim();

            const batch = db.batch();

            let touched = false;

            if (cleanCode) {

                batch.delete(db.collection('servants').doc(cleanCode));

                touched = true;

            }

            if (cleanId && cleanId !== cleanCode) {

                batch.delete(db.collection('servants').doc(cleanId));

                touched = true;

            }

            if (touched) {

                await batch.commit();

            }

            // فحص إضافي بالهاتف إن لم يتوفر كود أو ID

            if (cleanPhone && !cleanCode) {

                const snap = await db.collection('servants').where('phone', '==', cleanPhone).get();

                if (!snap.empty) {

                    const phoneBatch = db.batch();

                    snap.forEach(d => phoneBatch.delete(d.ref));

                    await phoneBatch.commit();

                }

            }

            return res.status(200).json({ success: true, message: 'تم حذف الخادم من السحابة بنجاح!' });

        }

        // 2b. حذف يوم حضور أو تنظيف الأيام التجريبية السابقة لانطلاق الخدمة

        if (action === 'delete_attendance_date') {

            const { date } = payload || {};

            if (date) {

                await db.collection('attendance').doc(String(date)).delete();

                return res.status(200).json({ success: true, message: `تم حذف يوم الحضور (${date}) بنجاح!` });

            }

        }

        if (action === 'clean_test_attendance_before') {

            const { cutoffDate } = payload || {};

            const cutoff = cutoffDate || '2026-11-06';

            const snap = await db.collection('attendance').where(admin.firestore.FieldPath.documentId(), '>=', (payload && payload.since_date) || '2026-11-01').get();

            const batch = db.batch();

            let count = 0;

            snap.forEach(doc => {

                if (doc.id < cutoff) {

                    batch.delete(doc.ref);

                    count++;

                }

            });

            if (count > 0) await batch.commit();

            return res.status(200).json({ success: true, message: `تم حذف وتطهير ${count} يوم حضور تجريبي قبل تاريخ ${cutoff}` });

        }

        // 3. استيراد المخدومين من إكسيل (Batch Write)

        if (action === 'import_students') {

            if (!payload || !Array.isArray(payload.students) || payload.students.length === 0) {

                return res.status(400).json({ success: false, message: 'قائمة الطلاب فارغة أو غير صحيحة' });

            }

            const batch = db.batch();

            let count = 0;

            payload.students.forEach(std => {

                if (std && std.code && std.name) {

                    const cleanCode = String(std.code).trim();

                    const cleanName = String(std.name).trim();

                    const cleanPhone = std.phone ? String(std.phone).trim() : '';

                    const cleanFather = std.confession_father ? String(std.confession_father).trim() : '';

                    const level = payload.import_level || 'الفرقة الأولى';

                    // 1. مزامنة مع مجموعة students (الدارسين والنتائج)

                    const studentRef = db.collection('students').doc(cleanCode);

                    batch.set(studentRef, {

                        name: cleanName,

                        phone: cleanPhone,

                        confession_father: cleanFather,

                        level: level,

                        points: 0

                    }, { merge: true }); // Merge للحفاظ على النقاط إن كان مسجلاً سابقاً

                    // 2. مزامنة مع مجموعة members (لوحة الخدام وحضور الجمعة)

                    const memberRef = db.collection('members').doc(cleanCode);

                    batch.set(memberRef, {

                        id: cleanCode,

                        code: cleanCode,

                        name: cleanName,

                        phone: cleanPhone,

                        confessor: cleanFather,

                        stage: level,

                        active: true

                    }, { merge: true });

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

        // 5. جلب بيانات المخدومين والحضور والخدام والخطة والآراء والإعدادات لمزامنة الإكسيل الشاملة

        // 4b. جلب حضور تاريخ معين بسرعة فائقة (أقل من 50ms) لكشف الغياب وشيت الإكسيل
        if (action === 'get_attendance_only') {
            const date = (payload && payload.date) || '2026-11-06';
            try {
                const doc = await db.collection('attendance').doc(date).get();
                return res.status(200).json({
                    success: true,
                    date: date,
                    exists: doc.exists,
                    attendance: (doc.exists && doc.data()) ? doc.data() : {}
                });
            } catch (e) {
                return res.status(500).json({ success: false, error: e.message });
            }
        }

        // 5. جلب بيانات المخدومين والحضور والخدام والخطة والآراء والإعدادات لمزامنة الإكسيل الشاملة
        if (action === 'get_sync_data') {
            const members = {};
            const attendance = {};
            const servants = {};
            let plan = [];
            let settings = {};
            const feedback = [];

            // 1. Attendance (فوري ومفلتر بالعام الخدمي)
            try {
                const sinceDate = (payload && payload.since_date) || '2026-11-01';
                const aSnap = await db.collection('attendance')
                    .where(admin.firestore.FieldPath.documentId(), '>=', sinceDate)
                    .get();
                aSnap.forEach(doc => {
                    attendance[doc.id] = doc.data() || {};
                });
            } catch (err) {
                console.error("attendance fetch error:", err.message);
            }

            // 2. Members
            try {
                const mSnap = await db.collection('members').limit(250).get();
                mSnap.forEach(doc => {
                    const data = doc.data() || {};
                    members[doc.id] = Object.assign({ id: doc.id }, data);
                });
            } catch (err) {
                console.error("members fetch error:", err.message);
            }

            // إذا كان المطلوب هو الحضور والمخدومين فقط (للإكسيل السريع) نرجع فوراً
            if (payload && (payload.quick || payload.only === 'attendance')) {
                return res.status(200).json({
                    success: true,
                    members,
                    attendance,
                    servants,
                    plan,
                    feedback,
                    settings
                });
            }

            // 3. Servants
            try {
                const sSnap = await db.collection('servants').limit(50).get();
                sSnap.forEach(doc => {
                    const data = doc.data() || {};
                    servants[doc.id] = Object.assign({ id: doc.id }, data);
                });
            } catch (err) {}

            // 4. Master Plan
            try {
                const pDoc = await db.collection('config').doc('master_plan').get();
                if (pDoc && pDoc.exists) {
                    const pData = pDoc.data();
                    plan = (pData && Array.isArray(pData.list)) ? pData.list : [];
                }
            } catch (err) {}

            // 5. Settings
            try {
                const setDoc = await db.collection('config').doc('settings').get();
                if (setDoc && setDoc.exists) {
                    settings = setDoc.data() || {};
                }
            } catch (err) {}

            return res.status(200).json({
                success: true,
                members,
                attendance,
                servants,
                plan,
                feedback,
                settings
            });
        }

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

        // 5. جلب بيانات المخدومين والحضور والخدام والخطة والآراء والإعدادات لمزامنة الإكسيل الشاملة

        if (action === 'get_sync_data') {

            const members = {};

            const attendance = {};

            const servants = {};

            let plan = [];

            let settings = {};

            const feedback = [];

            // 1. Members

            try {

                const mSnap = await db.collection('members').get();

                mSnap.forEach(doc => {

                    const data = doc.data() || {};

                    members[doc.id] = Object.assign({ id: doc.id }, data);

                });

            } catch (err) {

                console.error("members fetch error:", err.message);

            }

            // 2. Attendance

            try {

                const aSnap = await db.collection('attendance').where(admin.firestore.FieldPath.documentId(), '>=', (payload && payload.since_date) || '2026-11-01').get();

                aSnap.forEach(doc => {

                    attendance[doc.id] = doc.data() || {};

                });

            } catch (err) {

                console.error("attendance fetch error:", err.message);

            }

            // 3. Servants

            try {

                const sSnap = await db.collection('servants').get();

                sSnap.forEach(doc => {

                    const data = doc.data() || {};

                    servants[doc.id] = Object.assign({ id: doc.id }, data);

                });

            } catch (err) {

                console.error("servants fetch error:", err.message);

            }

            // 4. Master Plan

            try {

                const pDoc = await db.collection('config').doc('master_plan').get();

                if (pDoc && pDoc.exists) {

                    const pData = pDoc.data();

                    plan = (pData && Array.isArray(pData.list)) ? pData.list : [];

                }

            } catch (err) {

                console.error("plan fetch error:", err.message);

            }

            // 5. Settings

            try {

                const setDoc = await db.collection('config').doc('settings').get();

                if (setDoc && setDoc.exists) {

                    settings = setDoc.data() || {};

                }

            } catch (err) {

                console.error("settings fetch error:", err.message);

            }

            // 6. Feedback

            try {

                const fbSnap = await db.collection('feedback').limit(150).get();

                fbSnap.forEach(doc => {

                    feedback.push(Object.assign({ id: doc.id }, doc.data() || {}));

                });

            } catch (err) {}

            return res.status(200).json({

                success: true,

                members: members,

                attendance: attendance,

                servants: servants,

                plan: plan,

                feedback: feedback,

                settings: settings

            });

        }

        // 5b. حفظ وتحديث إعدادات الخدمة ومواعيد الانطلاق

        if (action === 'save_settings') {

            if (!payload || typeof payload !== 'object') {

                return res.status(400).json({ success: false, message: 'بيانات الإعدادات غير صحيحة' });

            }

            await db.collection('config').doc('settings').set({

                ...payload,

                updated_at: admin.firestore.FieldValue.serverTimestamp()

            }, { merge: true });

            return res.status(200).json({

                success: true,

                message: 'تم حفظ وتحديث إعدادات الخدمة في السحابة بنجاح!'

            });

        }

        // 5b. جلب آراء وتقييمات المخدومين فقط للوحة الخدمة

        if (action === 'get_feedback') {

            const list = [];

            try {

                const fbSnap = await db.collection('feedback').limit(400).get();

                fbSnap.forEach(doc => {

                    list.push(Object.assign({ id: doc.id }, doc.data() || {}));

                });

            } catch (e) {}

            return res.status(200).json({ success: true, feedback: list });

        }

        // 6. حفظ واعتماد خطة السنة السحابية من كشف الإكسيل

        if (action === 'save_master_plan') {

            if (!payload || !Array.isArray(payload.events)) {

                return res.status(400).json({ success: false, message: 'بيانات الخطة غير مكتملة' });

            }

            await db.collection('config').doc('master_plan').set({

                list: payload.events,

                updated_at: admin.firestore.FieldValue.serverTimestamp()

            });

            return res.status(200).json({

                success: true,

                message: `تم رفع واعتماد ${payload.events.length} فعالية على سحابة الموقع بنجاح!`

            });

        }

        // 7. تحديث وحفظ بيانات الخدام دفعة واحدة (Batch Write)

        if (action === 'update_servants_batch') {

            if (!payload || !Array.isArray(payload.servants)) {

                return res.status(400).json({ success: false, message: 'قائمة الخدام غير صحيحة' });

            }

            const batch = db.batch();

            let count = 0;

            payload.servants.forEach(s => {

                const code = String(s.code || s.id || '').trim();

                if (code) {

                    const ref = db.collection('servants').doc(code);

                    batch.set(ref, {

                        ...s,

                        updated_at: admin.firestore.FieldValue.serverTimestamp()

                    }, { merge: true });

                    count++;

                }

            });

            await batch.commit();

            return res.status(200).json({

                success: true,

                message: `تم تحديث ${count} خادم في السحابة بنجاح!`

            });

        }

        return res.status(400).json({ success: false, message: 'إجراء غير معروف' });

    } catch (error) {

        console.error("Firebase Admin Error:", error);

        return res.status(500).json({ 

            success: false, 

            message: 'حدث خطأ في تنفيذ طلب الأدمن: ' + (error.message || String(error)),

            details: error.stack

        });

    }

};