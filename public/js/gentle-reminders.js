/**
 * public/js/gentle-reminders.js
 * نظام التنبيهات الكنسية الهادئة والمريحة — إعداد خدام
 * اجتماع القديس بولس الرسول لإعداد الخدام
 * 
 * المزايا:
 * - تنبيهات روحية وقورة غير مزعجة (بدون أصوات مفاجئة أو نوافذ مزعجة).
 * - مواعيد اجتماع إعداد الخدام (الجمعة 1:00 م).
 * - صلوات الأجبية المباركة (باكر، الغروب، النوم).
 * - قراءة الكتاب المقدس اليومية حسب الخطة.
 * - إمكانية الإغلاق السريع بلمسة واحدة لليوم الحالي.
 * - إعدادات مخصصة تتيح للمستخدم تشغيل أو إيقاف أي نوع من التنبيهات.
 */

(function () {
    'use strict';

    var STORAGE_PREFS = 'khedmty_gentle_reminders_prefs';
    var STORAGE_DISMISSED = 'khedmty_gentle_reminders_dismissed';

    var DEFAULT_PREFS = {
        enabled: true,
        meeting: true,
        agpeya: true,
        bible: true,
        birthdays: true
    };

    var GentleReminders = {
        getPreferences: function () {
            try {
                var raw = localStorage.getItem(STORAGE_PREFS);
                return raw ? Object.assign({}, DEFAULT_PREFS, JSON.parse(raw)) : Object.assign({}, DEFAULT_PREFS);
            } catch (e) {
                return Object.assign({}, DEFAULT_PREFS);
            }
        },

        savePreferences: function (prefs) {
            try {
                localStorage.setItem(STORAGE_PREFS, JSON.stringify(prefs));
            } catch (e) {
                console.warn('[GentleReminders] تعذر حفظ الإعدادات:', e);
            }
        },

        isDismissed: function (id) {
            try {
                var dateKey = new Date().toISOString().split('T')[0];
                var raw = sessionStorage.getItem(STORAGE_DISMISSED + '_' + dateKey);
                var dismissed = raw ? JSON.parse(raw) : [];
                return dismissed.indexOf(id) !== -1;
            } catch (e) {
                return false;
            }
        },

        dismiss: function (id) {
            try {
                var dateKey = new Date().toISOString().split('T')[0];
                var raw = sessionStorage.getItem(STORAGE_DISMISSED + '_' + dateKey);
                var dismissed = raw ? JSON.parse(raw) : [];
                if (dismissed.indexOf(id) === -1) {
                    dismissed.push(id);
                    sessionStorage.setItem(STORAGE_DISMISSED + '_' + dateKey, JSON.stringify(dismissed));
                }
                var banner = document.getElementById('khedmtyGentleBanner');
                if (banner) {
                    banner.style.transition = 'all 0.3s ease-out';
                    banner.style.opacity = '0';
                    banner.style.transform = 'translateY(-10px)';
                    setTimeout(function () {
                        if (banner.parentNode) banner.parentNode.removeChild(banner);
                    }, 300);
                }
            } catch (e) {
                console.warn('[GentleReminders] تعذر إخفاء التنبيه:', e);
            }
        },

        getActiveReminder: function () {
            var prefs = this.getPreferences();
            if (!prefs.enabled) return null;

            var now = new Date();
            var day = now.getDay(); // 0 = Sun, 5 = Fri, 4 = Thu
            var hour = now.getHours();
            var minute = now.getMinutes();

            // 1. تذكير اجتماع إعداد الخدام (الخميس من 12 ظهراً حتى الجمعة 1:30 م)
            if (prefs.meeting) {
                var isThursdayAfternoon = (day === 4 && hour >= 12);
                var isFridayBeforeMeeting = (day === 5 && (hour < 13 || (hour === 13 && minute <= 30)));
                if ((isThursdayAfternoon || isFridayBeforeMeeting) && !this.isDismissed('meeting')) {
                    var diffText = (day === 5) ? 'اليوم الجمعة في تمام 1:00 ظهراً' : 'غداً الجمعة في تمام 1:00 ظهراً';
                    return {
                        id: 'meeting',
                        type: 'meeting',
                        icon: '⛪',
                        title: 'اجتماع إعداد الخدام الأسبوعي',
                        text: 'نلتقي بالبركة في ' + diffText + ' بكنيسة رئيس الملائكة ميخائيل والشهيد مارجرجس الروماني.',
                        verse: '«حَيْثُمَا اجْتَمَعَ اثْنَانِ أَوْ ثَلاَثَةٌ بِاسْمِي فَهُنَاكَ أَكُونُ فِي وَسْطِهِمْ» (مت 18: 20)',
                        actionText: 'بركة الحضور',
                        actionLink: '#attendanceTab'
                    };
                }
            }

            // 2. صلوات الأجبية المباركة
            if (prefs.agpeya) {
                // باكر: من 5:00 فجراً حتى 10:30 صباحاً
                if (hour >= 5 && (hour < 10 || (hour === 10 && minute <= 30)) && !this.isDismissed('agpeya_morning')) {
                    return {
                        id: 'agpeya_morning',
                        type: 'prayer',
                        icon: '🌅',
                        title: 'بركة صلاة باكر',
                        text: 'صباح مبارك مليء بنعمة المسيح.. فلنرفع قلوبنا بشكر وتسبيح في مطلع هذا اليوم الجديد.',
                        verse: '«يَا اللهُ، إِلَهِي أَنْتَ. إِلَيْكَ أُبَكِّرُ. عَطِشَتْ إِلَيْكَ نَفْسِي» (مز 63: 1)',
                        actionText: 'صليت باكر'
                    };
                }

                // الغروب والنوم: من 6:30 مساءً حتى منتصف الليل
                if (hour >= 18 && hour <= 23 && !this.isDismissed('agpeya_night')) {
                    return {
                        id: 'agpeya_night',
                        type: 'prayer',
                        icon: '🕊️',
                        title: 'بركة صلاة الغروب والنوم',
                        text: 'سلام وهدوء المساء مع المخلص.. اختم يومك بلحظات مقدسة من فحص النفس والشكر.',
                        verse: '«بِسَلاَمَةٍ أَضْطَجِعُ أَيْضاً وَأَنَامُ، لأَنَّكَ أَنْتَ يَا رَبُّ مُنْفَرِداً فِي طُمَأْنِينَةٍ تُسَكِّنُنِي» (مز 4: 8)',
                        actionText: 'صليت المساء'
                    };
                }
            }

            // 3. قراءة الكتاب المقدس اليومية
            if (prefs.bible && !this.isDismissed('daily_bible')) {
                // إذا لم يتم تسجيل قراءة اليوم في الـ localReadings
                var todayStr = now.toISOString().split('T')[0];
                var hasReadToday = false;
                try {
                    var readings = JSON.parse(localStorage.getItem('khedmty_bible_readings')) || {};
                    var activeUserCode = localStorage.getItem('student_code') || (typeof currentUser !== 'undefined' && currentUser && currentUser.code);
                    if (activeUserCode) {
                        hasReadToday = readings[todayStr + '_' + activeUserCode] || readings[todayStr];
                    }
                } catch(e) {}

                if (!hasReadToday) {
                    return {
                        id: 'daily_bible',
                        type: 'bible',
                        icon: '📖',
                        title: 'قراءة الكتاب المقدس اليومية',
                        text: 'غذاء الروح وكلمة الحياة.. هل قرأت أصحاحك اليومي وتأملت في وصايا الرب؟',
                        verse: '«سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي» (مز 119: 105)',
                        actionText: 'قرأت اليوم'
                    };
                }
            }

            return null;
        },

        renderBanner: function () {
            var existing = document.getElementById('khedmtyGentleBanner');
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }

            var reminder = this.getActiveReminder();
            if (!reminder) return;

            var banner = document.createElement('div');
            banner.id = 'khedmtyGentleBanner';
            banner.className = 'k-gentle-reminder-banner';
            banner.innerHTML = [
                '<div class="k-gentle-content">',
                '  <div class="k-gentle-icon-box">' + reminder.icon + '</div>',
                '  <div class="k-gentle-body">',
                '    <div class="k-gentle-header">',
                '      <strong class="k-gentle-title">' + reminder.title + '</strong>',
                '      <span class="k-gentle-tag">تذكير روحي هادئ</span>',
                '    </div>',
                '    <p class="k-gentle-desc">' + reminder.text + '</p>',
                '    <div class="k-gentle-verse">' + reminder.verse + '</div>',
                '  </div>',
                '</div>',
                '<div class="k-gentle-actions">',
                '  <button type="button" class="k-gentle-btn k-gentle-btn-accept" onclick="GentleReminders.onActionClick(\'' + reminder.id + '\')">' + reminder.actionText + ' ✓</button>',
                '  <button type="button" class="k-gentle-btn k-gentle-btn-prefs" onclick="GentleReminders.openPreferencesModal()" title="إعدادات التنبيهات">⚙️</button>',
                '  <button type="button" class="k-gentle-btn k-gentle-btn-close" onclick="GentleReminders.dismiss(\'' + reminder.id + '\')" title="إخفاء التنبيه لليوم">✕</button>',
                '</div>'
            ].join('\n');

            // إدراج البانر في أعلى الصفحة الرئيسية أو الحاوية
            var targetContainer = document.querySelector('.main-content') || document.querySelector('.container') || document.querySelector('.app-container') || document.body;
            if (targetContainer === document.body) {
                document.body.insertBefore(banner, document.body.firstChild);
            } else {
                targetContainer.insertBefore(banner, targetContainer.firstChild);
            }
        },

        onActionClick: function (id) {
            if (id === 'daily_bible') {
                try {
                    var now = new Date().toISOString().split('T')[0];
                    var activeUserCode = localStorage.getItem('student_code') || (typeof currentUser !== 'undefined' && currentUser && currentUser.code) || 'me';
                    var readings = JSON.parse(localStorage.getItem('khedmty_bible_readings')) || {};
                    readings[now + '_' + activeUserCode] = true;
                    localStorage.setItem('khedmty_bible_readings', JSON.stringify(readings));
                    if (typeof showToast === 'function') showToast('📖 نعيماً بقراءة كلمة الله وسماع صوته!');
                } catch(e) {}
            } else if (id.indexOf('agpeya') !== -1) {
                if (typeof showToast === 'function') showToast('🕊️ تقبل الله صلواتك وركعاتك المباركة!');
            }
            this.dismiss(id);
        },

        openPreferencesModal: function () {
            var prefs = this.getPreferences();
            var existingModal = document.getElementById('khedmtyRemindersModal');
            if (existingModal && existingModal.parentNode) {
                existingModal.parentNode.removeChild(existingModal);
            }

            var modal = document.createElement('div');
            modal.id = 'khedmtyRemindersModal';
            modal.className = 'k-modal-backdrop active';
            modal.innerHTML = [
                '<div class="k-modal-dialog" style="max-width:440px;" role="dialog" aria-modal="true" aria-labelledby="remindersModalTitle">',
                '  <div class="k-modal-header">',
                '    <h3 id="remindersModalTitle" class="k-modal-title">🔔 إعدادات التنبيهات الروحية</h3>',
                '    <button type="button" class="k-modal-close" onclick="document.getElementById(\'khedmtyRemindersModal\').remove()">&times;</button>',
                '  </div>',
                '  <div class="k-modal-body" style="padding:16px 20px;">',
                '    <p style="font-size:0.88rem; color:var(--k-text-muted, #64748B); margin-bottom:16px;">',
                '      تنبيهات هادئة وقورة تذكرك بالمحطات الروحية دون إزعاج أو أصوات. يمكنك تخصيص ما يظهر لك بمرونة تامة:',
                '    </p>',
                '    <div style="display:flex; flex-direction:column; gap:12px;">',
                '      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--k-surface-2, #F8FAFC); border-radius:12px; cursor:pointer;">',
                '        <div>',
                '          <strong>🔔 تفعيل نظام التنبيهات بالكامل</strong>',
                '          <div style="font-size:0.78rem; color:var(--k-text-muted, #64748B);">إظهار الشريط الإرشادي الهادئ</div>',
                '        </div>',
                '        <input type="checkbox" id="pref_reminders_master" ' + (prefs.enabled ? 'checked' : '') + ' style="width:20px; height:20px; accent-color:var(--k-primary, #0B2A6B);">',
                '      </label>',
                '      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; cursor:pointer;">',
                '        <div>',
                '          <strong>⛪ تذكير اجتماع إعداد الخدام</strong>',
                '          <div style="font-size:0.78rem; color:var(--k-text-muted, #64748B);">الجمعة 1:00 م (يظهر الخميس والجمعة)</div>',
                '        </div>',
                '        <input type="checkbox" id="pref_reminders_meeting" ' + (prefs.meeting ? 'checked' : '') + ' style="width:20px; height:20px; accent-color:var(--k-gold, #D4A537);">',
                '      </label>',
                '      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; cursor:pointer;">',
                '        <div>',
                '          <strong>🕊️ صلوات الأجبية (باكر والغروب والنوم)</strong>',
                '          <div style="font-size:0.78rem; color:var(--k-text-muted, #64748B);">تذكير صلاة باكر صباحاً وصلوات المساء</div>',
                '        </div>',
                '        <input type="checkbox" id="pref_reminders_agpeya" ' + (prefs.agpeya ? 'checked' : '') + ' style="width:20px; height:20px; accent-color:var(--k-gold, #D4A537);">',
                '      </label>',
                '      <label style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:12px; cursor:pointer;">',
                '        <div>',
                '          <strong>📖 قراءة الكتاب المقدس اليومية</strong>',
                '          <div style="font-size:0.78rem; color:var(--k-text-muted, #64748B);">تذكير لطيف لقراءة كلمة الله اليومية</div>',
                '        </div>',
                '        <input type="checkbox" id="pref_reminders_bible" ' + (prefs.bible ? 'checked' : '') + ' style="width:20px; height:20px; accent-color:var(--k-gold, #D4A537);">',
                '      </label>',
                '    </div>',
                '  </div>',
                '  <div class="k-modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">',
                '    <button type="button" class="k-btn k-btn-primary" onclick="GentleReminders.savePrefsFromModal()">حفظ التفضيلات ✓</button>',
                '  </div>',
                '</div>'
            ].join('\n');

            document.body.appendChild(modal);
        },

        savePrefsFromModal: function () {
            var prefs = {
                enabled: document.getElementById('pref_reminders_master').checked,
                meeting: document.getElementById('pref_reminders_meeting').checked,
                agpeya: document.getElementById('pref_reminders_agpeya').checked,
                bible: document.getElementById('pref_reminders_bible').checked,
                birthdays: true
            };
            this.savePreferences(prefs);
            var m = document.getElementById('khedmtyRemindersModal');
            if (m) m.remove();
            if (typeof showToast === 'function') showToast('✅ تم حفظ تفضيلات التنبيهات الروحية بنجاح');
            this.renderBanner();
        },

        init: function () {
            var self = this;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () {
                    self.renderBanner();
                });
            } else {
                self.renderBanner();
            }
        }
    };

    window.GentleReminders = GentleReminders;
    GentleReminders.init();
})();
