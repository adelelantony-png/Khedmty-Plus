/**
 * Khedmty-Plus - Granular Servant Permissions & Live Preview System
 * نظام تفصيل وتخصيص صلاحيات الخدام ومعاينة لوحة التحكم الحية
 * 
 * يتيح لأمين الخدمة:
 * 1. ضبط مستوى الوصول (إدارة كاملة / مشاهدة فقط / إخفاء تام) لكل خاصية وقسم في المشروع.
 * 2. تخصيص صلاحيات "شبه أدمن" دون كشف شؤون الخدام وتحضيراتهم وحضورهم.
 * 3. معاينة لوحة التحكم حياً (Live Preview As) كما يراها الخادم تماماً.
 * 4. تطبيق الحجب الصارم (Ironclad Hiding): لا يظهر الزر ولا يمكن فتح التبويب برمجياً أو بالرابط المباشر.
 */

const PERMISSION_MODULES = [
    {
        id: 'attendance',
        title: 'تسجيل وحضور الدارسين والماسح',
        icon: 'fa-qrcode',
        category: 'الرعاية واللقاءات',
        desc: 'مسح الباركود بالكاميرا، تسجيل حضور الدارسين، وتعديل وقت المسح',
        tabId: 'attendanceTab',
        tabSelectors: ['.tab-btn[onclick*="attendanceTab"]', 'a[href*="attendanceTab"]'],
        viewDesc: 'مشاهدة كشف الحضور وإحصائيات الحاضرين فقط دون إمكانية المسح أو التعديل',
        fullDesc: 'مسح الحضور بالكاميرا + التسجيل اليدوي + تعديل أوقات المسح وإلغاء الحضور'
    },
    {
        id: 'members',
        title: 'سجل وبيانات المخدومين والدارسين',
        icon: 'fa-users',
        category: 'الرعاية واللقاءات',
        desc: 'ملفات الدارسين، أرقام الهواتف، الكود، وتفاصيل المراحل والبيانات',
        tabId: 'membersTab',
        subTabs: ['feedbackTab'],
        tabSelectors: [
            '.tab-btn[onclick*="membersTab"]',
            'a[href*="membersTab"]',
            '.tab-btn[onclick*="feedbackTab"]'
        ],
        viewDesc: 'تصفح كروت الدارسين والبحث والاطلاع على أرقام الهواتف فقط',
        fullDesc: 'إضافة دارس جديد + تعديل البيانات + الحذف + استيراد وتصدير إكسيل'
    },
    {
        id: 'excuses',
        title: 'رادار الأعذار والقرارات الرعوية',
        icon: 'fa-envelope-open-text',
        category: 'الرعاية واللقاءات',
        desc: 'أعذار الغياب الواردة عبر واتساب ومراجعتها واعتمادها رعوياً',
        tabId: 'radarTab',
        sectionId: 'radarSec_excuses',
        pillId: 'radarPill_excuses',
        viewDesc: 'قراءة واستعراض الأعذار الواردة ورسائل الواتساب الأصلية فقط',
        fullDesc: 'قبول ورفض العذر + تسجيل عذر يدوي من القائمة + إلغاء وحذف العذر'
    },
    {
        id: 'followup',
        title: 'رادار الافتقاد ومتابعة الغائبين',
        icon: 'fa-hand-holding-heart',
        category: 'الرعاية واللقاءات',
        desc: 'كشوفات المنقطعين، الزيارات المنزلية، وافتقاد الواتساب المباشر',
        tabId: 'radarTab',
        sectionId: 'radarSec_absence',
        pillId: 'radarPill_absence',
        subTabs: ['followupTab'],
        tabSelectors: [
            'a[href*="servant_followup.html"]',
            'a[href*="servant_spiritual_report.html"]'
        ],
        viewDesc: 'استعراض كشف المتغيبين دون إرسال رسائل أو تسجيل زيارات',
        fullDesc: 'إرسال رسائل افتقاد واتساب + تسجيل زيارات وافتقادات + طباعة الكشوف'
    },
    {
        id: 'pulse',
        title: 'نبض الاجتماع والنمو الرعوي',
        icon: 'fa-chart-line',
        category: 'التقارير والمؤشرات',
        desc: 'تحليل نسب الحضور، التفاعل، وتنافسية الفرق، وخطة نمو الجمعات',
        tabId: 'radarTab',
        sectionId: 'radarSec_pulse',
        pillId: 'radarPill_pulse',
        viewDesc: 'مشاهدة مؤشرات النبض وتنافسية الفرق والمسار البياني فقط',
        fullDesc: 'مشاهدة النبض + إرسال التقرير لجروب الخدام بالواتساب + نسخ التقرير'
    },
    {
        id: 'servants_affairs',
        title: 'حضور الخدام والتزامهم والتحضيرات',
        icon: 'fa-clipboard-check',
        category: 'شؤون أمانة الخدمة (سري ومحمي)',
        desc: 'متابعة حضور الخدام، تحضيراتهم، وافتقادهم (مخصص لأمين الخدمة)',
        tabId: 'servantsAttendanceTab',
        subTabs: ['smartPrepTab'],
        tabSelectors: [
            '.tab-btn[onclick*="servantsAttendanceTab"]',
            'a[href*="servantsAttendanceTab"]',
            '.tab-btn[onclick*="smartPrepTab"]',
            '#tabBtn_smartPrep'
        ],
        viewDesc: 'رؤية كشف أسماء الخدام فقط دون الوصول للتحضيرات أو نسب الالتزام',
        fullDesc: 'رصد حضور الخدام + متابعة التحضيرات الذكية + تقييم التزام الخدام'
    },
    {
        id: 'servants_mgmt',
        title: 'إدارة حسابات الخدام وصلاحياتهم',
        icon: 'fa-user-shield',
        category: 'شؤون أمانة الخدمة (سري ومحمي)',
        desc: 'إضافة خدام جدد، تعديل كلمات المرور، وضبط الصلاحيات (أمين الخدمة فقط)',
        tabId: 'servantsTab',
        tabSelectors: ['.tab-btn[onclick*="servantsTab"]', 'a[href*="servantsTab"]'],
        viewDesc: 'استعراض جدول الخدام فقط دون إمكانية التعديل أو الحذف أو كشف كلمات المرور',
        fullDesc: 'إضافة خادم + تخصيص الصلاحيات + كشف وتغيير كلمات المرور + حذف خادم'
    },
    {
        id: 'plan',
        title: 'خطة السنة والمنهج والتربية الكنسية',
        icon: 'fa-calendar-days',
        category: 'التعليم والأنشطة',
        desc: 'أجندة الجمعات، موضوعات الكورسات، والمسؤوليات والمذكرات',
        tabId: 'planTab',
        subTabs: ['coursesTab', 'materialsTab'],
        tabSelectors: [
            '.tab-btn[onclick*="planTab"]',
            '.tab-btn[onclick*="coursesTab"]',
            '.tab-btn[onclick*="materialsTab"]',
            'a[href*="servant_grades_entry.html"]'
        ],
        viewDesc: 'تصفح جدول المحاضرات والمناهج والملفات فقط دون تعديل',
        fullDesc: 'إضافة وتعديل فعاليات الخطة + إدارة وتعديل المناهج والامتحانات'
    },
    {
        id: 'broadcast',
        title: 'بوت الواتساب التلقائي والرسائل الجماعية',
        icon: 'fa-brands fa-whatsapp',
        category: 'الاتصالات والرسائل',
        desc: 'إرسال رسائل جماعية للدارسين وأولياء الأمور وتشغيل بوت الخدمة',
        tabId: 'broadcastTab',
        tabSelectors: ['.tab-btn[onclick*="broadcastTab"]', 'a[href*="broadcastTab"]'],
        viewDesc: 'استعراض النماذج وحالة السيرفر فقط دون إمكانية الإرسال',
        fullDesc: 'إرسال رسائل واتساب فردية وجماعية + تشغيل وفصل بوت الخدمة'
    },
    {
        id: 'settings_audit',
        title: 'الإعدادات وسجل الرقابة ودرع الأمان',
        icon: 'fa-shield-halved',
        category: 'إدارة النظام والرقابة',
        desc: 'سجل العمليات، توكنات درع الأمان، وإعدادات الكنيسة والمزامنة والأرشفة',
        tabId: 'settingsTab',
        subTabs: ['auditTab', 'rolloverTab', 'cloudUsageTab', 'dataTab'],
        tabSelectors: [
            '.tab-btn[onclick*="settingsTab"]',
            '.tab-btn[onclick*="auditTab"]',
            '.tab-btn[onclick*="rolloverTab"]',
            '.tab-btn[onclick*="cloudUsageTab"]',
            '.tab-btn[onclick*="dataTab"]',
            'a[href*="servant_migrate_attendance.html"]',
            '.tab-btn[onclick*="openTripartiteSyncModal"]'
        ],
        viewDesc: 'استعراض سجل الرقابة فقط دون الوصول للإعدادات أو توكنات الأمان',
        fullDesc: 'تحكم كامل في إعدادات النظام + إدارة توكنات الحماية + النسخ الاحتياطي'
    }
];

