// scripts/apply_declutter.js
// Surgical implementation of UI declutter & reorganization for KHIDMETY PRO servant-dashboard.html

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'public', 'servant-dashboard.html');
const navPath = path.join(rootDir, 'public', 'js', 'dashboard', 'dashboard-navigation.js');

console.log('--- Step 1: Updating dashboard-navigation.js ---');
let navContent = fs.readFileSync(navPath, 'utf8');

if (!navContent.includes('radarTab:')) {
    navContent = navContent.replace(
        "smartPrepTab: 'home',",
        "smartPrepTab: 'home', radarTab: 'home',"
    );
    navContent = navContent.replace(
        "followupTab: 'people',",
        "followupTab: 'people', feedbackTab: 'people',"
    );
    navContent = navContent.replace(
        "dataTab: 'admin',",
        "dataTab: 'admin', cloudUsageTab: 'admin',"
    );
    navContent = navContent.replace(
        "'followupTab', 'reflectionsTab'",
        "'followupTab', 'reflectionsTab', 'radarTab', 'feedbackTab', 'cloudUsageTab', 'smartPrepTab'"
    );
    fs.writeFileSync(navPath, navContent, 'utf8');
    console.log('✅ dashboard-navigation.js updated with all tab mappings.');
} else {
    console.log('ℹ️ dashboard-navigation.js already mapped.');
}

console.log('--- Step 2: Reading servant-dashboard.html ---');
let html = fs.readFileSync(htmlPath, 'utf8');
console.log('HTML size before:', html.length, 'bytes');

// 2.1 Add Declutter & Zen Mode CSS styles before </style>
const cssToInsert = `
        /* ========================================================================= */
        /* KHIDMETY PRO — DECLUTTER & ZEN MODE STYLES                                */
        /* ========================================================================= */
        .btn-zen-mode {
            border: 1.5px solid #10b981;
            background: #ecfdf5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin: 0 6px;
        }
        .btn-zen-mode:hover {
            background: #d1fae5;
            transform: translateY(-1px);
        }
        body.zen-mode-active .btn-zen-mode {
            background: #059669;
            color: #ffffff;
            border-color: #047857;
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);
        }
        body.zen-mode-active .zen-hide {
            display: none !important;
        }

        /* Settings Sub-Tab Pills */
        .settings-pill-bar {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            background: #f1f5f9;
            padding: 8px;
            border-radius: 12px;
            margin: 14px 0 20px 0;
            border: 1px solid #e2e8f0;
        }
        .settings-pill-btn {
            border: none;
            background: transparent;
            color: #475569;
            padding: 9px 16px;
            border-radius: 8px;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .settings-pill-btn:hover {
            background: #e2e8f0;
            color: #1e293b;
        }
        .settings-pill-btn.active {
            background: #ffffff;
            color: #1e3a8a;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            font-weight: 800;
        }
        .settings-section-panel {
            animation: fadeInSettingsSection 0.2s ease-in-out;
        }
        @keyframes fadeInSettingsSection {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Collapsible radar headers */
        .collapsible-radar-header {
            cursor: pointer;
            user-select: none;
            transition: background 0.15s ease;
            border-radius: 12px;
            padding: 4px 6px;
        }
        .collapsible-radar-header:hover {
            background: rgba(0, 0, 0, 0.02);
        }
        .toggle-chevron {
            transition: transform 0.25s ease;
            display: inline-block;
            font-size: 0.85rem;
            margin-right: 8px;
            color: #64748b;
        }
`;

if (!html.includes('btn-zen-mode')) {
    html = html.replace('    </style>', cssToInsert + '\n    </style>');
    console.log('✅ CSS injected into servant-dashboard.html');
}

