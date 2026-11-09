/**
 * public/js/app-updater.js - أداة تحديث وتطهير الكاش واستحضار النسخ الحديثة
 * منصة إعداد خدام — اجتماع القديس بولس الرسول | App Updater & Cache Buster
 *
 * الوظائف الأساسية:
 * 1. تفريغ كامل لذاكرة التخزين المؤقت للمتصفح (Cache Storage) دون المساس ببيانات المصادقة.
 * 2. إلغاء وتحديث Service Worker واستحضار أحدث ملفات الواجهة والأنماط الملكية.
 * 3. تزويد المستخدم بنافذة حوار ملكية فاخرة للتأكيد قبل التحديث.
 * 4. إعادة التحميل القسري (Hard Reload) بختم زمني يمنع مزود الخدمة من تقديم نسخ قديمة.
 */

(function (root) {
    'use strict';

    const KhedmetyAppUpdater = {
        version: '8.2.0',
        isUpdating: false,

        /**
         * فحص وجود حقول إدخال غير محفوظة في الصفحة لتجنب فقدان عمل المستخدم
         * يفحص جميع الحقول القابلة للتحرير في الصفحة مباشرة حتى لو لم تكن داخل وسم <form>
         * @returns {boolean}
         */
        hasUnsavedInputs: function () {
            if (typeof document === 'undefined') return false;

            try {
                const candidates = document.querySelectorAll('input, textarea, select');
                const ignoredTypes = ['submit', 'button', 'reset', 'image', 'file', 'hidden'];

                for (const el of candidates) {
                    if (el.disabled || el.readOnly) continue;
                    if (el.hidden || (el.type && ignoredTypes.includes(el.type))) continue;

                    if (el.style && (el.style.display === 'none' || el.style.visibility === 'hidden')) continue;
                    if (el.closest) {
                        const hiddenContainer = el.closest('[hidden], [style*="display: none"], [style*="display:none"], [style*="visibility: hidden"]');
                        if (hiddenContainer) continue;
                    }

                    const tagName = (el.tagName || '').toLowerCase();

                    if (tagName === 'select') {
                        if (!el.options || el.options.length === 0) continue;
                        let defaultIdx = -1;
                        for (let i = 0; i < el.options.length; i++) {
                            if (el.options[i].defaultSelected) {
                                defaultIdx = i;
                                break;
                            }
                        }
                        if (defaultIdx === -1) defaultIdx = 0;
                        if (el.selectedIndex !== -1 && el.selectedIndex !== defaultIdx) {
                            return true;
                        }
                        continue;
                    }

                    const elType = (el.type || 'text').toLowerCase();
                    const elId = (el.id || '').toLowerCase();
                    const elName = (el.name || '').toLowerCase();
                    const elPlaceholder = (el.placeholder || '');
                    if (elType === 'search' || elId.includes('search') || elName.includes('search') || elPlaceholder.includes('بحث')) {
                        continue;
                    }

                    if (elType === 'checkbox' || elType === 'radio') {
                        if (el.checked !== el.defaultChecked) {
                            return true;
                        }
                        continue;
                    }

                    const val = typeof el.value === 'string' ? el.value : '';
                    const defVal = typeof el.defaultValue === 'string' ? el.defaultValue : '';
                    if (val.trim() !== '' && val !== defVal) {
                        return true;
                    }
                }
            } catch (err) {
                console.warn('[AppUpdater] خطأ أثناء فحص المدخلات غير المحفوظة:', err);
            }

            return false;
        },

        /**
         * تفريغ الذاكرة المؤقتة وإلغاء تسجيل العمال القدامى واستحضار أحدث نسخة
         * @param {Object} options خيارات التحديث
         */
        cleanCachesAndHardRefresh: async function (options = {}) {
            if (this.isUpdating) return;

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
            this.showUpdateOverlay('جاري تطهير الكاش واستحضار التحديثات الملكية الجديدة...');

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
                this.showUpdateOverlay('تم تطهير الكاش بنجاح! جاري استحضار الواجهة المعتمدة الآن...');
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
         * نافذة تأكيد التحديث الملكية الفاخرة (Royal Confirm Modal)
         */
        confirmAndRefresh: function () {
            const hasDirty = this.hasUnsavedInputs();

            // إذا كنا في بيئة غير المتصفح أو بدون DOM كامل
            if (typeof document === 'undefined' || !document.body) {
                if (typeof window !== 'undefined' && window.confirm) {
                    const ok = window.confirm("هل تريد تحديث التطبيق وسحب أحدث نسخة الآن؟");
                    if (ok) this.cleanCachesAndHardRefresh({ forceUnregister: false, skipDirtyCheck: true });
                }
                return;
            }

            // إزالة أي نافذة سابقة
            const prevModal = document.getElementById('khedmetyRoyalUpdateModal');
            if (prevModal) prevModal.remove();

            const modal = document.createElement('div');
            modal.id = 'khedmetyRoyalUpdateModal';
            modal.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(7, 26, 56, 0.78);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999999;
                padding: 16px;
                font-family: 'Cairo', 'Tajawal', system-ui, sans-serif;
                direction: rtl;
                animation: fadeInRoyalModal 0.25s ease-out;
            `;

            modal.innerHTML = `
                <div style="background: #FFFFFF; border-radius: 20px; border: 1.5px solid rgba(212, 175, 55, 0.45); max-width: 440px; width: 100%; padding: 26px 24px; box-shadow: 0 20px 50px rgba(7, 26, 56, 0.35); text-align: center; position: relative; overflow: hidden;">
                    <!-- زخرفة ذهبية علوية -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #F5CE66 100%);"></div>

                    <!-- أيقونة الشعار الملكي -->
                    <div style="width: 64px; height: 64px; margin: 6px auto 14px; border-radius: 18px; padding: 2.5px; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #F5CE66 100%); box-shadow: 0 6px 18px rgba(212,175,55,0.3); display: flex; align-items: center; justify-content: center;">
                        <img src="icons/icon-192.png" alt="إعداد خدام" style="width: 100%; height: 100%; object-fit: contain; border-radius: 15px; background: #071A38;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✝️</text></svg>'">
                    </div>

                    <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.35); padding: 3px 12px; border-radius: 999px; margin-bottom: 8px;">
                        <span style="color: #A16207; font-size: 0.76rem; font-weight: 800;">✨ منصة إعداد خدام • تحديث رسمي</span>
                    </div>

                    <h3 style="margin: 0 0 6px; font-size: 1.25rem; font-weight: 900; color: #0C2461;">
                        تحديث المنظومة وتطهير الكاش
                    </h3>

                    <p style="margin: 0 0 16px; font-size: 0.86rem; color: #475569; line-height: 1.6;">
                        سيتم استحضار أحدث نسخة سحابية وتطهير ملفات الكاش القديمة في المتصفح لضمان تناسق وسرعة المنظومة.
                    </p>

                    ${hasDirty ? `
                        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 12px; text-align: right; margin-bottom: 14px; font-size: 0.8rem; color: #92400e; display: flex; align-items: flex-start; gap: 8px;">
                            <span style="font-size: 1rem;">⚠️</span>
                            <span>تنبيه: توجد مدخلات غير محفوظة في النموذج الحالي، سيتم فقدها عند التحديث.</span>
                        </div>
                    ` : ''}

                    <div style="background: #FAF7F2; border: 1px solid #E8DAC6; border-radius: 12px; padding: 12px 14px; text-align: right; font-size: 0.8rem; line-height: 1.8; color: #2A2118; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #059669; font-weight: 900;">✓</span>
                            <span>الحفاظ الكامل على تسجيل دخولك وجلستك دون تسجيل خروج.</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #059669; font-weight: 900;">✓</span>
                            <span>استحضار كافة تحسينات التصميم المتناسقة والاستئذانات الجديدة.</span>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="button" id="khedmetyDoUpdateBtn" style="flex: 1; height: 42px; width: auto !important; margin: 0 !important; background: linear-gradient(135deg, #0C2461 0%, #1E3799 100%); color: #ffffff; border: 1.5px solid #D4AF37; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(12,36,97,0.25); transition: all 0.2s;">
                            <i class="fa-solid fa-arrows-rotate"></i> تحديث الآن
                        </button>
                        <button type="button" id="khedmetyCancelUpdateBtn" style="flex: 1; height: 42px; width: auto !important; margin: 0 !important; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;">
                            إلغاء
                        </button>
                    </div>
                </div>
                <style>
                    @keyframes fadeInRoyalModal { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
                </style>
            `;

            document.body.appendChild(modal);

            document.getElementById('khedmetyDoUpdateBtn').onclick = () => {
                modal.remove();
                this.cleanCachesAndHardRefresh({ forceUnregister: false, skipDirtyCheck: true });
            };

            document.getElementById('khedmetyCancelUpdateBtn').onclick = () => {
                modal.remove();
            };
        },

        /**
         * عرض شاشة تغطية تفاعلية ملكية أثناء التحديث
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
                    background: rgba(7, 26, 56, 0.94);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    color: #ffffff;
                    z-index: 9999999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Cairo', 'Tajawal', system-ui, sans-serif;
                    direction: rtl;
                    text-align: center;
                    padding: 24px;
                    transition: opacity 0.3s ease;
                `;
                overlay.innerHTML = `
                    <div style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(212, 175, 55, 0.45); border-radius: 22px; padding: 34px 28px; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.45);">
                        <div style="width: 60px; height: 60px; margin: 0 auto 16px; border-radius: 16px; padding: 2.5px; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #F5CE66 100%); display: flex; align-items: center; justify-content: center;">
                            <img src="icons/icon-192.png" alt="إعداد خدام" style="width: 100%; height: 100%; object-fit: contain; border-radius: 14px; background: #071A38;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✝️</text></svg>'">
                        </div>
                        <div style="display: inline-block; font-size: 11px; font-weight: 800; color: #F3C64F; background: rgba(212, 175, 55, 0.16); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 999px; padding: 3px 12px; margin-bottom: 10px;">
                            منصة إعداد خدام • تحديث لحظي
                        </div>
                        <h3 style="margin: 0 0 12px; font-size: 1.15rem; font-weight: 900; color: #ffffff;">جاري استحضار النسخة الأحدث...</h3>
                        <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.14); border-radius: 999px; overflow: hidden; margin-bottom: 14px;">
                            <div style="height: 100%; width: 55%; background: linear-gradient(90deg, #D4AF37, #F3C64F); border-radius: 999px; animation: updateProgressPulse 1.2s ease-in-out infinite;"></div>
                        </div>
                        <p id="khedmetyUpdateMsg" style="margin: 0; font-size: 0.88rem; line-height: 1.6; color: #cbd5e1;"></p>
                    </div>
                    <style>
                        @keyframes updateProgressPulse { 0% { transform: translateX(100%); } 50% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
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
         * حقن زر تحديث مرئي في الواجهة بأمان مع منع التكرار (Idempotent)
         * @param {string|HTMLElement} container الحاوية المراد وضع الزر فيها
         * @returns {HTMLElement|null} عنصر الزر المنشأ أو الموجود
         */
        renderUpdateButton: function (container) {
            if (typeof document === 'undefined') return null;
            let parent = null;
            try {
                parent = typeof container === 'string' ? document.querySelector(container) : container;
            } catch (selectorErr) {
                console.warn('[AppUpdater] محدد الحاوية غير صالح أو غير مدعوم:', selectorErr.message);
                return null;
            }
            if (!parent || typeof parent.appendChild !== 'function') return null;

            const existingBtn = parent.querySelector ? parent.querySelector('.ultra-btn-updater') : null;
            if (existingBtn) {
                return existingBtn;
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ultra-btn-updater';
            btn.setAttribute('aria-label', 'تحديث واستحضار النسخة الجديدة');
            btn.setAttribute('title', 'تفريغ الكاش واستحضار آخر التحديثات والتحسينات');
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> <span>تحديث المنظومة</span>';
            btn.addEventListener('click', () => this.confirmAndRefresh());

            parent.appendChild(btn);
            return btn;
        }
    };

    if (root) {
        root.KhedmetyAppUpdater = KhedmetyAppUpdater;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = KhedmetyAppUpdater;
    }
})(typeof window !== 'undefined' ? window : global);
