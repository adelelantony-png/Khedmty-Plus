/**
 * Khedmty-Plus Dashboard - Servants Management Module
 * Extracted for offline PWA performance & modular maintainability.
 */

// ==========================================

// 16. نظام التاريخ المفتوح والتحكم الزمني لحضور الخدام

// ==========================================

let activeServantAttendanceDate = (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) ? activeSelectedDate : (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));

function getActiveServantDate() {
    if (typeof activeServantAttendanceDate !== 'undefined' && activeServantAttendanceDate) {
        return activeServantAttendanceDate;
    }
    if (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) {
        return activeSelectedDate;
    }
    return (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));
}

function formatServantArabicDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    } catch(e) {}
    return dateStr;
}

function changeServantAttendanceDate(newDate) {
    if (!newDate) return;
    activeServantAttendanceDate = newDate;
    if (typeof servantsAttendance !== 'undefined' && !servantsAttendance[newDate]) {
        servantsAttendance[newDate] = [];
    }

    // استحضار سحابي مباشر إذا كانت السحابة مفعلة وغير موجود محلياً
    if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
        if (!servantsAttendance[newDate] || servantsAttendance[newDate].length === 0) {
            fsdb.collection('servants_attendance').doc(newDate).get().then(doc => {
                if (doc.exists) {
                    const list = (doc.data() || {}).list || [];
                    if (list.length > 0) {
                        servantsAttendance[newDate] = list;
                        localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));
                        renderServantsAttendanceTable();
                        if (typeof showToast === 'function') showToast(`☁️ تم جلب حضور الخدام ليوم (${newDate}) من السحابة`);
                    }
                }
            }).catch(e => console.warn('Could not fetch cloud servant attendance:', e));
        }
    }

    renderServantsAttendanceTable();
    if (typeof showToast === 'function') {
        showToast(`📅 تم فتح كشف حضور الخدام لتاريخ: ${newDate}`);
    }
}

function shiftServantAttendanceDate(days) {
    const cur = getActiveServantDate();
    try {
        const parts = cur.split('-');
        const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dt.setDate(dt.getDate() + days);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        changeServantAttendanceDate(`${y}-${m}-${d}`);
    } catch(e) {
        console.error('shiftServantAttendanceDate error:', e);
    }
}

function setServantAttendanceToday() {
    const t = (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));
    changeServantAttendanceDate(t);
}

function syncWithStudentAttendanceDate() {
    if (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) {
        changeServantAttendanceDate(activeSelectedDate);
    } else {
        setServantAttendanceToday();
    }
}

