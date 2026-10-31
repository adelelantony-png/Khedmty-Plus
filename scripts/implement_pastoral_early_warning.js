/**
 * scripts/implement_pastoral_early_warning.js
 * تفعيل منظومة الإنذار المبكر الرعوي وتوجيه رسائل الواتساب الذكية في servant_followup.html
 */

const fs = require('fs');

const path = 'public/servant_followup.html';
let content = fs.readFileSync(path, 'utf8');

// 1. إضافة كروت الأنماط CSS
const additionalCSS = `
        .stat-card.c-purple .stat-num { color: #7c3aed; }
        .stat-card.c-purple .stat-icon { background: #f3e8ff; color: #7c3aed; }

        .stat-card.c-amber .stat-num { color: #d97706; }
        .stat-card.c-amber .stat-icon { background: #fef3c7; color: #d97706; }

        .triage-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 0.72rem;
            font-weight: 700;
        }
        .triage-confession {
            background: #f5f3ff;
            color: #6d28d9;
            border: 1px solid #ddd6fe;
        }
        .triage-bible {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }

        /* نافذة رسائل الواتساب الرعوية الذكية */
        .triage-template-card {
            border: 1.5px solid #e2e8f0;
            border-radius: 14px;
            padding: 12px 14px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #ffffff;
        }
        .triage-template-card:hover {
            border-color: #059669;
            background: #f0fdf4;
            transform: translateY(-2px);
        }
        .triage-template-card.recommended {
            border-color: #10b981;
            background: #f0fdf4;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.15);
        }
`;

if (!content.includes('triage-template-card')) {
    content = content.replace('</style>', `${additionalCSS}\n    </style>`);
}

// 2. تحديث شبكة الكروت الإحصائية لتضم 6 كروت بدلاً من 4
const oldStatsGrid = `<div class="stats-grid">
        <div class="stat-card c-all active-filter" id="cardFilterAll" onclick="applyQuickFilter('all')">
            <div class="stat-info">
                <h6>إجمالي المخدومين</h6>
                <div class="stat-num" id="statTotalMembers">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
        </div>

        <div class="stat-card c-danger" id="cardFilterDisconnected" onclick="applyQuickFilter('disconnected')">
            <div class="stat-info">
                <h6>منقطعون (3+ جمعات) 🚨</h6>
                <div class="stat-num" id="statDisconnected">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        </div>

        <div class="stat-card c-warn" id="cardFilterWarning" onclick="applyQuickFilter('warning')">
            <div class="stat-info">
                <h6>إنذار غياب (جمعتين) ⚠️</h6>
                <div class="stat-num" id="statWarning">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-bell"></i></div>
        </div>

        <div class="stat-card c-recent" id="cardFilterVisited" onclick="applyQuickFilter('visited')">
            <div class="stat-info">
                <h6>تم افتقادهم هذا الشهر ✔️</h6>
                <div class="stat-num" id="statVisitedThisMonth">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-check-double"></i></div>
        </div>
    </div>`;

const newStatsGrid = `<div class="stats-grid">
        <div class="stat-card c-all active-filter" id="cardFilterAll" onclick="applyQuickFilter('all')">
            <div class="stat-info">
                <h6>إجمالي المخدومين</h6>
                <div class="stat-num" id="statTotalMembers">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
        </div>

        <div class="stat-card c-danger" id="cardFilterDisconnected" onclick="applyQuickFilter('disconnected')">
            <div class="stat-info">
                <h6>منقطعون (3+ جمعات) 🚨</h6>
                <div class="stat-num" id="statDisconnected">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        </div>

        <div class="stat-card c-warn" id="cardFilterWarning" onclick="applyQuickFilter('warning')">
            <div class="stat-info">
                <h6>إنذار غياب (جمعتين) ⚠️</h6>
                <div class="stat-num" id="statWarning">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-bell"></i></div>
        </div>

        <div class="stat-card c-purple" id="cardFilterConfession" onclick="applyQuickFilter('confession_alert')">
            <div class="stat-info">
                <h6>إنذار سر الاعتراف 🕊️</h6>
                <div class="stat-num" id="statConfessionRisk">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-dove"></i></div>
        </div>

        <div class="stat-card c-amber" id="cardFilterBible" onclick="applyQuickFilter('bible_alert')">
            <div class="stat-info">
                <h6>إنذار قراءة الإنجيل 📖</h6>
                <div class="stat-num" id="statBibleRisk">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-book-bible"></i></div>
        </div>

        <div class="stat-card c-recent" id="cardFilterVisited" onclick="applyQuickFilter('visited')">
            <div class="stat-info">
                <h6>تم افتقادهم هذا الشهر ✔️</h6>
                <div class="stat-num" id="statVisitedThisMonth">0</div>
            </div>
            <div class="stat-icon"><i class="fa-solid fa-check-double"></i></div>
        </div>
    </div>`;

