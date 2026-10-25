/**
 * Khedmty-Plus Dashboard - Attendance Management Module
 * Extracted for offline PWA performance & modular maintainability.
 */


// 10. تسجيل الحضور الذري

// ==========================================

function atomicRegisterAttendance(member) {

let pKey = (member.code || member.id || '').toString().replace(/\D/g, '');

let now = new Date();

let isFri = isFridaySession(activeSelectedDate);

let isSummerDay = settings.summerActive && (new Date(activeSelectedDate).getDay().toString() === settings.summerDay);

let isAbsent = false;

if (!isFri || (isSummerDay && settings.ignoreSummerDelay)) {

isAbsent = false;

} else {

let startTimeStr = settings.startTime || "13:00";

let [startH, startM] = startTimeStr.split(':').map(Number);

let diffMinutes = (now.getHours() * 60 + now.getMinutes()) - (startH * 60 + startM);

isAbsent = diffMinutes >= (settings.absentAfter || 75);

}

let defaultPts = calculateBonusPointsForDate((typeof activeDate !== "undefined" && activeDate) ? activeDate : today, isFri);

let newRecord = {

id: member.id,

code: member.code || member.id,

name: member.name,

phone: member.phone || "",

stage: member.stage || 'سنة أولى',

gender: member.gender || 'بنين',

time: now.toLocaleTimeString('ar-EG'),

isAbsentDueToDelay: isAbsent,

attended: true,

communion: false,

participation: false,

points: defaultPts,

isBonusEvent: !isFri,

scannedBy: currentUser ? currentUser.name : 'خادم'

};

if (!attendanceRecord[activeSelectedDate]) attendanceRecord[activeSelectedDate] = [];

let localExisting = attendanceRecord[activeSelectedDate].find(a => a.id.toString() === member.id.toString());

if (localExisting) {

playBeepSound('error');

showToast(`⚠️ مسجل بالفعل في (${activeSelectedDate}): ${member.name}`, true);

return;

}

attendanceRecord[activeSelectedDate].unshift(newRecord);

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderAttendanceCalendar();

showKioskWelcome(member, isAbsent, 'member');

if (!isFirebaseActive || !fsdb) {

syncToCloud('attendance', attendanceRecord);

if (isAbsent) {

playBeepSound('error');

showToast(`⚠️ ${member.name} (تأخير شديد)`, true);

} else {

playBeepSound('success');

showToast(`✅ تم تسجيل حضور: ${member.name} (${activeSelectedDate})`);

}

logActivity("تسجيل حضور (أوفلاين)", member.name, `${activeSelectedDate} - ${isAbsent ? "تأخير" : "حاضر"}`);

return;

}

// Firestore: معاملة (transaction) تقرأ وتكتب بشكل ذري لمنع تسجيل نفس المخدوم مرتين في نفس اللحظة

let attDayRef = fsdb.collection('attendance').doc(activeSelectedDate);

fsdb.runTransaction(tx => tx.get(attDayRef).then(snap => {

let data = snap.exists ? (snap.data() || {}) : {};

if (data[pKey]) return { conflict: true, existing: data[pKey] };

tx.set(attDayRef, { [pKey]: newRecord }, { merge: true });

return { conflict: false };

})).then(result => {

if (result.conflict) {

playBeepSound('error');

let recordedBy = result.existing ? result.existing.scannedBy : 'خادم آخر';

showToast(`⚠️ مسجل مسبقاً في (${activeSelectedDate}) بواسطة: ${recordedBy}`, true);

} else {

playBeepSound('success');

showToast(`✅ تم توثيق حضور: ${member.name} سحابياً`);

logActivity("تسجيل حضور", member.name, `تاريخ: ${activeSelectedDate}`);

}

updateLastSyncTimestamp();

renderAttendanceCalendar();

}).catch(() => {

showToast("❌ خطأ أثناء المزامنة السحابية", true);

});

}

// ==========================================

// 11. عرض الرسم البياني الحراري

// ==========================================

