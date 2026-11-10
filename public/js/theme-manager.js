/**
 * public/js/theme-manager.js
 * مدير الهوية البصرية والثيمات السبعة — إعداد خدام
 * اجتماع القديس بولس الرسول لإعداد الخدام
 * 
 * المزايا:
 * - 7 ثيمات مريحة وموقرة متوافقة مع معايير WCAG AA للتباين البصري (>= 4.5:1).
 * - تطبيق فوري قبل أول رسم (Zero FOUC) بدون وميض شاشة.
 * - حفظ آمن في LocalStorage مع استشعار prefers-color-scheme.
 * - نافذة منبثقة تفاعلية للمعاينة اللونية (Live Color Swatches).
 * - تكامل سلس مع مفاتيح الـ Toggle في صفحة الإعدادات.
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'khedmty_theme';

    var THEMES = [
        {
            id: 'royal-gold',
            name: 'الملكي الذهبي',
            badge: 'الافتراضي',
            desc: 'كحلي ملكي عميق وذهبي دافئ وكريمي',
            primary: '#0B2A6B',
            accent: '#D4A537',
            surface: '#FFF6DC',
            bg: '#EEF3FB'
        },
        {
            id: 'emerald-calm',
            name: 'الزمرد الهادئ',
            badge: 'طبيعي',
            desc: 'أخضر زيتي مريح وذهبي هادئ',
            primary: '#1F4D45',
            accent: '#C5A059',
            surface: '#E5EFEA',
            bg: '#F2F7F4'
        },
        {
            id: 'warm-sand',
            name: 'الرمال الدافئة',
            badge: 'ترابي كنسي',
            desc: 'بيج رملي دافئ وبني كنسي موقر',
            primary: '#6B4F3A',
            accent: '#C86446',
            surface: '#EFE5D5',
            bg: '#F6EFE4'
        },
        {
            id: 'sky-mist',
            name: 'السحاب السماوي',
            badge: 'منعش',
            desc: 'أزرق سماوي ناعم ولمسة نعناعية',
            primary: '#35546E',
            accent: '#48A9A6',
            surface: '#DCECF7',
            bg: '#EAF3FA'
        },
        {
            id: 'lavender-soft',
            name: 'اللافندر الرقيق',
            badge: 'هادئ',
            desc: 'بنفسجي رمادي خافت مريح للأعصاب',
            primary: '#6B5B95',
            accent: '#BAA6D4',
            surface: '#EAE3F5',
            bg: '#F5F2FA'
        },
        {
            id: 'night-warm',
            name: 'الليلي الدافئ',
            badge: 'مريح للعين',
            desc: 'كحلي ليلي دافئ يخفف إجهاد العين بالظلام',
            primary: '#172033',
            accent: '#D4A537',
            surface: '#1F2C46',
            bg: '#0E1420'
        },
        {
            id: 'zen',
            name: 'وضع التركيز (زن)',
            badge: 'نقي وبسيط',
            desc: 'واجهة خالية من الزخارف لتركيز تام في القراءة',
            primary: '#2C3E50',
            accent: '#7F8C8D',
            surface: '#F0EDE6',
            bg: '#FAF8F5'
        }
    ];

    function getSavedTheme() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && THEMES.some(function (t) { return t.id === saved; })) {
                return saved;
            }
        } catch (e) {
            console.warn('LocalStorage unavailable for theme storage:', e);
        }

        // استشعار الوضع الليلي التلقائي في النظام
        try {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'night-warm';
            }
        } catch (e) {}

        return 'royal-gold';
    }

    function applyThemeToDom(themeId) {
        if (!themeId) themeId = 'royal-gold';
        var htmlEl = document.documentElement;
        htmlEl.setAttribute('data-theme', themeId);
        if (document.body) {
            document.body.setAttribute('data-theme', themeId);
            document.body.classList.add('k-theme-transition');
            setTimeout(function () {
                if (document.body) document.body.classList.remove('k-theme-transition');
            }, 350);
        }

        // تحديث meta theme-color ليتناسق مع شريط حالة الموبايل
        var currentMeta = document.querySelector('meta[name="theme-color"]');
        var themeObj = THEMES.find(function (t) { return t.id === themeId; });
        if (themeObj) {
            if (!currentMeta) {
                currentMeta = document.createElement('meta');
                currentMeta.setAttribute('name', 'theme-color');
                document.head.appendChild(currentMeta);
            }
            currentMeta.setAttribute('content', themeObj.primary);

            // تفعيل فوري ومباشر لخلفية ونصوص الـ body
            if (document.body) {
                document.body.style.setProperty('--k-active-bg', themeObj.bg);
                document.body.style.setProperty('--k-active-primary', themeObj.primary);
                document.body.style.setProperty('--k-active-accent', themeObj.accent);
            }
        }

        // تحديث مفاتيح الـ Toggle المتواجدة في الصفحة (إن وجدت)
        updateToggleElements(themeId);
    }

    function updateToggleElements(themeId) {
        var isNight = (themeId === 'night-warm');
        var nightToggles = document.querySelectorAll('[data-k-action="toggle-night"], #themeNightToggle, #settingsNightToggle, .theme-night-toggle-input');
        nightToggles.forEach(function (toggle) {
            if (toggle.type === 'checkbox') {
                toggle.checked = isNight;
            }
        });
    }

    // تطبيق فوري استباقي قبل أول رسم (Zero-FOUC)
    var initialTheme = getSavedTheme();
    applyThemeToDom(initialTheme);

    var ThemeManager = {
        themes: THEMES,

        getTheme: function () {
            return document.documentElement.getAttribute('data-theme') || initialTheme;
        },

        getThemeDetails: function (themeId) {
            return THEMES.find(function (t) { return t.id === (themeId || ThemeManager.getTheme()); }) || THEMES[0];
        },

        setTheme: function (themeId) {
            if (!THEMES.some(function (t) { return t.id === themeId; })) {
                themeId = 'royal-gold';
            }
            try {
                localStorage.setItem(STORAGE_KEY, themeId);
            } catch (e) {
                console.warn('Failed to save theme in localStorage:', e);
            }

            applyThemeToDom(themeId);

            // تحديث بطاقات الـ Swatches داخل المودال إن كانت مفتوحة
            var cards = document.querySelectorAll('.k-theme-swatch-card');
            cards.forEach(function (card) {
                var tid = card.getAttribute('data-theme-id');
                if (tid === themeId) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            // إطلاق حدث عام يمكن لأي صفحة أو مكوّن الاستماع إليه
            try {
                window.dispatchEvent(new CustomEvent('khedmty-theme-change', {
                    detail: {
                        theme: themeId,
                        themeInfo: ThemeManager.getThemeDetails(themeId)
                    }
                }));
            } catch (e) {}
        },

        toggleNightMode: function (forceState) {
            var current = ThemeManager.getTheme();
            var targetTheme;
            if (typeof forceState === 'boolean') {
                targetTheme = forceState ? 'night-warm' : 'royal-gold';
            } else {
                targetTheme = (current === 'night-warm') ? 'royal-gold' : 'night-warm';
            }
            ThemeManager.setTheme(targetTheme);
            return targetTheme === 'night-warm';
        },

        openThemePicker: function () {
            var existingModal = document.getElementById('khedmty-theme-modal');
            if (existingModal) {
                existingModal.style.display = 'flex';
                existingModal.setAttribute('aria-hidden', 'false');
                return;
            }

            ThemeManager.renderThemePickerModal();
        },

        closeThemePicker: function () {
            var modal = document.getElementById('khedmty-theme-modal');
            if (modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        },

        renderThemePickerModal: function () {
            var activeTheme = ThemeManager.getTheme();
            var modal = document.createElement('div');
            modal.id = 'khedmty-theme-modal';
            modal.className = 'k-modal-backdrop';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'اختيار المظهر وثيم التطبيق');

            var html = '';
            html += '<div class="k-modal k-theme-picker-dialog">';
            html += '  <div class="k-theme-picker-header">';
            html += '    <div style="display:flex; align-items:center; gap:10px;">';
            html += '      <div class="k-theme-icon-badge"><i class="fa-solid fa-palette"></i></div>';
            html += '      <div>';
            html += '        <h3 class="k-theme-picker-title">اختر المظهر والثيم</h3>';
            html += '        <p class="k-theme-picker-subtitle">7 ألوان موقرة وهادئة ومريحة للعين</p>';
            html += '      </div>';
            html += '    </div>';
            html += '    <button type="button" class="k-btn-close-theme" aria-label="إغلاق">&times;</button>';
            html += '  </div>';

            html += '  <div class="k-theme-swatches-grid">';
            THEMES.forEach(function (t) {
                var isActive = (t.id === activeTheme);
                html += '    <div class="k-theme-swatch-card ' + (isActive ? 'active' : '') + '" data-theme-id="' + t.id + '">';
                html += '      <div class="k-swatch-preview" style="background: ' + t.bg + ';">';
                html += '        <div class="k-swatch-circle" style="background: ' + t.primary + ';" title="اللون الأساسي"></div>';
                html += '        <div class="k-swatch-circle" style="background: ' + t.accent + ';" title="اللون الذهبي/المميز"></div>';
                html += '        <div class="k-swatch-circle" style="background: ' + t.surface + '; border: 1px solid rgba(0,0,0,0.1);" title="لون السطح"></div>';
                html += '      </div>';
                html += '      <div class="k-swatch-info">';
                html += '        <div class="k-swatch-title-wrap">';
                html += '          <span class="k-swatch-title">' + t.name + '</span>';
                if (t.badge) {
                    html += '          <span class="k-swatch-badge">' + t.badge + '</span>';
                }
                html += '        </div>';
                html += '        <p class="k-swatch-desc">' + t.desc + '</p>';
                html += '      </div>';
                html += '      <div class="k-swatch-check"><i class="fa-solid fa-check"></i></div>';
                html += '    </div>';
            });
            html += '  </div>';

            html += '  <div class="k-theme-picker-footer" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">';
            html += '    <button type="button" class="k-btn k-btn-secondary" id="btnOpenRemindersFromTheme" style="font-size:0.8rem; padding:6px 12px;">🔔 التنبيهات الروحية</button>';
            html += '    <button type="button" class="k-btn k-btn-primary k-theme-btn-done">تم الاختيار</button>';
            html += '  </div>';
            html += '</div>';

            modal.innerHTML = html;
            document.body.appendChild(modal);

            // إضافة مستمعات الأحداث
            var closeBtn = modal.querySelector('.k-btn-close-theme');
            var doneBtn = modal.querySelector('.k-theme-btn-done');
            if (closeBtn) closeBtn.onclick = ThemeManager.closeThemePicker;
            if (doneBtn) doneBtn.onclick = ThemeManager.closeThemePicker;

            // إغلاق بالنقر على الخلفية
            modal.onclick = function (e) {
                if (e.target === modal) {
                    ThemeManager.closeThemePicker();
                }
            };

            // النقر على الكروت لاختيار الثيم فورياً
            var cards = modal.querySelectorAll('.k-theme-swatch-card');
            cards.forEach(function (card) {
                card.onclick = function () {
                    var selectedId = card.getAttribute('data-theme-id');
                    ThemeManager.setTheme(selectedId);
                };
            });
        },

        injectUniversalThemePill: function () {
            // تم إيقاف الزر العائم بناءً على رغبة المستخدم: الثيم الآن له زر ثابت منظم في الهيدر
            var existingPill = document.querySelector('.k-universal-theme-pill');
            if (existingPill && existingPill.parentNode) {
                existingPill.parentNode.removeChild(existingPill);
            }
        },

        bindThemeButtons: function () {
            ThemeManager.injectUniversalThemePill();
            // ربط أي أزرار في الواجهة تحمل data-k-action="open-theme-picker"
            document.querySelectorAll('[data-k-action="open-theme-picker"]').forEach(function (btn) {
                btn.onclick = function (e) {
                    e.preventDefault();
                    ThemeManager.openThemePicker();
                };
            });

            // ربط مفاتيح التبديل السريعة
            document.querySelectorAll('[data-k-action="toggle-night"]').forEach(function (el) {
                el.onchange = function () {
                    ThemeManager.toggleNightMode(this.checked);
                };
            });
        }
    };

    // إتاحة الكائن عالمياً
    window.ThemeManager = ThemeManager;
    window.KhedmtyTheme = ThemeManager;

    // ربط الأحداث عند اكتمال تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            applyThemeToDom(ThemeManager.getTheme());
            ThemeManager.bindThemeButtons();
        });
    } else {
        applyThemeToDom(ThemeManager.getTheme());
        ThemeManager.bindThemeButtons();
    }

})();