if (content.includes(oldStatsGrid)) {
    content = content.replace(oldStatsGrid, newStatsGrid);
}

// 3. إضافة الخيارات الجديدة في قائمة الفلترة
const oldStatusOptions = `<select class="filter-select" id="statusFilter" onchange="filterAndRender()">
                <option value="all">كل حالات المتابعة</option>
                <option value="disconnected">🚨 منقطعون (3 جمعات فأكثر)</option>
                <option value="warning">⚠️ غائب جمعتين فأكثر</option>`;

const newStatusOptions = `<select class="filter-select" id="statusFilter" onchange="filterAndRender()">
                <option value="all">كل حالات المتابعة الرعوية</option>
                <option value="disconnected">🚨 منقطعون (3 جمعات فأكثر)</option>
                <option value="warning">⚠️ إنذار غياب جمعتين</option>
                <option value="confession_alert">🕊️ إنذار سر الاعتراف (> 40 يوماً)</option>
                <option value="bible_alert">📖 إنذار قراءة الإنجيل (> 7 أيام)</option>`;

if (content.includes(oldStatusOptions)) {
    content = content.replace(oldStatusOptions, newStatusOptions);
}

// 4. نافذة رسائل الواتساب الرعوية الذكية (Smart WhatsApp Triage Modal)
const smartWaModalHtml = `
<!-- Modal: رسائل الواتساب الرعوية الذكية -->
<div class="custom-modal-backdrop" id="waTriageModalBackdrop">
    <div class="custom-modal-content" style="max-width: 560px;">
        <div class="modal-header-styled" style="background: linear-gradient(135deg, #065f46 0%, #047857 100%);">
            <h5><i class="fa-brands fa-whatsapp me-2"></i> توجيه رسالة رعوية ذكية</h5>
            <button class="modal-close-btn" onclick="closeWaTriageModal()">&times;</button>
        </div>
        <div class="modal-body-styled">
            <!-- كارت ملخص المخدوم -->
            <div class="p-3 rounded-4 mb-3" style="background: #f0fdf4; border: 1.5px solid #bbf7d0;">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-1 text-dark" id="triageStudentName">اسم المخدوم</h6>
                        <span class="text-muted small" id="triageStudentCode">#الكود</span>
                        <span class="badge bg-light text-dark border ms-2" id="triageStudentStage">المرحلة</span>
                    </div>
                    <div id="triageBadges" class="d-flex gap-1 flex-wrap"></div>
                </div>
            </div>

            <p class="text-muted small mb-2 fw-bold">اختر القالب الرعوي الأنسب للمخدوم للإرسال فوراً:</p>

            <!-- القوالب الرعوية -->
            <div class="triage-template-card" id="tplAbsence" onclick="sendTriageMessage('absence')">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-danger small"><i class="fa-solid fa-triangle-exclamation me-1"></i> قالب الغياب والاشتياق</strong>
                    <span class="badge bg-danger bg-opacity-10 text-danger" style="font-size:0.7rem;">حضور الجمعة</span>
                </div>
                <div class="small text-muted" id="previewAbsence" style="font-size:0.8rem; line-height:1.4;"></div>
            </div>

            <div class="triage-template-card" id="tplConfession" onclick="sendTriageMessage('confession')">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong style="color: #6d28d9; font-size: 0.85rem;"><i class="fa-solid fa-dove me-1"></i> قالب سر التوبة والاعتراف</strong>
                    <span class="badge" style="background:#f5f3ff; color:#6d28d9; font-size:0.7rem;">أب الاعتراف</span>
                </div>
                <div class="small text-muted" id="previewConfession" style="font-size:0.8rem; line-height:1.4;"></div>
            </div>

            <div class="triage-template-card" id="tplBible" onclick="sendTriageMessage('bible')">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong style="color: #b45309; font-size: 0.85rem;"><i class="fa-solid fa-book-bible me-1"></i> قالب تشجيع قراءة الإنجيل</strong>
                    <span class="badge" style="background:#fffbeb; color:#b45309; font-size:0.7rem;">كلمة الله</span>
                </div>
                <div class="small text-muted" id="previewBible" style="font-size:0.8rem; line-height:1.4;"></div>
            </div>

            <div class="triage-template-card" id="tplParent" onclick="sendTriageMessage('parent')">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-primary small"><i class="fa-solid fa-user-group me-1"></i> قالب المتابعة مع ولي الأمر</strong>
                    <span class="badge bg-primary bg-opacity-10 text-primary" style="font-size:0.7rem;">تنسيق البيت</span>
                </div>
                <div class="small text-muted" id="previewParent" style="font-size:0.8rem; line-height:1.4;"></div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
                <button type="button" class="btn btn-secondary btn-sm px-4 fw-bold" onclick="closeWaTriageModal()">إلغاء</button>
            </div>
        </div>
    </div>
</div>
`;

