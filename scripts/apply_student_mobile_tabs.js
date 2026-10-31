/**
 * scripts/apply_student_mobile_tabs.js
 * تفعيل مسطرة التنقل السفلية للموبايل (Mobile Bottom Navigation Bar)
 * مع الثيم الكنسي الفاخر وتبويب المحتوى إلى 4 محاور في student.html
 */

const fs = require('fs');
const path = require('path');

const studentHtmlPath = 'D:/StPaul_Service_System/03_Web_Khedmty_Plus/public/student.html';
let content = fs.readFileSync(studentHtmlPath, 'utf8');

// 1. إضافة أنماط CSS الملاحة السفلية والثيم الكنسي
const customCSS = `
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
            body { padding-bottom: 90px !important; }
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

// حقن الـ CSS
if (!content.includes('student-bottom-nav')) {
    content = content.replace('</style>', `${customCSS}\n    </style>`);
}

// 2. فحص موضع الترويسة وبدء تبويب المحتوى
const startMarker = '<div id="student-birthday-banner"';
const endMarker = '<!-- صندوق تقييم الخدمة والرأي';

if (content.includes(startMarker) && content.includes(endMarker)) {
    console.log('Found main content markers, restructuring into 4 Liturgical Panes...');

    // استخراج الأجزاء
    const prePart = content.substring(0, content.indexOf(startMarker));
    const remainder = content.substring(content.indexOf(startMarker));
    
    // شريط التبويب العلوي الأنيق
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

    // Pane 1: الرئيسية (Home)
    // تشمل: عيد الميلاد، الإنذار، شعلة المواظبة، الأعياد والأصوام، واستوديو قراءة اليوم
    // نحدد محتوى Pane 1
    const p1_birthday = remainder.substring(
        remainder.indexOf('<div id="student-birthday-banner"'),
        remainder.indexOf('<!-- 1. شعلة المواظبة اليومية')
    );
    
    const p1_streak_and_coptic = remainder.substring(
        remainder.indexOf('<!-- 1. شعلة المواظبة اليومية'),
        remainder.indexOf('<!-- 3. المذكرات الروحية الخاصة')
    );

    const p1_reading = remainder.substring(
        remainder.indexOf('<!-- بطاقة قراءة اليوم المقررة'),
        remainder.indexOf('<!-- بطاقة خصم مؤتمر الخدمة السنوي')
    );

    const pane1Html = `
    <!-- ========================================== -->
    <!-- 🏠 التبويب 1: الرئيسية (Home Tab) -->
    <!-- ========================================== -->
    <div id="pane-home" class="student-tab-pane active">
        ${p1_birthday}
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                    <span style="font-size: 1.3rem;">🕊️</span>
                    <h5 class="fw-bold mb-0" style="color: #0f2744;">رحلتي الروحية اليومية</h5>
                </div>
                <span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:0.78rem;">
                    <i class="fa-solid fa-sparkles me-1 text-warning"></i> بركة يومية
                </span>
            </div>
            ${p1_streak_and_coptic}
        </div>
        ${p1_reading}
    </div>
`;

    // Pane 2: نوتتي (Spiritual)
    // تشمل: صندوق الاعتراف الخاص، ورابط النوتة الروحية، ورف الكتب الليتورجية (الكتاب المقدس، القطمارس، السنكسار)
    const p2_confession = remainder.substring(
        remainder.indexOf('<!-- 3. المذكرات الروحية الخاصة'),
        remainder.indexOf('<!-- 4. شارات الأوسمة والتحفيز')
    );

    const pane2Html = `
    <!-- ========================================== -->
    <!-- 🕊️ التبويب 2: نوتتي الروحية (Spiritual Tab) -->
    <!-- ========================================== -->
    <div id="pane-spiritual" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${p2_confession}
        </div>

        <div class="category-title"><i class="fa-solid fa-dove text-danger"></i> رف القراءات والوسائط الكنسية:</div>
        <div class="menu-grid">
            <a href="spiritual_note.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-danger bg-opacity-10 text-danger"><i class="fa-solid fa-heart-pulse"></i></div>
                    <div>
                        <strong class="d-block text-dark">النوتة الروحية الكاملة</strong>
                        <small class="text-muted">تسجيل صلواتي والقداس والقراءات</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="bible.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-warning bg-opacity-10 text-warning"><i class="fa-solid fa-book-bible"></i></div>
                    <div>
                        <strong class="d-block text-dark">الكتاب المقدس كاملاً</strong>
                        <small class="text-muted">تصفح وقراءة وإكمال الإصحاحات بدون نت</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="katamaros.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-info bg-opacity-10 text-info"><i class="fa-solid fa-scroll"></i></div>
                    <div>
                        <strong class="d-block text-dark">القطمارس اليومي</strong>
                        <small class="text-muted">قراءات الكنيسة بحسب اليوم القبطي</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="synaxarium.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-secondary bg-opacity-10 text-secondary"><i class="fa-solid fa-church"></i></div>
                    <div>
                        <strong class="d-block text-dark">السنكسار الكنسي</strong>
                        <small class="text-muted">سير الآباء والشهداء وقديسي اليوم</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>
        </div>
    </div>