function renderAttendanceHeatmap() {

const container = document.getElementById('heatmapContainer');

const badge = document.getElementById('attritionCountBadge');

if (!container) return;

container.innerHTML = '';

let fridayDates = Object.keys(attendanceRecord).filter(d => isFridaySession(d)).sort().reverse();

let recentDates = fridayDates.slice(0, 4);

if (recentDates.length === 0) {

container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">لا توجد سجلات جمعة كافية لبناء الخريطة.</div>';

if (badge) badge.style.display = 'none';

return;

}

let riskCount = 0;

members.forEach(m => {

let attendedCount = 0;

let delayedCount = 0;

let historyBlocks = [];

[...recentDates].reverse().forEach(d => {

let rec = (attendanceRecord[d] || []).find(a => a.id.toString() === m.id.toString());

if (rec) {

if (rec.isAbsentDueToDelay) {

delayedCount++;

historyBlocks.push('<span title="' + d + ': تأخير شديد" style="display:inline-block; width:18px; height:18px; background:#e17055; border-radius:3px; margin:0 2px;"></span>');

} else {

attendedCount++;

historyBlocks.push('<span title="' + d + ': حاضر" style="display:inline-block; width:18px; height:18px; background:#00b894; border-radius:3px; margin:0 2px;"></span>');

}

} else {

historyBlocks.push('<span title="' + d + ': غائب" style="display:inline-block; width:18px; height:18px; background:#dfe6e9; border:1px solid #b2bec3; border-radius:3px; margin:0 2px;"></span>');

}

});

let statusTag = "";

let isAtRisk = false;

let lastTwoAbsent = recentDates.length >= 2 &&

!(attendanceRecord[recentDates[0]] || []).some(x => x.id.toString() === m.id.toString()) &&

!(attendanceRecord[recentDates[1]] || []).some(x => x.id.toString() === m.id.toString());

if (attendedCount === 0 || lastTwoAbsent) {

statusTag = '<span style="color:var(--danger); font-weight:bold; font-size:11px;">🔴 خطر تسرب مرتفع</span>';

isAtRisk = true; riskCount++;

} else if (attendedCount <= 1 || delayedCount >= 2) {

statusTag = '<span style="color:#d35400; font-weight:bold; font-size:11px;">🟡 تذبذب وتراجع</span>';

isAtRisk = true; riskCount++;

}

if (isAtRisk) {

let cleanPhone = formatWhatsAppPhone(m.phone);

let waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent('سلام ونعمة يا ' + m.name + '، بنطمن عليك ومستنيينك في اجتماعنا يوم الجمعة القادم ❤️')}` : '#';

let card = document.createElement('div');

card.style.cssText = "background:#fbfbfb; border:1px solid #eee; border-left:4px solid " + (attendedCount === 0 ? 'var(--danger)' : 'var(--warning)') + "; border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;";

card.innerHTML = `

<div>

<div style="font-weight:bold; font-size:13px; color:var(--dark);">${m.name} (كود: ${m.code || m.id})</div>

<div style="font-size:11px; color:#636e72; margin:2px 0;">${m.stage || 'سنة أولى'} • ${statusTag}</div>

<div style="display:flex; align-items:center; margin-top:4px;">${historyBlocks.join('')}</div>

</div>

<div><a href="${waLink}" target="_blank" class="btn-mini btn-success" style="padding:5px 9px;">افتقاد 💬</a></div>

`;

container.appendChild(card);

}

});

if (badge) {

badge.innerText = `${riskCount} معرض للانقطاع`;

badge.style.display = riskCount > 0 ? 'inline-block' : 'none';

}

if (riskCount === 0) {

container.innerHTML = '<div style="color:var(--success); font-weight:bold; font-size:12px; padding:6px 0;">🌟 رائع! لا توجد مؤشرات تسرب أو تراجع في الالتزام حالياً.</div>';

}

}

// ==========================================


// 14. عرض جدول الحضور

// ==========================================

function renderAttendanceTable() {

const tbody = document.querySelector('#attendanceTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

let count = 0;

let list = attendanceRecord[activeSelectedDate] || [];

if (list.length === 0) {

tbody.innerHTML = '<tr><td colspan="10" class="empty-state">لا توجد أي حركات حضور مسجلة لهذا التاريخ.</td></tr>';

}

list.forEach(a => {

count++;

let tr = document.createElement('tr');

let status = a.isAbsentDueToDelay ? '<span style="color:red">تأخير شديد</span>' : (a.isBonusEvent ? '<span style="color:var(--purple); font-weight:bold;">⭐ بونص فعالية</span>' : '<span style="color:green">حاضر</span>');

let editTimeBtn = (currentPermission === 'admin')

? `<button class="btn-mini btn-warning" onclick="editAttendanceTime('${a.id}')" style="padding:2px 5px; font-size:10px; margin-right:4px;">✏️</button>`

: '';

tr.innerHTML = `

<td data-label="كود الامتحان"><strong style="color:var(--primary); font-size:14px;">${escapeHtml(a.code) || escapeHtml(a.id)}</strong></td>

<td data-label="الاسم">${escapeHtml(a.name)}</td>

<td data-label="المرحلة">${escapeHtml(a.stage) || '-'}</td>

<td data-label="وقت المسح" dir="ltr">${escapeHtml(a.time)} ${editTimeBtn}</td>

<td data-label="حضور">${status}</td>

<td data-label="تناول 🕊️"><input type="checkbox" ${a.communion ? 'checked' : ''} onchange="toggleSpiritualStatus('${a.id}', 'communion', this.checked)" style="width:18px; height:18px; cursor:pointer;"></td>

<td data-label="مشاركة 💡"><input type="checkbox" ${a.participation ? 'checked' : ''} onchange="toggleSpiritualStatus('${a.id}', 'participation', this.checked)" style="width:18px; height:18px; cursor:pointer;"></td>

<td data-label="النقاط ⭐"><strong style="color:var(--accent);">${a.points || 5}</strong></td>

<td data-label="المسجِّل">${escapeHtml(a.scannedBy) || '-'}</td>

<td data-label="إجراء" class="can-attend"><button class="btn-mini btn-danger" onclick="cancelMemberAttendance('${a.id}')">إلغاء ❌</button></td>

`;

tbody.insertBefore(tr, tbody.firstChild);

});

const elCount = document.getElementById('todayAttendanceCount');

if (elCount) elCount.innerText = count;

let todayDateEl = document.getElementById('todayDate');

if (todayDateEl) {

let isFri = isFridaySession(activeSelectedDate);

let label = isFri ? "(اجتماع الجمعة)" : "(نشاط إضافي / بونص ⭐)";

todayDateEl.innerText = `${activeSelectedDate} ${label} ${activeSelectedDate === today ? '• اليوم' : ''}`;

}

let searchActiveBadge = document.getElementById('searchActiveDateBadge');

if (searchActiveBadge) searchActiveBadge.innerText = activeSelectedDate;

updateRoleUI();

}

// ==========================================

// 15. التقويم التفاعلي

// ==========================================

function renderAttendanceCalendar() {

const grid = document.getElementById('attendanceCalendarGrid');

const monthLabel = document.getElementById('calendarCurrentMonthLabel');

if (!grid) return;

grid.innerHTML = '';

const year = calendarDisplayDate.getFullYear();

const month = calendarDisplayDate.getMonth();

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

if (monthLabel) monthLabel.innerText = `${monthNames[month]} ${year}`;

const dayHeaders = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

dayHeaders.forEach(dh => {

let th = document.createElement('div');

th.style.cssText = "font-weight:bold; font-size:11px; color:#636e72; padding:4px 0;";

th.innerText = dh;

grid.appendChild(th);

});

const firstDayIndex = (new Date(year, month, 1).getDay() + 1) % 7;

const totalDays = new Date(year, month + 1, 0).getDate();

for (let i = 0; i < firstDayIndex; i++) {

grid.appendChild(document.createElement('div'));

}

for (let d = 1; d <= totalDays; d++) {

let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

let isToday = (dateStr === today);

let isSelected = (dateStr === activeSelectedDate);

let hasRecords = (attendanceRecord[dateStr] && attendanceRecord[dateStr].length > 0);

let isFri = isFridaySession(dateStr);

let cell = document.createElement('div');

cell.style.cssText = `padding: 8px 4px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s; position: relative; background: #f8f9fa; border: 1px solid #dfe6e9;`;

if (hasRecords) {

if (isFri) { cell.style.background = "var(--success)"; cell.style.color = "#fff"; }

else { cell.style.background = "var(--purple)"; cell.style.color = "#fff"; }

} else if (isFri) {

cell.style.background = "#fff3cd"; cell.style.color = "#856404";

}

if (isToday) cell.style.boxShadow = "0 0 0 2px var(--accent)";

if (isSelected) cell.style.outline = "2px solid #2d3436";

let attCount = hasRecords ? attendanceRecord[dateStr].length : 0;

cell.innerHTML = `<div>${d}</div>${hasRecords ? `<div style="font-size:10px; opacity:0.9;">(${attCount})</div>` : ''}`;

cell.onclick = () => selectAttendanceDate(dateStr);

grid.appendChild(cell);

}

}

function changeCalendarMonth(offset) {

calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() + offset);

renderAttendanceCalendar();

}