// ربط التبويبات بالموديولات المقابلة لها لفحص الأمان اللحظي
const TAB_TO_MODULE_MAP = {
    'attendanceTab': 'attendance',
    'membersTab': 'members',
    'feedbackTab': 'members',
    'servantsAttendanceTab': 'servants_affairs',
    'smartPrepTab': 'servants_affairs',
    'servantsTab': 'servants_mgmt',
    'planTab': 'plan',
    'coursesTab': 'plan',
    'materialsTab': 'plan',
    'broadcastTab': 'broadcast',
    'settingsTab': 'settings_audit',
    'auditTab': 'settings_audit',
    'rolloverTab': 'settings_audit',
    'cloudUsageTab': 'settings_audit',
    'dataTab': 'settings_audit',
    'followupTab': 'followup'
};

// القوالب الافتراضية المسبقة للأدوار
function getDefaultPermissionsForRole(role) {
    const r = String(role || '').toLowerCase();
    if (r === 'admin' || r === 'developer') {
        return {
            attendance: 'full',
            members: 'full',
            excuses: 'full',
            followup: 'full',
            pulse: 'full',
            servants_affairs: 'full',
            servants_mgmt: 'full',
            plan: 'full',
            broadcast: 'full',
            settings_audit: 'full'
        };
    }
    if (r === 'semi_admin') {
        // شبه أدمن: إدارة كاملة للرعاية والدارسين مع حجب شؤون الخدام
        return {
            attendance: 'full',
            members: 'full',
            excuses: 'full',
            followup: 'full',
            pulse: 'full',
            servants_affairs: 'none', // محجوب
            servants_mgmt: 'none',    // محجوب
            plan: 'full',
            broadcast: 'full',
            settings_audit: 'view'
        };
    }
    if (r === 'followup_lead') {
        // مسؤول متابعة وافتقاد
        return {
            attendance: 'view',
            members: 'view',
            excuses: 'full',
            followup: 'full',
            pulse: 'full',
            servants_affairs: 'none',
            servants_mgmt: 'none',
            plan: 'view',
            broadcast: 'view',
            settings_audit: 'none'
        };
    }
    if (r === 'scanner_only' || r === 'attend_only') {
        return {
            attendance: 'full',
            members: 'none',
            excuses: 'none',
            followup: 'none',
            pulse: 'none',
            servants_affairs: 'none',
            servants_mgmt: 'none',
            plan: 'none',
            broadcast: 'none',
            settings_audit: 'none'
        };
    }
    if (r === 'view_only') {
        return {
            attendance: 'view',
            members: 'view',
            excuses: 'view',
            followup: 'view',
            pulse: 'view',
            servants_affairs: 'none',
            servants_mgmt: 'none',
            plan: 'view',
            broadcast: 'none',
            settings_audit: 'none'
        };
    }
    // خادم عادي افتراضي (servant / full)
    return {
        attendance: 'full',       // يسجل حضور مخدومي مرحلته ويمسح الباركود
        members: 'view',          // تصفح بيانات وأرقام هواتف مخدوميه
        excuses: 'view',          // مشاهدة أعذار مرحلته فقط دون أزرار القبول والرفض والإلغاء
        followup: 'view',         // متابعة غيابات مرحلته دون إرسال حملات شاملة
        pulse: 'view',            // مشاهدة مؤشرات النبض دون أزرار إرسال التقرير لجروب الخدام بالبوت
        servants_affairs: 'none', // محجوب تماماً (حضور وتحضيرات الخدام سرية لأمين الخدمة وأبونا)
        servants_mgmt: 'none',    // محجوب تماماً (إدارة الخدام وحساباتهم لأمين الخدمة فقط)
        plan: 'view',             // تصفح خطة الخدمة والمناهج
        broadcast: 'none',        // محجوب (بوت الواتساب لأمين الخدمة)
        settings_audit: 'none'    // محجوب (إعدادات النظام والأمان لأمين الخدمة)
    };
}

