// api/sync.js - واجهة المزامنة السحابية الموحدة لخدمتي بلس
// تضمن مزامنة جميع الحركات الميدانية المعلقة (حضور، اعتذارات، نوتة، افتقادات، درجات)
// وتعمل بصلاحيات Firebase Admin الكاملة لتجاوز أي تعليق في المتصفح أو أذونات Firestore

const { getAdmin, getDb } = require('./_lib/firebase');

module.exports = async (req, res) => {
    // قبول طلبات POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'طريقة الطلب غير مسموحة' });
    }

    try {
        const db = getDb();
        const admin = getAdmin();
        const body = req.body || {};

        // دعم استقبال دفعة عمليات (items array) أو عملية فردية واحدة
        const items = Array.isArray(body.items) ? body.items : (body.action ? [body] : []);

        if (items.length === 0) {
            return res.status(200).json({ success: true, message: 'لا توجد عناصر للمزامنة', processed: 0 });
        }

        let processedCount = 0;

        for (const item of items) {
            const action = item.action;
            const payload = item.payload || {};

            // 1. حسم واعتماد عذر أو استئذان (EXCUSE_RESOLVE)
            if (action === 'EXCUSE_RESOLVE') {
                const { id, newStatus, servantNote, resolverName, targetExcuse } = payload;
                if (id) {
                    await db.collection('excuses').doc(String(id)).set({
                        status: newStatus,
                        servant_notes: servantNote || '',
                        resolved_by: resolverName || 'الخادم',
                        resolved_at: Date.now()
                    }, { merge: true });

                    if (newStatus === 'accepted' && targetExcuse && targetExcuse.friday_date) {
                        const friday = targetExcuse.friday_date;
                        const isDelay = (targetExcuse.timingNote && targetExcuse.timingNote.includes('تأخير')) || (targetExcuse.servant_notes && targetExcuse.servant_notes.includes('تأخير'));
                        const studentCode = String(targetExcuse.student_code || '');
                        const studentPhone = String(targetExcuse.student_phone || '');
                        const pKey = studentCode || studentPhone || String(targetExcuse.student_id || id);
                        const cloudRecord = {
                            id: targetExcuse.student_id || pKey,
                            code: studentCode,
                            name: targetExcuse.student_name,
                            phone: studentPhone,
                            stage: targetExcuse.stage || 'سنة أولى',
                            attended: false,
                            isAbsentDueToDelay: false,
                            isExcused: true,
                            isAbsent: !isDelay,
                            hasApprovedDelay: isDelay,
                            excuseReason: isDelay ? 'استئذان تأخير مسبق ⏰' : (targetExcuse.reason_category || 'عذر غياب مقبول')
                        };
                        await db.collection('attendance').doc(String(friday)).set({ [pKey]: cloudRecord }, { merge: true });
                    }
                }
                processedCount++;
            }

            // 2. تسجيل عذر أو استئذان جديد (EXCUSE_CREATE)
            else if (action === 'EXCUSE_CREATE') {
                const { id, excuseData } = payload;
                if (id && excuseData) {
                    await db.collection('excuses').doc(String(id)).set(excuseData, { merge: true });

                    if (excuseData.status === 'accepted' && excuseData.friday_date) {
                        const friday = excuseData.friday_date;
                        const isDelay = (excuseData.timingNote && excuseData.timingNote.includes('تأخير')) || (excuseData.servant_notes && excuseData.servant_notes.includes('تأخير'));
                        const studentCode = String(excuseData.student_code || '');
                        const studentPhone = String(excuseData.student_phone || '');
                        const pKey = studentCode || studentPhone || String(excuseData.student_id || id);
                        const cloudRecord = {
                            id: excuseData.student_id || pKey,
                            code: studentCode,
                            name: excuseData.student_name,
                            phone: studentPhone,
                            stage: excuseData.stage || 'سنة أولى',
                            attended: false,
                            isAbsentDueToDelay: false,
                            isExcused: true,
                            isAbsent: !isDelay,
                            hasApprovedDelay: isDelay,
                            excuseReason: isDelay ? 'استئذان تأخير مسبق ⏰' : (excuseData.reason_category || 'عذر غياب مقبول')
                        };
                        await db.collection('attendance').doc(String(friday)).set({ [pKey]: cloudRecord }, { merge: true });
                    }
                }
                processedCount++;
            }

            // 3. حذف عذر (EXCUSE_DELETE)
            else if (action === 'EXCUSE_DELETE') {
                const { id } = payload;
                if (id) {
                    await db.collection('excuses').doc(String(id)).delete();
                }
                processedCount++;
            }

            // 4. تغيير تاريخ جمعة العذر (EXCUSE_DATE_CHANGE)
            else if (action === 'EXCUSE_DATE_CHANGE') {
                const { id, newFriday } = payload;
                if (id && newFriday) {
                    await db.collection('excuses').doc(String(id)).set({ friday_date: newFriday }, { merge: true });
                }
                processedCount++;
            }

            // 5. تسجيل حضور مخدوم (ATTENDANCE)
            else if (action === 'ATTENDANCE') {
                const { date, record } = payload;
                if (date && record) {
                    const pKey = (record.code || record.id || '').toString().replace(/\D/g, '') || String(record.id || record.code || Date.now());
                    await db.collection('attendance').doc(String(date)).set({ [pKey]: record }, { merge: true });
                }
                processedCount++;
            }

            // 6. تعديل وقت حضور مخدوم (ATTENDANCE_TIME_EDIT)
            else if (action === 'ATTENDANCE_TIME_EDIT') {
                const { date, pKey, updatedRecord } = payload;
                if (date && pKey && updatedRecord) {
                    await db.collection('attendance').doc(String(date)).set({ [String(pKey)]: updatedRecord }, { merge: true });
                }
                processedCount++;
            }

            // 7. مزامنة كشف الحضور كاملاً (ATTENDANCE_OVERWRITE)
            else if (action === 'ATTENDANCE_OVERWRITE') {
                const { date, records } = payload;
                if (date) {
                    let partitionObj = {};
                    (records || []).forEach(item => {
                        let p = (item.code || item.id || '').toString().replace(/\D/g, '') || String(item.id || item.code || Date.now());
                        if (p) partitionObj[p] = item;
                    });
                    await db.collection('attendance').doc(String(date)).set(partitionObj);
                }
                processedCount++;
            }

            // 8. تحديث بيانات المخدوم (MEMBER_UPDATE)
            else if (action === 'MEMBER_UPDATE') {
                const { memberId, data, updatedAt } = payload;
                if (memberId && data) {
                    await db.collection('members').doc(String(memberId)).set(Object.assign({}, data, { updatedAt: updatedAt || Date.now() }), { merge: true });
                }
                processedCount++;
            }

            // 9. تسجيل افتقاد رعوي (VISITATION_LOG)
            else if (action === 'VISITATION_LOG') {
                const { memberId, logEntry } = payload;
                if (memberId && logEntry) {
                    const memberRef = db.collection('members').doc(String(memberId));
                    const docSnap = await memberRef.get();
                    let currentLogs = [];
                    if (docSnap.exists && Array.isArray(docSnap.data().visitationLogs)) {
                        currentLogs = docSnap.data().visitationLogs;
                    }
                    currentLogs.unshift(logEntry);
                    await memberRef.set({ visitationLogs: currentLogs, lastVisitation: logEntry.date }, { merge: true });
                }
                processedCount++;
            }

            // 10. تسجيل النوتة الروحية (SPIRITUAL_NOTE)
            else if (action === 'SPIRITUAL_NOTE') {
                const { studentCode, date, data } = payload;
                if (studentCode && date && data) {
                    await db.collection('students').doc(String(studentCode)).collection('daily_logs').doc(String(date)).set(data, { merge: true });
                }
                processedCount++;
            }

            // 11. تسجيل درجات المخدومين (GRADES)
            else if (action === 'GRADES') {
                const { batchGrades } = payload;
                if (Array.isArray(batchGrades)) {
                    const batch = db.batch();
                    batchGrades.forEach(g => {
                        if (g.id) {
                            const ref = db.collection('members').doc(String(g.id));
                            batch.set(ref, { grades: g.grades }, { merge: true });
                        }
                    });
                    await batch.commit();
                }
                processedCount++;
            }

            // 12. افتقاد الخادم (VISITATION)
            else if (action === 'VISITATION') {
                const { memberId, visitations } = payload;
                if (memberId && visitations) {
                    await db.collection('members').doc(String(memberId)).update({ visitations: visitations });
                }
                processedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `تمت مزامنة ${processedCount} عملية بنجاح مع السحابة`,
            processed: processedCount
        });

    } catch (err) {
        console.error('[Sync API Error]:', err);
        return res.status(500).json({ success: false, error: err.message || 'حدث خطأ في المزامنة السحابية' });
    }
};
