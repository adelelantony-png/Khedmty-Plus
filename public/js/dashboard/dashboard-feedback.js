// =========================================================================
    // وحدة صندوق آراء ومقترحات المخدومين لقاء الجمعة (Feedback Hub)
    // =========================================================================
    let allServantFeedbackList = [];

    async function loadServantFeedback(forceSync = false) {
        const container = document.getElementById('feedbackCardsContainer');
        if (!container) return;

        // 1. القراءة الفورية من الكاش المحلي
        try {
            const cached = localStorage.getItem('khedmty_servants_feedback_cache');
            if (cached && !forceSync) {
                allServantFeedbackList = JSON.parse(cached);
                renderFeedbackCards(allServantFeedbackList);
            }
        } catch(e) {}

        // 2. الجلب السحابي من Firestore أو API
        try {
            let freshList = [];
            if (typeof db !== 'undefined' && db) {
                try {
                    const snap = await db.collection('feedback').limit(300).get();
                    if (snap && !snap.empty) {
                        snap.forEach(doc => freshList.push(Object.assign({ id: doc.id }, doc.data())));
                    }
                } catch(fsErr) {}
            }

            if (freshList.length === 0) {
                const fetchFn = (window.AuthClient && typeof AuthClient.fetch === 'function') ? AuthClient.fetch.bind(AuthClient) : fetch;
                const res = await fetchFn('/api/admin?action=get_feedback');
                if (res.ok) {
                    const data = await res.json();
                    if (data.feedback && Array.isArray(data.feedback)) {
                        freshList = data.feedback;
                    }
                }
            }

            if (freshList.length > 0) {
                // ترتيب تنازلي حسب التاريخ والوقت
                freshList.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
                allServantFeedbackList = freshList;
                try {
                    localStorage.setItem('khedmty_servants_feedback_cache', JSON.stringify(freshList));
                } catch(e) {}
                renderFeedbackCards(allServantFeedbackList);
            } else if (!allServantFeedbackList || allServantFeedbackList.length === 0) {
                container.innerHTML = '<div class="text-center p-4 text-muted fw-bold">لا توجد تقييمات أو مقترحات مسجلة حتى الآن من المخدومين.</div>';
            }
        } catch(err) {
            console.warn('Error loading servant feedback:', err);
            if (!allServantFeedbackList || allServantFeedbackList.length === 0) {
                container.innerHTML = '<div class="alert alert-warning text-center fw-bold">تعذر جلب الآراء من السحابة حالياً. تأكد من اتصال الإنترنت.</div>';
            }
        }
    }

    function renderFeedbackCards(list) {
        const container = document.getElementById('feedbackCardsContainer');
        if (!container) return;

        // تحديث أرقام الـ KPIs
        const total = list.length;
        document.getElementById('fbTotalCount').textContent = total;

        let sumRating = 0;
        let excellentCount = 0;
        let notesCount = 0;
        const fridaysSet = new Set();

        list.forEach(item => {
            const r = Number(item.rating || 0);
            sumRating += r;
            if (r === 5) excellentCount++;
            if (item.notes && item.notes.trim()) notesCount++;
            if (item.fridayDate) fridaysSet.add(item.fridayDate);
        });

        const avg = total > 0 ? (sumRating / total).toFixed(1) : '0.0';
        document.getElementById('fbAvgRating').textContent = `${avg} ⭐`;
        document.getElementById('fbExcellentCount').textContent = excellentCount;
        document.getElementById('fbNotesCount').textContent = notesCount;

        // تعبئة قائمة الجمعات
        const fridaySelect = document.getElementById('fbFridayFilter');
        if (fridaySelect) {
            const currentVal = fridaySelect.value;
            const fridays = Array.from(fridaysSet).sort().reverse();
            let opts = '<option value="all">كل الجمعات</option>';
            fridays.forEach(f => {
                opts += `<option value="${f}">جمعة ${f}</option>`;
            });
            fridaySelect.innerHTML = opts;
            if (fridaysSet.has(currentVal)) fridaySelect.value = currentVal;
        }

        filterFeedbackDisplay();
    }

    function filterFeedbackDisplay() {
        const container = document.getElementById('feedbackCardsContainer');
        if (!container) return;

        const ratingVal = document.getElementById('fbRatingFilter').value;
        const fridayVal = document.getElementById('fbFridayFilter').value;
        const searchVal = (document.getElementById('fbSearchInput').value || '').trim().toLowerCase();

        const filtered = allServantFeedbackList.filter(item => {
            let matchRating = true;
            if (ratingVal !== 'all') {
                matchRating = String(item.rating) === String(ratingVal);
            }

            let matchFriday = true;
            if (fridayVal !== 'all') {
                matchFriday = String(item.fridayDate) === String(fridayVal);
            }

            let matchSearch = true;
            if (searchVal) {
                const name = String(item.studentName || '').toLowerCase();
                const code = String(item.studentCode || '').toLowerCase();
                const notes = String(item.notes || '').toLowerCase();
                matchSearch = name.includes(searchVal) || code.includes(searchVal) || notes.includes(searchVal);
            }

            return matchRating && matchFriday && matchSearch;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center p-4 text-muted fw-bold">لا توجد آراء مطابقة لخيارات البحث المحددة.</div>';
            return;
        }

        const ratingLabels = {
            5: { text: '🌟 ممتاز', badgeClass: 'bg-success text-white' },
            4: { text: '👍 جيد جداً', badgeClass: 'bg-primary text-white' },
            3: { text: '😊 جيد', badgeClass: 'bg-info text-dark' },
            2: { text: '💡 يحتاج تطوير', badgeClass: 'bg-warning text-dark' }
        };

        container.innerHTML = filtered.map(item => {
            const r = item.rating || 5;
            const rInfo = ratingLabels[r] || { text: `${r} نجوم`, badgeClass: 'bg-secondary text-white' };
            const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
            const hasNotes = Boolean(item.notes && item.notes.trim());

            return `
                <div style="background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:16px; font-weight:900; color:var(--dark);">${item.studentName || 'دارس إعداد خدام'}</span>
                            <span class="badge bg-light text-dark border">كود: ${item.studentCode || '----'}</span>
                            <span class="badge ${rInfo.badgeClass}">${rInfo.text}</span>
                        </div>
                        <div style="font-size:12px; color:#64748b; font-weight:bold;">
                            <i class="fa-regular fa-calendar-days me-1"></i> جمعة: ${item.fridayDate || '----'}
                            ${timeStr ? `&nbsp;•&nbsp;<i class="fa-regular fa-clock me-1"></i> ${timeStr}` : ''}
                        </div>
                    </div>
                    ${hasNotes ? `
                        <div style="background:#f8fafc; border-right:4px solid var(--primary); padding:10px 14px; border-radius:6px; font-size:14px; color:#33415c; margin-top:8px;">
                            <i class="fa-solid fa-quote-right text-primary me-2"></i> ${item.notes}
                        </div>
                    ` : `
                        <div style="font-size:12px; color:#94a3b8; font-style:italic; margin-top:4px;">تقييم بدون مقترح مكتوب</div>
                    `}
                </div>
            `;
        }).join('');
    }

    function exportFeedbackToExcel() {
        if (!allServantFeedbackList || allServantFeedbackList.length === 0) {
            alert('لا توجد بيانات آراء لتصديرها.');
            return;
        }

        const ratingNames = { 5: 'ممتاز', 4: 'جيد جداً', 3: 'جيد', 2: 'يحتاج تطوير' };
        const headers = ['اسم المخدوم', 'كود الامتحان', 'تاريخ الجمعة', 'التقييم الرقمي', 'التقييم الوصفي', 'المقترح والملاحظات', 'تاريخ وتوقيت الإرسال'];
        const rows = [headers];

        allServantFeedbackList.forEach(item => {
            const r = item.rating || '';
            const rDesc = ratingNames[r] || '';
            rows.push([
                `"${(item.studentName || '').replace(/"/g, '""')}"`,
                `"${item.studentCode || ''}"`,
                `"${item.fridayDate || ''}"`,
                r,
                `"${rDesc}"`,
                `"${(item.notes || '').replace(/"/g, '""')}"`,
                `"${item.timestamp || ''}"`
            ]);
        });

        const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `كشف_آراء_وتقييمات_المخدومين_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==========================================
    // 🛡️ دوال الأمان لتفريغ السجلات والوضع التجريبي
    // ==========================================
    let currentPurgeType = 'activity';

    function openSafePurgeModal(type) {
        currentPurgeType = type;
        const modal = document.getElementById('safePurgeModal');
        const title = document.getElementById('purgeModalTitle');
        const desc = document.getElementById('purgeModalDesc');
        const input = document.getElementById('txtPurgeConfirmInput');
        if (input) input.value = '';

        if (type === 'activity') {
            if (title) title.textContent = 'تفريغ سجلات الحضور والنشاط الروحي';
            if (desc) desc.textContent = 'سيتم تصفير سجلات الحضور والغياب القديمة، وقراءات الإنجيل، والنوتة الروحية، وجلسات الاعتراف المسجلة بالكامل. ستظل أسماء الدارسين وبياناتهم الأساسية محفوظة بأمان.';
        } else {
            if (title) title.textContent = 'تهيئة شاملة لبدء دورة جديدة (Clean Slate)';
            if (desc) desc.textContent = 'تحذير شديد الأهمية: سيتم مسح كافة البيانات من حضور وأسماء طلاب ودرجات واعترافات للبدء من الصفر على شيت أبيض تماماً.';
        }

        if (modal) modal.style.display = 'flex';
    }

    function closeSafePurgeModal() {
        const modal = document.getElementById('safePurgeModal');
        if (modal) modal.style.display = 'none';
    }

    function executeSafePurgeAction() {
        const input = document.getElementById('txtPurgeConfirmInput');
        const val = (input ? input.value : '').trim();
        const normalized = val.replace(/[أإآ]/g, 'ا');
        if (normalized !== 'تاكيد المسح') {
            alert('يرجى كتابة عبارة "تأكيد المسح" باللغة العربية لتأكيد العملية.');
            return;
        }

        if (currentPurgeType === 'activity') {
            // تفريغ سجلات النشاط فقط
            localStorage.removeItem('my_church_attendance');
            localStorage.removeItem('khedmety_bible_readings');
            localStorage.removeItem('khedmety_student_spiritual');
            localStorage.removeItem('khedmety_servant_spiritual');
            localStorage.removeItem('khedmety_servant_spiritual_detailed');
            localStorage.removeItem('khedmety_self_reflections');
            localStorage.removeItem('khedmty_servants_feedback_cache');
            localStorage.removeItem('my_church_audit_logs');
            localStorage.removeItem('khedmety_audit_logs');
            if (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.AUDIT_LOGS) {
                localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
            }
            auditLogs = [];

            // إزالة مفاتيح الاعتراف الفردية
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('khedmety_student_confession_') || k.startsWith('khedmety_private_confession_')) {
                    localStorage.removeItem(k);
                }
            });

            // إعادة ضبط كائن الحضور المحلي
            attendanceRecord = {};
            alert('تم تفريغ جميع سجلات الحضور والنشاط الروحي بنجاح! تم البدء على سجلات حضور نقية تماماً ✅');
        } else {
            // تهيئة شاملة
            localStorage.removeItem('my_church_attendance');
            localStorage.removeItem('khedmety_bible_readings');
            localStorage.removeItem('khedmety_student_spiritual');
            localStorage.removeItem('khedmety_candidates_grades');
            localStorage.removeItem('khedmety_course_grades');
            localStorage.removeItem('my_church_class');
            localStorage.removeItem('my_church_members');
            localStorage.removeItem('my_church_audit_logs');
            localStorage.removeItem('khedmety_audit_logs');
            if (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.AUDIT_LOGS) {
                localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
            }
            auditLogs = [];

            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('khedmety_student_confession_') || k.startsWith('khedmety_private_confession_')) {
                    localStorage.removeItem(k);
                }
            });

            members = [];
            attendanceRecord = {};
            alert('تمت التهيئة الشاملة للنظام بنجاح لبدء سنة خدمية جديدة من الصفر! 🕊️');
        }

        closeSafePurgeModal();
        renderRadarDashboard();
        if (typeof render === 'function') render();
        setTimeout(() => location.reload(), 400);
    }

    // 🌟 الوضع التجريبي (Demo Mode)
    function toggleDemoMode() {
        const isDemoActive = localStorage.getItem('khedmety_demo_mode') === 'true';
        const btn = document.getElementById('btnToggleDemoMode');

        if (isDemoActive) {
            // إيقاف الوضع التجريبي وتطهير بياناته
            localStorage.removeItem('khedmety_demo_mode');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-toggle-off me-1"></i> تفعيل الوضع التجريبي';
            executeSafePurgeActionSilently();
            alert('تم إيقاف الوضع التجريبي واستعادة النظام النظيف بنجاح! 🟢');
        } else {
            // تفعيل الوضع التجريبي وتعبئة 5 مخدومين نموذجية
            localStorage.setItem('khedmety_demo_mode', 'true');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-toggle-on me-1 text-warning"></i> إيقاف الوضع التجريبي (نشط)';

            const sampleMembers = [
                { id: '101', code: '101', name: 'بيتر يوسف عادل', phone: '01221234567', stage: 'سنة أولى', gender: 'بنين', confessor: 'أبونا مرقس' },
                { id: '102', code: '102', name: 'مارينا رأفت كمال', phone: '01009876543', stage: 'سنة أولى', gender: 'بنات', confessor: 'أبونا يوحنا' },
                { id: '103', code: '103', name: 'كيرلس صموئيل نادي', phone: '01112223334', stage: 'سنة ثانية', gender: 'بنين', confessor: 'أبونا بولس' },
                { id: '104', code: '104', name: 'ساندرا مجدي فهيم', phone: '01287654321', stage: 'سنة ثانية', gender: 'بنات', confessor: 'أبونا ميخائيل' },
                { id: '105', code: '105', name: 'ديفيد جورج فؤاد', phone: '01555667788', stage: 'سنة أولى', gender: 'بنين', confessor: 'أبونا أنطونيوس' }
            ];
            localStorage.setItem('my_church_class', JSON.stringify(sampleMembers));

            // تسجيل حضور تجريبي للأسبوع الحالي
            const todayKey = new Date().toISOString().split('T')[0];
            const demoAttendance = {};
            demoAttendance[todayKey] = [
                { id: '101', code: '101', name: 'بيتر يوسف عادل', attended: true, communion: true },
                { id: '102', code: '102', name: 'مارينا رأفت كمال', attended: true, communion: true },
                { id: '103', code: '103', name: 'كيرلس صموئيل نادي', attended: true, communion: false },
                { id: '104', code: '104', name: 'ساندرا مجدي فهيم', attended: true, communion: true }
            ];
            localStorage.setItem('my_church_attendance', JSON.stringify(demoAttendance));

            alert('تم تفعيل الوضع التجريبي بنجاح! تم ملء 5 دارسين وسجل حضور نموذجي للاختبار والعرض 🧪');
        }
        location.reload();
    }

    function executeSafePurgeActionSilently() {
        localStorage.removeItem('my_church_attendance');
        localStorage.removeItem('khedmety_bible_readings');
        localStorage.removeItem('khedmety_student_spiritual');
        localStorage.removeItem('my_church_class');
    }

    // ========================================================
    // 🎯 محرك معايير البونص ونقاط التشجيع (Incentive & Bonus Engine)
    // ========================================================
    const BONUS_STORAGE_KEY = 'khedmety_bonus_settings';

    function getBonusSettings() {
        const defaultSettings = {
            isBonusVisibleToStudents: false,
            defaultRules: {
                fridayPoints: 10,
                extraDayPoints: 15,
                communionBonus: 5,
                earlyArrivalBonus: 5
            },
            customPeriods: []
        };
        try {
            const raw = localStorage.getItem(BONUS_STORAGE_KEY);
            if (!raw) return defaultSettings;
            const parsed = JSON.parse(raw);
            return {
                isBonusVisibleToStudents: Boolean(parsed.isBonusVisibleToStudents),
                defaultRules: Object.assign({}, defaultSettings.defaultRules, parsed.defaultRules || {}),
                customPeriods: Array.isArray(parsed.customPeriods) ? parsed.customPeriods : []
            };
        } catch (e) {
            return defaultSettings;
        }
    }

    function saveBonusSettings(settings) {
        localStorage.setItem(BONUS_STORAGE_KEY, JSON.stringify(settings));
        if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
            fsdb.collection('settings').doc('bonus_engine').set(settings, { merge: true }).catch(() => {});
        }
    }

    function getEffectiveBonusRule(dateStr) {
        const settings = getBonusSettings();
        if (!dateStr) return settings.defaultRules;
        const target = new Date(dateStr + 'T00:00:00');
        const activePeriod = settings.customPeriods.find(p => {
            if (!p.isActive) return false;
            const s = new Date(p.startDate + 'T00:00:00');
            const e = new Date(p.endDate + 'T23:59:59');
            return target >= s && target <= e;
        });

        if (activePeriod) {
            return {
                fridayPoints: Number(activePeriod.fridayPoints) || settings.defaultRules.fridayPoints,
                extraDayPoints: Number(activePeriod.extraDayPoints) || settings.defaultRules.extraDayPoints,
                communionBonus: settings.defaultRules.communionBonus,
                earlyArrivalBonus: settings.defaultRules.earlyArrivalBonus,
                examBonusPoints: Number(activePeriod.examBonusPoints) || 0,
                periodName: activePeriod.title
            };
        }
        return settings.defaultRules;
    }

    function calculateBonusPointsForDate(dateStr, isFriday, isCommunion, isEarly) {
        const rule = getEffectiveBonusRule(dateStr);
        let pts = isFriday ? (Number(rule.fridayPoints) || 10) : (Number(rule.extraDayPoints) || 15);
        if (isCommunion) pts += (Number(rule.communionBonus) || 5);
        if (isEarly) pts += (Number(rule.earlyArrivalBonus) || 5);
        return pts;
    }

    function toggleBonusStudentVisibility() {
        const settings = getBonusSettings();
        settings.isBonusVisibleToStudents = !settings.isBonusVisibleToStudents;
        saveBonusSettings(settings);
        renderBonusSettingsUI();
        if (typeof showToast === 'function') {
            showToast(settings.isBonusVisibleToStudents ? 
                "🔓 أصبحت نقاط البونص معلنة ومتاحة لجميع المخدومين في بواباتهم!" : 
                "🔒 تم حجب نقاط البونص وترتيب الأوائل عن المخدومين بأمان!");
        } else {
            alert(settings.isBonusVisibleToStudents ? "🔓 تم إعلان النقاط للمخدومين" : "🔒 تم حجب النقاط عن المخدومين");
        }
    }

    function saveBaseBonusRules() {
        const settings = getBonusSettings();
        settings.defaultRules.fridayPoints = Math.max(0, parseInt(document.getElementById('bonusBaseFridayPts').value) || 10);
        settings.defaultRules.extraDayPoints = Math.max(0, parseInt(document.getElementById('bonusBaseExtraPts').value) || 15);
        settings.defaultRules.communionBonus = Math.max(0, parseInt(document.getElementById('bonusBaseCommunionPts').value) || 5);
        settings.defaultRules.earlyArrivalBonus = Math.max(0, parseInt(document.getElementById('bonusBaseEarlyPts').value) || 5);
        saveBonusSettings(settings);
        if (typeof showToast === 'function') showToast("✅ تم حفظ معايير البونص الأساسية بنجاح!");
        else alert("✅ تم حفظ معايير البونص الأساسية بنجاح!");
    }

    function addNewBonusPeriodAction() {
        const title = (document.getElementById('newPeriodTitle').value || '').trim();
        const start = document.getElementById('newPeriodStartDate').value;
        const end = document.getElementById('newPeriodEndDate').value;
        const friPts = parseInt(document.getElementById('newPeriodFriPts').value) || 0;
        const extraPts = parseInt(document.getElementById('newPeriodExtraPts').value) || 0;
        const examPts = parseInt(document.getElementById('newPeriodExamPts').value) || 0;

        if (!title) return alert("يرجى إدخال مسمى الفترة (مثال: فترة الصوم الكبير).");
        if (!start || !end) return alert("يرجى تحديد تاريخ البداية وتاريخ النهاية.");
        if (start > end) return alert("تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.");

        const settings = getBonusSettings();
        const newPeriod = {
            id: 'period_' + Date.now(),
            title: title,
            startDate: start,
            endDate: end,
            fridayPoints: friPts,
            extraDayPoints: extraPts,
            examBonusPoints: examPts,
            isActive: true
        };

        settings.customPeriods.push(newPeriod);
        saveBonusSettings(settings);

        document.getElementById('newPeriodTitle').value = '';
        document.getElementById('newPeriodStartDate').value = '';
        document.getElementById('newPeriodEndDate').value = '';

        renderBonusSettingsUI();
        if (typeof showToast === 'function') showToast("✅ تمت إضافة الفترة الزمنية المخصصة بنجاح!");
        else alert("✅ تمت إضافة الفترة بنجاح!");
    }

    function deleteBonusPeriodAction(id) {
        if (!confirm("هل أنت متأكد من حذف هذه الفترة المخصصة؟")) return;
        const settings = getBonusSettings();
        settings.customPeriods = settings.customPeriods.filter(p => p.id !== id);
        saveBonusSettings(settings);
        renderBonusSettingsUI();
    }

    function toggleBonusPeriodActiveAction(id) {
        const settings = getBonusSettings();
        const p = settings.customPeriods.find(x => x.id === id);
        if (p) {
            p.isActive = !p.isActive;
            saveBonusSettings(settings);
            renderBonusSettingsUI();
        }
    }

    function renderBonusSettingsUI() {
        const settings = getBonusSettings();
        const badge = document.getElementById('bonusPublishStatusBadge');
        const btn = document.getElementById('btnToggleBonusVisibility');
        if (badge) {
            if (settings.isBonusVisibleToStudents) {
                badge.innerHTML = '<i class="fa-solid fa-lock-open me-1"></i> معلن للمخدومين 📢';
                badge.style.color = '#15803d';
            } else {
                badge.innerHTML = '<i class="fa-solid fa-lock me-1"></i> محجوب عن المخدومين 🔒';
                badge.style.color = '#dc2626';
            }
        }
        if (btn) {
            btn.textContent = settings.isBonusVisibleToStudents ? 'حجب النقاط الآن' : 'إعلان النقاط للمخدومين';
            btn.style.background = settings.isBonusVisibleToStudents ? '#dc2626' : '#15803d';
        }

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        setVal('bonusBaseFridayPts', settings.defaultRules.fridayPoints);
        setVal('bonusBaseExtraPts', settings.defaultRules.extraDayPoints);
        setVal('bonusBaseCommunionPts', settings.defaultRules.communionBonus);
        setVal('bonusBaseEarlyPts', settings.defaultRules.earlyArrivalBonus);

        const tbody = document.getElementById('bonusPeriodsTableBody');
        if (tbody) {
            if (settings.customPeriods.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="padding:15px; color:#94a3b8;">لا توجد فترات مخصصة مسجلة حالياً.. يتم تطبيق المعايير الأساسية.</td></tr>';
            } else {
                tbody.innerHTML = settings.customPeriods.map(p => `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="font-weight:bold; color:#0f172a;">${escapeHtml(p.title)}</td>
                        <td>${escapeHtml(p.startDate)}</td>
                        <td>${escapeHtml(p.endDate)}</td>
                        <td><span class="badge" style="background:#dbeafe; color:#1e40af;">${p.fridayPoints} نقطة</span></td>
                        <td><span class="badge" style="background:#fef3c7; color:#92400e;">${p.extraDayPoints} نقطة</span></td>
                        <td><span class="badge" style="background:#f3e8ff; color:#6b21a8;">+${p.examBonusPoints}</span></td>
                        <td>
                            <span class="badge" style="background:${p.isActive ? '#dcfce7; color:#15803d;' : '#fee2e2; color:#b91c1c;'}">
                                ${p.isActive ? 'مفعلة' : 'معطلة'}
                            </span>
                        </td>
                        <td>
                            <button type="button" onclick="toggleBonusPeriodActiveAction('${p.id}')" style="background:#f1f5f9; border:1px solid #cbd5e1; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:0.75rem; margin-left:4px;">
                                ${p.isActive ? 'تعطيل' : 'تفعيل'}
                            </button>
                            <button type="button" onclick="deleteBonusPeriodAction('${p.id}')" style="background:#fee2e2; color:#b91c1c; border:none; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:0.75rem;">
                                حذف
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }

// ========================================================
// 🏕️ محرك تخفيضات ومكافآت المؤتمر السنوي 2026 (Conference Incentive Engine)
// ========================================================
const CONFERENCE_STORAGE_KEY = 'khedmety_conference_settings';

function getConferenceSettings() {
    const defaultSettings = {
        conferenceBaseFee: 800,
        activationDate: "2026-05-29",
        isDiscountPublished: false,
        attendanceRules: {
            fridayDiscount: 10,
            summerDiscount: 15,
            applyMultiplier: true,
            multiplierFactor: 2,
            minimumAttendanceDiscount: 100
        },
        examRules: {
            stage1: {
                name: "الفرقة الأولى (٣ امتحانات)",
                tier90: 100,
                tier80: 50,
                tier65: 30
            },
            stage2: {
                name: "الفرقة الثانية (امتحانين)",
                tier90: 150,
                tier80: 75,
                tier65: 45
            }
        }
    };
    try {
        const raw = localStorage.getItem(CONFERENCE_STORAGE_KEY);
        if (!raw) return defaultSettings;
        const parsed = JSON.parse(raw);
        return {
            conferenceBaseFee: Number(parsed.conferenceBaseFee) || defaultSettings.conferenceBaseFee,
            activationDate: parsed.activationDate || defaultSettings.activationDate,
            isDiscountPublished: Boolean(parsed.isDiscountPublished),
            attendanceRules: Object.assign({}, defaultSettings.attendanceRules, parsed.attendanceRules || {}),
            examRules: {
                stage1: Object.assign({}, defaultSettings.examRules.stage1, (parsed.examRules && parsed.examRules.stage1) || {}),
                stage2: Object.assign({}, defaultSettings.examRules.stage2, (parsed.examRules && parsed.examRules.stage2) || {})
            }
        };
    } catch(e) {
        return defaultSettings;
    }
}

function saveConferenceSettings(settings) {
    localStorage.setItem(CONFERENCE_STORAGE_KEY, JSON.stringify(settings));
    if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
        fsdb.collection('settings').doc('conference_discounts').set(settings, { merge: true }).catch(() => {});
    }
}

