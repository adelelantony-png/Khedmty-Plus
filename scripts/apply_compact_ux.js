// scripts/apply_compact_ux.js
// Compact layout & priority reorganization for KHIDMETY PRO servant-dashboard.html

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'public', 'servant-dashboard.html');

console.log('--- Step 1: Reading clean servant-dashboard.html ---');
let html = fs.readFileSync(htmlPath, 'utf8');
const isCrlf = html.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';
console.log('Source size:', html.length, 'bytes. Line ending:', isCrlf ? 'CRLF' : 'LF');

// =========================================================================
// 1. REORGANIZE dashTab (Lift Stats to the top, compact banners & absence list)
// =========================================================================
console.log('--- Step 2: Reorganizing dashTab layout ---');

const newDashTabContent = `
<div id="dashTab" class="tab-content active">

<!-- 1. Live Core Ministry Statistics (Above the fold - First thing seen) -->
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
    <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:var(--primary); display:flex; align-items:center; gap:8px;">
        <span>📊</span> لوحة المتابعة ونبض الخدمة اليوم
    </h3>
    <span style="font-size:0.8rem; color:#64748b; font-weight:bold;">محدث لحظياً مع قاعدة البيانات السحابية ☁️</span>
</div>

<!-- 👥 إحصائيات المخدومين والدارسين -->
<div class="stat-grid" style="margin-bottom:10px;">
    <div class="stat-card"><div>إجمالي المخدومين</div><div class="num" id="statTotalMembers">0</div></div>
    <div class="stat-card"><div>حضور المخدومين اليوم</div><div class="num" id="statTodayMembersCount">0</div></div>
    <div class="stat-card"><div>نسبة حضور المخدومين</div><div class="num" id="statMembersPercent">0%</div></div>
    <div class="stat-card"><div>المتناولون اليوم 🕊️</div><div class="num" id="statTodayCommunion" style="color:var(--success);">0</div></div>
    <div class="stat-card"><div>المؤهلون للتخرج (≥75%)</div><div class="num" id="statQualifiedGraduates" style="color:var(--purple);">0</div></div>
</div>

<!-- 👔 إحصائيات الخدام والمحاضرين -->
<div class="stat-grid" style="margin-bottom:14px;">
    <div class="stat-card"><div>إجمالي الخدام</div><div class="num" id="statTotalServantsDash">0</div></div>
    <div class="stat-card"><div>حضور الخدام اليوم</div><div class="num" id="statTodayServantsCount" style="color:var(--success);">0</div></div>
    <div class="stat-card"><div>نسبة حضور الخدام</div><div class="num" id="statServantsPercent" style="color:var(--success);">0%</div></div>
</div>

<!-- 2. Compact Smart Prep Ribbon (Single sleek row) -->
<div style="background: linear-gradient(135deg, #123d58 0%, #197d80 100%); color: #fff; padding: 10px 16px; border-radius: 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 8px rgba(18,61,88,0.12); border: 1px solid rgba(213,169,71,0.4);">
    <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.3rem;">✍️🕊️</span>
        <div>
            <strong style="font-size:0.95rem; color:#fff;">مساعد تحضير الخدمة الذكي (Smart Prep)</strong>
            <span style="font-size:0.8rem; color:#e0f2fe; margin-right:8px;">تفاسير الآباء الأرثوذكس، ألعاب تفاعلية، وقوالب إلقاء</span>
        </div>
    </div>
    <button type="button" class="btn" onclick="switchTab('smartPrepTab')" style="background:#d5a947; color:#0b2230; font-weight:800; border:none; padding:7px 16px; border-radius:8px; cursor:pointer; font-size:0.85rem;">
        <i class="fa-solid fa-wand-magic-sparkles me-1"></i> فتح محضر الخدمة 🎙️
    </button>
</div>

<!-- 3. Reminders & Upcoming Events Grid (Compact 2-columns) -->
<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin-bottom: 14px;">
    <div id="myNextEventBanner" style="display:none; background:#e8f4fd; border:1px solid #74b9ff; color:#0984e3; padding:10px 14px; border-radius:8px;">
        <h4 style="margin:0 0 4px 0; font-size:0.85rem;">🔔 تذكير بتكليفك القادم هذا الأسبوع:</h4>
        <div id="myNextEventDetails" style="font-size:13px; font-weight:bold;"></div>
    </div>

    <div style="background:#f1f2f6; border:1px solid #dfe6e9; padding:10px 14px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:5px;">
            <h4 style="margin:0; color:var(--primary); font-size:0.85rem;">📅 محطات قادمة في خطة السنة:</h4>
            <button class="btn-mini btn-primary" onclick="switchTab('planTab', document.querySelectorAll('.tab-btn')[1])" style="padding:2px 8px; font-size:0.75rem;">عرض الأجندة</button>
        </div>
        <div id="upcomingPlanEventsList" style="font-size:12.5px;">جاري فحص الخطة السنوية...</div>
    </div>

    <div style="background:#fff9e6; border:1px solid #ffeaa7; padding:10px 14px; border-radius:8px;">
        <h4 style="margin:0 0 4px 0; color:#d35400; font-size:0.85rem;">🎂 مناسبات وأعياد ميلاد هذا الأسبوع:</h4>
        <div id="birthdayAlertList" style="font-size:12.5px;">جاري فحص التواريخ...</div>
    </div>
</div>

<!-- 4. Heatmap & Compact Absence Alert Card -->
<div style="background:#fff; border:1px solid #dfe6e9; border-radius:12px; padding:14px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:5px;">
        <h4 style="margin:0; color:var(--primary); font-size:14px;">🔥 الخريطة الحرارية ومؤشر خطر الانقطاع (آخر 4 لقاءات جمعة)</h4>
        <span id="attritionCountBadge" class="role-badge" style="background:var(--danger); font-size:11px;">0 معرض للتسرب</span>
    </div>
    <p style="font-size:11px; color:#636e72; margin:0 0 8px 0;">رصد استباقي لمن بدأ التزامه يتراجع في لقاءات الجمعة للتدخل بالافتقاد قبل الانقطاع.</p>
    <div id="heatmapContainer" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:10px; margin-top:8px;"></div>
</div>

<!-- 5. Compact Absence Radar Box (Max height + Scrollable) -->
<div style="background:#fff; border:1px solid #fed7aa; border-radius:12px; padding:14px; margin-bottom:14px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h4 style="margin:0; color:#9a3412; font-size:0.95rem; display:flex; align-items:center; gap:6px;">
            <span>⚠️</span> رادار المنقطعين (غياب لقائي جمعة متتاليين)
        </h4>
        <button type="button" class="btn-mini btn-primary" onclick="switchTab('radarTab')" style="background:#ea580c; border:none; padding:3px 10px; font-size:0.78rem;">
            فتح الرادار الشامل 📡
        </button>
    </div>
    <div id="absentAlertList" style="background:#fffbeb; padding:10px 14px; border-radius:8px; color:#856404; font-size:13px; max-height:160px; overflow-y:auto; border:1px solid #fde68a; line-height:1.7;">
        جاري الفحص...
    </div>
</div>

</div>
`.trim();

