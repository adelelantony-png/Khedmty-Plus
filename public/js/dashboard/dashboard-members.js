/**
 * Khedmty-Plus Dashboard - Members Management & Profiles Module
 * Extracted for offline PWA performance & modular maintainability.
 */


// 9. تحديث مخدوم فردي (بدون تكرار)

// ==========================================

// ==========================================

// سجل تغييرات لكل سجل (Version History) - يحفظ نسخة من البيانات قبل كل تعديل

// ==========================================

const VERSION_HISTORY_KEY = 'khedmety_version_history';

const MAX_VERSIONS_PER_ENTITY = 5;

function saveVersionSnapshot(entityType, entityId, entityName, oldSnapshot) {

try {

let all = [];

try { all = JSON.parse(localStorage.getItem(VERSION_HISTORY_KEY)) || []; } catch (e) { all = []; }

let versionEntry = {

id: 'v_' + Date.now() + '_' + Math.floor(Math.random() * 1000),

entityType, entityId: entityId.toString(), entityName,

snapshot: oldSnapshot,

changedBy: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.name : 'غير معروف',

time: new Date().toISOString()

};

all.push(versionEntry);

// الاحتفاظ بآخر 5 نسخ فقط لكل سجل (عشان محدودية المساحة)

let sameEntity = all.filter(v => v.entityType === entityType && v.entityId === entityId.toString());

if (sameEntity.length > MAX_VERSIONS_PER_ENTITY) {

let toRemoveCount = sameEntity.length - MAX_VERSIONS_PER_ENTITY;

let removedIds = sameEntity.slice(0, toRemoveCount).map(v => v.id);

all = all.filter(v => !removedIds.includes(v.id));

}

// وأيضاً حد أقصى عام لعدد كل السجلات المحفوظة محلياً

if (all.length > 1000) all = all.slice(all.length - 1000);

localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(all));

if (isFirebaseActive && fsdb) {

let vhDocId = `${entityType}__${entityId}__${versionEntry.id}`;

fsdb.collection('version_history').doc(vhDocId).set(versionEntry).catch(() => {});

}

} catch (e) { console.warn("فشل حفظ نسخة سجل التعديلات:", e); }

}

function getVersionHistory(entityType, entityId) {

let all = [];

try { all = JSON.parse(localStorage.getItem(VERSION_HISTORY_KEY)) || []; } catch (e) { all = []; }

return all.filter(v => v.entityType === entityType && v.entityId === entityId.toString())

.sort((a, b) => new Date(b.time) - new Date(a.time));

}

function showVersionHistoryModal(entityType, entityId, entityName) {

let versions = getVersionHistory(entityType, entityId);

let bodyHtml;

if (versions.length === 0) {

bodyHtml = '<p style="color:#888; font-size:13px;">لا يوجد سجل تعديلات سابقة محفوظ لهذا السجل على هذا الجهاز.</p>';

} else {

bodyHtml = versions.map(v => `

<div style="border:1px solid #dfe6e9; border-radius:8px; padding:10px; margin-bottom:8px;">

<div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#636e72;">

<span>📅 ${escapeHtml(new Date(v.time).toLocaleString('ar-EG'))} — بواسطة: <strong>${escapeHtml(v.changedBy)}</strong></span>

<button class="btn-mini btn-warning" style="width:auto; padding:4px 10px; margin:0;" onclick="restoreVersionSnapshot('${v.id}')">استرجاع هذه النسخة ↩️</button>

</div>

</div>

`).join('');

}

let modalHtml = `

<div id="versionHistoryModal" class="modal" style="display:flex;">

<div class="modal-content" style="max-width:500px;">

<span class="close-btn" onclick="document.getElementById('versionHistoryModal').remove()">&times;</span>

<h3 style="margin-top:0;">🕘 سجل تعديلات: ${escapeHtml(entityName)}</h3>

<div style="max-height:60vh; overflow-y:auto;">${bodyHtml}</div>

</div>

</div>`;

let existing = document.getElementById('versionHistoryModal');

if (existing) existing.remove();

document.body.insertAdjacentHTML('beforeend', modalHtml);

}

function restoreVersionSnapshot(versionId) {

let all = [];

try { all = JSON.parse(localStorage.getItem(VERSION_HISTORY_KEY)) || []; } catch (e) { all = []; }

let v = all.find(x => x.id === versionId);

if (!v) return alert("تعذر العثور على هذه النسخة.");

if (!confirm(`هل تريد استرجاع بيانات "${v.entityName}" كما كانت في ${new Date(v.time).toLocaleString('ar-EG')}؟ سيتم استبدال البيانات الحالية.`)) return;

if (v.entityType === 'member') {

saveSingleMemberUpdate(v.entityId, v.snapshot, "استرجاع نسخة سابقة");

let modal = document.getElementById('versionHistoryModal');

if (modal) modal.remove();

openProfile(v.entityId);

} else if (v.entityType === 'servant') {

let idx = servants.findIndex(s => s.id.toString() === v.entityId.toString());

if (idx !== -1) {

servants[idx] = Object.assign({}, v.snapshot, { id: servants[idx].id });

} else {

// الخادم كان محذوفاً بالكامل - نعيد إضافته من النسخة المحفوظة

servants.push(Object.assign({}, v.snapshot));

}

localStorage.setItem(STORAGE_KEYS.SERVANTS, JSON.stringify(servants));

syncToCloud('servants', servants);

logActivity("استرجاع نسخة سابقة", v.snapshot.name || v.entityName, "خادم");

renderServantsTable();

let modal = document.getElementById('versionHistoryModal');

if (modal) modal.remove();

}

showToast("✅ تم استرجاع النسخة السابقة بنجاح.");

}