function getExamTierDiscountVal(scorePct, tierConfig) {
    if (scorePct >= 90) return Number(tierConfig.tier90) || 0;
    if (scorePct >= 80) return Number(tierConfig.tier80) || 0;
    if (scorePct >= 65) return Number(tierConfig.tier65) || 0;
    return 0;
}

function calculateStudentConferenceDiscount(student, attendanceRecord, candidatesGrades, settings) {
    const sCode = String(student.code || student.id || '').trim();
    const sId = String(student.id || '').trim();
    const sName = String(student.name || 'مخدوم').trim();

    // 1. تحديد الفرقة الدراسية وقواعدها
    const rawStage = String(student.stage || student.level || '').toLowerCase();
    const isStage2 = rawStage.includes('ثانية') || rawStage.includes('ثانيه') || rawStage.includes('2') || rawStage.includes('second');
    const stageName = isStage2 ? 'الفرقة الثانية' : 'الفرقة الأولى';
    const tierConfig = isStage2 ? settings.examRules.stage2 : settings.examRules.stage1;
    const expectedExamCount = Math.max(1, parseInt(tierConfig.examCount) || (isStage2 ? 2 : 3));

    // 2. احتساب الحضور والالتزام
    let fridayCount = 0;
    let summerCount = 0;
    if (attendanceRecord && typeof attendanceRecord === 'object') {
        Object.keys(attendanceRecord).forEach(dateStr => {
            const list = attendanceRecord[dateStr] || [];
            const attended = list.some(a => {
                if (a.isAbsentDueToDelay) return false;
                const aCode = String(a.code || a.id || '').trim();
                const aId = String(a.id || '').trim();
                return (sCode && aCode === sCode) || (sId && aId === sId);
            });
            if (attended) {
                const d = new Date(dateStr);
                if (d.getDay() === 5) fridayCount++;
                else summerCount++;
            }
        });
    }

    const totalSessions = fridayCount + summerCount;
    const fridayRate = Number(settings.attendanceRules.fridayDiscount) || 10;
    const summerRate = Number(settings.attendanceRules.summerDiscount) || 15;
    let rawAttDiscount = (fridayCount * fridayRate) + (summerCount * summerRate);

    const applyMultiplier = settings.attendanceRules.applyMultiplier !== false;
    const factor = applyMultiplier ? (Number(settings.attendanceRules.multiplierFactor) || 2) : 1;
    rawAttDiscount = rawAttDiscount * factor;

    const minFloor = Number(settings.attendanceRules.minimumAttendanceDiscount) || 100;
    const attendanceDiscount = totalSessions > 0 ? Math.max(minFloor, rawAttDiscount) : 0;

    // 3. درجات الامتحانات وشرائح التفوق
    let cand = null;
    if (Array.isArray(candidatesGrades)) {
        cand = candidatesGrades.find(c => {
            const cCode = String(c.code || c.id || '').trim();
            const cId = String(c.id || '').trim();
            const cName = String(c.name || '').trim();
            return (sCode && cCode === sCode) || (sId && cId === sId) || (cName && cName === sName);
        });
    }

    let examDiscount = 0;
    let examPct = 0;

    if (cand) {
        const gScores = [];
        if (cand.g1 != null && cand.g1 !== '') gScores.push(Number(cand.g1));
        if (cand.g2 != null && cand.g2 !== '') gScores.push(Number(cand.g2));
        if (cand.g3 != null && cand.g3 !== '' && !isStage2) gScores.push(Number(cand.g3));

        if (gScores.length > 0) {
            const examMax = Number(cand.examMax) || 100;
            gScores.forEach(sc => {
                const p = examMax > 0 ? (sc / examMax) * 100 : 0;
                examDiscount += getExamTierDiscountVal(p, tierConfig);
            });
            const totalSum = gScores.reduce((a, b) => a + b, 0);
            examPct = (totalSum / (gScores.length * examMax)) * 100;
        } else {
            let rawPct = cand.pct != null ? Number(cand.pct) : (cand.percentage != null ? Number(cand.percentage) : 0);
            if (!rawPct && cand.total != null && cand.maxTotalScore) {
                rawPct = (Number(cand.total) / Number(cand.maxTotalScore)) * 100;
            }
            examPct = rawPct;
            const singleExamDisc = getExamTierDiscountVal(examPct, tierConfig);
            examDiscount = singleExamDisc * expectedExamCount;
        }
    }

    // 4. إجمالي الخصم الديناميكي (بدون سقف جامد ومصطنع!)
    const totalDiscount = attendanceDiscount + examDiscount;
    const baseFee = Number(settings.conferenceBaseFee) || 800;
    const netPayable = Math.max(0, baseFee - totalDiscount);

    return {
        code: sCode,
        name: sName,
        stage: stageName,
        isStage2: isStage2,
        phone: student.phone || (cand ? cand.phone : '') || '',
        fridayCount: fridayCount,
        summerCount: summerCount,
        totalSessions: totalSessions,
        rawAttDiscount: rawAttDiscount,
        attendanceDiscount: attendanceDiscount,
        examPct: Number(examPct.toFixed(1)),
        examDiscount: examDiscount,
        totalDiscount: totalDiscount,
        baseFee: baseFee,
        netPayable: netPayable
    };
}

