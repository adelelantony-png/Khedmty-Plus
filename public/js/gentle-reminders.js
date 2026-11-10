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

        getNotificationsList: function () {
            var now = new Date();
            var day = now.getDay();
            var hour = now.getHours();
            var list = [];

            // 1. اجتماع إعداد الخدام
            var daysUntilFriday = (5 - day + 7) % 7;
            if (daysUntilFriday === 0 && hour >= 14) daysUntilFriday = 7;
            var fridayDate = new Date(now);
            fridayDate.setDate(now.getDate() + daysUntilFriday);
            var fridayDateStr = fridayDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

            list.push({
                id: 'notif_meeting',
                type: 'meeting',
                icon: '⛪',
                badge: 'أساسي',
                badgeColor: '#0B2A6B',
                badgeBg: '#EFF6FF',
                title: 'اجتماع إعداد الخدام الأسبوعي',
                text: 'موعدنا الجمعة القادمة (' + fridayDateStr + ') في تمام 1:00 ظهراً بكنيسة رئيس الملائكة ميخائيل والشهيد مارجرجس.',
                verse: '«حَيْثُمَا اجْتَمَعَ اثْنَانِ أَوْ ثَلاَثَةٌ بِاسْمِي فَهُنَاكَ أَكُونُ فِي وَسْطِهِمْ» (مت 18: 20)',
                actionText: 'إرسال عذر مسبق 📲',
                actionUrl: 'https://wa.me/?text=' + encodeURIComponent('سلام ونعمة.. أعتذر مقدماً عن عدم التمكن من حضور اجتماع إعداد الخدام الجمعة القادمة لظرف طارئ.')
            });

            // 2. قراءة الكتاب المقدس
            var todayStr = now.toISOString().split('T')[0];
            var hasReadToday = false;
            try {
                var readings = JSON.parse(localStorage.getItem('khedmty_bible_readings')) || {};
                var activeUserCode = localStorage.getItem('student_code') || 'me';
                hasReadToday = Boolean(readings[todayStr + '_' + activeUserCode] || readings[todayStr]);
            } catch(e) {}

            list.push({
                id: 'notif_bible',
                type: 'bible',
                icon: '📖',
                badge: hasReadToday ? 'تمت القراءة ✔️' : 'مطلوب اليوم ⏳',
                badgeColor: hasReadToday ? '#15803D' : '#B45309',
                badgeBg: hasReadToday ? '#DCFCE7' : '#FEF3C7',
                title: 'قراءة الكتاب المقدس اليومية',
                text: hasReadToday ? 'نشكر الله على بركة تغذية الروح بكلمة الله الحية اليوم!' : 'غذاء الروح وكلمة الحياة.. هل قرأت أصحاحك وتأملت في وصايا الرب اليوم؟',
                verse: '«سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي» (مز 119: 105)',
                actionText: hasReadToday ? 'قراءة أصحاح إضافي 📜' : 'سجل قراءتك لليوم ✓',
                isCompleted: hasReadToday
            });

            // 3. صلوات الأجبية
            list.push({
                id: 'notif_agpeya',
                type: 'prayer',
                icon: '🕊️',
                badge: (hour < 12) ? 'صلاة باكر 🌅' : 'صلوات المساء 🌙',
                badgeColor: '#6B21A8',
                badgeBg: '#F3E8FF',
                title: 'صلوات الأجبية المباركة',
                text: (hour < 12) ? 'صباح مبارك.. فلنرفع قلوبنا بشكر وتسبيح في مطلع هذا اليوم الجديد مع صلاة باكر.' : 'سلام وهدوء المساء مع المخلص.. اختم يومك بلحظات مقدسة مع صلوات الغروب والنوم.',
                verse: '«بِسَلاَمَةٍ أَضْطَجِعُ أَيْضاً وَأَنَامُ، لأَنَّكَ أَنْتَ يَا رَبُّ مُنْفَرِداً فِي طُمَأْنِينَةٍ تُسَكِّنُنِي» (مز 4: 8)',
                actionText: 'صليت والحمد لله ✓'
            });

            // 4. كشك المناهج
            list.push({
                id: 'notif_kiosk',
                type: 'kiosk',
                icon: '📚',
                badge: 'كشك ذكي 📲',
                badgeColor: '#047857',
                badgeBg: '#D1FAE5',
                title: 'المناهج والمذكرات الـ 7 متاحة فورياً',
                text: 'تم تحديث مذكرات ومحاضرات الفرقة الأولى والفرقة الثانية في كشك الواتساب التفاعلي، أرسل «مواد» للاستعلام الفوري.',
                verse: '«تَمَسَّكْ بِالأَدَبِ، لاَ تَرْخِهِ. احْفَظْهُ فَإِنَّهُ هُوَ حَيَاتُكَ» (أم 4: 13)',
                actionText: 'استعلام عبر واتساب 📲',
                actionUrl: 'https://wa.me/?text=' + encodeURIComponent('مواد')
            });

            return list;
        },

        getUnreadCount: function () {
            var dismissed = [];
            try {
                dismissed = JSON.parse(localStorage.getItem('khedmty_read_notifications_' + new Date().toISOString().split('T')[0])) || [];
            } catch(e) {}
            var total = 4;
            var unread = Math.max(0, total - dismissed.length);
            return unread;
        },

        updateBadges: function () {
            var count = this.getUnreadCount();
            document.querySelectorAll('#khedmty-notif-badge, #khedmty-servant-notif-badge, .khedmty-notif-badge').forEach(function (el) {
                el.textContent = count;
                el.style.display = (count > 0) ? 'inline-block' : 'none';
            });
        },

        markAllAsRead: function () {
            try {
                var today = new Date().toISOString().split('T')[0];
                var allIds = ['notif_meeting', 'notif_bible', 'notif_agpeya', 'notif_kiosk'];
                localStorage.setItem('khedmty_read_notifications_' + today, JSON.stringify(allIds));
            } catch(e) {}
            this.updateBadges();
            var m = document.getElementById('khedmtyNotificationsModal');
            if (m) m.remove();
            if (typeof showToast === 'function') {
                showToast('✅ تم تحديد كافة التنبيهات كمقروءة');
            }
        },

        openNotificationsModal: function () {
            try {
                var existing = document.getElementById('khedmtyNotificationsModal');
                if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

                var list = this.getNotificationsList() || [];
                var unread = this.getUnreadCount();

                var cardsHtml = list.map(function (item) {
                    var actionBtn = '';
                    if (item.actionUrl) {
                        actionBtn = '<a href="' + item.actionUrl + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.75rem; padding:5px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:700;"><i class="fa-brands fa-whatsapp"></i> ' + item.actionText + '</a>';
                    } else if (item.id === 'notif_bible') {
                        actionBtn = '<button type="button" class="k-btn k-btn-primary" onclick="GentleReminders.onActionClick(\'daily_bible\'); GentleReminders.updateBadges(); this.disabled=true; this.innerHTML=\'تم تسجيل القراءة ✔️\';" style="font-size:0.75rem; padding:5px 12px; border-radius:8px;">' + item.actionText + '</button>';
                    } else if (item.id === 'notif_agpeya') {
                        actionBtn = '<button type="button" class="k-btn k-btn-secondary" onclick="GentleReminders.onActionClick(\'agpeya\'); this.disabled=true; this.innerHTML=\'تقبل الله صلواتك 🕊️\';" style="font-size:0.75rem; padding:5px 12px; border-radius:8px;">' + item.actionText + '</button>';
                    }

                    return [
                        '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:16px; padding:14px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">',
                        '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">',
                        '    <div style="display:flex; align-items:center; gap:8px;">',
                        '      <span style="font-size:1.4rem;">' + item.icon + '</span>',
                        '      <div>',
                        '        <strong style="font-size:0.92rem; color:var(--k-text, #071A38); display:block;">' + item.title + '</strong>',
                        '      </div>',
                        '    </div>',
                        '    <span style="font-size:0.7rem; font-weight:800; background:' + item.badgeBg + '; color:' + item.badgeColor + '; padding:3px 9px; border-radius:999px;">' + item.badge + '</span>',
                        '  </div>',
                        '  <p style="font-size:0.82rem; color:var(--k-text-muted, #475569); margin:6px 0 8px 0; line-height:1.45;">' + item.text + '</p>',
                        '  <div style="font-family:var(--font-amiri, serif); font-size:0.85rem; color:var(--k-accent, #B8860B); background:var(--k-surface-2, #FFF6DC); padding:6px 12px; border-radius:8px; margin-bottom:10px;">' + item.verse + '</div>',
                        '  <div style="display:flex; justify-content:flex-end; gap:8px;">',
                        actionBtn,
                        '  </div>',
                        '</div>'
                    ].join('\n');
                }).join('\n');

                var modal = document.createElement('div');
                modal.id = 'khedmtyNotificationsModal';
                modal.className = 'k-modal-backdrop active';
                modal.style.display = 'flex';
                modal.style.zIndex = '100005';
            modal.innerHTML = [
                '<div class="k-modal" style="max-width:540px; width:100%; max-height:88vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:24px; box-shadow:0 20px 60px rgba(7,26,56,0.35);">',
                '  <div class="k-modal-header" style="padding:16px 20px; background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); border-bottom:2px solid var(--k-border-gold, #D4AF37); display:flex; justify-content:space-between; align-items:center; margin:0;">',
                '    <div style="display:flex; align-items:center; gap:10px;">',
                '      <div style="width:36px; height:36px; border-radius:50%; background:rgba(212,175,55,0.25); border:1px solid #D4AF37; display:flex; align-items:center; justify-content:center; color:#FDE047; font-size:1.15rem;"><i class="fa-solid fa-bell"></i></div>',
                '      <div>',
                '        <h4 style="margin:0; font-size:1.1rem; font-weight:800; color:#FFF;">التنبيهات والإشعارات الرعوية</h4>',
                '        <small style="color:#CBD5E1; font-size:0.75rem;">' + (unread > 0 ? unread + ' تنبيهات نشطة لليوم' : 'جميع التنبيهات مستوفاة ✔️') + '</small>',
                '      </div>',
                '    </div>',
                '    <div style="display:flex; align-items:center; gap:8px;">',
                '      <button type="button" onclick="GentleReminders.openPreferencesModal()" class="k-btn" style="background:rgba(255,255,255,0.1); color:#FFF; font-size:0.75rem; padding:5px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.2);" title="تخصيص التنبيهات"><i class="fa-solid fa-gear"></i></button>',
                '      <button type="button" class="k-modal-close" onclick="document.getElementById(\'khedmtyNotificationsModal\').remove()" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:#FDE047;">&times;</button>',
                '    </div>',
                '  </div>',
                '  <div class="k-modal-body" style="padding:18px 20px; overflow-y:auto; flex:1; background:var(--k-bg, #EEF3FB);">' + cardsHtml + '</div>',
                '  <div class="k-modal-footer" style="padding:12px 20px; background:var(--k-surface-2, #FFF6DC); border-top:1px solid var(--k-border-gold, #D4AF37); display:flex; justify-content:space-between; align-items:center;">',
                '    <button type="button" class="k-btn" onclick="GentleReminders.markAllAsRead()" style="background:var(--k-primary, #0B2A6B); color:#FFF; font-size:0.78rem; padding:6px 14px; border-radius:8px; font-weight:700;"><i class="fa-solid fa-check-double me-1"></i> تحديد الكل كمقروء</button>',
                '    <button type="button" class="k-btn" onclick="document.getElementById(\'khedmtyNotificationsModal\').remove()" style="background:#E2E8F0; color:#334155; font-size:0.78rem; padding:6px 14px; border-radius:8px;">إغلاق</button>',
                '  </div>',
                '</div>'
            ].join('\n');

            modal.onclick = function (e) {
                if (e.target === modal) modal.remove();
            };

            document.body.appendChild(modal);
        } catch(err) {
            console.error('[GentleReminders] Error opening notifications modal:', err);
            if (typeof showToast === 'function') {
                showToast('🔔 تعذر فتح نافذة التنبيهات حالياً، جاري التحديث...');
            }
        }
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
                    self.updateBadges();
                });
            } else {
                self.renderBanner();
            }
        }
    };

    window.GentleReminders = GentleReminders;
    GentleReminders.init();
})();
