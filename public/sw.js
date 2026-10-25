/**
 * public/sw.js - Service Worker لمشروع Khedmety-Plus
 * 
 * ضوابط الأمان والأوفلاين:
 * 1. دعم كامل لتشغيل الموقع في وضع عدم الاتصال (Offline-First) لجميع شاشات الخدام والمخدومين على الهاتف.
 * 2. ممنوع تخزين استجابات API أو بيانات الأعضاء أو التوكنات السحابية في الكاش نهائياً.
 * 3. ممنوع تخزين طلبات غير GET (كتابة، تعديل، حذف).
 * 4. الكاش مخصص فقط للأصول الثابتة وواجهات التطبيق (App Shell) لتمكين الفتح في أي وقت بدون إنترنت.
 */

const CACHE_NAME = 'khedmety-ultra-v2.2'; // upgraded from khedmety-ultra-v2.0

// الأصول الثابتة المسموح بتخزينها محلياً فقط لتمكين الفتح أوفلاين على الموبايل
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './servant-dashboard.html',
    './student.html',
    './servant_followup.html',
    './servant_spiritual_report.html',
    './spiritual_note.html',
    './bible.html',
    './barcode.html',
    './results.html',
    './offline.html',
    './manifest.json',
    './auth-client.js',
    './css/app-theme.css',
    './bible_plan.js',
    './bible_plan.json',
    './js/firebase-config.js',
    './js/pwa-helper.js',
    './js/app-updater.js',
    './js/khedmty-db.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/favicon-48.png'
];

// تثبيت الـ Service Worker وتخزين الـ App Shell بمرونة واحتواء الأخطاء الفردية
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            // تخزين الأصول الأساسية بشكل مستقل لضمان عدم فشل التثبيت عند تعذر تحميل ملف فردي
            await Promise.allSettled(
                PRECACHE_ASSETS.map(asset =>
                    cache.add(asset).catch(err => {
                        console.warn('[SW] تعذر تخزين الأصل مسبقاً:', asset, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// تفعيل وتطهير النسخ القديمة الخاصة بالتطبيق فقط دون لمس كاشات النطاقات أو التطبيقات الأخرى
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (typeof cache === 'string' && cache.startsWith('khedmety-') && cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// معالجة الطلبات باشتراطات أمان صارمة ودعم كامل للأوفلاين
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // 1. استبعاد أي طلب غير GET (تعديلات، إرسال نماذج)
    if (request.method !== 'GET') {
        return;
    }

    // 2. أمني: استبعاد كامل ومطلق لجميع واجهات API ومسارات المصادقة
    if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
        return; // ترك الطلب يذهب مباشرة للشبكة دون لمس الكاش
    }

    // 3. استبعاد طلبات قواعد البيانات الحية والسحابة المباشرة من الكاش
    if (url.origin.includes('firestore.googleapis.com') || url.origin.includes('firebaseio.com') || url.origin.includes('identitytoolkit.googleapis.com')) {
        return;
    }

    // 4. معالجة طلبات التنقل بين صفحات HTML (Navigation Requests) لتمكين الفتح أوفلاين في أي وقت
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(response => {
                // إذا كان الاتصال متاحاً، نحفظ نسخة حديثة في الكاش ونعيد الصفحة
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            }).catch(async () => {
                // وضع عدم الاتصال (Offline): استرجاع الصفحة المخزنة فوراً
                const cache = await caches.open(CACHE_NAME);

                // أ) محاولة المطابقة المباشرة لنفس الطلب
                let cached = await cache.match(request);
                if (cached) return cached;

                // ب) محاولة المطابقة بدون معلمات الرابط (مثل ?tab=membersTab أو ?group=people)
                const pathOnly = url.origin + url.pathname;
                cached = await cache.match(pathOnly);
                if (cached) return cached;

                // ج) المطابقة بالمسار النسبي
                const localPath = '.' + url.pathname;
                cached = await cache.match(localPath);
                if (cached) return cached;

                // د) مطابقة الصفحة الرئيسية
                if (url.pathname === '/' || url.pathname.endsWith('/index.html')) {
                    cached = await cache.match('./index.html');
                    if (cached) return cached;
                }

                // هـ) في حالة عدم وجود الصفحة إطلاقاً، عرض صفحة عدم الاتصال
                return cache.match('./offline.html');
            })
        );
        return;
    }

    // 5. استراتيجية Stale-While-Revalidate للأصول الثابتة (CSS, JS, Fonts, Images)
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // وضع عدم الاتصال: الاكتفاء بما هو في الكاش
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// استقبال رسائل التحديث القسري وتطهير الكاش مع الرد عبر منفذ الرسائل
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'SKIP_WAITING_AND_CLEAR') {
        self.skipWaiting();
        if (event.ports && event.ports[0]) {
            try {
                event.ports[0].postMessage({ status: 'DONE' });
            } catch (e) {}
        }
    }
});