if (!content.includes('waTriageModalBackdrop')) {
    content = content.replace('<!-- Modal: تسجيل افتقاد جديد -->', `${smartWaModalHtml}\n<!-- Modal: تسجيل افتقاد جديد -->`);
}

// 5. استبدال دوال الحسابات والإحصاءات في JavaScript
const newHelperFunctions = `
    // حساب الأيام منذ آخر اعتراف مسجل
    function getDaysSinceConfession(sCode, member) {
        let lastConf = (member && (member.lastConfession || member.lastConfessionIso)) || '';
        if (!lastConf) {
            try {
                const raw = localStorage.getItem('khedmety_student_confession_' + sCode) || localStorage.getItem('khedmety_private_confession_' + sCode);
                if (raw) {
                    const p = JSON.parse(raw);
                    lastConf = p.date || p.iso || '';
                }
            } catch(e) {}
        }
        if (!lastConf) return 999;
        const d = new Date(lastConf);
        if (isNaN(d.getTime())) return 999;
        const diff = Date.now() - d.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    // حساب الأيام منذ آخر قراءة إنجيل مسجلة
    function getDaysSinceBibleReading(sCode) {
        try {
            const localReadings = JSON.parse(localStorage.getItem('khedmety_bible_readings')) || {};
            const keys = Object.keys(localReadings).filter(k => k.endsWith('_' + sCode));
            if (keys.length === 0) return 999;
            
            let latestTs = 0;
            const curYear = new Date().getFullYear();
            keys.forEach(k => {
                const item = localReadings[k];
                const hasRead = (item.completed_chapters && item.completed_chapters.length > 0) || item.completed || item.is_completed;
                if (hasRead && item.month && item.day) {
                    const logDate = new Date(curYear, item.month - 1, item.day);
                    if (!isNaN(logDate.getTime()) && logDate.getTime() > latestTs) {
                        latestTs = logDate.getTime();
                    }
                }
            });
            if (latestTs === 0) return 999;
            const diff = Date.now() - latestTs;
            return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        } catch(e) {
            return 999;
        }
    }
`;