async function selectAttendanceDate(dateStr) {

activeSelectedDate = dateStr;

if (!attendanceRecord[activeSelectedDate]) attendanceRecord[activeSelectedDate] = [];

renderAttendanceTable();

renderLiveCardsFeed();

renderAttendanceCalendar();

showToast(`📅 تم فتح سجل تاريخ: ${dateStr}`);

// ترشيد استهلاك السحابة: إذا لم يكن هذا اليوم محملاً محلياً، نجلبه سحابياً عند الطلب فقط (وثيقة واحدة)

if (isFirebaseActive && fsdb && (!attendanceRecord[dateStr] || attendanceRecord[dateStr].length === 0)) {

try {

const snap = await fsdb.collection('attendance').doc(dateStr).get();

if (snap.exists) {

const dayData = Object.values(snap.data() || {}).filter(Boolean);

if (dayData.length > 0) {

attendanceRecord[dateStr] = dayData;

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

renderAttendanceTable();

renderLiveCardsFeed();

renderAttendanceCalendar();

showToast(`✅ تم جلب حضور (${dateStr}) سحابياً`);

}

}

} catch (e) {}

}

}

async function loadFullAttendanceHistory(btnEl) {

if (!isFirebaseActive || !fsdb) {

showToast("⚠️ لا يوجد اتصال سحابي حالياً", true);

return;

}

if (btnEl) {

btnEl.disabled = true;

btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري جلب كامل سجلات السنة...';

}

try {

const fullSnap = await fsdb.collection('attendance').get();

let fullFormatted = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || {};

fullSnap.forEach(doc => {

fullFormatted[doc.id] = Object.values(doc.data() || {}).filter(Boolean);

});

attendanceRecord = fullFormatted;

if (!attendanceRecord[today]) attendanceRecord[today] = [];

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderAttendanceCalendar();

showToast(`✅ تم جلب السجل التاريخي بالكامل (${fullSnap.size} يوماً) وتخزينه محلياً`);

} catch (e) {

console.error(e);

showToast("❌ تعذر جلب السجل الكامل: " + (e.message || ''), true);

} finally {

if (btnEl) {

btnEl.disabled = false;

btnEl.innerHTML = '🔄 جلب السجل الكامل';

}

}

}


// 19. تعديل وقت الحضور

// ==========================================

async function editAttendanceTime(memberId) {

if (currentPermission !== 'admin') return alert("عفواً، تعديل وقت الحضور متاح لأمين الخدمة العام فقط!");

let rec = (attendanceRecord[activeSelectedDate] || []).find(a => a.id.toString() === memberId.toString());

if (!rec) return;

let newTimeInput = prompt(`تعديل وقت حضور (${rec.name}) لتاريخ (${activeSelectedDate}):\nاكتب الوقت بصيغة (HH:MM) مثل 01:15 أو 13:30`, rec.time || "13:00");

if (!newTimeInput) return;

let timeParts = newTimeInput.trim().split(':');

if (timeParts.length < 2) return alert("❌ صيغة الوقت غير صحيحة!");

let h = parseInt(timeParts[0]);

let m = parseInt(timeParts[1]);

if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return alert("❌ أرقام الساعة أو الدقائق غير منطقية!");

let formattedDisplayTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

let oldTime = rec.time;

rec.time = formattedDisplayTime;

let isFri = isFridaySession(activeSelectedDate);

let isSummerDay = settings.summerActive && (new Date(activeSelectedDate).getDay().toString() === settings.summerDay);

if (!isFri || (isSummerDay && settings.ignoreSummerDelay)) {

rec.isAbsentDueToDelay = false;

} else {

let startTimeStr = settings.startTime || "13:00";

let [startH, startM] = startTimeStr.split(':').map(Number);

let diffMinutes = (h * 60 + m) - (startH * 60 + startM);

rec.isAbsentDueToDelay = diffMinutes >= (settings.absentAfter || 75);

}

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

let pKey = (rec.code || rec.id || '').toString().replace(/\D/g, '');

if (isFirebaseActive && fsdb) {

fsdb.collection('attendance').doc(activeSelectedDate).update({

[`${pKey}.time`]: formattedDisplayTime,

[`${pKey}.isAbsentDueToDelay`]: rec.isAbsentDueToDelay

}).catch(() => {});

}

logActivity("تعديل وقت حضور", rec.name, `تاريخ: ${activeSelectedDate} من ${oldTime} إلى ${formattedDisplayTime}`);

renderAttendanceTable();

renderLiveCardsFeed();

renderDashboard();

showToast(`✅ تم تعديل وقت الحضور إلى (${formattedDisplayTime})`);

}


