/**
 * public/js/interactive-simulation-guide.js
 * الدليل المحاكي التفاعلي لاستخدام منظومة خدمتي برو (Interactive Simulated Walkthrough Modal)
 * 
 * الميزات:
 * 1. أيقونة علامة استفهام ذهبية عائمة وأنيقة (❓) في زاوية الشاشة.
 * 2. نافذة محاكاة تفاعلية بصرية فائقة الشياكة (Sleek Liturgical Modal).
 * 3. خالية 100% من أي أسماء أشخاص أو كلمات سر، وتعتمد على محاكاة واقعية بالخطوات.
 * 4. خمس محطات محاكاة تفاعلية (تسجيل الدخول، رصد الحضور، رادار الافتقاد، قراءات الكتاب، المزامنة أوفلاين).
 * 5. متوافقة 100% مع كافة مقاسات الموبايل والديسك توب وتدعم اللمس والـ RTL.
 */

(function () {
    'use strict';

    // منع التكرار
    if (document.getElementById('khedmty-sim-guide-modal')) return;

    // حقن كود CSS الخاص بالدليل المحاكي
    const simStyle = document.createElement('style');
    simStyle.textContent = `
        .sim-floating-btn { display: none !important;
            position: fixed;
            bottom: 22px;
            right: 22px;
            z-index: 99990;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0c2461, #1e3799);
            color: #d4af37;
            border: 2px solid #c59b27;
            box-shadow: 0 8px 25px rgba(12, 36, 97, 0.45), 0 0 15px rgba(212, 175, 55, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.25s ease;
            user-select: none;
            direction: rtl;
        }
        .sim-floating-btn:hover {
            transform: scale(1.1) rotate(-8deg);
            box-shadow: 0 12px 30px rgba(12, 36, 97, 0.6), 0 0 20px rgba(212, 175, 55, 0.5);
            color: #ffffff;
            background: linear-gradient(135deg, #1e3799, #0984e3);
        }
        .sim-floating-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #e11d48;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 999px;
            border: 1.5px solid #fff;
        }
        .sim-modal-overlay, .sim-modal-card, .sim-modal-card * {
            box-sizing: border-box;
        }
        .sim-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(8, 26, 66, 0.82);
            backdrop-filter: blur(8px);
            z-index: 99995;
            display: none;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px;
            direction: rtl;
            font-family: 'Cairo', 'Tajawal', sans-serif;
            animation: simFadeIn 0.3s ease forwards;
        }
        @keyframes simFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .sim-modal-card {
            background: #ffffff;
            width: 100%;
            max-width: 820px;
            max-height: 90vh;
            border-radius: 24px;
            border: 2px solid #cbd5e1;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            margin: auto;
        }
        .sim-modal-header {
            background: linear-gradient(135deg, #091a44 0%, #0c2461 50%, #1e3799 100%);
            color: #ffffff;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #c59b27;
        }
        .sim-modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ffffff;
        }
        .sim-modal-header h2 span.cross {
            color: #d4af37;
            font-size: 1.5rem;
        }
        .sim-close-btn {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            transition: 0.2s;
        }
        .sim-close-btn:hover {
            background: #ef4444;
            border-color: #ef4444;
            transform: scale(1.05);
        }
        .sim-nav-tabs {
            display: flex;
            flex-wrap: wrap;
            background: #f8fafc;
            border-bottom: 1.5px solid #e2e8f0;
            padding: 8px 12px;
            gap: 6px;
            justify-content: center;
        }
        .sim-tab-btn {
            padding: 8px 14px;
            border-radius: 10px;
            background: transparent;
            border: 1.5px solid transparent;
            font-family: inherit;
            font-size: 0.84rem;
            font-weight: 700;
            color: #475569;
            cursor: pointer;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .sim-tab-btn:hover {
            background: #e2e8f0;
            color: #0c2461;
        }
        .sim-tab-btn.active {
            background: #ffffff;
            color: #0c2461;
            border-color: #c59b27;
            box-shadow: 0 4px 12px rgba(12, 36, 97, 0.08);
            font-weight: 900;
        }
        .sim-tab-btn.active span.icon {
            transform: scale(1.15);
        }
        .sim-modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }
        .sim-screen-card {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 18px;
            position: relative;
        }
        .sim-mock-box {
            background: #ffffff;
            border: 2px dashed #cbd5e1;
            border-radius: 16px;
            padding: 20px;
            margin-top: 14px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        }
        .sim-action-btn {
            background: linear-gradient(135deg, #0c2461, #1e3799);
            color: #ffffff;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 0.9rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
            box-shadow: 0 4px 12px rgba(12, 36, 97, 0.2);
            font-family: inherit;
        }
        .sim-action-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        .sim-pulse-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 800;
        }
        .sim-step-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .sim-step-indicator span.num {
            background: #c59b27;
            color: #ffffff;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        @media (max-width: 600px) {
            .sim-modal-overlay {
                padding: 12px 8px;
                align-items: flex-start;
            }
            .sim-modal-card {
                max-width: 100%;
                border-radius: 16px;
                max-height: 94vh;
                margin: 0 auto;
            }
            .sim-modal-header { padding: 12px 14px; }
            .sim-modal-header h2 { font-size: 0.95rem; }
            .sim-modal-header h2 span.cross { font-size: 1.2rem; }
            .sim-modal-body { padding: 14px 10px; }
            .sim-floating-btn { bottom: 84px; right: 16px; width: 48px; height: 48px; font-size: 20px; }
            .sim-nav-tabs {
                flex-wrap: nowrap;
                overflow-x: auto;
                justify-content: flex-start;
                padding: 6px 8px;
                scrollbar-width: none;
                -webkit-overflow-scrolling: touch;
            }
            .sim-nav-tabs::-webkit-scrollbar { display: none; }
            .sim-tab-btn { font-size: 0.76rem; padding: 6px 10px; flex-shrink: 0; }
            .sim-action-btn { width: 100%; justify-content: center; }
        }
    `;
    document.head.appendChild(simStyle);

    // حقن زر علامة الاستفهام العائم (فقط في الشاشات الرئيسية كالدخول، ومستثنى من صفحات الداشبورد ومركز المساعدة لمنع التكرار)
    const isHelpCenter = window.location.pathname.includes('servant_help.html') || window.location.pathname.includes('student_help.html');
    const isDashboard = window.location.pathname.includes('servant-dashboard.html') || window.location.pathname.includes('student.html') || window.location.pathname.includes('student-portal.html');
    let floatBtn = document.getElementById('simFloatingHelpBtn');
    if (!isHelpCenter && !isDashboard && !document.querySelector('.help-fab') && !floatBtn) {
        floatBtn = document.createElement('div');
        floatBtn.className = 'sim-floating-btn';
        floatBtn.id = 'simFloatingHelpBtn';
        floatBtn.title = 'الدليل المحاكي التفاعلي لمنظومة خدمتي برو';
        floatBtn.innerHTML = `
            <span>❓</span>
            <span class="sim-floating-badge">شرح</span>
        `;
        document.body.appendChild(floatBtn);
    }

    // حقن نافذة المودال التفاعلية
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'sim-modal-overlay';
    modalOverlay.id = 'khedmty-sim-guide-modal';
    modalOverlay.innerHTML = `
        <div class="sim-modal-card">
            <!-- Header -->
            <div class="sim-modal-header">
                <h2>
                    <span class="cross">☩</span>
                    <span>الدليل المحاكي التفاعلي | خدمتي برو</span>
                </h2>
                <div class="sim-close-btn" id="simCloseModalBtn" title="إغلاق">✕</div>
            </div>

            <!-- Tabs -->
            <div class="sim-nav-tabs">
                <button type="button" class="sim-tab-btn active" data-tab="login">
                    <span class="icon">🔐</span> الدخول والتثبيت
                </button>
                <button type="button" class="sim-tab-btn" data-tab="attendance">
                    <span class="icon">📷</span> تسجيل الحضور السريع
                </button>
                <button type="button" class="sim-tab-btn" data-tab="radar">
                    <span class="icon">🔴</span> رادار الافتقاد
                </button>
                <button type="button" class="sim-tab-btn" data-tab="bible">
                    <span class="icon">📖</span> متابعة الكتاب المقدس
                </button>
                <button type="button" class="sim-tab-btn" data-tab="offline">
                    <span class="icon">⚡</span> العمل أوفلاين والمزامنة
                </button>
            </div>

            <!-- Body Content -->
            <div class="sim-modal-body" id="simModalContentArea">
                <!-- Tab 1: Login -->
                <div class="sim-tab-panel" id="panel-login">
                    <div class="sim-step-indicator">
                        <span class="num">1</span>
                        <span>بوابة الدخول الموحدة وتثبيت تطبيق الموبايل PWA</span>
                    </div>
                    <div class="sim-screen-card">
                        <h4 style="margin:0 0 8px; color:#0c2461;">💡 كيف تدخل وتثبت التطبيق على هاتفك؟</h4>
                        <p style="margin:0; font-size:0.92rem; color:#475569; line-height:1.7;">
                            المنظومة تدعم الدخول الذكي لكل من <strong>الخدام</strong> و<strong>المخدومين</strong> عبر شاشة واحدة مريحة. بمجرد فتح الرابط، اضغط على خيارات المتصفح ثم <em>«إضافة للشاشة الرئيسية»</em> ليعمل معك كتطبيق مستقل بلا إنترنت.
                        </p>

                        <!-- Mock Interactive Box -->
                        <div class="sim-mock-box" style="text-align:center;">
                            <div style="font-size:0.85rem; font-weight:bold; color:#64748b; margin-bottom:12px;">تجربة محاكاة الدخول المباشر:</div>
                            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:14px;">
                                <button type="button" class="sim-action-btn" id="btnSimMockStudent" style="background:linear-gradient(135deg, #065f46, #047857);">
                                    🎓 محاكاة دخول مخدوم (بالكود والموبايل)
                                </button>
                                <button type="button" class="sim-action-btn" id="btnSimMockServant">
                                    📋 محاكاة دخول خادم (بالحساب المعتمد)
                                </button>
                            </div>
                            <div id="simMockLoginFeedback" style="display:none; padding:12px; border-radius:10px; font-size:0.9rem; font-weight:bold; animation:simFadeIn 0.3s ease;"></div>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Attendance -->
                <div class="sim-tab-panel" id="panel-attendance" style="display:none;">
                    <div class="sim-step-indicator">
                        <span class="num">2</span>
                        <span>رصد الحضور الميداني الفوري (كاميرا الـ QR والتحديد الجماعي)</span>
                    </div>
                    <div class="sim-screen-card">
                        <h4 style="margin:0 0 8px; color:#0c2461;">📷 رصد الحضور في جزء من الثانية (أوفلاين 100%)</h4>
                        <p style="margin:0; font-size:0.92rem; color:#475569; line-height:1.7;">
                            يوفر النظام طريقتين للرصد: مسح الكارنيه بكاميرا الموبايل الخلفية خلال 300 ملي ثانية فقط، أو فتح قائمة الأسماء والضغط على <strong>«تحديد الكل كحاضر»</strong> أو <strong>«عكس التحديد»</strong>.
                        </p>

                        <!-- Mock Interactive Attendance Box -->
                        <div class="sim-mock-box">
                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                                <span style="font-weight:bold; color:#0c2461;">كشف الحضور التجريبي:</span>
                                <div style="display:flex; gap:6px;">
                                    <button type="button" id="btnSimSelectAll" style="background:#10b981; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">تحديد الكل</button>
                                    <button type="button" id="btnSimInvert" style="background:#f59e0b; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">عكس التحديد</button>
                                </div>
                            </div>
                            <div id="simAttendanceMockList" style="display:flex; flex-direction:column; gap:8px;">
                                <div class="sim-att-row" data-id="1" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f1f5f9; border-radius:8px;">
                                    <span>ميشيل عاطف حبيب (كود 1042)</span>
                                    <span class="badge" style="background:#cbd5e1; color:#475569; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">غائب</span>
                                </div>
                                <div class="sim-att-row" data-id="2" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f1f5f9; border-radius:8px;">
                                    <span>مارينا ماجد كمال (كود 1043)</span>
                                    <span class="badge" style="background:#cbd5e1; color:#475569; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">غائب</span>
                                </div>
                                <div class="sim-att-row" data-id="3" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f1f5f9; border-radius:8px;">
                                    <span>بيشوي هاني رمزي (كود 1044)</span>
                                    <span class="badge" style="background:#cbd5e1; color:#475569; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">غائب</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Radar -->
                <div class="sim-tab-panel" id="panel-radar" style="display:none;">
                    <div class="sim-step-indicator">
                        <span class="num">3</span>
                        <span>رادار الافتقاد ومتابعة الغياب والإنذار المبكر</span>
                    </div>
                    <div class="sim-screen-card">
                        <h4 style="margin:0 0 8px; color:#0c2461;">🔴 تصنيف ذكي للمخدومين وتواصل فوري بالواتساب</h4>
                        <p style="margin:0; font-size:0.92rem; color:#475569; line-height:1.7;">
                            يقوم الرادار آلياً بفرز المخدومين: (اللون الأحمر للمنقطعين أسبوعين متتاليين أو مشكلة اعتراف معلقة — الأصفر للمتذبذبين — الأخضر للمنتظمين)، مع إمكانية فتح محادثة واتساب جاهزة بنقرة واحدة.
                        </p>

                        <!-- Mock Interactive Radar -->
                        <div class="sim-mock-box">
                            <div style="border-right: 4px solid #ef4444; background:#fff1f2; padding:12px; border-radius:8px; margin-bottom:10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <strong style="color:#991b1b;">كيرلس فادي نجيب</strong> (غائب جمعتين متتاليتين 🔴)
                                        <div style="font-size:12px; color:#64748b;">أب الاعتراف: محتاج متابعة</div>
                                    </div>
                                    <button type="button" id="btnSimMockWhatsApp" style="background:#25d366; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;">
                                        واتساب 💬
                                    </button>
                                </div>
                            </div>
                            <div id="simWhatsAppPreview" style="display:none; background:#ecfdf5; border:1px solid #a7f3d0; padding:12px; border-radius:10px; font-size:0.88rem; color:#065f46;">
                                🕊️ <strong>نص الرسالة التلقائي:</strong> "سلام ونعمة يا كيرلس.. افتقدناك في اجتماع إعداد الخدام الجمعة اللي فاتت، طمنا عليك ومستنيينك الجمعة الجاية بكل الفرح 🙏❤️"
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 4: Bible -->
                <div class="sim-tab-panel" id="panel-bible" style="display:none;">
                    <div class="sim-step-indicator">
                        <span class="num">4</span>
                        <span>متابعة قراءات الكتاب المقدس إصحاحاً بإصحاح</span>
                    </div>
                    <div class="sim-screen-card">
                        <h4 style="margin:0 0 8px; color:#0c2461;">📖 تجربة القراءة التفاعلية ونسبة الإنجاز الروحي</h4>
                        <p style="margin:0; font-size:0.92rem; color:#475569; line-height:1.7;">
                            يستطيع المخدوم تتبع كل إصحاح قرأه في العهدين القديم والجديد بنقرة واحدة؛ حيث يضيء الإصحاح بالأخضر ويرتفع مؤشر تقدمه تلقائياً.
                        </p>

                        <!-- Mock Interactive Bible -->
                        <div class="sim-mock-box">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem; font-weight:bold;">
                                <span>معدل إنجاز إنجيل متى:</span>
                                <span id="simBibleProgressText" style="color:#0c2461;">0% (0 / 4 إصحاحات)</span>
                            </div>
                            <div style="background:#e2e8f0; border-radius:999px; height:8px; overflow:hidden; margin-bottom:14px;">
                                <div id="simBibleProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #10b981, #059669); transition:width 0.3s ease;"></div>
                            </div>
                            <div style="display:flex; gap:8px; justify-content:center;">
                                <button type="button" class="sim-chapter-btn" data-ch="1" style="width:42px; height:42px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; font-weight:bold; cursor:pointer;">1</button>
                                <button type="button" class="sim-chapter-btn" data-ch="2" style="width:42px; height:42px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; font-weight:bold; cursor:pointer;">2</button>
                                <button type="button" class="sim-chapter-btn" data-ch="3" style="width:42px; height:42px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; font-weight:bold; cursor:pointer;">3</button>
                                <button type="button" class="sim-chapter-btn" data-ch="4" style="width:42px; height:42px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; font-weight:bold; cursor:pointer;">4</button>
                            </div>
                            <p style="text-align:center; font-size:11px; color:#64748b; margin-top:8px;">(اضغط على أرقام الإصحاحات أعلاه لتجربة التحول اللحظي ونمو النسبة)</p>
                        </div>
                    </div>
                </div>

                <!-- Tab 5: Offline -->
                <div class="sim-tab-panel" id="panel-offline" style="display:none;">
                    <div class="sim-step-indicator">
                        <span class="num">5</span>
                        <span>العمل أوفلاين التام وطابور المزامنة الخلفي (Offline-First)</span>
                    </div>
                    <div class="sim-screen-card">
                        <h4 style="margin:0 0 8px; color:#0c2461;">⚡ العمل بثقة مطلقة داخل الكنيسة أو القاعة</h4>
                        <p style="margin:0; font-size:0.92rem; color:#475569; line-height:1.7;">
                            سواء كانت شبكة الموبايل مقطوعة أو ضعيفة، يتم حفظ كل حركة حضور ودرجة في الذاكرة المحلية المشفرة (IndexedDB). وبمجرد استعادة الاتصال بالإنترنت، يقوم النظام برفع كافة التعديلات تلقائياً مع حل أي تعارضات زمنياً.
                        </p>

                        <!-- Mock Interactive Offline -->
                        <div class="sim-mock-box" style="text-align:center;">
                            <div id="simNetStatusBadge" style="display:inline-block; padding:6px 16px; border-radius:20px; font-weight:bold; font-size:13px; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; margin-bottom:12px;">
                                🟢 متصل بالإنترنت (كافة العمليات متزامنة)
                            </div>
                            <div style="display:flex; justify-content:center; gap:10px;">
                                <button type="button" id="btnSimToggleOffline" class="sim-action-btn" style="background:#e11d48;">
                                    محاكاة انقطاع الإنترنت 📡
                                </button>
                                <button type="button" id="btnSimSyncNow" class="sim-action-btn" style="background:#d97706; display:none;">
                                    محاكاة عودة النت والمزامنة 🔄
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    // ========================================================
    // إدارة أحداث التفاعل في المودال
    // ========================================================
    const modal = document.getElementById('khedmty-sim-guide-modal');
    const openBtn = document.getElementById('simFloatingHelpBtn');
    const closeBtn = document.getElementById('simCloseModalBtn');

    function openModal() {
        modal.style.display = 'flex';
    }
    function closeModal() {
        modal.style.display = 'none';
    }

    window.openSimGuideModal = openModal;
    window.closeSimGuideModal = closeModal;

    // فتح تلقائي في حال طلب الرابط ذلك
    if (window.location.search.includes('open_sim_guide=1') || window.location.hash === '#sim-guide') {
        setTimeout(openModal, 100);
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });

    // التنقل بين التبويبات
    const tabs = modal.querySelectorAll('.sim-tab-btn');
    const panels = modal.querySelectorAll('.sim-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.style.display = 'none');

            tab.classList.add('active');
            const targetId = 'panel-' + tab.getAttribute('data-tab');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.style.display = 'block';
        });
    });

    // تفاعل محاكاة الدخول
    const btnMockStd = document.getElementById('btnSimMockStudent');
    const btnMockSrv = document.getElementById('btnSimMockServant');
    const loginFeedback = document.getElementById('simMockLoginFeedback');

    if (btnMockStd) {
        btnMockStd.addEventListener('click', () => {
            loginFeedback.style.display = 'block';
            loginFeedback.style.background = '#ecfdf5';
            loginFeedback.style.color = '#065f46';
            loginFeedback.style.border = '1px solid #a7f3d0';
            loginFeedback.innerHTML = '✅ مرحباً بك! تم التحقق من كود الطالب ورقم هاتفه، وفُتحت البوابة الشخصية مع الكارنيه الذكي بنجاح!';
        });
    }
    if (btnMockSrv) {
        btnMockSrv.addEventListener('click', () => {
            loginFeedback.style.display = 'block';
            loginFeedback.style.background = '#eff6ff';
            loginFeedback.style.color = '#1e3a8a';
            loginFeedback.style.border = '1px solid #bfdbfe';
            loginFeedback.innerHTML = '✅ أهلاً يا خادم الرب! تم التحقق من حساب الخادم المعتمد وفتحت لوحة الكنترول ورصد الحضور بنجاح!';
        });
    }

    // تفاعل محاكاة الحضور
    const btnSelectAll = document.getElementById('btnSimSelectAll');
    const btnInvert = document.getElementById('btnSimInvert');
    const attRows = modal.querySelectorAll('.sim-att-row');

    function setAttState(row, isAttended) {
        const badge = row.querySelector('.badge');
        if (isAttended) {
            row.style.background = '#ecfdf5';
            badge.style.background = '#10b981';
            badge.style.color = '#ffffff';
            badge.textContent = 'حاضر ✔️';
        } else {
            row.style.background = '#f1f5f9';
            badge.style.background = '#cbd5e1';
            badge.style.color = '#475569';
            badge.textContent = 'غائب';
        }
    }

    if (btnSelectAll) {
        btnSelectAll.addEventListener('click', () => {
            attRows.forEach(r => setAttState(r, true));
        });
    }
    if (btnInvert) {
        btnInvert.addEventListener('click', () => {
            attRows.forEach(r => {
                const isCurrentlyAtt = r.querySelector('.badge').textContent.includes('حاضر');
                setAttState(r, !isCurrentlyAtt);
            });
        });
    }

    // تفاعل محاكاة الواتساب
    const btnMockWhatsApp = document.getElementById('btnSimMockWhatsApp');
    const waPreview = document.getElementById('simWhatsAppPreview');
    if (btnMockWhatsApp) {
        btnMockWhatsApp.addEventListener('click', () => {
            waPreview.style.display = waPreview.style.display === 'none' ? 'block' : 'none';
        });
    }

    // تفاعل محاكاة قراءات الكتاب المقدس
    const chButtons = modal.querySelectorAll('.sim-chapter-btn');
    const progText = document.getElementById('simBibleProgressText');
    const progBar = document.getElementById('simBibleProgressBar');
    let readChapters = new Set();

    chButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const ch = btn.getAttribute('data-ch');
            if (readChapters.has(ch)) {
                readChapters.delete(ch);
                btn.style.background = '#f8fafc';
                btn.style.color = '#000';
                btn.style.borderColor = '#cbd5e1';
            } else {
                readChapters.add(ch);
                btn.style.background = '#10b981';
                btn.style.color = '#fff';
                btn.style.borderColor = '#059669';
            }
            const pct = Math.round((readChapters.size / 4) * 100);
            progBar.style.width = pct + '%';
            progText.textContent = `${pct}% (${readChapters.size} / 4 إصحاحات)`;
        });
    });

    // تفاعل محاكاة الأوفلاين
    const netBadge = document.getElementById('simNetStatusBadge');
    const btnToggleOff = document.getElementById('btnSimToggleOffline');
    const btnSyncNow = document.getElementById('btnSimSyncNow');

    if (btnToggleOff) {
        btnToggleOff.addEventListener('click', () => {
            netBadge.style.background = '#1e293b';
            netBadge.style.color = '#fbbf24';
            netBadge.style.border = '1px solid #f59e0b';
            netBadge.innerHTML = '⚡ وضع عدم الاتصال (أوفلاين) — تم حفظ حركات الحضور في الأمان المحلي';
            btnToggleOff.style.display = 'none';
            btnSyncNow.style.display = 'inline-flex';
        });
    }
    if (btnSyncNow) {
        btnSyncNow.addEventListener('click', () => {
            netBadge.style.background = '#0c2461';
            netBadge.style.color = '#fff';
            netBadge.style.border = '1px solid #c59b27';
            netBadge.innerHTML = '🔄 جاري المزامنة مع السحابة...';
            setTimeout(() => {
                netBadge.style.background = '#ecfdf5';
                netBadge.style.color = '#065f46';
                netBadge.style.border = '1px solid #a7f3d0';
                netBadge.innerHTML = '✅ تمت المزامنة بنجاح 100% مع السحابة!';
                btnSyncNow.style.display = 'none';
                btnToggleOff.style.display = 'inline-flex';
            }, 1000);
        });
    }

    // تصدير دالة الفتح العامة في نافذة window
    window.openInteractiveSimGuide = openModal;

})();