function computeConferenceLedgerData() {
    const settings = getConferenceSettings();
    let members = [];
    try {
        members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS)) || [];
    } catch(e) { members = []; }

    let attendanceRecord = {};
    try {
        attendanceRecord = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || {};
    } catch(e) { attendanceRecord = {}; }

    let candidatesGrades = [];
    try {
        candidatesGrades = JSON.parse(localStorage.getItem('khedmety_candidates_grades')) || 
                           JSON.parse(localStorage.getItem('khedmety_new_applicants_grades')) || [];
    } catch(e) { candidatesGrades = []; }

    const rows = members.map(m => calculateStudentConferenceDiscount(m, attendanceRecord, candidatesGrades, settings));

    // حساب المؤشرات العامة (KPIs)
    const highestDiscount = rows.length > 0 ? Math.max(...rows.map(r => r.totalDiscount)) : 0;
    const topRow = rows.find(r => r.totalDiscount === highestDiscount && highestDiscount > 0);
    const totalSubsidy = rows.reduce((acc, r) => acc + r.totalDiscount, 0);
    const expectedNet = rows.reduce((acc, r) => acc + r.netPayable, 0);
    const beneficiaryCount = rows.filter(r => r.totalDiscount > 0).length;

    return {
        settings: settings,
        rows: rows,
        highestDiscount: highestDiscount,
        topStudentName: topRow ? topRow.name : '—',
        totalSubsidy: totalSubsidy,
        expectedNet: expectedNet,
        beneficiaryCount: beneficiaryCount,
        totalMembers: rows.length
    };
}