function renderServantsAttendanceTable() {

const tbody = document.querySelector('#servantsAttendanceTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

const curDate = getActiveServantDate();

// مزامنة عناصر واجهة التاريخ النشط
const dateInput = document.getElementById('servantAttendanceDatePicker');
if (dateInput && dateInput.value !== curDate) {
    dateInput.value = curDate;
}
const dateLabel = document.getElementById('servantAttendanceSelectedDateLabel');
if (dateLabel) {
    dateLabel.textContent = formatServantArabicDate(curDate);
}
const tableDateHeader = document.getElementById('servantTableDateHeader');
if (tableDateHeader) {
    tableDateHeader.textContent = `حالة يوم (${curDate})`;
}
const clearBtnDate = document.getElementById('btnClearServantAttendanceLabel');
if (clearBtnDate) {
    clearBtnDate.textContent = `مسح حضور يوم (${curDate})`;
}

const elStatCount = document.getElementById('statServantsCount');

if (elStatCount) elStatCount.innerText = servants.length;

const elTodayCount = document.getElementById('statServantsToday');

if (elTodayCount) elTodayCount.innerText = (servantsAttendance[curDate] || []).length;

const elDateSubtitle = document.getElementById('statServantsDateSubtitle');
if (elDateSubtitle) {
    elDateSubtitle.innerText = `بتاريخ: ${curDate}`;
}

let allVisitationsList = [];

members.forEach(m => {

if (m.visitations && Array.isArray(m.visitations)) {

m.visitations.forEach(v => {

let sName = v.by || 'غير محدد';

allVisitationsList.push({ date: v.date, servant: sName, memberName: m.name, text: v.text });

});

}

});

const elTotalVis = document.getElementById('statTotalVisitations');

if (elTotalVis) elTotalVis.innerText = allVisitationsList.length;

if (servants.length === 0) {

tbody.innerHTML = '<tr><td colspan="9" class="empty-state">لا يوجد خدام مسجلون.</td></tr>';

}

servants.forEach(s => {

let present = (servantsAttendance[curDate] || []).find(x => x.id.toString() === s.id.toString());

let visits = allVisitationsList.filter(v => {

let vBy = (v.servant || '').trim().toLowerCase();

let sName = (s.name || '').trim().toLowerCase();

return vBy === sName || (s.role === 'admin' && (vBy.includes('أمين الخدمة') || vBy === 'admin'));

}).length;

let todayEvent = masterPlan.find(l => (l.responsible || '').trim().toLowerCase() === s.name.trim().toLowerCase() && l.date === curDate);

let planInfo = todayEvent ? `<span style="color:#b45309; font-weight:800; font-size:0.8rem;">📌 ${todayEvent.type}: ${todayEvent.title}</span>` : '<span style="color:#94a3b8; font-size:0.8rem;">لا توجد تكليفات اليوم</span>';

let actionBtn = present
? `<button type="button" class="btn-mini" onclick="cancelServantAttendance('${s.id}', '${curDate}')" style="background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px; padding: 4px 10px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">إلغاء الحضور</button>`
: `<button type="button" class="btn-mini" onclick="manualMarkServant('${s.id}', '${curDate}')" style="background: #0C2461; color: #ffffff; border: 1px solid #0C2461; border-radius: 6px; padding: 4px 12px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">تسجيل حضور</button>`;

let commit = calculateServantCommitment(s.id);

let commitBadge = `
<div style="font-weight:800; font-size:11px; color:#0C2461;">${commit.percent}% (${commit.attended}/${commit.total})</div>
<div class="progress-bar-container" style="background:#e2e8f0; border-radius:999px; height:6px; overflow:hidden; margin-top:3px;"><div class="progress-bar" style="width:${commit.percent}%; height:100%; border-radius:999px; background:${commit.isCommitted ? '#059669' : '#d97706'}"></div></div>
`;

let statusBadge = present 
? `<span style="background: rgba(16, 185, 129, 0.12); color: #047857; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 999px; font-weight: 800; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-check"></i> حاضر (${present.time})</span>`
: '<span style="background: rgba(100, 116, 139, 0.1); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.2); padding: 3px 10px; border-radius: 999px; font-weight: 700; font-size: 0.8rem;">لم يسجل</span>';

let visitsBadge = `<span style="background: rgba(12, 36, 97, 0.08); color: #0C2461; border: 1px solid rgba(12, 36, 97, 0.18); padding: 3px 9px; border-radius: 6px; font-weight: 800; font-size: 0.8rem;">${visits} افتقاد</span>`;

let tr = document.createElement('tr');

tr.innerHTML = `
<td data-label="كود الخادم">${s.code || s.id}</td>
<td data-label="الاسم"><strong>${s.name}</strong></td>
<td data-label="الهاتف">${s.phone}</td>
<td data-label="حالة اليوم">${statusBadge}</td>
<td data-label="النسبة السنوية">${commitBadge}</td>
<td data-label="تكليف اليوم">${planInfo}</td>
<td data-label="الافتقادات">${visitsBadge}</td>
<td data-label="إجراء" class="can-edit">${actionBtn}</td>
`;

tbody.appendChild(tr);

});

const recentTbody = document.querySelector('#recentVisitationsTable tbody');

if (recentTbody) {

recentTbody.innerHTML = '';

if (allVisitationsList.length === 0) {

recentTbody.innerHTML = '<tr><td colspan="4" class="empty-state">لم يتم تسجيل أي افتقادات حتى الآن.</td></tr>';

} else {

allVisitationsList.slice(0, 10).forEach(v => {

let tr = document.createElement('tr');

tr.innerHTML = `<td data-label="التاريخ">${escapeHtml(v.date)}</td><td data-label="الخادم المسؤول"><strong>${escapeHtml(v.servant)}</strong></td><td data-label="المخدوم المفتقد" style="color:var(--primary); font-weight:bold;">${escapeHtml(v.memberName)}</td><td data-label="الملاحظات">${escapeHtml(v.text)}</td>`;

recentTbody.appendChild(tr);

});

}

}

updateRoleUI();

}

function calculateServantCommitment(servantId) {

let totalSessions = Object.keys(attendanceRecord).length;

if (totalSessions === 0) return { percent: 0, attended: 0, total: 0, isCommitted: false };

let attendedSessions = 0;

Object.keys(servantsAttendance).forEach(d => {

let present = (servantsAttendance[d] || []).some(s => s && s.id && s.id.toString() === servantId.toString());

if (present) attendedSessions++;

});

let percent = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

return { percent, attended: attendedSessions, total: totalSessions, isCommitted: percent >= 75 };

}

// ==========================================

// 17. الجلسات الحية

// ==========================================

function registerActiveSession() {

if (!currentUser || !isFirebaseActive || !fsdb) return;

let deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "هاتف محمول 📱" : "كمبيوتر / لابتوب 💻";

let servantKey = (currentUser.id || currentUser.phone || '').toString().replace(/\D/g, '') || '1001';

let sessionData = {

sessionId: myCurrentSessionId,

servantName: currentUser.name,

role: currentUser.role || 'servant',

loginTime: new Date().toLocaleTimeString('ar-EG'),

loginDate: today,

device: deviceType,

status: "active"

};

let sessRef = fsdb.collection('active_sessions').doc(servantKey);

sessRef.set(sessionData).catch(() => {});

sessRef.onSnapshot(snap => {

let val = snap.exists ? snap.data() : null;

if (val && val.status === "terminated") {

sessRef.delete().catch(() => {});

localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);

sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);

currentUser = null;

alert("⚠️ تم إنهاء جلستك وتسجيل خروجك من قِبل أمين الخدمة العام!");

location.reload();

}

}, err => console.warn('تعذر متابعة حالة الجلسة:', err.code || err.message));

}

function renderCurrentDeviceFallback(tbody) {
    if (!tbody) return;
    const curName = (typeof currentUser === 'object' && currentUser && currentUser.name) ? currentUser.name : 'أمين الخدمة (أدمن)';
    tbody.innerHTML = `
        <tr>
            <td data-label="اسم الخادم"><strong>${escapeHtml(curName)}</strong> <span style="color:green; font-size:11px;">(أنت - هذا الجهاز)</span></td>
            <td data-label="نوع الجهاز">${escapeHtml(navigator.userAgent.includes('Mobile') ? 'هاتف محمول 📱' : 'كمبيوتر 💻')}</td>
            <td data-label="وقت الدخول" dir="ltr">${typeof today === 'string' ? today : ''} ${new Date().toLocaleTimeString('ar-EG')}</td>
            <td data-label="الحالة"><span class="role-badge" style="background:var(--success);">متصل الآن 🟢</span></td>
            <td data-label="إجراء الأدمن"><span style="color:#888; font-size:11px;">جلستك الحالية</span></td>
        </tr>
    `;
}

