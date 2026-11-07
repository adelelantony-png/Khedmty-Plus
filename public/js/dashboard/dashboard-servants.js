/**
 * Khedmty-Plus Dashboard - Servants Management Module
 * Extracted for offline PWA performance & modular maintainability.
 */

// ==========================================

// 16. عرض جدول التزام الخدام

// ==========================================

function renderServantsAttendanceTable() {

const tbody = document.querySelector('#servantsAttendanceTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

const elStatCount = document.getElementById('statServantsCount');

if (elStatCount) elStatCount.innerText = servants.length;

const elTodayCount = document.getElementById('statServantsToday');

if (elTodayCount) elTodayCount.innerText = (servantsAttendance[today] || []).length;

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

let present = (servantsAttendance[today] || []).find(x => x.id.toString() === s.id.toString());

let visits = allVisitationsList.filter(v => {

let vBy = (v.servant || '').trim().toLowerCase();

let sName = (s.name || '').trim().toLowerCase();

return vBy === sName || (s.role === 'admin' && (vBy.includes('أمين الخدمة') || vBy === 'admin'));

}).length;

let todayEvent = masterPlan.find(l => (l.responsible || '').trim().toLowerCase() === s.name.trim().toLowerCase() && l.date === today);

let planInfo = todayEvent ? `<strong style="color:red;">📍 ${todayEvent.type}: ${todayEvent.title}</strong>` : '<span style="color:#7f8c8d;">لا توجد تكليفات اليوم</span>';

let actionBtn = present

? `<button class="btn-mini btn-danger" onclick="cancelServantAttendance(${s.id})">إلغاء الحضور ❌</button>`

: `<button class="btn-mini btn-success" onclick="manualMarkServant(${s.id})">تسجيل حضور ✔️</button>`;

let commit = calculateServantCommitment(s.id);

let commitBadge = `

<div style="font-weight:bold; font-size:11px;">${commit.percent}% (${commit.attended}/${commit.total})</div>

<div class="progress-bar-container"><div class="progress-bar" style="width:${commit.percent}%; background:${commit.isCommitted ? 'var(--success)' : 'var(--warning)'}"></div></div>

`;

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="كود الخادم">${s.code || s.id}</td>

<td data-label="الاسم"><strong>${s.name}</strong></td>

<td data-label="الهاتف">${s.phone}</td>

<td data-label="حالة اليوم">${present ? `<span style="color:green; font-weight:bold;">حاضر (${present.time})</span>` : '<span style="color:red;">لم يحضر</span>'}</td>

<td data-label="النسبة السنوية">${commitBadge}</td>

<td data-label="تكليف اليوم">${planInfo}</td>

<td data-label="الافتقادات"><span class="role-badge" style="background:#00b894;">${visits} افتقاد</span></td>

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

<td data-label="الاسم"><strong>${escapeHtml(s.name)}</strong></td>

<td data-label="الهاتف">${escapeHtml(cleanPhone)}</td>

<td data-label="تاريخ الميلاد">${escapeHtml(cleanDob) || '-'}</td>

<td data-label="الصلاحية"><span class="role-badge" style="background:var(--accent);">${escapeHtml(s.permission || s.role || 'خادم')}</span></td>

<td data-label="الحساب السحابي">${s.cloudUid

? '<span style="color:var(--success); font-weight:bold; font-size:11px;">مربوط ✅</span>'

: `<button class="btn-mini btn-purple" onclick="linkServantToCloudAuth(${s.id})">ربط سحابي 🔐</button>`}</td>

<td data-label="تعديل" class="admin-only"><button class="btn-mini btn-warning" onclick="openEditServantModal('${escapeHtml(s.code || s.id)}')">تعديل</button></td>

<td data-label="السجل" class="admin-only"><button class="btn-mini" style="background:#dfe6e9; color:#2d3436;" onclick="showVersionHistoryModal('servant', ${s.id}, '${escapeHtml(s.name)}')">🕘</button></td>

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
    let dateToClear = (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) ? activeSelectedDate : today;
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

function recordServantAttendance(servant) {

if (!servantsAttendance[today].some(s => s.id.toString() === servant.id.toString())) {

let newServRec = {

id: servant.id, name: servant.name,

code: servant.code || servant.id,

phone: servant.phone || "",

time: new Date().toLocaleTimeString('ar-EG')

};

servantsAttendance[today].push(newServRec);

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

syncToCloud('servants_attendance', servantsAttendance);

logActivity("حضور خادم", servant.name, `وقت: ${newServRec.time}`);

renderServantsAttendanceTable();

renderDashboard();

checkLocalStorageUsage();

}

}

function manualMarkServant(servantId) {

let s = servants.find(x => x.id === servantId);

if (!s) return;

recordServantAttendance(s);

playBeepSound('success');

showToast(`✅ تم تسجيل حضور الخادم: ${s.name}`);

}

function cancelServantAttendance(servantId) {

let s = servants.find(x => x.id === servantId);

let sName = s ? s.name : "الخادم";

if (confirm(`إلغاء حضور الخادم (${sName}) لليوم؟`)) {

servantsAttendance[today] = (servantsAttendance[today] || []).filter(item => item.id.toString() !== servantId.toString());

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

syncToCloud('servants_attendance', servantsAttendance);

logActivity("إلغاء حضور خادم", sName, "إلغاء يدوي");

renderServantsAttendanceTable();

renderDashboard();

checkLocalStorageUsage();

}

}

// Explicit Window Exports
if (typeof window !== 'undefined') {
    window.openEditServantModal = openEditServantModal;
  window.closeEditServantModal = closeEditServantModal;
  window.saveEditedServant = saveEditedServant;
  window.editServant = editServant;
  window.deleteServant = deleteServant;
  window.clearAllServants = clearAllServants;
  window.clearTodayServantsAttendance = clearTodayServantsAttendance;
  window.renderServantsTable = renderServantsTable;
  window.renderServantsAttendanceTable = renderServantsAttendanceTable;
  window.registerActiveSession = registerActiveSession;
  window.listenToActiveSessions = listenToActiveSessions;
  window.terminateSession = terminateSession;
  window.terminateAllSessions = terminateAllSessions;
  window.populatePlanServantsDropdown = populatePlanServantsDropdown;
  window.shareAutoSetupWhatsAppLink = shareAutoSetupWhatsAppLink;
  window.recordServantAttendance = recordServantAttendance;
}