function toggleConferenceDiscountVisibility() {
    const settings = getConferenceSettings();
    settings.isDiscountPublished = !settings.isDiscountPublished;
    saveConferenceSettings(settings);
    renderConferenceSettingsUI();
    if (typeof showToast === 'function') {
        showToast(settings.isDiscountPublished ? 
            "📢 تم إعلان خصومات المؤتمر رسمياً لجميع المخدومين في بواباتهم!" : 
            "🔒 تم حجب خصومات المؤتمر عن المخدومين بأمان!");
    } else {
        alert(settings.isDiscountPublished ? "📢 تم إعلان خصومات المؤتمر للمخدومين" : "🔒 تم حجب خصومات المؤتمر");
    }
}

function saveConferenceSettingsAction() {
    const settings = getConferenceSettings();
    settings.conferenceBaseFee = Math.max(0, parseInt(document.getElementById('confBaseFee').value) || 800);
    settings.activationDate = document.getElementById('confActivationDate').value || "2026-05-29";
    settings.attendanceRules.fridayDiscount = Math.max(0, parseInt(document.getElementById('confFridayDiscount').value) || 10);
    settings.attendanceRules.summerDiscount = Math.max(0, parseInt(document.getElementById('confSummerDiscount').value) || 15);
    settings.attendanceRules.multiplierFactor = Math.max(1, parseFloat(document.getElementById('confMultiplierFactor').value) || 2);
    settings.attendanceRules.minimumAttendanceDiscount = Math.max(0, parseInt(document.getElementById('confMinAttendanceFloor').value) || 100);
    settings.attendanceRules.applyMultiplier = document.getElementById('confApplyMultiplier').checked;

    const elSt1Count = document.getElementById('confStage1ExamCount'); if (elSt1Count) settings.examRules.stage1.examCount = Math.max(1, parseInt(elSt1Count.value) || 3);
        settings.examRules.stage1.tier90 = Math.max(0, parseInt(document.getElementById('confStage1Tier90').value) || 100);
    settings.examRules.stage1.tier80 = Math.max(0, parseInt(document.getElementById('confStage1Tier80').value) || 50);
    settings.examRules.stage1.tier65 = Math.max(0, parseInt(document.getElementById('confStage1Tier65').value) || 30);

    const elSt2Count = document.getElementById('confStage2ExamCount'); if (elSt2Count) settings.examRules.stage2.examCount = Math.max(1, parseInt(elSt2Count.value) || 2);
        settings.examRules.stage2.tier90 = Math.max(0, parseInt(document.getElementById('confStage2Tier90').value) || 150);
    settings.examRules.stage2.tier80 = Math.max(0, parseInt(document.getElementById('confStage2Tier80').value) || 75);
    settings.examRules.stage2.tier65 = Math.max(0, parseInt(document.getElementById('confStage2Tier65').value) || 45);

    saveConferenceSettings(settings);
    renderConferenceSettingsUI();
    if (typeof showToast === 'function') showToast("✅ تم حفظ إعدادات تخفيضات المؤتمر السنوي بنجاح!");
    else alert("✅ تم حفظ إعدادات تخفيضات المؤتمر بنجاح!");
}