function listenToActiveSessions() {
    const tbody = document.getElementById('activeSessionsTbody');
    if (!tbody) return;

    if (!isFirebaseActive || !fsdb) {
        renderCurrentDeviceFallback(tbody);
        return;
    }

    try {
        fsdb.collection('active_sessions').onSnapshot(snap => {
            if (!tbody) return;
            tbody.innerHTML = '';

            if (snap.empty) {
                renderCurrentDeviceFallback(tbody);
                return;
            }

            snap.forEach(doc => {
                let key = doc.id, sess = doc.data() || {};
                let isMe = (sess.sessionId === myCurrentSessionId);
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="اسم الخادم"><strong>${escapeHtml(sess.servantName || 'خادم')}</strong> ${isMe ? '<span style="color:green; font-size:11px;">(أنت)</span>' : ''}</td>
                    <td data-label="نوع الجهاز">${escapeHtml(sess.device || 'جهاز متصل')}</td>
                    <td data-label="وقت الدخول" dir="ltr">${escapeHtml(sess.loginDate || '')} ${escapeHtml(sess.loginTime || '')}</td>
                    <td data-label="الحالة"><span class="role-badge" style="background:var(--success);">متصل الآن 🟢</span></td>
                    <td data-label="إجراء الأدمن">${isMe ? '<span style="color:#888; font-size:11px;">جلستك الحالية</span>' : `<button class="btn-mini btn-danger" onclick="terminateSession('${key}', '${escapeHtml(sess.servantName || '')}')">طرد الجهاز ❌</button>`}</td>
                `;
                tbody.appendChild(tr);
            });
        }, err => {
            console.warn('تعذر متابعة الجلسات النشطة:', err.code || err.message);
            renderCurrentDeviceFallback(tbody);
        });
    } catch(e) {
        renderCurrentDeviceFallback(tbody);
    }
}

function terminateSession(servantKey, servantName) {

if (confirm(`هل أنت متأكد من رغبتك في طرد جهاز (${servantName}) وإخراجه فوراً؟`)) {

fsdb.collection('active_sessions').doc(servantKey).update({ status: "terminated" }).then(() => {

logActivity("طرد جلسة خادم", servantName, "إنهاء اتصال عن بُعد");

showToast(`✅ تم إرسال أمر الطرد لـ ${servantName}`);

}).catch(() => showToast("❌ تعذر إرسال أمر الطرد", true));

}

}

async function terminateAllSessions() {

let pwd = prompt("أدخل كلمة مرور الأدمن لتأكيد طرد جميع الأجهزة المسجلة:");

if (!pwd) return;

let pwdHash = await hashPassword(pwd);

if (isAdminPasswordValid(pwdHash, pwd)) {

fsdb.collection('active_sessions').get().then(snap => {

snap.forEach(doc => {

if (doc.data().sessionId !== myCurrentSessionId) {

fsdb.collection('active_sessions').doc(doc.id).update({ status: "terminated" }).catch(() => {});

}

});

logActivity("طرد شامل", "جميع الجلسات", "طرد جميع الأجهزة المتصلة");

alert("✅ تم طرد جميع الأجهزة المتصلة بالمنظومة فوراً!");

}).catch(() => alert("❌ تعذر الوصول لقائمة الجلسات!"));

} else {

alert("❌ كلمة المرور غير صحيحة!");

}

}

// ==========================================

// 18. رابط التهيئة التلقائي

// ==========================================

function shareAutoSetupWhatsAppLink() {

let savedConfig = localStorage.getItem(STORAGE_KEYS.FB_CONFIG);

if (!savedConfig) {

return alert("⚠️ يرجى حفظ وتأمين السحابة على جهازك أولاً من نافذة الإعدادات قبل توليد الرابط!");

}

// ملاحظة أمنية: هذا الرابط يحتوي فقط على إعدادات الاتصال بمشروع Firebase (cfg)،

// وهي بيانات غير سرية أصلاً (تظهر في كود أي تطبيق Firebase عادي).

// لا يحتوي على أي إيميل أو كلمة مرور للحساب السحابي المشترك.

// كل خادم يفتح هذا الرابط سيظل مطالباً بتسجيل الدخول بشاشة الدخول العادية (اسمه وهاتفه)،

// وحينها فقط يتم ربطه تلقائياً بحسابه السحابي الفردي إن كان قد رُبط من قبل من تبويب "إدارة الخدام".

let payload = { cfg: JSON.parse(savedConfig) };

let encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

let fullSetupUrl = `${window.location.origin}${window.location.pathname}#setup=${encodedData}`;

let msg = `سلام ونعمة يا خادم،\nاضغط على الرابط التالي لتفعيل تطبيق "خدمتي برو" على هاتفك، ثم سجّل دخولك باسمك ورقم هاتفك المعتاد:\n\n${fullSetupUrl}`;

window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');

}

// ==========================================

// 20. إدارة الخدام

// ==========================================

function renderServantsTable() {

const tbody = document.querySelector('#servantsTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

if (servants.length === 0) {

tbody.innerHTML = '<tr><td colspan="9" class="empty-state">لا يوجد خدام مسجلون.</td></tr>';

}

let seenKeys = new Set();

servants.forEach(s => {

let key = (s.code || s.id || '').toString().trim();

if (key && seenKeys.has(key)) return;

if (key) seenKeys.add(key);

let cleanDob = (s.dob || '').toString().trim().split(' ')[0].split('T')[0];

let cleanPhone = (s.phone || '').toString().trim().replace(/\.0$/, '');

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="كود الخادم">${escapeHtml(s.code) || escapeHtml(s.id)}</td>

<td data-label="الاسم"><strong>${escapeHtml(s.name)}</strong> ${s.password ? `<span class="badge" style="background:#fef9c3; color:#854d0e; font-size:10px; margin-right:4px; font-weight:normal;" title="كلمة المرور: ${escapeHtml(s.password)}">🔑 مخصصة</span>` : ''}</td>

<td data-label="الهاتف">${escapeHtml(cleanPhone)}</td>

<td data-label="تاريخ الميلاد">${escapeHtml(cleanDob) || '-'}</td>

<td data-label="الصلاحية">
    ${s.customPermissions ? `<span class="badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid #d8b4fe; font-size:11px; font-weight:800; display:inline-flex; align-items:center; gap:4px;" title="صلاحيات مخصصة بالتفصيل لكل أوبشن">⚙️ مخصص دقيق</span>` : `<span class="role-badge" style="background:var(--accent);">${escapeHtml(s.permission || s.role || 'خادم')}</span>`}
</td>

<td data-label="الحساب السحابي">${s.cloudUid

? '<span style="color:var(--success); font-weight:bold; font-size:11px;">مربوط ✅</span>'

: `<button class="btn-mini btn-purple" onclick="linkServantToCloudAuth('${s.id}')">ربط سحابي 🔐</button>`}</td>

<td data-label="تعديل" class="admin-only" style="white-space:nowrap;">
    <button class="btn-mini btn-warning" onclick="openEditServantModal('${escapeHtml(s.code || s.id)}')" title="تعديل البيانات الأساسية">تعديل</button>
    <button class="btn-mini" style="background:#4f46e5; color:#ffffff; margin-right:3px;" onclick="openServantPermissionsModal('${escapeHtml(s.code || s.id)}')" title="تخصيص الصلاحيات بالتفصيل الممل لهذا الخادم">🛡️ الصلاحيات</button>
    <button class="btn-mini" style="background:#0284c7; color:#ffffff; margin-right:3px;" onclick="previewDashboardAsServant('${escapeHtml(s.code || s.id)}')" title="معاينة لوحة التحكم الحية كما يراها هذا الخادم بالضبط">👁️ معاينة</button>
</td>

<td data-label="السجل" class="admin-only"><button class="btn-mini" style="background:#dfe6e9; color:#2d3436;" onclick="showVersionHistoryModal('servant', '${s.id}', '${escapeHtml(s.name)}')">🕘</button></td>

<td data-label="حذف" class="admin-only"><button class="btn-mini btn-danger" onclick="deleteServant('${escapeHtml(s.code || s.id)}')">حذف 🗑️</button></td>

`;

tbody.appendChild(tr);

});

updateRoleUI();

}

function normalizePhoneNumber(raw) {

if (!raw) return '';

let s = String(raw).trim().replace(/\.0$/, '').replace(/[\s\-]/g, '');

const arDigits = '٠١٢٣٤٥٦٧٨٩';

let clean = '';

for (let i = 0; i < s.length; i++) {

let idx = arDigits.indexOf(s[i]);

if (idx !== -1) clean += idx;

else clean += s[i];

}

if (clean.startsWith('20') && clean.length === 12) {

clean = '0' + clean.slice(2);

} else if (!clean.startsWith('0') && clean.length === 10) {

clean = '0' + clean;

}

return clean;

}

function addServantManual() {

// حماية: لا يسمح بإضافة خادم أو أدمن إلا إذا كان المستخدم الحالي أدمن حقيقي

if (currentPermission !== 'admin') {

return alert("⛔ غير مصرح لك بإضافة خدام أو تعديل الصلاحيات!");

}

let name = document.getElementById('newServantName').value.trim();

let rawPhone = document.getElementById('newServantPhone').value.trim();

let code = document.getElementById('newServantCode').value.trim();

let dob = document.getElementById('newServantDob').value;

let perm = document.getElementById('newServantPermission').value;

if (!name || !rawPhone) return alert("يرجى إدخال اسم ورقم هاتف الخادم (أو كلمة المرور)!");

// 1. تنظيف وتوحيد رقم الهاتف

let phone = normalizePhoneNumber(rawPhone) || rawPhone;

// 2. التحقق الصارم من عدم تكرار الاسم

let duplicateName = servants.some(s => (s.name || '').trim().toLowerCase() === name.toLowerCase());

if (duplicateName) {

return alert(`⛔ تنبيه: اسم الخادم "${name}" مسجل بالفعل في المنظومة ولا يقبل التكرار!`);

}

// 3. التحقق الصارم من عدم تكرار رقم الهاتف

let duplicatePhone = servants.some(s => normalizePhoneNumber(s.phone) === phone);

if (duplicatePhone) {

return alert(`⛔ تنبيه: رقم الهاتف "${phone}" مسجل بالفعل لخادم آخر ولا يمكن تكراره!`);

}

// 4. تحديد الكود التلقائي إن لم يُكتب

let finalCode = code;

if (!finalCode) {

let maxCode = 100;

servants.forEach(s => {

let c = parseInt(s.code || s.id);

if (!isNaN(c) && c > maxCode && c < 1000) maxCode = c;

});

finalCode = (maxCode + 1).toString();

}

let cleanDob = (dob || '').toString().trim().split(' ')[0].split('T')[0];

let newS = {

id: finalCode,

code: finalCode,

name: name,

phone: phone,

dob: cleanDob,

role: perm === 'admin' ? 'admin' : 'servant',

permission: perm,

roleType: perm === 'admin' ? 'أمين خدمة' : 'خادم',

stage: 'عام',

status: 'active'

};

servants.push(newS);

localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

// حفظ مباشر وفوري كوثيقة بكود الخادم في Firestore

if (isFirebaseActive && fsdb) {

fsdb.collection('servants').doc(String(finalCode)).set(newS)

.then(() => showToast("✅ تم حفظ الخادم في قاعدة البيانات السحابية فوراً!"))

.catch(() => syncToCloud('servants', servants));

} else {

syncToCloud('servants', servants);

}

logActivity("إضافة خادم/أدمن", name, `كود: ${finalCode} | صلاحية: ${perm}`);

renderServantsTable();

renderServantsAttendanceTable();

populatePlanServantsDropdown();

document.getElementById('newServantName').value = '';

document.getElementById('newServantPhone').value = '';

document.getElementById('newServantCode').value = '';

}

// ==========================================
// ✏️ نافذة التعديل الشاملة لكافة بيانات وصلاحيات الخدام
// ==========================================
function openEditServantModal(id) {
    if (!servants || servants.length === 0) return alert("لا يوجد خدام مسجلون حالياً.");
    let s = servants.find(x => String(x.id) === String(id) || String(x.code) === String(id));
    if (!s) return alert("تعذر العثور على بيانات الخادم!");

    const origIdEl = document.getElementById('edit_s_original_id');
    const codeEl = document.getElementById('edit_s_code');
    const nameEl = document.getElementById('edit_s_name');
    const phoneEl = document.getElementById('edit_s_phone');
    const dobEl = document.getElementById('edit_s_dob');
    const permEl = document.getElementById('edit_s_permission');
    const roleTypeEl = document.getElementById('edit_s_roleType');
    const stageEl = document.getElementById('edit_s_stage');
    const confessorEl = document.getElementById('edit_s_confessor');
    const statusEl = document.getElementById('edit_s_status');
    const passEl = document.getElementById('edit_s_password');

    if (origIdEl) origIdEl.value = s.id || s.code || '';
    if (codeEl) codeEl.value = s.code || s.id || '';
    if (nameEl) nameEl.value = s.name || '';
    if (phoneEl) phoneEl.value = (s.phone || '').toString().trim().replace(/\.0$/, '');

    let cleanDob = (s.dob || '').toString().trim().split(' ')[0].split('T')[0];
    if (dobEl) dobEl.value = cleanDob || '';

    let perm = s.permission || s.role || 'full';
    if (permEl) permEl.value = perm;

    if (roleTypeEl) roleTypeEl.value = s.roleType || (perm === 'admin' ? 'أمين خدمة' : 'خادم');
    if (stageEl) stageEl.value = s.stage || 'عام';
    if (confessorEl) confessorEl.value = s.confessor || 'أبونا';
    if (statusEl) statusEl.value = s.status || 'active';
    if (passEl) passEl.value = '';
    const curPassPreview = document.getElementById('edit_s_current_pass_preview');
    if (curPassPreview) {
        curPassPreview.innerHTML = s.password 
            ? 'كلمة المرور الحالية: <strong style="color:#0c2461; font-size:12px; background:#fef08a; padding:1px 6px; border-radius:3px;">' + escapeHtml(s.password) + '</strong>'
            : 'كلمة المرور الحالية: <span style="color:#64748b;">افتراضية (رقم الهاتف)</span>';
    }

    const modal = document.getElementById('editServantModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeEditServantModal() {
    const modal = document.getElementById('editServantModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

async function saveEditedServant() {
    const origId = document.getElementById('edit_s_original_id')?.value;
    let s = servants.find(x => String(x.id) === String(origId) || String(x.code) === String(origId));
    if (!s) return alert("خطأ: لم يتم العثور على سجل الخادم!");

    const newCode = (document.getElementById('edit_s_code')?.value || '').trim();
    const newName = (document.getElementById('edit_s_name')?.value || '').trim();
    const rawPhone = (document.getElementById('edit_s_phone')?.value || '').trim();
    const newPhone = normalizePhoneNumber(rawPhone) || rawPhone;
    const newDob = (document.getElementById('edit_s_dob')?.value || '').trim();
    const newPerm = document.getElementById('edit_s_permission')?.value || 'full';
    const newRoleType = (document.getElementById('edit_s_roleType')?.value || '').trim() || 'خادم';
    const newStage = document.getElementById('edit_s_stage')?.value || 'عام';
    const newConfessor = (document.getElementById('edit_s_confessor')?.value || '').trim();
    const newStatus = document.getElementById('edit_s_status')?.value || 'active';
    const newPass = (document.getElementById('edit_s_password')?.value || '').trim();

    if (!newCode) return alert("⚠️ يرجى إدخال كود الخادم!");
    if (!newName) return alert("⚠️ يرجى إدخال اسم الخادم الكامل!");

    // فحص عدم تكرار كود الخادم مع شخص آخر
    const dupCode = servants.some(x => String(x.id) !== String(s.id) && String(x.code) !== String(s.code) && String(x.code || x.id).trim() === newCode);
    if (dupCode) return alert(`⛔ تنبيه: كود الخادم [${newCode}] مسجل بالفعل لخادم آخر!`);

    // فحص عدم تكرار الاسم مع شخص آخر
    const dupName = servants.some(x => String(x.id) !== String(s.id) && String(x.code) !== String(s.code) && (x.name || '').trim().toLowerCase() === newName.toLowerCase());
    if (dupName) return alert(`⛔ تنبيه: الاسم [${newName}] مسجل بالفعل لخادم آخر!`);

    // فحص عدم تكرار رقم الهاتف
    if (newPhone) {
        const dupPhone = servants.some(x => String(x.id) !== String(s.id) && String(x.code) !== String(s.code) && normalizePhoneNumber(x.phone) === newPhone);
        if (dupPhone) return alert(`⛔ تنبيه: رقم الهاتف [${newPhone}] مسجل بالفعل لخادم آخر!`);
    }

    const oldSnapshot = Object.assign({}, s);
    saveVersionSnapshot('servant', s.id, oldSnapshot.name, oldSnapshot);

    // تطبيق التعديلات
    s.code = newCode;
    s.name = newName;
    s.phone = newPhone;
    s.dob = newDob;
    s.permission = newPerm;
    s.role = (newPerm === 'admin') ? 'admin' : 'servant';
    s.roleType = newRoleType;
    s.stage = newStage;
    s.confessor = newConfessor;
    s.status = newStatus;

    if (newPass) {
        if (typeof hashPassword === 'function') {
            try { s.password = await hashPassword(newPass); } catch (e) { s.password = newPass; }
        } else {
            s.password = newPass;
        }
    }

    // حفظ في التخزين المحلي
    localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

    // مزامنة فورية مع سحابة Firestore
    if (isFirebaseActive && fsdb) {
        try {
            await fsdb.collection('servants').doc(String(s.code || s.id)).set(s, { merge: true });
        } catch (errCloud) {
            console.warn("Cloud single save err:", errCloud);
            syncToCloud('servants', servants);
        }
    } else {
        syncToCloud('servants', servants);
    }

    // تحديث كافة الجداول والواجهات
    renderServantsTable();
    renderServantsAttendanceTable();
    populatePlanServantsDropdown();
    checkUpcomingBirthdays();
    updateRoleUI();

    closeEditServantModal();
    logActivity("تعديل شامل لخادم", s.name, `كود: ${s.code} | هاتف: ${s.phone} | صلاحية: ${s.permission}`);
    alert(`✅ تم حفظ وتحديث كافة بيانات الخادم [${s.name}] بنجاح تام سحابياً ومحلياً!`);
}

function editServant(id) {
    openEditServantModal(id);
}

// ==========================================
// 🗑️ وظائف حذف الخدام (فردي وجماعي) مع حماية الأدمن والمزامنة السحابية
// ==========================================
async function deleteServant(id) {
    if (!id && id !== 0) return alert("⚠️ لم يتم تحديد كود أو معرف الخادم المطلوب حذفه!");
    const targetKey = String(id).trim();
    let s = servants.find(x => String(x.id || '').trim() === targetKey || String(x.code || '').trim() === targetKey);
    if (!s) {
        return alert("⚠️ تعذر العثور على سجل هذا الخادم في القائمة!");
    }

    const sName = s.name || targetKey;
    const sCode = String(s.code || s.id || targetKey).trim();
    const sId = String(s.id || '').trim();

    // حماية حساب الأدمن الرئيسي
    const isAdminAccount = (s.role === 'admin' || s.permission === 'admin' || sCode === '101');
    if (isAdminAccount) {
        const currentAdmin = (typeof AuthClient !== 'undefined' && AuthClient.getActiveUser) ? AuthClient.getActiveUser() : null;
        if (currentAdmin && (String(currentAdmin.code || '').trim() === sCode || String(currentAdmin.id || '').trim() === sId)) {
            return alert("⛔ لا يمكنك حذف حساب الأدمن الخاص بك وأنت مسجل الدخول به حالياً لمنع قفل المنظومة!");
        }
        if (!confirm(`⚠️ تنبيه أمني مشدد: الخادم [${sName}] مسجل بصلاحية أمين خدمة (Admin)!\nهل أنت متأكد تماماً من رغبتك في حذفه نهائياً من المنظومة؟`)) {
            return;
        }
    } else {
        if (!confirm(`هل أنت متأكد من حذف الخادم [${sName}] (كود: ${sCode}) نهائياً من المنظومة والسحابة؟`)) {
            return;
        }
    }

    // حفظ نسخة استرجاع في السجل
    if (typeof saveVersionSnapshot === 'function') {
        saveVersionSnapshot('servant', s.id || s.code, sName, Object.assign({}, s));
    }

    // إزالة الخادم من الذاكرة المحلية
    servants = servants.filter(x => {
        const xc = String(x.code || '').trim();
        const xi = String(x.id || '').trim();
        return xc !== sCode && xi !== sCode && xc !== sId && xi !== sId && xc !== targetKey && xi !== targetKey;
    });

    localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

    // حذف فوري من سحابة Firestore إن كانت مفعلة
    if (isFirebaseActive && fsdb) {
        try {
            if (sCode) await fsdb.collection('servants').doc(sCode).delete();
            if (sId && sId !== sCode) await fsdb.collection('servants').doc(sId).delete();
        } catch (errCloud) {
            console.warn("Direct Firestore servant delete warning:", errCloud);
        }
    }

    // إرسال طلب حذف إلى Backend Admin API للتأكيد والمزامنة الشاملة
    try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'delete_servant',
                    payload: { code: sCode, id: sId, phone: s.phone }
                })
            }).catch(() => {});
        }
    } catch (e) {}

    logActivity("حذف خادم", sName, `تم حذف الخادم كود (${sCode}) نهائياً من السحابة والمنظومة`);
    renderServantsTable();
    renderServantsAttendanceTable();
    populatePlanServantsDropdown();
    if (typeof checkUpcomingBirthdays === 'function') checkUpcomingBirthdays();
    if (typeof updateRoleUI === 'function') updateRoleUI();

    alert(`✅ تم حذف الخادم [${sName}] بنجاح تام من المنظومة وسحابة Firestore.`);
}

async function clearAllServants() {
    let pwd = prompt("⚠️ تحذير أمني شديد: سيتم حذف جميع حسابات الخدام ما عدا الأدمن الرئيسي (101)!\nأدخل كلمة مرور أمين الخدمة للتأكيد:");
    if (!pwd) return;

    let pwdHash = await hashPassword(pwd);
    if (!isAdminPasswordValid(pwdHash, pwd)) {
        return alert("❌ كلمة المرور غير صحيحة! تم إلغاء العملية.");
    }

    const nonAdmins = servants.filter(s => s.role !== 'admin' && s.permission !== 'admin' && String(s.code || s.id).trim() !== '101');
    if (nonAdmins.length === 0) {
        return alert("لا يوجد خدام غير رئيسيين لحذفهم. الحسابات المتبقية هي حسابات الأدمن الرئيسي فقط.");
    }

    if (!confirm(`⚠️ هل أنت متأكد نهائياً من حذف (${nonAdmins.length}) خادم من المنظومة وسحابة Firestore؟\nلن يمكن التراجع عن هذا الإجراء إلا باستعادة نسخة احتياطية.`)) {
        return;
    }

    // حفظ لقطة أمان لكافة الخدام قبل الحذف
    if (typeof saveVersionSnapshot === 'function') {
        saveVersionSnapshot('servants_bulk_backup', 'all', 'تفريغ جماعي للخدام', servants.slice());
    }

    // إبقاء الأدمن الرئيسي
    servants = servants.filter(s => s.role === 'admin' || s.permission === 'admin' || String(s.code || s.id).trim() === '101');
    localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

    // حذف الخدام غير الأدمن من سحابة Firestore مباشرة
    if (isFirebaseActive && fsdb) {
        for (const s of nonAdmins) {
            const sc = String(s.code || s.id || '').trim();
            if (sc) {
                fsdb.collection('servants').doc(sc).delete().catch(() => {});
            }
        }
    }

    // إرسال التحديث للسحابة عبر API
    try {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    action: 'update_servants_batch',
                    payload: { servants: servants }
                })
            }).catch(() => {});
        }
    } catch (e) {}

    logActivity("حذف الخدام", "تصفية جماعية", `حذف ${nonAdmins.length} خادم مع الإبقاء على الأدمن`);
    renderServantsTable();
    renderServantsAttendanceTable();
    populatePlanServantsDropdown();
    if (typeof checkUpcomingBirthdays === 'function') checkUpcomingBirthdays();
    if (typeof updateRoleUI === 'function') updateRoleUI();

    alert(`✅ تم حذف (${nonAdmins.length}) خادم بنجاح من السحابة والمنظومة، وتم الإبقاء على حساب الأدمن الرئيسي.`);
}

async function clearTodayServantsAttendance() {
    let dateToClear = getActiveServantDate();
    let pwd = prompt(`⚠️ تنبيه: أنت على وشك مسح سجل حضور الخدام ليوم (${dateToClear}) بالكامل!\nأدخل كلمة مرور أمين الخدمة للتأكيد:`);
    if (!pwd) return;

    let pwdHash = await hashPassword(pwd);
    if (!isAdminPasswordValid(pwdHash, pwd)) {
        return alert("❌ كلمة المرور غير صحيحة! تم إلغاء العملية.");
    }

    if (confirm(`هل أنت متأكد نهائياً من مسح كافة تسجيلات حضور الخدام ليوم (${dateToClear})؟`)) {
        if (typeof servantsAttendance !== 'undefined') {
            servantsAttendance[dateToClear] = [];
            localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));
            syncToCloud('servants_attendance', servantsAttendance);
        }
        logActivity("مسح حضور الخدام", "تصفية يوم", `مسح سجل حضور الخدام ليوم (${dateToClear})`);
        renderServantsAttendanceTable();
        alert(`✅ تم مسح سجل حضور الخدام ليوم (${dateToClear}) بنجاح.`);
    }
}

function populatePlanServantsDropdown() {

const select = document.getElementById('planResponsibleServant');

if (!select) return;

select.innerHTML = '<option value="">اختر الخادم المسؤول...</option>';

servants.forEach(s => {

let opt = document.createElement('option');

opt.value = s.name;

opt.text = s.name;

select.appendChild(opt);

});

}

// ==========================================

// 27. حضور الخدام

// ==========================================

function recordServantAttendance(servant, targetDate) {

let d = targetDate || getActiveServantDate();
if (!servantsAttendance[d]) servantsAttendance[d] = [];

const isAlreadyPresent = servantsAttendance[d].some(s => String(s.id) === String(servant.id) || (s.code && servant.code && String(s.code) === String(servant.code)));

if (!isAlreadyPresent) {

let newServRec = {

id: servant.id, name: servant.name,

code: servant.code || servant.id,

phone: servant.phone || "",

time: new Date().toLocaleTimeString('ar-EG')

};

servantsAttendance[d].push(newServRec);

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

syncToCloud('servants_attendance', servantsAttendance);

logActivity("حضور خادم", servant.name, `تاريخ: ${d} - وقت: ${newServRec.time}`);

renderServantsAttendanceTable();

renderDashboard();

checkLocalStorageUsage();

}

}

function manualMarkServant(servantId, targetDate) {
    if (typeof servants === 'undefined' || !Array.isArray(servants)) return;
    let s = servants.find(x => String(x.id) === String(servantId) || String(x.code) === String(servantId));
    if (!s) {
        console.warn('[manualMarkServant] Servant not found for id/code:', servantId);
        return;
    }
    let d = targetDate || getActiveServantDate();
    recordServantAttendance(s, d);
    if (typeof playBeepSound === 'function') playBeepSound('success');
    if (typeof showToast === 'function') {
        showToast(`✅ تم تسجيل حضور (${s.name}) لتاريخ ${d}`);
    }
}

function cancelServantAttendance(servantId, targetDate) {
    if (typeof servants === 'undefined' || !Array.isArray(servants)) return;
    let s = servants.find(x => String(x.id) === String(servantId) || String(x.code) === String(servantId));
    let sName = s ? s.name : "الخادم";
    let d = targetDate || getActiveServantDate();
    if (confirm(`إلغاء حضور الخادم (${sName}) ليوم (${d})؟`)) {
        servantsAttendance[d] = (servantsAttendance[d] || []).filter(item => String(item.id) !== String(servantId) && String(item.code || '') !== String(servantId));
        localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));
        if (typeof syncToCloud === 'function') syncToCloud('servants_attendance', servantsAttendance);
        logActivity("إلغاء حضور خادم", sName, `إلغاء يدوي ليوم ${d}`);
        renderServantsAttendanceTable();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof checkLocalStorageUsage === 'function') checkLocalStorageUsage();
        if (typeof showToast === 'function') {
            showToast(`🗑️ تم إلغاء حضور (${sName}) ليوم ${d}`);
        }
    }
}


// ==========================================
// 👤 تعديل الخادم لملفه الشخصي بنفسه (Servant Self Profile)
// ==========================================
function togglePasswordVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
}

function openMyServantProfileModal() {
    const activeStr = localStorage.getItem('my_church_active_user') || sessionStorage.getItem('my_church_active_user');
    let activeUser = null;
    try { activeUser = JSON.parse(activeStr); } catch(e) {}
    if (!activeUser && typeof currentUser !== 'undefined') activeUser = currentUser;

    if (!activeUser) {
        return alert("يرجى تسجيل الدخول أولاً لتعديل ملفك الشخصي.");
    }

    const sList = (typeof servants !== 'undefined' && Array.isArray(servants)) ? servants : [];
    let s = sList.find(x => 
        (activeUser.id && String(x.id) === String(activeUser.id)) ||
        (activeUser.code && String(x.code) === String(activeUser.code)) ||
        (activeUser.name && (x.name || '').trim() === (activeUser.name || '').trim())
    ) || activeUser;

    const nameEl = document.getElementById('my_s_name_display');
    const codeEl = document.getElementById('my_s_code_display');
    const roleEl = document.getElementById('my_s_role_display');
    const stageEl = document.getElementById('my_s_stage_display');
    const dobEl = document.getElementById('my_s_dob');
    const phoneEl = document.getElementById('my_s_phone');
    const confessorEl = document.getElementById('my_s_confessor');
    const newPassEl = document.getElementById('my_s_new_pass');
    const confirmPassEl = document.getElementById('my_s_confirm_pass');

    if (nameEl) nameEl.textContent = s.name || activeUser.name || '-';
    if (codeEl) codeEl.textContent = s.code || s.id || activeUser.code || '-';
    if (roleEl) roleEl.textContent = s.roleType || s.permission || s.role || 'خادم';
    if (stageEl) stageEl.textContent = s.stage || 'عام';

    let cleanDob = (s.dob || activeUser.dob || '').toString().trim().split(' ')[0].split('T')[0];
    if (dobEl) dobEl.value = cleanDob || '';

    let cleanPhone = (s.phone || activeUser.phone || '').toString().trim().replace(/\.0$/, '');
    if (phoneEl) phoneEl.value = cleanPhone || '';

    if (confessorEl) confessorEl.value = s.confessor || activeUser.confessor || '';

    if (newPassEl) newPassEl.value = '';
    if (confirmPassEl) confirmPassEl.value = '';

    const modal = document.getElementById('myServantProfileModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeMyServantProfileModal() {
    const modal = document.getElementById('myServantProfileModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

async function saveMyServantProfile() {
    const activeStr = localStorage.getItem('my_church_active_user') || sessionStorage.getItem('my_church_active_user');
    let activeUser = null;
    try { activeUser = JSON.parse(activeStr); } catch(e) {}
    if (!activeUser && typeof currentUser !== 'undefined') activeUser = currentUser;
    if (!activeUser) return alert("خطأ: لم يتم العثور على جلسة الخادم الحالية!");

    const newDob = (document.getElementById('my_s_dob')?.value || '').trim();
    const rawPhone = (document.getElementById('my_s_phone')?.value || '').trim();
    const newPhone = (typeof normalizePhoneNumber === 'function') ? (normalizePhoneNumber(rawPhone) || rawPhone) : rawPhone;
    const newConfessor = (document.getElementById('my_s_confessor')?.value || '').trim();
    const newPass = (document.getElementById('my_s_new_pass')?.value || '').trim();
    const confirmPass = (document.getElementById('my_s_confirm_pass')?.value || '').trim();

    // التحقق من كلمة المرور إن أدخلها
    if (newPass) {
        if (newPass.length < 4) {
            return alert("⚠️ كلمة المرور يجب أن تتكون من 4 خانات على الأقل لضمان الأمان.");
        }
        if (newPass !== confirmPass) {
            return alert("⚠️ كلمة المرور وتأكيد كلمة المرور غير متطابقين! يرجى إعادة كتابتهما بدقة.");
        }
    }

    const sList = (typeof servants !== 'undefined' && Array.isArray(servants)) ? servants : [];
    let s = sList.find(x => 
        (activeUser.id && String(x.id) === String(activeUser.id)) ||
        (activeUser.code && String(x.code) === String(activeUser.code)) ||
        (activeUser.name && (x.name || '').trim() === (activeUser.name || '').trim())
    );

    if (!s) {
        s = Object.assign({}, activeUser);
        sList.push(s);
    }

    if (typeof saveVersionSnapshot === 'function') {
        saveVersionSnapshot('servant', s.id || s.code, s.name, Object.assign({}, s));
    }

    s.dob = newDob;
    if (newPhone) s.phone = newPhone;
    s.confessor = newConfessor;

    let passChanged = false;
    if (newPass) {
        s.password = newPass;
        s.password_last_changed = new Date().toISOString();
        passChanged = true;
    }

    // تحديث بيانات الجلسة الحالية
    activeUser.dob = newDob;
    if (newPhone) activeUser.phone = newPhone;
    activeUser.confessor = newConfessor;
    if (passChanged) activeUser.password = newPass;

    try {
        localStorage.setItem('my_church_active_user', JSON.stringify(activeUser));
        if (sessionStorage.getItem('my_church_active_user')) {
            sessionStorage.setItem('my_church_active_user', JSON.stringify(activeUser));
        }
    } catch(e) {}
    if (typeof currentUser !== 'undefined') {
        Object.assign(currentUser, activeUser);
    }

    // حفظ في التخزين المحلي
    try {
        localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(sList));
    } catch(e) {}

    // مزامنة فورية مع سحابة Firestore
    if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
        try {
            await fsdb.collection('servants').doc(String(s.code || s.id)).set(s, { merge: true });
        } catch(errCloud) {
            console.warn("Cloud single save err in self-profile:", errCloud);
            if (typeof syncToCloud === 'function') syncToCloud('servants', sList);
        }
    } else if (typeof syncToCloud === 'function') {
        syncToCloud('servants', sList);
    }

    // توثيق حركة التعديل لتكون واضحة للأدمن
    if (typeof logActivity === 'function') {
        if (passChanged) {
            logActivity("تحديث كلمة مرور وملف شخصي", s.name, "قام الخادم [" + s.name + "] بتحديث ملفه الشخصي وتعيين كلمة مرور جديدة: [" + newPass + "] | هاتف: " + (s.phone || '-') + " | ميلاد: " + (s.dob || '-'));
        } else {
            logActivity("تحديث ملف شخصي لخادم", s.name, "قام الخادم بتحديث ملفه الشخصي: هاتف [" + (s.phone || '-') + "] | تاريخ ميلاد [" + (s.dob || '-') + "] | أب اعتراف [" + (s.confessor || '-') + "]");
        }
    }

    if (typeof renderServantsTable === 'function') renderServantsTable();
    if (typeof checkUpcomingBirthdays === 'function') checkUpcomingBirthdays();
    if (typeof renderRadarBirthdays === 'function') renderRadarBirthdays();
    if (typeof renderRadarDashboard === 'function') renderRadarDashboard();

    closeMyServantProfileModal();

    const successMsg = passChanged
        ? "✅ تم حفظ وتحديث بياناتك الشخصية بنجاح! تم تعيين كلمة المرور الجديدة وتوثيقها لدى أمانة الخدمة. شكراً لأمانتك 🕊️"
        : "✅ تم حفظ وتحديث بياناتك الشخصية بنجاح! شكراً لاهتمامك باستكمال بيانات الخدمة 🕊️";

    if (typeof showToast === 'function') showToast(successMsg);
    else alert(successMsg);
}

// Explicit Window Exports
if (typeof window !== 'undefined') {
    window.openEditServantModal = openEditServantModal;
  window.openMyServantProfileModal = openMyServantProfileModal;
  window.closeMyServantProfileModal = closeMyServantProfileModal;
  window.saveMyServantProfile = saveMyServantProfile;
  window.togglePasswordVisibility = togglePasswordVisibility;
  window.closeEditServantModal = closeEditServantModal;
  window.saveEditedServant = saveEditedServant;
  window.editServant = editServant;
  window.deleteServant = deleteServant;
  window.clearAllServants = clearAllServants;
  window.clearTodayServantsAttendance = clearTodayServantsAttendance;
window.activeServantAttendanceDate = activeServantAttendanceDate;
window.getActiveServantDate = getActiveServantDate;
window.changeServantAttendanceDate = changeServantAttendanceDate;
window.shiftServantAttendanceDate = shiftServantAttendanceDate;
window.setServantAttendanceToday = setServantAttendanceToday;
window.syncWithStudentAttendanceDate = syncWithStudentAttendanceDate;
  window.renderServantsTable = renderServantsTable;
  window.renderServantsAttendanceTable = renderServantsAttendanceTable;
  window.registerActiveSession = registerActiveSession;
  window.listenToActiveSessions = listenToActiveSessions;
  window.terminateSession = terminateSession;
  window.terminateAllSessions = terminateAllSessions;
  window.populatePlanServantsDropdown = populatePlanServantsDropdown;
  window.shareAutoSetupWhatsAppLink = shareAutoSetupWhatsAppLink;
  window.recordServantAttendance = recordServantAttendance;
  window.manualMarkServant = manualMarkServant;
  window.cancelServantAttendance = cancelServantAttendance;
}