// 2.2 Add Zen toggle button in header & mark emergency buttons as zen-hide
if (!html.includes('id="btnZenToggle"')) {
    const headerTarget = '(<span id="currentRoleBadge" class="role-badge">خادم</span>)\r\n\r\n<a href="#" onclick="logout()"';
    const headerReplacement = '(<span id="currentRoleBadge" class="role-badge">خادم</span>)\r\n\r\n<button type="button" id="btnZenToggle" class="btn-zen-mode" onclick="toggleZenMode()" title="تبديل الوضع الهادئ لتنظيم اللوحة وإخفاء الأزرار التقنية">\r\n<span id="zenIcon">🌿</span> <span id="zenText">الوضع الهادئ</span>\r\n</button>\r\n\r\n<a href="#" onclick="logout()"';
    
    if (html.includes(headerTarget)) {
        html = html.replace(headerTarget, headerReplacement);
        console.log('✅ Header Zen Mode button added (CRLF match).');
    } else {
        const lfTarget = '(<span id="currentRoleBadge" class="role-badge">خادم</span>)\n\n<a href="#" onclick="logout()"';
        const lfReplacement = '(<span id="currentRoleBadge" class="role-badge">خادم</span>)\n\n<button type="button" id="btnZenToggle" class="btn-zen-mode" onclick="toggleZenMode()" title="تبديل الوضع الهادئ لتنظيم اللوحة وإخفاء الأزرار التقنية">\n<span id="zenIcon">🌿</span> <span id="zenText">الوضع الهادئ</span>\n</button>\n\n<a href="#" onclick="logout()"';
        html = html.replace(lfTarget, lfReplacement);
        console.log('✅ Header Zen Mode button added (LF match).');
    }
}

// Mark emergency buttons with zen-hide
const emergTarget = '<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">\r\n\r\n<button class="btn-mini btn-success" onclick="exportTodaySessionToWhatsApp()"';
const emergReplacement = '<div class="zen-hide" style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">\r\n\r\n<button class="btn-mini btn-success" onclick="exportTodaySessionToWhatsApp()"';

if (html.includes(emergTarget)) {
    html = html.replace(emergTarget, emergReplacement);
    console.log('✅ Emergency buttons wrapped with zen-hide (CRLF).');
} else {
    const emergLfTarget = '<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">\n\n<button class="btn-mini btn-success" onclick="exportTodaySessionToWhatsApp()"';
    const emergLfReplacement = '<div class="zen-hide" style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">\n\n<button class="btn-mini btn-success" onclick="exportTodaySessionToWhatsApp()"';
    html = html.replace(emergLfTarget, emergLfReplacement);
    console.log('✅ Emergency buttons wrapped with zen-hide (LF).');
}

// 2.3 Make Members Tab Add Form Collapsible
if (!html.includes('id="addMemberFormContainer"')) {
    const memTarget = '<div class="can-edit">\r\n\r\n<h2>إضافة دارس جديد</h2>\r\n\r\n<form id="addForm">';
    const memReplacement = `<div class="can-edit" style="margin-bottom:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; cursor:pointer;" onclick="toggleAddMemberForm()">
    <h3 style="margin:0; border:none; font-size:1rem; color:var(--primary); display:flex; align-items:center; gap:8px;">
        <span>➕</span> إضافة دارس جديد
    </h3>
    <button type="button" id="btnAddMemberToggle" class="btn-mini" style="background:#2563eb; color:#fff; border:none; padding:4px 12px; border-radius:6px; font-weight:bold;">إظهار النموذج ⬇️</button>
</div>
<div id="addMemberFormContainer" style="display:none; margin-top:10px; border:1.5px solid #e2e8f0; border-radius:12px; padding:15px; background:#ffffff;">
<form id="addForm">`;

    if (html.includes(memTarget)) {
        // also need to close the container after </form>
        html = html.replace(memTarget, memReplacement);
        html = html.replace('</form>\r\n\r\n</div>\r\n\r\n<div style="background:#eaf2f8;', '</form>\r\n</div>\r\n</div>\r\n\r\n<div style="background:#eaf2f8;');
        console.log('✅ Members tab form made collapsible (CRLF).');
    } else {
        const memLfTarget = '<div class="can-edit">\n\n<h2>إضافة دارس جديد</h2>\n\n<form id="addForm">';
        const memLfReplacement = memReplacement.replace(/\r\n/g, '\n');
        html = html.replace(memLfTarget, memLfReplacement);
        html = html.replace('</form>\n\n</div>\n\n<div style="background:#eaf2f8;', '</form>\n</div>\n</div>\n\n<div style="background:#eaf2f8;');
        console.log('✅ Members tab form made collapsible (LF).');
    }
}

