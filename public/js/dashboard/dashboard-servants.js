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

function listenToActiveSessions() {

if (!isFirebaseActive || !fsdb) return;

fsdb.collection('active_sessions').onSnapshot(snap => {

const tbody = document.getElementById('activeSessionsTbody');

if (!tbody) return;

tbody.innerHTML = '';

if (snap.empty) {

tbody.innerHTML = '<tr><td colspan="5" class="empty-state">لا توجد أي جلسات نشطة حالياً.</td></tr>';

return;

}

snap.forEach(doc => {

let key = doc.id, sess = doc.data();

let isMe = (sess.sessionId === myCurrentSessionId);

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="اسم الخادم"><strong>${escapeHtml(sess.servantName)}</strong> ${isMe ? '<span style="color:green; font-size:11px;">(أنت)</span>' : ''}</td>

<td data-label="نوع الجهاز">${escapeHtml(sess.device)}</td>

<td data-label="وقت الدخول" dir="ltr">${escapeHtml(sess.loginDate)} ${escapeHtml(sess.loginTime)}</td>

<td data-label="الحالة"><span class="role-badge" style="background:var(--success);">متصل الآن 🟢</span></td>

<td data-label="إجراء الأدمن">${isMe ? '<span style="color:#888; font-size:11px;">جلستك الحالية</span>' : `<button class="btn-mini btn-danger" onclick="terminateSession('${key}', '${escapeHtml(sess.servantName)}')">طرد الجهاز ❌</button>`}</td>

`;

tbody.appendChild(tr);

});

}, err => console.warn('تعذر متابعة الجلسات النشطة:', err.code || err.message));

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

<td data-label="تعديل" class="admin-only"><button class="btn-mini btn-warning" onclick="editServant(${s.id})">تعديل</button></td>

<td data-label="السجل" class="admin-only"><button class="btn-mini" style="background:#dfe6e9; color:#2d3436;" onclick="showVersionHistoryModal('servant', ${s.id}, '${escapeHtml(s.name)}')">🕘</button></td>

<td data-label="حذف" class="admin-only"><button class="btn-mini btn-danger" onclick="deleteServant(${s.id})">حذف</button></td>

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

function editServant(id) {

let s = servants.find(x => String(x.id) === String(id) || String(x.code) === String(id));

if (!s) return;

let oldSnapshot = Object.assign({}, s);

let newName = prompt("تعديل اسم الخادم:", s.name);

if (newName && newName.trim()) {

let checkName = newName.trim();

let dupName = servants.some(x => String(x.id) !== String(id) && String(x.code) !== String(id) && (x.name || '').trim().toLowerCase() === checkName.toLowerCase());

if (dupName) {

return alert(`⛔ تنبيه: الاسم "${checkName}" مسجل بالفعل لخادم آخر ولا يقبل التكرار!`);

}

s.name = checkName;

}

let newPhone = prompt("تعديل رقم الهاتف:", s.phone);

if (newPhone && newPhone.trim()) {

let checkPhone = normalizePhoneNumber(newPhone.trim()) || newPhone.trim();

let dupPhone = servants.some(x => String(x.id) !== String(id) && String(x.code) !== String(id) && normalizePhoneNumber(x.phone) === checkPhone);

if (dupPhone) {

return alert(`⛔ تنبيه: رقم الهاتف "${checkPhone}" مسجل بالفعل لخادم آخر ولا يمكن تكراره!`);

}

s.phone = checkPhone;

}

saveVersionSnapshot('servant', s.id, oldSnapshot.name, oldSnapshot);

localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

if (isFirebaseActive && fsdb) {

fsdb.collection('servants').doc(String(s.code || s.id)).set(s, { merge: true })

.catch(() => syncToCloud('servants', servants));

} else {

syncToCloud('servants', servants);

}

logActivity("تعديل خادم", s.name, `هاتف: ${s.phone}`);

renderServantsTable();

renderServantsAttendanceTable();

}

function deleteServant(id) {

let s = servants.find(x => x.id === id);

let sName = s ? s.name : id;

if (confirm("هل أنت متأكد من حذف هذا الخادم؟")) {

if (s) saveVersionSnapshot('servant', s.id, s.name, Object.assign({}, s));

servants = servants.filter(s => s.id !== id);

localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

syncToCloud('servants', servants);

logActivity("حذف خادم", sName, "تم الحذف من القائمة");

renderServantsTable();

renderServantsAttendanceTable();

}

}

async function clearAllServants() {

let pwd = prompt("⚠️ تحذير: سيتم حذف جميع الخدام ما عدا الأدمن الرئيسي!\nأدخل كلمة مرور الأدمن:");

if (!pwd) return;

let pwdHash = await hashPassword(pwd);

if (isAdminPasswordValid(pwdHash, pwd)) {

if (confirm("هل أنت متأكد؟")) {

servants = servants.filter(s => s.role === 'admin' || s.permission === 'admin');

localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

syncToCloud('servants', servants);

logActivity("حذف الخدام", "تصفية جماعية", "حذف كافة حسابات الخدام ما عدا الأدمن");

renderServantsTable();

alert("✅ تم حذف باقي الخدام بنجاح.");

}

} else {

alert("❌ كلمة المرور غير صحيحة.");

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
  window.renderServantsTable = renderServantsTable;
  window.renderServantsAttendanceTable = renderServantsAttendanceTable;
  window.registerActiveSession = registerActiveSession;
  window.listenToActiveSessions = listenToActiveSessions;
  window.populatePlanServantsDropdown = populatePlanServantsDropdown;
  window.shareAutoSetupWhatsAppLink = shareAutoSetupWhatsAppLink;
  window.recordServantAttendance = recordServantAttendance;
}
