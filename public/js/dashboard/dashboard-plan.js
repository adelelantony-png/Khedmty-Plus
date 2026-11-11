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

window.masterPlanFilterStage = 'all';
window.masterPlanSearchQuery = '';

function setMasterPlanFilter(stage, btn) {
    window.masterPlanFilterStage = stage;
    if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('button').forEach(b => {
            b.style.background = '#f1f5f9';
            b.style.color = '#475569';
            b.style.borderColor = '#cbd5e1';
            b.style.fontWeight = '600';
        });
        btn.style.background = '#0B2A6B';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#0B2A6B';
        btn.style.fontWeight = '800';
    }
    renderMasterPlanTable();
}

function onMasterPlanSearch(query) {
    window.masterPlanSearchQuery = (query || '').trim().toLowerCase();
    renderMasterPlanTable();
}

function renderMasterPlanTable() {
    const tbody = document.querySelector('#masterPlanTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let list = [...masterPlan].sort((a, b) => new Date(a.date) - new Date(b.date));

    // تصفية حسب المرحلة
    if (window.masterPlanFilterStage && window.masterPlanFilterStage !== 'all') {
        list = list.filter(item => {
            const st = (item.stage || '').toLowerCase();
            if (window.masterPlanFilterStage === 'stage1') return st.includes('أولى') || st.includes('اولى');
            if (window.masterPlanFilterStage === 'stage2') return st.includes('ثانية') || st.includes('تانية');
            if (window.masterPlanFilterStage === 'general') return st.includes('عام') || st.includes('كل الخدمة');
            if (window.masterPlanFilterStage === 'servants') return st.includes('خدام');
            return true;
        });
    }

    // تصفية بكلمة البحث
    if (window.masterPlanSearchQuery) {
        const q = window.masterPlanSearchQuery;
        list = list.filter(item => {
            const text = `${item.title || ''} ${item.type || ''} ${item.location || ''} ${item.responsible || ''} ${item.stage || ''} ${item.date || ''}`.toLowerCase();
            return text.includes(q);
        });
    }

    const countEl = document.getElementById('masterPlanFilteredCount');
    if (countEl) countEl.textContent = list.length;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state" style="text-align:center; padding:25px; color:#64748b; font-weight:700;">لا توجد فعاليات مسجلة مطابقة للبحث أو التصفية.</td></tr>';
        return;
    }

    const tagClasses = { 'محاضرة': 'tag-lecture', 'رحلة': 'tag-trip', 'مؤتمر': 'tag-camp', 'يوم خلوة': 'tag-retreat', 'يوم رياضي': 'tag-trip', 'حفل تخرج': 'tag-grad', 'امتحان': 'tag-exam' };

    list.forEach(item => {
        let tagClass = tagClasses[item.type] || 'tag-lecture';
        let tr = document.createElement('tr');
        tr.setAttribute('data-plan-id', item.id);
        tr.innerHTML = `
            <td data-label="التاريخ" style="white-space:nowrap; font-size:0.86rem;"><strong style="color:#0B2A6B; font-family:monospace;">${escapeHtml(item.date)}</strong></td>
            <td data-label="النوع" style="white-space:nowrap;"><span class="plan-tag ${tagClass}" style="font-size:0.75rem; padding:3px 8px;">${escapeHtml(item.type)}</span></td>
            <td data-label="العنوان" style="min-width:180px; max-width:320px; word-break:break-word; white-space:normal; line-height:1.45;"><strong style="color:#1e293b; font-size:0.88rem;">${escapeHtml(item.title)}</strong></td>
            <td data-label="المكان" style="min-width:100px; max-width:160px; word-break:break-word; white-space:normal; font-size:0.82rem;"><span style="color:#475569;">${escapeHtml(item.location || 'الكنيسة')}</span></td>
            <td data-label="المرحلة" style="white-space:nowrap;"><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:3px 7px; border-radius:6px; font-size:0.74rem;">${escapeHtml(item.stage || 'عام')}</span></td>
            <td data-label="المسؤول" style="min-width:110px; max-width:180px; word-break:break-word; white-space:normal; font-size:0.82rem;"><strong style="color:var(--primary, #0B2A6B);">${escapeHtml(item.responsible || 'غير محدد')}</strong></td>
            <td data-label="إجراء" class="admin-only" style="white-space:nowrap; text-align:center;">
                <div style="display:inline-flex; align-items:center; gap:4px;">
                    <button type="button" class="btn-mini" onclick="openEditMasterPlanModal('${item.id}')" style="background:rgba(212,175,55,0.18); color:#874F19; border:1px solid rgba(212,175,55,0.5); padding:4px 8px; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.72rem; display:inline-flex; align-items:center; gap:3px; transition:all 0.15s;" title="تعديل تفاصيل الفعالية">
                        <i class="fa-solid fa-pen-to-square"></i> تعديل
                    </button>
                    <button type="button" class="btn-mini btn-danger" onclick="deleteMasterPlanEvent('${item.id}')" style="padding:4px 8px; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.72rem; display:inline-flex; align-items:center; gap:3px;" title="حذف الفعالية من الخطة">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateRoleUI();
}

function openEditMasterPlanModal(id) {
    const item = masterPlan.find(x => String(x.id) === String(id));
    if (!item) {
        return alert('تعذر العثور على الفعالية المحددة!');
    }

    closeEditMasterPlanModal();

    let servantsOptions = '';
    try {
        if (typeof servants !== 'undefined' && Array.isArray(servants)) {
            servantsOptions = servants.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${escapeHtml(s.role || 'خادم')})</option>`).join('');
        }
    } catch(e) {}

    const modal = document.createElement('div');
    modal.id = 'editMasterPlanModal';
    modal.className = 'k-modal-backdrop active';
    modal.style.cssText = 'position:fixed !important; inset:0 !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; width:100vw !important; height:100vh !important; background:rgba(7,26,56,0.75) !important; backdrop-filter:blur(8px) !important; -webkit-backdrop-filter:blur(8px) !important; z-index:100005 !important; display:flex !important; align-items:center !important; justify-content:center !important; padding:16px !important; box-sizing:border-box !important; overflow-y:auto !important; margin:0 !important;';

    modal.innerHTML = `
        <div class="k-modal" style="position:relative; margin:auto; max-width:540px; width:100%; max-height:90vh; overflow-y:auto; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.4); border:2px solid #D4AF37; box-sizing:border-box; background:#ffffff;">
            <div style="background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); color:#FFF; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #D4AF37;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.3rem;">🗓️</span>
                    <div>
                        <h3 style="margin:0; font-size:1.05rem; color:#FFF; font-weight:800;">تعديل فعالية في خطة السنة</h3>
                        <small style="color:#CBD5E1; font-size:0.75rem;">تعديل التاريخ والموضوع والمحاضر والمكان فورياً</small>
                    </div>
                </div>
                <button type="button" onclick="closeEditMasterPlanModal()" style="background:none; border:none; color:#FDE047; font-size:1.5rem; cursor:pointer; line-height:1;" aria-label="إغلاق">&times;</button>
            </div>

            <form onsubmit="event.preventDefault(); saveEditedMasterPlanEvent('${item.id}');" style="padding:18px 20px; background:#FFFFFF; display:flex; flex-direction:column; gap:12px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">نوع الفعالية:</label>
                        <select id="editPlanType" style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.85rem; font-weight:600; box-sizing:border-box;">
                            <option value="محاضرة" ${item.type === 'محاضرة' ? 'selected' : ''}>محاضرة دراسية</option>
                            <option value="رحلة" ${item.type === 'رحلة' ? 'selected' : ''}>رحلة ترفيهية / دير (بونص ⭐)</option>
                            <option value="مؤتمر" ${item.type === 'مؤتمر' ? 'selected' : ''}>مؤتمر روحي (بونص ⭐)</option>
                            <option value="يوم خلوة" ${item.type === 'يوم خلوة' ? 'selected' : ''}>يوم خلوة وصلاة (بونص ⭐)</option>
                            <option value="يوم رياضي" ${item.type === 'يوم رياضي' ? 'selected' : ''}>يوم رياضي / مهرجان (بونص ⭐)</option>
                            <option value="امتحان" ${item.type === 'امتحان' ? 'selected' : ''}>امتحان / كويز 📝</option>
                            <option value="حفل تخرج" ${item.type === 'حفل تخرج' ? 'selected' : ''}>حفل تخرج واجتياز الدورة</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">تاريخ الفعالية:</label>
                        <input type="date" id="editPlanDate" value="${escapeHtml(item.date)}" required style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.85rem; font-weight:700; color:#0B2A6B; box-sizing:border-box;">
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">عنوان الفعالية / الموضوع:</label>
                    <input type="text" id="editPlanTitle" value="${escapeHtml(item.title)}" required placeholder="مثال: كورس الكتاب المقدس (محاضرة 1)..." style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.88rem; font-weight:600; box-sizing:border-box;">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">المرحلة المستهدفة:</label>
                        <select id="editPlanStage" style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.85rem; font-weight:600; box-sizing:border-box;">
                            <option value="عام لكل الخدمة" ${(item.stage === 'عام لكل الخدمة' || item.stage === 'عام') ? 'selected' : ''}>عام لكل الخدمة والدارسين</option>
                            <option value="الفرقة الأولى" ${(item.stage === 'الفرقة الأولى' || item.stage === 'سنة أولى') ? 'selected' : ''}>سنة أولى (الفرقة الأولى)</option>
                            <option value="الفرقة الثانية" ${(item.stage === 'الفرقة الثانية' || item.stage === 'سنة ثانية') ? 'selected' : ''}>سنة ثانية (الفرقة الثانية)</option>
                            <option value="الخدام فقط" ${item.stage === 'الخدام فقط' ? 'selected' : ''}>اجتماع الخدام فقط</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">المكان / القاعة:</label>
                        <input type="text" id="editPlanLocation" value="${escapeHtml(item.location || 'الكنيسة')}" placeholder="مثال: قاعة الفرقة الأولى..." style="width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.85rem; box-sizing:border-box;">
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#334155; margin-bottom:4px;">المسؤول / المحاضر:</label>
                    <input type="text" id="editPlanResponsible" list="editPlanServantsList" value="${escapeHtml(item.responsible || '')}" placeholder="اكتب اسم المحاضر أو اختر خادماً مسؤولاً..." style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.88rem; box-sizing:border-box;">
                    <datalist id="editPlanServantsList">
                        <option value="أمين الخدمة">
                        <option value="مسؤول الفرقة الأولى">
                        <option value="مسؤول الفرقة الثانية">
                        ${servantsOptions}
                    </datalist>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:8px; padding-top:12px; border-top:1px solid #e2e8f0;">
                    <button type="button" onclick="closeEditMasterPlanModal()" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.85rem;">إلغاء</button>
                    <button type="submit" style="background:#0B2A6B; color:#ffffff; border:none; padding:8px 22px; border-radius:8px; font-weight:800; cursor:pointer; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 3px 10px rgba(11,42,107,0.25);">
                        <i class="fa-solid fa-floppy-disk"></i> حفظ التعديلات 💾
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.onclick = function(e) {
        if (e.target === modal) closeEditMasterPlanModal();
    };

    window.scrollTo({ left: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(modal);
}

function closeEditMasterPlanModal() {
    const m = document.getElementById('editMasterPlanModal');
    if (m) m.remove();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function saveEditedMasterPlanEvent(id) {
    const item = masterPlan.find(x => String(x.id) === String(id));
    if (!item) {
        return alert('الفعالية غير موجودة!');
    }

    const type = document.getElementById('editPlanType').value;
    const date = document.getElementById('editPlanDate').value;
    const title = document.getElementById('editPlanTitle').value.trim();
    const stage = document.getElementById('editPlanStage').value;
    const location = document.getElementById('editPlanLocation').value.trim();
    const responsible = document.getElementById('editPlanResponsible').value.trim();

    if (!date || !title) {
        return alert('يرجى تحديد التاريخ وعنوان الفعالية!');
    }

    const oldTitle = item.title;
    item.type = type;
    item.date = date;
    item.title = title;
    item.stage = stage;
    item.location = location || "الكنيسة";
    item.responsible = responsible || "غير محدد";

    saveMasterPlan();

    if (typeof logActivity === 'function') {
        logActivity("تعديل فعالية خطة", title, `تعديل فعالية "${oldTitle}" ليوم ${date}`);
    }

    renderMasterPlanTable();
    checkUpcomingMasterPlanEvents();
    closeEditMasterPlanModal();

    if (typeof showToast === 'function') {
        showToast("✅ تم تحديث الفعالية في خطة السنة والمزامنة فوراً!");
    } else {
        alert("✅ تم حفظ تعديلات الفعالية بنجاح!");
    }
}

function deleteMasterPlanEvent(id) {
    let item = masterPlan.find(x => String(x.id) === String(id));
    if (confirm("حذف هذه الفعالية من خطة السنة؟")) {
        masterPlan = masterPlan.filter(x => String(x.id) !== String(id));
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

if (listDiv) {
    listDiv.innerHTML = upcomingList.slice(0, 5).map(item => {
        const isStage1 = (item.responsible || '').includes('الأولى') || (item.stage || '').includes('الأولى');
        const isStage2 = (item.responsible || '').includes('الثانية') || (item.stage || '').includes('الثانية');

        let badgeBg = '#eff6ff';
        let badgeColor = '#1d4ed8';
        let badgeBorder = '#bfdbfe';
        let badgeIcon = 'fa-user-check';

        if (isStage2) {
            badgeBg = '#fdf4ff';
            badgeColor = '#86198f';
            badgeBorder = '#f5d0fe';
        } else if (!isStage1) {
            badgeBg = '#f0fdf4';
            badgeColor = '#15803d';
            badgeBorder = '#bbf7d0';
        }

        const typeColor = (item.type === 'محاضرة') ? '#2563eb' : ((item.type === 'امتحان') ? '#d97706' : '#7c3aed');
        const safeTitle = (typeof escapeHtml === 'function') ? escapeHtml(item.title) : item.title;
        const safeResp = (typeof escapeHtml === 'function') ? escapeHtml(item.responsible || 'غير محدد') : (item.responsible || 'غير محدد');
        const safeDate = (typeof escapeHtml === 'function') ? escapeHtml(item.date) : item.date;
        const safeType = (typeof escapeHtml === 'function' && item.type) ? escapeHtml(item.type) : item.type;

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding: 7px 4px; flex-wrap: wrap; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 7px; flex-wrap: wrap;">
                <span style="background: #ffffff !important; border: 1.5px solid #cbd5e1 !important; color: #0c2461 !important; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 0.74rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                    📅 ${safeDate}
                </span>
                <span style="color: #0f172a !important; font-weight: 800; font-size: 0.84rem;">
                    ${safeTitle}
                </span>
                ${safeType ? `<span style="background: ${badgeBg} !important; color: ${typeColor} !important; font-size: 0.7rem; font-weight: bold; padding: 2px 8px; border-radius: 5px; border: 1px solid ${badgeBorder} !important;">${safeType}</span>` : ''}
            </div>
            <span style="background: ${badgeBg} !important; color: ${badgeColor} !important; border: 1.5px solid ${badgeBorder} !important; font-size: 0.73rem; font-weight: 800; padding: 3px 10px; border-radius: 6px; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                <i class="fa-solid ${badgeIcon}"></i> المسؤول: ${safeResp}
            </span>
        </div>
        `;
    }).join('');
}

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
            headers: { 'Content-Type': 'application/json',
            'x-api-key': 'khedmety-servant-key-2026' },
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