// 2.4 Make Servants Tab Add Form Collapsible
if (!html.includes('id="addServantFormContainer"')) {
    const servTarget = '<div class="form-grid">\r\n\r\n<div class="form-group"><input type="text" id="newServantCode"';
    const servReplacement = `<div class="admin-only" style="margin-bottom:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px 14px; cursor:pointer;" onclick="toggleAddServantForm()">
    <h3 style="margin:0; border:none; font-size:1rem; color:var(--primary); display:flex; align-items:center; gap:8px;">
        <span>➕</span> إضافة خادم جديد
    </h3>
    <button type="button" id="btnAddServantToggle" class="btn-mini" style="background:#059669; color:#fff; border:none; padding:4px 12px; border-radius:6px; font-weight:bold;">إظهار النموذج ⬇️</button>
</div>
<div id="addServantFormContainer" style="display:none; margin-top:10px; border:1.5px solid #e2e8f0; border-radius:12px; padding:15px; background:#ffffff;">
<div class="form-grid">
<div class="form-group"><input type="text" id="newServantCode"`;

    if (html.includes(servTarget)) {
        html = html.replace(servTarget, servReplacement);
        html = html.replace('<button class="btn-success" onclick="addServantManual()">حفظ الخادم</button>', '<button class="btn-success" onclick="addServantManual()">حفظ الخادم</button>\r\n</div>\r\n</div>');
        console.log('✅ Servants tab form made collapsible (CRLF).');
    } else {
        const servLfTarget = '<div class="form-grid">\n\n<div class="form-group"><input type="text" id="newServantCode"';
        const servLfReplacement = servReplacement.replace(/\r\n/g, '\n');
        html = html.replace(servLfTarget, servLfReplacement);
        html = html.replace('<button class="btn-success" onclick="addServantManual()">حفظ الخادم</button>', '<button class="btn-success" onclick="addServantManual()">حفظ الخادم</button>\n</div>\n</div>');
        console.log('✅ Servants tab form made collapsible (LF).');
    }
}

