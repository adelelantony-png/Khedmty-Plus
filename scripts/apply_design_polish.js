// scripts/apply_design_polish.js
// Implementation of One-Click Navigation, Spiritual Oasis Hub, Elevated Grades Entry, and Royal Liturgical Design System

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'public', 'servant-dashboard.html');
const navPath = path.join(rootDir, 'public', 'js', 'dashboard', 'dashboard-navigation.js');
const radarPath = path.join(rootDir, 'public', 'js', 'dashboard', 'dashboard-radar.js');

console.log('--- Step 1: Enhancing dashboard-navigation.js (One-Click Auto Switch) ---');
let navCode = fs.readFileSync(navPath, 'utf8');

// Replace showGroup to automatically switch to first visible tab of the group on single click
const origShowGroup = `function showGroup(g) {

current = g;

refresh();

fab.href = 'servant_help.html?g=' + g;`;

const newShowGroup = `function showGroup(g, autoSwitch = true) {

current = g;

refresh();

fab.href = 'servant_help.html?g=' + g;

// One-Click Auto Switch to first visible tab of this group!
if (autoSwitch && typeof window.switchTab === 'function') {
    const visibleBtns = [...tabs.querySelectorAll('.tab-btn:not(.grp-hidden)')].filter(b => b.style.display !== 'none');
    const hasActive = visibleBtns.some(b => b.classList.contains('active'));
    if (!hasActive && visibleBtns.length > 0) {
        const firstBtn = visibleBtns[0];
        const m = (firstBtn.getAttribute('onclick') || '').match(/switchTab\\('(\\w+)'/);
        if (m && m[1]) {
            window.switchTab(m[1], firstBtn);
        }
    }
}`;

if (navCode.includes(origShowGroup)) {
    navCode = navCode.replace(origShowGroup, newShowGroup);
    fs.writeFileSync(navPath, navCode, 'utf8');
    console.log('✅ dashboard-navigation.js updated with One-Click Auto Switch.');
} else {
    console.log('ℹ️ showGroup pattern already updated or different in dashboard-navigation.js.');
}

console.log('--- Step 2: Reading servant-dashboard.html ---');
let html = fs.readFileSync(htmlPath, 'utf8');
const isCrlf = html.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';
console.log('Source size:', html.length, 'bytes');

// 2.1 Add Spiritual Oasis Hub button and Grades Entry button to .tabs
const tabToAdd = `
<a href="servant_grades_entry.html" class="tab-btn" data-group="study" style="text-decoration:none; display:flex; align-items:center; justify-content:center; border:1.5px solid #bfdbfe; color:#1e40af; font-weight:800; background:#eff6ff;">
    <i class="fa-solid fa-graduation-cap me-1"></i> رصد درجات التأهيل ✍️🎓
</a>
<div class="tab-btn" id="tabBtn_reflections" data-group="spirit" onclick="switchTab('reflectionsTab', this)" style="border:1.5px solid #a7f3d0; color:#065f46; font-weight:800; background:#ecfdf5;">
    <i class="fa-solid fa-dove me-1"></i> واحة الخادم الروحية 🕊️
</div>
`;

if (!html.includes('id="tabBtn_reflections"')) {
    const tabsEndSearch = '</div>\r\n\r\n<!-- مكتبة المواد -->';
    const tabsEndSearchLf = '</div>\n\n<!-- مكتبة المواد -->';
    if (html.includes(tabsEndSearch)) {
        html = html.replace(tabsEndSearch, tabToAdd + '\r\n</div>\r\n\r\n<!-- مكتبة المواد -->');
        console.log('✅ Tab buttons added to .tabs (CRLF).');
    } else if (html.includes(tabsEndSearchLf)) {
        html = html.replace(tabsEndSearchLf, tabToAdd.replace(/\r\n/g, '\n') + '\n</div>\n\n<!-- مكتبة المواد -->');
        console.log('✅ Tab buttons added to .tabs (LF).');
    }
}

