// 21. خطة السنة

// ==========================================

// ==========================================

// مكتبة مواد الكورس

// ==========================================

function addCourseMaterial() {

if (currentPermission !== 'admin' && currentPermission !== 'developer' && currentPermission !== 'full') {

return alert("إضافة مواد للمكتبة متاح لخدام الكورس فقط.");

}

let title = document.getElementById('mat_title').value.trim();

let type = document.getElementById('mat_type').value;

let url = document.getElementById('mat_url').value.trim();

let notes = document.getElementById('mat_notes').value.trim();

if (!title || !url) return alert("العنوان والرابط مطلوبان!");

let material = {

id: 'mat_' + Date.now(),

title, type, url, notes,

addedBy: currentUser ? currentUser.name : 'غير معروف',

date: new Date().toISOString()

};

courseMaterials.push(material);

localStorage.setItem('khedmety_course_materials', JSON.stringify(courseMaterials));

syncToCloud('course_materials', courseMaterials);

logActivity("إضافة مادة للمكتبة", title, type);

document.getElementById('mat_title').value = '';

document.getElementById('mat_url').value = '';

document.getElementById('mat_notes').value = '';

renderMaterialsList();

showToast("✅ تمت إضافة المادة للمكتبة.");

}

function deleteCourseMaterial(id) {

if (currentPermission !== 'admin' && currentPermission !== 'developer') return;

if (!confirm("حذف هذه المادة من المكتبة؟")) return;

let mat = courseMaterials.find(m => m.id === id);

courseMaterials = courseMaterials.filter(m => m.id !== id);

localStorage.setItem('khedmety_course_materials', JSON.stringify(courseMaterials));

syncToCloud('course_materials', courseMaterials);

if (mat) logActivity("حذف مادة من المكتبة", mat.title);

renderMaterialsList();

}

function renderMaterialsList() {

let container = document.getElementById('materialsListContainer');

if (!container) return;

if (courseMaterials.length === 0) {

container.innerHTML = '<p style="color:#888; text-align:center;">لا توجد مواد مضافة بعد.</p>';

return;

}

let typeIcons = { 'محاضرة': '🎥', 'ملزمة': '📄', 'رابط': '🔗' };

container.innerHTML = courseMaterials.slice().reverse().map(m => `

<div style="border:1px solid #dfe6e9; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">

<div>

<strong style="font-size:14px;">${typeIcons[m.type] || '📎'} ${escapeHtml(m.title)}</strong>

<div style="font-size:11px; color:#636e72; margin-top:3px;">${escapeHtml(m.notes) || ''}</div>

<div style="font-size:10px; color:#b2bec3; margin-top:3px;">أضافها: ${escapeHtml(m.addedBy)} - ${escapeHtml(new Date(m.date).toLocaleDateString('ar-EG'))}</div>

</div>

<div style="display:flex; gap:6px;">

<a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" class="btn-mini btn-success" style="width:auto; padding:6px 14px; margin:0;">فتح ↗️</a>

<button class="btn-mini btn-danger admin-only" style="width:auto; padding:6px 10px; margin:0;" onclick="deleteCourseMaterial('${m.id}')">حذف</button>

</div>

</div>

`).join('');

}

// ==========================================

// التقييم الذاتي الروحي (يُسجَّل من الدارس نفسه لحظة الحضور)

// ==========================================

function submitSelfReflection(memberId, memberName, rating) {

let entry = {

id: 'ref_' + Date.now() + '_' + Math.floor(Math.random() * 1000),

memberId: memberId.toString(),

memberName,

rating,

note: '',

date: new Date().toISOString()

};

selfReflections.push(entry);

localStorage.setItem('khedmety_self_reflections', JSON.stringify(selfReflections));

syncToCloud('self_reflections', selfReflections);

let box = document.getElementById('kioskReflectionBox');

if (box) {

box.innerHTML = `<div style="text-align:center; color:var(--success); font-weight:bold; padding:8px;">🙏 شكراً لمشاركتك، ربنا يبارك حياتك الروحية.</div>`;

}

}