// إدراج الدوال المساعدة قبل renderStats
if (!content.includes('function getDaysSinceConfession')) {
    content = content.replace('function renderStats()', `${newHelperFunctions}\n    function renderStats()`);
}

// تحديث renderStats لحساب وتحديث عدادات الإنذار المبكر
const oldRenderStats = `    function renderStats() {
        let total = allMembers.length;
        let disconnectedCount = 0;
        let warningCount = 0;
        let visitedCount = 0;

        allMembers.forEach(m => {
            const sCode = m.code || m.id;
            const streak = calculateConsecutiveAbsences(sCode);
            if (streak >= 3) disconnectedCount++;
            else if (streak === 2) warningCount++;

            if (isVisitedWithinDays(m.visitations, 30)) {
                visitedCount++;
            }
        });

        document.getElementById('statTotalMembers').textContent = total;
        document.getElementById('statDisconnected').textContent = disconnectedCount;
        document.getElementById('statWarning').textContent = warningCount;
        document.getElementById('statVisitedThisMonth').textContent = visitedCount;
    }`;

const newRenderStats = `    function renderStats() {
        let total = allMembers.length;
        let disconnectedCount = 0;
        let warningCount = 0;
        let visitedCount = 0;
        let confessionRiskCount = 0;
        let bibleRiskCount = 0;

        allMembers.forEach(m => {
            const sCode = String(m.code || m.id || '').trim();
            const streak = calculateConsecutiveAbsences(sCode);
            if (streak >= 3) disconnectedCount++;
            else if (streak === 2) warningCount++;

            const confDays = getDaysSinceConfession(sCode, m);
            if (confDays >= 40) confessionRiskCount++;

            const bibleDays = getDaysSinceBibleReading(sCode);
            if (bibleDays >= 7) bibleRiskCount++;

            if (isVisitedWithinDays(m.visitations, 30)) {
                visitedCount++;
            }
        });

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('statTotalMembers', total);
        setVal('statDisconnected', disconnectedCount);
        setVal('statWarning', warningCount);
        setVal('statConfessionRisk', confessionRiskCount);
        setVal('statBibleRisk', bibleRiskCount);
        setVal('statVisitedThisMonth', visitedCount);
    }`;

content = content.replace(oldRenderStats, newRenderStats);

// تحديث applyQuickFilter
const oldApplyQuickFilter = `    function applyQuickFilter(type) {
        activeQuickFilter = type;
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
        
        const cardMap = {
            'all': 'cardFilterAll',
            'disconnected': 'cardFilterDisconnected',
            'warning': 'cardFilterWarning',
            'visited': 'cardFilterVisited'
        };`;

const newApplyQuickFilter = `    function applyQuickFilter(type) {
        activeQuickFilter = type;
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
        
        const cardMap = {
            'all': 'cardFilterAll',
            'disconnected': 'cardFilterDisconnected',
            'warning': 'cardFilterWarning',
            'confession_alert': 'cardFilterConfession',
            'bible_alert': 'cardFilterBible',
            'visited': 'cardFilterVisited'
        };`;

content = content.replace(oldApplyQuickFilter, newApplyQuickFilter);

// تحديث filterAndRender لإثراء البيانات بشارات الإنذار وفلاتر الاعتراف والإنجيل
const oldEnrichedMapping = `            return {
                raw: m,
                id: m.id,
                code: sCode,
                name: sName,
                stage: sStage,
                phone: sPhone,
                parentPhone: sParentPhone,
                area: sArea,
                streak: streak,
                visitations: visitations,
                lastVisit: lastVisit,
                visitedRecently: visitedRecently
            };`;