// 24. Kiosk ونافذة الترحيب

// ==========================================

function showKioskWelcome(person, isAbsent, type = 'member') {

const card = document.getElementById('kioskCard');

const icon = document.getElementById('kioskIcon');

const name = document.getElementById('kioskName');

const badge = document.getElementById('kioskBadge');

const stats = document.getElementById('kioskStats');

const reflectionBox = document.getElementById('kioskReflectionBox');

if (!card) return;

if (reflectionBox) reflectionBox.innerHTML = '';

if (type === 'servant') {

icon.innerText = "👔";

name.innerText = person.name;

badge.innerText = "خادم مسجل";

badge.style.background = "var(--primary)";

stats.innerHTML = `تم تسجيل حضورك في تمام <strong>${new Date().toLocaleTimeString('ar-EG')}</strong><br>خدمة مباركة ومثمرة! 🕊️`;

} else {

let grad = calculateGraduationStatus(person.id);

if (isAbsent) {

icon.innerText = "⚠️";

name.innerText = person.name;

badge.innerText = "تأخير شديد";

badge.style.background = "var(--danger)";

stats.innerHTML = `كود الامتحان: <strong>${escapeHtml(person.code) || escapeHtml(person.id)}</strong><br>تم رصد حضورك متأخراً في <strong>${new Date().toLocaleTimeString('ar-EG')}</strong><br>نسبة الحضور: <strong>${grad.percent}%</strong>`;

} else {

icon.innerText = "✨";

name.innerText = person.name;

badge.innerText = `حاضر - ${person.stage || 'سنة أولى'}`;

badge.style.background = "var(--success)";

stats.innerHTML = `كود الامتحان: <strong>${escapeHtml(person.code) || escapeHtml(person.id)}</strong><br>نورت كورس إعداد الخدام! 🎉<br>نسبة حضور الجمعة: <strong>${grad.percent}%</strong> (${grad.attended}/${grad.total} لقاء)<br>رصيد بونص: <strong>+${grad.bonus} نقطة</strong>`;

}

// تقييم ذاتي روحي اختياري - يدوسه الدارس بنفسه في نفس لحظة تسجيل حضوره

if (reflectionBox) {

let starsRow = [1,2,3,4,5].map(n =>

`<span onclick="submitSelfReflection('${person.id}', '${escapeHtml(person.name).replace(/'/g, "\\'")}', ${n})" style="cursor:pointer; font-size:26px; padding:0 2px;" title="${n} من 5">⭐</span>`

).join('');

reflectionBox.innerHTML = `

<div style="border-top:1px dashed #dfe6e9; padding-top:8px; margin-top:6px;">

<div style="font-size:12px; color:#636e72; margin-bottom:5px;">🙏 إزاي حاسس روحيًا النهاردة؟ (اختياري - دوس على عدد النجوم)</div>

<div style="text-align:center;">${starsRow}</div>

</div>`;

}

}

card.style.display = 'block';

let hideDelay = (type === 'member' && !isAbsent) ? 9000 : 2500;

setTimeout(() => { card.style.display = 'none'; }, hideDelay);

}

// ==========================================


// 26. كود الطوارئ (WhatsApp)

// ==========================================

function exportTodaySessionToWhatsApp(adminPhone = "") {

let todayData = {

date: activeSelectedDate,

servant: currentUser ? currentUser.name : 'غير محدد',

attendance: attendanceRecord[activeSelectedDate] || [],

servantsAtt: servantsAttendance[today] || []

};

if (todayData.attendance.length === 0 && todayData.servantsAtt.length === 0) {

return alert("لا توجد أي حركات حضور مسجلة لهذا التاريخ لتصديرها!");

}

let targetPhone = adminPhone;

if (!targetPhone || targetPhone === "") {

let adminObj = servants.find(s => s.role === 'admin' || s.permission === 'admin');

targetPhone = adminObj ? adminObj.phone : (settings.adminWhatsApp || "201200000000");

}

targetPhone = formatWhatsAppPhone(targetPhone);

let payload = btoa(unescape(encodeURIComponent(JSON.stringify(todayData))));

let msg = `🚨 *تقرير طوارئ حضور كورس الخدام (${activeSelectedDate})*\nمسجل بواسطة: ${todayData.servant}\nعدد الحاضرين: ${todayData.attendance.length}\nعدد الخدام: ${todayData.servantsAtt.length}\n\n*كود المزامنة (انسخه بالكامل):*\n\`\`\`${payload}\`\`\``;

window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');

}