`;

    // Pane 3: درجاتي وحضوري (Grades Tab)
    // تشمل: خصم المؤتمر، باركود الحضور، سجل الحضور، شيتات التسميع، نتائج الدرجات
    const p3_conference = remainder.substring(
        remainder.indexOf('<!-- بطاقة خصم مؤتمر الخدمة السنوي'),
        remainder.indexOf('<!-- تصنيف أول: الأكاديميات والدرجات والحصاد -->')
    );

    const pane3Html = `
    <!-- ========================================== -->
    <!-- 📊 التبويب 3: درجاتي وحضوري (Grades Tab) -->
    <!-- ========================================== -->
    <div id="pane-grades" class="student-tab-pane" style="display: none;">
        ${p3_conference}

        <div class="category-title"><i class="fa-solid fa-graduation-cap text-primary"></i> الخدمات وسجل الحضور والتقييمات:</div>
        <div class="menu-grid">
            <a href="barcode.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-primary bg-opacity-10 text-primary"><i class="fa-solid fa-qrcode"></i></div>
                    <div>
                        <strong class="d-block text-dark">باركود الحضور الذكي</strong>
                        <small class="text-muted">عرض كود QR الخاص بي لتسجيل الحضور</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="student_attendance.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-info bg-opacity-10 text-info"><i class="fa-solid fa-calendar-check"></i></div>
                    <div>
                        <strong class="d-block text-dark">سجل حضوري الأسبوعي</strong>
                        <small class="text-muted">عرض تواريخ الحضور والغياب للجمعة</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="sheets_list.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon" style="background:#f3e8ff;"><i class="fa-solid fa-file-pen" style="color:#7c3aed;"></i></div>
                    <div>
                        <strong class="d-block text-dark">شيتات التسميع والأنشطة</strong>
                        <small class="text-muted">متابعة وحل الشيتات الدورية المتاحة</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>

            <a href="results.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon" style="background:#fef3c7; color:#d97706;"><i class="fa-solid fa-award"></i></div>
                    <div>
                        <strong class="d-block text-dark">نتائج وتقييمات درجاتي</strong>
                        <small class="text-muted">تفاصيل درجات الامتحانات والشفوي والأنشطة</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>
        </div>
    </div>
`;

    // Pane 4: أوسمتي وحصادي (Badges & Harvest Tab)
    // تشمل: شبكة الأوسمة، بطاقة الحصاد، وصندوق تقييم الخدمة
    const p4_badges = remainder.substring(
        remainder.indexOf('<!-- 4. شارات الأوسمة والتحفيز'),
        remainder.indexOf('</div>\n\n        <!-- بطاقة قراءة اليوم المقررة')
    );

    const p4_feedback = remainder.substring(
        remainder.indexOf('<!-- صندوق تقييم الخدمة والرأي'),
        remainder.indexOf('</div>\n</div>\n\n\n\n<script src="auth-client.js">')
    );

    const pane4Html = `
    <!-- ========================================== -->
    <!-- 🏆 التبويب 4: أوسمتي وحصادي (Badges & Harvest Tab) -->
    <!-- ========================================== -->
    <div id="pane-badges" class="student-tab-pane" style="display: none;">
        <div class="card p-3 mb-3 border-0 spiritual-journey-card">
            ${p4_badges}
        </div>

        <div class="category-title"><i class="fa-solid fa-seedling text-success"></i> الحصاد الروحي والمستوى:</div>
        <div class="menu-grid mb-3">
            <a href="harvest.html" class="liturgical-shelf-card">
                <div class="d-flex align-items-center">
                    <div class="menu-icon bg-success bg-opacity-10 text-success"><i class="fa-solid fa-seedling"></i></div>
                    <div>
                        <strong class="d-block text-dark">شجرة الحصاد الروحي ومستواي</strong>
                        <small class="text-muted">تفاصيل نموك الروحي ودرجات الحصاد الشامل</small>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-left text-muted"></i>
            </a>
        </div>

        ${p4_feedback}
    </div>
`;

    // شريط الملاحة السفلي الثابت للموبايل
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

    // كود تحكم التبويب
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

    // إعادة تجميع الملف
    const postScriptMarker = '</body>';
    const scriptIndex = content.lastIndexOf('</script>');
    
    // استبدال الجزء الأوسط
    const newMiddle = topTabBar + pane1Html + pane2Html + pane3Html + pane4Html;
    
    // إيجاد نهاية الحاوية الرئيسية
    const mainContainerEnd = '</div>\n</div>\n\n\n\n<script src="auth-client.js">';
    const mainContainerEndIdx = content.indexOf(mainContainerEnd);
    
    const beforeMain = content.substring(0, content.indexOf(startMarker));
    const afterMain = content.substring(mainContainerEndIdx);
    
    let finalHtml = beforeMain + newMiddle + afterMain;
    
    // حقن bottomNav قبل </body>
    finalHtml = finalHtml.replace('</body>', `${bottomNavHtml}\n</body>`);
    
    // حقن tabScript قبل آخر </script>
    const lastScriptIdx = finalHtml.lastIndexOf('</script>');
    finalHtml = finalHtml.substring(0, lastScriptIdx) + `\n${tabScript}\n` + finalHtml.substring(lastScriptIdx);
    
    fs.writeFileSync(studentHtmlPath, finalHtml, 'utf8');
    console.log('✅ Successfully applied Mobile Bottom Navigation Bar & 4 Liturgical Panes to student.html');
} else {
    console.error('Could not find markers in student.html');
}