function saveSingleMemberUpdate(memberId, updatedFields, actionLabel = "تعديل مخدوم") {

let cleanId = memberId.toString().trim();

let mIndex = members.findIndex(x => x.id && x.id.toString().trim() === cleanId);

if (mIndex === -1) {

console.error("تعذر العثور على المخدوم لتحديثه:", memberId);

return;

}

// حفظ نسخة من البيانات قبل التعديل (سجل التعديلات - يشمل حتى عمليات الاسترجاع نفسها لإمكانية التراجع عنها لاحقاً)

saveVersionSnapshot('member', members[mIndex].id, members[mIndex].name, Object.assign({}, members[mIndex]));

members[mIndex] = Object.assign({}, members[mIndex], updatedFields, { id: members[mIndex].id });

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

if (isFirebaseActive && fsdb) {

fsdb.collection('members').doc(String(members[mIndex].id)).update(updatedFields)

.then(() => updateLastSyncTimestamp())

.catch(() => syncToCloud('members', members));

// جسر المزامنة المزدوجة مع مجموعة students لضمان تطابق بوابة المخدوم ولوحة الخادم

const memberCode = String(members[mIndex].code || members[mIndex].id || '').trim();

if (memberCode) {

fsdb.collection('students').doc(memberCode).set(updatedFields, { merge: true }).catch(() => {});

}

} else {

syncToCloud('members', members);

}

let memberName = members[mIndex].name;

if (typeof logActivity === "function") logActivity(actionLabel, memberName, Object.keys(updatedFields).join(', '));

renderMembersList();

renderDashboard();

}

// ==========================================


// دوال توحيد صيغ المراحل والنوع (Normalization)

// ==========================================

function normalizeStageText(val) {

if (!val) return "سنة أولى";

let s = val.toString().trim();

if (s.includes("ثان") || s.includes("2")) return "سنة ثانية";

if (s.includes("تخرج") || s.includes("خريج")) return "خريجين";

return "سنة أولى";

}

function normalizeGenderText(val) {

if (!val) return "بنين";

let s = val.toString().trim().toLowerCase();

if (s.includes("female") || s.includes("بنات") || s.includes("بنت") || s.includes("انثى") || s.includes("أنثى")) return "بنات";

return "بنين";

}

// ==========================================

// 13. عرض قائمة المخدومين (دالة واحدة نهائية)

// ==========================================