function importFromEmergencyCode() {

let code = prompt("الصق كود المزامنة المستلم من رسالة الواتساب هنا:");

if (!code) return;

try {

let decodedStr = decodeURIComponent(escape(atob(code.trim())));

let imported = JSON.parse(decodedStr);

if (!imported.date || !imported.attendance) return alert("❌ كود غير صالح أو تالف!");

let targetDate = imported.date;

if (!attendanceRecord[targetDate]) attendanceRecord[targetDate] = [];

if (!servantsAttendance[targetDate]) servantsAttendance[targetDate] = [];

imported.attendance.forEach(newItem => {

if (!attendanceRecord[targetDate].some(x => x.id.toString() === newItem.id.toString())) {

attendanceRecord[targetDate].push(newItem);

}

});

imported.servantsAtt.forEach(newServ => {

if (!servantsAttendance[targetDate].some(x => x.id.toString() === newServ.id.toString())) {

servantsAttendance[targetDate].push(newServ);

}

});

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

syncToCloud('attendance', attendanceRecord);

syncToCloud('servants_attendance', servantsAttendance);

logActivity("استيراد كود طوارئ", targetDate, `استيراد ${imported.attendance.length} حضور`);

renderAttendanceTable();

renderLiveCardsFeed();

renderServantsAttendanceTable();

renderDashboard();

renderAttendanceCalendar();

checkLocalStorageUsage();

alert(`✅ تم استيراد حركات حضور يوم (${targetDate}) بنجاح!`);

} catch (e) {

alert("❌ حدث خطأ أثناء فك تشفير الكود: تأكد من نسخه كاملاً.");

}

}


// 28.5 تصدير مصفوفة كشف الحضور والغياب (Excel / CSV)

// مطابق لنموذج شيت الحضور والغياب الرسمي

// ==========================================

function formatMatrixDateHeader(dateStr) {

if (!dateStr) return '';

let s = String(dateStr).trim();

let parts = s.split(/[-/]/);

if (parts.length === 3) {

if (parts[0].length === 4) {

// YYYY-MM-DD -> D-M-YYYY

let y = parts[0];

let m = parseInt(parts[1], 10);

let d = parseInt(parts[2], 10);

return `${d}-${m}-${y}`;

} else if (parts[2].length === 4) {

// DD-MM-YYYY or D-M-YYYY -> D-M-YYYY

let d = parseInt(parts[0], 10);

let m = parseInt(parts[1], 10);

let y = parts[2];

return `${d}-${m}-${y}`;

}

}

let dt = new Date(dateStr);

if (!isNaN(dt.getTime())) {

return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;

}

return s;

}

function isMemberAttendedOnDate(member, dateKey) {

if (!member || !dateKey) return false;

let dayList = attendanceRecord[dateKey];

if (!Array.isArray(dayList) || dayList.length === 0) return false;

let memId = member.id != null ? String(member.id).trim() : '';

let memCode = member.code != null ? String(member.code).trim() : '';

return dayList.some(a => {

if (!a) return false;

let aId = a.id != null ? String(a.id).trim() : '';

let aCode = a.code != null ? String(a.code).trim() : '';

let match = (memId && (aId === memId || aCode === memId)) ||

(memCode && (aId === memCode || aCode === memCode));

return match && !a.isAbsentDueToDelay;

});

}

function openAttendanceExportModal(initialScope) {

let modal = document.getElementById('attendanceExportModal');

if (!modal) return;

// ضبط التاريخ الحالي

let curDateEl = document.getElementById('exportModalCurrentDate');

if (curDateEl) curDateEl.innerText = activeSelectedDate || today;

// اسم الخدمة الافتراضي

let nameInput = document.getElementById('exportClassNameInput');

if (nameInput) {

let defaultName = (settings && settings.serviceName) ? settings.serviceName : 'مخدومين إعداد خدام 2025-2026';

if (!nameInput.value || nameInput.value.trim() === '') {

nameInput.value = defaultName;

}

}

// جمع التواريخ المسجلة لتحديد حدود الفترة الافتراضية

let recordedDates = Object.keys(attendanceRecord || {}).filter(d => {

let list = attendanceRecord[d];

return Array.isArray(list) && list.length > 0;

}).sort();

let startInput = document.getElementById('exportStartDate');

let endInput = document.getElementById('exportEndDate');

if (startInput && endInput) {

if (recordedDates.length > 0) {

startInput.value = recordedDates[0];

endInput.value = recordedDates[recordedDates.length - 1];

} else {

let d = new Date();

let y = d.getFullYear();

let m = String(d.getMonth() + 1).padStart(2, '0');

startInput.value = `${y}-${m}-01`;

endInput.value = activeSelectedDate || today;

}

}

// تحديث خيارات المراحل ديناميكياً

let stageSelect = document.getElementById('exportStageFilterSelect');

if (stageSelect) {

let uniqueStages = new Set();

(members || []).forEach(m => {

let st = m.stage || m.level;

if (st && typeof st === 'string' && st.trim()) uniqueStages.add(st.trim());

});

let currentVal = stageSelect.value || 'all';

let optsHtml = '<option value="all">كل المراحل والمخدومين</option>';

if (uniqueStages.size > 0) {

uniqueStages.forEach(st => {

optsHtml += `<option value="${escapeHtml(st)}">${escapeHtml(st)}</option>`;

});

} else {

optsHtml += '<option value="سنة أولى">سنة أولى إعداد خدام</option><option value="سنة ثانية">سنة ثانية إعداد خدام</option>';

}

stageSelect.innerHTML = optsHtml;

stageSelect.value = currentVal;

}

// ضبط النطاق المطلوب

if (initialScope === 'all') {

let rAll = document.getElementById('scopeAll');

if (rAll) rAll.checked = true;

} else if (initialScope === 'range') {

let rRange = document.getElementById('scopeRange');

if (rRange) rRange.checked = true;

} else {

let rSingle = document.getElementById('scopeSingle');

if (rSingle) rSingle.checked = true;

}

handleExportScopeChange();

modal.style.display = 'block';

}