// 2.5 Organize settingsTab into Sub-Pills
if (!html.includes('id="setSection_general"')) {
    // Add pill bar at the top of settingsTab
    const pillBarHtml = `
<div class="settings-pill-bar">
    <button type="button" class="settings-pill-btn active" id="pill_general" onclick="switchSettingsSection('general', this)">
        <span>⚙️</span> إعدادات الخدمة والمواعيد
    </button>
    <button type="button" class="settings-pill-btn" id="pill_incentives" onclick="switchSettingsSection('incentives', this)">
        <span>🎁</span> محرك التحفيز والبونص
    </button>
    <button type="button" class="settings-pill-btn" id="pill_reset" onclick="switchSettingsSection('reset', this)">
        <span>🧹</span> تهيئة السنة والوضع التجريبي
    </button>
    <button type="button" class="settings-pill-btn" id="pill_cloud" onclick="switchSettingsSection('cloud', this)">
        <span>☁️</span> سحابة Firebase والأجهزة
    </button>
</div>
<div id="setSection_general" class="settings-section-panel">
`;

    // 1. Insert Pill bar and start setSection_general
    const setHeaderTarget = '<div id="settingsTab" class="tab-content">\r\n\r\n<h2>إعدادات المنظومة وتخصيص الخدمة</h2>';
    const setHeaderReplacement = '<div id="settingsTab" class="tab-content">\r\n\r\n<h2>إعدادات المنظومة وتخصيص الخدمة</h2>' + pillBarHtml;

    if (html.includes(setHeaderTarget)) {
        html = html.replace(setHeaderTarget, setHeaderReplacement);
    } else {
        const lfSetTarget = '<div id="settingsTab" class="tab-content">\n\n<h2>إعدادات المنظومة وتخصيص الخدمة</h2>';
        html = html.replace(lfSetTarget, '<div id="settingsTab" class="tab-content">\n\n<h2>إعدادات المنظومة وتخصيص الخدمة</h2>' + pillBarHtml.replace(/\r\n/g, '\n'));
    }

    // Close setSection_general before clean slate, and wrap clean slate in setSection_reset
    const cleanSlateStart = '<!-- قسم إدارة البيانات وأمان التهيئة السنوية والوضع التجريبي -->';
    const cleanSlateReplacement = `</div><!-- /setSection_general (part 1) -->\n\n<div id="setSection_reset" class="settings-section-panel" style="display:none;">\n${cleanSlateStart}`;
    html = html.replace(cleanSlateStart, cleanSlateReplacement);

    // Close setSection_reset and start setSection_incentives
    const incentivesStart = '<!-- ======================================================== -->\r\n            <!-- لوحة محركات التحفيز الذكية (Dynamic Incentive Engine)';
    const incentivesReplacement = `</div><!-- /setSection_reset -->\n\n<div id="setSection_incentives" class="settings-section-panel" style="display:none;">\n${incentivesStart}`;
    if (html.includes(incentivesStart)) {
        html = html.replace(incentivesStart, incentivesReplacement);
    } else {
        const lfIncStart = '<!-- ======================================================== -->\n            <!-- لوحة محركات التحفيز الذكية (Dynamic Incentive Engine)';
        html = html.replace(lfIncStart, `</div><!-- /setSection_reset -->\n\n<div id="setSection_incentives" class="settings-section-panel" style="display:none;">\n${lfIncStart}`);
    }

    // Close setSection_incentives and start setSection_cloud
    const cloudStart = '<div class="admin-only" style="background:#e8f4fd; border:2px solid #74b9ff; padding:15px; border-radius:10px; margin:15px 0;">';
    const cloudReplacement = `</div><!-- /setSection_incentives -->\n\n<div id="setSection_cloud" class="settings-section-panel" style="display:none;">\n${cloudStart}`;
    html = html.replace(cloudStart, cloudReplacement);

    // Close setSection_cloud and reopen setSection_general for meeting times, firebase keys and save button
    const meetingTimesStart = '<h3>مواعيد الاجتماع الأساسي (يوم الجمعة) ونظام الصيف</h3>';
    const meetingTimesReplacement = `</div><!-- /setSection_cloud -->\n\n<div id="setSection_general_times" class="settings-section-panel">\n${meetingTimesStart}`;
    html = html.replace(meetingTimesStart, meetingTimesReplacement);

    // Close setSection_general_times before closing settingsTab
    const settingsEnd = '<button class="btn-success" onclick="saveGeneralSettings()" style="margin-top:6px;">حفظ جميع الإعدادات 💾</button>\r\n\r\n</div>\r\n\r\n<!-- 11. التقارير والنسخ الاحتياطي -->';
    const settingsEndReplacement = '<button class="btn-success" onclick="saveGeneralSettings()" style="margin-top:6px;">حفظ جميع الإعدادات 💾</button>\r\n</div><!-- /setSection_general_times -->\r\n\r\n</div>\r\n\r\n<!-- 11. التقارير والنسخ الاحتياطي -->';
    if (html.includes(settingsEnd)) {
        html = html.replace(settingsEnd, settingsEndReplacement);
    } else {
        const lfSettingsEnd = '<button class="btn-success" onclick="saveGeneralSettings()" style="margin-top:6px;">حفظ جميع الإعدادات 💾</button>\n\n</div>\n\n<!-- 11. التقارير والنسخ الاحتياطي -->';
        const lfSettingsEndReplacement = '<button class="btn-success" onclick="saveGeneralSettings()" style="margin-top:6px;">حفظ جميع الإعدادات 💾</button>\n</div><!-- /setSection_general_times -->\n\n</div>\n\n<!-- 11. التقارير والنسخ الاحتياطي -->';
        html = html.replace(lfSettingsEnd, lfSettingsEndReplacement);
    }

    console.log('✅ Settings tab organized into Sub-Pills & panels.');
}

