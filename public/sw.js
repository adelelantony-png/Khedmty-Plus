/**
 * public/sw.js - Service Worker الفائق لمنظومة إعداد خدام (Ultra Offline Engine v8.0)
 * اجتماع القديس بولس الرسول لإعداد الخدام
 * 
 * الميزات المتقدمة:
 * 1. العمل الكامل دون إنترنت (Offline-First) لجميع شاشات الخدام والمخدومين.
 * 2. استراتيجية (Fast-Network with Instant Cache Fallback): استجابة فورية دون تعليق.
 * 3. تخزين مسبق كامل (Precaching) لجميع الشاشات ونصوص الكتاب المقدس (bible-data.js).
 * 4. دعم وحفظ الأصول الخارجية والمكتبات السحابية (Google Fonts, FontAwesome, Bootstrap, Firebase).
 * 5. طابور مزامنة خلفي ذكي يدعم الانتقال السلس بين الأونلاين والأوفلاين.
 */

const CACHE_NAME = 'khedmety-ultra-v8.7'; // Official Idad Khoddam Rebranding & Cache Invalidation (v8.6)

// قائمة الأصول الأساسية للتثبيت المسبق (App Shell & Static Assets)
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './servant-dashboard.html',
    './student.html',
    './servant_grades_entry.html',
    './servant_followup.html',
    './servant_spiritual_report.html',
    './servant_quick_guide.html',
    './student_quick_guide.html',
    './servant_help.html',
    './student_help.html',
    './js/interactive-simulation-guide.js',
    './spiritual_note.html',
    './bible.html',
    './harvest.html',
    './barcode.html',
    './results.html',
    './quiz.html',
    './admin_subjects.html',
    './sheet.html',
    './sheets_list.html',
    './synaxarium.html',
    './katamaros.html',
    './student_attendance.html',
    './offline.html',
    './manifest.json',
    './auth-client.js',
    './css/app-theme.css',
    './bible_plan.js',
    './bible_plan.json',
    './bible-data.js',
    './js/firebase-config.js',
    './js/khedmty-offline-roster.js',
    './js/pwa-helper.js',
    './js/app-updater.js',
    './js/khedmty-db.js',
    './js/khedmty-offline-sync.js',
    './js/html5-qrcode.min.js',
    './js/xlsx.full.min.js',
    './js/html2pdf.bundle.min.js',
    './js/dashboard/dashboard-radar.js',
    './js/dashboard/dashboard-plan.js',
    './js/dashboard/dashboard-curriculum.js',
    './js/dashboard/dashboard-navigation.js',
    './js/dashboard/dashboard-area-suggestions.js',
    './js/dashboard/dashboard-feedback.js',
    './js/dashboard/dashboard-incentives.js',
    './js/dashboard/dashboard-servants.js',
    './js/dashboard/dashboard-attendance.js',
    './js/dashboard/dashboard-members.js',
    './favicon.ico',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './icons/icon-maskable-512.png',
    './icons/idad-khoddam-icon-1024.png',
    './icons/favicon-16.png',
    './icons/favicon-32.png',
    './icons/favicon-48.png',
    './icons/apple-touch-icon.png'
];

// شبكات CDN المسموح بتخزينها أوفلاين
const ALLOWED_CDN_HOSTS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'www.gstatic.com',
    'unpkg.com'
];