function closeAttendanceExportModal() {

let modal = document.getElementById('attendanceExportModal');

if (modal) modal.style.display = 'none';

}

function handleExportScopeChange() {

let rangeInputs = document.getElementById('exportDateRangeInputs');

let isRange = document.getElementById('scopeRange') && document.getElementById('scopeRange').checked;

if (rangeInputs) {

rangeInputs.style.display = isRange ? 'flex' : 'none';

}

updateExportPreview();

}

function getAttendanceExportDates() {

let scope = 'single';

let singleEl = document.getElementById('scopeSingle');

let rangeEl = document.getElementById('scopeRange');

let allEl = document.getElementById('scopeAll');

if (rangeEl && rangeEl.checked) scope = 'range';

else if (allEl && allEl.checked) scope = 'all';

if (scope === 'single') {

return [activeSelectedDate || today];

} else if (scope === 'range') {

let sVal = (document.getElementById('exportStartDate') ? document.getElementById('exportStartDate').value : '') || '2000-01-01';

let eVal = (document.getElementById('exportEndDate') ? document.getElementById('exportEndDate').value : '') || '2099-12-31';

if (sVal > eVal) {

let tmp = sVal; sVal = eVal; eVal = tmp;

}

let allDates = Object.keys(attendanceRecord || {}).filter(d => {

return d >= sVal && d <= eVal && Array.isArray(attendanceRecord[d]) && attendanceRecord[d].length > 0;

});

if (allDates.length === 0 && activeSelectedDate >= sVal && activeSelectedDate <= eVal) {

allDates = [activeSelectedDate];

}

return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

} else {

// all

let allDates = Object.keys(attendanceRecord || {}).filter(d => {

return Array.isArray(attendanceRecord[d]) && attendanceRecord[d].length > 0;

});

if (allDates.length === 0) {

allDates = [activeSelectedDate || today];

}

return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

}

}

function getFilteredMembersForExport() {

let stageSelect = document.getElementById('exportStageFilterSelect');

let stage = stageSelect ? stageSelect.value : 'all';

let list = (members || []).slice();

if (stage !== 'all') {

let normTarget = normalizeStageText(stage);

list = list.filter(m => normalizeStageText(m.stage || m.level) === normTarget);

}

list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));

return list;

}

function updateExportPreview() {

let dates = getAttendanceExportDates();

let mems = getFilteredMembersForExport();

let pMems = document.getElementById('previewMemberCount');

let pDates = document.getElementById('previewDateCount');

if (pMems) pMems.innerText = mems.length;

if (pDates) pDates.innerText = dates.length;

}

function buildAttendanceMatrixData() {

let mems = getFilteredMembersForExport();

if (mems.length === 0) {

alert("⚠️ لا يوجد مخدومين في المرحلة المحددة للتصدير!");

return null;

}

let dates = getAttendanceExportDates();

if (dates.length === 0) {

alert("⚠️ لا توجد تواريخ مسجلة في النطاق المحدد!");

return null;

}

let nameInput = document.getElementById('exportClassNameInput');

let className = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : ((settings && settings.serviceName) ? settings.serviceName : 'مخدومين إعداد خدام 2025-2026');

// الصف الأول: أسم الفصل | [اسم الفصل]

let aoa = [

["أسم الفصل", className]

];

// الصف الثاني: الاسم/ايام الحضور | 14-8-2026 | 21-8-2026 ...

let headerRow = ["الاسم/ايام الحضور"];

dates.forEach(d => {

headerRow.push(formatMatrixDateHeader(d));

});

aoa.push(headerRow);

// الصفوف التالية: لكل مخدوم صف به علامة حضور أو غياب

mems.forEach(m => {

let row = [m.name || 'مخدوم بدون اسم'];

dates.forEach(d => {

let attended = isMemberAttendedOnDate(m, d);

row.push(attended ? '   ✔   ' : '  X  ');

});

aoa.push(row);

});

// توليد اسم ملف معبر

let scopeRange = document.getElementById('scopeRange');

let scopeAll = document.getElementById('scopeAll');

let fileName = 'كشف_حضور_الاجتماع';

if (dates.length === 1) {

fileName = `كشف_حضور_${formatMatrixDateHeader(dates[0])}`;

} else if (scopeRange && scopeRange.checked) {

fileName = `كشف_حضور_من_${formatMatrixDateHeader(dates[0])}_الى_${formatMatrixDateHeader(dates[dates.length - 1])}`;

} else if (scopeAll && scopeAll.checked) {

fileName = `كشف_حضور_شامل_${dates.length}_اجتماعات`;

}

return { aoa, fileName, dates, memsCount: mems.length };

}