// استخراج الصلاحيات الفعالة لأي خادم
function getServantEffectivePermissions(servant) {
    if (!servant) return getDefaultPermissionsForRole('full');
    if (servant.customPermissions && typeof servant.customPermissions === 'object') {
        const defaults = getDefaultPermissionsForRole(servant.permission || servant.role || 'full');
        return Object.assign({}, defaults, servant.customPermissions);
    }
    return getDefaultPermissionsForRole(servant.permission || servant.role || 'full');
}

// 🛡️ صمام الأمان الفوري: هل التبويب محجوب عن المستخدم الحالي؟
function isTabForbiddenForCurrentUser(tabId) {
    if (!tabId || tabId === 'dashTab' || tabId === 'reflectionsTab') return false;

    // الحصول على مصفوفة الصلاحيات الفعالة
    const perms = window.__currentActivePermissions || 
        (typeof currentUser !== 'undefined' && currentUser ? getServantEffectivePermissions(currentUser) : 
        (typeof currentPermission !== 'undefined' ? getDefaultPermissionsForRole(currentPermission) : null));
    if (!perms) return false;

    // إذا كان التبويب هو رادار أمين الخدمة
    if (tabId === 'radarTab') {
        const excuses = perms.excuses || 'none';
        const followup = perms.followup || 'none';
        const pulse = perms.pulse || 'none';
        return (excuses === 'none' && followup === 'none' && pulse === 'none');
    }

    const modId = TAB_TO_MODULE_MAP[tabId];
    if (modId) {
        if ((perms[modId] || 'none') === 'none') {
            return true;
        }
    }

    // فحص إضافي للعناصر المخصصة للأدمن الصارم فقط (.admin-only)
    const tabEl = document.getElementById(tabId);
    if (tabEl && tabEl.classList.contains('admin-only')) {
        const canSeeAffairs = (perms.servants_affairs === 'full');
        const canSeeMgmt = (perms.servants_mgmt === 'full');
        const canSeeSettings = (perms.settings_audit === 'full');
        if (!canSeeAffairs || !canSeeMgmt || !canSeeSettings) {
            return true;
        }
    }

    return false;
}