const newEnrichedMapping = `            const confDays = getDaysSinceConfession(sCode, m);
            const bibleDays = getDaysSinceBibleReading(sCode);
            const confessionAlert = (confDays >= 40);
            const bibleAlert = (bibleDays >= 7);

            return {
                raw: m,
                id: m.id,
                code: sCode,
                name: sName,
                stage: sStage,
                phone: sPhone,
                parentPhone: sParentPhone,
                area: sArea,
                streak: streak,
                confDays: confDays,
                bibleDays: bibleDays,
                confessionAlert: confessionAlert,
                bibleAlert: bibleAlert,
                visitations: visitations,
                lastVisit: lastVisit,
                visitedRecently: visitedRecently
            };`;

content = content.replace(oldEnrichedMapping, newEnrichedMapping);

// تحديث شروط الفلترة
const oldFilterConditions = `        // 3. تطبيق فلتر الحالة
        if (activeQuickFilter === 'visited') {
            enriched = enriched.filter(item => item.visitedRecently);
        } else if (statusVal === 'disconnected') {
            enriched = enriched.filter(item => item.streak >= 3);
        } else if (statusVal === 'warning') {
            enriched = enriched.filter(item => item.streak >= 2);
        } else if (statusVal === 'last_friday') {
            enriched = enriched.filter(item => item.streak >= 1);
        } else if (statusVal === 'unvisited') {
            enriched = enriched.filter(item => item.visitations.length === 0 || !item.visitedRecently);
        } else if (statusVal === 'regular') {
            enriched = enriched.filter(item => item.streak === 0);
        }`;

const newFilterConditions = `        // 3. تطبيق فلتر الحالة والإنذار المبكر
        if (activeQuickFilter === 'visited') {
            enriched = enriched.filter(item => item.visitedRecently);
        } else if (activeQuickFilter === 'confession_alert' || statusVal === 'confession_alert') {
            enriched = enriched.filter(item => item.confessionAlert);
        } else if (activeQuickFilter === 'bible_alert' || statusVal === 'bible_alert') {
            enriched = enriched.filter(item => item.bibleAlert);
        } else if (activeQuickFilter === 'disconnected' || statusVal === 'disconnected') {
            enriched = enriched.filter(item => item.streak >= 3);
        } else if (activeQuickFilter === 'warning' || statusVal === 'warning') {
            enriched = enriched.filter(item => item.streak >= 2);
        } else if (statusVal === 'last_friday') {
            enriched = enriched.filter(item => item.streak >= 1);
        } else if (statusVal === 'unvisited') {
            enriched = enriched.filter(item => item.visitations.length === 0 || !item.visitedRecently);
        } else if (statusVal === 'regular') {
            enriched = enriched.filter(item => item.streak === 0);
        }`;

content = content.replace(oldFilterConditions, newFilterConditions);

// تحديث عرض الصفوف لتضمين شارات الإنذار وزر الواتساب الذكي
const oldRowGeneration = `            // أزرار التواصل
            let callButtons = [];
            if (item.phone) {
                callButtons.push(\`<a href="tel:\${escapeHtml(item.phone)}" class="btn-call" title="اتصال بالدارس"><i class="fa-solid fa-phone"></i> اتصال</a>\`);
                callButtons.push(\`<button type="button" class="btn-wa" onclick="openStudentWhatsApp('\${escapeHtml(item.phone)}', '\${escapeHtml(item.name)}')" title="واتساب مباشر"><i class="fa-brands fa-whatsapp"></i> واتساب</button>\`);
            }
            if (item.parentPhone && item.parentPhone !== item.phone) {
                callButtons.push(\`<a href="tel:\${escapeHtml(item.parentPhone)}" class="btn-call" style="background:#fdf2f8; color:#be185d; border-color:#fbcfe8;" title="اتصال بولي الأمر"><i class="fa-solid fa-user-group"></i> ولي الأمر</a>\`);
            }
            if (callButtons.length === 0) {
                callButtons.push('<span class="text-muted small">لا يوجد هاتف</span>');
            }`;