function renderMembersList() {

const tbody = document.querySelector('#membersTable tbody');

if (!tbody) return;

const searchBox = document.getElementById('searchBox');

const search = searchBox ? searchBox.value.toLowerCase() : '';

const stageFilterSelect = document.getElementById('stageFilterSelect');

const stageFilter = stageFilterSelect ? stageFilterSelect.value : 'all';

const gradFilterSelect = document.getElementById('gradFilterSelect');

const gradFilter = gradFilterSelect ? gradFilterSelect.value : 'all';

tbody.innerHTML = '';

let filtered = members.filter(m => {

let matchesSearch = (m.name || '').toLowerCase().includes(search) ||

(m.code && m.code.toString().toLowerCase().includes(search)) ||

(m.phone && m.phone.includes(search));

let mStage = normalizeStageText(m.stage);

let targetStage = stageFilter === 'all' ? 'all' : normalizeStageText(stageFilter);

let matchesStage = (targetStage === 'all') || (mStage === targetStage);

let grad = calculateGraduationStatus(m.id);

let matchesGrad = (gradFilter === 'all') ||

(gradFilter === 'qualified' && grad.qualified) ||

(gradFilter === 'unqualified' && !grad.qualified);

return matchesSearch && matchesStage && matchesGrad;

});

if (filtered.length === 0) {

tbody.innerHTML = '<tr><td colspan="9" class="empty-state">لا توجد نتائج مطابقة للبحث أو الفلاتر المحددة.</td></tr>';

updateRoleUI();

return;

}

filtered.forEach(m => {

let grad = calculateGraduationStatus(m.id);

let gradBadge = grad.qualified

? `<span class="role-badge" style="background:var(--success);">مؤهل للتخرج 🎓</span>`

: `<span class="role-badge" style="background:var(--warning);">${grad.percent}% (غير مؤهل)</span>`;

let isAttendedToday = (attendanceRecord[activeSelectedDate] || []).some(a => a.id.toString() === m.id.toString());

let manualBtn = isAttendedToday

? `<span style="color:green; font-weight:bold; font-size:11px;">مسجل ✔️</span>`

: `<button class="btn-mini btn-success can-attend" onclick="registerMemberAttendanceFromTable('${m.id}')">تسجيل حضور ✔️</button>`;

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="كود الامتحان"><strong style="color:var(--primary); font-size:14px;">${escapeHtml(m.code) || '-'}</strong></td>

<td data-label="الاسم"><strong>${escapeHtml(m.name)}</strong></td>

<td data-label="المرحلة">${escapeHtml(normalizeStageText(m.stage))}</td>

<td data-label="التليفون">${escapeHtml(m.phone)}</td>

<td data-label="حضور الجمعة الرسمي">

<div style="font-weight:bold; font-size:11px;">${grad.percent}% (${grad.attended}/${grad.total})</div>

<div class="progress-bar-container"><div class="progress-bar" style="width:${grad.percent}%; background:${grad.qualified ? 'var(--success)' : 'var(--warning)'}"></div></div>

</td>

<td data-label="نقاط بونص ⭐"><strong style="color:var(--purple);">+${grad.bonus} نقطة</strong></td>

<td data-label="أهلية التخرج">${gradBadge}</td>

<td data-label="تسجيل يدوي">${manualBtn}</td>

<td data-label="الملف"><button class="btn-primary" style="padding:4px 8px; margin:0; font-size:11px;" onclick="openProfile('${m.id}')">الملف 🪪</button></td>

`;

tbody.appendChild(tr);

});

updateRoleUI();

}

function registerMemberAttendanceFromTable(memberId) {

let member = members.find(m => m.id.toString() === memberId.toString());

if (member) atomicRegisterAttendance(member);

}

// ==========================================




// 23. الافتقاد والتقييم الميداني

// ==========================================

function quickCapsuleVisit(capsuleText) { saveVisitation(capsuleText); }

function addManualVisitationNote() {

let note = document.getElementById('visitationNote').value.trim();

if (!note) return alert("اكتب الملاحظة أولاً!");

saveVisitation(note);

document.getElementById('visitationNote').value = '';

}

function saveVisitation(text) {

let m = members.find(x => x.id.toString() === currentProfileId.toString());

if (!m) return;

if (!m.visitations) m.visitations = [];

let newVis = {

date: new Date().toLocaleDateString('en-CA'),

text: text,

by: currentUser ? currentUser.name : 'خادم'

};

m.visitations.unshift(newVis);

saveSingleMemberUpdate(m.id, { visitations: m.visitations }, "تسجيل كبسولة افتقاد");

let vh = document.getElementById('visitationHistory');

if (vh) vh.innerHTML = `<div style="border-bottom:1px solid #ddd; padding:4px 0;"><strong>${escapeHtml(newVis.date)} (${escapeHtml(newVis.by)}):</strong> ${escapeHtml(text)}</div>` + vh.innerHTML;

renderServantsAttendanceTable();

checkLocalStorageUsage();

showToast("✅ تم حفظ كبسولة الافتقاد بنجاح!");

}

function saveFieldEvaluation() {

let m = members.find(x => x.id.toString() === currentProfileId.toString());

if (!m) return;

let date = document.getElementById('evalDate').value || new Date().toLocaleDateString('en-CA');

let className = document.getElementById('evalClass').value.trim();

let lessonTitle = document.getElementById('evalLessonTitle').value.trim();

let supervisor = document.getElementById('evalSupervisor').value || (currentUser ? currentUser.name : 'خادم مشرف');

let sPrep = parseInt(document.getElementById('scorePrep').value) || 0;

let sDeliv = parseInt(document.getElementById('scoreDelivery').value) || 0;

let sAids = parseInt(document.getElementById('scoreAids').value) || 0;

let sCond = parseInt(document.getElementById('scoreConduct').value) || 0;

let totalScore = Math.min(100, sPrep + sDeliv + sAids + sCond);

let notes = document.getElementById('evalNotes').value.trim();

if (!lessonTitle) return alert("يرجى كتابة عنوان الدرس المشروح!");

if (!m.fieldEvaluations) m.fieldEvaluations = [];

m.fieldEvaluations.unshift({

id: Date.now(), date: date,

className: className || "فصل عام",

lessonTitle: lessonTitle, supervisor: supervisor,

totalScore: totalScore,

details: { prep: sPrep, deliv: sDeliv, aids: sAids, cond: sCond },

notes: notes

});

saveSingleMemberUpdate(m.id, { fieldEvaluations: m.fieldEvaluations }, "تقييم درس ميداني");

renderFieldEvaluationsList(m);

checkLocalStorageUsage();

showToast(`✅ تم حفظ تقييم النزول الميداني (${totalScore}/100)`);

document.getElementById('evalLessonTitle').value = '';

document.getElementById('evalNotes').value = '';

document.getElementById('scorePrep').value = '';

document.getElementById('scoreDelivery').value = '';

document.getElementById('scoreAids').value = '';

document.getElementById('scoreConduct').value = '';

}

function renderFieldEvaluationsList(member) {

let box = document.getElementById('fieldEvaluationHistory');

if (!box) return;

box.innerHTML = '';

let evals = member.fieldEvaluations || [];

if (evals.length === 0) {

box.innerHTML = '<div class="empty-state">لم يخض الدارس أي نزول ميداني أو تقييمات عملية حتى الآن.</div>';

return;

}

evals.forEach(ev => {

let badgeColor = ev.totalScore >= 75 ? 'var(--success)' : 'var(--warning)';

box.innerHTML += `

<div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; margin-bottom:6px; font-size:12px;">

<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">

<strong style="color:var(--primary); font-size:13px;">${escapeHtml(ev.lessonTitle)} (${escapeHtml(ev.className)})</strong>

<span class="role-badge" style="background:${badgeColor}; font-size:11px;">${ev.totalScore} / 100</span>

</div>

<div style="color:#636e72; font-size:11px; margin:3px 0;">التاريخ: ${escapeHtml(ev.date)} | المشرف المقيم: <strong>${escapeHtml(ev.supervisor)}</strong></div>

<div style="font-size:11px; color:#2d3436; background:#f1f2f6; padding:4px 6px; border-radius:4px; margin-top:4px;">

تحضير: ${escapeHtml(ev.details.prep)} | أداء: ${escapeHtml(ev.details.deliv)} | وسيلة: ${escapeHtml(ev.details.aids)} | قدوة: ${escapeHtml(ev.details.cond)}

${ev.notes ? `<div style="margin-top:2px; font-style:italic;">ملاحظات: ${escapeHtml(ev.notes)}</div>` : ''}

</div>

</div>

`;

});

}

// ==========================================


// 25. ماسح QR للبحث

// ==========================================

let qrSearchScanner = null;

async function openQrSearchModal() {

document.getElementById('qrSearchModal').style.display = 'flex';

try {

if (typeof Html5Qrcode === 'undefined') {

showToast("⏳ جاري تهيئة قارئ الكارنيه...");

await ensureHtml5QrLoaded().catch(() => {});

}

if (qrSearchScanner) {

try { await qrSearchScanner.stop(); } catch(e){ console.warn("[خدمتي برو]", e); }

}

qrSearchScanner = new Html5Qrcode("qrSearchReader");

const config = { fps: 10, qrbox: { width: 200, height: 200 } };

await qrSearchScanner.start({ facingMode: "environment" }, config, onQrSearchSuccess, () => {});

} catch (e) {

alert("تعذر تشغيل الكاميرا الخاصة بالبحث: " + e);

closeQrSearchModal();

}

}

function onQrSearchSuccess(scannedText) {

scannedText = scannedText.trim();

let targetName = scannedText.includes('/') ? scannedText.split('/')[0].trim() : scannedText;

let member = members.find(m => {

let mName = m.name ? m.name.trim().toLowerCase() : "";

let mCode = m.code ? m.code.toString().trim() : "";

let mId = m.id ? m.id.toString().trim() : "";

let mQr = m.qrCode ? m.qrCode.toLowerCase() : "";

return (mCode === scannedText || mName === targetName.toLowerCase() || mQr === scannedText.toLowerCase() || mId === scannedText);

});

if (member) {

playBeepSound('success');

closeQrSearchModal(); // ✅ الإغلاق فقط عند النجاح

openProfile(member.id);

} else {

playBeepSound('error');

showToast("❌ لم يتم العثور على أي دارس مطابق. جرّب مرة أخرى.", true);

// ✅ لا نغلق الماسح - يبقى مفتوحاً للمحاولة مرة أخرى

}

}

async function closeQrSearchModal() {

if (qrSearchScanner) {

try {

await qrSearchScanner.stop();

qrSearchScanner.clear();

} catch(e){ console.warn("[خدمتي برو]", e); }

qrSearchScanner = null;

}

document.getElementById('qrSearchModal').style.display = 'none';

}

// ==========================================


// 28. حذف جماعي

// ==========================================

async function clearAllMembers() {
            let isUserAdmin = (typeof AuthClient !== 'undefined' && AuthClient.getUserRole && AuthClient.getUserRole() === 'admin') || (typeof currentPermission !== 'undefined' && currentPermission === 'admin');
            if (!isUserAdmin) {
                return alert("⚠️ عذراً، تفريغ كشف الدارسين متاح فقط لأمين الخدمة.");
            }

            if (!confirm("⚠️ تحذير شديد الأهمية: هل أنت متأكد تماماً من تفريغ وحذف جميع المخدومين والدارسين نهائياً؟\nهذا الإجراء سيفرغ كشف الخدمة بالكامل لبدء دورة جديدة.")) {
                return;
            }

            members = [];
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
            let pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC)) || {};
            delete pending['members'];
            localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
            if (isFirebaseActive && fsdb) clearFirestoreCollection('members');
            logActivity("حذف المخدومين", "تصفية كاملة", "حذف كافة سجلات المخدومين");
            renderMembersList();
            renderDashboard();
            renderAttendanceCalendar();
            checkLocalStorageUsage();
            alert("✅ تم تفريغ كشف الدارسين بنجاح.");
        }

function cancelMemberAttendance(memberId) {

let m = members.find(x => x.id.toString() === memberId.toString());

let rec = (attendanceRecord[activeSelectedDate] || []).find(x => x.id.toString() === memberId.toString());

let mName = m ? m.name : (rec ? rec.name : "هذا الشخص");

if (confirm(`إلغاء تسجيل حضور (${mName}) ليوم (${activeSelectedDate})؟`)) {

attendanceRecord[activeSelectedDate] = (attendanceRecord[activeSelectedDate] || []).filter(item => item.id.toString() !== memberId.toString());

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

if (isFirebaseActive && fsdb) {

// استبدال مستند اليوم بالكامل بالقائمة المحدَّثة يحذف ضمنياً أي مفتاح لم يعد موجوداً

let partitionObj = {};

(attendanceRecord[activeSelectedDate] || []).forEach(item => {

let p = (item.code || item.id || '').toString().replace(/\D/g, '');

if (p) partitionObj[p] = item;

});

fsdb.collection('attendance').doc(activeSelectedDate).set(partitionObj)

.then(() => updateLastSyncTimestamp())

.catch(() => syncToCloud('attendance', attendanceRecord));

} else {

syncToCloud('attendance', attendanceRecord);

}

if (typeof logActivity === "function") logActivity("إلغاء حضور مخدوم", mName, `حذف حضور تاريخ ${activeSelectedDate}`);

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderAttendanceCalendar();

checkLocalStorageUsage();

showToast(`✅ تم إلغاء حضور ${mName} بنجاح`);

}

}

async function clearEntireTodayAttendance() {

let pwd = prompt(`⚠️ تنبيه خطير: أنت على وشك حذف سجل حضور يوم (${activeSelectedDate}) بالكامل!\nأدخل كلمة مرور أمين الخدمة للتأكيد:`);

if (!pwd) return;

let pwdHash = await hashPassword(pwd);

if (!isAdminPasswordValid(pwdHash, pwd)) {

return alert("❌ كلمة المرور غير صحيحة! تم إلغاء العملية.");

}

if (confirm(`هل أنت متأكد نهائياً من مسح كافة حركات حضور المخدومين ليوم (${activeSelectedDate})؟`)) {

attendanceRecord[activeSelectedDate] = [];

if (activeSelectedDate === today) servantsAttendance[today] = [];

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

if (isFirebaseActive && fsdb) {

fsdb.collection('attendance').doc(activeSelectedDate).delete().catch(() => {});

}

if (isFirebaseActive && fsdb && activeSelectedDate === today) {

fsdb.collection('servants_attendance').doc(today).delete().catch(() => {});

}

logActivity("تصفير كشف يوم", activeSelectedDate, "حذف سجل الحضور لهذا التاريخ بالكامل");

renderAttendanceTable();

renderLiveCardsFeed();

renderServantsAttendanceTable();

renderDashboard();

renderAttendanceCalendar();

checkLocalStorageUsage();

alert(`✅ تم حذف سجل حضور يوم (${activeSelectedDate}) بالكامل بنجاح!`);

}

}

// ==========================================


// 29. تبديل الأسرار الروحية

// ==========================================

function toggleSpiritualStatus(memberId, field, isChecked) {

let rec = (attendanceRecord[activeSelectedDate] || []).find(a => a.id.toString() === memberId.toString());

if (!rec) return;

let pts = field === 'communion' ? 10 : 5;

if (isChecked) {

rec[field] = true;

rec.points = (rec.points || 5) + pts;

showToast(`🕊️ تم رصد ${field === 'communion' ? 'التناول' : 'المشاركة'} (+${pts} بونص ⭐)`);

} else {

rec[field] = false;

rec.points = Math.max(5, (rec.points || 5) - pts);

}

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

let pKey = (rec.code || rec.id || '').toString().replace(/\D/g, '');

if (isFirebaseActive && fsdb) {

fsdb.collection('attendance').doc(activeSelectedDate).update({

[`${pKey}.${field}`]: isChecked,

[`${pKey}.points`]: rec.points

}).catch(() => {});

}

logActivity(`تحديث سر ${field === ' communion' ? 'التناول' : 'المشاركة'}`.replace(' communion', ' communion').replace(' communion', 'التناول'), rec.name, `${activeSelectedDate} - ${isChecked ? "تم الرصد" : "إلغاء"}`);

renderAttendanceTable();

renderDashboard();

renderMembersList();

}

// ==========================================


// 34. الملف الشخصي المبوب

// ==========================================

function switchProfileTab(tabId, btn) {

document.querySelectorAll('.profile-tab-content').forEach(el => el.style.display = 'none');

document.querySelectorAll('#profileModal button[id^="tabBtn_"]').forEach(b => {

b.style.background = '#dfe6e9';

b.style.color = '#333';

});

let targetTab = document.getElementById(tabId);

if (targetTab) targetTab.style.display = 'block';

if (btn) { btn.style.background = 'var(--primary)'; btn.style.color = 'white'; }

}

function openProfile(id) {

if (!id) return;

currentProfileId = id.toString();

let m = members.find(x => x.id && x.id.toString() === currentProfileId);

if (!m) {

console.error("لم يتم العثور على ملف المخدوم ذو المعرف:", id);

return;

}

document.getElementById('profileModal').style.display = 'flex';

let qrString = ensureMemberQrCode(m);

document.getElementById('p_name').innerText = m.name || "";

document.getElementById('p_exam_code').innerText = m.code || '-';

document.getElementById('p_stage').innerText = normalizeStageText(m.stage);

document.getElementById('p_gender').innerText = normalizeGenderText(m.gender);

document.getElementById('p_phone').innerText = m.phone || "-";

document.getElementById('p_parent_phone').innerText = m.parent_phone || "-";

document.getElementById('p_address').innerText = m.address || "-";

document.getElementById('p_area').innerText = m.area || "-";

document.getElementById('p_dob').innerText = m.dob || "-";

document.getElementById('p_confessor').innerText = m.confessor || "-";

let grad = calculateGraduationStatus(m.id);

document.getElementById('p_grad_status').innerText = `${grad.percent}% - ${grad.qualified ? 'مؤهل للتخرج' : 'غير مؤهل للتخرج'} (رصيد بونص: +${grad.bonus} نقطة)`;

document.getElementById('p_grad_status').style.color = grad.qualified ? 'green' : 'orange';

document.getElementById('p_grad_progress').style.width = `${grad.percent}%`;

document.getElementById('p_grad_progress').style.background = grad.qualified ? 'var(--success)' : 'var(--warning)';

let isAttendedToday = (attendanceRecord[activeSelectedDate] || []).some(a => a.id.toString() === m.id.toString());

let manualProfileBtn = document.getElementById('btn_profile_manual_attend');

if (manualProfileBtn) {

if (isAttendedToday) {

manualProfileBtn.innerText = `✔️ مسجل حضور في (${activeSelectedDate})`;

manualProfileBtn.disabled = true;

manualProfileBtn.style.opacity = "0.7";

} else {

manualProfileBtn.innerText = `✔️ تسجيل حضور في (${activeSelectedDate})`;

manualProfileBtn.disabled = false;

manualProfileBtn.style.opacity = "1";

manualProfileBtn.onclick = function() {

atomicRegisterAttendance(m);

openProfile(m.id);

};

}

}

let cleanPhone = formatWhatsAppPhone(m.phone);

document.getElementById('btn_wa').href = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

let spiritualMsg = encodeURIComponent(`سلام ونعمة يا ${m.name}، طمني عليك وأخبارك إيه؟ حابب أطمن على مواظبتك في سر الاعتراف والتناول وقانونك الروحي، لو محتاج أي ترتيب أو جلسة صلاة مع أبونا عرفني وربنا يديم بركته في حياتك ❤️🕊️`);

let spiritualBtn = document.getElementById('btn_spiritual_wa');

if (spiritualBtn) spiritualBtn.href = cleanPhone ? `https://wa.me/${cleanPhone}?text=${spiritualMsg}` : '#';

let vh = document.getElementById('visitationHistory');

if (vh) {

vh.innerHTML = '';

(m.visitations || []).forEach(v => {

vh.innerHTML += `<div style="border-bottom:1px solid #ddd; padding:4px 0;"><strong>${escapeHtml(v.date)} (${escapeHtml(v.by)}):</strong> ${escapeHtml(v.text)}</div>`;

});

}

let atb = document.getElementById('p_attendance_tbody');

if (atb) {

atb.innerHTML = '';

let dates = Object.keys(attendanceRecord).sort().reverse();

let hasAtt = false;

dates.forEach(d => {

let rec = (attendanceRecord[d] || []).find(a => a.id.toString() === m.id.toString());

if (rec) {

hasAtt = true;

let stat = rec.isAbsentDueToDelay ? '<span style="color:red; font-weight:bold;">تأخير شديد</span>' : (rec.isBonusEvent ? '<span style="color:var(--purple); font-weight:bold;">⭐ بونص فعالية</span>' : '<span style="color:green; font-weight:bold;">حاضر جمعة</span>');

atb.innerHTML += `<tr><td data-label="التاريخ" style="padding:8px; border:1px solid #eee;"><strong>${d}</strong></td><td data-label="الوقت" dir="ltr" style="padding:8px; border:1px solid #eee; color:var(--accent); font-weight:bold;">${rec.time}</td><td data-label="الحالة" style="padding:8px; border:1px solid #eee;">${stat}</td></tr>`;

}

});

if (!hasAtt) atb.innerHTML = '<tr><td colspan="3" class="empty-state">لم يحضر أي اجتماع حتى الآن</td></tr>';

}

let supSelect = document.getElementById('evalSupervisor');

if (supSelect) {

supSelect.innerHTML = '<option value="">اختر الخادم المشرف المقيم...</option>';

servants.forEach(s => { supSelect.innerHTML += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`; });

}

if (typeof renderFieldEvaluationsList === 'function') renderFieldEvaluationsList(m);

let qrWrapper = document.getElementById('profileQrWrapper');

if (qrWrapper) {

qrWrapper.innerHTML = '';

try {

if (typeof qrcode !== 'undefined') {

let qr = qrcode(0, 'L');

let utf8String = unescape(encodeURIComponent(qrString));

qr.addData(utf8String);

qr.make();

qrWrapper.innerHTML = qr.createImgTag(4, 8);

}

} catch (e) { console.error("فشل رسم الباركود:", e); }

}

let qrText = document.getElementById('profileQrText');

if (qrText) qrText.innerText = `QR: ${qrString}`;

let badgeBtn = document.getElementById('btn_open_official_badge');

if (badgeBtn) {

let qCode = encodeURIComponent(m.code || m.id || '');

let qName = encodeURIComponent(m.name || '');

let qStage = encodeURIComponent(m.stage || '');

let qDob = encodeURIComponent(m.dob || '');

badgeBtn.href = `barcode.html?code=${qCode}&name=${qName}&stage=${qStage}&dob=${qDob}`;

}

switchProfileTab('p_attendance_log', document.getElementById('tabBtn_attendance'));

document.getElementById('btn_delete_member').onclick = async function() {

if (currentPermission !== 'admin') return alert("متاح لأمين الخدمة فقط!");

if (confirm(`حذف ${m.name} نهائياً؟`)) {

let deletedName = m.name;

members = members.filter(x => x.id.toString() !== m.id.toString());

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

if (isFirebaseActive && fsdb) {

fsdb.collection('members').doc(String(m.id)).delete().catch(() => {});

const memberCode = String(m.code || m.id || '').trim();

if (memberCode) fsdb.collection('students').doc(memberCode).delete().catch(() => {});

}

if (typeof logActivity === 'function') logActivity("حذف مخدوم", deletedName, "حذف نهائي للملف");

closeProfile();

renderMembersList();

renderDashboard();

if (typeof checkLocalStorageUsage === 'function') checkLocalStorageUsage();

}

};

}

function closeProfile() {

const modal = document.getElementById('profileModal');

if (modal) modal.style.display = 'none';

}

// ==========================================

// 35. تعديل بيانات الدارس

// ==========================================

function openEditMemberModal() {

let m = members.find(x => x.id.toString() === currentProfileId.toString());

if (!m) return;

const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };

setVal('edit_m_code', m.code);

setVal('edit_m_name', m.name);

setVal('edit_m_stage', normalizeStageText(m.stage));

setVal('edit_m_gender', normalizeGenderText(m.gender));

setVal('edit_m_phone', m.phone);

setVal('edit_m_parent_phone', m.parent_phone);

setVal('edit_m_dob', m.dob);

setVal('edit_m_confessor', m.confessor);

setVal('edit_m_address', m.address);

setVal('edit_m_area', m.area);

setVal('edit_m_password', '');

const modal = document.getElementById('editMemberModal');

if (modal) modal.style.display = 'flex';

}

function closeEditMemberModal() {

const modal = document.getElementById('editMemberModal');

if (modal) modal.style.display = 'none';

}

async function saveEditedMember() {

let m = members.find(x => x.id.toString() === currentProfileId.toString());

if (!m) return;

const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

let newName = getVal('edit_m_name');

let newDob = getVal('edit_m_dob');

if (!newName) return alert("اسم الدارس مطلوب!");

let updatedFields = {

code: getVal('edit_m_code'),

name: newName,

stage: (document.getElementById('edit_m_stage') || {}).value || 'سنة أولى',

gender: (document.getElementById('edit_m_gender') || {}).value || 'بنين',

phone: formatWhatsAppPhone(getVal('edit_m_phone')),

parent_phone: formatWhatsAppPhone(getVal('edit_m_parent_phone')),

dob: newDob,

confessor: getVal('edit_m_confessor'),

address: getVal('edit_m_address'),

area: getVal('edit_m_area')

};

let newPwd = getVal('edit_m_password');

if (newPwd) {

if (newPwd.length < 6) return alert("كلمة المرور يجب أن لا تقل عن 6 خانات!");

updatedFields.passwordHash = await hashPassword(newPwd);

}

let bDay = "01";

if (newDob) {

let parts = newDob.split(/[-/]/);

bDay = parts[2] ? parseInt(parts[2]).toString() : "01";

}

updatedFields.qrCode = `${newName}/${bDay}`;

saveSingleMemberUpdate(m.id, updatedFields, "تعديل بيانات دارس");

closeEditMemberModal();

openProfile(m.id);

showToast("✅ تم تحديث بيانات الدارس بنجاح!");

}

// ==========================================


// 45. Rollover (الأرشفة والتخريج)

// ==========================================

function renderRolloverCandidateList() {

const tbody = document.getElementById('rolloverCandidatesTbody');

const filterStage = document.getElementById('rolloverStageFilter') ? document.getElementById('rolloverStageFilter').value : 'سنة ثانية';

if (!tbody) return;

tbody.innerHTML = '';

let targetRStage = filterStage === 'all' ? 'all' : normalizeStageText(filterStage);

let candidates = members.filter(m => (targetRStage === 'all' || normalizeStageText(m.stage) === targetRStage));

if (candidates.length === 0) {

tbody.innerHTML = '<tr><td colspan="6" class="empty-state">لا يوجد دارسين في المرحلة المحددة.</td></tr>';

return;

}

candidates.forEach(m => {

let grad = calculateGraduationStatus(m.id);

let isQualified = grad.qualified;

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="تخرج"><input type="checkbox" class="rollover-candidate-check" data-id="${m.id}" data-qualified="${isQualified}" ${isQualified ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;"></td>

<td data-label="كود"><strong>${escapeHtml(m.code) || escapeHtml(m.id)}</strong></td>

<td data-label="الاسم"><strong>${escapeHtml(m.name)}</strong></td>

<td data-label="المرحلة الحالية">${escapeHtml(normalizeStageText(m.stage))}</td>

<td data-label="نسبة الحضور"><span style="font-weight:bold; color:${isQualified ? 'green' : 'orange'};">${grad.percent}%</span> (${grad.attended}/${grad.total} جمعة)${grad.examsRequired ? (grad.examsOk ? ' — الامتحانات ✅' : ' — الامتحانات ❌') : ''}</td>

<td data-label="الحالة">${isQualified ? '<span class="role-badge" style="background:var(--success);">مؤهل للتخرج 🎓</span>' : '<span class="role-badge" style="background:var(--warning);">غير مؤهل (&lt;75%)</span>'}</td>

`;

tbody.appendChild(tr);

});

}

function selectAllRollover(mode) {

const checks = document.querySelectorAll('.rollover-candidate-check');

checks.forEach(chk => {

if (mode === 'all') chk.checked = true;

else if (mode === false) chk.checked = false;

else if (mode === true) chk.checked = (chk.getAttribute('data-qualified') === 'true');

});

}

async function executeAcademicRollover() {

if (currentPermission !== 'admin') return alert("الأرشفة وبدء السنة متاحة لأمين الخدمة العام فقط!");

let labelInput = document.getElementById('rolloverArchiveLabel');

let yearLabel = labelInput ? labelInput.value.trim() : "";

if (!yearLabel) yearLabel = `دورة_${settings.serviceStart || '2025'}_${settings.serviceEnd || '2026'}`.replace(/-/g, '_');

let checkedBoxes = document.querySelectorAll('.rollover-candidate-check:checked');

let graduatingIds = Array.from(checkedBoxes).map(c => c.getAttribute('data-id'));

let autoPromote = document.getElementById('rolloverAutoPromoteYear1').checked;

let resetAttendance = document.getElementById('rolloverResetAttendance').checked;

let confirmMsg = `⚠️ تأكيد أرشفة نهاية الدورة وبدء سنة جديدة:\n\n` +

`1. تخريج (${graduatingIds.length}) دارس ونقلهم لمرحلة "خريجين".\n` +

`2. ${autoPromote ? 'ترقية كافة دارسي "سنة أولى" إلى "سنة ثانية".' : 'عدم ترقية سنة أولى.'}\n` +

`3. ${resetAttendance ? 'أرشفة حضور السنة وتصفير الجدول.' : 'الإبقاء على الحضور.'}\n` +

`4. مسمى الأرشيف السحابي: [${yearLabel}].\n\n` +

`أدخل كلمة مرور أمين الخدمة للتأكيد النهائي:`;

let pwd = prompt(confirmMsg);

if (!pwd) return;

let pwdHash = await hashPassword(pwd);

if (!isAdminPasswordValid(pwdHash, pwd)) return alert("❌ كلمة المرور غير صحيحة! تم إلغاء العملية.");

showToast("جاري أرشفة السنة الخدمية وتحديث الدفعات... ⏳");

let archivePayload = {

archiveDate: new Date().toISOString(),

archiveLabel: yearLabel,

archivedBy: currentUser ? currentUser.name : 'أمين الخدمة',

graduatedCount: graduatingIds.length,

membersSnapshot: members,

attendanceSnapshot: attendanceRecord,

servantsAttendanceSnapshot: servantsAttendance,

masterPlanSnapshot: masterPlan,

settingsSnapshot: settings

};

if (isFirebaseActive && fsdb) {

await fsdb.collection('archive').doc(yearLabel).set(archivePayload);

}

members.forEach(m => {

if (graduatingIds.includes(m.id.toString())) m.stage = "خريجين";

else if (autoPromote && (m.stage === "سنة أولى" || !m.stage)) m.stage = "سنة ثانية";

});

if (resetAttendance) {

attendanceRecord = {};

servantsAttendance = {};

activeSelectedDate = today;

if (!attendanceRecord[today]) attendanceRecord[today] = [];

if (!servantsAttendance[today]) servantsAttendance[today] = [];

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

if (isFirebaseActive && fsdb) {

try {

const attSnap = await fsdb.collection('attendance').get();

let batch = fsdb.batch(), n = 0;

for (const doc of attSnap.docs) {

batch.delete(doc.ref); n++;

if (n === 450) { await batch.commit(); batch = fsdb.batch(); n = 0; }

}

if (n > 0) await batch.commit();

} catch (e) { console.warn('تعذر حذف سجل الحضور بالكامل من Firestore:', e.code || e.message); }

}

if (isFirebaseActive && fsdb) {

try {

const saSnap = await fsdb.collection('servants_attendance').get();

let batch = fsdb.batch(), n = 0;

for (const doc of saSnap.docs) {

batch.delete(doc.ref); n++;

if (n === 450) { await batch.commit(); batch = fsdb.batch(); n = 0; }

}

if (n > 0) await batch.commit();

} catch (e) { console.warn('تعذر حذف سجل حضور الخدام بالكامل من Firestore:', e.code || e.message); }

}

}

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

syncToCloud('members', members);

logActivity("أرشفة دورة وتخريج", yearLabel, `تخريج ${graduatingIds.length} دارس وترحيل الدفعات`);

renderMembersList();

renderAttendanceTable();

renderLiveCardsFeed();

renderServantsAttendanceTable();

renderDashboard();

renderRolloverCandidateList();

renderAttendanceCalendar();

checkLocalStorageUsage();

alert(`🎉 تم بنجاح أرشفة دورة [${yearLabel}]، تخريج الدفعة، وبدء السنة الخدمية الجديدة!`);

}

// ==========================================

// 46. استيراد المخدومين من Excel

// ==========================================

function downloadTemplate(type) {

let headers = [], sampleRow = [], fileName = "";

if (type === 'members') {

headers = ["الاسم", "email", "العنوان", "رقم التليون", "رقم تليفون ولي الامر", "تاريخ الميلاد اليوم", "تاريخ الميلاد الشهر", "تاريخ الميلاد السنه", "اب الاعتراف", "كود الامتحان", " نقاط", "Qr Code"];

sampleRow = ["أنطون وصفي جابر يوسف", "antonewasfy2003@gmail.com", "46 شارع ترعة الغزالي المطرية", "01200167311", "", "2", "11", "2003", "ابونا رفائيل نظمى", "664", "", "أنطون وصفي جابر يوسف/2"];

fileName = "نموذج_استيراد_المخدومين.xlsx";

} else {

headers = ["كود الخادم", "الاسم", "رقم الهاتف", "تاريخ الميلاد (YYYY-MM-DD)"];

sampleRow = ["101", "عادل جورج", "01200000000", "1995-05-15"];

fileName = "نموذج_استيراد_الخدام.xlsx";

}

let ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

ws['!cols'] = headers.map(() => ({ wch: 18 }));

let wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Template");

XLSX.writeFile(wb, fileName);

}

async function importMembers() {

await ensureXlsxLoaded().catch(() => {});

let file = document.getElementById('importFile').files[0];

if (!file) return alert("اختر ملف إكسيل أولاً");

let reader = new FileReader();

reader.onload = function(e) {

let wb = XLSX.read(new Uint8Array(e.target.result), {type: 'array'});

let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

let addedCount = 0;

let updatedCount = 0;

data.forEach(r => {

let name = r['الاسم'] || r['Name'] || "بدون اسم";

let examCode = r['كود الامتحان'] || r['كود'] || r['Code'] || "";

let rawP = r['رقم التليون'] || r['رقم الهاتف'] || r['الهاتف'] || "";

let cleanPhone = formatWhatsAppPhone(rawP);

let cleanParentPhone = formatWhatsAppPhone(r['رقم تليفون ولي الامر'] || rawP);

let bDay = r['تاريخ الميلاد اليوم'] || "";

let bMonth = r['تاريخ الميلاد الشهر'] || "";

let bYear = r['تاريخ الميلاد السنه'] || "";

let fullDob = "";

if (bYear && bMonth && bDay) fullDob = `${bYear}-${String(bMonth).padStart(2, '0')}-${String(bDay).padStart(2, '0')}`;

else if (r['تاريخ الميلاد']) fullDob = r['تاريخ الميلاد'];

let dayNum = bDay ? parseInt(bDay).toString() : (fullDob ? parseInt(fullDob.split('-')[2] || "1").toString() : "1");

let qrCodeVal = r['Qr Code'] || `${name.trim()}/${dayNum}`;

let address = r['العنوان'] || "";

let confessor = r['اب الاعتراف'] || "";

let existingMember = findExistingMember(examCode, name);

if (existingMember) {

existingMember.code = examCode ? examCode.toString().trim() : existingMember.code;

existingMember.qrCode = qrCodeVal;

existingMember.phone = cleanPhone || existingMember.phone;

existingMember.parent_phone = cleanParentPhone || existingMember.parent_phone;

existingMember.address = address || existingMember.address;

existingMember.dob = fullDob || existingMember.dob;

existingMember.confessor = confessor || existingMember.confessor;

updatedCount++;

} else {

members.push({

id: generateUniqueId(members),

code: examCode ? examCode.toString().trim() : (Date.now() % 10000).toString(),

qrCode: qrCodeVal, name: name,

stage: "سنة أولى", gender: "بنين",

phone: cleanPhone, parent_phone: cleanParentPhone,

address: address, dob: fullDob, confessor: confessor,

other_data: "", visitations: [], fieldEvaluations: []

});

addedCount++;

}

});

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

syncToCloud('members', members);

logActivity("استيراد مخدومين", "Excel", `إضافة ${addedCount} وتحديث ${updatedCount}`);

renderMembersList();

renderDashboard();

checkUpcomingBirthdays();

renderAttendanceCalendar();

checkLocalStorageUsage();

alert(`✅ اكتمل الاستيراد!\n\nتمت إضافة: ${addedCount} دارس جديد.\nتم تحديث: ${updatedCount} دارس موجود مسبقاً.`);

document.getElementById('importFile').value = '';

};

reader.readAsArrayBuffer(file);

}

// ==========================================

// 47. نموذج إضافة دارس جديد

// ==========================================

document.getElementById('addForm').addEventListener('submit', function(e) {

e.preventDefault();

let examCode = document.getElementById('m_code').value.trim();

let name = document.getElementById('m_name').value.trim();

let dob = document.getElementById('m_dob').value;

let bDay = "01";

if (dob) {

let parts = dob.split('-');

bDay = parts[2] ? parseInt(parts[2]).toString() : "01";

}

let generatedQr = `${name}/${bDay}`;

let existingMember = findExistingMember(examCode, name);

if (existingMember) {

alert(`❌ هذا الشخص مسجل بالفعل في المنظومة!\nالاسم: ${existingMember.name}\nكود الامتحان: ${existingMember.code}`);

return;

}

let newMember = {

id: Date.now(), code: examCode, qrCode: generatedQr, name: name,

gender: document.getElementById('m_gender').value,

stage: document.getElementById('m_stage').value,

phone: formatWhatsAppPhone(document.getElementById('m_phone').value),

parent_phone: formatWhatsAppPhone(document.getElementById('m_parent_phone').value),

address: document.getElementById('m_address').value,

area: (document.getElementById('m_area').value || '').trim(),

dob: dob,

confessor: document.getElementById('m_confessor').value,

other_data: document.getElementById('m_other').value,

visitations: [], fieldEvaluations: []

};

members.push(newMember);

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

if (isFirebaseActive && fsdb) {

fsdb.collection('members').doc(String(newMember.id)).set(newMember).catch(() => syncToCloud('members', members));

const memberCode = String(newMember.code || newMember.id || '').trim();

if (memberCode) {

fsdb.collection('students').doc(memberCode).set(newMember, { merge: true }).catch(() => {});

}

}

logActivity("إضافة دارس جديد", name, `كود: ${examCode} - مرحلة: ${newMember.stage}`);

this.reset();

renderMembersList();

renderDashboard();

checkUpcomingBirthdays();

renderAttendanceCalendar();

checkLocalStorageUsage();

showToast(`تمت إضافة الدارس بنجاح بكود امتحان: ${examCode}`);

});

// ==========================================

// 48. تحويل جماعي للمراحل

// ==========================================

function batchTransferStage() {

if (currentPermission !== 'admin') return alert("تحويل المراحل متاح لأمين الخدمة فقط!");

let sourceStage = document.getElementById('stageFilterSelect').value;

let gradFilter = document.getElementById('gradFilterSelect').value;

let targetStage = document.getElementById('targetStageSelect').value;

if (sourceStage === 'all') return alert("يرجى اختيار مرحلة محددة أولاً (مثلاً: سنة أولى)!");

let normSource = normalizeStageText(sourceStage);

let count = 0;

members.forEach(m => {

if (normalizeStageText(m.stage) === normSource) {

let isQualified = calculateGraduationStatus(m.id).qualified;

let shouldTransfer = (gradFilter === 'all') ||

(gradFilter === 'qualified' && isQualified) ||

(gradFilter === 'unqualified' && !isQualified);

if (shouldTransfer) { m.stage = targetStage; count++; }

}

});

let msg = gradFilter === 'qualified' ? "المؤهلين فقط" : (gradFilter === 'unqualified' ? "غير المؤهلين فقط" : "الكل");

if (confirm(`هل أنت متأكد من تحويل دارسي (${sourceStage}) [${msg}] وعددهم [${count}] إلى مرحلة (${targetStage})؟`)) {

localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

syncToCloud('members', members);

logActivity("تحويل دفعات", `${sourceStage} إلى ${targetStage}`, `نقل ${count} فرد`);

document.getElementById('stageFilterSelect').value = targetStage;

document.getElementById('gradFilterSelect').value = 'all';

renderMembersList();

renderDashboard();

checkLocalStorageUsage();

alert(`✅ تم نقل (${count}) فرد بنجاح!`);

}

}

// ==========================================