function renderReflectionsTable() {

let tbody = document.getElementById('reflectionsTbody');

if (!tbody) return;

if (selfReflections.length === 0) {

tbody.innerHTML = '<tr><td colspan="4" style="color:#888;">لا توجد بيانات بعد.</td></tr>';

return;

}

let stars = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐', 5: '⭐⭐⭐⭐⭐' };

tbody.innerHTML = selfReflections.slice().reverse().slice(0, 200).map(r => `

<tr>

<td data-label="التاريخ">${escapeHtml(new Date(r.date).toLocaleDateString('ar-EG'))}</td>

<td data-label="الاسم"><strong>${escapeHtml(r.memberName)}</strong></td>

<td data-label="التقييم">${stars[r.rating] || r.rating}</td>

<td data-label="الانطباع">${escapeHtml(r.note) || '-'}</td>

</tr>

`).join('');

}

function addMasterPlanEvent() {

let type = document.getElementById('planType').value;

let date = document.getElementById('planDate').value;

let title = document.getElementById('planTitle').value.trim();

let location = document.getElementById('planLocation').value.trim();

let stage = document.getElementById('planStage').value;

let resp = document.getElementById('planResponsibleServant').value;

if (!date || !title) return alert("يرجى إدخال التاريخ وعنوان الفعالية!");

masterPlan.push({

id: Date.now(), type: type, date: date, title: title,

location: location || "الكنيسة", stage: stage, responsible: resp || "غير محدد"

});

saveMasterPlan();

logActivity("إضافة فعالية خطة", title, `${type} بتاريخ ${date}`);

renderMasterPlanTable();

checkUpcomingMasterPlanEvents();

alert("✅ تم إدراج الفعالية في خطة السنة بنجاح!");

document.getElementById('planTitle').value = '';

document.getElementById('planLocation').value = '';

}

function renderMasterPlanTable() {

const tbody = document.querySelector('#masterPlanTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

let list = [...masterPlan].sort((a, b) => new Date(a.date) - new Date(b.date));

if (list.length === 0) {

tbody.innerHTML = '<tr><td colspan="7" class="empty-state">لا توجد فعاليات مسجلة في الخطة حالياً.</td></tr>';

return;

}

const tagClasses = { 'محاضرة': 'tag-lecture', 'رحلة': 'tag-trip', 'مؤتمر': 'tag-camp', 'يوم خلوة': 'tag-retreat', 'يوم رياضي': 'tag-trip', 'حفل تخرج': 'tag-grad', 'امتحان': 'tag-exam' };

list.forEach(item => {

let tagClass = tagClasses[item.type] || 'tag-lecture';

let tr = document.createElement('tr');

tr.innerHTML = `

<td data-label="التاريخ"><strong>${escapeHtml(item.date)}</strong></td>

<td data-label="النوع"><span class="plan-tag ${tagClass}">${escapeHtml(item.type)}</span></td>

<td data-label="العنوان"><strong>${escapeHtml(item.title)}</strong></td>

<td data-label="المكان">${escapeHtml(item.location)}</td>

<td data-label="المرحلة">${escapeHtml(item.stage)}</td>

<td data-label="المسؤول"><strong style="color:var(--primary);">${escapeHtml(item.responsible)}</strong></td>

<td data-label="إجراء" class="admin-only"><button class="btn-mini btn-danger" onclick="deleteMasterPlanEvent(${item.id})">حذف</button></td>

`;

tbody.appendChild(tr);

});

updateRoleUI();

}

function deleteMasterPlanEvent(id) {

let item = masterPlan.find(x => x.id === id);

if (confirm("حذف هذه الفعالية من خطة السنة؟")) {

masterPlan = masterPlan.filter(x => x.id !== id);

saveMasterPlan();

if (item) logActivity("حذف فعالية خطة", item.title, `حذف فعالية تاريخ ${item.date}`);

renderMasterPlanTable();

checkUpcomingMasterPlanEvents();

}

}

async function clearAllMasterPlan() {

let pwd = prompt("أدخل كلمة مرور الأدمن لحذف خطة السنة والفعاليات بالكامل:");

if (!pwd) return;

let pwdHash = await hashPassword(pwd);

if (isAdminPasswordValid(pwdHash, pwd)) {

masterPlan = [];

saveMasterPlan();

logActivity("حذف خطة السنة", "تفريغ شامل", "حذف كافة الفعاليات المسجلة");

renderMasterPlanTable();

checkUpcomingMasterPlanEvents();

alert("✅ تم تفريغ خطة السنة بالكامل.");

} else {

alert("❌ كلمة المرور غير صحيحة.");

}

}

function saveMasterPlan() {

localStorage.setItem(STORAGE_KEYS.MASTER_PLAN, JSON.stringify(masterPlan));

if (isFirebaseActive && fsdb) {

fsdb.collection('config').doc('master_plan').set({ list: masterPlan }).then(() => {

updateLastSyncTimestamp();

showToast("✅ تم تحديث خطة السنة على السحابة فوراً!");

}).catch(() => syncToCloud('master_plan', masterPlan));

} else {

syncToCloud('master_plan', masterPlan);

}

}

function downloadMasterPlanTemplate() {

let headers = ["النوع", "التاريخ", "عنوان الفعالية", "المكان", "المرحلة", "المسؤول / المحاضر"];

let sampleRow = ["محاضرة", today, "مقدمة في العهد الجديد", "قاعة الكنيسة الكبرى", "سنة أولى", "عادل جورج"];

let ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

ws['!cols'] = headers.map(() => ({ wch: 22 }));

let wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "MasterPlanTemplate");

XLSX.writeFile(wb, "نموذج_خطة_السنة.xlsx");

}

