/**
 * public/js/pwa-helper.js
 * تهيئة ودعم ميزات PWA (تثبيت التطبيق، فحص الاتصال، وتحديث الكاش)
 */
(function () {
    'use strict';

    // 1. تسجيل الـ Service Worker بأمان
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            // التسجيل يعمل في بروتوكول http/https ومحلياً
            if (window.location.protocol.startsWith('http')) {
                navigator.serviceWorker.register('./sw.js').then(function (reg) {
                    // فحص توفر تحديث جديد للكاش
                    reg.onupdatefound = function () {
                        const installingWorker = reg.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = function () {
                                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('Khedmety-Plus: تم تحديث ملفات التطبيق بنجاح');
                                }
                            };
                        }
                    };
                }).catch(function (err) {
                    console.warn('PWA ServiceWorker Notice:', err.message);
                });
            }
        });
    }

    // 2. إدارة نافذة تثبيت التطبيق (beforeinstallprompt)
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.classList.add('show');
        }
    });

    window.installPwaApp = async function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            console.log('User accepted PWA installation');
        }
        deferredPrompt = null;
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) {
            banner.classList.remove('show');
        }
    };

    // 3. مراقب الاتصال بالإنترنت والتبيه عند الانقطاع
    function updateOnlineStatus() {
        let pill = document.getElementById('networkStatusPill');
        if (!navigator.onLine) {
            if (!pill) {
                pill = document.createElement('div');
                pill.id = 'networkStatusPill';
                pill.setAttribute('style', 'position:fixed; bottom:16px; left:50%; transform:translateX(-50%); background:#b91c1c; color:#fff; padding:8px 16px; border-radius:999px; font-size:13px; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.25); display:flex; align-items:center; gap:6px;');
                pill.innerHTML = '<span>⚠️ وضع عدم الاتصال (أوفلاين) - البيانات تُحفظ محلياً</span>';
                document.body.appendChild(pill);
            }
            pill.style.display = 'flex';
        } else if (pill) {
            pill.style.background = '#059669';
            pill.innerHTML = '<span>✔️ عاد الاتصال بالإنترنت</span>';
            setTimeout(function () {
                if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
            }, 3000);
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
})();