function renderConferenceSettingsUI() {
    const settings = getConferenceSettings();
    const badge = document.getElementById('confPublishStatusBadge');
    const btn = document.getElementById('btnToggleConfVisibility');
    if (badge) {
        if (settings.isDiscountPublished) {
            badge.innerHTML = '<i class="fa-solid fa-lock-open me-1"></i> معلن للمخدومين 📢';
            badge.style.color = '#15803d';
        } else {
            badge.innerHTML = '<i class="fa-solid fa-lock me-1"></i> محجوب عن المخدومين 🔒';
            badge.style.color = '#dc2626';
        }
    }
    if (btn) {
        btn.textContent = settings.isDiscountPublished ? 'حجب الخصومات الآن' : 'إعلان الخصومات للجميع';
        btn.style.background = settings.isDiscountPublished ? '#dc2626' : '#1e40af';
    }

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('confBaseFee', settings.conferenceBaseFee);
    setVal('confActivationDate', settings.activationDate);
    setVal('confFridayDiscount', settings.attendanceRules.fridayDiscount);
    setVal('confSummerDiscount', settings.attendanceRules.summerDiscount);
    setVal('confMultiplierFactor', settings.attendanceRules.multiplierFactor);
    setVal('confMinAttendanceFloor', settings.attendanceRules.minimumAttendanceDiscount);

    const chk = document.getElementById('confApplyMultiplier');
    if (chk) chk.checked = settings.attendanceRules.applyMultiplier !== false;

    setVal('confStage1ExamCount', settings.examRules.stage1.examCount || 3);
        setVal('confStage1Tier90', settings.examRules.stage1.tier90);
    setVal('confStage1Tier80', settings.examRules.stage1.tier80);
    setVal('confStage1Tier65', settings.examRules.stage1.tier65);

    setVal('confStage2ExamCount', settings.examRules.stage2.examCount || 2);
        setVal('confStage2Tier90', settings.examRules.stage2.tier90);
    setVal('confStage2Tier80', settings.examRules.stage2.tier80);
    setVal('confStage2Tier65', settings.examRules.stage2.tier65);
}

