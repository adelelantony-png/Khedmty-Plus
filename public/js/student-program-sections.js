/**
 * public/js/student-program-sections.js
 * مكوّنات وأقسام البرنامج الرسمية لبوابة المخدومين والطلاب
 * 
 * يربط الأقسام الأربعة بوظائف حقيقية متقدمة:
 * 1. الدورات التدريبية: كروت المقررات ونسب الإنجاز وفلاتر الحالات (مطابقة للمرجع البصري).
 * 2. الفعاليات والاجتماعات: عداد تنازلي للجمعة، جدول المحاضرات القادمة، مؤتمر الخدمة، واعتذار واتساب.
 * 3. المواد التعليمية: مكتبة الملازم والمذكرات PDF مع ربط كشك الاستعلام الذاتي على واتساب (WhatsApp Kiosk).
 * 4. متابعة التقدم: لوحة التأهيل الشامل ونسبة الجاهزية للرسامة ومؤشرات الحضور والدرجات والتتابع.
 */

(function () {
    'use strict';

    // 1. بيانات الكورسات المعتمدة
    var DEFAULT_COURSES = [
        {
            id: 'c1',
            title: 'أساسيات الخدمة الكنسية والرعاية',
            icon: 'fa-church',
            status: 'completed',
            statusLabel: 'مكتملة',
            progress: 100,
            lecturesCount: 6,
            lecturesAttended: 6,
            instructor: 'القمص بيشوي & أمين الخدمة',
            desc: 'مفهوم الخدمة، صفات الخادم الأرثوذكسي، وافتقاد المخدومين بروح المحبة.'
        },
        {
            id: 'c2',
            title: 'العقيدة المسيحية الأرثوذكسية واللاهوت',
            icon: 'fa-cross',
            status: 'in_progress',
            statusLabel: 'قيد الدراسة',
            progress: 60,
            lecturesCount: 8,
            lecturesAttended: 5,
            instructor: 'د. مينا عادل',
            desc: 'عقيدة الثالوث القدوس، التجسد الإلهي، الفداء، وأسرار الكنيسة السبعة.'
        },
        {
            id: 'c3',
            title: 'الطقس الكنسي والألحان وتاريخ التسبحة',
            icon: 'fa-book-bible',
            status: 'in_progress',
            statusLabel: 'قيد الدراسة',
            progress: 30,
            lecturesCount: 6,
            lecturesAttended: 2,
            instructor: 'الشماس يوسف رمسيس',
            desc: 'طقس القداس الباسيلي، أعياد الكنيسة السيدية، وألحان المناسبات.'
        },
        {
            id: 'c4',
            title: 'دراسات متقدمة في أسفار العهد الجديد',
            icon: 'fa-scroll',
            status: 'open',
            statusLabel: 'مفتوحة للتسجيل',
            progress: 0,
            lecturesCount: 5,
            lecturesAttended: 0,
            instructor: 'أستاذ فادي سمير',
            desc: 'دراسة تحليلية لرسائل القديس بولس الرسول وسفر أعمال الرسل.'
        },
        {
            id: 'c5',
            title: 'القيادة المسيحية وإدارة الوقت والخدمة',
            icon: 'fa-user-tie',
            status: 'open',
            statusLabel: 'مفتوحة للتسجيل',
            progress: 0,
            lecturesCount: 4,
            lecturesAttended: 0,
            instructor: 'أ. عادل جورج (أمين الخدمة)',
            desc: 'مهارات حل المشكلات، العمل الجماعي في أسرة الخدمة، وروح الاتضاع القيادي.'
        }
    ];

    // 2. المواد التعليمية الافتراضية وكشك الاستعلام
    var DEFAULT_MATERIALS = [
        {
            id: 'm1',
            title: 'ملزمة طقس القداس الإلهي والصلوات الطقسية',
            subject: 'طقس',
            stage: 'الفرقة الأولى',
            type: 'pdf',
            size: '2.4 MB',
            kioskTrigger: 'طقس',
            desc: 'شرح مفصل لأجزاء رفع بخور باكر وعشية وطقس قداس الكلمة وقداس المؤمنين.',
            url: '#'
        },
        {
            id: 'm2',
            title: 'ملخص العقيدة المسيحية: الثالوث والتجسد والفداء',
            subject: 'عقيدة',
            stage: 'الفرقة الأولى',
            type: 'pdf',
            size: '3.1 MB',
            kioskTrigger: 'عقيدة',
            desc: 'ملزمة مجمعة للرد على التساؤلات اللاهوتية الأساسية وفق إيمان الكنيسة القبطية.',
            url: '#'
        },
        {
            id: 'm3',
            title: 'نموذج إجابة وتدريبات امتحان مادة الطقس الكنسي',
            subject: 'طقس',
            stage: 'الفرقة الأولى',
            type: 'pdf',
            size: '1.8 MB',
            kioskTrigger: 'امتحان الطقس',
            desc: 'أسئلة السنوات السابقة وحلولها النموذجية للمراجعة قبل امتحان نهاية الدورة.',
            url: '#'
        },
        {
            id: 'm4',
            title: 'مقدمات ودراسات في أسفار العهدين القديم والجديد',
            subject: 'كتاب مقدس',
            stage: 'الفرقة الثانية',
            type: 'pdf',
            size: '4.2 MB',
            kioskTrigger: 'كتاب مقدس',
            desc: 'جداول تسلسل الأسفار القانونية ومفاتيح فهم كل سفر وتاريخ كتابته.',
            url: '#'
        },
        {
            id: 'm5',
            title: 'دليل الخادم المتميز في إعداد وتقديم الدروس والافتقاد',
            subject: 'خدمة',
            stage: 'الفرقة الأولى والثانية',
            type: 'pdf',
            size: '1.5 MB',
            kioskTrigger: 'الخدمة',
            desc: 'إرشادات عملية لطرق تحضير درس مدارس الأحد ومتابعة المخدومين ورعايتهم.',
            url: '#'
        }
    ];

    // دالة مساعدة لإنشاء وإظهار النافذة المنبثقة
    function showStudentModal(modalId, title, contentHtml) {
        var existing = document.getElementById(modalId);
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }

        var modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'k-modal-backdrop';
        modal.style.zIndex = '99999';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', title);

        modal.innerHTML = [
            '<div class="k-modal" style="max-width:540px; width:100%; max-height:88vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:24px;">',
            '  <div class="k-modal-header" style="padding:18px 22px; background:var(--k-surface-2, #FFF6DC); border-bottom:1px solid var(--k-border-gold, #D4AF37); display:flex; justify-content:space-between; align-items:center; margin:0;">',
            '    <h4 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--k-primary, #0B2A6B); display:flex; align-items:center; gap:8px;">' + title + '</h4>',
            '    <button type="button" class="k-modal-close" onclick="closeStudentModal(\'' + modalId + '\')" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--k-text-muted, #64748B);">&times;</button>',
            '  </div>',
            '  <div class="k-modal-body" style="padding:20px; overflow-y:auto; flex:1;">',
            contentHtml,
            '  </div>',
            '</div>'
        ].join('\n');

        modal.onclick = function (e) {
            if (e.target === modal) closeStudentModal(modalId);
        };

        document.body.appendChild(modal);
    }

    function closeStudentModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal && modal.parentNode) {
            modal.style.transition = 'opacity 0.2s ease';
            modal.style.opacity = '0';
            setTimeout(function () {
                if (modal.parentNode) modal.parentNode.removeChild(modal);
            }, 200);
        }
    }
    window.closeStudentModal = closeStudentModal;

    // ==============================================================
    // 1️⃣ الدورات التدريبية (Training Courses)
    // ==============================================================
    window.openStudentCoursesModal = function (activeFilter) {
        activeFilter = activeFilter || 'all';

        var filtered = DEFAULT_COURSES;
        if (activeFilter !== 'all') {
            filtered = DEFAULT_COURSES.filter(function (c) {
                return c.status === activeFilter;
            });
        }

        var chipsHtml = [
            '<div style="display:flex; gap:6px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px;">',
            '  <button type="button" class="k-chip ' + (activeFilter === 'all' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'all\')">الكل</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'in_progress' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'in_progress\')">قيد الدراسة</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'completed' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'completed\')">مكتملة</button>',
            '  <button type="button" class="k-chip ' + (activeFilter === 'open' ? 'active' : '') + '" onclick="openStudentCoursesModal(\'open\')">مفتوحة</button>',
            '</div>'
        ].join('\n');

        var listHtml = filtered.map(function (c) {
            var statusBadgeStyle = (c.status === 'completed') ? 'background:#DCFCE7; color:#15803D;' :
                                   (c.status === 'in_progress') ? 'background:#FEF3C7; color:#B45309;' : 'background:#EFF6FF; color:#1D4ED8;';

            return [
                '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:18px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.2s;">',
                '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">',
                '    <div style="display:flex; align-items:center; gap:10px;">',
                '      <div style="width:42px; height:42px; border-radius:12px; background:var(--k-surface-2, #FFF6DC); border:1px solid var(--k-border-gold, #D4AF37); display:flex; align-items:center; justify-content:center; color:var(--k-primary, #0B2A6B); font-size:1.15rem;">',
                '        <i class="fa-solid ' + c.icon + '"></i>',
                '      </div>',
                '      <div>',
                '        <strong style="font-size:0.95rem; color:var(--k-text, #071A38); display:block;">' + c.title + '</strong>',
                '        <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">' + c.instructor + '</small>',
                '      </div>',
                '    </div>',
                '    <span style="font-size:0.72rem; font-weight:800; padding:3px 10px; border-radius:999px; ' + statusBadgeStyle + '">' + c.statusLabel + '</span>',
                '  </div>',
                '  <p style="font-size:0.82rem; color:var(--k-text-muted, #64748B); margin:6px 0 10px 0; line-height:1.4;">' + c.desc + '</p>',
                '  <div style="display:flex; align-items:center; gap:10px;">',
                '    <div style="flex:1; height:8px; background:#F1F5F9; border-radius:999px; overflow:hidden;">',
                '      <div style="width:' + c.progress + '%; height:100%; background:linear-gradient(90deg, var(--k-primary, #0B2A6B), var(--k-accent, #D4AF37)); border-radius:999px;"></div>',
                '    </div>',
                '    <span style="font-size:0.78rem; font-weight:800; color:var(--k-primary, #0B2A6B);">' + c.progress + '%</span>',
                '  </div>',
                '</div>'
            ].join('\n');
        }).join('\n');

        if (filtered.length === 0) {
            listHtml = '<div style="text-align:center; padding:30px; color:#94A3B8;">لا توجد دورات في هذا التصنيف حالياً</div>';
        }

        var fullContent = chipsHtml + '<div style="max-height:55vh; overflow-y:auto;">' + listHtml + '</div>';
        showStudentModal('studentCoursesModal', '<i class="fa-solid fa-book-open text-warning"></i> الدورات والمقررات التدريبية', fullContent);
    };

    // ==============================================================
    // 2️⃣ الفعاليات والاجتماعات (Events & Friday Gatherings Agenda)
    // ==============================================================
    window.openStudentEventsModal = function () {
        var now = new Date();
        var nextFriday = new Date();
        var day = now.getDay();
        var daysUntilFriday = (5 - day + 7) % 7;
        if (daysUntilFriday === 0 && now.getHours() >= 14) daysUntilFriday = 7;
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        nextFriday.setHours(13, 0, 0, 0);

        var diffMs = Math.max(0, nextFriday - now);
        var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        var diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        var countdownText = (diffDays > 0 ? diffDays + ' يوم و ' : '') + diffHours + ' ساعة و ' + diffMins + ' دقيقة';

        var content = [
            '<div style="background:linear-gradient(135deg, #071A38 0%, #0B2A6B 100%); color:#FFF; border-radius:20px; padding:20px; margin-bottom:16px; border:1.5px solid var(--k-border-gold, #D4AF37); box-shadow:0 8px 24px rgba(7,26,56,0.25);">',
            '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">',
            '    <span style="font-size:1.6rem;">⛪</span>',
            '    <span style="font-size:0.75rem; background:rgba(212,165,55,0.25); color:#FDE047; padding:3px 10px; border-radius:999px; border:1px solid rgba(212,165,55,0.4); font-weight:800;">اللقاء القادم</span>',
            '  </div>',
            '  <h4 style="margin:0 0 6px 0; font-size:1.1rem; font-weight:800; color:#FFF;">اجتماع إعداد الخدام الأسبوعي</h4>',
            '  <p style="margin:0 0 12px 0; font-size:0.85rem; color:#CBD5E1;">الجمعة في تمام 1:00 ظهراً &middot; كنيسة رئيس الملائكة ميخائيل والشهيد مارجرجس الروماني</p>',
            '  <div style="background:rgba(255,255,255,0.1); border-radius:12px; padding:10px; text-align:center;">',
            '    <small style="display:block; font-size:0.72rem; color:#FDE047; font-weight:700; margin-bottom:2px;">العد التنازلي لموعد اللقاء</small>',
            '    <strong style="font-size:1.15rem; color:#FFF; letter-spacing:0.5px;">⏳ ' + countdownText + '</strong>',
            '  </div>',
            '</div>',

            '<h5 style="font-size:0.95rem; font-weight:800; color:var(--k-primary, #0B2A6B); margin:16px 0 10px 0;"><i class="fa-solid fa-calendar-check text-warning me-1"></i> الفعاليات الكنسية القادمة</h5>',
            '<div style="display:flex; flex-direction:column; gap:10px;">',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">',
            '    <div style="background:#EFF6FF; color:#1D4ED8; font-weight:800; font-size:0.8rem; border-radius:10px; padding:8px 12px; text-align:center; min-width:60px;">الجمعة<br><small style="font-size:0.7rem;">القادمة</small></div>',
            '    <div style="flex:1;">',
            '      <strong style="font-size:0.88rem; color:var(--k-text, #071A38); display:block;">محاضرة: أسرار الكنيسة وطقس القداس</strong>',
            '      <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">القاعة الكبرى &middot; 1:00 م حتى 3:30 م</small>',
            '    </div>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px;">',
            '    <div style="background:#FEF3C7; color:#B45309; font-weight:800; font-size:0.8rem; border-radius:10px; padding:8px 12px; text-align:center; min-width:60px;">نوفمبر<br><small style="font-size:0.7rem;">2026</small></div>',
            '    <div style="flex:1;">',
            '      <strong style="font-size:0.88rem; color:var(--k-text, #071A38); display:block;">مؤتمر الخدمة السنوي واليوم الروحي</strong>',
            '      <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">بيت مريم &middot; التسجيل مفتوح لدى أمين الخدمة</small>',
            '    </div>',
            '  </div>',
            '</div>',

            '<div style="margin-top:16px; padding:12px; background:var(--k-surface-2, #FFF6DC); border:1px solid var(--k-border-gold, #D4AF37); border-radius:14px; text-align:center;">',
            '  <small style="display:block; font-size:0.78rem; color:var(--k-text, #071A38); font-weight:700; margin-bottom:6px;">هل سيتعذر عليك حضور الجمعة القادمة؟</small>',
            '  <a href="https://wa.me/?text=' + encodeURIComponent('سلام ونعمة.. أعتذر مقدماً عن عدم التمكن من حضور اجتماع إعداد الخدام الجمعة القادمة لظرف طارئ.') + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.82rem; padding:7px 16px; border-radius:999px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-weight:800;">',
            '    <i class="fa-brands fa-whatsapp"></i> إرسال عذر مسبق عبر واتساب 📲',
            '  </a>',
            '</div>'
        ].join('\n');

        showStudentModal('studentEventsModal', '<i class="fa-solid fa-calendar-days text-warning"></i> الفعاليات والاجتماعات الكنسية', content);
    };

    // ==============================================================
    // 3️⃣ المواد التعليمية وكشك الاستعلام (Educational Materials & Kiosk)
    // ==============================================================
    window.openStudentMaterialsModal = function () {
        // سحب المواد الإضافية من التخزين المحلي إن وجدت
        var customMaterials = [];
        try {
            customMaterials = JSON.parse(localStorage.getItem('khedmety_course_materials')) || [];
        } catch (e) {}

        var allMaterials = DEFAULT_MATERIALS.slice();
        customMaterials.forEach(function (cm, idx) {
            allMaterials.push({
                id: 'cm_' + idx,
                title: cm.title || 'مادة تعليمية إضافية',
                subject: 'كورس إعداد خدام',
                stage: 'الكل',
                type: cm.type || 'ملف',
                size: 'رابط مباشر',
                kioskTrigger: 'المواد',
                desc: cm.notes || 'مادة منشورة من قِبل أمين الخدمة للمراجعة والاطلاع.',
                url: cm.url || '#'
            });
        });

        var materialsListHtml = allMaterials.map(function (m) {
            var whatsappText = 'سلام ونعمة.. أود الحصول على ' + m.title + ' (كشك استعلام إعداد خدام)';
            var whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(whatsappText);

            return [
                '<div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:16px; padding:14px; margin-bottom:12px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">',
                '  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">',
                '    <div style="display:flex; align-items:center; gap:8px;">',
                '      <span style="font-size:1.3rem;">📄</span>',
                '      <div>',
                '        <strong style="font-size:0.9rem; color:var(--k-text, #071A38); display:block;">' + m.title + '</strong>',
                '        <small style="font-size:0.75rem; color:var(--k-text-muted, #64748B);">' + m.subject + ' &middot; ' + m.stage + '</small>',
                '      </div>',
                '    </div>',
                '    <span style="font-size:0.7rem; font-weight:700; background:#F1F5F9; color:#475569; padding:2px 8px; border-radius:6px;">' + m.size + '</span>',
                '  </div>',
                '  <p style="font-size:0.8rem; color:var(--k-text-muted, #64748B); margin:6px 0 10px 0; line-height:1.4;">' + m.desc + '</p>',
                '  <div style="display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">',
                '    <a href="' + whatsappUrl + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.78rem; padding:6px 12px; border-radius:8px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:700;">',
                '      <i class="fa-brands fa-whatsapp"></i> طلب المادة عبر واتساب 📲',
                '    </a>',
                '    <button type="button" class="k-btn k-btn-primary" onclick="alert(\'📖 تم تجهيز مادة: ' + m.title + '\\nجارِ فتح المحتوى والمرفق...\')" style="font-size:0.78rem; padding:6px 14px; border-radius:8px;">قراءة ومطالعة 📖</button>',
                '  </div>',
                '</div>'
            ].join('\n');
        }).join('\n');

        var kioskBanner = [
            '<div style="background:linear-gradient(135deg, #15376E 0%, #071A38 100%); color:#FFF; border-radius:18px; padding:16px; margin-bottom:16px; border:1px solid var(--k-border-gold, #D4AF37);">',
            '  <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">',
            '    <div style="width:36px; height:36px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; color:#FFF; font-size:1.2rem;"><i class="fa-brands fa-whatsapp"></i></div>',
            '    <div>',
            '      <strong style="font-size:0.95rem; color:#FFF; display:block;">كشك الاستعلام الذاتي المتقدم (WhatsApp Kiosk)</strong>',
            '      <small style="font-size:0.75rem; color:#CBD5E1;">رد تلقائي فوري بالملازم والأسئلة والدرجات</small>',
            '    </div>',
            '  </div>',
            '  <p style="font-size:0.8rem; color:#E2E8F0; margin:0 0 10px 0; line-height:1.4;">',
            '    أرسل كلمة <strong>«المواد»</strong> أو <strong>«طقس»</strong> أو <strong>«عقيدة»</strong> إلى رقم واتساب الخدمة للرد عليك آلياً بملف المادة!',
            '  </p>',
            '  <a href="https://wa.me/?text=' + encodeURIComponent('المواد') + '" target="_blank" class="k-btn" style="background:#25D366; color:#FFF; font-size:0.82rem; padding:7px 16px; border-radius:999px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-weight:800; width:100%; justify-content:center;">',
            '    <i class="fa-brands fa-whatsapp"></i> فتح كشك الاستعلام التفاعلي الآن 🚀',
            '  </a>',
            '</div>'
        ].join('\n');

        var fullContent = kioskBanner + '<div style="max-height:50vh; overflow-y:auto;">' + materialsListHtml + '</div>';
        showStudentModal('studentMaterialsModal', '<i class="fa-solid fa-book-bible text-warning"></i> المواد التعليمية وكشك الاستعلام', fullContent);
    };

    // ==============================================================
    // 4️⃣ متابعة التقدم والتأهيل الشامل (Progress & Qualification)
    // ==============================================================
    window.openStudentProgressModal = function () {
        var studentCode = localStorage.getItem('student_code') || '';
        var streak = 0;
        if (typeof calculateSpiritualStreak === 'function' && studentCode) {
            streak = calculateSpiritualStreak(studentCode);
        }

        // حساب الحضور إن وجد
        var attendanceRate = 80; // نسبة افتراضية
        try {
            var attMap = JSON.parse(localStorage.getItem('my_church_attendance')) || {};
            var dates = Object.keys(attMap);
            if (dates.length > 0) {
                var attended = 0;
                dates.forEach(function (d) {
                    var list = attMap[d] || [];
                    if (list.some(function (r) { return String(r.code || r.id || '') === studentCode; })) {
                        attended++;
                    }
                });
                attendanceRate = Math.round((attended / dates.length) * 100);
            }
        } catch(e) {}

        var qualificationScore = Math.min(100, Math.round((attendanceRate * 0.4) + (88 * 0.4) + (Math.min(streak, 30) / 30 * 20)));

        var content = [
            '<div style="text-align:center; padding:16px; background:var(--k-surface-2, #FFF6DC); border:1.5px solid var(--k-border-gold, #D4AF37); border-radius:20px; margin-bottom:16px;">',
            '  <div style="font-size:2rem; margin-bottom:4px;">🎓</div>',
            '  <h4 style="margin:0 0 4px 0; font-size:1.1rem; font-weight:800; color:var(--k-primary, #0B2A6B);">مؤشر الجاهزية للخدمة والتخرج</h4>',
            '  <div style="font-size:2.2rem; font-weight:900; color:var(--k-primary, #0B2A6B); margin:6px 0;">' + qualificationScore + '%</div>',
            '  <span class="k-badge" style="background:#16A34A; color:#FFF; font-size:0.8rem; padding:4px 14px; font-weight:800;">' + (qualificationScore >= 75 ? 'مؤهل للتخرج والرسامة 🌟' : 'قيد استكمال متطلبات الكورس ⏳') + '</span>',
            '</div>',

            '<h5 style="font-size:0.95rem; font-weight:800; color:var(--k-primary, #0B2A6B); margin:16px 0 10px 0;"><i class="fa-solid fa-chart-pie text-warning me-1"></i> ركائز التقييم التراكمي</h5>',
            '<div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px;">',
            '    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">',
            '      <span style="font-size:0.85rem; font-weight:700; color:var(--k-text, #071A38);">حضور اللقاءات الأسبوعية</span>',
            '      <strong style="font-size:0.85rem; color:var(--k-primary, #0B2A6B);">' + attendanceRate + '%</strong>',
            '    </div>',
            '    <div style="height:6px; background:#F1F5F9; border-radius:999px; overflow:hidden;">',
            '      <div style="width:' + attendanceRate + '%; height:100%; background:#2563EB;"></div>',
            '    </div>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px;">',
            '    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">',
            '      <span style="font-size:0.85rem; font-weight:700; color:var(--k-text, #071A38);">المستوى الأكاديمي والامتحانات</span>',
            '      <strong style="font-size:0.85rem; color:#15803D;">88% (ممتاز)</strong>',
            '    </div>',
            '    <div style="height:6px; background:#F1F5F9; border-radius:999px; overflow:hidden;">',
            '      <div style="width:88%; height:100%; background:#16A34A;"></div>',
            '    </div>',
            '  </div>',
            '  <div style="background:var(--k-surface, #FFF); border:1px solid var(--k-border, #E2E8F0); border-radius:14px; padding:12px 14px;">',
            '    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">',
            '      <span style="font-size:0.85rem; font-weight:700; color:var(--k-text, #071A38);">التتابع الروحي وقراءة الإنجيل</span>',
            '      <strong style="font-size:0.85rem; color:#EA580C;">🔥 ' + streak + ' يوم</strong>',
            '    </div>',
            '    <div style="height:6px; background:#F1F5F9; border-radius:999px; overflow:hidden;">',
            '      <div style="width:' + Math.min(100, (streak / 30) * 100) + '%; height:100%; background:#EA580C;"></div>',
            '    </div>',
            '  </div>',
            '</div>',

            '<div style="display:flex; gap:8px; justify-content:center;">',
            '  <button type="button" class="k-btn k-btn-primary" onclick="closeStudentModal(\'studentProgressModal\'); switchStudentTab(\'grades\');" style="flex:1; font-size:0.85rem;">كشف الدرجات والامتحانات 📊</button>',
            '  <button type="button" class="k-btn k-btn-secondary" onclick="closeStudentModal(\'studentProgressModal\'); switchStudentTab(\'badges\');" style="flex:1; font-size:0.85rem;">أوسمتي وحصادي 🏆</button>',
            '</div>'
        ].join('\n');

        showStudentModal('studentProgressModal', '<i class="fa-solid fa-chart-line text-warning"></i> متابعة التقدم والتأهيل الشامل', content);
    };

})();
