/**
 * public/js/pwa-helper.js
 * المساعد الذكي لتطبيق الويب التقدمي PWA وتجربة الأوفلاين الشاملة
 */
(function () {
    'use strict';

    // تحميل التحديثات التلقائية ومحرك الأوفلاين والمزامنة
    function loadScriptIfNotPresent(src, globalVar) {
        if (typeof window !== 'undefined' && !window[globalVar]) {
            const s = document.createElement('script');
            s.src = src;
            s.async = false;
            document.head.appendChild(s);
        }
    }

    loadScriptIfNotPresent('js/firebase-config.js', 'FIREBASE_CONFIG');
    loadScriptIfNotPresent('js/khedmty-offline-roster.js', 'KHEDMETY_ROSTER_LOADED');
    loadScriptIfNotPresent('js/khedmty-db.js', 'KhedmtyDB');
    loadScriptIfNotPresent('js/khedmty-offline-sync.js', 'KhedmtyOfflineSync');
    loadScriptIfNotPresent('js/app-updater.js', 'KhedmetyAppUpdater');

    // 1. تسجيل Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            if (window.location.protocol.startsWith('http')) {
                navigator.serviceWorker.register('./sw.js').then(function (reg) {
                    console.log('[PWA] Service Worker مسجل بنجاح للعمل أوفلاين');
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
                    console.warn('[PWA] تنبيه تسجيل ServiceWorker:', err.message);
                });
            }
        });
    }

    function showNewVersionToast() {
        if (document.getElementById('pwaNewVersionToast')) return;
        const toast = document.createElement('div');
        toast.id = 'pwaNewVersionToast';
        toast.className = 'ultra-update-toast';
        toast.setAttribute('style', 'position:fixed; top:18px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #0f2744, #1e3799); color:#fff; padding:12px 20px; border-radius:16px; border:1px solid rgba(197,155,39,0.8); box-shadow:0 12px 30px rgba(0,0,0,0.3); z-index:99999; display:flex; align-items:center; gap:12px; font-family:"Tajawal",sans-serif; direction:rtl;');
        toast.innerHTML = `
            <span>✨ تم تجهيز تحديث جديد للمنظومة الكنسية!</span>
            <button type="button" onclick="window.KhedmetyAppUpdater && KhedmetyAppUpdater.cleanCachesAndHardRefresh()" style="background:#c59b27; color:#0f2744; border:none; padding:6px 14px; border-radius:10px; font-weight:800; cursor:pointer; font-family:inherit;">تحديث الآن 🚀</button>
            <button type="button" onclick="this.parentElement.remove()" style="background:transparent; color:#fff; border:none; font-size:16px; cursor:pointer; opacity:0.7;">✕</button>
        `;
        document.body.appendChild(toast);
    }

    // 2. إدارة تثبيت التطبيق على الموبايل (beforeinstallprompt)
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        const buttons = document.querySelectorAll('.btn-install-pwa, #btnInstallPwa, #pwaInstallBanner');
        buttons.forEach(btn => {
            btn.style.display = 'inline-flex';
            btn.classList.add('show');
        });
    });

    window.installPwaApp = window.installKhedmetyApp = async function () {
        if (!deferredPrompt) {
            alert('التطبيق مثبت بالفعل أو يمكنك إضافته للشاشة الرئيسية من قائمة متصفحك (Add to Home screen 📲)');
            return;
        }
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            console.log('[PWA] قبل المستخدم تثبيت التطبيق');
        }
        deferredPrompt = null;
        const buttons = document.querySelectorAll('.btn-install-pwa, #btnInstallPwa, #pwaInstallBanner');
        buttons.forEach(btn => {
            btn.style.display = 'none';
            btn.classList.remove('show');
        });
    };
})();