function exportMatrixToCSV(aoa, baseFileName) {

let csvContent = "\uFEFF"; // UTF-8 BOM لضمان فتح الحروف العربية بشكل سليم تماماً داخل Microsoft Excel

aoa.forEach(row => {

let line = row.map(cell => {

let val = (cell === null || cell === undefined) ? '' : String(cell);

if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {

val = '"' + val.replace(/"/g, '""') + '"';

}

return val;

}).join(",");

csvContent += line + "\r\n";

});

let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download = baseFileName.endsWith('.csv') ? baseFileName : (baseFileName + '.csv');

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

}

async function triggerAttendanceExport(format) {

let data = buildAttendanceMatrixData();

if (!data) return;

let { aoa, fileName } = data;

if (format === 'xlsx') {

await ensureXlsxLoaded().catch(() => {});

if (typeof XLSX !== 'undefined') {

try {

let ws = XLSX.utils.aoa_to_sheet(aoa);

// تعيين عرض مناسب للأعمدة: عمود الأسماء 32، وباقي أعمدة التواريخ 14

ws['!cols'] = [{ wch: 32 }].concat(data.dates.map(() => ({ wch: 14 })));

let wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

XLSX.writeFile(wb, fileName + ".xlsx");

} catch (err) {

console.warn("تعذر تصدير XLSX عبر المكتبة، جاري التحويل التلقائي لـ CSV المتوافق:", err);

exportMatrixToCSV(aoa, fileName);

}

} else {

// في حال غياب مكتبة XLSX (أوفلاين)، تصدير CSV متوافق 100% مع إكسل

exportMatrixToCSV(aoa, fileName);

}

} else {

exportMatrixToCSV(aoa, fileName);

}

if (typeof logActivity === "function") {

logActivity("تصدير الحضور", "إكسل", `${fileName} (${data.memsCount} مخدوم)`);

}

closeAttendanceExportModal();

if (typeof showToast === "function") {

showToast(`✅ تم استخراج كشف الحضور بنجاح!`);

}

}

// تكامل الدالة السابقة المطلوبة في لوحة التقارير

function exportAttendance(showModal = true) {

if (showModal) {

openAttendanceExportModal();

} else {

openAttendanceExportModal('all');

}

}

// ==========================================


// 30. تغذية المسح المباشر

// ==========================================

function renderLiveCardsFeed() {

const feed = document.getElementById('liveCardsFeed');

const countBadge = document.getElementById('liveScanCount');

if (!feed) return;

let todayList = attendanceRecord[today] || [];

if (countBadge) countBadge.innerText = todayList.length;

if (todayList.length === 0) {

feed.innerHTML = '<div class="empty-state">لم يتم مسح أي كارنيه حتى الآن...</div>';

return;

}

feed.innerHTML = '';

todayList.forEach((item, index) => {

let card = document.createElement('div');

card.className = 'live-scan-card';

card.innerHTML = `

<div style="display:flex; align-items:center; gap:10px;">

<span style="color:var(--success); font-weight:bold; font-size:16px;">✔️</span>

<div>

<strong style="font-size:14px; color:var(--dark);">${escapeHtml(item.name)}</strong>

<div style="font-size:11px; color:#636e72;">كود: ${escapeHtml(item.code)} | ${item.isBonusEvent ? '⭐ بونص فعالية' : 'جمعة أساسي'} | وقت: ${escapeHtml(item.time)}</div>

</div>

</div>

<span class="live-scan-index">#${todayList.length - index}</span>

`;

feed.appendChild(card);

});

}

function manualMarkMemberFromInput() {

let input = document.getElementById('manualAttendInput').value.trim();

if (!input) return alert("يرجى كتابة كود الامتحان أو اسم الدارس أولاً!");

let member = members.find(m => {

let mCode = m.code ? m.code.toString().trim() : "";

let mName = m.name ? m.name.trim().toLowerCase() : "";

return (mCode === input || mName.includes(input.toLowerCase()));

});

if (member) {

atomicRegisterAttendance(member);

document.getElementById('manualAttendInput').value = '';

} else {

playBeepSound('error');

showToast(`❌ لم يتم العثور على أي دارس بهذا الكود أو الاسم`, true);

}

}

// ==========================================

// 31. الماسح الرئيسي

// ==========================================

let html5QrCode = null;

async function populateCameraDevices() {

try {

if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {

const devices = await navigator.mediaDevices.enumerateDevices();

const videoDevices = devices.filter(d => d.kind === 'videoinput');

const select = document.getElementById('cameraSelectionDropdown');

if (select) {

select.innerHTML = '<option value="">تحديد الكاميرا الخلفية تلقائياً...</option>';

videoDevices.forEach((device, index) => {

const opt = document.createElement('option');

opt.value = device.deviceId;

opt.text = device.label || `كاميرا ${index + 1}`;

select.appendChild(opt);

});

}

}

} catch(e){ console.warn("[خدمتي برو]", e); }

}

async function startCamera() {

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

return alert("يرجى استخدام متصفح حديث يدعم الكاميرا.");

}

if (typeof Html5Qrcode === 'undefined') {

showToast("⏳ جاري تهيئة كاميرا المسح الضوئي...");

await ensureHtml5QrLoaded().catch(() => {});

}

try {

const testStream = await navigator.mediaDevices.getUserMedia({ video: true });

testStream.getTracks().forEach(t => t.stop());

await populateCameraDevices();

document.getElementById('startCameraBtn').style.display = 'none';

document.getElementById('stopCameraBtn').style.display = 'block';

if (html5QrCode) {

try { await html5QrCode.stop(); } catch(e){ console.warn("[خدمتي برو]", e); }

}

html5QrCode = new Html5Qrcode("reader");

const chosenDeviceId = document.getElementById('cameraSelectionDropdown').value;

const cameraConfig = { fps: 10, qrbox: { width: 220, height: 220 } };

if (chosenDeviceId) {

await html5QrCode.start(chosenDeviceId, cameraConfig, markAttendance, () => {});

} else {

try {

await html5QrCode.start({ facingMode: "environment" }, cameraConfig, markAttendance, () => {});

} catch (envErr) {

await html5QrCode.start({ facingMode: "user" }, cameraConfig, markAttendance, () => {});

}

}

} catch (err) {

stopCamera();

alert("❌ تم رفض إذن الكاميرا. يرجى التأكد من إعطاء إذن الكاميرا للمتصفح.");

}

}