const dashTabStart = '<div id="dashTab" class="tab-content active">';
const dashTabEnd = '<!-- 2. خطة السنة -->';

const startIndex = html.indexOf(dashTabStart);
const endIndex = html.indexOf(dashTabEnd);

if (startIndex !== -1 && endIndex !== -1) {
    html = html.substring(0, startIndex) + newDashTabContent + nl + nl + html.substring(endIndex);
    console.log('✅ dashTab content prioritized and compacted successfully.');
} else {
    console.error('❌ Could not locate dashTab start/end boundaries!');
    process.exit(1);
}

// =========================================================================
// 2. REORGANIZE radarTab (Add Segmented Pill Switcher & Section Panels)
// =========================================================================
console.log('--- Step 3: Adding Segmented Switcher to radarTab ---');

const radarPillBar = `
            <!-- أزرار التصفح السريع للرادار (Radar Segmented Pills) -->
            <div class="radar-pill-bar" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; background:#f1f5f9; padding:6px; border-radius:12px; border:1px solid #cbd5e1;">
                <button type="button" class="radar-pill-btn active" id="radarPill_absence" onclick="switchRadarSection('absence', this)">
                    <span>⚠️</span> الغياب والافتقاد الفوري
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_excuses" onclick="switchRadarSection('excuses', this)">
                    <span>🔔</span> الاعتذارات الواردة
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_pulse" onclick="switchRadarSection('pulse', this)">
                    <span>📈</span> نبض الحضور والنمو
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_confession" onclick="switchRadarSection('confession', this)">
                    <span>🕊️</span> مهلة سر الاعتراف
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_birthdays" onclick="switchRadarSection('birthdays', this)">
                    <span>🎂</span> أعياد الميلاد
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_security" onclick="switchRadarSection('security', this)">
                    <span>🛡️</span> الأمان وتصفير الباسورد
                </button>
                <button type="button" class="radar-pill-btn" id="radarPill_all" onclick="switchRadarSection('all', this)" style="margin-right:auto;">
                    <span>🌐</span> عرض الكل
                </button>
            </div>
`;