function exportMasterPlanToExcel() {

let headers = ["النوع", "التاريخ", "عنوان الفعالية", "المكان", "المرحلة", "المسؤول / المحاضر"];

let rows = masterPlan.map(p => [p.type, p.date, p.title, p.location, p.stage, p.responsible]);

let ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

ws['!cols'] = headers.map(() => ({ wch: 22 }));

let wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "MasterPlan");

XLSX.writeFile(wb, `خطة_السنة_الشاملة_${today}.xlsx`);

}

function importMasterPlanFromExcel() {

let file = document.getElementById('importMasterPlanFile').files[0];

if (!file) return alert("اختر ملف خطة السنة أولاً!");

let reader = new FileReader();

reader.onload = function(e) {

try {

let wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });

let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

let added = 0;

// دالة ذكية لتوحيد وقراءة أي صيغة تاريخ في الإكسيل إلى YYYY-MM-DD

function parseExcelDate(val) {

if (!val) return "";

if (val instanceof Date && !isNaN(val)) {

let y = val.getFullYear();

let m = String(val.getMonth() + 1).padStart(2, '0');

let d = String(val.getDate()).padStart(2, '0');

return `${y}-${m}-${d}`;

}

let str = String(val).trim();

// التعامل مع التاريخ المكتوب بصيغة DD-MM-YYYY أو DD/MM/YYYY

let parts = str.split(/[-/]/);

if (parts.length === 3) {

if (parts[0].length === 4) { // YYYY-MM-DD

return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;

} else if (parts[2].length === 4) { // DD-MM-YYYY

return `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;

}

}

// لو رقم تسلسلي من إكسيل (Excel Serial Number)

let num = parseFloat(str);

if (!isNaN(num) && num > 20000 && num < 60000) {

let d = new Date(Math.round((num - 25569) * 86400 * 1000));

let y = d.getFullYear();

let m = String(d.getMonth() + 1).padStart(2, '0');

let day = String(d.getDate()).padStart(2, '0');

return `${y}-${m}-${day}`;

}

return str;

}

data.forEach(r => {

let title = r['عنوان الفعالية'] || r['Title'] || "";

// قراءة التاريخ بكل التسميات الممكنة

let rawDate = r['التاريخ (YYYY-MM-DD)'] || r['التاريخ'] || r['Date'] || "";

let date = parseExcelDate(rawDate);

if (title && date) {

masterPlan.push({

id: generateUniqueId(masterPlan),

type: r['النوع'] || r['Type'] || "محاضرة",

date: date,

title: title,

location: r['المكان'] || r['Location'] || "الكنيسة",

stage: r['المرحلة'] || r['Stage'] || "عام لكل الخدمة",

responsible: r['المسؤول / المحاضر'] || r['Responsible'] || "غير محدد"

});

added++;

}

});

saveMasterPlan();

if (typeof logActivity === "function") logActivity("استيراد خطة سنة", "Excel", `تم استيراد ${added} فعالية`);

renderMasterPlanTable();

checkUpcomingMasterPlanEvents();

alert(`✅ تم استيراد (${added}) فعالية في خطة السنة بنجاح!`);

document.getElementById('importMasterPlanFile').value = '';

} catch(err) {

alert("❌ فشل استيراد الملف: " + err.message);

}

};

reader.readAsArrayBuffer(file);

}

// ==========================================

// 22. التنبيهات والتذكيرات

// ==========================================

function checkUpcomingMasterPlanEvents() {

const listDiv = document.getElementById('upcomingPlanEventsList');

const myBanner = document.getElementById('myNextEventBanner');

const myDetails = document.getElementById('myNextEventDetails');

let now = new Date();

let upcomingList = masterPlan.filter(item => {

let diffDays = (new Date(item.date) - now) / (1000 * 60 * 60 * 24);

return diffDays >= -0.5 && diffDays <= 20;

});

upcomingList.sort((a, b) => new Date(a.date) - new Date(b.date));

if (upcomingList.length === 0) {

if (listDiv) listDiv.innerHTML = "✨ لا توجد فعاليات أو رحلات مجدولة قريباً.";

} else {

if (listDiv) listDiv.innerHTML = upcomingList.slice(0, 4).map(item => `

<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #ccc; padding:4px 0; flex-wrap:wrap; gap:5px;">

<span>📌 [<strong>${item.date}</strong>] - <strong>${item.title}</strong></span>

<span class="role-badge" style="background:#2c3e50; font-size:10px;">المسؤول: ${item.responsible}</span>

</div>

`).join('');

}

if (currentUser && myBanner && myDetails) {

let myNext = masterPlan.find(item => {

let isResponsible = (item.responsible || '').trim().toLowerCase() === currentUser.name.trim().toLowerCase();

let diffDays = (new Date(item.date) - now) / (1000 * 60 * 60 * 24);

return isResponsible && diffDays >= -0.5 && diffDays <= 7;

});

if (myNext) {

myDetails.innerText = `موعدك القادم: [${myNext.type} - ${myNext.title}] يوم (${myNext.date}).`;

myBanner.style.display = 'block';

} else {

myBanner.style.display = 'none';

}

}

}


// ==========================================
// 🚀 جسر واتساب الذكي المباشر (Direct WhatsApp Bridge)
// ==========================================
async function sendWhatsAppDirectMessage(phone, message, btnEl) {
    let cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;
    if (!cleanPhone) {
        alert('لا يوجد رقم هاتف صالح للمخدوم.');
        return false;
    }

    if (btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري الإرسال...';
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch('http://127.0.0.1:3000/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: cleanPhone, message: message }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
                if (btnEl) {
                    btnEl.innerHTML = '✅ تم الإرسال من الواتساب!';
                    btnEl.style.background = '#15803d';
                    btnEl.style.color = '#ffffff';
                }
                return true;
            }
        }
        throw new Error('Engine returned error');
    } catch (err) {
        console.warn('[WhatsAppDirect] تعذر الإرسال الآلي من المحرك، جاري الفتح عبر wa.me:', err);
        const waUrl = 'https://wa.me/' + encodeURIComponent(cleanPhone) + '?text=' + encodeURIComponent(message);
        window.open(waUrl, '_blank');
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.innerHTML = '📲 تم فتح المحادثة';
            btnEl.style.background = '#0284c7';
            btnEl.style.color = '#ffffff';
        }
        return false;
    }
}

function sendWhatsAppBirthdayDirect(name, phone, btnEl) {
    const rawMsg = 'كل سنة وأنت طيب يا ' + name + ' وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨';
    return sendWhatsAppDirectMessage(phone, rawMsg, btnEl);
}

function checkUpcomingBirthdays() {

const box = document.getElementById('birthdayAlertList');

if (!box) return;

let now = new Date();

let currentMonth = now.getMonth() + 1;

let currentDay = now.getDate();

let matchedBirthdays = [];

const parseDobParts = (dob) => {

if (!dob) return null;

let cleanDob = dob.toString().trim();

let parts;

if (cleanDob.includes('-')) {

parts = cleanDob.split('-');

if (parts[0].length === 4) {

return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };

} else {

return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };

}

} else if (cleanDob.includes('/')) {

parts = cleanDob.split('/');

if (parts[0].length === 4) {

return { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) };

} else {

return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };

}

}

return null;

};

members.forEach(m => {

if (m.dob) {

let parsed = parseDobParts(m.dob);

if (parsed && parsed.month === currentMonth && Math.abs(parsed.day - currentDay) <= 4) {

matchedBirthdays.push({ name: m.name, phone: m.phone, type: 'دارس', date: `${parsed.day}/${parsed.month}` });

}

}

});

if (currentPermission === 'admin' || currentPermission === 'developer' || currentPermission === 'full') {

servants.forEach(s => {

if (s.dob) {

let parsed = parseDobParts(s.dob);

if (parsed && parsed.month === currentMonth && Math.abs(parsed.day - currentDay) <= 4) {

matchedBirthdays.push({ name: s.name, phone: s.phone, type: 'خادم', date: `${parsed.day}/${parsed.month}` });

}

}

});

}

if (matchedBirthdays.length === 0) {

box.innerHTML = "✨ لا توجد أعياد ميلاد في الأيام القريبة الحالية.";

return;

}

box.innerHTML = matchedBirthdays.map(b => {
    let cleanPhone = formatWhatsAppPhone(b.phone);
    let waMsg = encodeURIComponent(`كل سنة وأنت طيب يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`);

    return `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #ffeaa7; padding:6px 0; flex-wrap:wrap; gap:6px;">
        <span>🎉 <strong>${escapeHtml(b.name)}</strong> (${escapeHtml(b.type)}) - ${escapeHtml(b.date)}</span>
        <div style="display:flex; gap:4px; align-items:center;">
            ${cleanPhone ? `
                <button type="button" onclick="sendWhatsAppBirthdayDirect('${escapeHtml(b.name)}', '${escapeHtml(cleanPhone)}', this)" class="btn-mini btn-success" style="cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">
                    <i class="fa-brands fa-whatsapp"></i> إرسال عبر واتساب 🚀
                </button>
                <a href="https://wa.me/${encodeURIComponent(cleanPhone)}?text=${waMsg}" target="_blank" class="btn-mini" style="background:#f1f5f9; color:#334155; text-decoration:none;" title="فتح يدوي">📲</a>
            ` : '<span style="color:#94a3b8; font-size:0.75rem;">لا يوجد هاتف</span>'}
        </div>
    </div>
    `;
}).join('');

}

// ==========================================
// Explicit Window Exports
if (typeof window !== 'undefined') {
  window.sendWhatsAppDirectMessage = sendWhatsAppDirectMessage;
  window.sendWhatsAppBirthdayDirect = sendWhatsAppBirthdayDirect;
  window.checkUpcomingBirthdays = checkUpcomingBirthdays;
  window.checkUpcomingMasterPlanEvents = checkUpcomingMasterPlanEvents;
  window.renderMaterialsList = renderMaterialsList;
  window.renderMasterPlanTable = renderMasterPlanTable;
}