const newRowGeneration = `            // شارات الإنذار المبكر الرعوي
            let triageBadgesHtml = '';
            if (item.confessionAlert) {
                const txt = item.confDays > 365 ? 'متوقف' : \`\${item.confDays} يوم\`;
                triageBadgesHtml += \`<span class="triage-badge triage-confession" title="لم يسجل اعترافاً منذ \${item.confDays} يوماً"><i class="fa-solid fa-dove"></i> اعتراف (\${txt})</span> \`;
            }
            if (item.bibleAlert) {
                const bTxt = item.bibleDays > 365 ? 'متوقف' : \`\${item.bibleDays} يوم\`;
                triageBadgesHtml += \`<span class="triage-badge triage-bible" title="لم يقرأ إنجيل منذ \${item.bibleDays} يوماً"><i class="fa-solid fa-book-bible"></i> إنجيل (\${bTxt})</span> \`;
            }

            // أزرار التواصل السريع وتوجيه الواتساب الذكي
            let callButtons = [];
            if (item.phone) {
                callButtons.push(\`<a href="tel:\${escapeHtml(item.phone)}" class="btn-call" title="اتصال هاتفي"><i class="fa-solid fa-phone"></i> اتصال</a>\`);
                callButtons.push(\`<button type="button" class="btn-wa" onclick="openSmartWhatsAppModal('\${escapeHtml(item.code)}', '\${escapeHtml(item.name)}', '\${escapeHtml(item.phone)}', '\${escapeHtml(item.parentPhone)}', \${item.streak}, \${item.confDays}, \${item.bibleDays}, '\${escapeHtml(item.stage)}')" title="توجيه رسالة واتساب ذكية"><i class="fa-brands fa-whatsapp"></i> واتساب ذكي</button>\`);
            }
            if (item.parentPhone && item.parentPhone !== item.phone) {
                callButtons.push(\`<a href="tel:\${escapeHtml(item.parentPhone)}" class="btn-call" style="background:#fdf2f8; color:#be185d; border-color:#fbcfe8;" title="اتصال بولي الأمر"><i class="fa-solid fa-user-group"></i> ولي الأمر</a>\`);
            }
            if (callButtons.length === 0) {
                callButtons.push('<span class="text-muted small">لا يوجد هاتف</span>');
            }`;

content = content.replace(oldRowGeneration, newRowGeneration);

// إضافة شارات الإنذار أسفل شارة الغياب في الخلية
const oldStreakCell = `<td data-label="حالة الغياب">\${streakBadge}</td>`;
const newStreakCell = `<td data-label="حالة الغياب">\${streakBadge}\${triageBadgesHtml ? \`<div class="mt-1">\${triageBadgesHtml}</div>\` : ''}</td>`;
content = content.replace(oldStreakCell, newStreakCell);