// 1. Insert Pill Bar before pulse section comment
const pulseSectionComment = '<!-- نبض الاجتماع ومعدل الاستقرار الإحصائي (Meeting Pulse & Trends) -->';
if (html.includes(pulseSectionComment)) {
    html = html.replace(pulseSectionComment, radarPillBar + nl + '            ' + pulseSectionComment);
}

// 2. Wrap Section: Pulse (hidden by default)
const pulseStart = '<!-- نبض الاجتماع ومعدل الاستقرار الإحصائي (Meeting Pulse & Trends) -->';
const pulseReplacement = '<div id="radarSec_pulse" class="radar-section-panel" style="display:none;">' + nl + '            ' + pulseStart;
html = html.replace(pulseStart, pulseReplacement);

// 3. Close Pulse & Open Absence (visible by default)
const absStart = '<!-- القسم الأول: رادار الغياب والافتقاد الفوري -->';
const absReplacement = '</div><!-- /radarSec_pulse -->' + nl + nl + '            <div id="radarSec_absence" class="radar-section-panel">' + nl + '            ' + absStart;
html = html.replace(absStart, absReplacement);

// 4. Close Absence & Open Excuses
const excusesStart = '<!-- القسم الثاني: رادار الاعتذارات اللحظية ومتابعة الغياب بعذر (Inbound Excuses Radar) -->';
const excusesReplacement = '</div><!-- /radarSec_absence -->' + nl + nl + '            <div id="radarSec_excuses" class="radar-section-panel" style="display:none;">' + nl + '            ' + excusesStart;
html = html.replace(excusesStart, excusesReplacement);

// 5. Close Excuses & Open Confession
const confessionStart = '<!-- القسم الثاني: رادار مهلة الاعتراف التنازلي -->';
const confessionReplacement = '</div><!-- /radarSec_excuses -->' + nl + nl + '            <div id="radarSec_confession" class="radar-section-panel" style="display:none;">' + nl + '            ' + confessionStart;
html = html.replace(confessionStart, confessionReplacement);

// 6. Close Confession & Open Birthdays
const bdayStart = '<!-- القسم الثالث: رادار أعياد الميلاد والمناسبات والتهاني مع واتساب الخدمة -->';
const bdayReplacement = '</div><!-- /radarSec_confession -->' + nl + nl + '            <div id="radarSec_birthdays" class="radar-section-panel" style="display:none;">' + nl + '            ' + bdayStart;
html = html.replace(bdayStart, bdayReplacement);

// 7. Close Birthdays & Open Security (offline password reset & security shield)
const securityStart = '<!-- القسم الثالث: أداة معالجة نسيان كلمة المرور للمخدوم (Offline Password Reset) -->';
const securityReplacement = '</div><!-- /radarSec_birthdays -->' + nl + nl + '            <div id="radarSec_security" class="radar-section-panel" style="display:none;">' + nl + '            ' + securityStart;
html = html.replace(securityStart, securityReplacement);

// 8. Close Security before closing radarTab
const radarCloseSearch = '</div>\r\n\r\n<!-- 1. الرئيسية -->';
const radarCloseSearchLf = '</div>\n\n<!-- 1. الرئيسية -->';

if (html.includes(radarCloseSearch)) {
    html = html.replace(radarCloseSearch, '</div><!-- /radarSec_security -->\r\n        </div>\r\n\r\n<!-- 1. الرئيسية -->');
} else if (html.includes(radarCloseSearchLf)) {
    html = html.replace(radarCloseSearchLf, '</div><!-- /radarSec_security -->\n        </div>\n\n<!-- 1. الرئيسية -->');
}
console.log('✅ radarTab panels wrapped and linked to pill switcher.');

// =========================================================================
// 3. Compact CSS Styles
// =========================================================================
console.log('--- Step 4: Adding compact CSS styles ---');