function stopCamera() {

if (html5QrCode) {

html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});

}

document.getElementById('startCameraBtn').style.display = 'block';

document.getElementById('stopCameraBtn').style.display = 'none';

}

let lastScannedCode = "";

let lastScannedTime = 0;

const SCAN_COOLDOWN_MS = 5000;

function markAttendance(scannedText) {

scannedText = scannedText.trim();

let nowTimestamp = Date.now();

if (scannedText === lastScannedCode && (nowTimestamp - lastScannedTime) < SCAN_COOLDOWN_MS) return;

lastScannedCode = scannedText;

lastScannedTime = nowTimestamp;

let parsedName = scannedText;

if (scannedText.includes('/')) parsedName = scannedText.split('/')[0].trim();

let member = members.find(m => {

let mName = m.name ? m.name.trim().toLowerCase() : "";

let mCode = m.code ? m.code.toString().trim() : "";

let mId = m.id ? m.id.toString().trim() : "";

let mQr = m.qrCode ? m.qrCode.toLowerCase() : "";

return (mCode === scannedText || (mQr !== "" && mQr === scannedText.toLowerCase()) || mName === parsedName.toLowerCase() || mId === scannedText);

});

if (member) {

atomicRegisterAttendance(member);

} else {

let s = servants.find(x => (x.code && x.code.toString() === scannedText) || x.id.toString() === scannedText || (x.name && scannedText.includes(x.name)));

if (s) {

recordServantAttendance(s);

showKioskWelcome(s, false, 'servant');

playBeepSound('success');

showToast(`✅ تم رصد حضور الخادم: ${s.name}`);

} else {

playBeepSound('error');

showToast(`❌ كود غير مسجل أو غير مقروء`, true);

}

}

}

// ==========================================

// 32. الحضور اليدوي من قائمة

// ==========================================

function openManualAttendanceModal() {

document.getElementById('manualModalSearchBox').value = '';

renderManualAttendanceModalList();

document.getElementById('manualAttendanceModal').style.display = 'flex';

}

function closeManualAttendanceModal() {

document.getElementById('manualAttendanceModal').style.display = 'none';

}

function renderManualAttendanceModalList() {

const tbody = document.getElementById('manualAttendanceModalTbody');

const search = document.getElementById('manualModalSearchBox').value.toLowerCase();

if (!tbody) return;

tbody.innerHTML = '';

let todayMap = {};

(attendanceRecord[activeSelectedDate] || []).forEach(a => { todayMap[a.id.toString()] = a; });

let filtered = members.filter(m => (m.name || '').toLowerCase().includes(search) || (m.code || '').toString().includes(search));

if (filtered.length === 0) {

tbody.innerHTML = '<tr><td colspan="4" class="empty-state">لا توجد نتائج مطابقة للبحث.</td></tr>';

return;

}

filtered.forEach(m => {

let rec = todayMap[m.id.toString()];

let isAtt = !!rec;

let isCom = rec ? !!rec.communion : false;

let isPart = rec ? !!rec.participation : false;

let tr = document.createElement('tr');

tr.innerHTML = `

<td style="text-align:right;"><strong>${escapeHtml(m.name)}</strong> (${escapeHtml(m.code) || '-'})</td>

<td><input type="checkbox" ${isAtt ? 'checked' : ''} onchange="toggleManualModalAttendance('${m.id}', this.checked)" style="width:18px; height:18px; cursor:pointer;"></td>

<td><input type="checkbox" ${isCom ? 'checked' : ''} ${!isAtt ? 'disabled' : ''} onchange="toggleSpiritualStatus('${m.id}', 'communion', this.checked)" style="width:18px; height:18px; cursor:pointer;"></td>

<td><input type="checkbox" ${isPart ? 'checked' : ''} ${!isAtt ? 'disabled' : ''} onchange="toggleSpiritualStatus('${m.id}', 'participation', this.checked)" style="width:18px; height:18px; cursor:pointer;"></td>

`;

tbody.appendChild(tr);

});

}

function toggleManualModalAttendance(memberId, isChecked) {

let member = members.find(x => x.id.toString() === memberId.toString());

if (!member) return;

if (isChecked) atomicRegisterAttendance(member);

else cancelMemberAttendance(memberId);

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderManualAttendanceModalList();

checkLocalStorageUsage();

}

// ==========================================

// Explicit Window Exports
if (typeof window !== 'undefined') {
  window.renderAttendanceTable = renderAttendanceTable;
  window.renderLiveCardsFeed = renderLiveCardsFeed;
  window.renderAttendanceCalendar = renderAttendanceCalendar;
  window.renderAttendanceHeatmap = renderAttendanceHeatmap;
  window.atomicRegisterAttendance = atomicRegisterAttendance;
  window.exportTodaySessionToWhatsApp = exportTodaySessionToWhatsApp;
  window.formatMatrixDateHeader = formatMatrixDateHeader;

  window.showKioskWelcome = showKioskWelcome;
  window.closeKioskWelcome = closeKioskWelcome;
  window.openAttendanceExportModal = openAttendanceExportModal;
  window.closeAttendanceExportModal = closeAttendanceExportModal;
  window.openManualAttendanceModal = openManualAttendanceModal;
  window.closeManualAttendanceModal = closeManualAttendanceModal;
  window.changeCalendarMonth = changeCalendarMonth;
  window.selectAttendanceDate = selectAttendanceDate;

}