// 2.2 Add Spiritual Oasis Hub container (#reflectionsTab)
const reflectionsTabHtml = `
<!-- واحة الخادم الروحية ووسائط النعمة (Spiritual Oasis Hub) -->
<div id="reflectionsTab" class="tab-content">
    <div style="background: linear-gradient(135deg, #0f2744 0%, #1e3a8a 100%); border-radius: 16px; padding: 22px; color: #ffffff; margin-bottom: 22px; border: 1.5px solid #d4af37; box-shadow: 0 8px 24px rgba(15,39,68,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
                <div style="font-size:0.85rem; color:#fde047; font-weight:800;">وسائط النعمة والنمو الروحي للخادم</div>
                <h2 style="margin:4px 0 0; font-size:1.5rem; font-weight:900; color:#ffffff;">
                    <i class="fa-solid fa-dove text-warning me-2"></i> واحة الخادم الروحية 🕊️
                </h2>
                <div style="font-size:0.82rem; color:#cbd5e1; margin-top:4px;">
                    «فَقَالَ الرَّبُّ: كَذَا يَكُونُ كَلاَمِي الَّذِي يَخْرُجُ مِنْ فَمِي. لاَ يَرْجِعُ إِلَيَّ فَارِغًا» (إش ٥٥: ١١)
                </div>
            </div>
            <div style="font-size:0.85rem; background:rgba(255,255,255,0.15); padding:6px 14px; border-radius:999px; border:1px solid rgba(255,255,255,0.25);">
                غذِّ روحك لتستطيع أن تخدم بأمانة ✨
            </div>
        </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 25px;">
        <!-- 1. نوتة الخادم الروحية -->
        <a href="servant_spiritual_note.html?from=servant&group=spirit" style="text-decoration:none; color:inherit; background:#ffffff; border:1.5px solid #bfdbfe; border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
            <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span style="font-size:1.8rem;">🕊️</span>
                    <strong style="color:#1e40af; font-size:1.1rem;">نوتة الخادم الروحية</strong>
                </div>
                <p style="font-size:0.84rem; color:#64748b; line-height:1.6; margin:0;">
                    متابعة صلوات الأجبية، القداس الإلهي والتناول، وقراءات الإنجيل اليومية، وتاريخ الاعتراف.
                </p>
            </div>
            <div style="margin-top:14px; color:#2563eb; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <span>فتح النوتة الروحية</span> <i class="fa-solid fa-arrow-left"></i>
            </div>
        </a>

        <!-- 2. مفكرة الخادم -->
        <a href="servant_journal.html?from=servant&group=spirit" style="text-decoration:none; color:inherit; background:#ffffff; border:1.5px solid #ddd6fe; border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
            <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span style="font-size:1.8rem;">✍️</span>
                    <strong style="color:#6d28d9; font-size:1.1rem;">مفكرة الخادم الشخصية</strong>
                </div>
                <p style="font-size:0.84rem; color:#64748b; line-height:1.6; margin:0;">
                    تدوين الخواطر والتأملات الروحية والملاحظات الخاصة بتحضير الدروس والخدمة.
                </p>
            </div>
            <div style="margin-top:14px; color:#7c3aed; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <span>فتح المفكرة والتدوين</span> <i class="fa-solid fa-arrow-left"></i>
            </div>
        </a>

        <!-- 3. قارئ الكتاب المقدس -->
        <a href="bible.html?from=servant&group=spirit" style="text-decoration:none; color:inherit; background:#ffffff; border:1.5px solid #fed7aa; border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
            <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span style="font-size:1.8rem;">📖</span>
                    <strong style="color:#c2410c; font-size:1.1rem;">قارئ الكتاب المقدس</strong>
                </div>
                <p style="font-size:0.84rem; color:#64748b; line-height:1.6; margin:0;">
                    قراءة أسفار العهدين القديم والجديد مع خطة القراءة السنوية المنظمة للخدمة.
                </p>
            </div>
            <div style="margin-top:14px; color:#ea580c; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <span>قراءة الإنجيل والخطة</span> <i class="fa-solid fa-arrow-left"></i>
            </div>
        </a>

        <!-- 4. القطمارس اليومي -->
        <a href="katamaros.html?from=servant&group=spirit" style="text-decoration:none; color:inherit; background:#ffffff; border:1.5px solid #bbf7d0; border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
            <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span style="font-size:1.8rem;">📜</span>
                    <strong style="color:#047857; font-size:1.1rem;">القطمارس الكنسي اليومي</strong>
                </div>
                <p style="font-size:0.84rem; color:#64748b; line-height:1.6; margin:0;">
                    قراءات طقس الكنيسة القبطية الأرثوذكسية اليومية: رفع بخور عشية، باكر، والقداس الإلهي.
                </p>
            </div>
            <div style="margin-top:14px; color:#059669; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <span>عرض قراءات اليوم</span> <i class="fa-solid fa-arrow-left"></i>
            </div>
        </a>

        <!-- 5. السنكسار الكنسي -->
        <a href="synaxarium.html?from=servant&group=spirit" style="text-decoration:none; color:inherit; background:#ffffff; border:1.5px solid #fef08a; border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
            <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <span style="font-size:1.8rem;">⛪</span>
                    <strong style="color:#a16207; font-size:1.1rem;">السنكسار وسير الآباء والشهداء</strong>
                </div>
                <p style="font-size:0.84rem; color:#64748b; line-height:1.6; margin:0;">
                    تذكارات قديسي وشهداء الكنيسة القبطية الأرثوذكسية وسير حياتهم العطرة بحسب التقويم القبطي.
                </p>
            </div>
            <div style="margin-top:14px; color:#b45309; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <span>قراءة سنكسار اليوم</span> <i class="fa-solid fa-arrow-left"></i>
            </div>
        </a>
    </div>
</div>
`;

