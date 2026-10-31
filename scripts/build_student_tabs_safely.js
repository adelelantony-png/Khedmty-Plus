/**
 * scripts/build_student_tabs_safely.js
 * تجميع وتفعيل نظام التبويبات والملاحة السفلية لـ student.html بالأسطر الدقيقة
 */

const fs = require('fs');
const lines = fs.readFileSync('public/student.html', 'utf8').split('\n');

// تحديد مؤشرات الأسطر الدقيقة (0-indexed)
const idx_birthday = lines.findIndex(l => l.includes('id="student-birthday-banner"'));
const idx_spiritual = lines.findIndex(l => l.includes('class="card p-3 mb-3 border-0 spiritual-journey-card"'));
const idx_diary = lines.findIndex(l => l.includes('class="private-diary-box p-3 text-white mb-3"'));
const idx_badges = lines.findIndex(l => l.includes('class="badges-gamification-section"'));
const idx_reading = lines.findIndex(l => l.includes('id="ui-today-reading-title"')) - 3;
const idx_conference = lines.findIndex(l => l.includes('id="conferenceDiscountStudentCard"'));
const idx_cat1 = lines.findIndex(l => l.includes('القسم الأول: الالتزام الدراسي'));
const idx_cat2 = lines.findIndex(l => l.includes('القسم الثاني: وسائط النعمة'));
const idx_feedback = lines.findIndex(l => l.includes('Feedback Widget'));
const idx_scripts = lines.findIndex(l => l.includes('src="auth-client.js"'));

console.log('Line indices:', {
    idx_birthday,
    idx_spiritual,
    idx_diary,
    idx_badges,
    idx_reading,
    idx_conference,
    idx_cat1,
    idx_cat2,
    idx_feedback,
    idx_scripts
});

// استخراج المقاطع بدقة متناهية
let part_header = lines.slice(0, idx_birthday).join('\n');
const part_banners = lines.slice(idx_birthday, idx_spiritual).join('\n');
const part_streak_feasts = lines.slice(idx_spiritual, idx_diary).join('\n');
const part_confession = lines.slice(idx_diary, idx_badges).join('\n');
const part_badges = lines.slice(idx_badges, idx_reading).join('\n');
const part_reading = lines.slice(idx_reading, idx_conference).join('\n');
const part_conference = lines.slice(idx_conference, idx_cat1).join('\n');
const part_cat1 = lines.slice(idx_cat1, idx_cat2).join('\n');
const part_cat2 = lines.slice(idx_cat2, idx_feedback).join('\n');
const part_feedback = lines.slice(idx_feedback, idx_scripts - 4).join('\n'); // without closing container divs
let part_scripts = lines.slice(idx_scripts).join('\n');