// 🛡️ صمام الأمان لأقسام رادار أمين الخدمة الداخلية
function isRadarSectionForbiddenForCurrentUser(secKey) {
    const perms = window.__currentActivePermissions || 
        (typeof currentUser !== 'undefined' && currentUser ? getServantEffectivePermissions(currentUser) : 
        (typeof currentPermission !== 'undefined' ? getDefaultPermissionsForRole(currentPermission) : null));
    if (!perms) return false;

    const isPureAdmin = (perms.servants_affairs === 'full' && perms.servants_mgmt === 'full' && perms.settings_audit === 'full');

    if (secKey === 'security') {
        return !isPureAdmin;
    }
    if (secKey === 'excuses') {
        return (perms.excuses || 'none') === 'none';
    }
    if (secKey === 'absence') {
        return (perms.followup || 'none') === 'none';
    }
    if (secKey === 'pulse') {
        return (perms.pulse || 'none') === 'none';
    }
    if (secKey === 'attExport') {
        return (perms.attendance || 'none') === 'none' && (perms.followup || 'none') === 'none';
    }
    return false;
}

// إرجاع أول قسم مسموح به في الرادار للمستخدم
function getFirstAllowedRadarSection() {
    const candidateSections = ['absence', 'excuses', 'pulse', 'confession', 'birthdays', 'attExport'];
    for (const sec of candidateSections) {
        if (!isRadarSectionForbiddenForCurrentUser(sec)) {
            return sec;
        }
    }
    return 'pulse';
}