if (!html.includes('id="reflectionsTab"')) {
    const insertAfterMaterials = '<div id="materialsListContainer" style="display:flex; flex-direction:column; gap:10px;"></div>\r\n\r\n</div>';
    const insertAfterMaterialsLf = '<div id="materialsListContainer" style="display:flex; flex-direction:column; gap:10px;"></div>\n\n</div>';

    if (html.includes(insertAfterMaterials)) {
        html = html.replace(insertAfterMaterials, insertAfterMaterials + '\r\n\r\n' + reflectionsTabHtml);
        console.log('✅ reflectionsTab container inserted (CRLF).');
    } else if (html.includes(insertAfterMaterialsLf)) {
        html = html.replace(insertAfterMaterialsLf, insertAfterMaterialsLf + '\n\n' + reflectionsTabHtml.replace(/\r\n/g, '\n'));
        console.log('✅ reflectionsTab container inserted (LF).');
    }
}

// 2.3 Refined Liturgical Color Harmony & Design System CSS
const luxuryDesignCss = `
        /* ========================================================================= */
        /* KHIDMETY PRO — LUXURY LITURGICAL DESIGN SYSTEM & COLOR HARMONY            */
        /* ========================================================================= */
        :root {
            --brand-navy: #0f2744;
            --brand-deep: #1e3a8a;
            --brand-blue: #2563eb;
            --brand-gold: #c59b27;
            --brand-gold-light: #fef3c7;
            --brand-gold-dark: #92400e;
            --surface-card: #ffffff;
            --surface-muted: #f8fafc;
            --border-soft: #e2e8f0;
            --border-medium: #cbd5e1;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;
        }

        /* Group Navigation Chips */
        .grp-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
            gap: 8px;
            margin-bottom: 10px;
        }
        .grp-chip {
            background: #ffffff !important;
            color: var(--text-secondary) !important;
            border: 1.5px solid var(--border-soft) !important;
            border-radius: 12px !important;
            padding: 8px 6px !important;
            font-weight: 800 !important;
            font-size: 12px !important;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            text-align: center;
            user-select: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }
        .grp-chip .ic {
            font-size: 20px;
            line-height: 1.1;
            transition: transform 0.2s ease;
        }
        .grp-chip:hover {
            background: #f1f5f9 !important;
            border-color: #94a3b8 !important;
            color: var(--brand-navy) !important;
            transform: translateY(-1px);
        }
        .grp-chip.active {
            background: linear-gradient(135deg, #0f2744 0%, #1e3a8a 100%) !important;
            color: #ffffff !important;
            border-color: #0f2744 !important;
            box-shadow: 0 4px 14px rgba(15, 39, 68, 0.28) !important;
            transform: translateY(-2px);
        }
        .grp-chip.active .ic {
            transform: scale(1.1);
        }

        /* Sub-Tabs Bar */
        .tabs {
            background: #ffffff !important;
            border: 1.5px solid var(--border-soft) !important;
            border-radius: 14px !important;
            padding: 7px !important;
            margin-bottom: 15px !important;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .tab-btn, .tabs a.tab-btn {
            border: 1px solid var(--border-soft);
            background: #f8fafc;
            color: var(--text-secondary);
            padding: 8px 14px;
            border-radius: 9px;
            font-size: 0.84rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.18s ease;
            text-decoration: none;
        }
        .tab-btn:hover, .tabs a.tab-btn:hover {
            background: #e2e8f0;
            color: var(--text-primary);
            transform: translateY(-1px);
        }
        .tab-btn.active, .tabs a.tab-btn.active {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important;
            color: #ffffff !important;
            border-color: #1d4ed8 !important;
            box-shadow: 0 3px 10px rgba(37, 99, 235, 0.22);
            font-weight: 800;
        }

        /* Stat Cards in Dashboard */
        .stat-card {
            background: #ffffff;
            border: 1.5px solid var(--border-soft);
            border-radius: 12px;
            padding: 14px 12px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(15, 39, 68, 0.08);
        }
`;

if (!html.includes('--brand-navy:')) {
    html = html.replace('    </style>', luxuryDesignCss + nl + '    </style>');
    console.log('✅ Luxury design CSS injected into servant-dashboard.html');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('--- Step 3: servant-dashboard.html saved ---');
console.log('Final size:', html.length, 'bytes');
console.log('🎉 Design polish implementation complete!');
