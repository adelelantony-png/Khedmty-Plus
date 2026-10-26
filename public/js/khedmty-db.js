/**
 * public/js/khedmty-db.js - محرك التخزين المحلي عالي السعة (IndexedDB High-Capacity Offline Engine)
 * لمشروع Khedmety-Plus
 * 
 * الميزات:
 * 1. سعة تخزين فائقة وغير محدودة (تتجاوز حاجز الـ 5MB في LocalStorage لمئات الآلاف من السجلات).
 * 2. دعم كامل للعمل 100% أوفلاين على الموبايل بدون إنترنت.
 * 3. توافق تلقائي شفاف مع LocalStorage مع الحماية من أخطاء QuotaExceededError.
 * 4. مزامنة ذكية وتلقائية للبيانات السابقة.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.KhedmtyDB = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DB_NAME = 'khedmety_offline_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'khedmety_store';

    let dbInstance = null;
    let initPromise = null;

    function isSupported() {
        return typeof indexedDB !== 'undefined';
    }

    /**
     * فتح أو تهيئة قاعدة بيانات IndexedDB
     */
    function init() {
        if (!isSupported()) {
            return Promise.resolve(null);
        }

        if (dbInstance) {
            return Promise.resolve(dbInstance);
        }

        if (initPromise) {
            return initPromise;
        }

        initPromise = new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = function (event) {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    }
                };

                request.onsuccess = function (event) {
                    dbInstance = event.target.result;
                    // ترحيل البيانات الهامة تلقائياً من LocalStorage إلى IndexedDB عند أول تشغيل
                    autoMigrateFromLocalStorage().catch(() => {});
                    resolve(dbInstance);
                };

                request.onerror = function (event) {
                    console.warn('[KhedmtyDB] تعذر فتح IndexedDB، سيتم استخدام LocalStorage كبديل احتياطي:', event.target.error);
                    resolve(null);
                };
            } catch (err) {
                console.warn('[KhedmtyDB] استثناء أثناء فتح قاعدة البيانات:', err);
                resolve(null);
            }
        });

        return initPromise;
    }

    /**
     * حفظ قيمة مفتاح مع دعم الكائنات والمصفوفات والسلاسل النصية
     */
    async function setItem(key, value) {
        // 1. الحفظ في LocalStorage أولاً كنسخة متزامنة سريعة (إذا كان الحجم يسمح)
        try {
            const serialized = (typeof value === 'string') ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (e) {
            // في حال امتلاء LocalStorage (QuotaExceededError)، نتجاهل خطأ LocalStorage
            // ونعتمد تماماً على IndexedDB الآمن ذو السعة غير المحدودة
            console.warn(`[KhedmtyDB] LocalStorage ممتلئ للمفتاح [${key}]، سيتم الحفظ مباشرة في IndexedDB.`);
        }

        // 2. الحفظ الدائم عالي السعة في IndexedDB
        const db = await init();
        if (!db) return value;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction([STORE_NAME], 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.put({ key: key, value: value, updatedAt: Date.now() });

                tx.oncomplete = function () {
                    resolve(value);
                };
                tx.onerror = function () {
                    resolve(value);
                };
            } catch (err) {
                resolve(value);
            }
        });
    }

    /**
     * قراءة قيمة مفتاح مع استرجاع تلقائي من LocalStorage إن لم تكن موجودة في IndexedDB
     */
    async function getItem(key, defaultValue = null) {
        const db = await init();

        if (db) {
            const idbValue = await new Promise((resolve) => {
                try {
                    const tx = db.transaction([STORE_NAME], 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.get(key);

                    req.onsuccess = function () {
                        if (req.result && req.result.value !== undefined) {
                            resolve(req.result.value);
                        } else {
                            resolve(undefined);
                        }
                    };
                    req.onerror = function () {
                        resolve(undefined);
                    };
                } catch (e) {
                    resolve(undefined);
                }
            });

            if (idbValue !== undefined && idbValue !== null) {
                return idbValue;
            }
        }

        // قراءة احتياطية من LocalStorage
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
                try {
                    return JSON.parse(raw);
                } catch (e) {
                    return raw;
                }
            }
        } catch (e) {}

        return defaultValue;
    }

    /**
     * حذف مفتاح من التخزينين
     */
    async function removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {}

        const db = await init();
        if (!db) return true;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction([STORE_NAME], 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.delete(key);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }

    /**
     * مسح شامل للمخزن
     */
    async function clear() {
        const db = await init();
        if (!db) return true;

        return new Promise((resolve) => {
            try {
                const tx = db.transaction([STORE_NAME], 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.clear();
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }

    /**
     * الترحيل والمزامنة التلقائية لكافة مفاتيح khedmety من LocalStorage إلى IndexedDB
     */
    async function autoMigrateFromLocalStorage() {
        if (typeof localStorage === 'undefined') return;

        try {
            const keysToSync = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('khedmety_') || k.startsWith('my_church_') || k === 'auth_token')) {
                    keysToSync.push(k);
                }
            }

            for (const key of keysToSync) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw !== null) {
                        let parsedVal;
                        try {
                            parsedVal = JSON.parse(raw);
                        } catch (e) {
                            parsedVal = raw;
                        }
                        await setItem(key, parsedVal);
                    }
                } catch (err) {}
            }
        } catch (e) {}
    }

    /**
     * قياس السعة المتاحة والمستهلكة في التخزين المحلي للمتصفح
     */
    async function getStorageEstimate() {
        if (navigator.storage && typeof navigator.storage.estimate === 'function') {
            try {
                const est = await navigator.storage.estimate();
                const usageMB = (est.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (est.quota / (1024 * 1024)).toFixed(0);
                const pct = est.quota > 0 ? ((est.usage / est.quota) * 100).toFixed(1) : '0';
                return {
                    usageMB: Number(usageMB),
                    quotaMB: Number(quotaMB),
                    percentage: Number(pct),
                    available: true
                };
            } catch (e) {}
        }

        return {
            usageMB: 0,
            quotaMB: 500, // سعة تقديرية آمنة
            percentage: 0,
            available: false
        };
    }


    /**
     * غلاف تخزين آمن مقاوم لأخطاء الامتلاء (QuotaExceededError)
     * يوفر وصولاً سريعاً متزامناً مع حفظ دائم في IndexedDB
     */
    const SafeStorage = {
        setItem: function (key, value) {
            try {
                const s = (typeof value === 'string') ? value : JSON.stringify(value);
                localStorage.setItem(key, s);
            } catch (err) {
                console.warn(`[SafeStorage] LocalStorage quota reached for [${key}], saving directly to IndexedDB.`);
            }
            setItem(key, value).catch(() => {});
        },
        getItem: function (key, defaultValue = null) {
            try {
                const raw = localStorage.getItem(key);
                if (raw !== null) {
                    try { return JSON.parse(raw); } catch (e) { return raw; }
                }
            } catch (e) {}
            return defaultValue;
        },
        removeItem: function (key) {
            try { localStorage.removeItem(key); } catch (e) {}
            removeItem(key).catch(() => {});
        }
    };

    if (typeof root !== 'undefined') { root.SafeStorage = SafeStorage; }

    // تهيئة فورية تلقائية بمجرد تضمين السكربت
    if (typeof window !== 'undefined') {
        init().catch(() => {});
    }

    return {
        isSupported: isSupported,
        init: init,
        setItem: setItem,
        getItem: getItem,
        removeItem: removeItem,
        clear: clear,
        autoMigrate: autoMigrateFromLocalStorage,
        getStorageEstimate: getStorageEstimate,
        SafeStorage: SafeStorage
    };
}));