// 🛡️ تطبيق الصلاحيات التفصيلية الصارمة على واجهة المستخدم بالكامل
function applyGranularPermissions(perms) {
    if (!perms) perms = getDefaultPermissionsForRole('full');
    window.__currentActivePermissions = perms;

    // أمين الخدمة الصارم: يملك شؤون الخدام + إدارة الخدام + الإعدادات
    const canSeeAffairs = (perms.servants_affairs === 'full');
    const canSeeMgmt = (perms.servants_mgmt === 'full');
    const canSeeSettings = (perms.settings_audit === 'full');
    const isPureAdmin = canSeeAffairs && canSeeMgmt && canSeeSettings;

    // 1. التحكم الصارم في ظهور التبويبات الرئيسية وحاوياتها بالكامل (Triple-Lock)
    PERMISSION_MODULES.forEach(mod => {
        const level = perms[mod.id] || 'none';
        const selectors = mod.tabSelectors || [];

        // أ) إخفاء / إظهار أزرار التبويبات في الشريط
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (level === 'none') {
                    el.style.setProperty('display', 'none', 'important');
                    el.classList.add('perm-hidden');
                } else {
                    el.style.removeProperty('display');
                    el.classList.remove('perm-hidden');
                }
            });
        });

        // ب) إخفاء / إظهار حاوية محتوى التبويب نفسه لمنع الوصول المباشر
        const tabEl = document.getElementById(mod.tabId);
        if (tabEl) {
            if (level === 'none') {
                tabEl.style.setProperty('display', 'none', 'important');
                tabEl.classList.remove('active');
                tabEl.classList.add('perm-forbidden');
            } else {
                tabEl.style.removeProperty('display');
                tabEl.classList.remove('perm-forbidden');
            }
        }

        // ج) إخفاء / إظهار التبويبات الفرعية التابعة للموديول
        if (Array.isArray(mod.subTabs)) {
            mod.subTabs.forEach(subTabId => {
                const subEl = document.getElementById(subTabId);
                if (subEl) {
                    if (level === 'none') {
                        subEl.style.setProperty('display', 'none', 'important');
                        subEl.classList.remove('active');
                        subEl.classList.add('perm-forbidden');
                    } else {
                        subEl.style.removeProperty('display');
                        subEl.classList.remove('perm-forbidden');
                    }
                }
            });
        }

        // د) الأقسام الداخلية الخاصة برادار أمين الخدمة
        if (mod.sectionId) {
            const sec = document.getElementById(mod.sectionId);
            if (sec) {
                if (level === 'none') {
                    sec.style.setProperty('display', 'none', 'important');
                } else {
                    sec.style.removeProperty('display');
                }
            }
        }
        if (mod.pillId) {
            const pill = document.getElementById(mod.pillId);
            if (pill) {
                if (level === 'none') {
                    pill.style.setProperty('display', 'none', 'important');
                } else {
                    pill.style.removeProperty('display');
                }
            }
        }
    });

    // 2. رادار أمين الخدمة المدمج (radarTab): إخفاء التبويب بالكامل إذا حُجبت أقسامه الثلاثة الرئيسية
    const excusesNone = (perms.excuses || 'none') === 'none';
    const absenceNone = (perms.followup || 'none') === 'none';
    const pulseNone = (perms.pulse || 'none') === 'none';
    const allRadarNone = excusesNone && absenceNone && pulseNone;

    document.querySelectorAll('.tab-btn[onclick*="radarTab"], a[href*="radarTab"]').forEach(el => {
        if (allRadarNone) {
            el.style.setProperty('display', 'none', 'important');
            el.classList.add('perm-hidden');
        } else {
            el.style.removeProperty('display');
            el.classList.remove('perm-hidden');
        }
    });

    const radarTabEl = document.getElementById('radarTab');
    if (radarTabEl) {
        if (allRadarNone) {
            radarTabEl.style.setProperty('display', 'none', 'important');
            radarTabEl.classList.remove('active');
            radarTabEl.classList.add('perm-forbidden');
        } else {
            radarTabEl.style.removeProperty('display');
            radarTabEl.classList.remove('perm-forbidden');
        }
    }

    // بطاقات الـ KPIs في شريط الرادار العلوي
    const kpiAbsence = document.querySelector('.radar-kpi-card[onclick*="absence"]');
    if (kpiAbsence) kpiAbsence.style.display = absenceNone ? 'none' : '';
    const kpiExcuses = document.querySelector('.radar-kpi-card[onclick*="excuses"]');
    if (kpiExcuses) kpiExcuses.style.display = excusesNone ? 'none' : '';
    const kpiPulseCards = document.querySelectorAll('.radar-kpi-card[onclick*="pulse"]');
    kpiPulseCards.forEach(c => c.style.display = pulseNone ? 'none' : '');

    // قسم الأمان وتصفير الباسورد داخل الرادار (سري للغاية لأمين الخدمة فقط)
    const secSecurityPanel = document.getElementById('radarSec_security');
    if (secSecurityPanel) {
        if (!isPureAdmin) {
            secSecurityPanel.style.setProperty('display', 'none', 'important');
        } else {
            secSecurityPanel.style.removeProperty('display');
        }
    }
    const pillSecurity = document.getElementById('radarPill_security');
    if (pillSecurity) {
        if (!isPureAdmin) {
            pillSecurity.style.setProperty('display', 'none', 'important');
        } else {
            pillSecurity.style.removeProperty('display');
        }
    }

    // 3. التحكم في عناصر الإدارة العامة (.admin-only)
    document.querySelectorAll('.admin-only').forEach(el => {
        if (!isPureAdmin) {
            el.style.setProperty('display', 'none', 'important');
        } else {
            el.style.removeProperty('display');
        }
    });

    // 4. التحكم في أزرار الإجراءات والكتابة داخل كل قسم في حال كان "مشاهدة فقط" (view)
    // أزرار إضافة أو تعديل أو حذف المخدومين
    const membersLevel = perms.members || 'none';
    const memberActionEls = document.querySelectorAll('#btnAddNewMember, #btnImportExcel, #btnExportExcel, .member-edit-btn, .member-del-btn');
    memberActionEls.forEach(btn => {
        btn.style.display = (membersLevel === 'full') ? '' : 'none';
    });

    // أزرار رادار الأعذار (قبول / رفض / حذف / تسجيل يدوي)
    const excusesLevel = perms.excuses || 'none';
    const excuseActionEls = document.querySelectorAll('#btnOpenManualExcuse, .btn-radar-accept, .btn-radar-reject, .btn-radar-cancel');
    excuseActionEls.forEach(btn => {
        btn.style.display = (excusesLevel === 'full') ? '' : 'none';
    });

    // أزرار نبض الاجتماع (إرسال للجروب بالبوت والمشاركة الرسمية حكر على أمين الخدمة)
    const pulseLevel = perms.pulse || 'none';
    const pulseActionEls = document.querySelectorAll('#btnSendPulseWA_bot, #pulseShareActionsBar');
    pulseActionEls.forEach(btn => {
        btn.style.display = (pulseLevel === 'full') ? '' : 'none';
    });

    // أزرار رادار الافتقاد ومتابعة الغائبين (الإرسال الجماعي وطباعة الكشوف)
    const followupLevel = perms.followup || 'none';
    const followupActionEls = document.querySelectorAll('#btnSendWhatsAppAbsenceGroup, #btnPrintAbsenceReport, #btnExportAbsenceExcel');
    followupActionEls.forEach(btn => {
        btn.style.display = (followupLevel === 'full') ? '' : 'none';
    });

    // أزرار حضور الدارسين (مسح الكاميرا ومسح اليوم)
    const attLevel = perms.attendance || 'none';
    const attActionEls = document.querySelectorAll('#scannerControls, #btnStartScanner, #btnClearAttendance');
    attActionEls.forEach(btn => {
        btn.style.display = (attLevel === 'full') ? '' : 'none';
    });

    // 5. إذا كان المستخدم الحالي واقفاً على تبويب محجوب، تحويله فوراً للرئيسية وتطهير عنوان URL
    try {
        const activeTabEl = document.querySelector('.tab-content.active');
        if (activeTabEl && isTabForbiddenForCurrentUser(activeTabEl.id)) {
            console.warn(`⛔ [Permission Enforcer] المستخدم يقف على تبويب محجوب (${activeTabEl.id}) - يتم التحويل الفوري للرئيسية`);
            if (typeof switchTab === 'function') {
                switchTab('dashTab', document.querySelector('.tab-btn[onclick*="dashTab"]'));
            }
        }
    } catch(e) {
        console.warn('Error checking active tab against permissions:', e);
    }
}

