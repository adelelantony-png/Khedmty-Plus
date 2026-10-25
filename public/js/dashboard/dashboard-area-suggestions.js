/* اقتراح المناطق الموجودة عند الكتابة في حقل المنطقة (يمنع اختلاف الإملاء) */

(function () {

function fill() {

const dl = document.getElementById('areaList');

if (!dl || typeof members === 'undefined') return;

const set = new Set((members || []).map(m => String(m.area || '').trim()).filter(Boolean));

dl.innerHTML = [...set].sort((a, b) => a.localeCompare(b, 'ar')).map(a => `<option value="${a.replace(/"/g, '&quot;')}">`).join('');

}

['m_area', 'edit_m_area'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('focus', fill); });

})();