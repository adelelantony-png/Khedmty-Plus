/**
 * public/js/pwa-helper.js
 * تهيئة ودعم ميزات PWA (تثبيت التطبيق، فحص الاتصال، وتحديث الكاش)
 */
(function () {
    'use strict';

    // تحميل أداة التحديث التلقائي app-updater.js إن لم تكن محملة
    if (typeof window !== 'undefined' && !window.KhedmetyAppUpdater) {
        const s = document.createElement('script');
        s.src = 'js/app-updater.js';
        s.async = true;
        document.head.appendChild(s);
    }

    // 1. تسجيل الـ Service Worker بأمان وفحص التحديثات
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            if (window.location.protocol.startsWith('http')) {
                navigator.serviceWorker.register('./sw.js').then(function (reg) {
                    reg.onupdatefound = function () {
                        const installingWorker = reg.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = function () {
                                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showNewVersionToast();
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

    function showNewVersionToast() {
        if (document.getElementById('pwaNewVersionToast')) return;
        const toast = document.createElement('div');
        toast.id = 'pwaNewVersionToast';
        toast.className = 'ultra-update-toast';
        toast.setAttribute('style', 'position:fixed; top:18px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #0c2461, #1e3799); color:#fff; padding:12px 20px; border-radius:16px; border:1px solid rgba(212,175,55,0.6); box-shadow:0 12px 30px rgba(0,0,0,0.3); z-index:99999; display:flex; align-items:center; gap:12px; font-family:"Tajawal",sans-serif; direction:rtl;');
        toast.innerHTML = `
            <span>✨ يتوفر إصدار أحدث ومحسن من خدمتي برو</span>
            <button type="button" onclick="window.KhedmetyAppUpdater && KhedmetyAppUpdater.cleanCachesAndHardRefresh()" style="background:#f39c12; color:#0c2461; border:none; padding:6px 14px; border-radius:10px; font-weight:800; cursor:pointer; font-family:inherit;">تحديث الآن 🔄</button>
            <button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#fff; border:none; font-size:16px; cursor:pointer; opacity:0.7;">✕</button>
        `;
        document.body.appendChild(toast);
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