function openConferenceLedgerModal() {
    const modal = document.getElementById('conferenceLedgerModal');
    if (modal) {
        modal.style.display = 'flex';
        renderConferenceLedgerTable();
    }
}

function closeConferenceLedgerModal() {
    const modal = document.getElementById('conferenceLedgerModal');
    if (modal) modal.style.display = 'none';
}

function renderConferenceLedgerTable() {
    const data = computeConferenceLedgerData();

    // تحديث كروت المؤشرات
    const elTopDisc = document.getElementById('kpiTopDiscountAchieved');
    if (elTopDisc) elTopDisc.textContent = data.highestDiscount + ' ج.م';
    const elTopName = document.getElementById('kpiTopStudentName');
    if (elTopName) elTopName.textContent = data.highestDiscount > 0 ? ('المحقق: ' + data.topStudentName) : 'لا توجد خصومات';

    const elSubsidy = document.getElementById('kpiTotalSubsidy');
    if (elSubsidy) elSubsidy.textContent = data.totalSubsidy.toLocaleString('ar-EG') + ' ج.م';

    const elExpNet = document.getElementById('kpiExpectedNet');
    if (elExpNet) elExpNet.textContent = data.expectedNet.toLocaleString('ar-EG') + ' ج.م';

    const elBenCount = document.getElementById('kpiBeneficiariesCount');
    if (elBenCount) elBenCount.textContent = data.beneficiaryCount + ' مخدوم';

    const elBenPct = document.getElementById('kpiBeneficiariesPct');
    if (elBenPct) {
        const pct = data.totalMembers > 0 ? ((data.beneficiaryCount / data.totalMembers) * 100).toFixed(1) : '0';
        elBenPct.textContent = pct + '% من إجمالي ' + data.totalMembers + ' مخدوم';
    }

    // فلترة الصفوف
    const elSearch = document.getElementById('confLedgerSearch');
    const searchVal = (elSearch && elSearch.value ? elSearch.value : '').trim().toLowerCase();
    const elStage = document.getElementById('confLedgerStageFilter');
    const stageVal = elStage ? elStage.value : 'all';
    const elDisc = document.getElementById('confLedgerDiscountFilter');
    const discVal = elDisc ? elDisc.value : 'all';

    let filtered = data.rows.filter(r => {
        if (searchVal && !r.name.toLowerCase().includes(searchVal) && !r.code.toLowerCase().includes(searchVal)) {
            return false;
        }
        if (stageVal === 'stage1' && r.isStage2) return false;
        if (stageVal === 'stage2' && !r.isStage2) return false;
        if (discVal === 'has_discount' && r.totalDiscount <= 0) return false;
        if (discVal === 'no_discount' && r.totalDiscount > 0) return false;
        return true;
    });

    // ترتيب: الأكبر خصماً أولاً
    filtered.sort((a, b) => b.totalDiscount - a.totalDiscount || a.name.localeCompare(b.name, 'ar'));

    const tbody = document.getElementById('confLedgerTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="padding:20px; color:#94a3b8;">لا توجد نتائج مطابقة لخيارات البحث والفلترة.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map((r, i) => {
        const isTop = r.totalDiscount === data.highestDiscount && data.highestDiscount > 0;
        return `
            <tr style="border-bottom:1px solid #e2e8f0; ${isTop ? 'background:#fffbeb;' : ''}">
                <td style="padding:9px 6px; font-weight:bold; color:#64748b;">${i + 1}</td>
                <td style="padding:9px 8px; text-align:right;">
                    <div style="font-weight:800; color:#0f172a;">${escapeHtml(r.name)}</div>
                    <small style="color:#64748b; font-size:0.75rem;">كود: ${escapeHtml(r.code)}</small>
                </td>
                <td style="padding:9px 6px;">
                    <span class="badge" style="background:${r.isStage2 ? '#fef3c7; color:#92400e;' : '#dbeafe; color:#1e40af;'}">
                        ${r.stage}
                    </span>
                </td>
                <td style="padding:9px 6px; font-weight:700; color:#334155;">
                    ${r.fridayCount} <small style="color:#94a3b8;">(${r.fridayCount * data.settings.attendanceRules.fridayDiscount} ج)</small>
                </td>
                <td style="padding:9px 6px; font-weight:700; color:#334155;">
                    ${r.summerCount} <small style="color:#94a3b8;">(${r.summerCount * data.settings.attendanceRules.summerDiscount} ج)</small>
                </td>
                <td style="padding:9px 6px; font-weight:800; color:#0369a1;">
                    ${r.attendanceDiscount} ج
                </td>
                <td style="padding:9px 6px; font-weight:700; color:#334155;">
                    ${r.examPct > 0 ? r.examPct + '%' : '—'}
                </td>
                <td style="padding:9px 6px; font-weight:800; color:#15803d;">
                    ${r.examDiscount} ج
                </td>
                <td style="padding:9px 6px; background:#fef3c7; font-weight:900; color:#b45309; font-size:0.92rem;">
                    ${r.totalDiscount} ج ${isTop ? '⭐' : ''}
                </td>
                <td style="padding:9px 6px; background:#dbeafe; font-weight:900; color:#1e40af; font-size:0.92rem;">
                    ${r.netPayable} ج
                </td>
                <td style="padding:9px 6px;">
                    <button type="button" onclick="sendYouthWhatsAppNotification('${r.code}')" style="background:#25d366; color:#ffffff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:700;" title="إرسال إشعار الخصم الفردي">
                        <i class="fa-brands fa-whatsapp me-1"></i> إشعار
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function exportConferenceLedgerToExcel() {
    const data = computeConferenceLedgerData();
    if (!data.rows || data.rows.length === 0) {
        alert('لا توجد بيانات مخدومين متاحة للتصدير حالياً.');
        return;
    }

    const headers = [
        'م',
        'كود المخدوم',
        'اسم المخدوم',
        'الفرقة الدراسية',
        'رقم الهاتف',
        'حضور الجمعة (جلسات)',
        'حضور الصيف (جلسات)',
        'خصم الحضور المعتمد (ج.م)',
        'نسبة الامتحانات %',
        'خصم التفوق الدراسي (ج.م)',
        'إجمالي الخصم المستحق (ج.م)',
        'اشتراك المؤتمر الأساسي (ج.م)',
        'صافي المبلغ المطلوب سداده (ج.م)',
        'تاريخ التفعيل'
    ];

    const rows = data.rows.map((r, i) => [
        i + 1,
        r.code,
        r.name,
        r.stage,
        r.phone,
        r.fridayCount,
        r.summerCount,
        r.attendanceDiscount,
        r.examPct > 0 ? r.examPct + '%' : '0%',
        r.examDiscount,
        r.totalDiscount,
        r.baseFee,
        r.netPayable,
        data.settings.activationDate
    ]);

    // صف الإجماليات
    rows.push([
        'الإجمالي',
        '—',
        'عدد المخدومين: ' + data.rows.length,
        '—',
        '—',
        data.rows.reduce((a, b) => a + b.fridayCount, 0),
        data.rows.reduce((a, b) => a + b.summerCount, 0),
        data.rows.reduce((a, b) => a + b.attendanceDiscount, 0),
        '—',
        data.rows.reduce((a, b) => a + b.examDiscount, 0),
        data.totalSubsidy,
        data.rows.length * data.settings.conferenceBaseFee,
        data.expectedNet,
        '—'
    ]);

    const fileName = 'سجل_خصومات_المؤتمر_السنوي_2026.xlsx';

    if (typeof XLSX !== 'undefined') {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "خصومات_المؤتمر");
        XLSX.writeFile(wb, fileName);
        if (typeof showToast === 'function') showToast("✅ تم تصدير كشف حساب المؤتمر إلى Excel بنجاح!");
        else alert("✅ تم تصدير كشف حساب المؤتمر بنجاح!");
    } else {
        // تصدير CSV بديل
        let csv = '\uFEFF' + [headers, ...rows].map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName.replace('.xlsx', '.csv');
        link.click();
    }
}

function sendYouthWhatsAppNotification(code) {
    const data = computeConferenceLedgerData();
    const r = data.rows.find(x => String(x.code) === String(code));
    if (!r) return;

    const phone = (r.phone || '').replace(/[^0-9]/g, '');
    let cleanPhone = phone;
    if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;

    const msg = 'سلام ونعمة يا ' + r.name + ' 🙏✨\n' +
'تقديراً لالتزامك وتفوقك المبارك، يسر أمانة خدمة القديس بولس إعلان تفاصيل تخفيضك المستحق لحضور المؤتمر السنوي 2026:\n' +
'⛺ اشتراك المؤتمر الأساسي: ' + r.baseFee + ' ج.م\n' +
'🗓️ مكافأة الحضور والالتزام: ' + r.attendanceDiscount + ' ج.م (' + r.totalSessions + ' جلسة)\n' +
'🎓 مكافأة التفوق الدراسي (' + r.stage + '): ' + r.examDiscount + ' ج.م\n' +
'💎 إجمالي الخصم المستحق لك: ' + r.totalDiscount + ' ج.م\n' +
'━━━━━━━━━━━━━━━━━━━━\n' +
'💰 الصافي المطلوب سداده لأمين الصندوق: ' + r.netPayable + ' ج.م فقط!\n' +
'⏳ يبدأ سداد الاشتراكات وتأكيد الحجز اعتباراً من: ' + data.settings.activationDate + '\n' +
'طوباك على اجتهادك، وبانتظار مشاركتك المباركة في المؤتمر! 🙏❤️';

    if (cleanPhone) {
        window.open('https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(msg), '_blank');
    } else {
        navigator.clipboard.writeText(msg).then(() => {
            alert('لم يتم العثور على رقم هاتف مسجل للمخدوم (' + r.name + ').\nتم نسخ نص الإشعار بنجاح إلى الحافظة لإرساله يدوياً! 📋');
        }).catch(() => {
            prompt('انسخ نص رسالة المؤتمر لـ ' + r.name + ':', msg);
        });
    }
}

function copyConferenceServantSummary() {
    const data = computeConferenceLedgerData();
    const pctBen = data.totalMembers > 0 ? ((data.beneficiaryCount / data.totalMembers) * 100).toFixed(1) : 0;
    const summary = '🏕️ ملخص تقرير تخفيضات المؤتمر السنوي 2026:\n' +
'━━━━━━━━━━━━━━━━━━━━\n' +
'👥 إجمالي عدد المخدومين: ' + data.totalMembers + '\n' +
'💎 عدد المستفيدين من الخصومات: ' + data.beneficiaryCount + ' (' + pctBen + '%)\n' +
'🏆 أعلى خصم محقق بالدفعة: ' + data.highestDiscount + ' ج.م (' + data.topStudentName + ')\n' +
'💰 إجمالي الدعم الممنوح من الخدمة: ' + data.totalSubsidy.toLocaleString('ar-EG') + ' ج.م\n' +
'💵 إجمالي الاشتراكات المتوقع تحصيلها: ' + data.expectedNet.toLocaleString('ar-EG') + ' ج.م\n' +
'⏳ موعد بدء التفعيل والتحصيل: ' + data.settings.activationDate + '\n' +
'━━━━━━━━━━━━━━━━━━━━\n' +
'خدمة القديس بولس - نظام خدمتي برو';

    navigator.clipboard.writeText(summary).then(() => {
        if (typeof showToast === 'function') showToast("📋 تم نسخ ملخص المؤتمر بنجاح!");
        else alert("📋 تم نسخ ملخص المؤتمر بنجاح!");
    }).catch(() => {
        prompt("انسخ ملخص المؤتمر:", summary);
    });
}

// ========================================================
    // 🎯 دوال إدارة المنظومة الموحدة للبونص والمؤتمر (Unified Incentive Helpers)
    // ========================================================
    function switchUnifiedIncentiveTab(tabKey) {
        const secConf = document.getElementById('unifiedSectionConference');
        const secSpiritual = document.getElementById('unifiedSectionSpiritual');
        const bConf = document.getElementById('btnUnifiedTabConf');
        const bSpiritual = document.getElementById('btnUnifiedTabSpiritual');
        const bAll = document.getElementById('btnUnifiedTabAll');

        if (!secConf || !secSpiritual) return;

        if (tabKey === 'conf') {
            secConf.style.display = 'block';
            secSpiritual.style.display = 'none';
            if (bConf) { bConf.style.background = '#1e40af'; bConf.style.color = '#ffffff'; }
            if (bSpiritual) { bSpiritual.style.background = 'transparent'; bSpiritual.style.color = '#475569'; }
            if (bAll) { bAll.style.background = 'transparent'; bAll.style.color = '#64748b'; }
        } else if (tabKey === 'spiritual') {
            secConf.style.display = 'none';
            secSpiritual.style.display = 'block';
            if (bConf) { bConf.style.background = 'transparent'; bConf.style.color = '#475569'; }
            if (bSpiritual) { bSpiritual.style.background = '#15803d'; bSpiritual.style.color = '#ffffff'; }
            if (bAll) { bAll.style.background = 'transparent'; bAll.style.color = '#64748b'; }
        } else {
            // All
            secConf.style.display = 'block';
            secSpiritual.style.display = 'block';
            if (bConf) { bConf.style.background = 'transparent'; bConf.style.color = '#475569'; }
            if (bSpiritual) { bSpiritual.style.background = 'transparent'; bSpiritual.style.color = '#475569'; }
            if (bAll) { bAll.style.background = '#0f172a'; bAll.style.color = '#ffffff'; }
        }
    }

    function toggleUnifiedVisibility() {
        const confSettings = getConferenceSettings();
        const bonusSettings = getBonusSettings();

        // التبديل المتزامن
        const newVisible = !(confSettings.isDiscountPublished && bonusSettings.isBonusVisibleToStudents);
        confSettings.isDiscountPublished = newVisible;
        bonusSettings.isBonusVisibleToStudents = newVisible;

        saveConferenceSettings(confSettings);
        saveBonusSettings(bonusSettings);

        renderUnifiedPublishStatus();

        if (typeof showToast === 'function') {
            showToast(newVisible ? 
                "📢 أصبحت نقاط البونص وتخفيضات المؤتمر معلنة لجميع المخدومين في بواباتهم!" : 
                "🔒 تم حجب نقاط البونص وتخفيضات المؤتمر عن المخدومين بأمان!");
        } else {
            alert(newVisible ? "📢 تم إعلان النقاط والخصومات للمخدومين" : "🔒 تم حجب النقاط والخصومات عن المخدومين");
        }
    }

    function renderUnifiedPublishStatus() {
        const confSettings = getConferenceSettings();
        const bonusSettings = getBonusSettings();
        const isPub = confSettings.isDiscountPublished && bonusSettings.isBonusVisibleToStudents;

        const badge = document.getElementById('unifiedPublishStatusBadge');
        const btn = document.getElementById('btnToggleUnifiedVisibility');

        if (badge) {
            if (isPub) {
                badge.innerHTML = '<i class="fa-solid fa-lock-open me-1"></i> معلن للمخدومين 📢';
                badge.style.color = '#15803d';
            } else {
                badge.innerHTML = '<i class="fa-solid fa-lock me-1"></i> محجوب عن المخدومين 🔒';
                badge.style.color = '#dc2626';
            }
        }
        if (btn) {
            btn.textContent = isPub ? 'حجب الكل الآن' : 'إعلان الكل للمخدومين';
            btn.style.background = isPub ? '#dc2626' : '#15803d';
        }

        renderConferenceSettingsUI();
        renderBonusSettingsUI();
    }

    function saveAllUnifiedIncentiveSettings() {
        saveConferenceSettingsAction();
        saveBaseBonusRules();
        renderUnifiedPublishStatus();
        if (typeof showToast === 'function') {
            showToast("✅ تم حفظ كافة إعدادات البونص وتخفيضات المؤتمر السنوي بنجاح!");
        } else {
            alert("✅ تم حفظ كافة إعدادات البونص وتخفيضات المؤتمر السنوي بنجاح!");
        }
    }