// 1. حقن أنماط CSS الملاحة السفلية والثيم الكنسي الفاخر في part_header
const styles = `
        /* ============================================================== */
        /* مسطرة التنقل السفلية للموبايل والتبويبات الكنسية الفاخرة */
        /* ============================================================== */
        :root {
            --liturgical-navy: #0f2744;
            --liturgical-navy-light: #1b3a5b;
            --liturgical-gold: #c59b27;
            --liturgical-gold-light: #dfb743;
            --liturgical-bg: #f8fafc;
        }

        @media (max-width: 768px) {
            body { padding-bottom: 95px !important; }
        }

        .welcome-header {
            background: linear-gradient(135deg, #0f2744 0%, #1b3a5b 55%, #1e3a8a 100%) !important;
            border-bottom: 3.5px solid #c59b27 !important;
            box-shadow: 0 12px 30px rgba(15, 39, 68, 0.28) !important;
        }

        /* مسطرة التبويب العلوية للأجهزة الكبيرة والتابلت */
        .student-top-tabs {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 18px;
            padding: 6px;
            margin-bottom: 20px;
            box-shadow: 0 4px 16px rgba(15, 39, 68, 0.05);
            overflow-x: auto;
        }
        .student-nav-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 18px;
            border-radius: 12px;
            border: none;
            background: transparent;
            color: #475569;
            font-size: 0.92rem;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.25s ease;
            white-space: nowrap;
        }
        .student-nav-btn:hover {
            color: #0f2744;
            background: #f1f5f9;
        }
        .student-nav-btn.active {
            background: linear-gradient(135deg, #0f2744, #1b3a5b);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(15, 39, 68, 0.25);
            border-bottom: 2px solid #c59b27;
        }
        .student-nav-btn.active .nav-icon {
            color: #c59b27 !important;
        }

        /* شريط الملاحة السفلي الثابت لشاشات الموبايل */
        .student-bottom-nav {
            display: none;
        }
        @media (max-width: 768px) {
            .student-bottom-nav {
                display: flex;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 68px;
                background: rgba(15, 39, 68, 0.96);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border-top: 1.5px solid rgba(197, 155, 39, 0.5);
                box-shadow: 0 -6px 25px rgba(0, 0, 0, 0.35);
                z-index: 9998;
                align-items: center;
                justify-content: space-around;
                padding: 0 6px;
                direction: rtl;
            }
            .bottom-nav-item {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 3px;
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 0.72rem;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.2s ease;
                padding: 6px 0;
                border-radius: 12px;
                text-decoration: none;
            }
            .bottom-nav-item .nav-icon {
                font-size: 1.25rem;
                transition: transform 0.2s ease, color 0.2s ease;
            }
            .bottom-nav-item.active {
                color: #ffffff;
            }
            .bottom-nav-item.active .nav-icon {
                color: #c59b27;
                transform: translateY(-2px) scale(1.1);
                filter: drop-shadow(0 2px 6px rgba(197, 155, 39, 0.6));
            }
            .bottom-nav-item.active .nav-title {
                color: #c59b27;
                font-weight: 800;
            }
        }

        .student-tab-pane {
            animation: fadeInTab 0.28s ease-in-out;
        }
        @keyframes fadeInTab {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .liturgical-shelf-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1.5px solid #e2e8f0;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-decoration: none;
            color: inherit;
            transition: all 0.25s ease;
            box-shadow: 0 2px 8px rgba(15, 39, 68, 0.04);
        }
        .liturgical-shelf-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(15, 39, 68, 0.09);
            border-color: #c59b27;
            color: inherit;
        }
`;

part_header = part_header.replace('</style>', `${styles}\n    </style>`);

// مسطرة التبويب العلوية
const topTabBar = `
    <!-- مسطرة التبويب العلوية (Top Segmented Navigation) -->
    <div class="student-top-tabs">
        <button type="button" class="student-nav-btn active" data-tab="home" onclick="switchStudentTab('home')">
            <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
            <span>الرئيسية</span>
        </button>
        <button type="button" class="student-nav-btn" data-tab="spiritual" onclick="switchStudentTab('spiritual')">
            <span class="nav-icon text-danger"><i class="fa-solid fa-dove"></i></span>
            <span>نوتتي الروحية</span>
        </button>
        <button type="button" class="student-nav-btn" data-tab="grades" onclick="switchStudentTab('grades')">
            <span class="nav-icon text-primary"><i class="fa-solid fa-chart-simple"></i></span>
            <span>درجاتي وحضوري</span>
        </button>
        <button type="button" class="student-nav-btn" data-tab="badges" onclick="switchStudentTab('badges')">
            <span class="nav-icon text-warning"><i class="fa-solid fa-trophy"></i></span>
            <span>أوسمتي وحصادي</span>
        </button>
    </div>
`;

// Pane 1: الرئيسية
const pane1 = `
    <!-- ========================================== -->
    <!-- 🏠 التبويب 1: الرئيسية (Home Tab) -->
    <!-- ========================================== -->
    <div id="pane-home" class="student-tab-pane active">
        ${part_banners}
        ${part_streak_feasts}
        </div>
        ${part_reading}
    </div>
`;

