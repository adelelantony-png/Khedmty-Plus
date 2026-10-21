/**
 * public/sw.js - Service Worker لمشروع Khedmety-Plus
 * 
 * ضوابط أمان صارمة:
 * 1. ممنوع تخزين استجابات API أو بيانات الأعضاء أو التوكنات السحابية في الكاش نهائياً.
 * 2. ممنوع تخزين طلبات غير GET (كتابة، تعديل، حذف).
 * 3. الكاش مخصص فقط للأصول الثابتة (App Shell): ملفات الستايل والسكربتات العامة والأيقونات وصفحة عدم الاتصال.
 * 4. عند انقطاع الإنترنت أثناء فتح صفحة جديدة، يتم عرض صفحة offline.html النظيفة.
 */

const CACHE_NAME = 'khedmety-ultra-v2.0';

// الأصول الثابتة المسموح بتخزينها محلياً فقط
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './auth-client.js',
    './css/app-theme.css',
    './bible_plan.js',
    './js/app-updater.js',
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

// معالجة الطلبات باشتراطات أمان صارمة
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

    // 3. استبعاد طلبات خوادم Google و Firebase الخارجية من الكاش
    if (url.origin.includes('googleapis.com') || url.origin.includes('firebaseio.com') || url.origin.includes('identitytoolkit')) {
        return;
    }

    // 4. معالجة طلبات التنقل بين صفحات HTML (Navigation Requests)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                // في حالة انقطاع النت وعدم وجود الصفحة في الكاش
                return cache.match('./offline.html');
            })
        );
        return;
    }

    // 5. استراتيجية Stale-While-Revalidate للأصول الثابتة فقط (CSS, JS, Fonts, Images)
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                // التأكد من نجاح الاستجابة وأنها من نفس المصدر
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // عند الفشل يتم الاكتفاء بما هو موجود في الكاش إن وجد
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