// تثبيت Service Worker وتحميل الأصول مسبقاً
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW v3.0] جاري تثبيت الأصول الأساسية وتفعيل وضع عدم الاتصال...');
            await Promise.allSettled(
                PRECACHE_ASSETS.map(asset =>
                    cache.add(asset).catch(err => {
                        console.warn('[SW v3.0] تنبيه أثناء تحميل الأصل المسبق:', asset, err.message);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// تنشيط وحذف الكاشات القديمة
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (typeof cache === 'string' && cache.startsWith('khedmety-') && cache !== CACHE_NAME) {
                        console.log('[SW v3.0] تنظيف كاش قديم:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * دالة جلب من الشبكة مع حد أقصى للانتظار (Fast-Network Timeout)
 */
function fetchWithTimeout(request, timeoutMs = 1800) {
    return new Promise((resolve, reject) => {
        let isDone = false;
        const timer = setTimeout(() => {
            if (!isDone) {
                isDone = true;
                reject(new Error('NETWORK_TIMEOUT_REACHED'));
            }
        }, timeoutMs);

        fetch(request).then(res => {
            if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                resolve(res);
            }
        }).catch(err => {
            if (!isDone) {
                isDone = true;
                clearTimeout(timer);
                reject(err);
            }
        });
    });
}

// معالجة كافة طلبات الجلب (Fetch Interceptor)
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // 1. تجاوز أي طلب غير GET
    if (request.method !== 'GET') {
        return;
    }

    // 2. تجاوز طلبات الـ API الحية (يتم التعامل معها عبر كود التطبيق وطابور المزامنة)
    if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
        return;
    }

    // 3. تجاوز محركات المزامنة السحابية المباشرة
    if (url.origin.includes('firestore.googleapis.com') || url.origin.includes('firebaseio.com') || url.origin.includes('identitytoolkit.googleapis.com')) {
        return;
    }

    // 4. استراتيجية التنقل (Navigation Requests - HTML Pages):
    // عند انقطاع النت يتم التقديم فورياً من الكاش، وعند الاتصال يتم التحقق السريع من السيرفر
    if (request.mode === 'navigate') {
        const getCachedNavigation = async () => {
            const cache = await caches.open(CACHE_NAME);

            // أ) محاولة المطابقة المباشرة متجاهلاً معلمات البحث
            let cached = await cache.match(request, { ignoreSearch: true });
            if (cached) return cached;

            // ب) محاولة المطابقة بمسار الـ URL فقط
            const pathOnly = url.origin + url.pathname;
            cached = await cache.match(pathOnly, { ignoreSearch: true });
            if (cached) return cached;

            // ج) محاولة المطابقة بالمسار النسبي
            const localPath = '.' + url.pathname;
            cached = await cache.match(localPath, { ignoreSearch: true });
            if (cached) return cached;

            // د) الصفحة الرئيسية
            if (url.pathname === '/' || url.pathname.endsWith('/index.html')) {
                cached = await cache.match('./index.html', { ignoreSearch: true });
                if (cached) return cached;
            }

            // هـ) صفحة الأوفلاين العامة
            const fallback = await cache.match('./offline.html', { ignoreSearch: true });
            return fallback || new Response('<h1>أنت غير متصل بالإنترنت حالياً</h1><p>يرجى فتح الشاشة المحفوظة مسبقاً.</p>', {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        };

        // إذا كان المتصفح أوفلاين صراحة -> تقديم فوري من الكاش بدون أي انتظار
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            event.respondWith(getCachedNavigation());
            return;
        }

        event.respondWith(
            fetchWithTimeout(request, 1200).then(response => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            }).catch(getCachedNavigation)
        );
        return;
    }

    // 5. استراتيجية شبكات الـ CDN الخارجية (Google Fonts, FontAwesome, Bootstrap, Firebase)
    const isCdn = ALLOWED_CDN_HOSTS.some(host => url.hostname.includes(host));
    if (isCdn) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse; // Cache-First للأصول الخارجية المعتمدة
                }
                return fetch(request).then(networkResponse => {
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    }
                    return networkResponse;
                }).catch(() => {
                    // فشل الصامت للخطوط إذا لم تكن متوفرة
                });
            })
        );
        return;
    }

    // 6. استراتيجية الأصول الثابتة الداخلية (Stale-While-Revalidate للأكواد والصور والأنماط)
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
                // هدوء أوفلاين
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// استقبال رسائل تحديث الكاش الفوري
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
