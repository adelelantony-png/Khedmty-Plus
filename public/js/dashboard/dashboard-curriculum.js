// ==========================================

// 51. المواد والكتل والامتحانات (دراسة متتابعة)

// ==========================================

(function () {

'use strict';

var LS_KEY = 'khedmety_courses_module';

var STAGES = { 1: 'سنة أولى', 2: 'سنة ثانية' };

var ui = { view: 'courses', year: 1, examBlock: null, planFilter: 'all' };

var _plan = null;

function defaults() {

return { courses: [], blocks: [], grades: {},

settings: { start: { 1: '', 2: '' }, weekday: 5, pattern: '2,2,3', skip: '', max: 100, passPct: 50, requireExams: false, review: true, makeup: true, gradReserve: true },

updatedAt: 0 };

}

function norm(v) {

var d = defaults(); v = v || {};

d.courses = (Array.isArray(v.courses) ? v.courses : Object.values(v.courses || {})).filter(Boolean);

d.blocks = (Array.isArray(v.blocks) ? v.blocks : Object.values(v.blocks || {})).filter(Boolean).map(function (b) {

b.courseIds = Array.isArray(b.courseIds) ? b.courseIds : Object.values(b.courseIds || {}); return b; });

d.grades = v.grades || {};

var s = v.settings || {};

d.settings = Object.assign(d.settings, s);

d.settings.start = Object.assign({ 1: '', 2: '' }, s.start || {});

d.updatedAt = v.updatedAt || 0;

return d;

}

var state;

try { state = norm(JSON.parse(localStorage.getItem(LS_KEY))); } catch (e) { state = defaults(); }

function save() {

_plan = null;

state.updatedAt = Date.now();

localStorage.setItem(LS_KEY, JSON.stringify(state));

dirty = true;

cloudPush();

}

// رفع مستقل للسحابة: لا يستخدم قائمة الانتظار العامة، ويعرض سبب أي فشل بوضوح

var dirty = false, cloudMsg = '', cloudOk = false;

function cloudPush() {

try {

if (!(isFirebaseActive && fsdb)) { cloudOk = false; cloudMsg = 'العمل محلياً — لا يوجد اتصال بالسحابة بعد.'; paintCloud(); return; }

fsdb.collection('config').doc('courses_module').set(JSON.parse(JSON.stringify(state))).then(function () {

dirty = false; cloudOk = true; cloudMsg = 'محفوظ على السحابة ✅'; paintCloud();

}).catch(function (e) { cloudFail(e); });

} catch (e) { cloudFail(e); }

}

function cloudFail(e) {

cloudOk = false;

var code = (e && (e.code || e.message)) || 'خطأ غير معروف';

cloudMsg = /permission/i.test(code)

? 'لم يُرفع: الصلاحيات في Firestore ترفض الكتابة على config/courses_module. تأكد من وجود قاعدة match /config/{docId} في Firestore Rules.'

: 'لم يُرفع للسحابة (' + code + '). سيُعاد المحاولة تلقائياً.';

paintCloud();

}

function pendingPaths() {

try { return Object.keys(JSON.parse(localStorage.getItem('pending_sync_paths')) || {}); } catch (e) { return []; }

}

function cloudBanner() {

var pp = pendingPaths();

var ok = cloudOk && !dirty;

var bg = ok ? '#e8f8f5' : '#fff3cd', bd = ok ? '#55efc4' : '#ffeaa7';

return '<div id="cm_cloud" style="background:' + bg + ';border:1px solid ' + bd + ';padding:6px 10px;border-radius:8px;margin-bottom:10px;font-size:12px;line-height:1.7;">☁️ ' + esc(cloudMsg || (dirty ? 'جاري الرفع…' : 'محفوظ')) +

(pp.length ? '<br>🔎 عناصر معلّقة في التطبيق: <strong dir="ltr">' + esc(pp.join(', ')) + '</strong>' : '') + '</div>';

}

function paintCloud() {

var el = document.getElementById('cm_cloud');

if (el && el.parentNode) { var tmp = document.createElement('div'); tmp.innerHTML = cloudBanner(); el.parentNode.replaceChild(tmp.firstChild, el); }

}

// تنظيف: لو كان عنصر courses_module عالقاً في قائمة الانتظار القديمة من نسخة سابقة

try {

var _pk = JSON.parse(localStorage.getItem('pending_sync_paths')) || {};

if (_pk.courses_module) {

delete _pk.courses_module; localStorage.setItem('pending_sync_paths', JSON.stringify(_pk));

if (typeof updatePendingBadge === 'function') updatePendingBadge();

}

} catch(e){ console.warn("[خدمتي برو]", e); }

dirty = (state.updatedAt || 0) > 0;

setInterval(function () { if (dirty && navigator.onLine) cloudPush(); }, 15000);

window.addEventListener('online', function () { if (dirty) cloudPush(); });

function canEdit() { return currentPermission === 'admin' || currentPermission === 'developer' || currentPermission === 'full'; }

function esc(s) { return (typeof escapeHtml === 'function') ? escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function uid(p) { return p + '_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

function parseDate(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

function coursesOf(y) { return state.courses.filter(function (c) { return c.year === y; }); }

function blocksOf(y) { return state.blocks.filter(function (b) { return b.year === y; }); }

function courseById(id) { return state.courses.filter(function (c) { return c.id === id; })[0]; }

function yearOfStage(st) { return (st || 'سنة أولى') === 'سنة ثانية' ? 2 : 1; }

function membersOfYear(y) {

return (members || []).filter(function (m) { return yearOfStage(m.stage) === y; })

.map(function (m) { return { id: String(m.id), code: m.code || m.id, name: m.name || '' }; });

}

/* ---------- الكتل والخطة ---------- */

function rebuildBlocks(y) {

var sizes = String(state.settings.pattern || '2').split(/[,\s،]+/).map(Number).filter(function (n) { return n > 0; });

if (!sizes.length) sizes = [2];

var list = coursesOf(y), i = 0, k = 0, out = [];

while (i < list.length) {

var n = sizes[Math.min(k, sizes.length - 1)];

out.push({ id: uid('blk'), year: y, courseIds: list.slice(i, i + n).map(function (c) { return c.id; }) });

i += n; k++;

}

state.blocks = state.blocks.filter(function (b) { return b.year !== y; }).concat(out);

}

/* ---------- المُجدول الذكي (الفرقتان معاً) ---------- */

function lecturersOf(c) {

return String(c.lecturer || '').split(/[،,\/+]/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);

}

function serviceRange() {

var st = (typeof settings !== 'undefined' && settings.serviceStart) || '2026-09-01';

var en = (typeof settings !== 'undefined' && settings.serviceEnd) || '2027-07-01';

return { start: st, end: en };

}

// كل تواريخ الاجتماع من بداية الخدمة، مع علامة هل التاريخ داخل فترة الخدمة

function meetingDates() {

var s = state.settings, r = serviceRange(), skip = {};

String(s.skip || '').split(/[\s,،]+/).filter(Boolean).forEach(function (x) { skip[x] = 1; });

var d = parseDate(r.start), endD = parseDate(r.end), out = [];

while (d.getDay() !== Number(s.weekday)) d.setDate(d.getDate() + 1);

for (var i = 0; i < 400; i++) {

var x = iso(d);

if (!skip[x]) out.push({ date: x, inRange: d <= endD });

d.setDate(d.getDate() + 7);

}

return out;

}

function yearBlocks(y, reviewSet) {

return blocksOf(y).map(function (b, i) {

return {

id: b.id, no: i + 1,

cs: b.courseIds.map(courseById).filter(Boolean).map(function (c) { return { c: c, left: c.weeks, total: c.weeks }; }),

rev: reviewSet[b.id] ? 1 : 0

};

}).filter(function (b) { return b.cs.length; });

}

// محاكاة أسبوعاً بأسبوع للفرقتين معاً بدون تعارض محاضرين

function simulate(reviewSet, dates) {

var S = { 1: { bl: yearBlocks(1, reviewSet), bi: 0, debt: 0 }, 2: { bl: yearBlocks(2, reviewSet), bi: 0, debt: 0 } };

var rows = [], conflicts = 0, idle = 0, di = 0;

function active(y) { return S[y].bi < S[y].bl.length; }

function inProg(y) {

if (!active(y)) return 0;

return S[y].bl[S[y].bi].cs.some(function (x) { return x.left > 0 && x.left < x.total; }) ? 1 : 0;

}

while ((active(1) || active(2)) && di < dates.length) {

var dt = dates[di].date, busy = {};

var order = [1, 2].filter(active);

order.sort(function (a, b) {

var ia = inProg(a), ib = inProg(b);

if (ia !== ib) return ib - ia;

if (S[a].debt !== S[b].debt) return S[b].debt - S[a].debt;

return (di % 2) ? b - a : a - b;

});

order.forEach(function (y) {

var st = S[y], b = st.bl[st.bi];

var pending = b.cs.filter(function (x) { return x.left > 0; });

var names = b.cs.map(function (x) { return x.c.name; }).join(' + ');

if (pending.length) {

pending.sort(function (a, c) { return (a.left < a.total ? 0 : 1) - (c.left < c.total ? 0 : 1); });

var pick = null;

for (var i = 0; i < pending.length; i++) {

var lects = lecturersOf(pending[i].c);

if (lects.some(function (l) { return busy[l]; })) { conflicts++; continue; }

pick = pending[i]; break;

}

if (!pick) {

st.debt++; idle++;

if (b.rev > 0) { b.rev--; rows.push({ idx: di, date: dt, year: y, type: 'محاضرة', kind: 'review', title: 'مراجعة الكتلة ' + b.no + ': ' + names, who: '' }); }

else rows.push({ idx: di, date: dt, year: y, type: 'محاضرة', kind: 'idle', title: 'مراجعة وحلقة نقاش (تبادل دور المحاضرين)', who: '' });

return;

}

lecturersOf(pick.c).forEach(function (l) { busy[l] = 1; });

pick.left--;

if (st.debt > 0) st.debt--;

rows.push({ idx: di, date: dt, year: y, type: 'محاضرة', kind: 'lecture', title: pick.c.name + ' (' + (pick.total - pick.left) + '/' + pick.total + ')', who: pick.c.lecturer || '', course: pick.c.name });

return;

}

if (b.rev > 0) { b.rev--; rows.push({ idx: di, date: dt, year: y, type: 'محاضرة', kind: 'review', title: 'مراجعة الكتلة ' + b.no + ': ' + names, who: '' }); return; }

rows.push({ idx: di, date: dt, year: y, type: 'امتحان', kind: 'exam', title: 'امتحان الكتلة ' + b.no + ': ' + names, who: '' });

st.bi++;

});

di++;

}

return { rows: rows, used: di, conflicts: conflicts, idle: idle, complete: !(active(1) || active(2)) };

}

function buildPlan() {

var s = state.settings, dates = meetingDates();

var N = dates.filter(function (d) { return d.inRange; }).length;

var grad = s.gradReserve ? 1 : 0, limit = N - grad;

var res = simulate({}, dates), reviewCount = 0;

var spare = limit - res.used;

if (s.review && spare > 0 && res.complete) {

var maxB = Math.max(blocksOf(1).length, blocksOf(2).length);

for (var k = Math.min(spare, maxB); k > 0; k--) {

var set = {};

[1, 2].forEach(function (y) {

blocksOf(y).slice().sort(function (a, b) { return b.courseIds.length - a.courseIds.length; })

.slice(0, k).forEach(function (b) { set[b.id] = 1; });

});

var tr = simulate(set, dates);

if (tr.complete && tr.used <= limit) { res = tr; reviewCount = k; break; }

}

}

var rows = res.rows.map(function (r) { r.stage = STAGES[r.year]; r.over = r.idx >= limit; return r; });

var spareLeft = limit - res.used, makeup = false;

if (s.makeup && spareLeft >= 1 && res.used < dates.length && res.complete) {

[1, 2].forEach(function (y) {

if (blocksOf(y).length) rows.push({ idx: res.used, date: dates[res.used].date, year: y, stage: STAGES[y], type: 'امتحان', kind: 'makeup', title: 'امتحان تعويضي / ملاحق ' + STAGES[y], who: '', over: false });

});

makeup = true; spareLeft--;

}

if (grad && N > 0 && rows.length) {

rows.push({ idx: N - 1, date: dates[N - 1].date, year: 0, stage: 'عام لكل الخدمة', type: 'حفل تخرج', kind: 'grad', title: 'حفل تخرج واجتياز الدورة', who: '', over: false });

}

rows.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.year - b.year; });

// تحقق نهائي: لا محاضر في فرقتين بنفس اليوم

var seen = {}, clash = 0;

rows.forEach(function (r) {

if (r.kind !== 'lecture') return;

lecturersOf({ lecturer: r.who }).forEach(function (l) { var k = r.date + '|' + l; if (seen[k]) clash++; seen[k] = 1; });

});

// أحمال المحاضرين

var loads = {};

rows.forEach(function (r) {

if (r.kind !== 'lecture' || !r.who) return;

var key = r.who.trim();

loads[key] = loads[key] || { 1: 0, 2: 0 };

loads[key][r.year]++;

});

var r0 = serviceRange();

return { rows: rows, loads: loads, stats: {

start: r0.start, end: r0.end, N: N, used: res.used, limit: limit,

over: res.complete ? Math.max(0, res.used - limit) : 999, complete: res.complete,

spare: Math.max(0, spareLeft), reviewCount: reviewCount, conflicts: res.conflicts, idle: res.idle,

makeup: makeup, grad: !!grad, clash: clash

} };

}

function plan() { return _plan || (_plan = buildPlan()); }

function schedule(y) {

return plan().rows.filter(function (r) { return r.year === y || r.year === 0; });

}

function blockLabel(b, i) {

return 'الكتلة ' + (i + 1) + ': ' + b.courseIds.map(function (id) { var c = courseById(id); return c ? c.name : '؟'; }).join(' + ');

}

/* ---------- الدرجات والنتائج ---------- */

function passMark() { return (Number(state.settings.max) || 100) * (Number(state.settings.passPct) || 50) / 100; }

function statusOf(blockId, mid) {

var g = (state.grades[blockId] || {})[mid];

if (g === undefined || g === null || g === '') return 'none';

return Number(g) >= passMark() ? 'pass' : 'fail';

}

function yearResult(y, mid) {

var bl = blocksOf(y);

if (!bl.length) return 'none';

var res = bl.map(function (b) { return statusOf(b.id, String(mid)); });

if (res.indexOf('fail') > -1) return 'fail';

if (res.indexOf('none') > -1) return 'pending';

return 'pass';

}

// يُستدعى من calculateGraduationStatus

function graduationInfo(mid, stage) {

var y = yearOfStage(stage), r = yearResult(y, mid);

var required = !!state.settings.requireExams && blocksOf(y).length > 0;

return { required: required, result: r, ok: !required || r === 'pass' };

}

/* ---------- الواجهة ---------- */

function nav() {

var items = [['courses', 'المواد 📚'], ['plan', 'الكتل والخطة 🗓️'], ['grades', 'الدرجات ✍️'], ['results', 'النتائج 🏅']];

return '<div style="margin-bottom:10px;">' + items.map(function (it) {

return '<span class="capsule-btn ' + (ui.view === it[0] ? 'active' : '') + '" onclick="CM.go(\'' + it[0] + '\')">' + it[1] + '</span>';

}).join('') + '</div>' +

'<div style="margin-bottom:10px;"><label style="font-weight:bold;font-size:13px;">الفرقة: </label>' +

'<select style="width:auto;display:inline-block;" onchange="CM.setYear(this.value)">' +

'<option value="1"' + (ui.year === 1 ? ' selected' : '') + '>سنة أولى</option>' +

'<option value="2"' + (ui.year === 2 ? ' selected' : '') + '>سنة ثانية</option></select></div>';

}

function progressBanner() {

var todayIso = iso(new Date()), rows = schedule(ui.year);

if (!rows.length) return '';

var up = rows.filter(function (r) { return r.date >= todayIso; })[0];

if (!up) return '<div style="background:#e8f8f5;border:1px solid #55efc4;padding:10px;border-radius:8px;margin-bottom:10px;font-size:13px;">✅ انتهت كل محطات خطة ' + STAGES[ui.year] + '.</div>';

var ex = rows.filter(function (r) { return r.date >= todayIso && r.type === 'امتحان'; })[0];

return '<div style="background:#e8f4fd;border:1px solid #74b9ff;padding:10px;border-radius:8px;margin-bottom:10px;font-size:13px;line-height:1.7;">' +

'<strong>المحطة القادمة:</strong> ' + esc(up.date) + ' — ' + esc(up.title) + (up.who ? ' (' + esc(up.who) + ')' : '') +

(ex ? '<br><strong>أقرب امتحان:</strong> ' + esc(ex.date) + ' — ' + esc(ex.title) : '') + '</div>';

}

function lectOptions() {

try { return (servants || []).map(function (s) { return '<option value="' + esc(s.name) + '">'; }).join(''); } catch (e) { return ''; }

}

function viewCourses() {

var y = ui.year, list = coursesOf(y), ed = canEdit(), h = '';

if (ed) {

h += '<div style="background:#fdfefe;border:2px dashed var(--primary);padding:12px;border-radius:8px;margin-bottom:12px;">' +

'<h4 style="margin:0 0 8px 0;color:var(--primary);">➕ إضافة مادة إلى ' + STAGES[y] + '</h4>' +

'<div class="form-grid">' +

'<div class="form-group"><label>اسم المادة</label><input id="cm_name" type="text" placeholder="مثال: العقيدة"></div>' +

'<div class="form-group"><label>المحاضر (من الخدام)</label><input id="cm_lect" type="text" list="cm_lects" placeholder="اختر أو اكتب الاسم"><datalist id="cm_lects">' + lectOptions() + '</datalist></div>' +

'<div class="form-group"><label>تُضاف إلى</label><select id="cm_target"><option value="' + y + '">' + STAGES[y] + ' فقط</option><option value="both">الفرقتين معاً</option></select></div>' +

'<div class="form-group"><label>عدد الأسابيع</label><input id="cm_weeks" type="number" min="1" value="4"></div></div>' +

'<button class="btn-success" onclick="CM.addCourse()">حفظ المادة</button>' +

'<details style="margin-top:6px;"><summary style="font-size:12px;cursor:pointer;">إضافة عدة مواد دفعة واحدة (اسم في كل سطر) — حسب خيار "تُضاف إلى" أعلاه</summary>' +

'<textarea id="cm_bulk" rows="4" placeholder="العقيدة&#10;الطقوس&#10;الكتاب المقدس"></textarea>' +

'<button class="btn-primary" onclick="CM.addBulk()" style="margin-top:6px;">إضافة الكل (٤ أسابيع لكل مادة)</button></details></div>';

}

if (!list.length) return h + '<div class="empty-state">لا توجد مواد لـ' + STAGES[y] + ' بعد. المطلوب ٧ مواد.</div>';

h += '<div style="font-size:12px;color:#636e72;margin-bottom:6px;">عدد المواد: ' + list.length + ' من ٧ — الترتيب هنا هو ترتيب الدراسة.</div>' +

'<div class="table-responsive"><table class="adaptive-card-table"><thead><tr><th>#</th><th>المادة</th><th>المحاضر</th><th>الأسابيع</th>' + (ed ? '<th>إجراء</th>' : '') + '</tr></thead><tbody>';

list.forEach(function (c, i) {

h += '<tr><td data-label="#">' + (i + 1) + '</td><td data-label="المادة">' + esc(c.name) + '</td><td data-label="المحاضر">' + esc(c.lecturer || '—') + '</td><td data-label="الأسابيع">' + c.weeks + '</td>' +

(ed ? '<td data-label="إجراء"><div class="action-btn-group">' +

'<button type="button" class="btn-mini btn-primary" title="تقديم المادة لأعلى" style="width:28px;min-width:28px;padding:4px 0;" onclick="CM.move(\'' + c.id + '\',-1)">▲</button>' +

'<button type="button" class="btn-mini btn-primary" title="تأخير المادة لأسفل" style="width:28px;min-width:28px;padding:4px 0;" onclick="CM.move(\'' + c.id + '\',1)">▼</button>' +

'<button type="button" class="btn-mini btn-warning" onclick="CM.editCourse(\'' + c.id + '\')">تعديل</button>' +

'<button type="button" class="btn-mini btn-danger" onclick="CM.delCourse(\'' + c.id + '\')">حذف</button>' +

'</div></td>' : '') + '</tr>';

});

return h + '</tbody></table></div>';

}

function viewPlan() {

var s = state.settings, ed = canEdit(), P = plan(), st = P.stats;

var days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

var h = '<div style="background:#f1f2f6;border:1px solid #dfe6e9;padding:8px 10px;border-radius:8px;margin-bottom:10px;font-size:13px;">📅 فترة الخدمة (من الإعدادات): <strong>' + esc(st.start) + '</strong> ← <strong>' + esc(st.end) + '</strong> — عدد أسابيع الاجتماع المتاحة: <strong>' + st.N + '</strong></div>';

if (ed) {

function chk(id, v, label) { return '<label style="display:flex;gap:6px;align-items:center;font-size:13px;margin:4px 0;"><input type="checkbox" id="' + id + '" style="width:auto;" ' + (v ? 'checked' : '') + '> ' + label + '</label>'; }

h += '<div style="background:#f8f9fa;border:1px solid #dfe6e9;padding:12px;border-radius:8px;margin-bottom:12px;"><div class="form-grid">' +

'<div class="form-group"><label>يوم الاجتماع</label><select id="cm_weekday">' +

days.map(function (d, i) { return '<option value="' + i + '"' + (Number(s.weekday) === i ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></div>' +

'<div class="form-group"><label>عدد مواد كل كتلة (يتكرر الأخير)</label><input id="cm_pattern" type="text" value="' + esc(s.pattern) + '" placeholder="2,2,3"></div>' +

'<div class="form-group"><label>تواريخ توقف (امتحانات الجامعة/أعياد) YYYY-MM-DD</label><input id="cm_skip" type="text" value="' + esc(s.skip) + '" placeholder="2027-01-08, 2027-01-15"></div></div>' +

chk('cm_rev', s.review, 'استغلال الأسابيع الفائضة كأسابيع مراجعة قبل الامتحانات') +

chk('cm_mk', s.makeup, 'حجز أسبوع للامتحان التعويضي (للغائبين والملاحق)') +

chk('cm_gr', s.gradReserve, 'حجز آخر أسبوع في فترة الخدمة لحفل التخرج') +

chk('cm_req', s.requireExams, 'اشتراط اجتياز الامتحانات للتخرج (مع حضور ≥٧٥٪)') +

'<div style="margin-top:8px;"><button class="btn-primary" onclick="CM.savePlanSettings(true)">تقسيم المواد إلى كتل وتوليد الخطة (الفرقتين) 🚀</button> ' +

'<button class="btn-success" onclick="CM.savePlanSettings(false)">حفظ الإعدادات فقط</button></div></div>';

}

if (!blocksOf(1).length && !blocksOf(2).length) return h + '<div class="empty-state">أضف المواد أولاً ثم اضغط "تقسيم المواد إلى كتل".</div>';

var okBox = st.over === 0 && st.complete;

h += '<div style="background:' + (okBox ? '#e8f8f5' : '#fdeaea') + ';border:1px solid ' + (okBox ? '#55efc4' : '#ff7675') + ';padding:10px;border-radius:8px;margin-bottom:10px;font-size:13px;line-height:1.9;">' +

(okBox ? '✅ الخطة تناسب فترة الخدمة. ' : '❌ الخطة تزيد عن فترة الخدمة بمقدار <strong>' + (st.complete ? st.over : 'كبير') + '</strong> أسبوع. ') +

'<br>المطلوب: <strong>' + st.used + '</strong> أسبوع من <strong>' + st.limit + '</strong> متاح' + (st.grad ? ' (بعد حجز أسبوع التخرج)' : '') +

'<br>أسابيع مراجعة مضافة: <strong>' + st.reviewCount + '</strong> بلوك لكل فرقة — تعارضات محاضرين تم تفاديها: <strong>' + st.conflicts + '</strong>' +

(st.makeup ? ' — ✅ امتحان تعويضي محجوز' : '') + (st.spare > 0 ? ' — أسابيع احتياطية متبقية: <strong>' + st.spare + '</strong>' : '') +

(st.clash > 0 ? '<br>⚠️ يوجد ' + st.clash + ' تعارض متبقٍ لنفس المحاضر في نفس اليوم — غيّر ترتيب المواد.' : '<br>✅ لا يوجد محاضر مجدول في فرقتين في نفس اليوم.') +

(!okBox && ed ? '<br><button class="btn-mini btn-warning" style="margin-top:6px;" onclick="CM.compress()">⚡ ضبط أسابيع المواد تلقائياً لتناسب الفترة</button>' : '') + '</div>';

var names = Object.keys(P.loads);

if (names.length) {

h += '<details style="margin-bottom:10px;"><summary style="font-weight:bold;cursor:pointer;color:var(--primary);">👤 توزيع المحاضرين (' + names.length + ')</summary>' +

'<div class="table-responsive"><table class="adaptive-card-table"><thead><tr><th>المحاضر</th><th>سنة أولى</th><th>سنة ثانية</th><th>الإجمالي</th></tr></thead><tbody>' +

names.sort().map(function (n) { var l = P.loads[n]; return '<tr><td data-label="المحاضر">' + esc(n) + '</td><td data-label="سنة أولى">' + l[1] + '</td><td data-label="سنة ثانية">' + l[2] + '</td><td data-label="الإجمالي"><strong>' + (l[1] + l[2]) + '</strong></td></tr>'; }).join('') +

'</tbody></table></div></details>';

}

[1, 2].forEach(function (y) {

var bl = blocksOf(y);

if (!bl.length) return;

h += '<h4 style="color:var(--primary);margin:8px 0;">كتل ' + STAGES[y] + '</h4>' + bl.map(function (b, i) {

return '<div style="background:#fff;border:1px solid #dfe6e9;border-right:4px solid ' + (y === 1 ? 'var(--purple)' : 'var(--primary)') + ';padding:8px 10px;border-radius:8px;margin-bottom:6px;font-size:13px;">' + esc(blockLabel(b, i)) + '</div>';

}).join('');

});

var rows = P.rows.filter(function (r) { return ui.planFilter === 'all' || r.year === 0 || String(r.year) === ui.planFilter; });

if (rows.length) {

h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap;"><h4 style="color:var(--primary);margin:0;">الجدول المتتابع (' + rows.length + ' محطة)</h4><div>' +

'<select style="width:auto;display:inline-block;" onchange="CM.setFilter(this.value)">' +

'<option value="all"' + (ui.planFilter === 'all' ? ' selected' : '') + '>الفرقتان</option><option value="1"' + (ui.planFilter === '1' ? ' selected' : '') + '>سنة أولى</option><option value="2"' + (ui.planFilter === '2' ? ' selected' : '') + '>سنة ثانية</option></select> ' +

(ed ? '<button class="btn-mini btn-primary" onclick="CM.pushToPlan()">➕ إضافة للخطة السنوية</button> ' : '') +

'<button class="btn-mini btn-success" onclick="CM.exportPlan()">📊 Excel</button></div></div>' +

'<div class="table-responsive"><table class="adaptive-card-table"><thead><tr><th>التاريخ</th><th>الفرقة</th><th>النوع</th><th>العنوان</th><th>المحاضر</th></tr></thead><tbody>' +

rows.map(function (r) {

var bg = r.over ? 'background:#fdeaea;' : (r.kind === 'exam' || r.kind === 'makeup') ? 'background:#fff3cd;font-weight:bold;' : r.kind === 'grad' ? 'background:#e8daef;font-weight:bold;' : (r.kind === 'review' || r.kind === 'idle') ? 'background:#eef6ff;' : '';

return '<tr style="' + bg + '"><td data-label="التاريخ">' + esc(r.date) + (r.over ? ' ⚠️' : '') + '</td><td data-label="الفرقة">' + (r.year ? (r.year === 1 ? 'أولى' : 'ثانية') : 'الكل') + '</td><td data-label="النوع">' + esc(r.type) + '</td><td data-label="العنوان">' + esc(r.title) + '</td><td data-label="المحاضر">' + esc(r.who || '—') + '</td></tr>';

}).join('') + '</tbody></table></div>';

}

return h;

}

function viewGrades() {

var y = ui.year, bl = blocksOf(y), ed = canEdit();

if (!bl.length) return '<div class="empty-state">لا توجد كتل بعد. ولّد الخطة أولاً من تبويب "الكتل والخطة".</div>';

if (!ui.examBlock || !bl.some(function (b) { return b.id === ui.examBlock; })) ui.examBlock = bl[0].id;

var ms = membersOfYear(y), h = '';

if (ed) {

h += '<div style="background:#f8f9fa;border:1px solid #dfe6e9;padding:10px;border-radius:8px;margin-bottom:10px;"><div class="form-grid">' +

'<div class="form-group"><label>الدرجة العظمى</label><input id="cm_max" type="number" value="' + esc(state.settings.max) + '" onchange="CM.saveGradeSettings()"></div>' +

'<div class="form-group"><label>نسبة النجاح %</label><input id="cm_pct" type="number" value="' + esc(state.settings.passPct) + '" onchange="CM.saveGradeSettings()"></div></div></div>';

}

h += '<div class="form-group" style="margin-bottom:10px;"><label>اختر الامتحان</label><select onchange="CM.setBlock(this.value)">' +

bl.map(function (b, i) { return '<option value="' + b.id + '"' + (b.id === ui.examBlock ? ' selected' : '') + '>' + esc(blockLabel(b, i)) + '</option>'; }).join('') + '</select></div>';

if (!ms.length) return h + '<div class="empty-state">لا يوجد دارسون مسجلون في ' + STAGES[y] + '.</div>';

var g = state.grades[ui.examBlock] || {};

h += '<div style="font-size:12px;color:#636e72;margin-bottom:6px;">درجة النجاح: ' + passMark() + ' — اترك الخانة فارغة لمن لم يمتحن.</div>' +

'<div class="table-responsive"><table class="adaptive-card-table"><thead><tr><th>الكود</th><th>الاسم</th><th>الدرجة</th><th>الحالة</th></tr></thead><tbody>';

ms.forEach(function (m) {

var st = statusOf(ui.examBlock, m.id);

var label = st === 'pass' ? '✅ ناجح' : st === 'fail' ? '❌ راسب (ملحق)' : '— لم يمتحن';

var val = g[m.id] === undefined ? '' : g[m.id];

h += '<tr><td data-label="الكود">' + esc(m.code) + '</td><td data-label="الاسم">' + esc(m.name) + '</td><td data-label="الدرجة">' +

(ed ? '<input type="number" style="width:90px;" value="' + esc(val) + '" onchange="CM.setGrade(\'' + esc(m.id) + '\',this.value)">' : (val === '' ? '—' : esc(val))) +

'</td><td data-label="الحالة">' + label + '</td></tr>';

});

return h + '</tbody></table></div>';

}

function viewResults() {

var y = ui.year, bl = blocksOf(y), ms = membersOfYear(y);

if (!bl.length) return '<div class="empty-state">لا توجد كتل بعد.</div>';

if (!ms.length) return '<div class="empty-state">لا يوجد دارسون في ' + STAGES[y] + '.</div>';

var tag = { pass: '✅ اجتاز', fail: '❌ عليه ملحق', pending: '⏳ لم يكمل', none: '—' };

var ok = ms.filter(function (m) { return yearResult(y, m.id) === 'pass'; }).length;

var h = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +

'<div style="font-size:13px;font-weight:bold;">اجتازوا كل الامتحانات: ' + ok + ' من ' + ms.length + '</div>' +

'<button class="btn-mini btn-success" onclick="CM.exportResults()">📊 Excel</button></div>' +

'<div class="table-responsive"><table class="adaptive-card-table"><thead><tr><th>الكود</th><th>الاسم</th>' +

bl.map(function (b, i) { return '<th>كتلة ' + (i + 1) + '</th>'; }).join('') + '<th>النتيجة</th></tr></thead><tbody>';

ms.forEach(function (m) {

h += '<tr><td data-label="الكود">' + esc(m.code) + '</td><td data-label="الاسم">' + esc(m.name) + '</td>' +

bl.map(function (b, i) {

var v = (state.grades[b.id] || {})[m.id], st = statusOf(b.id, m.id);

return '<td data-label="كتلة ' + (i + 1) + '" style="color:' + (st === 'fail' ? 'var(--danger)' : st === 'pass' ? 'var(--success)' : '#888') + ';">' + (v === undefined || v === '' ? '—' : esc(v)) + '</td>';

}).join('') + '<td data-label="النتيجة">' + tag[yearResult(y, m.id)] + '</td></tr>';

});

return h + '</tbody></table></div>';

}

function render() {

_plan = null;

var el = document.getElementById('coursesTab');

if (!el) return;

var body = ui.view === 'plan' ? viewPlan() : ui.view === 'grades' ? viewGrades() : ui.view === 'results' ? viewResults() : viewCourses();

el.innerHTML = '<h2>🎓 المواد والكتل والامتحانات</h2>' +

'<p style="font-size:12px;color:#636e72;margin-top:0;">دراسة متتابعة: كل كتلة (٢ أو ٣ مواد) يعقبها امتحان، ثم الكتلة التالية.</p>' +

cloudBanner() + nav() + progressBanner() + body;

}

function xlsx(rows, headers, name) {

if (typeof XLSX === 'undefined') { alert('مكتبة Excel غير محمّلة.'); return; }

var ws = XLSX.utils.aoa_to_sheet([headers].concat(rows)), wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

XLSX.writeFile(wb, name);

}

function guard() { if (!canEdit()) { alert('هذه العملية متاحة للأدمن والخادم المتكامل فقط.'); return false; } return true; }

window.CM = {

go: function (v) { ui.view = v; render(); },

setYear: function (v) { ui.year = Number(v); ui.examBlock = null; render(); },

setBlock: function (v) { ui.examBlock = v; render(); },

addCourse: function () {

if (!guard()) return;

var n = document.getElementById('cm_name').value.trim();

if (!n) { showToast('اكتب اسم المادة', true); return; }

var tg = document.getElementById('cm_target').value, years = tg === 'both' ? [1, 2] : [ui.year];

var lect = document.getElementById('cm_lect').value.trim();

var wk = Math.max(1, parseInt(document.getElementById('cm_weeks').value, 10) || 4);

years.forEach(function (y) { state.courses.push({ id: uid('crs'), year: y, name: n, lecturer: lect, weeks: wk }); });

save(); render(); showToast('تمت إضافة المادة' + (years.length > 1 ? ' للفرقتين' : ''));

},

addBulk: function () {

if (!guard()) return;

var lines = document.getElementById('cm_bulk').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);

if (!lines.length) return;

var tg = document.getElementById('cm_target').value, years = tg === 'both' ? [1, 2] : [ui.year];

lines.forEach(function (n) { years.forEach(function (y) { state.courses.push({ id: uid('crs'), year: y, name: n, lecturer: '', weeks: 4 }); }); });

save(); render(); showToast('تمت إضافة ' + (lines.length * years.length) + ' مادة');

},

editCourse: function (id) {

if (!guard()) return;

var c = courseById(id); if (!c) return;

var n = prompt('اسم المادة:', c.name); if (n === null) return;

var l = prompt('المحاضر:', c.lecturer || ''); if (l === null) return;

var w = prompt('عدد الأسابيع:', c.weeks); if (w === null) return;

c.name = n.trim() || c.name; c.lecturer = l.trim(); c.weeks = Math.max(1, parseInt(w, 10) || c.weeks);

save(); render();

},

delCourse: function (id) {

if (!guard()) return;

if (!confirm('حذف المادة؟ سيتم إلغاء الكتل الحالية لهذه الفرقة لإعادة توليدها.')) return;

var c = courseById(id); if (!c) return;

state.courses = state.courses.filter(function (x) { return x.id !== id; });

state.blocks = state.blocks.filter(function (b) { return b.year !== c.year; });

save(); render();

},

move: function (id, dir) {

if (!guard()) return;

var c = courseById(id); if (!c) return;

var idxs = []; state.courses.forEach(function (x, i) { if (x.year === c.year) idxs.push(i); });

var pos = idxs.indexOf(state.courses.indexOf(c)), tgt = pos + dir;

if (tgt < 0 || tgt >= idxs.length) return;

var a = idxs[pos], b = idxs[tgt], t = state.courses[a]; state.courses[a] = state.courses[b]; state.courses[b] = t;

state.blocks = state.blocks.filter(function (x) { return x.year !== c.year; });

save(); render();

},

setFilter: function (v) { ui.planFilter = v; render(); },

savePlanSettings: function (rebuild) {

if (!guard()) return;

var s = state.settings;

s.weekday = Number(document.getElementById('cm_weekday').value);

s.pattern = document.getElementById('cm_pattern').value.trim() || '2';

s.skip = document.getElementById('cm_skip').value.trim();

s.review = document.getElementById('cm_rev').checked;

s.makeup = document.getElementById('cm_mk').checked;

s.gradReserve = document.getElementById('cm_gr').checked;

s.requireExams = document.getElementById('cm_req').checked;

if (rebuild) {

var ys = [1, 2].filter(function (y) { return coursesOf(y).length; });

if (!ys.length) { showToast('أضف المواد أولاً', true); return; }

var had = ys.some(function (y) { return blocksOf(y).length; });

if (had && !confirm('إعادة التقسيم ستستبدل الكتل الحالية (الدرجات المسجلة للكتل القديمة لن تظهر). متابعة؟')) return;

ys.forEach(rebuildBlocks);

}

save(); render(); showToast(rebuild ? 'تم توليد الكتل والخطة' : 'تم الحفظ');

},

compress: function () {

if (!guard()) return;

if (!confirm('سيتم تقليل أسابيع بعض المواد (الأطول أولاً) حتى تناسب فترة الخدمة. متابعة؟')) return;

var snapshot = JSON.stringify(state.courses), guardN = 0;

while (guardN++ < 600) {

var P = buildPlan();

if (P.stats.complete && P.stats.over === 0) break;

var best = null;

state.courses.forEach(function (c) { if (c.weeks > 1 && (!best || c.weeks >= best.weeks)) best = c; });

if (!best) { state.courses = JSON.parse(snapshot); alert('حتى بأسبوع واحد لكل مادة لا تناسب الفترة. زوّد فترة الخدمة من الإعدادات أو قلّل تواريخ التوقف.'); return; }

best.weeks--;

}

save(); render(); showToast('تم ضبط الأسابيع');

},

pushToPlan: function () {

if (!guard()) return;

var all = plan().rows;

if (!all.length) return;

var rows = all.filter(function (r) { return !r.over; });

if (rows.length < all.length && !confirm('يوجد ' + (all.length - rows.length) + ' محطة خارج فترة الخدمة ولن تُضاف. متابعة؟')) return;

var added = 0;

rows.forEach(function (r) {

var dup = masterPlan.some(function (e) { return e.date === r.date && e.title === r.title && e.stage === r.stage; });

if (dup) return;

masterPlan.push({ id: generateUniqueId(masterPlan), type: r.type, date: r.date, title: r.title,

location: 'الكنيسة', stage: r.stage, responsible: r.who || 'غير محدد' });

added++;

});

saveMasterPlan();

renderMasterPlanTable();

if (typeof checkUpcomingMasterPlanEvents === 'function') checkUpcomingMasterPlanEvents();

if (typeof logActivity === 'function') logActivity('توليد خطة المواد', 'الفرقتان', 'تمت إضافة ' + added + ' فعالية للخطة');

alert('✅ تمت إضافة ' + added + ' فعالية إلى خطة السنة' + (added < rows.length ? ' (تم تجاهل المكرر).' : '.'));

},

exportPlan: function () {

var rows = plan().rows.filter(function (r) { return ui.planFilter === 'all' || r.year === 0 || String(r.year) === ui.planFilter; })

.map(function (r) { return [r.type, r.date, r.title, 'الكنيسة', r.stage, r.who]; });

xlsx(rows, ['النوع', 'التاريخ (YYYY-MM-DD)', 'عنوان الفعالية', 'المكان', 'المرحلة', 'المسؤول / المحاضر'], 'خطة_المواد.xlsx');

},

saveGradeSettings: function () {

if (!guard()) return;

state.settings.max = Number(document.getElementById('cm_max').value) || 100;

state.settings.passPct = Number(document.getElementById('cm_pct').value) || 50;

save(); render();

},

setGrade: function (mid, v) {

if (!guard()) return;

if (!state.grades[ui.examBlock]) state.grades[ui.examBlock] = {};

if (v === '') delete state.grades[ui.examBlock][mid]; else state.grades[ui.examBlock][mid] = Number(v);

save(); render();

},

exportResults: function () {

var y = ui.year, bl = blocksOf(y), ms = membersOfYear(y);

var names = { pass: 'اجتاز', fail: 'عليه ملحق', pending: 'لم يكمل', none: '' };

var rows = ms.map(function (m) {

return [m.code, m.name].concat(bl.map(function (b) { var v = (state.grades[b.id] || {})[m.id]; return v === undefined ? '' : v; })).concat([names[yearResult(y, m.id)]]);

});

xlsx(rows, ['الكود', 'الاسم'].concat(bl.map(function (b, i) { return 'كتلة ' + (i + 1); })).concat(['النتيجة']), 'نتائج_' + STAGES[y] + '.xlsx');

}

};

window.CoursesModule = {

render: render,

graduationInfo: graduationInfo,

exportState: function () { return state; },

importState: function (v) { state = norm(v); state.updatedAt = Date.now(); localStorage.setItem(LS_KEY, JSON.stringify(state)); dirty = true; render(); cloudPush(); },

applyCloud: function (v) {

// تعديلاتي المحلية التي لم تُرفع بعد لها الأولوية، حتى لا تُمحى

if (!v || dirty) return;

var incoming = norm(v);

if ((incoming.updatedAt || 0) < (state.updatedAt || 0)) return;

state = incoming; localStorage.setItem(LS_KEY, JSON.stringify(state)); cloudOk = true; cloudMsg = 'محفوظ على السحابة ✅'; render();

},

cloudError: function (e) { cloudFail(e); }

};

render();

})();