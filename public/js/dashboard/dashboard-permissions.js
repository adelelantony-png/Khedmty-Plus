/**
 * Khedmty-Plus - Granular Servant Permissions & Live Preview System
 * نظام تفصيل وتخصيص صلاحيات الخدام ومعاينة لوحة التحكم الحية
 * 
 * يتيح لأمين الخدمة:
 * 1. ضبط مستوى الوصول (إدارة كاملة / مشاهدة فقط / إخفاء تام) لكل خاصية وقسم في المشروع.
 * 2. تخصيص صلاحيات "شبه أدمن" دون كشف شؤون الخدام وتحضيراتهم وحضورهم.
 * 3. معاينة لوحة التحكم حياً (Live Preview As) كما يراها الخادم تماماً.
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
        tabSelectors: ['.tab-btn[onclick*="membersTab"]', 'a[href*="membersTab"]'],
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
        tabSelectors: ['.tab-btn[onclick*="servantsAttendanceTab"]', 'a[href*="servantsAttendanceTab"]'],
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
        tabSelectors: [
            '.tab-btn[onclick*="planTab"]',
            '.tab-btn[onclick*="coursesTab"]',
            '.tab-btn[onclick*="materialsTab"]'
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
        tabSelectors: [
            '.tab-btn[onclick*="settingsTab"]',
            '.tab-btn[onclick*="auditTab"]',
            '.tab-btn[onclick*="rolloverTab"]',
            '.tab-btn[onclick*="cloudUsageTab"]'
        ],
        viewDesc: 'استعراض سجل الرقابة فقط دون الوصول للإعدادات أو توكنات الأمان',
        fullDesc: 'تحكم كامل في إعدادات النظام + إدارة توكنات الحماية + النسخ الاحتياطي'
    }
];

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
    // خادم عادي افتراضي (full)
    return {
        attendance: 'full',
        members: 'full',
        excuses: 'full',
        followup: 'full',
        pulse: 'full',
        servants_affairs: 'none',
        servants_mgmt: 'none',
        plan: 'view',
        broadcast: 'none',
        settings_audit: 'none'
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

// تطبيق الصلاحيات التفصيلية على واجهة المستخدم بالكامل
function applyGranularPermissions(perms) {
    if (!perms) perms = getDefaultPermissionsForRole('full');

    // 1. التحكم في ظهور التبويبات الرئيسية
    PERMISSION_MODULES.forEach(mod => {
        const level = perms[mod.id] || 'none';
        const selectors = mod.tabSelectors || [];

        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (level === 'none') {
                    el.style.setProperty('display', 'none', 'important');
                } else {
                    el.style.removeProperty('display');
                }
            });
        });

        // الأقسام الداخلية الخاصة برادار أمين الخدمة
        if (mod.sectionId) {
            const sec = document.getElementById(mod.sectionId);
            if (sec) {
                if (level === 'none') {
                    sec.style.display = 'none';
                } else {
                    sec.style.display = '';
                }
            }
        }
    });

    // 2. التحكم في صلاحيات شؤون الخدام وتحضيراتهم (خاص جداً بأمين الخدمة)
    const canSeeServantsAffairs = (perms.servants_affairs === 'full');
    const canSeeServantsMgmt = (perms.servants_mgmt === 'full');
    const isPureAdmin = canSeeServantsAffairs && canSeeServantsMgmt;

    document.querySelectorAll('.admin-only').forEach(el => {
        // إذا كان العنصر يخص الخدام ويفتقر للصلاحية يخفيه
        el.style.display = isPureAdmin ? '' : 'none';
    });

    // 3. التحكم في أزرار الإجراءات والكتابة داخل كل قسم في حال كان "مشاهدة فقط" (view)
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

    // أزرار نبض الاجتماع (إرسال للجروب بالبوت والمشاركة)
    const pulseLevel = perms.pulse || 'none';
    const pulseActionEls = document.querySelectorAll('#btnSendPulseWA_bot, #pulseShareActionsBar');
    pulseActionEls.forEach(btn => {
        btn.style.display = (pulseLevel !== 'none') ? '' : 'none';
    });

    // أزرار حضور الدارسين (مسح الكاميرا ومسح اليوم)
    const attLevel = perms.attendance || 'none';
    const attActionEls = document.querySelectorAll('#scannerControls, #btnStartScanner, #btnClearAttendance');
    attActionEls.forEach(btn => {
        btn.style.display = (attLevel === 'full') ? '' : 'none';
    });

    // 4. إذا كان المستخدم الحالي واقفاً على تبويب محجوب، تحويله تلقائياً للرئيسية
    try {
        const activeTabBtn = document.querySelector('.tab-btn.active');
        if (activeTabBtn && window.getComputedStyle(activeTabBtn).display === 'none') {
            if (typeof switchTab === 'function') {
                switchTab('dashTab', document.querySelector('.tab-btn[onclick*="dashTab"]'));
            }
        }
    } catch(e) {}
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

    // بناء جدول المصفوفة الصلاحيات
    const tbody = document.getElementById('permModal_modulesTbody');
    if (tbody) {
        tbody.innerHTML = PERMISSION_MODULES.map((mod, idx) => {
            const curVal = currentPerms[mod.id] || 'none';
            const isFull = curVal === 'full';
            const isView = curVal === 'view';
            const isNone = curVal === 'none';

            return `
                <tr style="border-bottom:1.5px solid #f1f5f9; background:${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
                    <td style="padding:12px 14px; text-align:right;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:36px; height:36px; border-radius:10px; background:#eff6ff; color:#1d4ed8; display:flex; align-items:center; justify-content:center; font-size:16px;">
                                <i class="fa-solid ${mod.icon}"></i>
                            </div>
                            <div>
                                <strong style="color:#0f172a; font-size:0.9rem;">${mod.title}</strong>
                                <span style="font-size:0.72rem; color:#64748b; display:block; margin-top:2px;">${mod.desc}</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding:12px 10px; text-align:center;">
                        <span style="font-size:0.75rem; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:6px; font-weight:600;">
                            ${mod.category}
                        </span>
                    </td>
                    <td style="padding:12px 14px; text-align:center;">
                        <div style="display:inline-flex; background:#f1f5f9; padding:3px; border-radius:8px; border:1px solid #cbd5e1; gap:2px;">
                            <label style="margin:0; padding:5px 12px; border-radius:6px; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all 0.15s; background:${isFull ? '#10b981' : 'transparent'}; color:${isFull ? '#ffffff' : '#475569'};">
                                <input type="radio" name="perm_opt_${mod.id}" value="full" ${isFull ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                🟢 إدارة كاملة
                            </label>
                            <label style="margin:0; padding:5px 12px; border-radius:6px; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all 0.15s; background:${isView ? '#f59e0b' : 'transparent'}; color:${isView ? '#ffffff' : '#475569'};">
                                <input type="radio" name="perm_opt_${mod.id}" value="view" ${isView ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                🟡 مشاهدة فقط
                            </label>
                            <label style="margin:0; padding:5px 12px; border-radius:6px; font-size:0.78rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all 0.15s; background:${isNone ? '#ef4444' : 'transparent'}; color:${isNone ? '#ffffff' : '#475569'};">
                                <input type="radio" name="perm_opt_${mod.id}" value="none" ${isNone ? 'checked' : ''} onchange="onPermRadioChange(this)" style="display:none;">
                                🔴 إخفاء تام
                            </label>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    const modal = document.getElementById('servantPermissionsModal');
    if (modal) {
        modal.style.display = 'flex';
    }
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
        z-index: 9999999;
        background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%);
        color: #ffffff;
        padding: 10px 18px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        font-family: inherit;
        direction: rtl;
        border-bottom: 2px solid #fde047;
    `;

    bar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #fde047; color: #854d0e; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                👁️
            </div>
            <div>
                <div style="font-size: 0.95rem; font-weight: 900;">
                    أنت الآن في وضع <span style="color: #fde047; text-decoration: underline;">المعاينة الحية</span> لواجهة الخادم: <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 6px;">${s.name}</span>
                </div>
                <div style="font-size: 0.74rem; color: #cbd5e1; margin-top: 2px;">
                    كود: <strong>${s.code || s.id}</strong> • الصفة: <strong>${s.roleType || 'خادم'}</strong> • تظهر لك المنظومة بالكامل بالضبط كما يراها هذا الخادم
                </div>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" onclick="openServantPermissionsModal('${s.code || s.id}')" style="background: #ffffff; color: #1e3a8a; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <i class="fa-solid fa-sliders"></i> ضبط وتعديل الصلاحيات ⚙️
            </button>
            <button type="button" onclick="exitServantPreviewMode()" style="background: #dc2626; color: #ffffff; border: none; padding: 6px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(220,38,38,0.4);">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> 🔴 إنهاء المعاينة والرجوع لأمين الخدمة
            </button>
        </div>
    `;

    document.body.style.paddingTop = '62px';

    // تطبيق الصلاحيات
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
    window.getDefaultPermissionsForRole = getDefaultPermissionsForRole;
    window.getServantEffectivePermissions = getServantEffectivePermissions;
    window.applyGranularPermissions = applyGranularPermissions;
    window.openServantPermissionsModal = openServantPermissionsModal;
    window.closeServantPermissionsModal = closeServantPermissionsModal;
    window.onPermRadioChange = onPermRadioChange;
    window.applyPermissionPresetToModal = applyPermissionPresetToModal;
    window.saveServantPermissions = saveServantPermissions;
    window.previewDashboardAsServant = previewDashboardAsServant;
    window.exitServantPreviewMode = exitServantPreviewMode;
}
