/**
 * public/js/app-updater.js - أداة تحديث وتطهير الكاش واستحضار النسخ الحديثة
 * Khedmety-Plus Ultra Pro Max | App Updater & Cache Buster
 *
 * الوظائف الأساسية:
 * 1. تفريغ كامل لذاكرة التخزين المؤقت للمتصفح (Cache Storage) دون المساس ببيانات المصادقة.
 * 2. إلغاء وتحديث Service Worker القديم واستحضار أحدث ملفات الواجهة والأنماط.
 * 3. تزويد المستخدم بزر مرئي وأنيق للتحديث الفوري في أي وقت.
 * 4. إعادة التحميل القسري (Hard Reload) بختم زمني يمنع مزود الخدمة من تقديم نسخ قديمة.
 */

(function (root) {
    'use strict';

    const KhedmetyAppUpdater = {
        version: '2.0.0',
        isUpdating: false,

        /**
        /**
         * فحص وجود حقول إدخال غير محفوظة في الصفحة لتجنب فقدان عمل المستخدم
         * @returns {boolean}
         */
        hasUnsavedInputs: function () {
            if (typeof document === 'undefined') return false;
            const forms = document.querySelectorAll('form');
            for (const form of forms) {
                const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea');
                for (const input of inputs) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        if (input.checked !== input.defaultChecked) return true;
                    } else if (input.value && input.value.trim() !== '' && input.value !== input.defaultValue) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * تفريغ الذاكرة المؤقتة وإلغاء تسجيل العمال القدامى واستحضار أحدث نسخة
         * @param {Object} options خيارات التحديث
         */
        cleanCachesAndHardRefresh: async function (options = {}) {
            if (this.isUpdating) return;

            // فحص المدخلات غير المحفوظة إن لم يتم التخطي مسبقاً
            if (!options.skipDirtyCheck && this.hasUnsavedInputs()) {
                const warnUnsaved = (typeof window !== 'undefined' && window.confirm) ? window.confirm(
                    "⚠️ تحذير: توجد بيانات ومدخلات غير محفوظة في النموذج الحالي!\n\n" +
                    "تحديث التطبيق سيؤدي إلى إعادة تحميل الصفحة وفقدان ما كتبته ولم تقم بحفظه.\n\n" +
                    "هل تود المتابعة وتحديث التطبيق رغم ذلك؟"
                ) : true;
                if (!warnUnsaved) return;
            }

            this.isUpdating = true;
            const silent = options.silent === true;
            this.showUpdateOverlay('جاري تفريغ الذاكرة المؤقتة وتحديث ملفات التطبيق...');

            try {
                // 1. حذف كاشات التطبيق الخاصة فقط (بادئة khedmety-)
                if (typeof window !== 'undefined' && 'caches' in window) {
                    try {
                        const cacheKeys = await window.caches.keys();
                        const appCacheKeys = cacheKeys.filter(key => typeof key === 'string' && key.startsWith('khedmety-'));
                        await Promise.all(
                            appCacheKeys.map(key => {
                                console.log('[AppUpdater] حذف كاش التطبيق:', key);
                                return window.caches.delete(key);
                            })
                        );
                    } catch (cacheErr) {
                        console.warn('[AppUpdater] تعذر مسح بعض الكاشات:', cacheErr);
                    }
                }

                // 2. تحديث وإعادة تفعيل Service Worker عبر MessageChannel مع مهلة أمان
                if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                    try {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (let reg of registrations) {
                            await new Promise(resolve => {
                                let settled = false;
                                const timer = setTimeout(() => {
                                    if (!settled) { settled = true; resolve(); }
                                }, 800);

                                const onCtrlChange = () => {
                                    navigator.serviceWorker.removeEventListener('controllerchange', onCtrlChange);
                                    if (!settled) { settled = true; clearTimeout(timer); resolve(); }
                                };
                                navigator.serviceWorker.addEventListener('controllerchange', onCtrlChange);

                                if (reg.active) {
                                    try {
                                        const channel = new MessageChannel();
                                        channel.port1.onmessage = () => {
                                            if (!settled) { settled = true; clearTimeout(timer); resolve(); }
                                        };
                                        reg.active.postMessage({ action: 'SKIP_WAITING_AND_CLEAR' }, [channel.port2]);
                                    } catch (e) {
                                        reg.active.postMessage({ action: 'SKIP_WAITING_AND_CLEAR' });
                                    }
                                } else {
                                    if (!settled) { settled = true; clearTimeout(timer); resolve(); }
                                }
                            });

                            await reg.update().catch(() => {});
                            // إذا طلب تفريغ جذري
                            if (options.forceUnregister) {
                                await reg.unregister().catch(() => {});
                            }
                        }
                    } catch (swErr) {
                        console.warn('[AppUpdater] تعذر تحديث Service Worker:', swErr);
                    }
                }

                // 3. تنظيف مؤقتات وسجلات التصفح القديمة في sessionStorage دون المساس بالمصادقة
                try {
                    if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.removeItem('_khedmety_prev_page');
                        sessionStorage.removeItem('_khedmety_curr_page');
                        sessionStorage.removeItem('khedmety_nav_state');
                    }
                } catch (e) {}

                // 4. مهلة بسيطة لعرض نجاح العملية للمستخدم
                this.showUpdateOverlay('تم تطهير الكاش بنجاح! جاري استحضار النسخة الأحدث الآن...');
                await new Promise(r => setTimeout(r, 650));

                // 5. إعادة التوجيه بختم زمني يضمن تخطي كاش الـ HTTP نهائياً
                if (typeof window !== 'undefined' && window.location) {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('_v', Date.now());
                    window.location.replace(currentUrl.href);
                }

            } catch (err) {
                console.error('[AppUpdater] خطأ أثناء التحديث:', err);
                this.hideUpdateOverlay();
                this.isUpdating = false;
                if (!silent && typeof alert === 'function') {
                    alert('تعذر استكمال التحديث التلقائي بالكامل، سيتم إعادة تحميل الصفحة الآن.');
                }
                if (typeof window !== 'undefined' && window.location) {
                    window.location.reload();
                }
            }
        },

        /**
         * نافذة تأكيد التحديث للمستخدم مع حماية المدخلات غير المحفوظة
         */
        confirmAndRefresh: function () {
            if (this.hasUnsavedInputs()) {
                const warnUnsaved = window.confirm(
                    "⚠️ تحذير: توجد بيانات ومدخلات غير محفوظة في النموذج الحالي!\n\n" +
                    "تحديث التطبيق سيؤدي إلى إعادة تحميل الصفحة وفقدان ما كتبته ولم تقم بحفظه.\n\n" +
                    "هل تود المتابعة وتحديث التطبيق رغم ذلك؟"
                );
                if (!warnUnsaved) return;
            }

            const confirmed = window.confirm(
                "🔄 تحديث التطبيق وتفريغ الكاش القديم\n\n" +
                "سيتم تنظيف ملفات المتصفح المؤقتة واستحضار أحدث نسخة محسنة من «خدمتي برو Ultra Pro Max».\n\n" +
                "لن يتم مسح تسجيل دخولك أو بياناتك المحفوظة.\n\n" +
                "هل تود المتابعة الآن؟"
            );
            if (confirmed) {
                this.cleanCachesAndHardRefresh({ forceUnregister: false, skipDirtyCheck: true });
            }
        },

        /**
         * عرض شاشة تغطية تفاعلية أثناء التحديث
         */
        showUpdateOverlay: function (msg) {
            if (typeof document === 'undefined') return;
            let overlay = document.getElementById('khedmetyUpdateOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'khedmetyUpdateOverlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(12, 36, 97, 0.92);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    color: #ffffff;
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Tajawal', system-ui, sans-serif;
                    direction: rtl;
                    text-align: center;
                    padding: 24px;
                    transition: opacity 0.3s ease;
                `;
                overlay.innerHTML = `
                    <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 20px; padding: 32px 28px; max-width: 420px; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,0.35);">
                        <div style="font-size: 42px; margin-bottom: 16px; animation: spin 1.4s linear infinite; display: inline-block;">🔄</div>
                        <h3 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #f39c12;">خدمتي برو — Ultra Pro Max</h3>
                        <p id="khedmetyUpdateMsg" style="margin: 0; font-size: 15px; line-height: 1.7; opacity: 0.95;"></p>
                    </div>
                    <style>
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                `;
                document.body.appendChild(overlay);
            }
            const msgEl = document.getElementById('khedmetyUpdateMsg');
            if (msgEl) msgEl.textContent = msg;
            overlay.style.display = 'flex';
        },

        hideUpdateOverlay: function () {
            const overlay = document.getElementById('khedmetyUpdateOverlay');
            if (overlay) overlay.style.display = 'none';
        },

        /**
         * حقن زر تحديث مرئي في الواجهة
         * @param {string|HTMLElement} container الحاوية المراد وضع الزر فيها
         */
        renderUpdateButton: function (container) {
            if (typeof document === 'undefined') return;
            let parent = typeof container === 'string' ? document.querySelector(container) : container;
            if (!parent) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ultra-btn-updater';
            btn.setAttribute('aria-label', 'تحديث واستحضار النسخة الجديدة');
            btn.setAttribute('title', 'تفريغ الكاش واستحضار آخر التحديثات والتحسينات');
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> <span>تحديث النسخة</span>';
            btn.addEventListener('click', () => this.confirmAndRefresh());

            parent.appendChild(btn);
        }
    };

    if (root) {
        root.KhedmetyAppUpdater = KhedmetyAppUpdater;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = KhedmetyAppUpdater;
    }
})(typeof window !== 'undefined' ? window : global);