function sendWhatsAppBirthdayDirect(name, phone, btnEl, gender) {
    let isF = false;
    if (gender) {
        const g = String(gender).trim();
        isF = (g === 'بنات' || g === 'female' || g === 'أنثى' || g.includes('بنت') || g.includes('خادمة'));
    } else if (typeof members !== 'undefined' && Array.isArray(members)) {
        const cleanP = String(phone || '').replace(/[^0-9]/g, '');
        const found = members.find(m => m.name === name || (cleanP && String(m.phone || '').replace(/[^0-9]/g, '') === cleanP));
        if (found) {
            const g = String(found.gender || found.stage || '').trim();
            isF = (g === 'بنات' || g === 'female' || g === 'أنثى' || g.includes('بنت') || g.includes('خادمة'));
        }
    }

    const rawMsg = isF
        ? `كل سنة وأنتِ طيبة يا ${name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئكِ بعيد ميلادكِ وتصلي لكِ بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
        : `كل سنة وأنت طيب يا ${name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`;
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

matchedBirthdays.push({ name: m.name, phone: m.phone, gender: m.gender || 'بنين', type: 'دارس', date: `${parsed.day}/${parsed.month}` });

}

}

});

if (currentPermission === 'admin' || currentPermission === 'developer' || currentPermission === 'full') {

servants.forEach(s => {

if (s.dob) {

let parsed = parseDobParts(s.dob);

if (parsed && parsed.month === currentMonth && Math.abs(parsed.day - currentDay) <= 4) {

const servG = s.gender || ((s.role && s.role.includes('خادمة')) ? 'بنات' : 'بنين');
matchedBirthdays.push({ name: s.name, phone: s.phone, gender: servG, type: 'خادم', date: `${parsed.day}/${parsed.month}` });

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
    const isF = (b.gender === 'بنات' || b.gender === 'female' || b.gender === 'أنثى');
    let waMsg = encodeURIComponent(isF
        ? `كل سنة وأنتِ طيبة يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئكِ بعيد ميلادكِ وتصلي لكِ بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
        : `كل سنة وأنت طيب يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
    );

    return `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #ffeaa7; padding:6px 0; flex-wrap:wrap; gap:6px;">
        <span>🎉 <strong>${escapeHtml(b.name)}</strong> (${escapeHtml(b.type)}) - ${escapeHtml(b.date)}</span>
        <div style="display:flex; gap:4px; align-items:center;">
            ${cleanPhone ? `
                <button type="button" onclick="sendWhatsAppBirthdayDirect('${escapeHtml(b.name)}', '${escapeHtml(cleanPhone)}', this, '${escapeHtml(b.gender || '')}')" class="btn-mini btn-success" style="cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:4px;">
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