const compactCss = `
        /* ========================================================================= */
        /* KHIDMETY PRO — COMPACT NAVIGATION & RADAR PILL STYLES                     */
        /* ========================================================================= */
        .radar-pill-bar {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 16px;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
        }
        .radar-pill-btn {
            border: none;
            background: transparent;
            color: #475569;
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 0.84rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .radar-pill-btn:hover {
            background: #e2e8f0;
            color: #0f172a;
        }
        .radar-pill-btn.active {
            background: #0c2461;
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(12, 36, 97, 0.25);
            font-weight: 800;
        }
        .radar-section-panel {
            animation: fadeInRadarSection 0.2s ease-in-out;
        }
        @keyframes fadeInRadarSection {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Compact top group bar */
        .grp-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 6px;
            margin-bottom: 8px;
        }
        .grp-chip {
            background: #eef1fb;
            color: #33415c;
            border-radius: 10px;
            padding: 5px 4px;
            font-weight: 800;
            font-size: 11.5px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            text-align: center;
            user-select: none;
            transition: 0.2s;
        }
        .grp-chip .ic { font-size: 17px; line-height: 1.1; }
        .tabs {
            background: #f6f8fe;
            border-radius: 12px;
            padding: 6px;
            margin-bottom: 12px;
        }
`;

if (!html.includes('.radar-pill-btn {')) {
    html = html.replace('    </style>', compactCss + nl + '    </style>');
    console.log('✅ Compact CSS injected.');
}

// =========================================================================
// 4. JavaScript Functions: switchRadarSection & Persistent Backup Dismiss
// =========================================================================
console.log('--- Step 5: Adding JS functions ---');

const jsToAdd = `
function switchRadarSection(secKey, btnElement) {
    document.querySelectorAll('.radar-pill-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const p = document.getElementById('radarPill_' + secKey);
        if (p) p.classList.add('active');
    }

    const panels = document.querySelectorAll('.radar-section-panel');
    if (secKey === 'all') {
        panels.forEach(p => p.style.display = 'block');
    } else {
        panels.forEach(p => p.style.display = 'none');
        const target = document.getElementById('radarSec_' + secKey);
        if (target) target.style.display = 'block';
    }
}
window.switchRadarSection = switchRadarSection;
`;

if (!html.includes('function switchRadarSection(')) {
    html = html.replace('window.toggleAddServantForm = toggleAddServantForm;', 'window.toggleAddServantForm = toggleAddServantForm;' + nl + nl + jsToAdd);
    console.log('✅ switchRadarSection JS function added.');
}

// Update hideBackupReminder to remember dismissal in sessionStorage
const origHideBackupCrlf = 'function hideBackupReminder() {\r\n\r\nlet b = document.getElementById(\'backupReminderBar\');\r\n\r\nif (b) b.remove();\r\n\r\n}';
const enhancedHideBackup = `function hideBackupReminder() {
    let b = document.getElementById('backupReminderBar');
    if (b) b.remove();
    try { sessionStorage.setItem('khedmety_backup_dismissed', '1'); } catch(e) {}
}`;

if (html.includes(origHideBackupCrlf)) {
    html = html.replace(origHideBackupCrlf, enhancedHideBackup);
    console.log('✅ hideBackupReminder enhanced (CRLF).');
} else {
    const origHideBackupLf = 'function hideBackupReminder() {\n\nlet b = document.getElementById(\'backupReminderBar\');\n\nif (b) b.remove();\n\n}';
    html = html.replace(origHideBackupLf, enhancedHideBackup);
    console.log('✅ hideBackupReminder enhanced (LF).');
}

// Check dismissal in showBackupReminderIfNeeded
const showBackupCheck = 'if (days !== null && days < 7) return;';
const enhancedShowBackupCheck = 'if (days !== null && days < 7) return;\r\nif (sessionStorage.getItem(\'khedmety_backup_dismissed\') === \'1\') return;';

if (html.includes(showBackupCheck) && !html.includes('khedmety_backup_dismissed')) {
    html = html.replace(showBackupCheck, enhancedShowBackupCheck);
    console.log('✅ showBackupReminder dismissal check added.');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('--- Step 6: servant-dashboard.html saved ---');
console.log('Final size:', html.length, 'bytes.');
console.log('🎉 Compact UX implementation finished!');
