/**
 * scripts/transform_student_portal.js
 * تحويل بوابة المخدومين student.html لنظام التبويبات والملاحة السفلية للموبايل
 */

const fs = require('fs');

const path = 'public/student.html';
const raw = fs.readFileSync(path, 'utf8');

// 1. تحضير الأنماط الكنسية الفاخرة وشريط الملاحة السفلي
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

let updated = raw;
if (!updated.includes('student-bottom-nav')) {
    updated = updated.replace('</style>', `${styles}\n    </style>`);
}

// استخراج الأجزاء الأساسية
// Header: من البداية حتى قبل <div id="student-birthday-banner"
const bdayIdx = updated.indexOf('<div id="student-birthday-banner"');
const headerPart = updated.substring(0, bdayIdx);

// Birthday & Warning
const warningEndStr = '</div>\n\n    </div>';
const warningIdx = updated.indexOf('id="student-warning-banner"');
const warningEndIdx = updated.indexOf('<!-- ========================================== -->', warningIdx);
const bannersPart = updated.substring(bdayIdx, warningEndIdx);

// Streak & Feast & Fast
const spiritualJourneyStart = updated.indexOf('<div class="card p-3 mb-3 border-0 spiritual-journey-card">');
const diaryBoxStart = updated.indexOf('<div class="private-diary-box p-3 text-white mb-3">');
const streakAndFeastsPart = updated.substring(spiritualJourneyStart, diaryBoxStart);

// Confession Box
const badgesStart = updated.indexOf('<div class="badges-gamification-section">');
const confessionPart = updated.substring(diaryBoxStart, badgesStart);

// Badges Section
const spiritualJourneyEnd = updated.indexOf('</div>\n\n        <!-- بطاقة قراءة اليوم المقررة');
const badgesPart = updated.substring(badgesStart, spiritualJourneyEnd + 6); // include closing </div>

// Today Reading Plan Card
const confDiscountStart = updated.indexOf('<div id="conferenceDiscountStudentCard"');
const todayReadingPart = updated.substring(spiritualJourneyEnd + 6, confDiscountStart);

// Conference Discount Card
const category1Start = updated.indexOf('<!-- تصنيف أول: الأكاديميات والدرجات والحصاد -->');
const confDiscountPart = updated.substring(confDiscountStart, category1Start);

// Category 1: Services & Grades
const category2Start = updated.indexOf('<!-- تصنيف ثان: الوسائط والروحيات والقراءات -->');
const category1Part = updated.substring(category1Start, category2Start);

// Category 2: Spiritual & Liturgical
const feedbackStart = updated.indexOf('<!-- صندوق تقييم الخدمة والرأي');
const category2Part = updated.substring(category2Start, feedbackStart);

// Feedback Card & End of Container
const scriptStart = updated.indexOf('<script src="auth-client.js">');
const feedbackPart = updated.substring(feedbackStart, scriptStart);
const scriptsPart = updated.substring(scriptStart);

console.log('Markers extracted successfully:');
console.log('- Header length:', headerPart.length);
console.log('- Banners length:', bannersPart.length);
console.log('- Streak & Feasts length:', streakAndFeastsPart.length);
console.log('- Confession length:', confessionPart.length);
console.log('- Badges length:', badgesPart.length);
console.log('- Today Reading length:', todayReadingPart.length);
console.log('- Conference Discount length:', confDiscountPart.length);
console.log('- Category 1 length:', category1Part.length);
console.log('- Category 2 length:', category2Part.length);
console.log('- Feedback length:', feedbackPart.length);
console.log('- Scripts length:', scriptsPart.length);

// تجميع التبويبات الأربعة

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
        ${bannersPart}
        ${streakAndFeastsPart}
        </div>
        ${todayReadingPart}
    </div>
`;

// Pane 2: نوتتي الروحية
const pane2 = `
    <!-- ========================================== -->
    <!-- 🕊️ التبويب 2: نوتتي الروحية (Spiritual Tab) -->
    <!-- ========================================== -->
    <div id="pane-spiritual" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${confessionPart}
        </div>
        ${category2Part}
    </div>
`;

// Pane 3: درجاتي وحضوري
const pane3 = `
    <!-- ========================================== -->
    <!-- 📊 التبويب 3: درجاتي وحضوري (Grades Tab) -->
    <!-- ========================================== -->
    <div id="pane-grades" class="student-tab-pane" style="display: none;">
        ${confDiscountPart}
        ${category1Part}
    </div>
`;

// Pane 4: أوسمتي وحصادي
const pane4 = `
    <!-- ========================================== -->
    <!-- 🏆 التبويب 4: أوسمتي وحصادي (Badges & Harvest Tab) -->
    <!-- ========================================== -->
    <div id="pane-badges" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${badgesPart}
        </div>
        ${feedbackPart}
    </div>
`;

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

let finalHtml = headerPart + topTabBar + pane1 + pane2 + pane3 + pane4 + '\n</div>\n\n' + scriptsPart;

// إضافة bottomNav قبل </body>
finalHtml = finalHtml.replace('</body>', `${bottomNavHtml}\n</body>`);

// إضافة tabScript قبل آخر </script>
const lastScriptIdx = finalHtml.lastIndexOf('</script>');
finalHtml = finalHtml.substring(0, lastScriptIdx) + `\n${tabScript}\n` + finalHtml.substring(lastScriptIdx);

fs.writeFileSync(path, finalHtml, 'utf8');
console.log('🎉 Successfully applied Mobile Bottom Navigation Bar & 4 Liturgical Panes to student.html');