// 2.6 Make Radar Sections Collapsible with Chevrons
// Absence Radar Box
if (!html.includes('id="radar_absenceBody"')) {
    const absHeaderSearch = '<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> رادار الغياب والافتقاد الفوري (غياب أسبوعين متتاليين فأكثر)';
    const absHeaderReplace = '<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> رادار الغياب والافتقاد الفوري (غياب أسبوعين متتاليين فأكثر) <span id="radar_absenceChevron" class="toggle-chevron">▼</span>';
    html = html.replace(absHeaderSearch, absHeaderReplace);

    const absBoxSearch = '<div class="radar-section-box">\r\n                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">';
    const absBoxReplace = '<div class="radar-section-box">\r\n                <div class="collapsible-radar-header" onclick="toggleRadarCard(\'radar_absenceBody\', \'radar_absenceChevron\')" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">';
    
    if (html.includes(absBoxSearch)) {
        html = html.replace(absBoxSearch, absBoxReplace);
        html = html.replace('<!-- شريط تصفية حالات الغياب وإجراءات الزيارة -->', '<div id="radar_absenceBody">\r\n                <!-- شريط تصفية حالات الغياب وإجراءات الزيارة -->');
        html = html.replace('</table>\r\n                </div>\r\n            </div>\r\n\r\n            <!-- بطاقة رادار الاعتذارات اللحظية', '</table>\r\n                </div>\r\n                </div><!-- /radar_absenceBody -->\r\n            </div>\r\n\r\n            <!-- بطاقة رادار الاعتذارات اللحظية');
        console.log('✅ Absence radar made collapsible (CRLF).');
    } else {
        const lfAbsSearch = '<div class="radar-section-box">\n                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">';
        const lfAbsReplace = '<div class="radar-section-box">\n                <div class="collapsible-radar-header" onclick="toggleRadarCard(\'radar_absenceBody\', \'radar_absenceChevron\')" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">';
        html = html.replace(lfAbsSearch, lfAbsReplace);
        html = html.replace('<!-- شريط تصفية حالات الغياب وإجراءات الزيارة -->', '<div id="radar_absenceBody">\n                <!-- شريط تصفية حالات الغياب وإجراءات الزيارة -->');
        html = html.replace('</table>\n                </div>\n            </div>\n\n            <!-- بطاقة رادار الاعتذارات اللحظية', '</table>\n                </div>\n                </div><!-- /radar_absenceBody -->\n            </div>\n\n            <!-- بطاقة رادار الاعتذارات اللحظية');
        console.log('✅ Absence radar made collapsible (LF).');
    }
}