// كود نافذة الواتساب الذكية بالكامل
const smartWaScript = `
    let currentTriage = null;

    // فتح نافذة توجيه رسائل الواتساب الذكية
    function openSmartWhatsAppModal(code, name, phone, parentPhone, streak, confDays, bibleDays, stage) {
        currentTriage = {
            code, name, phone, parentPhone, streak, confDays, bibleDays, stage
        };

        const cleanFirstName = (name || 'حبيبي').trim().split(' ')[0];

        // تعبئة بيانات المخدوم
        document.getElementById('triageStudentName').textContent = name;
        document.getElementById('triageStudentCode').textContent = '#' + code;
        document.getElementById('triageStudentStage').textContent = stage || 'المرحلة';

        // شارات الحالة
        const badgesContainer = document.getElementById('triageBadges');
        let bHtml = '';
        if (streak >= 2) bHtml += \`<span class="badge bg-danger"><i class="fa-solid fa-bell"></i> غائب \${streak} جمعات</span> \`;
        if (confDays >= 40) bHtml += \`<span class="badge" style="background:#7c3aed; color:#fff;"><i class="fa-solid fa-dove"></i> لم يعترف منذ \${confDays > 365 ? 'فترة' : confDays + ' يوم'}</span> \`;
        if (bibleDays >= 7) bHtml += \`<span class="badge bg-warning text-dark"><i class="fa-solid fa-book-bible"></i> متوقف عن الإنجيل</span>\`;
        badgesContainer.innerHTML = bHtml;

        // تجهيز نصوص القوالب
        const msgAbsence = \`سلام ونعمة يا \${cleanFirstName} الغالي، بنطمن عليك من كنيستك وأسرة إعداد خدام كنيسة القديس بولس الرسول. مفتقدينك جداً في اجتماع الجمعة وبنصلي تكون بكل خير وسلام، ومنتظرينك تفرحنا الجمعة القادمة بوجودك ❤️🕊️\`;
        const msgConfession = \`سلام ومحبة يا \${cleanFirstName} الحبيب، بنطمن عليك وعلى بركة جهادك الروحي. حابين نشجعك ترتب ميعاد جلسة اعتراف مع أبونا قريباً للتزود ببركة سر التوبة والتناول. الكنيسة وأبونا بصلواتهم معاك دائماً 🕊️✨\`;
        const msgBible = \`صباح البركة يا \${cleanFirstName} الغالي، حابين نشاركك آية اليوم: "سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي" (مز 119: 105). شجع قلبك اليوم واقرأ إصحاحات اليوم على منصة خدمتي وشاركنا بركتها 📖🌟\`;
        const msgParent = \`سلام ونعمة لحضرتك، بنطمن على \${cleanFirstName} من كنيسة القديس بولس الرسول (خدمة الشباب). بنحب نطمن عليه ونأكد على أهمية مواظبته وحضوره لاجتماع الجمعة لنموه الروحي. كل سنة وحضراتكم بكل خير وبركة ⛪❤️\`;

        document.getElementById('previewAbsence').textContent = msgAbsence;
        document.getElementById('previewConfession').textContent = msgConfession;
        document.getElementById('previewBible').textContent = msgBible;
        document.getElementById('previewParent').textContent = msgParent;

        // إبراز القالب الموصى به تلقائياً حسب الحالة الأكثر حرجاً
        document.querySelectorAll('.triage-template-card').forEach(c => c.classList.remove('recommended'));
        if (streak >= 2) {
            document.getElementById('tplAbsence').classList.add('recommended');
        } else if (confDays >= 40) {
            document.getElementById('tplConfession').classList.add('recommended');
        } else if (bibleDays >= 7) {
            document.getElementById('tplBible').classList.add('recommended');
        }

        document.getElementById('waTriageModalBackdrop').classList.add('show');
    }

    function closeWaTriageModal() {
        const modal = document.getElementById('waTriageModalBackdrop');
        if (modal) modal.classList.remove('show');
        currentTriage = null;
    }

    // إرسال الرسالة المحددة لواتساب
    function sendTriageMessage(type) {
        if (!currentTriage) return;
        const targetPhone = (type === 'parent' && currentTriage.parentPhone) ? currentTriage.parentPhone : currentTriage.phone;
        if (!targetPhone) return alert('لا يوجد رقم هاتف مسجل للمستلم.');

        let clean = targetPhone.replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) clean = '20' + clean.slice(1);
        else if (!clean.startsWith('20')) clean = '20' + clean;

        let msg = '';
        if (type === 'absence') msg = document.getElementById('previewAbsence').textContent;
        else if (type === 'confession') msg = document.getElementById('previewConfession').textContent;
        else if (type === 'bible') msg = document.getElementById('previewBible').textContent;
        else if (type === 'parent') msg = document.getElementById('previewParent').textContent;

        const url = \`https://wa.me/\${clean}?text=\${encodeURIComponent(msg)}\`;
        window.open(url, '_blank');
        closeWaTriageModal();
    }
`;

if (!content.includes('function openSmartWhatsAppModal')) {
    content = content.replace('// فتح واتساب برسالة اطمئنان مخصصة', `${smartWaScript}\n    // فتح واتساب برسالة اطمئنان مخصصة`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Successfully implemented Pastoral Early Warning System & Smart WhatsApp Triage in servant_followup.html!');
