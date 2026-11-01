/**
 * public/js/khedmty-offline-sync.js
 * محرك المزامنة التلقائية والعمل دون اتصال بالإنترنت (Khedmty-Plus Offline First & Sync Engine)
 * 
 * الميزات:
 * 1. كشف فوري وحي لحالة الاتصال (Online / Offline).
 * 2. طابور عمليات محلي غير متصل (Offline Action Queue) في IndexedDB و LocalStorage.
 * 3. مزامنة تلقائية ذكية في الخلفية عند استعادة الاتصال دون أي تدخل من المستخدم.
 * 4. واجهة متفائلة (Optimistic UI) تضمن استمرار العمل بسلاسة تامة وبدون أي رسائل خطأ.
 * 5. شريط تنبيه كنسي راقٍ يوضح للمستخدم أن بياناته محفوظة محلياً في أمان تام.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.KhedmtyOfflineSync = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const QUEUE_STORAGE_KEY = 'khedmty_offline_sync_queue';
    let isProcessing = false;
    let syncListeners = [];

    /**
     * قراءة طابور العمليات المعلقة من التخزين المحلي
     */
    function getQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('[OfflineSync] فشل قراءة طابور المزامنة:', e);
            return [];
        }
    }

    /**
     * حفظ طابور العمليات المعلقة
     */
    function saveQueue(queue) {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
            if (window.KhedmtyDB && typeof KhedmtyDB.setItem === 'function') {
                KhedmtyDB.setItem(QUEUE_STORAGE_KEY, queue).catch(() => {});
            }
        } catch (e) {
            console.warn('[OfflineSync] فشل حفظ طابور المزامنة:', e);
        }
        updateStatusBadge();
    }

    /**
     * إضافة عملية جديدة إلى طابور المزامنة
     */
    function enqueue(actionType, payload, meta = {}) {
        const queue = getQueue();
        const actionItem = {
            id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            action: actionType,
            payload: payload,
            meta: meta,
            createdAt: Date.now(),
            retries: 0
        };

        // منع التكرار في حال كانت نفس العملية متطابقة لنفس اليوم والكود
        const existingIdx = queue.findIndex(q => 
            q.action === actionType && 
            JSON.stringify(q.meta) === JSON.stringify(meta) &&
            meta.dedupKey
        );

        if (existingIdx >= 0) {
            queue[existingIdx] = actionItem; // تحديث بأحدث نسخة
        } else {
            queue.push(actionItem);
        }

        saveQueue(queue);
        console.log(`[OfflineSync] تم إدراج عملية [${actionType}] في طابور الحفظ المحلي:`, actionItem);

        // محاولة المزامنة الفورية إذا كان هناك اتصال
        if (navigator.onLine) {
            processQueue().catch(() => {});
        }

        return actionItem;
    }

    /**
     * معالجة طابور العمليات ومزامنتها مع الخادم وسحابة Firestore
     */
    async function processQueue() {
        if (!navigator.onLine || isProcessing) return;
        const queue = getQueue();
        if (queue.length === 0) return;

        isProcessing = true;
        updateStatusBadge();
        console.log(`[OfflineSync] بدء معالجة ${queue.length} عملية معلقة...`);

        const remainingQueue = [];
        let successCount = 0;

        for (const item of queue) {
            let success = false;
            try {
                success = await syncSingleItem(item);
            } catch (err) {
                console.warn(`[OfflineSync] تعذر مزامنة العنصر ${item.id}:`, err);
                success = false;
            }

            if (success) {
                successCount++;
            } else {
                item.retries = (item.retries || 0) + 1;
                if (item.retries < 10) {
                    remainingQueue.push(item);
                } else {
                    console.error(`[OfflineSync] تم استنفاد محاولات المزامنة للعنصر:`, item);
                }
            }
        }

        saveQueue(remainingQueue);
        isProcessing = false;
        updateStatusBadge();

        if (successCount > 0) {
            showToast(`✅ تمت مزامنة ${successCount} عملية بنجاح مع السحابة!`);
            notifyListeners('SYNC_COMPLETED', { successCount, remainingCount: remainingQueue.length });
        }
    }

    /**
     * مزامنة عنصر واحد بناءً على نوع العملية
     */
    async function syncSingleItem(item) {
        const { action, payload } = item;

        // 1. مزامنة قراءة الكتاب المقدس (mark_plan_read)
        if (action === 'MARK_PLAN_READ') {
            const fetchFn = (window.AuthClient && AuthClient.fetch) ? AuthClient.fetch.bind(AuthClient) : fetch;
            const resp = await fetchFn('/api/mark_plan_read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return resp && resp.ok;
        }

        // 2. مزامنة النوتة الروحية (SPIRITUAL_NOTE)
        if (action === 'SPIRITUAL_NOTE') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { studentCode, date, data } = payload;
            if (!studentCode || !date) return true; // غير صالح لا يمكن إكماله
            await fsdb.collection('students').doc(String(studentCode)).collection('daily_logs').doc(String(date)).set(data, { merge: true });
            return true;
        }

        // 3. مزامنة افتقاد الخادم (VISITATION)
        if (action === 'VISITATION') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { memberId, visitations } = payload;
            if (!memberId) return true;
            await fsdb.collection('members').doc(String(memberId)).update({ visitations: visitations });
            return true;
        }

        // 4. مزامنة درجات المخدومين (GRADES)
        if (action === 'GRADES') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { batchGrades } = payload;
            if (Array.isArray(batchGrades)) {
                const batch = fsdb.batch();
                batchGrades.forEach(g => {
                    if (g.id) {
                        const ref = fsdb.collection('members').doc(String(g.id));
                        batch.set(ref, { grades: g.grades }, { merge: true });
                    }
                });
                await batch.commit();
            }
            return true;
        }

        // 5. مزامنة حضور المخدومين المسجل أوفلاين (ATTENDANCE)
        if (action === 'ATTENDANCE') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { date, record } = payload;
            if (!date || !record) return true;
            const pKey = (record.code || record.id || '').toString().replace(/\D/g, '') || String(record.id || record.code || Date.now());
            if (!pKey) return true;

            await fsdb.collection('attendance').doc(String(date)).set({
                [pKey]: record
            }, { merge: true });
            return true;
        }

        // 6. مزامنة إعادة كتابة أو إلغاء الحضور الميداني (ATTENDANCE_OVERWRITE)
        if (action === 'ATTENDANCE_OVERWRITE') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { date, records } = payload;
            if (!date) return true;
            let partitionObj = {};
            (records || []).forEach(item => {
                let p = (item.code || item.id || '').toString().replace(/\D/g, '') || String(item.id || item.code || Date.now());
                if (p) partitionObj[p] = item;
            });
            await fsdb.collection('attendance').doc(String(date)).set(partitionObj);
            return true;
        }

        // 7. مزامنة تحديث المخدومين مع حل التعارضات (MEMBER_UPDATE with Conflict Resolution)
        if (action === 'MEMBER_UPDATE') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { memberId, data, updatedAt } = payload;
            if (!memberId) return true;

            const memberRef = fsdb.collection('members').doc(String(memberId));
            const docSnap = await memberRef.get();
            if (docSnap.exists) {
                const remoteData = docSnap.data();
                const remoteUpdatedAt = remoteData.updatedAt || remoteData.lastModified || 0;
                // حل التعارض: دمج الحقول غير المتعارضة، وأحدث طابع زمني يفوز للحقول المشتركة
                if (remoteUpdatedAt > (updatedAt || 0)) {
                    const mergedData = Object.assign({}, data, remoteData);
                    await memberRef.set(mergedData, { merge: true });
                } else {
                    await memberRef.set(Object.assign({}, data, { updatedAt: updatedAt || Date.now() }), { merge: true });
                }
            } else {
                await memberRef.set(Object.assign({}, data, { updatedAt: updatedAt || Date.now() }), { merge: true });
            }
            return true;
        }

        // 8. مزامنة تسجيل الافتقاد الرعوي (VISITATION_LOG)
        if (action === 'VISITATION_LOG') {
            const fsdb = (window.initKhedmtyFirestore ? window.initKhedmtyFirestore() : (window.firebase && firebase.firestore && firebase.firestore()));
            if (!fsdb) return false;

            const { memberId, logEntry } = payload;
            if (!memberId || !logEntry) return true;

            const memberRef = fsdb.collection('members').doc(String(memberId));
            const docSnap = await memberRef.get();
            let currentLogs = [];
            if (docSnap.exists && Array.isArray(docSnap.data().visitationLogs)) {
                currentLogs = docSnap.data().visitationLogs;
            }
            currentLogs.unshift(logEntry);
            await memberRef.set({ visitationLogs: currentLogs, lastVisitation: logEntry.date }, { merge: true });
            return true;
        }

        return true;
    }

    /**
     * تحديث شارة حالة الاتصال وشريط التنبيه الكنسي
     */
    function updateStatusBadge() {
        if (typeof document === 'undefined') return;

        let badge = document.getElementById('khedmty-offline-bar');
        const isOnline = navigator.onLine;
        const queue = getQueue();
        const pendingCount = queue.length;

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'khedmty-offline-bar';
            badge.style.cssText = `
                position: fixed;
                bottom: 76px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 18px;
                border-radius: 999px;
                font-size: 13px;
                font-family: 'Tajawal', sans-serif;
                font-weight: 700;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                direction: rtl;
                cursor: default;
                backdrop-filter: blur(8px);
                max-width: 90vw;
                white-space: nowrap;
            `;
            document.body.appendChild(badge);
        }

        if (!isOnline) {
            badge.style.display = 'flex';
            badge.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
            badge.style.color = '#fbbf24';
            badge.style.border = '1px solid rgba(251, 191, 36, 0.4)';
            badge.innerHTML = `
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span>
                <span>⚡ وضع العمل دون إنترنت — كل تعديلاتك محفوظة في أمان تام (${pendingCount} معلق)</span>
            `;
        } else if (isProcessing) {
            badge.style.display = 'flex';
            badge.style.background = 'linear-gradient(135deg, #0c2461, #1e3799)';
            badge.style.color = '#ffffff';
            badge.style.border = '1px solid rgba(197, 155, 39, 0.5)';
            badge.innerHTML = `
                <span class="fa-solid fa-spinner fa-spin" style="font-size:14px; color:#c59b27;"></span>
                <span>🔄 جاري مزامنة ${pendingCount} عملية مع السحابة...</span>
            `;
        } else if (pendingCount > 0) {
            badge.style.display = 'flex';
            badge.style.background = 'linear-gradient(135deg, #0f2744, #1b3a5b)';
            badge.style.color = '#e2e8f0';
            badge.style.border = '1px solid rgba(197, 155, 39, 0.4)';
            badge.innerHTML = `
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981;"></span>
                <span>متصل بالإنترنت (${pendingCount} في انتظار المزامنة)</span>
                <button type="button" onclick="window.KhedmtyOfflineSync && KhedmtyOfflineSync.syncNow()" style="background:#c59b27; color:#0f2744; border:none; padding:3px 10px; border-radius:8px; font-weight:800; cursor:pointer; font-size:11px; margin-right:4px;">زامن الآن</button>
            `;
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * إظهار Toast تنبيهي سريع
     */
    function showToast(message) {
        if (typeof document === 'undefined') return;
        const toast = document.createElement('div');
        toast.className = 'khedmty-sync-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #065f46, #047857);
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Tajawal', sans-serif;
            z-index: 100000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
            border: 1px solid rgba(52, 211, 153, 0.4);
            direction: rtl;
            animation: fadeInOut 3.5s forwards;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3500);
    }

    function addListener(fn) {
        syncListeners.push(fn);
    }

    function notifyListeners(event, data) {
        syncListeners.forEach(fn => {
            try { fn(event, data); } catch (e) {}
        });
    }

    // الاستماع لأحداث الاتصال والانقطاع
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            console.log('[OfflineSync] عاد الاتصال بالإنترنت!');
            updateStatusBadge();
            processQueue().catch(() => {});
        });

        window.addEventListener('offline', () => {
            console.log('[OfflineSync] انقطع الاتصال بالإنترنت — تفعيل نمط الأمان المحلي.');
            updateStatusBadge();
        });

        window.addEventListener('DOMContentLoaded', () => {
            updateStatusBadge();
            if (navigator.onLine) {
                setTimeout(processQueue, 1500);
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
                processQueue().catch(() => {});
            }
        });

        // دورة فحص دورية خفيفة كل 45 ثانية
        const syncTimer = setInterval(() => {
            if (navigator.onLine && getQueue().length > 0) {
                processQueue().catch(() => {});
            }
        }, 45000);
        if (syncTimer && typeof syncTimer.unref === 'function') {
            syncTimer.unref();
        }
    }

    return {
        enqueue: enqueue,
        processQueue: processQueue,
        syncNow: processQueue,
        getQueue: getQueue,
        isOnline: () => (typeof navigator !== 'undefined' ? navigator.onLine : true),
        onSync: addListener
    };
}));