// 2.7 Inject JavaScript Helper Functions before </script>
if (!html.includes('function toggleZenMode()')) {
    const jsHelpers = `
// =========================================================================
// KHIDMETY PRO — UI DECLUTTER & ZEN MODE HELPER FUNCTIONS
// =========================================================================
function toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-mode-active');
    const zenText = document.getElementById('zenText');
    const zenIcon = document.getElementById('zenIcon');
    if (zenText && zenIcon) {
        if (isZen) {
            zenIcon.textContent = '🌿';
            zenText.textContent = 'الوضع الهادئ: مفعّل';
        } else {
            zenIcon.textContent = '🌿';
            zenText.textContent = 'الوضع الهادئ';
        }
    }
    try {
        localStorage.setItem('khedmty_zen_mode', isZen ? 'on' : 'off');
    } catch(e) {}
}
window.toggleZenMode = toggleZenMode;

function switchSettingsSection(secKey, btnElement) {
    document.querySelectorAll('.settings-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const pBtn = document.getElementById('pill_' + secKey);
        if (pBtn) pBtn.classList.add('active');
    }
    
    // Hide all settings panels
    const p1 = document.getElementById('setSection_general');
    const pTimes = document.getElementById('setSection_general_times');
    const pInc = document.getElementById('setSection_incentives');
    const pReset = document.getElementById('setSection_reset');
    const pCloud = document.getElementById('setSection_cloud');

    if (p1) p1.style.display = 'none';
    if (pTimes) pTimes.style.display = 'none';
    if (pInc) pInc.style.display = 'none';
    if (pReset) pReset.style.display = 'none';
    if (pCloud) pCloud.style.display = 'none';

    if (secKey === 'general') {
        if (p1) p1.style.display = 'block';
        if (pTimes) pTimes.style.display = 'block';
    } else if (secKey === 'incentives') {
        if (pInc) pInc.style.display = 'block';
    } else if (secKey === 'reset') {
        if (pReset) pReset.style.display = 'block';
    } else if (secKey === 'cloud') {
        if (pCloud) pCloud.style.display = 'block';
    }
}
window.switchSettingsSection = switchSettingsSection;

function toggleRadarCard(bodyId, chevronId) {
    const b = document.getElementById(bodyId);
    const c = document.getElementById(chevronId);
    if (!b) return;
    if (b.style.display === 'none') {
        b.style.display = 'block';
        if (c) c.style.transform = 'rotate(0deg)';
    } else {
        b.style.display = 'none';
        if (c) c.style.transform = 'rotate(180deg)';
    }
}
window.toggleRadarCard = toggleRadarCard;

function toggleAddMemberForm() {
    const box = document.getElementById('addMemberFormContainer');
    const btn = document.getElementById('btnAddMemberToggle');
    if (!box) return;
    if (box.style.display === 'none' || !box.style.display) {
        box.style.display = 'block';
        if (btn) btn.textContent = 'إخفاء النموذج ⬆️';
    } else {
        box.style.display = 'none';
        if (btn) btn.textContent = 'إظهار النموذج ⬇️';
    }
}
window.toggleAddMemberForm = toggleAddMemberForm;

function toggleAddServantForm() {
    const box = document.getElementById('addServantFormContainer');
    const btn = document.getElementById('btnAddServantToggle');
    if (!box) return;
    if (box.style.display === 'none' || !box.style.display) {
        box.style.display = 'block';
        if (btn) btn.textContent = 'إخفاء النموذج ⬆️';
    } else {
        box.style.display = 'none';
        if (btn) btn.textContent = 'إظهار النموذج ⬇️';
    }
}
window.toggleAddServantForm = toggleAddServantForm;

// Restore Zen mode on startup if enabled
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (localStorage.getItem('khedmty_zen_mode') === 'on') {
            document.body.classList.add('zen-mode-active');
            const zenText = document.getElementById('zenText');
            if (zenText) zenText.textContent = 'الوضع الهادئ: مفعّل';
        }
    } catch(e) {}
});
`;

    const scriptEnd = '// Close presentation on Esc key\r\nwindow.addEventListener(\'keydown\', (e) => {\r\n    if (e.key === \'Escape\') closePresentationMode();\r\n});\r\n</script>';
    const scriptEndReplacement = '// Close presentation on Esc key\r\nwindow.addEventListener(\'keydown\', (e) => {\r\n    if (e.key === \'Escape\') closePresentationMode();\r\n});\r\n' + jsHelpers + '\r\n</script>';

    if (html.includes(scriptEnd)) {
        html = html.replace(scriptEnd, scriptEndReplacement);
        console.log('✅ JavaScript helpers injected (CRLF).');
    } else {
        const lfScriptEnd = '// Close presentation on Esc key\nwindow.addEventListener(\'keydown\', (e) => {\n    if (e.key === \'Escape\') closePresentationMode();\n});\n</script>';
        const lfScriptEndReplacement = '// Close presentation on Esc key\nwindow.addEventListener(\'keydown\', (e) => {\n    if (e.key === \'Escape\') closePresentationMode();\n});\n' + jsHelpers.replace(/\r\n/g, '\n') + '\n</script>';
        html = html.replace(lfScriptEnd, lfScriptEndReplacement);
        console.log('✅ JavaScript helpers injected (LF).');
    }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('--- Step 3: servant-dashboard.html saved ---');
console.log('HTML size after:', html.length, 'bytes');
console.log('🎉 Declutter implementation complete!');