// Pane 2: نوتتي الروحية
const pane2 = `
    <!-- ========================================== -->
    <!-- 🕊️ التبويب 2: نوتتي الروحية (Spiritual Tab) -->
    <!-- ========================================== -->
    <div id="pane-spiritual" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${part_confession}
        </div>
        ${part_cat2}
    </div>
`;

// Pane 3: درجاتي وحضوري
const pane3 = `
    <!-- ========================================== -->
    <!-- 📊 التبويب 3: درجاتي وحضوري (Grades Tab) -->
    <!-- ========================================== -->
    <div id="pane-grades" class="student-tab-pane" style="display: none;">
        ${part_conference}
        ${part_cat1}
    </div>
`;

// Pane 4: أوسمتي وحصادي
const pane4 = `
    <!-- ========================================== -->
    <!-- 🏆 التبويب 4: أوسمتي وحصادي (Badges & Harvest Tab) -->
    <!-- ========================================== -->
    <div id="pane-badges" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${part_badges}
        </div>
        ${part_feedback}
    </div>
`;

// شريط الملاحة السفلي الثابت لشاشات الموبايل
const bottomNavHtml = `
    <!-- ============================================================== -->
    <!-- مسطرة الملاحة السفلية الثابتة للموبايل (Mobile Bottom Bar) -->
    <!-- ============================================================== -->
    <nav class="student-bottom-nav">
        <button type="button" class="bottom-nav-item active" data-tab="home" onclick="switchStudentTab('home')">
            <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
            <span class="nav-title">الرئيسية</span>
        </button>
        <button type="button" class="bottom-nav-item" data-tab="spiritual" onclick="switchStudentTab('spiritual')">
            <span class="nav-icon"><i class="fa-solid fa-dove"></i></span>
            <span class="nav-title">نوتتي</span>
        </button>
        <button type="button" class="bottom-nav-item" data-tab="grades" onclick="switchStudentTab('grades')">
            <span class="nav-icon"><i class="fa-solid fa-chart-simple"></i></span>
            <span class="nav-title">درجاتي</span>
        </button>
        <button type="button" class="bottom-nav-item" data-tab="badges" onclick="switchStudentTab('badges')">
            <span class="nav-icon"><i class="fa-solid fa-trophy"></i></span>
            <span class="nav-title">أوسمتي</span>
        </button>
    </nav>
`;

const tabScript = `
    // دالة التبديل الفوري بين التبويبات بدون تحميل
    function switchStudentTab(tabId) {
        if (!tabId) tabId = 'home';
        document.querySelectorAll('.student-tab-pane').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.student-nav-btn, .bottom-nav-item').forEach(b => b.classList.remove('active'));
        
        const target = document.getElementById('pane-' + tabId);
        if (target) {
            target.style.display = 'block';
        }
        document.querySelectorAll('[data-tab="' + tabId + '"]').forEach(b => b.classList.add('active'));
        
        try {
            if (history.replaceState) history.replaceState(null, '', '#' + tabId);
        } catch(e) {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.switchStudentTab = switchStudentTab;

    // استعادة التبويب المفتوح من الرابط (Hash)
    window.addEventListener('DOMContentLoaded', () => {
        const hash = (window.location.hash || '').replace('#', '').trim();
        if (['home', 'spiritual', 'grades', 'badges'].includes(hash)) {
            switchStudentTab(hash);
        }
    });
`;

let finalHtml = part_header + topTabBar + pane1 + pane2 + pane3 + pane4 + '\n</div>\n\n' + part_scripts;

// إضافة bottomNav قبل </body>
finalHtml = finalHtml.replace('</body>', `${bottomNavHtml}\n</body>`);

// إضافة tabScript قبل آخر </script>
const lastScriptIdx = finalHtml.lastIndexOf('</script>');
finalHtml = finalHtml.substring(0, lastScriptIdx) + `\n${tabScript}\n` + finalHtml.substring(lastScriptIdx);

fs.writeFileSync('public/student.html', finalHtml, 'utf8');
console.log('🎉 Successfully applied Mobile Bottom Navigation Bar & 4 Liturgical Panes to student.html!');
