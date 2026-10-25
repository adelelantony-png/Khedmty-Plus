/* ===== تنقل مجموعات اللوحة: يحافظ على كل تبويبات switchTab كما هي ===== */

(function () {

const GROUPS = [

{ id: 'home',   ic: '🏠', name: 'الرئيسية' },

{ id: 'attend', ic: '📷', name: 'الحضور' },

{ id: 'people', ic: '👥', name: 'المخدومون' },

{ id: 'study',  ic: '🎓', name: 'الدراسة' },

{ id: 'spirit', ic: '🕊️', name: 'الروحيات' },

{ id: 'admin',  ic: '⚙️', name: 'الإدارة' }

];

const TAB_GROUP = {

dashTab: 'home', planTab: 'home',

attendanceTab: 'attend', servantsAttendanceTab: 'attend',

membersTab: 'people', broadcastTab: 'people', followupTab: 'people',

coursesTab: 'study', materialsTab: 'study',

servantsTab: 'admin', rolloverTab: 'admin', auditTab: 'admin', settingsTab: 'admin', dataTab: 'admin', reflectionsTab: 'spirit'

};

const tabs = document.querySelector('.tabs');

if (!tabs) return;

tabs.querySelectorAll('.tab-btn').forEach(b => {

if (b.dataset.group) return;

const m = (b.getAttribute('onclick') || '').match(/switchTab\('(\w+)'/);

b.dataset.group = (m && TAB_GROUP[m[1]]) || 'home';

});

const bar = document.createElement('div');

bar.className = 'grp-bar';

bar.innerHTML = GROUPS.map(g => `<div class="grp-chip" data-g="${g.id}" role="button" tabindex="0"><span class="ic">${g.ic}</span>${g.name}</div>`).join('');

tabs.parentNode.insertBefore(bar, tabs);

let current = 'home';

function refresh() {

bar.querySelectorAll('.grp-chip').forEach(c => {

const btns = [...tabs.querySelectorAll('.tab-btn')].filter(b => b.dataset.group === c.dataset.g);

const allOff = btns.length === 0 || btns.every(b => b.style.display === 'none');

c.classList.toggle('grp-off', allOff);

c.classList.toggle('active', c.dataset.g === current);

});

tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('grp-hidden', b.dataset.group !== current));

}

// زر المساعدة العائم يفتح قسم المجموعة الحالية في مركز المساعدة

const fab = document.createElement('a');

fab.className = 'help-fab'; fab.title = 'مركز المساعدة'; fab.setAttribute('aria-label', 'مركز المساعدة'); fab.textContent = '؟';

document.body.appendChild(fab);

function showGroup(g) {

current = g;

refresh();

fab.href = 'servant_help.html?g=' + g;

try {

if (typeof sessionStorage !== 'undefined') {

const uk = (window.AuthClient && typeof AuthClient.getUser === 'function' && AuthClient.getUser()?.id) || 

(typeof currentUser !== 'undefined' && currentUser && currentUser.id) || 'guest';

sessionStorage.setItem('khedmety_group_' + uk, g);

}

} catch (e) {}

}

bar.addEventListener('click', e => { const c = e.target.closest('.grp-chip'); if (c) showGroup(c.dataset.g); });

bar.addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.grp-chip'); if (c) showGroup(c.dataset.g); } });

// عند فتح أي تبويب برمجياً، تتبعه المجموعة المناسبة

const origSwitch = window.switchTab;

if (typeof origSwitch === 'function') {

window.switchTab = function (id) {

const r = origSwitch.apply(this, arguments);

if (TAB_GROUP[id]) showGroup(TAB_GROUP[id]);

return r;

};

}

// الصلاحيات تُطبَّق لاحقاً بـ style.display، فنعيد حساب المجموعات الظاهرة

new MutationObserver(refresh).observe(tabs, { attributes: true, attributeFilter: ['style'], subtree: true });

// ==========================================

// تخصيص وتبويب الأزرار ديناميكياً لكل الصلاحيات

// ==========================================

if (typeof currentPermission !== 'undefined') {

document.querySelectorAll('.tab-btn').forEach(btn => {

let text = (btn.innerText || btn.textContent || '').trim();

// 1. صلاحية "تسجيل حضور فقط" أو "مسح بالكاميرا فقط" (لا يظهر لهم سوى تبويب تسجيل الحضور)

if (currentPermission === 'attend_only' || currentPermission === 'scanner_only') {

if (!text.includes('تسجيل الحضور')) {

btn.style.display = 'none';

}

} 

// 2. صلاحية "مشاهدة فقط" (يظهر لهم التقارير، السجل، والرئيسية فقط بدون أزرار تعديل أو حذف)

else if (currentPermission === 'view_only') {

if (!text.includes('الرئيسية') && !text.includes('التقارير') && !text.includes('سجل الخدام')) {

btn.style.display = 'none';

}

} 

// 3. الخادم المتكامل (يظهر له الحضور، المخدومين، النوتة، والتقارير، وتخفى عنه الإعدادات والأدمن الصارم)

else if (currentPermission === 'full') {

if (text.includes('الإعدادات') || text.includes('سجل العمليات') || text.includes('إدارة الخدام') || text.includes('ترحيل')) {

btn.style.display = 'none';

}

}

// ملاحظة: الأدمن (admin) والمطور (developer) تظهر لهم كل الأزرار دون استثناء.

});

// التوجيه التلقائي المناسب حسب الصلاحية عند فتح التطبيق

setTimeout(() => {

if (typeof switchTab === 'function') {

if (currentPermission === 'attend_only' || currentPermission === 'scanner_only') {

switchTab('attendanceTab', document.querySelector('.tab-btn:not([style*="display: none"])'));

}

}

}, 200);

}

const urlParams = new URLSearchParams(location.search);

let wantTab = urlParams.get('tab');

let wantGroup = urlParams.get('group');

if (!wantGroup && wantTab && TAB_GROUP[wantTab]) wantGroup = TAB_GROUP[wantTab];

const userKey = (window.AuthClient && typeof AuthClient.getUser === 'function' && AuthClient.getUser()?.id) || 

(typeof currentUser !== 'undefined' && currentUser && currentUser.id) || 'guest';

if (!wantGroup && typeof sessionStorage !== 'undefined') {

wantGroup = sessionStorage.getItem('khedmety_group_' + userKey);

}

const initialGroup = (wantGroup && GROUPS.some(g => g.id === wantGroup)) ? wantGroup : 'home';

showGroup(initialGroup);

// استعادة التبويب النشط بذكاء وسياق آمن

const VALID_TABS = [

'dashTab', 'planTab', 'coursesTab', 'materialsTab',

'attendanceTab', 'servantsAttendanceTab', 'membersTab',

'broadcastTab', 'servantsTab', 'rolloverTab', 'auditTab',

'settingsTab', 'dataTab', 'followupTab', 'reflectionsTab'

];

if (!wantTab) {

const savedTab = sessionStorage.getItem('khedmety_tab_' + userKey);

// لا نسترجع تبويب الجلسة القديمة إذا كان يتعارض مع المجموعة المحددة صراحة في الرابط (مثل group=spirit)

if (savedTab && (!urlParams.get('group') || TAB_GROUP[savedTab] === urlParams.get('group'))) {

wantTab = savedTab;

}

}

if (wantTab && (!VALID_TABS.includes(wantTab) || !document.getElementById(wantTab))) {

wantTab = 'dashTab'; // ردع التبويبات غير الصحيحة

}

if (typeof currentPermission !== 'undefined' && (currentPermission === 'attend_only' || currentPermission === 'scanner_only')) {

wantTab = 'attendanceTab';

}

// إذا كانت المجموعة المطلوبة هي "الروحيات" (spirit)، نضمن بقاءه في مجموعة الروحيات ونمنع القفز لتبويب خارجها

if (initialGroup === 'spirit' || urlParams.get('group') === 'spirit') {

showGroup('spirit');

wantTab = null;

}

if (wantTab && wantTab !== 'dashTab') {

setTimeout(() => {

const b = [...tabs.querySelectorAll('.tab-btn')].find(x => (x.getAttribute('onclick') || '').includes("'" + wantTab + "'"));

if (b && b.style.display !== 'none') {

b.click();

} else if (typeof switchTab === 'function') {

switchTab(wantTab);

}

}, 150);

}

})();