// ==========================================
// 🛡️ نافذة تخصيص الصلاحيات التفصيلية (Modal Controller)
// ==========================================

let currentConfiguringServantId = null;

function openServantPermissionsModal(servantId) {
    if (!servants || servants.length === 0) return alert('لا يوجد خدام مسجلون.');
    const targetKey = String(servantId).trim();
    const s = servants.find(x => String(x.id || '').trim() === targetKey || String(x.code || '').trim() === targetKey);
    if (!s) return alert('تعذر العثور على بيانات الخادم!');

    currentConfiguringServantId = s.code || s.id;

    // تعبئة بطاقة الخادم
    const nameEl = document.getElementById('permModal_servantName');
    const metaEl = document.getElementById('permModal_servantMeta');
    const badgeEl = document.getElementById('permModal_currentRoleBadge');

    if (nameEl) nameEl.textContent = s.name;
    if (metaEl) metaEl.textContent = `كود الخادم: ${s.code || s.id} • هاتف: ${s.phone || '-'} • المرحلة: ${s.stage || 'عام'}`;
    if (badgeEl) {
        badgeEl.textContent = s.roleType || (s.permission === 'admin' ? 'أمين خدمة' : 'خادم');
    }

    const currentPerms = getServantEffectivePermissions(s);

    // بناء جدول المصفوفة الصلاحيات (تصميم كامل العرض بعمودين بدون اسكرول عرضي)
    const tbody = document.getElementById('permModal_modulesTbody');
    if (tbody) {
        tbody.innerHTML = PERMISSION_MODULES.map((mod, idx) => {
            const curVal = currentPerms[mod.id] || 'none';
            const isFull = curVal === 'full';
            const isView = curVal === 'view';
            const isNone = curVal === 'none';

            return `
                <tr style="border-bottom:1.5px solid #f1f5f9; background:${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
                    <td style="padding:10px 12px; text-align:right;">
                        <div style="font-weight:900; color:#1e293b; font-size:0.92rem; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid ${mod.icon}" style="color:#0284c7; font-size:1rem; width:18px;"></i>
                            <span>${mod.title}</span>
                            <span style="font-size:0.7rem; font-weight:normal; background:#f1f5f9; color:#475569; padding:2px 7px; border-radius:999px; border:1px solid #e2e8f0;">${mod.category}</span>
                        </div>
                        <div style="font-size:0.76rem; color:#64748b; margin-top:3px; line-height:1.3;">
                            ${mod.desc}
                        </div>
                    </td>
                    <td style="padding:10px 12px; text-align:center;">
                        <div style="display:inline-flex; background:#e2e8f0; border-radius:10px; padding:3px; gap:2px; direction:ltr;">
                            <label style="cursor:pointer; padding:6px 10px; border-radius:8px; font-size:0.75rem; font-weight:800; display:flex; align-items:center; gap:4px; user-select:none; transition:all 0.15s ease; ${isFull ? 'background:#10b981; color:#ffffff;' : 'color:#475569;'}">
                                <input type="radio" name="perm_opt_${mod.id}" value="full" ${isFull ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                <span>🟢 كاملة</span>
                            </label>
                            <label style="cursor:pointer; padding:6px 10px; border-radius:8px; font-size:0.75rem; font-weight:800; display:flex; align-items:center; gap:4px; user-select:none; transition:all 0.15s ease; ${isView ? 'background:#f59e0b; color:#ffffff;' : 'color:#475569;'}">
                                <input type="radio" name="perm_opt_${mod.id}" value="view" ${isView ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                <span>🟡 مشاهدة</span>
                            </label>
                            <label style="cursor:pointer; padding:6px 10px; border-radius:8px; font-size:0.75rem; font-weight:800; display:flex; align-items:center; gap:4px; user-select:none; transition:all 0.15s ease; ${isNone ? 'background:#ef4444; color:#ffffff;' : 'color:#475569;'}">
                                <input type="radio" name="perm_opt_${mod.id}" value="none" ${isNone ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                <span>🔴 إخفاء</span>
                            </label>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    const modal = document.getElementById('servantPermissionsModal');
    if (modal) modal.style.display = 'flex';
}

function closeServantPermissionsModal() {
    const modal = document.getElementById('servantPermissionsModal');
    if (modal) modal.style.display = 'none';
    currentConfiguringServantId = null;
}

function onPermRadioChange(radio) {
    const container = radio.closest('div');
    if (!container) return;
    container.querySelectorAll('label').forEach(lbl => {
        lbl.style.background = 'transparent';
        lbl.style.color = '#475569';
    });
    const parentLabel = radio.closest('label');
    if (parentLabel) {
        if (radio.value === 'full') {
            parentLabel.style.background = '#10b981';
            parentLabel.style.color = '#ffffff';
        } else if (radio.value === 'view') {
            parentLabel.style.background = '#f59e0b';
            parentLabel.style.color = '#ffffff';
        } else {
            parentLabel.style.background = '#ef4444';
            parentLabel.style.color = '#ffffff';
        }
    }
}

function applyPermissionPresetToModal(presetType) {
    const presetPerms = getDefaultPermissionsForRole(presetType);
    PERMISSION_MODULES.forEach(mod => {
        const val = presetPerms[mod.id] || 'none';
        const radio = document.querySelector(`input[name="perm_opt_${mod.id}"][value="${val}"]`);
        if (radio) {
            radio.checked = true;
            onPermRadioChange(radio);
        }
    });
    if (typeof showToast === 'function') {
        showToast(`⚡ تم تطبيق القالب المسبق [${presetType}] على الخيارات أدناه!`);
    }
}

async function saveServantPermissions() {
    if (!currentConfiguringServantId) return;
    const targetKey = String(currentConfiguringServantId).trim();
    const s = servants.find(x => String(x.id || '').trim() === targetKey || String(x.code || '').trim() === targetKey);
    if (!s) return alert('خطأ: تعذر العثور على سجل الخادم!');

    const newPerms = {};
    PERMISSION_MODULES.forEach(mod => {
        const checked = document.querySelector(`input[name="perm_opt_${mod.id}"]:checked`);
        newPerms[mod.id] = checked ? checked.value : 'none';
    });

    s.customPermissions = newPerms;
    s.permission = 'custom';

    // حفظ محلي وسحابي
    if (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.SERVANTS) {
        localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));
    }

    if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
        try {
            await fsdb.collection('servants').doc(String(s.code || s.id)).set(s, { merge: true });
        } catch(e) {
            console.warn('Cloud sync error on custom permissions:', e);
        }
    }

    if (typeof logActivity === 'function') {
        logActivity('تخصيص صلاحيات تفصيلية لخادم', s.name, `تم تخصيص 10 صلاحيات دقيقة للكود [${s.code || s.id}]`);
    }

    if (typeof renderServantsTable === 'function') renderServantsTable();

    // 🌟 إذا كان الخادم المعدّل هو المستخدم الحالي أو المعاين حياً، تطبيق الصلاحيات فوراً على الشاشة!
    const isCurrentActiveServant = (typeof currentUser !== 'undefined' && currentUser && 
        (String(currentUser.id) === targetKey || String(currentUser.code) === targetKey));
    const isSimulatedServant = (window.__simulatedServant && 
        (String(window.__simulatedServant.id) === targetKey || String(window.__simulatedServant.code) === targetKey));

    if (isCurrentActiveServant || isSimulatedServant) {
        applyGranularPermissions(newPerms);
    }

    closeServantPermissionsModal();

    if (typeof showToast === 'function') {
        showToast(`✅ تم حفظ وتطبيق الصلاحيات التفصيلية للخادم [${s.name}] بنجاح!`);
    } else {
        alert(`✅ تم حفظ وتطبيق الصلاحيات التفصيلية للخادم [${s.name}] بنجاح!`);
    }
}

// ==========================================
// 👁️ وضع المعاينة الحية لواجهة الخادم (Live Preview Mode)
// ==========================================

function previewDashboardAsServant(servantId) {
    if (!servants || servants.length === 0) return alert('لا يوجد خدام.');
    const targetKey = String(servantId || currentConfiguringServantId).trim();
    const s = servants.find(x => String(x.id || '').trim() === targetKey || String(x.code || '').trim() === targetKey);
    if (!s) return alert('تعذر العثور على بيانات الخادم للمعاينة!');

    // حفظ الجلسة الأصلية للأدمن
    if (!window.__realAdminSession) {
        window.__realAdminSession = {
            permission: (typeof currentPermission !== 'undefined') ? currentPermission : 'admin',
            user: (typeof currentUser !== 'undefined') ? currentUser : null
        };
    }

    window.__simulatedServant = s;
    const effectivePerms = getServantEffectivePermissions(s);

    // إغلاق أي نافذة مفتوحة
    closeServantPermissionsModal();
    if (typeof closeEditServantModal === 'function') closeEditServantModal();

    // إنشاء وإظهار شريط المعاينة العلوي الثابت
    let bar = document.getElementById('servantPreviewFloatingBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'servantPreviewFloatingBar';
        document.body.appendChild(bar);
    }

    bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #ffffff;
        border-bottom: 2.5px solid #f59e0b;
        box-shadow: 0 4px 20px rgba(0,0,0,0.45);
        padding: 10px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        direction: rtl;
        font-family: inherit;
    `;

    bar.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:50%; background:#f59e0b; color:#0f172a; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900;">
                👁️
            </div>
            <div>
                <div style="font-weight:900; font-size:0.92rem; color:#fef08a;">
                    أنت الآن في وضع المعاينة الحية بصلاحيات الخادم: [${s.name}]
                </div>
                <div style="font-size:0.75rem; color:#94a3b8;">
                    كود: ${s.code || s.id} • المرحلة: ${s.stage || 'عام'} • نوع الصلاحية: ${s.permission === 'custom' ? 'مخصصة بدقة 🎯' : (s.permission || 'افتراضية')}
                </div>
            </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" onclick="openServantPermissionsModal('${s.code || s.id}')" style="background:#0284c7; color:#fff; border:none; padding:7px 14px; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-sliders"></i> تعديل الصلاحيات
            </button>
            <button type="button" onclick="exitServantPreviewMode()" style="background:#ef4444; color:#fff; border:none; padding:7px 16px; border-radius:8px; font-weight:800; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(239,68,68,0.4);">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> إنهاء المعاينة والرجوع لأمين الخدمة
            </button>
        </div>
    `;

    document.body.style.paddingTop = '62px';

    // تطبيق الصلاحيات فوراً
    applyGranularPermissions(effectivePerms);

    // التحويل للتبويب الرئيسي لرؤية التأثير
    if (typeof switchTab === 'function') {
        const homeBtn = document.querySelector('.tab-btn[onclick*="dashTab"]');
        switchTab('dashTab', homeBtn);
    }

    if (typeof showToast === 'function') {
        showToast(`👁️ تم تفعيل وضع المعاينة الحية للخادم [${s.name}]! تصفح المنظومة الآن لرؤية الواجهة بصلاحياته.`);
    }
}

function exitServantPreviewMode() {
    const bar = document.getElementById('servantPreviewFloatingBar');
    if (bar) bar.remove();
    document.body.style.paddingTop = '';

    window.__simulatedServant = null;

    // استعادة صلاحيات أمين الخدمة الحقيقية
    if (window.__realAdminSession) {
        if (typeof currentPermission !== 'undefined') {
            currentPermission = window.__realAdminSession.permission;
        }
    }

    // إعادة تطبيق الصلاحيات الكاملة لأمين الخدمة
    applyGranularPermissions(getDefaultPermissionsForRole('admin'));

    if (typeof updateRoleUI === 'function') {
        updateRoleUI();
    }

    if (typeof showToast === 'function') {
        showToast('✅ تم إنهاء وضع المعاينة والرجوع لكامل صلاحيات أمين الخدمة 🕊️');
    }
}

// تصدير للنافذة العامة
if (typeof window !== 'undefined') {
    window.PERMISSION_MODULES = PERMISSION_MODULES;
    window.TAB_TO_MODULE_MAP = TAB_TO_MODULE_MAP;
    window.getDefaultPermissionsForRole = getDefaultPermissionsForRole;
    window.getServantEffectivePermissions = getServantEffectivePermissions;
    window.isTabForbiddenForCurrentUser = isTabForbiddenForCurrentUser;
    window.isRadarSectionForbiddenForCurrentUser = isRadarSectionForbiddenForCurrentUser;
    window.getFirstAllowedRadarSection = getFirstAllowedRadarSection;
    window.applyGranularPermissions = applyGranularPermissions;
    window.openServantPermissionsModal = openServantPermissionsModal;
    window.closeServantPermissionsModal = closeServantPermissionsModal;
    window.onPermRadioChange = onPermRadioChange;
    window.applyPermissionPresetToModal = applyPermissionPresetToModal;
    window.saveServantPermissions = saveServantPermissions;
    window.previewDashboardAsServant = previewDashboardAsServant;
    window.exitServantPreviewMode = exitServantPreviewMode;

    // تطبيق تلقائي أولي عند اكتمال جاهزية الـ DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const userPerms = (typeof currentUser !== 'undefined' && currentUser) ? 
                getServantEffectivePermissions(currentUser) : 
                getDefaultPermissionsForRole(typeof currentPermission !== 'undefined' ? currentPermission : 'full');
            applyGranularPermissions(userPerms);
        });
    } else {
        const userPerms = (typeof currentUser !== 'undefined' && currentUser) ? 
            getServantEffectivePermissions(currentUser) : 
            getDefaultPermissionsForRole(typeof currentPermission !== 'undefined' ? currentPermission : 'full');
        applyGranularPermissions(userPerms);
    }
}
