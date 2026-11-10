// دالة التحقق من توفر بيئة Node المحلية (localhost فقط وغير آمنة للطلب من HTTPS/Vercel)
function isLocalNodeAvailable() {
    try {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        const proto = window.location.protocol;
        return (proto !== 'https:' && (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'));
    } catch(e) {
        return false;
    }
}


function evaluateExcuseTiming(createdAtTimestamp, fridayDateStr) {
    if (!createdAtTimestamp) return { 
        formattedReceipt: 'غير مسجل', 
        weekdayName: '',
        timeStr: '',
        dateStr: '',
        label: 'غير محدد', 
        shortLabel: 'غير محدد', 
        tier: 'unknown',
        badgeColor: '#64748b',
        bgColor: '#f1f5f9'
    };

    const dt = new Date(Number(createdAtTimestamp));
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const weekdayName = weekdays[dt.getDay()];
    
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const isPm = hours >= 12;
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes} ${isPm ? 'م' : 'ص'}`;
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const formattedReceipt = `${weekdayName} ${dateStr} (${timeStr})`;

    const day = dt.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    let tier = 'within_deadline';
    let label = '🟢 في المهلة الرسمية (حتى الأربعاء)';
    let shortLabel = 'في المهلة (حتى الأربعاء)';
    let badgeColor = '#15803d';
    let bgColor = '#dcfce7';

    if (day === 4) { // Thursday
        tier = 'late_thursday';
        label = '🟡 متأخر (ورد الخميس - خارج مهلة الأربعاء)';
        shortLabel = 'متأخر (الخميس)';
        badgeColor = '#b45309';
        bgColor = '#fef3c7';
    } else if (day === 5) { // Friday
        if (dt.getHours() >= 16) {
            tier = 'post_meeting';
            label = '⚠️ لاحق (ورد الجمعة مساءً بعد انتهاء الاجتماع)';
            shortLabel = 'لاحق بعد الاجتماع';
            badgeColor = '#b91c1c';
            bgColor = '#fee2e2';
        } else {
            tier = 'late_friday';
            label = '🟠 متأخر جداً (ورد صباح الجمعة)';
            shortLabel = 'متأخر جداً (الجمعة)';
            badgeColor = '#c2410c';
            bgColor = '#ffedd5';
        }
    } else if (day === 6) { // Saturday
        tier = 'post_meeting';
        label = '⚠️ لاحق (ورد السبت بعد انتهاء الاجتماع)';
        shortLabel = 'لاحق (السبت)';
        badgeColor = '#b91c1c';
        bgColor = '#fee2e2';
    }

    return { formattedReceipt, weekdayName, timeStr, dateStr, tier, label, shortLabel, badgeColor, bgColor };
}

// 📡 رادار أمين الخدمة الشامل وشيت الإكسيل الأسبوعي
    // ==========================================

// ---------- محرك التقويم القبطي والأصوام الطقسية لرادار أمين الخدمة ----------
    const CopticLiturgicalCalendar = {
        easterDates: {
            2024: new Date(2024, 4, 5),
            2025: new Date(2025, 3, 20),
            2026: new Date(2026, 3, 12),
            2027: new Date(2027, 4, 2),
            2028: new Date(2028, 3, 16),
            2029: new Date(2029, 3, 8),
            2030: new Date(2030, 3, 28)
        },
        getCopticDate: function(date = new Date()) {
            try {
                const parts = new Intl.DateTimeFormat('en-US-u-ca-coptic', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date);
                let day = 1, month = 1, year = 1740;
                for (const p of parts) {
                    if (p.type === 'day') day = parseInt(p.value, 10);
                    if (p.type === 'month') month = parseInt(p.value, 10);
                    if (p.type === 'year') year = parseInt(p.value, 10);
                }
                const monthNames = ['', 'توت', 'بابه', 'هاتور', 'كيهك', 'طوبة', 'أمشير', 'برمهات', 'برمودة', 'بشنس', 'بؤونة', 'أبيب', 'مسرى', 'النسئ'];
                return { day, month, monthName: monthNames[month] || '', year, formatted: `${day} ${monthNames[month] || ''} ${year} ش` };
            } catch(e) {
                return { day: 1, month: 1, monthName: '', year: 1740, formatted: '' };
            }
        },
        getFastingStatus: function(date = new Date()) {
            const c = this.getCopticDate(date);
            const dayOfWeek = date.getDay();
            const isWedOrFri = (dayOfWeek === 3 || dayOfWeek === 5);
            const y = date.getFullYear();
            const easter = this.easterDates[y] || new Date(y, 3, 15);
            const msPerDay = 1000 * 60 * 60 * 24;
            const diffDaysToEaster = Math.round((date - easter) / msPerDay);

            if (diffDaysToEaster >= 0 && diffDaysToEaster <= 49) {
                if (diffDaysToEaster === 0) return { isFast: false, name: "عيد القيامة المجيد 👑", icon: "🎉", desc: "أعظم أعياد الكنيسة - فطر وابتهاج بالقيامة" };
                if (diffDaysToEaster === 49) return { isFast: false, name: "عيد العنصرة المجيد 🔥", icon: "🕊️", desc: "عيد سيدي كبير - فطر وحل دائم" };
                return { isFast: false, name: "الخمسين المقدسة الفرايحية 🕊️", icon: "🎉", desc: "فترة فطر وحل دائم (لا يوجد صوم أربعاء أو جمعة)" };
            }
            if (diffDaysToEaster >= -7 && diffDaysToEaster <= -1) {
                if (diffDaysToEaster === -7) return { isFast: true, name: "أحد الشعانين (أحد السعف) 🌿", icon: "🌿", desc: "عيد سيدي - صوم انقطاعي فرايحي" };
                if (diffDaysToEaster === -2) return { isFast: true, name: "الجمعة العظيمة ☦️", icon: "✝️", desc: "أقدس أيام السنة - صوم نسكي حازم وانقطاع" };
                if (diffDaysToEaster === -1) return { isFast: true, name: "سبت الفرح 🕯️", icon: "🕯️", desc: "صوم انقطاعي بدون سمك انتظاراً للقيامة" };
                return { isFast: true, name: "أسبوع الآلام المقدس ☦️", icon: "✝️", desc: "أقدس أصوام السنة - صوم نسكي حازم وانقطاع" };
            }
            if (diffDaysToEaster >= -55 && diffDaysToEaster < -7) {
                return { isFast: true, name: "الصوم الكبير (الأربعين المقدسة) 🥖", icon: "🥖", desc: "صوم من الدرجة الأولى - نسك وانقطاع بدون سمك" };
            }
            if (diffDaysToEaster >= -69 && diffDaysToEaster <= -67) {
                return { isFast: true, name: "صوم نينوى (يونان النبي) 🐋", icon: "🐋", desc: "صوم انقطاعي مشدد من الدرجة الأولى بدون سمك 3 أيام" };
            }
            if (diffDaysToEaster >= 50 && c.month >= 9 && (c.month < 11 || (c.month === 11 && c.day <= 5))) {
                if (isWedOrFri) return { isFast: true, name: "صوم الرسل الأطهار (أربعاء/جمعة)", icon: "🥖", desc: "صوم انقطاعي أسبوعي خلال صوم الرسل" };
                return { isFast: true, name: "صوم الرسل الأطهار ✝️", icon: "🐟", desc: "صوم من الدرجة الثانية (يُسمح فيه بالسمك)" };
            }
            if ((c.month === 3 && c.day >= 16) || (c.month === 4 && c.day <= 28)) {
                if (c.month === 4 && c.day === 28) return { isFast: true, name: "برمون عيد الميلاد المجيد 🕯️", icon: "🥖", desc: "صوم انقطاعي مشدد بدون سمك" };
                if (isWedOrFri) return { isFast: true, name: "صوم الميلاد المجيد (أربعاء/جمعة)", icon: "🥖", desc: "صوم انقطاعي أسبوعي خلال صوم الميلاد" };
                return { isFast: true, name: "صوم الميلاد المجيد 🎄", icon: "🐟", desc: "صوم من الدرجة الثانية (يُسمح فيه بالسمك)" };
            }
            if (c.month === 4 && c.day === 29) return { isFast: false, name: "عيد الميلاد المجيد 🎄", icon: "🎉", desc: "عيد سيدي كبير - فطر وابتهاج بميلاد مخلصنا" };
            if (c.month === 5 && c.day === 10) return { isFast: true, name: "برمون عيد الغطاس المجيد 🕊️", icon: "🥖", desc: "صوم انقطاعي مشدد بدون سمك" };
            if (c.month === 5 && c.day === 11) return { isFast: false, name: "عيد الغطاس المجيد (الثيؤفانيا) 🕊️", icon: "🎉", desc: "عيد سيدي كبير - فطر بميلاد الماء والروح" };
            if (c.month === 12 && c.day >= 1 && c.day <= 15) {
                if (isWedOrFri) return { isFast: true, name: "صوم السيدة العذراء مريم (أربعاء/جمعة)", icon: "🥖", desc: "صوم انقطاعي أسبوعي خلال صوم العذراء" };
                return { isFast: true, name: "صوم السيدة العذراء مريم 🌹", icon: "🐟", desc: "صوم محبوبة الكنيسة (درجة ثانية - يُسمح بالسمك)" };
            }
            if (isWedOrFri) {
                const dayName = (dayOfWeek === 3) ? "الأربعاء" : "الجمعة";
                const reason = (dayOfWeek === 3) ? "تذكار التآمر على مخلصنا وتسليمه" : "تذكار صلب وفداء رب المجد";
                return { isFast: true, name: `صوم يوم ${dayName} 🥖`, icon: "🥖", desc: `صوم كنسي أسبوعي مقدس (${reason}) - صوم انقطاعي بدون سمك` };
            }
            return { isFast: false, name: "يوم فطر كنسي 🕊️", icon: "🕊️", desc: "اليوم حل وفطر بحسب طقس الكنيسة القبطية الأرثوذكسية" };
        }
    };

    function renderRadarCopticFasting() {
        const now = new Date();
        const f = CopticLiturgicalCalendar.getFastingStatus(now);
        const c = CopticLiturgicalCalendar.getCopticDate(now);
        const iconEl = document.getElementById('radar_fastIcon');
        const titleEl = document.getElementById('radar_fastTitle');
        const descEl = document.getElementById('radar_fastDesc');
        const dateEl = document.getElementById('radar_copticDate');
        if (iconEl) iconEl.textContent = f.icon;
        if (titleEl) titleEl.textContent = f.name;
        if (descEl) descEl.textContent = f.desc;
        if (dateEl) dateEl.textContent = c.formatted || 'التقويم القبطي';
    }

    
// ==========================================
// 🚀 رادار النبض الإحصائي وأعياد الميلاد والغياب الحرج
// ==========================================
var activeExportStageTab = 'all';
if (typeof window !== 'undefined') {
    window.activeExportStageTab = 'all';
}
window.currentRadarAbsenceFilter = 'all';
window.lastRadarAbsentMems = [];
window.lastRadarBirthdaysList = [];

function renderRadarPulseChart(validMeetingDates) {
    const container = document.getElementById('radar_attendancePulseBars');
    const commentEl = document.getElementById('radar_pulseTrendComment');
    const stabilityEl = document.getElementById('radar_pulseOverallStability');
    const engagementBadgeEl = document.getElementById('radar_pulseEngagementBadge');
    const metricsGrid = document.getElementById('radar_pulseMetricsGrid');
    const stageComparison = document.getElementById('radar_pulseStageComparison');

    if (!container || !members || members.length === 0) return;

    const dates = (validMeetingDates && validMeetingDates.length > 0) 
        ? validMeetingDates 
        : (window.lastValidMeetingDates || ['2026-11-06']);

    const totalMembers = members.length;
    const stage1Members = members.filter(m => (m.stage || '').includes('أولى'));
    const stage2Members = members.filter(m => (m.stage || '').includes('ثانية'));
    const stage1Total = stage1Members.length || 1;
    const stage2Total = stage2Members.length || 1;

    // التاريخ الأحدث للجلسة
    const latestDate = dates[0] || '2026-11-06';
    const latestAttList = (attendanceRecord && attendanceRecord[latestDate]) || [];

    // دالة فحص حضور المخدوم في كشف الحضور
    const checkAttended = (m) => {
        const mId = String(m.id || '').trim();
        const mCode = String(m.code || '').trim();
        const mPhone = String(m.phone || '').replace(/[^0-9]/g, '');
        return latestAttList.some(r => {
            if (!r.attended || r.isAbsentDueToDelay) return false;
            if (mId && String(r.id || '').trim() === mId) return true;
            if (mCode && String(r.code || '').trim() === mCode) return true;
            if (mPhone && r.phone && String(r.phone).replace(/[^0-9]/g, '') === mPhone) return true;
            if (r.name && r.name.trim() === m.name.trim()) return true;
            return false;
        });
    };

    const attendedMems = members.filter(checkAttended);
    const actualAttCount = attendedMems.length;
    const attStage1 = attendedMems.filter(m => (m.stage || '').includes('أولى')).length;
    const attStage2 = attendedMems.filter(m => (m.stage || '').includes('ثانية')).length;
    const attPct = totalMembers > 0 ? Math.round((actualAttCount / totalMembers) * 100) : 0;

    // رصد التناول بالقداس
    const liturgyCount = latestAttList.filter(r => r.communion || r.liturgy).length;
    const litPct = totalMembers > 0 ? Math.round((liturgyCount / totalMembers) * 100) : 0;

    // رصد الأعذار المعتمدة
    const excusesList = window.lastRadarExcusesList || [];
    const validExcuses = excusesList.filter(e => {
        const isTargetDate = !e.session_date || e.session_date === latestDate;
        return isTargetDate && e.status !== 'rejected';
    });
    const excuseCount = validExcuses.length;
    const excuseStage1 = validExcuses.filter(e => {
        const st = String(e.student_stage || '').trim();
        if (st.includes('أولى')) return true;
        const matched = members.find(m => String(m.id) === String(e.student_id) || (e.student_name && m.name === e.student_name));
        return matched && (matched.stage || '').includes('أولى');
    }).length;
    const excuseStage2 = validExcuses.filter(e => {
        const st = String(e.student_stage || '').trim();
        if (st.includes('ثانية')) return true;
        const matched = members.find(m => String(m.id) === String(e.student_id) || (e.student_name && m.name === e.student_name));
        return matched && (matched.stage || '').includes('ثانية');
    }).length;
    const excusePct = totalMembers > 0 ? Math.round((excuseCount / totalMembers) * 100) : 0;

    // إجمالي التفاعل الموثق (حضور + عذر)
    const engagedCount = actualAttCount + excuseCount;
    const engagedPct = totalMembers > 0 ? Math.round((engagedCount / totalMembers) * 100) : 0;

    // الغياب غير المبرر (مستهدفو الافتقاد)
    const unexcusedCount = Math.max(0, totalMembers - engagedCount);
    const unexcusedStage1 = Math.max(0, stage1Total - (attStage1 + excuseStage1));
    const unexcusedStage2 = Math.max(0, stage2Total - (attStage2 + excuseStage2));
    const unexcusedPct = totalMembers > 0 ? Math.round((unexcusedCount / totalMembers) * 100) : 0;

    // نسب الفرق
    const stage1AttPct = Math.round((attStage1 / stage1Total) * 100);
    const stage1ExcusePct = Math.round((excuseStage1 / stage1Total) * 100);
    const stage1UnexcusedPct = Math.max(0, 100 - (stage1AttPct + stage1ExcusePct));
    const stage1EngagedPct = stage1AttPct + stage1ExcusePct;

    const stage2AttPct = Math.round((attStage2 / stage2Total) * 100);
    const stage2ExcusePct = Math.round((excuseStage2 / stage2Total) * 100);
    const stage2UnexcusedPct = Math.max(0, 100 - (stage2AttPct + stage2ExcusePct));
    const stage2EngagedPct = stage2AttPct + stage2ExcusePct;

    // 1. تحديث البادجات العلوية
        window.lastMeetingPulseData = {
        date: latestDate,
        totalMembers,
        actualAttCount,
        attPct,
        liturgyCount,
        litPct,
        excuseCount,
        excusePct,
        engagedCount,
        engagedPct,
        unexcusedCount,
        unexcusedPct,
        stage1Total,
        stage2Total,
        attStage1,
        stage1AttPct,
        excuseStage1,
        stage1ExcusePct,
        unexcusedStage1,
        stage1UnexcusedPct,
        stage1EngagedPct,
        attStage2,
        stage2AttPct,
        excuseStage2,
        stage2ExcusePct,
        unexcusedStage2,
        stage2UnexcusedPct,
        stage2EngagedPct
    };

    if (stabilityEl) stabilityEl.innerHTML = `📈 الحضور الفعلي: <strong>${attPct}%</strong> (${actualAttCount} مخدوم)`;
    if (engagementBadgeEl) engagementBadgeEl.innerHTML = `🌟 التفاعل الموثق: <strong>${engagedPct}%</strong> (${engagedCount} مخدوم)`;

    // 2. شبكة المؤشرات الرقمية الكبرى الأربعة (4 Executive Pulse Metric Cards)
    if (metricsGrid) {
        metricsGrid.innerHTML = `
            <!-- كارت 1: الحضور الفعلي الموثق -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border: 1.5px solid #86efac; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.08);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.84rem; font-weight:bold; color:#166534; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-clipboard-user text-success"></i> الحضور الفعلي الموثق
                    </span>
                    <span style="background:#dcfce7; color:#15803d; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:6px; border:1px solid #bbf7d0;">${attPct}%</span>
                </div>
                <div style="display:flex; align-items:baseline; gap:8px;">
                    <span style="font-size:1.85rem; font-weight:900; color:#0f172a;">${actualAttCount}</span>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:bold;">مخدوم حاضر باللقاء</span>
                </div>
                <div style="font-size:0.75rem; color:#475569; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between;">
                    <span>🎓 أولى: <strong>${attStage1}</strong> (${stage1AttPct}%)</span>
                    <span>🎓 ثانية: <strong>${attStage2}</strong> (${stage2AttPct}%)</span>
                </div>
            </div>

            <!-- كارت 2: الغياب بعذر رسمي -->
            <div style="background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border: 1.5px solid #fde047; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(234, 179, 8, 0.08);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.84rem; font-weight:bold; color:#854d0e; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-envelope-open-text text-warning"></i> الغياب بعذر معتمد
                    </span>
                    <span style="background:#fef9c3; color:#a16207; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:6px; border:1px solid #fef08a;">${excusePct}%</span>
                </div>
                <div style="display:flex; align-items:baseline; gap:8px;">
                    <span style="font-size:1.85rem; font-weight:900; color:#0f172a;">${excuseCount}</span>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:bold;">اعتذارات موثقة</span>
                </div>
                <div style="font-size:0.75rem; color:#475569; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between;">
                    <span>🕊️ واتساب: <strong>${excuseCount}</strong> مخدوم</span>
                    <span style="color:#b45309; font-weight:bold;">توثيق رسمي مسبق</span>
                </div>
            </div>

            <!-- كارت 3: إجمالي التفاعل الإيجابي الموثق -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); border: 1.5px solid #93c5fd; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.84rem; font-weight:bold; color:#1e40af; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-heart-circle-check text-primary"></i> إجمالي التفاعل الموثق
                    </span>
                    <span style="background:#dbeafe; color:#1d4ed8; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:6px; border:1px solid #bfdbfe;">${engagedPct}%</span>
                </div>
                <div style="display:flex; align-items:baseline; gap:8px;">
                    <span style="font-size:1.85rem; font-weight:900; color:#0f172a;">${engagedCount}</span>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:bold;">من أصل ${totalMembers} مخدوم</span>
                </div>
                <div style="font-size:0.75rem; color:#1d4ed8; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px;">
                    <span>🌟 حضور فعلي (${actualAttCount}) + عذر مسبق (${excuseCount})</span>
                </div>
            </div>

            <!-- كارت 4: المستهدفون برادار الافتقاد -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.84rem; font-weight:bold; color:#991b1b; display:flex; align-items:center; gap:6px;">
                        <i class="fa-solid fa-bullseye text-danger"></i> مستهدفو رادار الافتقاد
                    </span>
                    <span style="background:#fee2e2; color:#dc2626; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:6px; border:1px solid #fecaca;">${unexcusedPct}%</span>
                </div>
                <div style="display:flex; align-items:baseline; gap:8px;">
                    <span style="font-size:1.85rem; font-weight:900; color:#dc2626;">${unexcusedCount}</span>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:bold;">غياب بدون عذر</span>
                </div>
                <div style="font-size:0.75rem; color:#475569; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between;">
                    <span>🚨 أولى: <strong>${unexcusedStage1}</strong></span>
                    <span>🚨 ثانية: <strong>${unexcusedStage2}</strong></span>
                    <span style="color:#b91c1c; font-weight:bold;">أولوية الافتقاد الميداني</span>
                </div>
            </div>
        `;
    }

    // 3. مقارنة تنافسية الفرق (Stage Pulse Breakdown)
    if (stageComparison) {
        stageComparison.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <strong style="color: #0c2461; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-layer-group text-primary"></i> مقارنة نبض وتنافسية الفرق (Stage Pulse Breakdown)
                </strong>
                <span style="font-size: 0.76rem; color: #64748b;">
                    جمعة 06 نوفمبر (إجمالي القوة المسجلة: <strong>${totalMembers}</strong> دارساً)
                </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 14px;">
                <!-- فرقة سنة أولى -->
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: 800; color: #0c2461; font-size: 0.88rem;">
                            🎓 الفرقة الأولى (${stage1Total} مخدوم)
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <span style="background: #dbeafe; color: #1e40af; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">تفاعل: ${stage1EngagedPct}%</span>
                            <span style="background: #dcfce7; color: #166534; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">حضور: ${stage1AttPct}%</span>
                        </div>
                    </div>
                    <!-- شريط التقدم المقسم -->
                    <div style="height: 14px; width: 100%; background: #f1f5f9; border-radius: 7px; overflow: hidden; display: flex; margin-bottom: 8px;" title="حضور: ${attStage1} | عذر: ${excuseStage1} | غياب: ${unexcusedStage1}">
                        <div style="width: ${stage1AttPct}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8);" title="حضور فعلي: ${stage1AttPct}%"></div>
                        <div style="width: ${stage1ExcusePct}%; background: #eab308;" title="غياب بعذر: ${stage1ExcusePct}%"></div>
                        <div style="width: ${stage1UnexcusedPct}%; background: #fca5a5;" title="غياب بدون عذر: ${stage1UnexcusedPct}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #64748b;">
                        <span>🟢 حاضر: <strong>${attStage1}</strong> (${stage1AttPct}%)</span>
                        <span>🟡 بعذر: <strong>${excuseStage1}</strong> (${stage1ExcusePct}%)</span>
                        <span>🔴 غياب رادار: <strong>${unexcusedStage1}</strong> (${stage1UnexcusedPct}%)</span>
                    </div>
                </div>

                <!-- فرقة سنة ثانية -->
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: 800; color: #0c2461; font-size: 0.88rem;">
                            🎓 الفرقة الثانية (${stage2Total} مخدوم)
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <span style="background: #dbeafe; color: #1e40af; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">تفاعل: ${stage2EngagedPct}%</span>
                            <span style="background: #dcfce7; color: #166534; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">حضور: ${stage2AttPct}%</span>
                        </div>
                    </div>
                    <!-- شريط التقدم المقسم -->
                    <div style="height: 14px; width: 100%; background: #f1f5f9; border-radius: 7px; overflow: hidden; display: flex; margin-bottom: 8px;" title="حضور: ${attStage2} | عذر: ${excuseStage2} | غياب: ${unexcusedStage2}">
                        <div style="width: ${stage2AttPct}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8);" title="حضور فعلي: ${stage2AttPct}%"></div>
                        <div style="width: ${stage2ExcusePct}%; background: #eab308;" title="غياب بعذر: ${stage2ExcusePct}%"></div>
                        <div style="width: ${stage2UnexcusedPct}%; background: #fca5a5;" title="غياب بدون عذر: ${stage2UnexcusedPct}%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #64748b;">
                        <span>🟢 حاضر: <strong>${attStage2}</strong> (${stage2AttPct}%)</span>
                        <span>🟡 بعذر: <strong>${excuseStage2}</strong> (${stage2ExcusePct}%)</span>
                        <span>🔴 غياب رادار: <strong>${unexcusedStage2}</strong> (${stage2UnexcusedPct}%)</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 10px; padding: 8px 12px; background: #ffffff; border-radius: 8px; border: 1px dashed #cbd5e1; font-size: 0.76rem; color: #334155; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <span>
                    🏆 <strong>مؤشر التنافسية:</strong> سنة ثانية تسجل أعلى نسبة حضور مباشر (<strong>${stage2AttPct}%</strong>)، وسنة أولى تسجل أعلى نسبة التزام بالإبلاغ المسبق (<strong>${stage1ExcusePct}%</strong> أعذار رسمية).
                </span>
                <span style="color: #64748b; font-size: 0.72rem; font-weight: 600;">💡 المستهدف المشترك للفرقتين: كسر حاجز 75% حضور</span>
            </div>
        `;
    }

    // 4. المسار البياني الزمني للجمعات ومستهدفات النمو (Service Timeline Journey)
    const recentActualDates = (dates || []).slice(0, 4).reverse();
    let barsHtml = `
        <!-- خط الهدف الأدنى الأفقي 75% -->
        <div style="position: absolute; bottom: 85px; left: 10px; right: 10px; border-top: 2px dashed #f59e0b; opacity: 0.8; z-index: 1; pointer-events: none;">
            <span style="position: absolute; right: 4px; top: -19px; font-size: 0.7rem; color: #b45309; font-weight: 800; background: #fffbeb; padding: 1px 7px; border-radius: 4px; border: 1px solid #fde68a;">
                --- خط الهدف الأدنى (75%)
            </span>
        </div>
    `;

    recentActualDates.forEach(d => {
        const list = (attendanceRecord && attendanceRecord[d]) || [];
        const attended = list.filter(r => r.attended && !r.isAbsentDueToDelay).length;
        const liturgy = list.filter(r => r.communion || r.liturgy).length;
        const curAttPct = totalMembers > 0 ? Math.round((attended / totalMembers) * 100) : 0;
        const curLitPct = totalMembers > 0 ? Math.round((liturgy / totalMembers) * 100) : 0;

        const dParts = d.split('-');
        const shortDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : d;
        const barHeight = Math.max(16, Math.round(curAttPct * 1.15));
        const litHeight = Math.max(8, Math.round(curLitPct * 1.15));

        barsHtml += `
            <div style="flex: 1; max-width: 140px; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 2;">
                <div style="font-size: 0.84rem; font-weight: 900; color: #1e3a8a;">${curAttPct}%</div>
                <div style="width: 100%; max-width: 58px; height: 120px; display: flex; align-items: flex-end; justify-content: center; background: #f8fafc; border-radius: 8px; overflow: hidden; position: relative; border: 1px solid #e2e8f0; gap: 4px; padding: 0 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);" title="تاريخ: ${d} | الحضور: ${attended} (${curAttPct}%) | القداس والتناول: ${liturgy} (${curLitPct}%)">
                    <div style="width: 50%; height: ${barHeight}px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px 4px 0 0; transition: height 0.4s ease;"></div>
                    <div style="width: 50%; height: ${litHeight}px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px 4px 0 0; transition: height 0.4s ease;"></div>
                </div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #0f172a; margin-top: 3px;">${shortDate}</div>
                <div style="font-size: 0.7rem; color: #64748b; font-weight: bold;">${attended} مخدوم</div>
                <span style="background: #dcfce7; color: #15803d; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; font-weight: 800; margin-top: 1px; border: 1px solid #bbf7d0;">فعلي 🟢</span>
            </div>
        `;
    });

    // استكمال مستهدفات الأسابيع المتبقية لشهر نوفمبر لملء المسار الرعوي ومنع فراغ الواجهة
    const futureMilestones = [
        { date: '13/11', targetPct: 78, targetCount: 70, label: 'اللقاء القادم', badge: 'مخطط 🎯', badgeBg: '#f3e8ff', badgeColor: '#7e22ce' },
        { date: '20/11', targetPct: 84, targetCount: 75, label: 'اللقاء الثالث', badge: 'مخطط 📈', badgeBg: '#f3e8ff', badgeColor: '#7e22ce' },
        { date: '27/11', targetPct: 90, targetCount: 80, label: 'ختام نوفمبر', badge: 'طموح 🌟', badgeBg: '#fef3c7', badgeColor: '#b45309' }
    ];

    const neededMilestones = Math.max(0, 4 - recentActualDates.length);
    for (let i = 0; i < neededMilestones; i++) {
        const ms = futureMilestones[i];
        if (!ms) break;
        const targetHeight = Math.round(ms.targetPct * 1.15);
        barsHtml += `
            <div style="flex: 1; max-width: 140px; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 2; opacity: 0.95;">
                <div style="font-size: 0.84rem; font-weight: 900; color: ${ms.badgeColor};">${ms.targetPct}%</div>
                <div style="width: 100%; max-width: 58px; height: 120px; display: flex; align-items: flex-end; justify-content: center; background: #faf5ff; border-radius: 8px; overflow: hidden; position: relative; border: 1.5px dashed #c084fc; padding: 0 4px;" title="المستهدف المخطط: ${ms.targetPct}% (${ms.targetCount} مخدوم)">
                    <div style="width: 65%; height: ${targetHeight}px; background: linear-gradient(180deg, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.75) 100%); border-radius: 4px 4px 0 0; transition: height 0.4s ease;"></div>
                </div>
                <div style="font-size: 0.78rem; font-weight: 800; color: #4b5563; margin-top: 3px;">${ms.date}</div>
                <div style="font-size: 0.7rem; color: #6b7280; font-weight: bold;">مستهدف: ${ms.targetCount}</div>
                <span style="background: ${ms.badgeBg}; color: ${ms.badgeColor}; font-size: 0.68rem; padding: 2px 8px; border-radius: 6px; font-weight: 800; margin-top: 1px; border: 1px solid #e9d5ff;">${ms.badge}</span>
            </div>
        `;
    }

    container.style.position = 'relative';
    container.innerHTML = barsHtml;

    // 5. التحليل الرعوي والتوجيهي الذكي
    if (commentEl) {
        commentEl.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 7px;">
                <div>
                    <strong>📌 الموقف الراهن بعد جمعة الانطلاق (6 نوفمبر):</strong> 
                    حقق الاجتماع نسبة حضور مشجعة بلغت <strong>${attPct}%</strong> (<strong>${actualAttCount}</strong> مخدوماً)، مع توثيق رسمي لحظي لاعتذارات <strong>${excuseCount}</strong> مخدومين، ليرتفع مؤشر التفاعل الكلي الإيجابي إلى <strong>${engagedPct}%</strong> (<strong>${engagedCount}</strong> مخدوماً من أصل ${totalMembers}).
                </div>
                <div>
                    <strong>🎯 التوجيه الرعوي العاجل للخدام:</strong> 
                    التركيز المباشر خلال هذا الأسبوع موجه لـ <strong>${unexcusedCount} مخدوماً غائبين بدون عذر</strong> (${unexcusedStage1} دارساً بالفرقة الأولى، و ${unexcusedStage2} بالفرقة الثانية). استهداف هؤلاء بالزيارات والمكالمات هو المحرك الأساسي لتحقيق مستهدف الجمعة القادمة 13 نوفمبر بالوصول إلى نسبة <strong>78%</strong> (70 مخدوماً بإذن ربنا).
                </div>
            </div>
        `;
    }
}


// ==========================================
// 🕊️ كاشف النوع واللغة الذكي للأسماء المسيحية والرعوية (Smart Pastoral Gender Engine)
// ==========================================
function isFemaleMemberOrName(name, explicitGender, stage) {
    if (explicitGender) {
        const g = String(explicitGender).trim().toLowerCase();
        if (g === 'بنات' || g === 'female' || g === 'أنثى' || g.includes('بنت') || g.includes('خادمة')) return true;
        if (g === 'بنين' || g === 'male' || g === 'ذكر' || g.includes('ولد') || g.includes('خادم')) return false;
    }
    if (stage) {
        const st = String(stage).trim().toLowerCase();
        if (st.includes('بنات') || st.includes('خادمات')) return true;
        if (st.includes('بنين')) return false;
    }
    if (!name) return false;

    const clean = String(name).trim();
    const first = clean.split(/\s+/)[0];

    const maleNames = new Set([
        'مينا', 'بيشوي', 'كيرلس', 'بولا', 'أنطون', 'انطون', 'أنطونيوس', 'انطونيوس', 'جورج', 'فادي',
        'مايكل', 'مارك', 'يوحنا', 'مكاريوس', 'أبانوب', 'ابانوب', 'شنودة', 'شنوده', 'فيلوباتير',
        'توماس', 'ماتياس', 'اندراوس', 'أندراوس', 'سمعان', 'يوسف', 'داود', 'دانيال', 'إبراهيم',
        'ابراهيم', 'إسحق', 'اسحق', 'يعقوب', 'بطرس', 'بولس', 'مرقس', 'لوقا', 'متى', 'تيموثاوس',
        'سلوانس', 'أرسانيوس', 'ارسانيوس', 'أثناسيوس', 'اثناسيوس', 'باسيليوس', 'غريغوريوس',
        'يوستينوس', 'إيليا', 'ايليا', 'إشعياء', 'اشعياء', 'إرميا', 'ارميا', 'صموئيل', 'جون',
        'رامي', 'رأفت', 'مجدي', 'عادل', 'نبيل', 'نادر', 'هاني', 'مدحت', 'سامح', 'سامي', 'تامر',
        'عماد', 'أشرف', 'اشرف', 'إيهاب', 'ايهاب', 'عصام', 'ماجد', 'رفعت', 'ماهر', 'منير', 'نسيم'
    ]);

    if (maleNames.has(first)) return false;

    const femaleNames = new Set([
        'ميرا', 'مارينا', 'مريم', 'يوستينا', 'فيرينا', 'كاترين', 'كريستين', 'سارة', 'ساره',
        'إيرين', 'ايرين', 'إيريني', 'ايريني', 'كلير', 'مونيكا', 'فيبي', 'ناردين', 'ليديا',
        'دميانة', 'دميانه', 'بربارة', 'برباره', 'رانيا', 'ريم', 'ميرنا', 'جوليا', 'ريتا',
        'جانيت', 'فيفيان', 'فيولا', 'تيريزا', 'تريزا', 'ليلى', 'نيفين', 'ساندرا', 'ساندي',
        'مارفي', 'مادونا', 'هيلانة', 'هيلانه', 'لوسي', 'جيرمين', 'جيزيل', 'شيرين', 'جاكلين',
        'نرمين', 'نانسي', 'هبة', 'هبه', 'إيفون', 'ايفون', 'ماجي', 'مها', 'ميرفت', 'سلفيا',
        'سيلفيا', 'دينا', 'داليا', 'ديانا', 'ميريل', 'ميريت', 'كارولين', 'كرستين', 'باتريسيا',
        'سوزان', 'سامية', 'ساميه', 'عايدة', 'عايده', 'منى', 'منال', 'أماني', 'اماني', 'هناء',
        'وفاء', 'كلوديا', 'سيلين', 'مارتينا', 'ماتيلدا', 'إنجي', 'انجي', 'جيسيكا', 'لورا',
        'لورين', 'كلودين', 'فلورا', 'سيمون', 'أنا سيمون', 'اناسيمون', 'كرستينا',
        'ياسمين', 'تريفينا', 'بريسيلا', 'دوريس', 'جوانا', 'سابين', 'ماديلين', 'ميراي', 'دونا',
        'ماري', 'ماريا', 'بياتريس', 'مارلين', 'تريزة', 'كريستينا', 'شيري', 'أوديت', 'اوديت'
    ]);

    if (femaleNames.has(first)) return true;
    if (/.*(ينة|يكا|سيا|يتا|يلا|اندا|يانا|فيا|ثيا)$/.test(first)) return true;

    return false;
}

function sendWhatsAppAbsenceDirect(name, phone, weeks, btn, gender) {
    let explicitG = gender;
    let foundStage = '';
    if (!explicitG && typeof members !== 'undefined' && Array.isArray(members)) {
        const cleanP = String(phone || '').replace(/[^0-9]/g, '');
        const found = members.find(m => m.name === name || (cleanP && String(m.phone || '').replace(/[^0-9]/g, '') === cleanP));
        if (found) {
            explicitG = found.gender;
            foundStage = found.stage;
        }
    }
    const isF = isFemaleMemberOrName(name, explicitG, foundStage);

    const salutation = isF ? `سلام ونعمة يا أختي الحبيبة ${name} ✝️` : `سلام ونعمة يا أخي الحبيب ${name} ✝️`;
    const meetingTitle = isF ? 'اجتماع القديس بولس لإعداد الخادمات' : 'اجتماع القديس بولس لإعداد الخدام';
    const missText = isF
        ? `افتقدناكِ جداً في ${meetingTitle} الجمعة الماضية، ومكانكِ غالي علينا. حابين نطمئن عليكِ ونسمع صوتكِ. ربنا يدبر ونفرح بوجودكِ معنا الجمعة القادمة بالقداس والاجتماع 🕊️`
        : `افتقدناك جداً في ${meetingTitle} الجمعة الماضية، ومكانك غالي علينا. حابين نطمئن عليك ونسمع صوتك. ربنا يدبر ونفرح بوجودك معنا الجمعة القادمة بالقداس والاجتماع 🕊️`;

    const rawMsg = `${salutation}\n${missText}`;
    if (typeof sendWhatsAppDirectMessage === 'function') {
        return sendWhatsAppDirectMessage(phone, rawMsg, btn);
    }
    const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
    window.open('https://wa.me/' + (cleanPhone.startsWith('01') ? '2' + cleanPhone : cleanPhone) + '?text=' + encodeURIComponent(rawMsg), '_blank');
}

function filterRadarAbsence(filterType = 'all') {
    window.currentRadarAbsenceFilter = filterType;
    const btnAll = document.getElementById('btnRadarAbsFilterAll');
    const btnCrit = document.getElementById('btnRadarAbsFilterCritical');
    if (btnAll && btnCrit) {
        if (filterType === 'all') {
            btnAll.style.background = '#0c2461'; btnAll.style.color = 'white';
            btnCrit.style.background = '#fef2f2'; btnCrit.style.color = '#dc2626';
        } else {
            btnCrit.style.background = '#dc2626'; btnCrit.style.color = 'white';
            btnAll.style.background = '#f1f5f9'; btnAll.style.color = '#334155';
        }
    }
    renderRadarAbsenceTableBody();
}

function renderRadarAbsenceTableBody() {
    const tbodyAbs = document.getElementById('radar_absenceTableBody');
    if (!tbodyAbs) return;

    let displayList = window.lastRadarAbsentMems || [];
    if (window.currentRadarAbsenceFilter === 'critical') {
        displayList = displayList.filter(m => m.consecutiveWeeks >= 3);
    }

    // تصفية مرحلة الخادم تلقائياً إذا لم يكن أمين خدمة شامل (Stage-Scoping for regular servants)
    try {
        const u = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : ((typeof AuthClient !== 'undefined') ? AuthClient.getUser() : null);
        const p = (typeof currentPermission !== 'undefined') ? currentPermission : (u ? (u.role || u.permission) : 'servant');
        const isLeader = (p === 'admin' || p === 'developer' || (u && (u.permission === 'admin' || u.role === 'admin')));
        if (!isLeader && u && u.stage && u.stage !== 'عام' && u.stage !== 'all') {
            const userStageNorm = u.stage.trim();
            displayList = displayList.filter(m => m.stage && (m.stage.includes(userStageNorm) || userStageNorm.includes(m.stage)));
        }
    } catch(e) {}

    if (displayList.length === 0) {
        tbodyAbs.innerHTML = `<tr><td colspan="8" style="padding: 20px; color: #166534; font-weight: bold; background: #f0fdf4;">نشكر ربنا! لا توجد حالات مطابقة لشرط الفلتر حالياً. 🟢</td></tr>`;
        return;
    }

    tbodyAbs.innerHTML = displayList.map(m => {
        let cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;
        const isF = isFemaleMemberOrName(m.name, m.gender, m.stage);
        const salutation = isF ? `سلام ونعمة يا أختي الحبيبة ${m.name} ✝️` : `سلام ونعمة يا أخي الحبيب ${m.name} ✝️`;
        const meetingTitle = isF ? 'اجتماع القديس بولس لإعداد الخادمات' : 'اجتماع القديس بولس لإعداد الخدام';
        const missText = isF
            ? `افتقدناكِ جداً في ${meetingTitle} الجمعة الماضية، ومكانكِ غالي علينا. حابين نطمئن عليكِ ونسمع صوتكِ. ربنا يدبر ونفرح بوجودكِ معنا الجمعة القادمة بالقداس والاجتماع 🕊️`
            : `افتقدناك جداً في ${meetingTitle} الجمعة الماضية، ومكانك غالي علينا. حابين نطمئن عليك ونسمع صوتك. ربنا يدبر ونفرح بوجودك معنا الجمعة القادمة بالقداس والاجتماع 🕊️`;
        const waMsg = encodeURIComponent(`${salutation}\n${missText}`);

        const isCritical = m.consecutiveWeeks >= 3;
        let badgeHtml = '';
        if (m.consecutiveWeeks >= 3) {
            badgeHtml = `<span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-size:0.85rem; font-weight:900;">🔴 انقطاع حرج (${m.consecutiveWeeks} أسابيع)</span>`;
        } else if (m.consecutiveWeeks === 2) {
            badgeHtml = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-size:0.85rem; font-weight:bold;">🟡 غياب أسبوعين</span>`;
        } else {
            badgeHtml = `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-size:0.85rem; font-weight:bold;">⚪ غياب أسبوع واحد (${m.consecutiveWeeks} لقاء)</span>`;
        }

        return `
            <tr style="border-bottom: 1px solid #f1f5f9; background: ${isCritical ? '#fff5f5' : '#ffffff'}; transition: background 0.15s ease;">
                <td style="padding: 10px 12px; text-align: right; vertical-align: middle;">
                    <div style="font-weight: 900; color: #0c2461; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(m.name)}">
                        ${escapeHtml(m.name)}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                        <span style="font-size: 0.72rem; color: #475569; font-family: monospace; font-weight: 800; background: #f1f5f9; padding: 1px 6px; border-radius: 4px;">كود: ${escapeHtml(m.code)}</span>
                        <span class="badge ${m.gender === 'بنات' ? 'bg-danger' : 'bg-primary'}" style="font-size: 0.68rem; padding: 1px 6px;">${escapeHtml(m.gender)}</span>
                    </div>
                </td>
                <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${escapeHtml(m.stage)}
                    </div>
                    <div style="display: inline-block; max-width: 100%;">
                        ${badgeHtml}
                    </div>
                </td>
                <td style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    ${m.phone ? `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <div style="display: flex; gap: 4px; align-items: center; justify-content: center;">
                                <button type="button" class="btn-custom" onclick="sendWhatsAppAbsenceDirect('${escapeHtml(m.name)}', '${cleanPhone}', ${m.consecutiveWeeks}, this, '${escapeHtml(m.gender || '')}')" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                                    <i class="fa-brands fa-whatsapp"></i> افتقاد واتساب 🚀
                                </button>
                                <a href="tel:${m.phone}" class="btn-custom" style="padding: 4px 7px; font-size: 0.75rem; background: #f1f5f9; color: #334155; text-decoration: none; border-radius: 6px;" title="اتصال هاتفي">
                                    <i class="fa-solid fa-phone"></i>
                                </a>
                            </div>
                            <span style="font-family: monospace; font-size: 0.76rem; font-weight: 800; color: #64748b; direction: ltr; unicode-bidi: isolate;" dir="ltr">
                                ${m.phone}
                            </span>
                        </div>
                    ` : '<span style="color:#94a3b8; font-size:0.75rem;">لا يوجد هاتف</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

function printCriticalAbsenceList() {
    const critical = (window.lastRadarAbsentMems || []).filter(m => m.consecutiveWeeks >= 3);
    if (critical.length === 0) {
        alert('نشكر ربنا! لا توجد حالات انقطاع حرج (3+ أسابيع) حالياً.');
        return;
    }

    const printWin = window.open('', '_blank', 'width=800,height=600');
    const todayStr = new Date().toLocaleDateString('ar-EG');
    let rowsHtml = critical.map((m, idx) => `
        <tr style="border-bottom: 1px solid #ccc; text-align: center;">
            <td style="padding: 8px;">${idx + 1}</td>
            <td style="padding: 8px; text-align: right; font-weight: bold;">${escapeHtml(m.name)}</td>
            <td style="padding: 8px;">${escapeHtml(m.code)}</td>
            <td style="padding: 8px;">${escapeHtml(m.stage)}</td>
            <td style="padding: 8px; font-weight: bold; color: red;">${m.consecutiveWeeks} أسابيع</td>
            <td style="padding: 8px;">${m.phone || '-'}</td>
            <td style="padding: 8px; width: 140px; border-right: 1px solid #ddd;">&nbsp;</td>
        </tr>
    `).join('');

    printWin.document.write(`
        <html dir="rtl" lang="ar">
        <head>
            <title>كشف الافتقاد المنزلي العاجل - حالات الانقطاع 3+ أسابيع</title>
            <style>
                body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 20px; direction: rtl; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th { background: #f3f4f6; border-bottom: 2px solid #333; padding: 8px; font-size: 0.9rem; }
            </style>
        </head>
        <body>
            <div style="text-align: center; border-bottom: 2px solid #0c2461; padding-bottom: 10px;">
                <h2 style="margin: 0; color: #0c2461;">اجتماع القديس بولس لإعداد الخدام</h2>
                <h3 style="margin: 4px 0; color: #dc2626;">كشف الافتقاد المنزلي العاجل (حالات الانقطاع 3 أسابيع فأكثر)</h3>
                <p style="margin: 0; color: #64748b; font-size: 0.9rem;">تاريخ الطباعة: ${todayStr} | إجمالي الحالات: ${critical.length} مخدوم</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>م</th><th>المخدوم</th><th>الكود</th><th>الفرقة</th><th>أسابيع الانقطاع</th><th>الهاتف</th><th>ملاحظات الزيارة</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div>مسؤول الافتقاد: ...........................</div>
                <div>أمين الخدمة: ...........................</div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    printWin.document.close();
}

function renderRadarBirthdays(filterMode = 'week') {
    const tbody = document.getElementById('radar_birthdaysTableBody');
    const btnWeek = document.getElementById('btnRadarBdayFilterWeek');
    const btnMonth = document.getElementById('btnRadarBdayFilterMonth');
    if (!tbody) return;

    if (btnWeek && btnMonth) {
        if (filterMode === 'week') {
            btnWeek.style.background = '#b45309'; btnWeek.style.color = '#ffffff';
            btnMonth.style.background = '#fef3c7'; btnMonth.style.color = '#92400e';
        } else {
            btnMonth.style.background = '#b45309'; btnMonth.style.color = '#ffffff';
            btnWeek.style.background = '#fef3c7'; btnWeek.style.color = '#92400e';
        }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const parseDobParts = (dob) => {
        if (!dob) return null;
        let cleanDob = dob.toString().trim();
        let parts;
        if (cleanDob.includes('-')) {
            parts = cleanDob.split('-');
            return parts[0].length === 4 ? { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) } : { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
        } else if (cleanDob.includes('/')) {
            parts = cleanDob.split('/');
            return parts[0].length === 4 ? { year: parseInt(parts[0]), month: parseInt(parts[1]), day: parseInt(parts[2]) } : { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
        }
        return null;
    };

    let list = [];
    (members || []).forEach(m => {
        if (m.dob) {
            const p = parseDobParts(m.dob);
            if (p) {
                const diffDays = p.day - currentDay;
                const isMatch = filterMode === 'week' 
                    ? (p.month === currentMonth && Math.abs(diffDays) <= 4)
                    : (p.month === currentMonth);
                if (isMatch) {
                    list.push({ 
                        name: m.name, 
                        gender: m.gender || 'بنين',
                        role: 'دارس (' + (m.stage || 'سنة أولى') + ')', 
                        phone: m.phone || '', 
                        date: `${p.day}/${p.month}`, 
                        diffDays 
                    });
                }
            }
        }
    });

    (servants || []).forEach(s => {
        if (s.dob) {
            const p = parseDobParts(s.dob);
            if (p) {
                const diffDays = p.day - currentDay;
                const isMatch = filterMode === 'week' 
                    ? (p.month === currentMonth && Math.abs(diffDays) <= 4)
                    : (p.month === currentMonth);
                if (isMatch) {
                    const servGender = s.gender || ((s.role && s.role.includes('خادمة')) ? 'بنات' : 'بنين');
                    list.push({ 
                        name: s.name, 
                        gender: servGender,
                        role: 'خادم (' + (s.role || 'خادم') + ')', 
                        phone: s.phone || '', 
                        date: `${p.day}/${p.month}`, 
                        diffDays 
                    });
                }
            }
        }
    });

    list.sort((a, b) => a.diffDays - b.diffDays);
    window.lastRadarBirthdaysList = list;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; color: #92400e; font-weight: bold; background: #fffbeb;">لا توجد أعياد ميلاد مسجلة في هذا النطاق حالياً. 🎂</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(b => {
        let cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;
        const isF = isFemaleMemberOrName(b.name, b.gender, b.role);
        const waMsg = encodeURIComponent(isF
            ? `كل سنة وأنتِ طيبة يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئكِ بعيد ميلادكِ وتصلي لكِ بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
            : `كل سنة وأنت طيب يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
        );

        let statusBadge = '';
        if (b.diffDays === 0) {
            statusBadge = '<span class="badge" style="background:#fde047; color:#78350f; font-weight:900; font-size:0.82rem; padding:4px 8px;">🎂 اليوم! مبارك</span>';
        } else if (b.diffDays > 0) {
            statusBadge = `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:bold; font-size:0.8rem; padding:4px 8px;">بعد ${b.diffDays} يوم</span>`;
        } else {
            statusBadge = `<span class="badge" style="background:#f1f5f9; color:#475569; font-weight:bold; font-size:0.8rem; padding:4px 8px;">منذ ${Math.abs(b.diffDays)} يوم</span>`;
        }

        return `
            <tr style="border-bottom: 1px solid #fef08a;">
                <td data-label="الاسم" style="padding: 8px; text-align: right; font-weight: bold; color: #78350f;">${escapeHtml(b.name)}</td>
                <td data-label="الصفة / الفرقة" style="padding: 8px; font-weight: bold; color: #475569;">${escapeHtml(b.role)}</td>
                <td data-label="تاريخ الميلاد" style="padding: 8px; font-weight: bold;">${escapeHtml(b.date)}</td>
                <td data-label="الموعد" style="padding: 8px;">${statusBadge}</td>
                <td data-label="الهاتف" style="padding: 8px;">${b.phone || '-'}</td>
                <td data-label="تهنئة واتساب" style="padding: 8px;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        ${cleanPhone ? `
                            <button type="button" class="btn-custom" onclick="sendWhatsAppBirthdayDirect('${escapeHtml(b.name)}', '${cleanPhone}', this, '${escapeHtml(b.gender || '')}')" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-brands fa-whatsapp"></i> تهنئة واتساب 🚀
                            </button>
                            <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="btn-custom" style="padding: 4px 6px; font-size: 0.75rem; background: #fefce8; color: #854d0e; border: 1px solid #fef08a; text-decoration: none; border-radius: 6px;" title="فتح يدوي">📲</a>
                        ` : '<span style="color:#94a3b8; font-size:0.75rem;">لا يوجد هاتف</span>'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterRadarBirthdays(filterMode = 'week') {
    return renderRadarBirthdays(filterMode);
}

async function sendBatchWeeklyBirthdays(btn) {
    const list = (window.lastRadarBirthdaysList || []).filter(b => b.phone && b.diffDays >= -1 && b.diffDays <= 4);
    if (list.length === 0) {
        alert('لا توجد أرقام هواتف مسجلة لمواليد هذا الأسبوع للإرسال.');
        return;
    }

    if (!confirm(`هل تريد إرسال رسائل تهنئة مباركة لعدد (${list.length}) مخدوم وخادم عبر واتساب الخدمة؟`)) {
        return;
    }

    const origHtml = btn.innerHTML;
    btn.disabled = true;

    let successCount = 0;
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري الإرسال (${i + 1}/${list.length}): ${escapeHtml(item.name)}...`;
        
        let cleanPhone = item.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;

        const isF = isFemaleMemberOrName(item.name, item.gender);
        const rawMsg = isF
            ? `كل سنة وأنتِ طيبة يا ${item.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئكِ بعيد ميلادكِ وتصلي لكِ بعام ملئ بالنعمة والبركة والسلام 🕊️✨`
            : `كل سنة وأنت طيب يا ${item.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`;
        
        try {
            const res = await fetch('http://127.0.0.1:3000/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                'x-api-key': 'khedmety-servant-key-2026' },
                body: JSON.stringify({ phone: cleanPhone, message: rawMsg })
            });
            if (res.ok) successCount++;
        } catch(e) {
            console.warn('Batch send error for:', item.name, e);
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    btn.disabled = false;
    btn.innerHTML = `✅ تم إرسال (${successCount} من ${list.length}) تهنئة بنجاح!`;
    setTimeout(() => { btn.innerHTML = origHtml; }, 5000);
}

// 📅 تحديد التاريخ المعتمد لحساب مؤشر حضور الاجتماع (الجمعة الأسبق أو اليوم الإضافي بعد ذلك)
function getResolvedMeetingKpiDate(attRecord = attendanceRecord, explicitDate = null) {
    const todayStr = (typeof today !== "undefined" && today) ? today : new Date().toISOString().split("T")[0];
    const recs = (typeof attRecord === "object" && attRecord) ? attRecord : {};

    if (explicitDate && recs[explicitDate] && recs[explicitDate].length > 0) {
        return explicitDate;
    }

    const todayObj = new Date(todayStr + "T12:00:00");
    const dayOfWeek = todayObj.getDay();

    const diffToFriday = (dayOfWeek - 5 + 7) % 7;
    const pastFriObj = new Date(todayObj);
    pastFriObj.setDate(todayObj.getDate() - diffToFriday);
    const pastFridayStr = pastFriObj.getFullYear() + "-" + String(pastFriObj.getMonth() + 1).padStart(2, "0") + "-" + String(pastFriObj.getDate()).padStart(2, "0");

    const datesWithAtt = Object.keys(recs).filter(d => {
        const list = recs[d];
        return Array.isArray(list) ? list.length > 0 : (list && typeof list === "object" && Object.keys(list).length > 0);
    }).sort().reverse();

    const extraDayAfterFriday = datesWithAtt.find(d => d > pastFridayStr && d <= todayStr);
    if (extraDayAfterFriday) {
        return extraDayAfterFriday;
    }

    if (recs[pastFridayStr] && recs[pastFridayStr].length > 0) {
        return pastFridayStr;
    }

    const latestFriday = datesWithAtt.find(d => {
        try {
            return new Date(d + "T12:00:00").getDay() === 5 && d <= todayStr;
        } catch(e) { return false; }
    });
    if (latestFriday) {
        return latestFriday;
    }

    if (datesWithAtt.length > 0) {
        return datesWithAtt[0];
    }

    return pastFridayStr;
}
window.getResolvedMeetingKpiDate = getResolvedMeetingKpiDate;

function formatMeetingDateArabicLabel(dateStr) {
    if (!dateStr) return "";
    try {
        const dt = new Date(dateStr + "T12:00:00");
        const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const dayName = dayNames[dt.getDay()];
        const dayNum = dt.getDate();
        const monthName = monthNames[dt.getMonth()];
        const isFri = dt.getDay() === 5;
        return dayName + " " + dayNum + " " + monthName + (!isFri ? " (لقاء إضافي)" : "");
    } catch(e) {
        return dateStr;
    }
}
window.formatMeetingDateArabicLabel = formatMeetingDateArabicLabel;

function renderRadarDashboard() {
        if (!members || members.length === 0) return;
        renderRadarCopticFasting();

        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();

        // 1. تحديد التواريخ الخاصة بالاجتماعات (الجمعة الأسبق أو اليوم الإضافي بعد ذلك)
        const activeDate = getResolvedMeetingKpiDate(attendanceRecord, activeSelectedDate);
        const currentList = attendanceRecord[activeDate] || [];

        const totalMems = members.length;
        const attendedCount = currentList.filter(r => r.attended && !r.isAbsentDueToDelay).length;
        const liturgyCount = currentList.filter(r => r.communion || r.liturgy).length;
        const liturgyPct = attendedCount > 0 ? Math.round((liturgyCount / attendedCount) * 100) : 0;

        // تحديث كروت النبض
        const elMeetingAtt = document.getElementById('radar_kpiMeetingAttended');
        if (elMeetingAtt) elMeetingAtt.textContent = attendedCount;
        const elTotalMems = document.getElementById('radar_kpiTotalMembers');
        if (elTotalMems) {
            const dateLabel = formatMeetingDateArabicLabel(activeDate);
            elTotalMems.textContent = "من إجمالي " + totalMems + " مخدوم (" + (totalMems > 0 ? Math.round((attendedCount/totalMems)*100) : 0) + "%) • " + dateLabel;
        }

        const elLiturgyPct = document.getElementById('radar_kpiLiturgyPct');
        if (elLiturgyPct) elLiturgyPct.textContent = `${liturgyPct}%`;
        const elLiturgyCount = document.getElementById('radar_kpiLiturgyCount');
        if (elLiturgyCount) elLiturgyCount.textContent = `${liturgyCount} من ${attendedCount} حاضرين تناولوا بالقداس`;

        // 2. حساب الغياب المتتالي المحصّن (Absence Radar)
        let sSettings = {};
        try { 
            sSettings = (typeof settings === 'object' && settings) 
                ? settings 
                : (JSON.parse(localStorage.getItem('khedmty_settings')) || JSON.parse(localStorage.getItem('my_church_settings')) || {}); 
        } catch(e){}

        const rawServiceStart = sSettings.serviceStart || (typeof settings === 'object' && settings.serviceStart) || '2026-11-06';
        let normalizedServiceStart = '2026-11-06';
        if (rawServiceStart) {
            const s = String(rawServiceStart).trim();
            if (s.includes('/')) {
                const parts = s.split('/');
                if (parts[0].length === 4) normalizedServiceStart = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                else if (parts[2].length === 4) normalizedServiceStart = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else if (s.includes('-')) {
                normalizedServiceStart = s;
            }
        }
        const todayIso = new Date().toISOString().split('T')[0];

        // فقط لقاءات الجمعة الرسمية التي انعقد فيها الاجتماع فعلياً وضمن نطاق بداية الخدمة
        const validMeetingDates = allDates.filter(d => {
            try {
                const dt = new Date(d);
                if (dt.getDay() !== 5) return false; // يوم الجمعة فقط
                if (d < normalizedServiceStart || d > todayIso) return false;
                const recs = attendanceRecord[d];
                const hasData = Array.isArray(recs) ? recs.length > 0 : (recs && typeof recs === 'object' && Object.keys(recs).length > 0);
                return hasData;
            } catch(e) {
                return false;
            }
        }).sort().reverse();

        window.lastValidMeetingDates = validMeetingDates;
        const totalPastFridays = validMeetingDates.length;
        const absentMems = [];

        if (totalPastFridays > 0) {
            members.forEach(m => {
                const mCode = String(m.code || m.id || '').trim();
                let consecAbs = 0;
                let lastSeen = null;

                for (let i = 0; i < validMeetingDates.length; i++) {
                    const d = validMeetingDates[i];
                    const recs = attendanceRecord[d] || [];
                    let found = null;
                    if (Array.isArray(recs)) {
                        found = recs.find(r => String(r.id) === String(m.id) || String(r.code) === mCode || (m.phone && String(r.phone) === String(m.phone)));
                    } else if (typeof recs === 'object' && recs !== null) {
                        found = recs[mCode] || Object.values(recs).find(r => r.name === m.name || (m.phone && r.phone === m.phone));
                    }

                    if (found && (found.attended === true || found.attended === 'true') && !found.isAbsentDueToDelay) {
                        if (!lastSeen) lastSeen = d;
                        break;
                    } else {
                        consecAbs++;
                    }
                }

                // سقف الغياب لا يمكن منطقياً أن يتجاوز عدد الجمعات المنعقدة أصلاً
                consecAbs = Math.min(consecAbs, totalPastFridays);

                // في الأسبوع الأول للخدمة (لقاء واحد فقط)، نعرض غياب هذا الأسبوع بدقة (أسبوع واحد)
                // وإذا كانت الخدمة في أسبوعين فأكثر، نرصد الغياب المتتالي (أسبوعين فأكثر)
                const shouldInclude = (totalPastFridays < 2 && consecAbs === 1) || (totalPastFridays >= 2 && consecAbs >= 2);

                if (shouldInclude) {
                    absentMems.push({
                        id: m.id,
                        code: m.code || m.id,
                        name: m.name,
                        phone: m.phone || '',
                        stage: m.stage || 'سنة أولى',
                        gender: m.gender || 'بنين',
                        consecutiveWeeks: consecAbs,
                        lastSeenDate: lastSeen || 'غير مسجل'
                    });
                }
            });
        }

        absentMems.sort((a, b) => b.consecutiveWeeks - a.consecutiveWeeks);
        window.lastRadarAbsentMems = absentMems;

        const elAbsCount = document.getElementById('radar_kpiAbsenceCount');
        if (elAbsCount) {
            // كارت KPI يعبر عن الغياب المتتالي (2+ أسبوع) فقط
            const twoWeeksPlus = absentMems.filter(m => m.consecutiveWeeks >= 2);
            elAbsCount.textContent = twoWeeksPlus.length;
        }
        const elAbsBadge = document.getElementById('radar_absenceAlertBadge');
        if (elAbsBadge) {
            if (totalPastFridays < 2) {
                elAbsBadge.innerHTML = `<i class="fa-solid fa-seedling text-success"></i> تم رصد: ${absentMems.length} غائب (أول لقاء 2026-11-06) 🕊️`;
            } else {
                elAbsBadge.innerHTML = `<i class="fa-solid fa-bell"></i> تم رصد: ${absentMems.length} مخدومين`;
            }
        }

        // رسم جدول الغياب الذكي
        renderRadarAbsenceTableBody();

        // 3. رسم نبض الاجتماع البياني
        renderRadarPulseChart(validMeetingDates);

        // 4. رادار مهلة الاعتراف
        renderRadarConfessionSection();

        // 5. رادار أعياد الميلاد
        renderRadarBirthdays('week');

        // 6. تحميل رادار الاعتذارات اللحظية
        loadRadarExcuses();

        // 7. تحميل درع الأمان والتراخيص
        loadSecurityShieldData();
    }

        function renderRadarConfessionSection() {
        let candidates = [];
        try {
            candidates = JSON.parse(localStorage.getItem('khedmety_candidates_grades')) || [];
        } catch (e) { candidates = []; }

        const now = new Date();
        const pendingConf = [];

        candidates.forEach(c => {
            const code = String(c.code || '');
            let conf = String(c.confessor || '').trim();
            let lastConf = c.lastConfession || null;

            if (!lastConf) {
                const rawConf = localStorage.getItem('khedmety_student_confession_' + code) || localStorage.getItem('khedmety_private_confession_' + code);
                if (rawConf) {
                    try {
                        const p = JSON.parse(rawConf);
                        lastConf = (typeof p === 'string') ? p : (p.date || p.lastConfession || null);
                    } catch(e) {
                        lastConf = rawConf;
                    }
                }
            }

            let daysAgo = 999;
            if (lastConf) {
                const dt = new Date(lastConf);
                if (!isNaN(dt.getTime())) {
                    daysAgo = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
                }
            }

            const isConfClean = (conf && conf !== 'لا يوجد' && conf !== 'none' && conf !== 'لم يحدد');
            const hasProb = c.problemType && c.problemType.includes('اعتراف');

            // إذا كان المخدوم سجل اعترافاً حديثاً (خلال 40 يوماً) يتم اعتباره منتظماً
            if (daysAgo <= 40) {
                if (hasProb || !isConfClean) {
                    c.confessor = (conf && isConfClean) ? conf : 'منتظم بالاعتراف';
                    c.problemType = 'لا توجد مشاكل (مقبول طبيعي) 🟢';
                    c.lastConfession = lastConf;
                }
            } else {
                // إذا لم يكن لديه أب اعتراف أو تأخر أكثر من 40 يوماً
                let countdownText = '⏳ مهلة أسبوعين لتحديد أب الاعتراف';
                let countdownClass = 'radar-alert-warning';
                if (daysAgo > 40 && daysAgo < 999) {
                    countdownText = `⚠️ تأخر عن الاعتراف (${daysAgo} يوم)`;
                    countdownClass = 'radar-alert-danger';
                }
                pendingConf.push({
                    name: c.name,
                    code: c.code,
                    confessor: conf || 'لا يوجد أب اعتراف',
                    phone: c.phone || '',
                    countdownText,
                    countdownClass,
                    daysAgo
                });
            }
        });

        // حفظ التحديث التلقائي للمقبولين
        try {
            localStorage.setItem('khedmety_candidates_grades', JSON.stringify(candidates));
        } catch(e) {}

        const elConfCount = document.getElementById('radar_kpiConfessionCount');
        if (elConfCount) elConfCount.textContent = pendingConf.length;
        const elConfBadge = document.getElementById('radar_confessionAlertBadge');
        if (elConfBadge) elConfBadge.textContent = `${pendingConf.length} في فترة السماح`;

        const tbodyConf = document.getElementById('radar_confessionTableBody');
        if (tbodyConf) {
            if (pendingConf.length === 0) {
                tbodyConf.innerHTML = `<tr><td colspan="6" style="padding: 20px; color: #166534; font-weight: bold; background: #f0fdf4;">نشكر ربنا! جميع المخدومين منتظمون بالاعتراف ولا توجد مشاكل معلقة. 🟢</td></tr>`;
            } else {
                tbodyConf.innerHTML = pendingConf.map(c => {
                    return `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td data-label="المخدوم" style="padding: 8px; text-align: right; font-weight: bold; color: #0c2461;">${c.name}</td>
                            <td data-label="الكود" style="padding: 8px; font-weight: bold;">${c.code}</td>
                            <td data-label="أب الاعتراف" style="padding: 8px; color: #b45309; font-weight: bold;">${c.confessor}</td>
                            <td data-label="مهلة الاعتراف" style="padding: 8px;">
                                <span class="radar-alert-badge ${c.countdownClass}">
                                    ${c.countdownText}
                                </span>
                            </td>
                            <td data-label="الهاتف" style="padding: 8px;">${c.phone || '-'}</td>
                            <td data-label="الإجراء" style="padding: 8px;">
                                <button type="button" class="btn-custom" onclick="quickResolveRadarConfession('${c.code}')" style="padding: 4px 10px; font-size: 0.75rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 6px; font-weight: bold; cursor: pointer;">
                                    <i class="fa-solid fa-check-double me-1 text-success"></i> حل المشكلة والاعتماد
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    function quickResolveRadarConfession(code) {
        let candidates = [];
        try {
            candidates = JSON.parse(localStorage.getItem('khedmety_candidates_grades')) || [];
        } catch (e) { candidates = []; }

        const c = candidates.find(item => String(item.code) === String(code));
        if (c) {
            c.confessor = 'منتظم بالاعتراف (تم الاعتماد)';
            c.problemType = 'لا توجد مشاكل (مقبول طبيعي) 🟢';
            localStorage.setItem('khedmety_candidates_grades', JSON.stringify(candidates));
            alert(`تم اعتماد انتظام الاعتراف للمخدوم [${c.name}] وترقيته بنجاح! ✅`);
            renderRadarConfessionSection();
        }
    }

    // 4. تصدير شيت الإكسيل الأسبوعي المؤتمت
    function exportWeeklyExcelSheet() {
        if (!window.XLSX) {
            alert('مكتبة تصدير الإكسيل غير جاهزة حالياً. يرجى التأكد من الاتصال أو إعادة تحميل الصفحة.');
            return;
        }

        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();
        const activeDate = activeSelectedDate || allDates[0] || new Date().toISOString().split('T')[0];
        const currentList = attendanceRecord[activeDate] || [];

        const rows = [
            ["كشف الحضور الأسبوعي والقداس الإلهي — اجتماع القديس بولس لإعداد الخدام"],
            [`تاريخ الجلسة: ${activeDate}`, `إجمالي الحضور: ${currentList.filter(r => r.attended && !r.isAbsentDueToDelay).length}`, `إجمالي المسجلين: ${members.length}`],
            [],
            ["م", "كود المخدوم", "اسم المخدوم", "النوع", "المرحلة / الفرقة", "حالة الحضور", "ساعة الحضور بالدقيقة", "حضور القداس والتناول", "رقم الهاتف"]
        ];

        members.forEach((m, idx) => {
            const mCode = String(m.code || m.id || '');
            const att = currentList.find(r => String(r.id) === String(m.id) || String(r.code) === mCode);

            let statusStr = "غائب 🔴";
            let timeStr = "-";
            let liturgyStr = "غائب";

            if (att && att.attended) {
                if (att.isAbsentDueToDelay) {
                    statusStr = "تأخير شديد (غائب)";
                } else {
                    statusStr = "حاضر ✅";
                }
                timeStr = att.time || "-";
                liturgyStr = (att.communion || att.liturgy) ? "حاضر قداس وتناول 🍞" : "اجتماع فقط";
            }

            rows.push([
                idx + 1,
                m.code || m.id,
                m.name,
                m.gender || 'بنين',
                m.stage || 'سنة أولى',
                statusStr,
                timeStr,
                liturgyStr,
                m.phone || '-'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "حضور_الاجتماع_والقداس");

        const fileName = `شيت_حضور_وقداس_الاجتماع_${activeDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    // 5. معالجة نسيان الباسورد عن طريق الخادم (Offline Password Reset)
    function offlineSearchAndResetPassword() {
        const query = (document.getElementById('radar_txtStudentSearch').value || '').trim().toLowerCase();
        const resultEl = document.getElementById('radar_resetResultMsg');
        if (!query) {
            alert('الرجاء إدخال اسم المخدوم أو كوده للبحث.');
            return;
        }

        const found = members.find(m => {
            const name = String(m.name || '').toLowerCase();
            const code = String(m.code || m.id || '').toLowerCase();
            return name.includes(query) || code === query;
        });

        if (!found) {
            resultEl.style.display = 'block';
            resultEl.style.color = '#dc2626';
            resultEl.textContent = `❌ لم يتم العثور على أي مخدوم يطابق: "${query}". يرجى التأكد من الاسم أو الكود.`;
            return;
        }

        const defaultPass = String(found.code || found.id || '123456');
        found.password = defaultPass;
        found.passwordHash = null;
        found.isLocked = false;
        found.loginFailCount = 0;

        // حفظ في الذاكرة المحلية
        saveMembers();

        resultEl.style.display = 'block';
        resultEl.style.color = '#166534';
        resultEl.innerHTML = `✅ تم بنجاح إعادة تعيين كلمة المرور للمخدوم: <strong>[${found.name}]</strong>.<br>كلمة المرور الحالية هي كوده الافتراضي: <span style="background:#dcfce7; padding:2px 8px; border-radius:4px; font-family:monospace; font-size:1.1rem; color:#15803d;">${defaultPass}</span> (يستطيع الدخول بها الآن وتغييرها).`;
        
        alert(`تمت إعادة تعيين كلمة مرور [${found.name}] بنجاح! ✅\nكلمة مروره الحالية هي: ${defaultPass}`);
    }

    function switchTab(tabId, btn) {
        // 🛡️ صمام الأمان الصارم لمنع الوصول لأي تبويب محجوب بقرار أمانة الخدمة
        if (typeof window.isTabForbiddenForCurrentUser === 'function' && window.isTabForbiddenForCurrentUser(tabId)) {
            console.warn('⛔ [Security Gate] محاولة دخول محظورة للتبويب المحجوب:', tabId);
            if (typeof showToast === 'function') {
                showToast('⛔ عذراً: هذا القسم محجوب بقرار من أمانة الخدمة', true);
            }
            tabId = 'dashTab';
            btn = document.querySelector(".tab-btn[onclick*='dashTab']");
        }

        if (!tabId || !document.getElementById(tabId)) {
            tabId = 'dashTab';
        }

document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

let targetTab = document.getElementById(tabId);

if (targetTab) targetTab.classList.add('active');

let targetBtn = btn || document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);

if (targetBtn) targetBtn.classList.add('active');

// مزامنة حالة التبويب في عنوان URL والتخزين المؤقت للجلسة دون إعادة تحميل الصفحة

try {

if (typeof window !== 'undefined' && window.location && window.history && typeof window.history.replaceState === 'function') {

const currentUrl = new URL(window.location.href);

if (currentUrl.searchParams.get('tab') !== tabId) {

currentUrl.searchParams.set('tab', tabId);

window.history.replaceState({ tab: tabId }, '', currentUrl.toString());

}

const userKey = (window.AuthClient && typeof AuthClient.getUser === 'function' && AuthClient.getUser()?.id) || 

(typeof currentUser !== 'undefined' && currentUser && currentUser.id) || 'guest';

sessionStorage.setItem('khedmety_tab_' + userKey, tabId);

}

} catch (navErr) {

console.warn('[Dashboard] تعذر مزامنة مسار التبويب:', navErr);

}

if (tabId !== 'attendanceTab') stopCamera();

if (tabId === 'servantsAttendanceTab') renderServantsAttendanceTable();

if (tabId === 'planTab') renderMasterPlanTable();

if (tabId === 'coursesTab' && window.CoursesModule) CoursesModule.render();

if (tabId === 'servantsTab') renderServantsTable();

if (tabId === 'auditTab') renderAuditLogTable();

if (tabId === 'rolloverTab') renderRolloverCandidateList();

            if (tabId === 'feedbackTab') loadServantFeedback();

if (tabId === 'radarTab') renderRadarDashboard();
            if (tabId === 'dashTab') { renderDashboard(); checkUpcomingBirthdays(); checkUpcomingMasterPlanEvents(); }

if (tabId === 'settingsTab') { updateCloudUsageUI(); renderAutoBackupsList(); renderBonusSettingsUI(); renderConferenceSettingsUI(); if(typeof renderUnifiedPublishStatus==='function') renderUnifiedPublishStatus(); }

if (tabId === 'materialsTab') renderMaterialsList();

if (tabId === 'reflectionsTab') renderReflectionsTable();

if (tabId === 'broadcastTab') renderBroadcastList('parents');

if (tabId === 'dataTab') { checkLocalStorageUsage(); if (typeof renderAttendanceCalendar === 'function') renderAttendanceCalendar(); }

if (tabId === 'cloudUsageTab') updateCloudUsageMetrics();

if (tabId === 'followupTab') renderFollowupTab();

}

// دعم زر الرجوع والتقدم في المتصفح للتنقل بين التبويبات دون إعادة تحميل

if (typeof window !== 'undefined') {

window.switchTab = switchTab;
window.addEventListener('popstate', function (e) {

const urlTab = new URLSearchParams(window.location.search).get('tab');

const target = (e.state && e.state.tab) || urlTab;

if (target && document.getElementById(target)) {

switchTab(target);

}

});

}

// ==========================================

if (typeof window !== 'undefined') {
    window.renderRadarDashboard = renderRadarDashboard;
    window.renderRadarPulseChart = renderRadarPulseChart;
    window.renderRadarBirthdays = renderRadarBirthdays;
    window.filterRadarBirthdays = filterRadarBirthdays;
    window.filterRadarAbsence = filterRadarAbsence;
    window.printCriticalAbsenceList = printCriticalAbsenceList;
    window.sendWhatsAppAbsenceDirect = sendWhatsAppAbsenceDirect;
    window.sendBatchWeeklyBirthdays = sendBatchWeeklyBirthdays;
}


// ==========================================
// 🛡️ دوال درع الأمان والرقابة الرقمية (Security Shield Logic)
// ==========================================
async function loadSecurityShieldData() {
    const tbody = document.getElementById('sec_tokensTableBody');
    if (!tbody) return;

    try {
        const res = await fetch('http://127.0.0.1:3000/api/security/tokens', {
            headers: { 'x-api-key': 'khedmety-servant-key-2026' }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.tokens) {
                renderSecurityTokensTable(data.tokens);
                return;
            }
        }
    } catch(e) {
        console.warn('[SecurityShield] تعذر الاتصال بمحرك الأمان، جاري استخدام العرض الآمن:', e);
    }

    // عرض بديل في حالة عدم تشغيل المحرك
    renderSecurityTokensTable([
        { id: 1, name: 'مفتاح أمين الخدمة العام (Master Admin)', token: 'khedmety-master-key-2026', role: 'admin', allowed_stages: '*', hourly_limit: 9999, is_active: 1 },
        { id: 2, name: 'مفتاح الخدام المعتمد الافتراضي', token: 'khedmety-servant-key-2026', role: 'servant', allowed_stages: '*', hourly_limit: 120, is_active: 1 }
    ]);
}

function renderSecurityTokensTable(tokens) {
    const tbody = document.getElementById('sec_tokensTableBody');
    if (!tbody) return;

    if (!tokens || tokens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding:15px; color:#64748b;">لا توجد مفاتيح مسجلة.</td></tr>';
        return;
    }

    tbody.innerHTML = tokens.map(t => {
        const isMaster = t.role === 'admin';
        const maskedToken = t.token.length > 12 ? t.token.substring(0, 10) + '••••••••' : t.token;
        const stageBadge = t.allowed_stages === '*' 
            ? '<span class="badge" style="background:#dcfce7; color:#15803d;">كافة المراحل (شامل) 🌐</span>'
            : `<span class="badge" style="background:#fef3c7; color:#b45309;">${escapeHtml(t.allowed_stages)}</span>`;

        return `
            <tr style="border-bottom: 1px solid #e0f2fe; background: ${t.is_active ? 'transparent' : '#f8fafc'};">
                <td data-label="اسم الترخيص" style="padding: 10px 8px; text-align: right; font-weight: bold; color: #0c2461;">
                    ${escapeHtml(t.name)}
                </td>
                <td data-label="مفتاح الترخيص" style="padding: 10px 8px; font-family: monospace; font-size: 0.85rem;">
                    <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;" title="${escapeHtml(t.token)}">
                        ${escapeHtml(maskedToken)}
                    </span>
                    <button type="button" onclick="copySecurityToken('${escapeHtml(t.token)}')" class="btn-mini" style="background: transparent; border: none; cursor: pointer; color: #0284c7;" title="نسخ المفتاح">📋</button>
                </td>
                <td data-label="الدور" style="padding: 10px 8px;">
                    <span class="badge ${isMaster ? 'bg-danger' : 'bg-primary'}" style="font-size: 0.75rem;">
                        ${isMaster ? 'أمين الخدمة 👑' : 'خادم أسرة 👤'}
                    </span>
                </td>
                <td data-label="المرحلة المسموحة" style="padding: 10px 8px;">${stageBadge}</td>
                <td data-label="سقف الإرسال" style="padding: 10px 8px; font-weight: bold; color: #475569;">
                    ${t.hourly_limit} رسالة/ساعة
                </td>
                <td data-label="الحالة والإجراء" style="padding: 10px 8px;">
                    ${t.is_active ? `
                        <span class="badge bg-success" style="font-size: 0.75rem;">نشط 🟢</span>
                        ${!isMaster ? `<button type="button" onclick="revokeSecurityToken(${t.id})" class="btn-mini btn-danger ms-1" style="cursor:pointer; font-size:0.7rem; padding:2px 6px;">إيقاف</button>` : ''}
                    ` : '<span class="badge bg-secondary" style="font-size: 0.75rem;">معطل 🔴</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

function copySecurityToken(token) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(token);
        alert('تم نسخ مفتاح الترخيص الأمني إلى الحافظة بنجاح! 📋');
    } else {
        prompt('انسخ المفتاح يدوياً:', token);
    }
}

async function createNewSecurityToken() {
    const servantName = prompt('أدخل اسم الخادم أو الغرض من الترخيص (مثال: خادم أولى بنين - أ. مينا):');
    if (!servantName || !servantName.trim()) return;

    const stageChoice = prompt('حدد نطاق المرحلة المسموحة للمفتاح:\nاكتب (*) للوصول الشامل، أو اسم المرحلة تحديداً (مثال: سنة أولى أو سنة ثانية):', '*');
    if (stageChoice === null) return;

    try {
        const res = await fetch('http://127.0.0.1:3000/api/security/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'khedmety-master-key-2026'
            },
            body: JSON.stringify({
                name: servantName.trim(),
                role: stageChoice.trim() === '*' ? 'admin' : 'servant',
                allowed_stages: stageChoice.trim(),
                hourly_limit: stageChoice.trim() === '*' ? 300 : 60
            })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`تم بنجاح إصدار المفتاح الأمني للخادم [ ${servantName} ]:\nالمفتاح: ${data.token.token}\nالنطاق: ${data.token.allowed_stages}`);
            loadSecurityShieldData();
        } else {
            alert('تعذر إصدار المفتاح من المحرك. تأكد من تشغيل السيرفر.');
        }
    } catch(err) {
        alert('تعذر الاتصال بمحرك الأمان: ' + err.message);
    }
}

async function revokeSecurityToken(id) {
    if (!confirm('هل أنت متأكد من رغبتك في إيقاف وإلغاء هذا المفتاح الأمني؟')) return;
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/security/tokens/${id}`, {
            method: 'DELETE',
            headers: { 'x-api-key': 'khedmety-master-key-2026' }
        });
        if (res.ok) {
            alert('تم إيقاف المفتاح بنجاح! ✅');
            loadSecurityShieldData();
        }
    } catch(e) {
        alert('حدث خطأ أثناء إيقاف المفتاح: ' + e.message);
    }
}

async function toggleSecurityAuditLogs() {
    const container = document.getElementById('sec_auditLogsContainer');
    const listEl = document.getElementById('sec_auditLogsList');
    if (!container || !listEl) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    listEl.innerHTML = '<div style="color:#94a3b8;">جاري جلب سجل التدقيق الأمني...</div>';

    try {
        const res = await fetch('http://127.0.0.1:3000/api/security/audit-logs', {
            headers: { 'x-api-key': 'khedmety-servant-key-2026' }
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.logs && data.logs.length > 0) {
                listEl.innerHTML = data.logs.map(l => {
                    const time = new Date(l.created_at).toLocaleTimeString('ar-EG');
                    const isOk = l.status === 'allowed';
                    const color = isOk ? '#4ade80' : '#f87171';
                    return `
                        <div style="border-bottom: 1px dashed #334155; padding: 4px 0; display: flex; justify-content: space-between; gap: 8px;">
                            <span>[${time}] <strong style="color:#38bdf8;">${escapeHtml(l.token_name)}</strong> ➔ ${escapeHtml(l.endpoint)} (${escapeHtml(l.phone_target || 'عام')})</span>
                            <span style="color: ${color}; font-weight: bold;">${l.status === 'allowed' ? 'مصرح 🟢' : 'محظور 🔴 (' + escapeHtml(l.reason) + ')'}</span>
                        </div>
                    `;
                }).join('');
                return;
            }
        }
    } catch(e) {}

    listEl.innerHTML = '<div style="color:#94a3b8;">لا توجد أحداث أمنية مسجلة حديثاً (نشكر ربنا). 🟢</div>';
}

if (typeof window !== 'undefined') {
    window.loadSecurityShieldData = loadSecurityShieldData;
    window.createNewSecurityToken = createNewSecurityToken;
    window.revokeSecurityToken = revokeSecurityToken;
    window.toggleSecurityAuditLogs = toggleSecurityAuditLogs;
    window.copySecurityToken = copySecurityToken;
}


// ==========================================
// 🔔 دوال رادار الاعتذارات اللحظية (Inbound Excuses Logic)
// ==========================================
window.lastRadarExcusesList = [];
window.currentRadarExcuseFilter = 'pending';

// 🛡️ التخزين التأسيسي للأعذار لضمان عدم اختفائها أبداً عند إغلاق البوت أو الدخول من الموبايل
const KHEDMETY_SEED_EXCUSES = [
    {
        "id": 3,
        "student_id": 64,
        "student_code": "1427",
        "student_name": "توماس ميشيل شكري",
        "student_phone": "201278429960",
        "stage": "سنة أولى",
        "message_text": "مساء الخير يا أستاذ عادل \nبعتذر عن عدم حضوري النهارده كان عندي امتحان امبارح و عندي امتحان الصبح معرفتش انزل من الاسماعيليه و فضلت في السكن هنا ❤️",
        "reason_category": "امتحانات ومذاكرة 📚",
        "friday_date": "2026-11-06",
        "status": "pending",
        "servant_notes": "اعتذار لاحق (متأخر بعد الاجتماع)",
        "resolved_by": "late_submission",
        "created_at": 1794001329396
    },
    {
        "id": 4,
        "student_id": 63,
        "student_code": "1414",
        "student_name": "بيشوي جرجس خيري",
        "student_phone": "201550208665",
        "stage": "سنة أولى",
        "message_text": "صباح الخير، أنا بعتذر جدًا عن عدم حضوري أول يوم في الخدمة، للأسف كنت تعبان وعندي نزله معويه ، وده خلاني مش قادر أحضر. كان نفسي أكون موجود معاكم من أول يوم بس بامانه مقدرتش اجي من التعب . بعتذر مرة تانية،باذن ربنا هكون معاكم في المرات الجاية.",
        "reason_category": "ظروف صحية 🩺",
        "friday_date": "2026-11-06",
        "status": "pending",
        "servant_notes": "اعتذار لاحق (متأخر بعد الاجتماع)",
        "resolved_by": "late_submission",
        "created_at": 1794024577947
    },
    {
        "id": 5,
        "student_id": 16,
        "student_code": "1446",
        "student_name": "بيشوي تامر عزت",
        "student_phone": "201094076923",
        "stage": "سنة أولى",
        "message_text": "اعتذار",
        "reason_category": "اعتذار عام 🕊️",
        "friday_date": "2026-11-06",
        "status": "pending",
        "servant_notes": "اعتذار مسبق (قبل الاجتماع)",
        "resolved_by": "prior_submission",
        "created_at": 1793897506884
    },
    {
        "id": 6,
        "student_id": 58,
        "student_code": "1219",
        "student_name": "چون مجدي ثروت",
        "student_phone": "201203640428",
        "stage": "سنة أولى",
        "message_text": "ايه الاخبار ي استاذ عادل امتحان الميدترم عندي بكرا مسائي ف الدكتور عملت مراجعه انهاردا وهتعمل تاني بكرا هتبداء الساعه 12 ف هحاول اخلص واجي احضر اي حاجه",
        "reason_category": "امتحانات ومذاكرة 📚",
        "friday_date": "2026-11-06",
        "status": "pending",
        "servant_notes": "اعتذار مسبق (قبل الاجتماع)",
        "resolved_by": "prior_submission",
        "created_at": 1793921847075
    },
    {
        "id": 7,
        "student_id": 56,
        "student_code": "1049",
        "student_name": "فيلوباتير نسيم لمعي",
        "student_phone": "201220277925",
        "stage": "سنة أولى",
        "message_text": "كنت عايز اعتذر اني معرفتش اجي امبارح عشان كنت مشغول وبعمل حجات مع بابا مع شغلوا لحد الفجر ف صحيت متاخر",
        "reason_category": "اعتذار عام 🕊️",
        "friday_date": "2026-11-06",
        "status": "pending",
        "servant_notes": "اعتذار لاحق (متأخر ورد السبت بعد الاجتماع)",
        "resolved_by": "late_submission",
        "created_at": 1794052415669
    },
    {
        "id": 9,
        "student_id": 93,
        "student_code": "802",
        "student_name": "سانتي عوني عطالله",
        "student_phone": "201289505575",
        "stage": "سنة أولى",
        "message_text": "الشهر دي البلاك فرايدي و عندي كل جمعه حاجه في الشغل الجمعه الجايه هيكون عندي حاجه الصبح و مش عارفه هخلص الساعه كام فب ممكن بس اتاخر شويه ... ف ممكن اجي الخدمه الساعه ١.٣٠",
        "reason_category": "طلب تأخير مسبق بعذر (استئذان تأخير) ⏰",
        "friday_date": "2026-11-13",
        "status": "pending",
        "servant_notes": "استئذان تأخير مسبق - شفت عمل (بلاك فرايدي) - الحضور المتوقع 1:30 م",
        "resolved_by": "prior_submission",
        "created_at": 1794064022000
    },
    {
        "id": 10,
        "student_id": 93,
        "student_code": "802",
        "student_name": "سانتي عوني عطالله",
        "student_phone": "201289505575",
        "stage": "سنة أولى",
        "message_text": "و للأسف الجمعه الي بعدها عندي ايڤنت في لو هقدار امشي بدري من الخدمه ... اعتقد ممكن امشي من الخدمه ٢.٣٠",
        "reason_category": "طلب انصراف مبكر بإذن 🏃‍♂️",
        "friday_date": "2026-11-20",
        "status": "pending",
        "servant_notes": "طلب انصراف مبكر مسبق - ارتباط عمل (إيفنت) - الانصراف المتوقع 2:30 م",
        "resolved_by": "prior_submission",
        "created_at": 1794064047000
    },
        {
        "id": 12,
        "student_id": 89,
        "student_code": "1272",
        "student_name": "جومانا رضا نعيم",
        "student_phone": "201507713029",
        "stage": "سنة ثانية",
        "message_text": "صباح الخير يا أستاذ عادل بعتزر عن يوم الجمعة مش هقدر اجي هيبقا عندي شغل",
        "reason_category": "عمل وشفت 💼",
        "friday_date": "2026-11-13",
        "status": "pending",
        "servant_notes": "اعتذار مسبق وارد عبر واتساب (ارتباط عمل)",
        "resolved_by": "prior_submission",
        "created_at": 1794306017000
    }
];

function isDelayExcuse(e) {
    if (!e) return false;
    const text = ((e.reason_category || '') + ' ' + (e.message_text || '') + ' ' + (e.servant_notes || '')).toLowerCase();
    return /تأخير|تاخير|استئذان|استأذان|استاذان|انصراف|بدري|حضور متأخر|delay/i.test(text);
}

async function loadRadarExcuses() {
    const tbody = document.getElementById('radar_excusesTableBody');
    const badge = document.getElementById('radar_excusePendingBadge');
    const kpiCount = document.getElementById('radar_kpiExcusesPendingCount');
    if (!tbody) return;

    let loadedExcuses = null;

    // 1. محاولة الجلب من سيرفر البوت المحلي فقط إذا كنا في بيئة محلية حقيقية
    if (isLocalNodeAvailable()) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1800);
            const res = await fetch('http://127.0.0.1:3000/api/excuses', {
                headers: { 'x-api-key': 'khedmety-servant-key-2026' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (data && data.success && Array.isArray(data.excuses) && data.excuses.length > 0) {
                    loadedExcuses = data.excuses;
                    try {
                        localStorage.setItem('khedmety_cached_excuses', JSON.stringify(loadedExcuses));
                    } catch(e){}
                }
            }
        } catch(err) {
            console.warn('[ExcusesRadar] سيرفر البوت المحلي غير متصل، جاري استخدام طبقة التخزين الآمن والمزامنة السحابية:', err.message);
        }
    }

    // 2. إذا لم يتوفر سيرفر البوت (على الموبايل أو فيرسل أو البوت مغلق)، محاولة القراءة من السحابة (Firestore)
    if (!loadedExcuses && typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
        try {
            const snap = await fsdb.collection('excuses').orderBy('created_at', 'desc').limit(100).get();
            if (!snap.empty) {
                loadedExcuses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                try {
                    localStorage.setItem('khedmety_cached_excuses', JSON.stringify(loadedExcuses));
                } catch(e){}
            }
        } catch(cloudErr) {
            console.warn('[ExcusesRadar] Firestore excuses read failed:', cloudErr.message);
        }
    }

    // 3. إذا تعذر السيرفر والسحابة، القراءة من كاش التخزين المحلي (Offline-First Cache)
    let cachedList = [];
    try {
        const cachedRaw = localStorage.getItem('khedmety_cached_excuses');
        if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cachedList = parsed;
            }
        }
    } catch(cacheErr) {}

    // 4. محرك الدمج الذكي الشامل (Smart Merge Engine v8.2):
    // يضمن دمج كافة الأعذار والاستئذانات التأسيسية المعتمدة (مثل استئذان سانتي عوني 802 لجمعة 13 و20 نوفمبر)
    // مع أي كاش سابق موجود في متصفح الخادم دون الحاجة لمسح يدوي للكاش
    const candidateList = (loadedExcuses && loadedExcuses.length > 0) ? loadedExcuses : cachedList;
    const excuseMap = new Map();

    // أولاً: حقن الأعذار التأسيسية المعتمدة مسبقاً
    let deletedSet = new Set();
    try {
        const delRaw = localStorage.getItem('khedmety_deleted_excuses');
        if (delRaw) {
            const arr = JSON.parse(delRaw);
            if (Array.isArray(arr)) deletedSet = new Set(arr.map(String));
        }
    } catch(e){}

    // أولاً: حقن الأعذار التأسيسية المعتمدة مسبقاً (مع استبعاد المحذوفات)
    KHEDMETY_SEED_EXCUSES.forEach(seed => {
        const key = String(seed.id || (seed.student_code + '_' + seed.friday_date));
        if (!deletedSet.has(String(seed.id)) && !deletedSet.has(key)) {
            excuseMap.set(key, { ...seed });
        }
    });

    // ثانياً: دمج أي بيانات محملة من السيرفر أو الكاش المحلي مع الحفاظ التام على القرارات الرعوية (مقبول / مرفوض)
    if (Array.isArray(candidateList) && candidateList.length > 0) {
        candidateList.forEach(item => {
            const key = String(item.id || (item.student_code + '_' + item.friday_date));
            if (deletedSet.has(String(item.id)) || deletedSet.has(key)) return;
            if (excuseMap.has(key)) {
                excuseMap.set(key, { ...excuseMap.get(key), ...item });
            } else {
                excuseMap.set(key, item);
            }
        });
    }

    loadedExcuses = Array.from(excuseMap.values());
    try {
        localStorage.setItem('khedmety_cached_excuses', JSON.stringify(loadedExcuses));
        localStorage.setItem('khedmety_excuses_version', 'v8.2');
    } catch(e){}

    // اعتماد القائمة الفعالة وتحديث واجهة المستخدم والنبض الرعوي
    window.lastRadarExcusesList = loadedExcuses || [];
    const allPending = window.lastRadarExcusesList.filter(e => e.status === 'pending');
    const delaysPending = allPending.filter(e => isDelayExcuse(e));
    const absencePending = allPending.filter(e => !isDelayExcuse(e));

    const allDelays = window.lastRadarExcusesList.filter(e => isDelayExcuse(e));
    const allAbsence = window.lastRadarExcusesList.filter(e => !isDelayExcuse(e));

    // تحديث بطاقة استئذانات التأخير وبطاقة الاعتذارات العلوية
    const delaysKpiCount = document.getElementById('radar_kpiDelaysPendingCount');
    const delaysKpiSub = document.getElementById('radar_kpiDelaysPendingSub');
    if (delaysKpiCount) delaysKpiCount.textContent = delaysPending.length;
    if (delaysKpiSub) delaysKpiSub.textContent = delaysPending.length === 1 ? 'طلب استئذان تأخير معلق' : `${delaysPending.length} طلبات حضور متأخر بإذن`;

    if (kpiCount) kpiCount.textContent = absencePending.length;

    if (badge) {
        badge.innerHTML = `⏳ <b>${allPending.length}</b> طلب قيد المراجعة (<span style="color:#7c3aed; font-weight:800;">⏰ ${delaysPending.length} تأخير بإذن</span> + <span style="color:#b45309; font-weight:800;">🕊️ ${absencePending.length} غياب</span>)`;
    }

    // تحديث أعداد أزرار الفلترة
    const tabPendingCount = document.getElementById('radar_tabPendingCount');
    const tabDelaysCount = document.getElementById('radar_tabDelaysCount');
    const tabAbsenceCount = document.getElementById('radar_tabAbsenceCount');
    const tabAllCount = document.getElementById('radar_tabAllCount');

    if (tabPendingCount) tabPendingCount.textContent = allPending.length;
    if (tabDelaysCount) tabDelaysCount.textContent = delaysPending.length;
    if (tabAbsenceCount) tabAbsenceCount.textContent = absencePending.length;
    if (tabAllCount) tabAllCount.textContent = window.lastRadarExcusesList.length;

    renderRadarExcusesTable();

    if (typeof renderRadarPulseChart === 'function') {
        renderRadarPulseChart(window.lastValidMeetingDates || []);
    }
}

function filterRadarExcuses(filterMode = 'pending') {
    window.currentRadarExcuseFilter = filterMode;
    const btnPending = document.getElementById('btnRadarExcusePending');
    const btnDelays = document.getElementById('btnRadarExcuseDelays');
    const btnAbsence = document.getElementById('btnRadarExcuseAbsence');
    const btnAll = document.getElementById('btnRadarExcuseAll');

    const btns = [btnPending, btnDelays, btnAbsence, btnAll].filter(Boolean);
    btns.forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#475569';
    });

    if (filterMode === 'pending' && btnPending) {
        btnPending.style.background = '#b45309';
        btnPending.style.color = '#ffffff';
    } else if (filterMode === 'delays' && btnDelays) {
        btnDelays.style.background = '#7c3aed';
        btnDelays.style.color = '#ffffff';
    } else if (filterMode === 'absence' && btnAbsence) {
        btnAbsence.style.background = '#0284c7';
        btnAbsence.style.color = '#ffffff';
    } else if (filterMode === 'all' && btnAll) {
        btnAll.style.background = '#0c2461';
        btnAll.style.color = '#ffffff';
    }

    renderRadarExcusesTable();
}

function renderRadarExcusesTable() {
    const tbody = document.getElementById('radar_excusesTableBody');
    if (!tbody) return;

    let list = window.lastRadarExcusesList || [];
    const filter = window.currentRadarExcuseFilter || 'pending';

    if (filter === 'pending') {
        list = list.filter(e => e.status === 'pending');
    } else if (filter === 'delays') {
        list = list.filter(e => isDelayExcuse(e)).sort((a,b) => (a.status === 'pending' ? -1 : (b.status === 'pending' ? 1 : 0)));
    } else if (filter === 'absence') {
        list = list.filter(e => !isDelayExcuse(e));
    }

    if (list.length === 0) {
        const filterMsg = filter === 'delays' ? 'لا توجد طلبات استئذان تأخير مطابقة حالياً. 🟢' :
                          filter === 'absence' ? 'لا توجد اعتذارات غياب مطابقة حالياً. 🟢' :
                          'نشكر ربنا! لا توجد اعتذارات مطابقة لحالة الفلتر حالياً. 🟢';
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; color: #166534; font-weight: bold; background: #f0fdf4; border-radius: 8px;">${filterMsg}</td></tr>`;
        return;
    }

    const allExcusesSource = window.lastRadarExcusesList || [];

    tbody.innerHTML = list.map(e => {
        const isDelay = isDelayExcuse(e);
        const isPending = e.status === 'pending';
        const isAccepted = e.status === 'accepted';
        const timing = evaluateExcuseTiming(e.created_at, e.friday_date);

        // حساب عدد الاعتذارات التراكمي لهذا المخدوم
        const phoneClean = String(e.student_phone || '').replace(/\D/g, '');
        const studentAll = allExcusesSource.filter(item => {
            if (e.student_code && item.student_code && String(e.student_code) === String(item.student_code)) return true;
            if (phoneClean && item.student_phone) {
                const ip = String(item.student_phone).replace(/\D/g, '');
                if (phoneClean.slice(-8) === ip.slice(-8)) return true;
            }
            return item.student_name && item.student_name === e.student_name;
        });
        const totalStudentExcuses = studentAll.length;

        // شارة سجل الأعذار التراكمي الأنيقة
        const historyPill = totalStudentExcuses > 1
            ? `<button type="button" onclick="previewFullExcuseModal(${e.id})" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; border-radius:8px; font-size:0.7rem; padding:1px 6px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:3px;" title="اضغط لعرض كافة أعذاره هذا العام"><i class="fa-solid fa-clock-rotate-left"></i> ${totalStudentExcuses} أعذار</button>`
            : `<span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; border-radius:8px; font-size:0.7rem; padding:1px 6px; font-weight:700;">🌟 عذر أول</span>`;

        // عمود القرار الرعوي المدمج الأنيق
        let actionContent = '';
        if (isPending) {
            actionContent = `
                <div style="display:flex; flex-direction:column; gap:4px; align-items:center; justify-content:center; width:100%; max-width:130px; margin:0 auto;">
                    <!-- الصف الأول: قبول ورفض جنباً إلى جنب بتماثل تام -->
                    <div style="display:flex; gap:4px; width:100%;">
                        <button type="button" class="btn-custom" onclick="resolveExcuseAction(${e.id}, 'accept', this)" style="flex:1; width:auto !important; margin:0 !important; padding:6px 4px; font-size:0.75rem; background:${isDelay ? '#7c3aed' : '#10b981'}; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:3px; box-shadow:0 1px 2px rgba(0,0,0,0.15); transition:all 0.15s;" onmouseover="this.style.background='${isDelay ? '#6d28d9' : '#059669'}'" onmouseout="this.style.background='${isDelay ? '#7c3aed' : '#10b981'}'" title="${isDelay ? 'اعتماد استئذان التأخير كحضور مأذون به عند وصوله' : 'اعتماد العذر كرسمي مقبول'}">
                            <i class="fa-solid fa-check"></i> ${isDelay ? 'قبول الإذن' : 'قبول'}
                        </button>
                        <button type="button" class="btn-custom" onclick="resolveExcuseAction(${e.id}, 'reject', this)" style="flex:1; width:auto !important; margin:0 !important; padding:6px 4px; font-size:0.75rem; background:#fff1f2; color:#be123c; border:1px solid #fecdd3; border-radius:6px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:3px; transition:all 0.15s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fff1f2'" title="رفض العذر">
                            <i class="fa-solid fa-xmark"></i> رفض
                        </button>
                    </div>
                    <!-- الصف الثاني: زر الإلغاء والحذف بعرض كامل منظم -->
                    <button type="button" onclick="cancelStudentExcuse(${e.id})" style="width:100% !important; margin:0 !important; padding:3px 6px; font-size:0.68rem; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; transition:all 0.15s;" onmouseover="this.style.color='#dc2626'; this.style.borderColor='#fca5a5'; this.style.background='#fef2f2';" onmouseout="this.style.color='#64748b'; this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" title="إلغاء وحذف هذا الاعتذار نهائياً">
                        <i class="fa-solid fa-trash-can text-danger" style="font-size:10px;"></i> حذف العذر
                    </button>
                </div>
            `;
        } else if (isAccepted) {
            actionContent = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:100%; max-width:130px; margin:0 auto;">
                    <span class="badge" style="width:100%; text-align:center; background:${isDelay ? '#f5f3ff' : '#dcfce7'}; color:${isDelay ? '#6d28d9' : '#15803d'}; border:1px solid ${isDelay ? '#c4b5fd' : '#86efac'}; font-size:0.75rem; padding:4px 6px; font-weight:800; border-radius:6px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                        ${isDelay ? '⏰ إذن تأخير مقبول' : '✅ عذر مقبول'}
                    </span>
                    <button type="button" onclick="cancelStudentExcuse(${e.id})" style="width:100% !important; margin:0 !important; padding:3px 6px; font-size:0.68rem; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; transition:all 0.15s;" onmouseover="this.style.color='#dc2626'; this.style.borderColor='#fca5a5'; this.style.background='#fef2f2';" onmouseout="this.style.color='#64748b'; this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" title="إلغاء وحذف هذا العذر">
                        <i class="fa-solid fa-trash-can text-danger" style="font-size:10px;"></i> تراجع / إلغاء
                    </button>
                    ${e.servant_notes ? `<span style="font-size:0.68rem; color:#64748b; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(e.servant_notes)}">${escapeHtml(e.servant_notes)}</span>` : ''}
                </div>
            `;
        } else {
            actionContent = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:100%; max-width:130px; margin:0 auto;">
                    <span class="badge" style="width:100%; text-align:center; background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-size:0.75rem; padding:4px 6px; font-weight:800; border-radius:6px;">
                        ❌ غير مقبول
                    </span>
                    <button type="button" onclick="cancelStudentExcuse(${e.id})" style="width:100% !important; margin:0 !important; padding:3px 6px; font-size:0.68rem; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; border-radius:5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; transition:all 0.15s;" onmouseover="this.style.color='#dc2626'; this.style.borderColor='#fca5a5'; this.style.background='#fef2f2';" onmouseout="this.style.color='#64748b'; this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" title="حذف السجل نهائياً">
                        <i class="fa-solid fa-trash-can text-danger" style="font-size:10px;"></i> حذف السجل
                    </button>
                    ${e.servant_notes ? `<span style="font-size:0.68rem; color:#64748b; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(e.servant_notes)}">${escapeHtml(e.servant_notes)}</span>` : ''}
                </div>
            `;
        }

        return `
            <tr style="border-bottom: 1px solid #f1f5f9; background: ${isPending ? '#fffdf7' : '#ffffff'}; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${isPending ? '#fffdf7' : '#ffffff'}'">
                <!-- 1. المخدوم والمرحلة -->
                <td data-label="المخدوم" style="padding: 10px 14px; text-align: right; vertical-align: middle;">
                    <div style="font-weight: 800; font-size: 0.92rem; color: #0f172a;">${escapeHtml(e.student_name)}</div>
                    <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
                        <span style="font-size: 0.74rem; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1px 6px; font-weight: 600;">
                            ${escapeHtml(e.stage || 'سنة أولى')} • #${escapeHtml(e.student_code || '-')}
                        </span>
                        ${historyPill}
                    </div>
                </td>

                <!-- 2. جمعة الغياب ووقت الورود (تنسيق منظم: التاريخ / الوقت / شارة الملاحظة) -->
                <td data-label="الجمعة والتوقيت" style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    <div style="font-weight: 800; font-size: 0.88rem; color: #0c2461; line-height: 1.25; margin-bottom: 3px;">
                        ${escapeHtml(e.friday_date)}
                    </div>
                    ${(() => {
                        const curDate = (typeof today !== 'undefined' && today) ? today : new Date().toISOString().slice(0, 10);
                        if (e.friday_date && String(e.friday_date) > curDate) {
                            return '<div style="margin-bottom:3px;"><span style="display:inline-block; font-size:0.68rem; font-weight:800; color:#4338ca; background:#e0e7ff; border:1px solid #c7d2fe; border-radius:4px; padding:1px 6px;">📅 جمعة قادمة مسبقة</span></div>';
                        }
                        return '';
                    })()}
                    <div style="font-size: 0.78rem; color: #334155; font-weight: 600; line-height: 1.25; margin-bottom: 4px;">
                        ${timing.weekdayName} ${timing.timeStr}
                    </div>
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <span style="display: inline-block; font-size: 0.72rem; font-weight: 800; color: ${timing.badgeColor}; background: ${timing.bgColor}; border-radius: 6px; padding: 2px 8px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                            ${timing.shortLabel}
                        </span>
                    </div>
                </td>

                <!-- 3. السبب المصنف -->
                <td data-label="السبب" style="padding: 10px 8px; text-align: center; vertical-align: middle;">
                    ${isDelay ? `
                        <div style="display:inline-flex; flex-direction:column; align-items:center; gap:2px;">
                            <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.78rem; font-weight:800; color:#6d28d9; background:#f5f3ff; border:1.5px solid #c4b5fd; border-radius:6px; padding:3px 8px;">
                                ⏰ استئذان تأخير
                            </span>
                            <span style="font-size:0.7rem; color:#7c3aed; font-weight:700;">(حضور متأخر بإذن)</span>
                        </div>
                    ` : `
                        <span style="display: inline-block; font-size: 0.78rem; font-weight: 700; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 9px;">
                            ${escapeHtml(e.reason_category || 'اعتذار غياب 🕊️')}
                        </span>
                    `}
                </td>

                <!-- 4. بطاقة رسالة الواتساب المتماسكة مع زر المعاينة -->
                <td data-label="رسالة الواتساب" style="padding: 10px 12px; text-align: right; vertical-align: middle;">
                    <div onclick="previewFullExcuseModal(${e.id})" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 8px; transition: all 0.2s;" onmouseover="this.style.background='#dcfce7'; this.style.borderColor='#86efac';" onmouseout="this.style.background='#f0fdf4'; this.style.borderColor='#bbf7d0';" title="اضغط لمعاينة الرسالة كاملة وسجل المخدوم">
                        <span style="font-size: 0.8rem; color: #166534; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 175px; font-weight: 500;">
                            💬 "${escapeHtml(e.message_text)}"
                        </span>
                        <span style="background: #059669; color: #ffffff; font-size: 0.72rem; font-weight: 800; border-radius: 5px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.08); flex-shrink: 0;">
                            <i class="fa-solid fa-eye"></i> معاينة
                        </span>
                    </div>
                </td>

                <!-- 5. القرار الرعوي والحالة -->
                <td data-label="القرار الرعوي" style="padding: 10px 10px; text-align: center; vertical-align: middle;">
                    ${actionContent}
                </td>
            </tr>
        `;
    }).join('');
}

async function resolveExcuseAction(id, action, btn) {
    const isAccept = action === 'accept';
    const defaultNote = isAccept ? 'عذر مقبول (مراجعة وظروف مثبتة)' : 'اعتذار غير مقبول (تنبيه بالالتزام)';
    const servantNote = prompt(isAccept ? 'اكتب ملاحظة الاعتماد (اختياري):' : 'اكتب سبب رفض العذر للمخدوم:', defaultNote);
    if (servantNote === null) return;

    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري الحسم...';
    }

    try {
        let targetExcuse = null;
        if (window.lastRadarExcusesList && Array.isArray(window.lastRadarExcusesList)) {
            targetExcuse = window.lastRadarExcusesList.find(e => String(e.id) === String(id));
        }

        const newStatus = isAccept ? 'accepted' : 'rejected';
        const resolverName = (typeof currentUser !== 'undefined' && currentUser?.name) || 'خادم الفصل';

        // 1. مزامنة مع سيرفر Node المحلي فقط إذا كنا في بيئة محلية
        if (isLocalNodeAvailable()) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1800);
                await fetch(`http://127.0.0.1:3000/api/excuses/${id}/action`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'khedmety-servant-key-2026'
                    },
                    body: JSON.stringify({
                        action,
                        servant_notes: servantNote,
                        resolved_by: resolverName
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch(netErr) {
                console.warn('[Resolve Excuse] السيرفر المحلي غير متاح:', netErr.message);
            }
        }

        // 2. المزامنة السحابية المباشرة مع Firestore
        if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
            try {
                await fsdb.collection('excuses').doc(String(id)).set({
                    status: newStatus,
                    servant_notes: servantNote,
                    resolved_by: resolverName,
                    resolved_at: Date.now()
                }, { merge: true });
            } catch(cloudErr) {
                console.warn('[Resolve Excuse Firestore Sync Error]', cloudErr);
            }
        }

        // 3. التحديث الفوري في الذاكرة وكاش التخزين المحلي
        if (window.lastRadarExcusesList && Array.isArray(window.lastRadarExcusesList)) {
            const item = window.lastRadarExcusesList.find(e => String(e.id) === String(id));
            if (item) {
                item.status = newStatus;
                item.servant_notes = servantNote;
                item.resolved_by = resolverName;
            }
            try {
                localStorage.setItem('khedmety_cached_excuses', JSON.stringify(window.lastRadarExcusesList));
            } catch(e) {}
        }

        // 4. تسجيل العذر أو الإذن في كشف الحضور تلقائياً إذا تم القبول
        if (isAccept && targetExcuse) {
            targetExcuse.status = newStatus;
            targetExcuse.servant_notes = servantNote;
            markStudentExcusedInAttendance(targetExcuse);
        }

        // إعادة رسم جدول الأعذار وتحديث العدادات لحظياً
        renderRadarExcusesTable();

        // تحديث نافذة المعاينة إذا كانت مفتوحة
        const modal = document.getElementById('modalExcuseDetail');
        if (modal && modal.style.display !== 'none') {
            previewFullExcuseModal(id);
        }

        if (typeof showToast === 'function') {
            showToast(isAccept ? '✅ تم اعتماد الاستئذان/العذر وحفظه بنجاح!' : '❌ تم تسجيل رفض العذر وحفظه بنجاح!');
        } else {
            alert(isAccept ? 'تم اعتماد الاستئذان كعذر مقبول وحفظه بنجاح! ✅' : 'تم تسجيل رفض العذر وحفظه بنجاح! ❌');
        }

    } catch (unexpectedErr) {
        console.error('[Resolve Excuse Error]', unexpectedErr);
        alert('حدث خطأ أثناء معالجة العذر: ' + unexpectedErr.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

// 💬 دوال معاينة رسالة الاعتذار كاملة وسجل اعتذارات المخدوم
function previewFullExcuseModal(excuseId) {
    const list = window.lastRadarExcusesList || [];
    const excuse = list.find(e => String(e.id) === String(excuseId));
    if (!excuse) return;

    const modal = document.getElementById('modalExcuseDetail');
    if (!modal) return;

    const timing = evaluateExcuseTiming(excuse.created_at, excuse.friday_date);

    const elName = document.getElementById('excuseModalStudentName');
    const elMeta = document.getElementById('excuseModalStudentMeta');
    const elWaBtn = document.getElementById('excuseModalWhatsAppBtn');
    const elFriday = document.getElementById('excuseModalFridayDate');
    const elReason = document.getElementById('excuseModalReasonBadge');
    const elTiming = document.getElementById('excuseModalTimingBadge');
    const elMsg = document.getElementById('excuseModalFullMessage');
    const elBubbleTime = document.getElementById('excuseModalBubbleTime');

    if (elName) elName.innerText = excuse.student_name || 'مخدوم';
    if (elMeta) elMeta.innerText = `(${excuse.student_code || '-'} | ${excuse.stage || 'عام'})`;

    const cleanPhone = String(excuse.student_phone || '').replace(/\D/g, '');
    if (elWaBtn) {
        if (cleanPhone) {
            elWaBtn.href = `https://wa.me/${cleanPhone}`;
            elWaBtn.style.display = 'inline-flex';
        } else {
            elWaBtn.style.display = 'none';
        }
    }

    if (elFriday) elFriday.innerText = excuse.friday_date || '-';
    if (elReason) elReason.innerText = excuse.reason_category || 'اعتذار عام 🕊️';

    if (elTiming) {
        elTiming.innerHTML = `
            <strong style="color:#1e293b;">${timing.weekdayName} ${timing.timeStr}</strong>
            <span style="display:inline-block; font-size:0.75rem; font-weight:800; color:${timing.badgeColor}; background:${timing.bgColor}; border-radius:6px; padding:2px 8px; margin-right:4px;">
                ${timing.shortLabel}
            </span>
        `;
    }

    if (elMsg) {
        elMsg.innerText = excuse.message_text || '(لا يوجد نص رسالة)';
    }
    if (elBubbleTime) {
        elBubbleTime.innerText = timing.timeStr || '';
    }

    // عرض سجل كافة اعتذارات هذا المخدوم طوال العام
    renderStudentExcuseHistoryInModal(excuse);

    // صف أزرار الإجراء الرعوي
    const actionRow = document.getElementById('excuseModalActionRow');
    if (actionRow) {
        if (excuse.status === 'pending') {
            actionRow.innerHTML = `
                <button type="button" class="btn-custom" onclick="resolveExcuseAction(${excuse.id}, 'accept', this)" style="width:auto !important; margin:0 !important; background:#10b981; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-check"></i> قبول العذر ✅
                </button>
                <button type="button" class="btn-custom" onclick="resolveExcuseAction(${excuse.id}, 'reject', this)" style="width:auto !important; margin:0 !important; background:#ef4444; color:#fff; border:none; padding:9px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-xmark"></i> رفض العذر ❌
                </button>
                <button type="button" onclick="cancelStudentExcuse(${excuse.id})" style="width:auto !important; margin:0 !important; background:#fee2e2; color:#b91c1c; border:1px solid #f87171; padding:9px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-trash-can"></i> إلغاء وحذف العذر
                </button>
                <button type="button" class="btn-custom" onclick="closeExcuseDetailModal()" style="width:auto !important; margin:0 !important; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:9px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem;">
                    إغلاق
                </button>
            `;
        } else {
            const isAcc = excuse.status === 'accepted';
            actionRow.innerHTML = `
                <div style="flex:1; text-align:right; font-size:0.82rem; color:${isAcc ? '#15803d' : '#b91c1c'}; font-weight:bold; display:flex; align-items:center; gap:6px;">
                    <span>${isAcc ? '✅ معتمد كعذر مقبول' : '❌ تم رفض العذر'}:</span>
                    <span style="color:#64748b; font-weight:normal;">${escapeHtml(excuse.servant_notes || '')} (${escapeHtml(excuse.resolved_by || 'الخادم')})</span>
                </div>
                <button type="button" onclick="cancelStudentExcuse(${excuse.id})" style="width:auto !important; margin:0 !important; background:#fee2e2; color:#b91c1c; border:1px solid #f87171; padding:9px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-trash-can"></i> إلغاء وحذف العذر
                </button>
                <button type="button" class="btn-custom" onclick="closeExcuseDetailModal()" style="width:auto !important; margin:0 !important; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:9px 16px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.88rem;">
                    إغلاق
                </button>
            `;
        }
    }

    modal.style.display = 'flex';
}

function closeExcuseDetailModal() {
    const modal = document.getElementById('modalExcuseDetail');
    if (modal) modal.style.display = 'none';
}

function renderStudentExcuseHistoryInModal(currentExcuse) {
    const container = document.getElementById('excuseModalHistoryContainer');
    const badge = document.getElementById('excuseModalHistoryCountBadge');
    if (!container) return;

    const list = window.lastRadarExcusesList || [];
    const phoneClean = String(currentExcuse.student_phone || '').replace(/\D/g, '');
    const studentHistory = list.filter(item => {
        if (currentExcuse.student_code && item.student_code && String(currentExcuse.student_code) === String(item.student_code)) return true;
        if (phoneClean && item.student_phone) {
            const p = String(item.student_phone).replace(/\D/g, '');
            if (phoneClean.slice(-8) === p.slice(-8)) return true;
        }
        return item.student_name && item.student_name === currentExcuse.student_name;
    });

    if (badge) badge.innerText = `${studentHistory.length} اعتذار`;

    if (studentHistory.length === 0) {
        container.innerHTML = '<div style="color:#64748b; padding:8px; text-align:center;">لا توجد اعتذارات مسجلة لهذا المخدوم.</div>';
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; text-align:right;">
            <thead>
                <tr style="background:#e0f2fe; color:#0369a1; border-bottom:1px solid #bae6fd;">
                    <th style="padding:4px 6px;">جمعة الغياب</th>
                    <th style="padding:4px 6px;">ساعة الورود / المهلة</th>
                    <th style="padding:4px 6px;">السبب المصنف</th>
                    <th style="padding:4px 6px;">الحالة الرعوية</th>
                </tr>
            </thead>
            <tbody>
                ${studentHistory.map(h => {
                    const t = evaluateExcuseTiming(h.created_at, h.friday_date);
                    let stBadge = h.status === 'accepted' ? '<span style="color:#15803d; font-weight:bold;">✅ مقبول</span>' : (h.status === 'rejected' ? '<span style="color:#b91c1c; font-weight:bold;">❌ مرفوض</span>' : '<span style="color:#b45309; font-weight:bold;">⏳ قيد المراجعة</span>');
                    const isCurr = h.id === currentExcuse.id;
                    return `
                        <tr style="border-bottom:1px solid #f1f5f9; background:${isCurr ? '#fef9c3' : '#fff'};">
                            <td style="padding:5px 6px; font-weight:bold; color:#0c2461;">${escapeHtml(h.friday_date)} ${isCurr ? '<span style="font-size:0.7rem; color:#b45309;">(المعروض)</span>' : ''}</td>
                            <td style="padding:5px 6px;">
                                <span>${t.weekdayName} ${t.timeStr}</span>
                                <span style="font-size:0.7rem; color:${t.badgeColor}; font-weight:bold; margin-right:3px;">${t.shortLabel}</span>
                            </td>
                            <td style="padding:5px 6px; color:#475569;">${escapeHtml(h.reason_category)}</td>
                            <td style="padding:5px 6px;">${stBadge}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function markStudentExcusedInAttendance(excuse) {
    try {
        const friday = excuse.friday_date;
        let record = (typeof attendanceRecord !== 'undefined' && attendanceRecord) ? attendanceRecord : {};
        if (!record[friday]) record[friday] = [];

        const studentCode = String(excuse.student_code || '');
        const studentPhone = String(excuse.student_phone || '');
        const isDelay = isDelayExcuse(excuse);

        let item = record[friday].find(r => (studentCode && String(r.code) === studentCode) || (studentPhone && String(r.phone).includes(studentPhone.slice(-9))));
        if (!item) {
            item = {
                id: excuse.student_id || Date.now(),
                code: studentCode,
                name: excuse.student_name,
                phone: studentPhone,
                stage: excuse.stage,
                attended: false,
                isAbsentDueToDelay: false,
                isExcused: true,
                hasApprovedDelay: isDelay,
                excuseReason: isDelay ? 'استئذان تأخير مسبق ⏰' : (excuse.reason_category || 'عذر غياب مقبول')
            };
            record[friday].push(item);
        } else {
            if (isDelay) {
                item.hasApprovedDelay = true;
                item.excuseReason = 'استئذان تأخير مسبق ⏰';
            } else {
                item.attended = false;
                item.isAbsentDueToDelay = false;
                item.isExcused = true;
                item.excuseReason = excuse.reason_category || 'عذر غياب مقبول';
            }
        }

        if (typeof saveAttendanceRecord === 'function') {
            saveAttendanceRecord();
        } else {
            localStorage.setItem('my_church_attendance', JSON.stringify(record));
        }
        console.log(`✅ [Attendance Sync] تم تسجيل ${isDelay ? 'استئذان تأخير مسبق' : 'غياب بعذر مقبول'} للمخدوم [${excuse.student_name}] في جلسة [${friday}]`);
    } catch(err) {
        console.warn('[Attendance Sync] تعذر تحديث كشف الحضور تلقائياً:', err);
    }
}

function getUpcomingFriday() {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7;
    d.setDate(d.getDate() + diff);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function safeRadarEscape(str) {
    if (typeof escapeHtml === 'function') return escapeHtml(str);
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function cancelStudentExcuse(excuseId) {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء وحذف هذا الاعتذار نهائياً من رادار الأعذار؟')) return;

    try {
        let deletedExcuse = null;
        if (window.lastRadarExcusesList && Array.isArray(window.lastRadarExcusesList)) {
            deletedExcuse = window.lastRadarExcusesList.find(e => String(e.id) === String(excuseId));
        }

        if (isLocalNodeAvailable()) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1800);
                await fetch(`http://127.0.0.1:3000/api/excuses/${excuseId}/cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch(netErr) {
                console.warn('[Cancel Excuse] تعذر الاتصال بالسيرفر المحلي:', netErr.message);
            }
        }

        if (typeof isFirebaseActive !== 'undefined' && isFirebaseActive && typeof fsdb !== 'undefined' && fsdb) {
            try {
                await fsdb.collection('excuses').doc(String(excuseId)).delete();
            } catch(cloudErr) {
                console.warn('[Cancel Excuse Firestore Error]', cloudErr.message);
            }
        }

                // إضافة العذر لقائمة المحذوفات الدائمة في المتصفح لمنع ظهوره مجدداً عند عمل Refresh
        try {
            let deletedSet = new Set();
            const delRaw = localStorage.getItem('khedmety_deleted_excuses');
            if (delRaw) {
                const arr = JSON.parse(delRaw);
                if (Array.isArray(arr)) deletedSet = new Set(arr.map(String));
            }
            deletedSet.add(String(excuseId));
            if (deletedExcuse) {
                if (deletedExcuse.student_code && deletedExcuse.friday_date) {
                    deletedSet.add(String(deletedExcuse.student_code + '_' + deletedExcuse.friday_date));
                }
            }
            localStorage.setItem('khedmety_deleted_excuses', JSON.stringify(Array.from(deletedSet)));
        } catch(e){}

        // إزالة العذر من القائمة المعروضة وتحديث كاش المتصفح فوراً
        if (window.lastRadarExcusesList && Array.isArray(window.lastRadarExcusesList)) {
            window.lastRadarExcusesList = window.lastRadarExcusesList.filter(e => String(e.id) !== String(excuseId));
            try {
                localStorage.setItem('khedmety_cached_excuses', JSON.stringify(window.lastRadarExcusesList));
            } catch(e){}
        }

        // إلغاء وسم العذر من كشف الحضور إذا كان مسجلاً فيه
        if (deletedExcuse && typeof attendanceRecord !== 'undefined' && attendanceRecord) {
            const friday = deletedExcuse.friday_date;
            if (attendanceRecord[friday]) {
                const sCode = String(deletedExcuse.student_code || '').trim();
                const sName = String(deletedExcuse.student_name || '').trim();
                const sPhone = String(deletedExcuse.student_phone || '').replace(/\D/g, '');

                const item = attendanceRecord[friday].find(r => {
                    if (sCode && String(r.code || '').trim() === sCode) return true;
                    if (sPhone && r.phone && String(r.phone).replace(/\D/g, '').slice(-8) === sPhone.slice(-8)) return true;
                    if (sName && r.name && r.name.trim() === sName) return true;
                    return false;
                });

                if (item) {
                    item.isExcused = false;
                    item.excuseReason = '';
                    if (typeof saveAttendanceRecord === 'function') {
                        saveAttendanceRecord();
                    } else {
                        localStorage.setItem('my_church_attendance', JSON.stringify(attendanceRecord));
                    }
                }
            }
        }

        // إغلاق نافذة المعاينة إذا كانت مفتوحة
        closeExcuseDetailModal();

        // تحديث جدول الأعذار فوراً
        renderRadarExcusesTable();

        // تحديث مؤشرات نبض الاجتماع
        if (typeof renderRadarPulseChart === 'function') {
            renderRadarPulseChart(window.lastValidMeetingDates || []);
        }

        // تحديث نافذة تسجيل العذر اليدوي إذا كانت مفتوحة
        const manualModal = document.getElementById('manualExcuseModal');
        if (manualModal && manualModal.style.display !== 'none') {
            renderManualExcuseModalList();
        }

        if (typeof showToast === 'function') {
            showToast('🗑️ تم إلغاء وحذف الاعتذار بنجاح!');
        } else {
            alert('🗑️ تم إلغاء وحذف الاعتذار بنجاح!');
        }
    } catch(err) {
        console.error('Error cancelling excuse:', err);
        alert('تعذر إلغاء الاعتذار: ' + err.message);
    }
}

function openManualExcuseModal() {
    const modal = document.getElementById('manualExcuseModal');
    if (!modal) {
        console.warn('#manualExcuseModal not found in DOM');
        return;
    }

    // ضبط تاريخ جمعة الغياب الافتراضي
    const dateInput = document.getElementById('manualExcuseDate');
    if (dateInput && !dateInput.value) {
        const d = (window.lastValidMeetingDates && window.lastValidMeetingDates[0]) || getUpcomingFriday();
        dateInput.value = d;
    }

    // مسح حقل البحث وإعادة الفلتر للوضع الافتراضي
    const searchInput = document.getElementById('manualExcuseSearchBox');
    if (searchInput) searchInput.value = '';

    const stageSelect = document.getElementById('manualExcuseStageFilter');
    if (stageSelect) stageSelect.value = 'all';

    renderManualExcuseModalList();
    modal.style.display = 'flex';
}

function closeManualExcuseModal() {
    const modal = document.getElementById('manualExcuseModal');
    if (modal) modal.style.display = 'none';
}

function renderManualExcuseModalList() {
    const tbody = document.getElementById('manualExcuseModalTbody');
    if (!tbody) return;

    const allMembers = (typeof members !== 'undefined' && Array.isArray(members)) ? members : [];
    if (allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748b; font-weight:bold;">لا توجد بيانات مخدومين محملة حالياً في النظام.</td></tr>';
        return;
    }

    const searchTxt = (document.getElementById('manualExcuseSearchBox')?.value || '').trim().toLowerCase();
    const stageFilter = document.getElementById('manualExcuseStageFilter')?.value || 'all';
    const targetFriday = document.getElementById('manualExcuseDate')?.value || getUpcomingFriday();

    const excusesList = window.lastRadarExcusesList || [];
    const attList = (typeof attendanceRecord !== 'undefined' && attendanceRecord && attendanceRecord[targetFriday]) || [];

    const filtered = allMembers.filter(m => {
        if (stageFilter !== 'all') {
            const mStage = (m.stage || '').trim();
            if (!mStage.includes(stageFilter.replace('سنة ', ''))) return false;
        }
        if (searchTxt) {
            const nameMatch = (m.name || '').toLowerCase().includes(searchTxt);
            const codeMatch = String(m.code || '').includes(searchTxt);
            const phoneMatch = String(m.phone || '').replace(/\D/g, '').includes(searchTxt);
            if (!nameMatch && !codeMatch && !phoneMatch) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748b; font-weight:bold;">لا يوجد مخدوم يطابق معايير البحث الحالية. 🔍</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.slice(0, 100).map(m => {
        const mCode = String(m.code || '').trim();
        const mPhone = String(m.phone || '').replace(/\D/g, '');
        const mId = String(m.id || '');

        // هل مسجل له عذر بالفعل لنفس الجمعة؟
        const existingExcuse = excusesList.find(e => {
            const isDate = !e.friday_date || e.friday_date === targetFriday;
            if (!isDate) return false;
            if (mCode && e.student_code && String(e.student_code).trim() === mCode) return true;
            if (mPhone && e.student_phone && String(e.student_phone).replace(/\D/g, '').slice(-8) === mPhone.slice(-8)) return true;
            return e.student_name && e.student_name.trim() === m.name.trim();
        });

        // هل حاضر بالفعل في هذه الجمعة؟
        const isAttended = attList.some(r => {
            if (!r.attended || r.isAbsentDueToDelay) return false;
            if (mId && String(r.id) === mId) return true;
            if (mCode && String(r.code) === mCode) return true;
            return r.name && r.name.trim() === m.name.trim();
        });

        let statusBadge = '<span style="color:#64748b; font-size:0.78rem;">غياب عادي (لم يسجل)</span>';
        if (isAttended) {
            statusBadge = '<span style="color:#15803d; font-weight:800; font-size:0.78rem; background:#dcfce7; padding:2px 8px; border-radius:6px; border:1px solid #bbf7d0;">✅ حاضر باللقاء</span>';
        } else if (existingExcuse) {
            statusBadge = `<span style="color:#b45309; font-weight:800; font-size:0.78rem; background:#fef3c7; padding:2px 8px; border-radius:6px; border:1px solid #fde68a;">🕊️ عذر معتمد (${safeRadarEscape(existingExcuse.reason_category || 'مسجل')})</span>`;
        }

        const safeName = (m.name || '').replace(/'/g, "\\'");
        const safeCode = (m.code || '').replace(/'/g, "\\'");
        const safePhone = (m.phone || '').replace(/'/g, "\\'");
        const safeStage = (m.stage || 'سنة أولى').replace(/'/g, "\\'");

        return `
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='';">
                <td style="padding:10px 12px;">
                    <div style="font-weight:bold; color:#0f172a; font-size:0.88rem;">${safeRadarEscape(m.name)}</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">كود: <strong>${safeRadarEscape(m.code || '-')}</strong> • ${safeRadarEscape(m.stage || 'سنة أولى')}</div>
                </td>
                <td style="padding:10px 12px; text-align:center;">
                    ${statusBadge}
                </td>
                <td style="padding:10px 12px; text-align:center;">
                    ${existingExcuse ? `
                        <button type="button" onclick="cancelStudentExcuse(${existingExcuse.id})" style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; border-radius:6px; padding:5px 12px; font-size:0.78rem; font-weight:bold; cursor:pointer;" title="إلغاء هذا العذر">
                            🗑️ إلغاء العذر
                        </button>
                    ` : `
                        <button type="button" onclick="submitManualExcuseFromModal('${m.id}', '${safeCode}', '${safeName}', '${safePhone}', '${safeStage}')" style="background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#fff; border:none; border-radius:6px; padding:6px 14px; font-size:0.8rem; font-weight:bold; cursor:pointer; box-shadow:0 1px 3px rgba(5,150,105,0.25);" title="تسجيل واعتماد عذر فوري لهذا المخدوم">
                            + تسجيل عذر
                        </button>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

async function submitManualExcuseFromModal(memberId, studentCode, studentName, studentPhone, studentStage) {
    const targetFriday = document.getElementById('manualExcuseDate')?.value || getUpcomingFriday();
    const reasonCategory = document.getElementById('manualExcuseCategory')?.value || 'اتصال تليفوني بالخادم 📞';

    try {
        let newExcuseObj = null;

        if (isLocalNodeAvailable()) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1800);
                const res = await fetch('http://localhost:3000/api/excuses/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'khedmety-servant-key-2026'
                },
                body: JSON.stringify({
                    student_id: memberId,
                    code: studentCode,
                    name: studentName,
                    phone: studentPhone,
                    stage: studentStage,
                    reason: reasonCategory,
                    friday_date: targetFriday
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data && data.success) {
                newExcuseObj = data.excuse || {
                    id: data.id || Date.now(),
                    student_id: memberId,
                    student_code: studentCode,
                    student_name: studentName,
                    student_phone: studentPhone,
                    stage: studentStage,
                    reason_category: reasonCategory,
                    friday_date: targetFriday,
                    status: 'accepted',
                    created_at: Date.now()
                };
            }
        } catch(netErr) {
                console.warn('[Manual Excuse] خادم الواتساب المحلي غير متصل، جاري الحفظ محلياً:', netErr);
            }
        }

        if (!newExcuseObj) {
            newExcuseObj = {
                id: Date.now(),
                student_id: memberId,
                student_code: studentCode,
                student_name: studentName,
                student_phone: studentPhone,
                stage: studentStage,
                reason_category: reasonCategory,
                friday_date: targetFriday,
                status: 'accepted',
                message_text: 'تم تدوين الاعتذار يدوياً عبر الخادم',
                created_at: Date.now()
            };
        }

        // تحديث القائمة العامة
        if (!window.lastRadarExcusesList) window.lastRadarExcusesList = [];
        window.lastRadarExcusesList.unshift(newExcuseObj);

        // حفظ في كشف الحضور
        markStudentExcusedInAttendance(newExcuseObj);

        // تحديث جدول الأعذار الرئيسي
        renderRadarExcusesTable();

        // تحديث كارت نبض الاجتماع
        if (typeof renderRadarPulseChart === 'function') {
            renderRadarPulseChart(window.lastValidMeetingDates || []);
        }

        // تحديث القائمة بالنافذة المنبثقة
        renderManualExcuseModalList();

        if (typeof showToast === 'function') {
            showToast(`✅ تم تسجيل واعتماد عذر (${studentName}) بنجاح!`);
        } else {
            alert(`✅ تم تسجيل واعتماد عذر (${studentName}) بنجاح!`);
        }
    } catch(err) {
        console.error('Error submitting manual excuse:', err);
        alert('تعذر تسجيل العذر: ' + err.message);
    }
}

function manualRecordStudentExcuse() {
    openManualExcuseModal();
}

if (typeof window !== 'undefined') {
    window.isDelayExcuse = isDelayExcuse;
    window.loadRadarExcuses = loadRadarExcuses;
    window.filterRadarExcuses = filterRadarExcuses;
    window.resolveExcuseAction = resolveExcuseAction;
    window.manualRecordStudentExcuse = manualRecordStudentExcuse;
    window.previewFullExcuseModal = previewFullExcuseModal;
    window.closeExcuseDetailModal = closeExcuseDetailModal;
    window.renderStudentExcuseHistoryInModal = renderStudentExcuseHistoryInModal;
    window.cancelStudentExcuse = cancelStudentExcuse;
    window.openManualExcuseModal = openManualExcuseModal;
    window.closeManualExcuseModal = closeManualExcuseModal;
    window.renderManualExcuseModalList = renderManualExcuseModalList;
    window.submitManualExcuseFromModal = submitManualExcuseFromModal;
    window.getUpcomingFriday = getUpcomingFriday;
}


// ============================================================================
// 📊 منظومة كشف الحضور والتأخيرات والغياب الأسبوعي المعتمد (PDF & WhatsApp)
// ============================================================================

function parseRadarTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    let s = String(timeStr).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();
    const isPm = s.includes('م') || s.toLowerCase().includes('pm');
    const isAm = s.includes('ص') || s.toLowerCase().includes('am');
    const parts = s.match(/\d+/g);
    if (!parts || parts.length === 0) return null;
    let h = parseInt(parts[0], 10);
    let m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isPm && h < 12) h += 12;
    else if (isAm && h === 12) h = 0;
    else if (!isPm && !isAm && h >= 1 && h <= 6) h += 12; // الجمعة بعد الظهر
    return h * 60 + m;
}

function classifyAttendanceStatus(attRecord, studentExcuse) {
    // 1. إذا كان المخدوم غائباً
    if (!attRecord || (!attRecord.attended && !attRecord.time)) {
        if (studentExcuse || (attRecord && attRecord.isExcused)) {
            const excuseText = (studentExcuse && (studentExcuse.reason_category || studentExcuse.raw_text)) || 
                               (attRecord && attRecord.excuseReason) || 'عذر مقبول';
            
            // فحص توقيت ورود العذر: هل هو مسبق (قبل/أثناء الاجتماع) أم لاحق (متأخر بعد انتهاء الاجتماع)
            const isLate = (studentExcuse && (
                (studentExcuse.servant_notes && studentExcuse.servant_notes.includes('متأخر')) ||
                studentExcuse.resolved_by === 'late_submission' ||
                (studentExcuse.created_at && new Date(studentExcuse.created_at).getDay() === 6) ||
                (studentExcuse.created_at && new Date(studentExcuse.created_at).getDay() === 5 && new Date(studentExcuse.created_at).getHours() >= 16)
            ));

            const timing = evaluateExcuseTiming(studentExcuse?.created_at, attRecord?.date);
            const timePrefix = timing.timeStr ? ` (ورد ${timing.weekdayName} ${timing.timeStr} - ${timing.shortLabel})` : '';

            if (isLate) {
                return {
                    status: 'excused_late',
                    label: 'عذر لاحق (متأخر)',
                    badgeClass: 'badge-att-excused-late',
                    icon: '⚠️',
                    color: '#d97706',
                    bgColor: '#fffbeb',
                    note: `⚠️ عذر: ${excuseText}${timePrefix}`,
                    delayMinutes: 0,
                    isLateExcuse: true,
                    timing: timing
                };
            }

            return {
                status: 'excused',
                label: 'عذر في المهلة',
                badgeClass: 'badge-att-excused',
                icon: '🕊️',
                color: '#0284c7',
                bgColor: '#e0f2fe',
                note: `🕊️ عذر: ${excuseText}${timePrefix}`,
                delayMinutes: 0,
                isLateExcuse: false,
                timing: timing
            };
        }
        return {
            status: 'absent',
            label: 'غائب',
            badgeClass: 'badge-att-absent',
            icon: '❌',
            color: '#dc2626',
            bgColor: '#fef2f2',
            note: 'غائب بدون عذر',
            delayMinutes: 0
        };
    }

    // 2. إذا كان المخدوم حاضراً
    const timeStr = attRecord.time || '';
    const totalM = parseRadarTimeToMinutes(timeStr);
    
    // الموعد الرسمي هو 1:00 م (780 دقيقة)
    const baseMinutes = 780;
    const diff = (totalM !== null && totalM > baseMinutes) ? (totalM - baseMinutes) : 0;

        // فحص هل المخدوم لديه إذن / عذر تأخير مسبق معتمد ⏰
    const hasApprovedDelay = !!(attRecord.hasApprovedDelay || (studentExcuse && /تأخير|تاخير|استئذان|استأذان|انصراف|بدري/i.test((studentExcuse.reason_category || '') + ' ' + (studentExcuse.message_text || ''))));

    if (hasApprovedDelay) {
        return {
            status: 'approved_delay',
            label: 'حاضر بإذن تأخير ⏰',
            badgeClass: 'badge-att-approved-delay',
            icon: '⏰',
            color: '#b45309',
            bgColor: '#fffbeb',
            note: "⏰ تأخير مأذون به مسبقاً (" + (diff > 0 ? "+" + diff + " دقيقة" : "بإذن") + ")",
            delayMinutes: diff
        };
    }

    // تأخير شديد (≥ 1:15 م = 795 دقيقة أو تم تعليمه كغياب بسبب التأخير)
    if (attRecord.isAbsentDueToDelay || (totalM !== null && totalM >= 795)) {
        return {
            status: 'severe_delay',
            label: 'تأخير شديد',
            badgeClass: 'badge-att-severe',
            icon: '🔴',
            color: '#dc2626',
            bgColor: '#fee2e2',
            note: diff > 0 ? `تأخير شديد (+${diff} دقيقة)` : 'تأخير شديد (≥ 1:15)',
            delayMinutes: diff
        };
    }

    // تأخير بسيط (1:01 م إلى 1:14 م = 781 إلى 794 دقيقة)
    if (totalM !== null && totalM >= 781 && totalM <= 794) {
        return {
            status: 'minor_delay',
            label: 'تأخير بسيط',
            badgeClass: 'badge-att-minor',
            icon: '🟡',
            color: '#d97706',
            bgColor: '#fef3c7',
            note: `تأخير بسيط (+${diff} دقيقة)`,
            delayMinutes: diff
        };
    }

    // في الموعد (≤ 1:00 م)
    return {
        status: 'on_time',
        label: 'حاضر في الموعد',
        badgeClass: 'badge-att-ontime',
        icon: '🟢',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        note: 'حضور في الموعد تماماً',
        delayMinutes: 0
    };
}

function normalizeStudentStage(stageStr) {
    const s = String(stageStr || '').trim();
    if (s.includes('ثان') || s.includes('2')) return 'الفرقة الثانية';
    return 'الفرقة الأولى';
}

function getRadarAvailableFridays() {
    const fridays = new Set();
    const attSource = (typeof attendanceRecord !== 'undefined' && attendanceRecord) ? attendanceRecord :
                      ((typeof attendance !== 'undefined' && attendance) ? attendance : {});

    if (typeof attSource === 'object' && attSource !== null) {
        Object.keys(attSource).forEach(d => {
            try {
                const dt = new Date(d);
                if (!isNaN(dt.getTime()) && dt.getDay() === 5) {
                    fridays.add(d);
                }
            } catch(e) {}
        });
    }

    // إضافة موعد الانطلاق المعتمد وموعد اليوم إن كان جمعة
    fridays.add('2026-11-06');
    if (typeof today === 'string' && today) {
        try {
            const dtToday = new Date(today);
            if (dtToday.getDay() === 5) fridays.add(today);
        } catch(e) {}
    }
    return Array.from(fridays).sort().reverse();
}

activeExportStageTab = (typeof activeExportStageTab !== 'undefined' && activeExportStageTab) ? activeExportStageTab : 'all';

function setAttendanceExportStageTab(stageKey, btnElement) {
    activeExportStageTab = stageKey;
    document.querySelectorAll('.stage-filter-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#475569';
        b.classList.remove('active');
    });
    if (btnElement) {
        btnElement.style.background = '#0f172a';
        btnElement.style.color = '#ffffff';
        btnElement.classList.add('active');
    }
    renderAttendanceExportReport();
}

function renderAttendanceExportReport() {
    const dateSelect = document.getElementById('exportReportDateSelect');
    if (!dateSelect) return;

    // ملء قائمة الجمعات المتاحة إن كانت فارغة
    if (dateSelect.options.length === 0) {
        const availableDates = getRadarAvailableFridays();
        dateSelect.innerHTML = availableDates.map(d => {
            return `<option value="${d}">${d === '2026-11-06' ? 'جمعة الانطلاق (2026-11-06)' : 'جمعة ' + d}</option>`;
        }).join('');
    }

    const selectedDate = dateSelect.value || '2026-11-06';
    
    // جلب كشف الحضور بأمان لدعم المصفوفة والكائنات
    const rawRecord = (typeof attendanceRecord !== 'undefined' && attendanceRecord) ? attendanceRecord :
                      ((typeof attendance !== 'undefined' && attendance) ? attendance : {});
    const dayAttendance = rawRecord[selectedDate] || [];

    // جلب قائمة الأعذار الرسمية إن كانت متاحة
    const excusesList = (typeof window !== 'undefined' && Array.isArray(window.lastRadarExcusesList)) ? window.lastRadarExcusesList : [];

    // قراءة حالة مربعات الاختيار (الفلاتر)
    const showOnTime = document.getElementById('chkExportOnTime')?.checked ?? true;
    const showMinor = document.getElementById('chkExportMinor')?.checked ?? true;
    const showSevere = document.getElementById('chkExportSevere')?.checked ?? true;
    const showExcused = document.getElementById('chkExportExcused')?.checked ?? true;
    const showAbsent = document.getElementById('chkExportAbsent')?.checked ?? true;

    // تصنيف الطلاب إلى الفرقتين
    const stage1List = [];
    const stage2List = [];

    let countOnTime = 0;
    let countMinor = 0;
    let countSevere = 0;
    let countApprovedDelay = 0;
    let countExcused = 0;
    let countExcusedPrior = 0;
    let countExcusedLate = 0;
    let countAbsent = 0;

    const allMembers = Array.isArray(members) ? members : [];

    allMembers.forEach(m => {
        const mCode = String(m.code || m.id || '').trim();
        const mName = String(m.name || '').trim();
        const mPhone = String(m.phone || '').trim().replace(/\D/g, '');
        if (!mName || ['500', '50005', '6650', 'admin', '10000001'].includes(mCode)) return;

        // البحث عن سجل الحضور سواء كان مصفوفة أو كائناً
        let attRecord = null;
        if (Array.isArray(dayAttendance)) {
            attRecord = dayAttendance.find(a => 
                (a.id && String(a.id).trim() === mCode) || 
                (a.code && String(a.code).trim() === mCode) ||
                (a.name && a.name.trim() === mName)
            );
        } else if (typeof dayAttendance === 'object' && dayAttendance !== null) {
            attRecord = dayAttendance[mCode] || Object.values(dayAttendance).find(a => a && (a.name === mName || a.phone === m.phone));
        }

        // فحص إذا كان الطالب مسجلاً ضمن الأعذار الرسمية لهذا اليوم
        let matchedExcuse = null;
        if (!attRecord || (!attRecord.attended && !attRecord.time)) {
            matchedExcuse = excusesList.find(ex => {
                if (!ex) return false;
                if (ex.friday_date && ex.friday_date !== selectedDate) return false;
                const exName = (ex.student_name || '').trim();
                const exPhone = (ex.student_phone || '').trim().replace(/\D/g, '');
                return (exName && mName && (exName === mName || exName.includes(mName) || mName.includes(exName))) ||
                       (exPhone && mPhone && (exPhone.includes(mPhone) || mPhone.includes(exPhone)));
            });
        }

        const classification = classifyAttendanceStatus(attRecord, matchedExcuse);
        const stage = normalizeStudentStage(m.stage);

        if (classification.status === 'on_time') countOnTime++;
        else if (classification.status === 'minor_delay') countMinor++;
        else if (classification.status === 'approved_delay') countApprovedDelay++;
        else if (classification.status === 'severe_delay') countSevere++;
        else if (classification.status === 'excused') {
            countExcused++;
            countExcusedPrior++;
        }
        else if (classification.status === 'excused_late') {
            countExcused++;
            countExcusedLate++;
        }
        else countAbsent++;

        const studentItem = {
            code: mCode,
            name: mName,
            stage: stage,
            phone: m.phone || '',
            confessor: m.confessor || '',
            time: (attRecord && attRecord.time) ? attRecord.time : '',
            status: classification.status,
            label: classification.label,
            icon: classification.icon,
            color: classification.color,
            bgColor: classification.bgColor,
            note: classification.note,
            delayMinutes: classification.delayMinutes
        };

        if (stage === 'الفرقة الثانية') {
            stage2List.push(studentItem);
        } else {
            stage1List.push(studentItem);
        }
    });

    const totalStudents = stage1List.length + stage2List.length;
    const totalAttended = countOnTime + countMinor + countApprovedDelay + countSevere;
    const attPct = totalStudents > 0 ? Math.round((totalAttended / totalStudents) * 100) : 0;

    // تحديث بطاقات النبض الإحصائية العلوية
    const elTotal = document.getElementById('kpiExp_total');
    const elOnTime = document.getElementById('kpiExp_ontime');
    const elMinor = document.getElementById('kpiExp_minor');
    const elSevere = document.getElementById('kpiExp_severe');
    const elExcused = document.getElementById('kpiExp_excused');
    const elAbsent = document.getElementById('kpiExp_absent');
    const elPct = document.getElementById('kpiExp_pct');

    if (elTotal) elTotal.innerText = totalStudents;
    if (elOnTime) elOnTime.innerText = countOnTime;
    if (elMinor) elMinor.innerText = countMinor;
    const elApprovedDelay = document.getElementById('kpiExp_approvedDelay');
    if (elApprovedDelay) elApprovedDelay.innerText = countApprovedDelay;
    if (elSevere) elSevere.innerText = countSevere;
    if (elExcused) elExcused.innerText = countExcused;
    const elExcusedSub = document.getElementById('kpiExp_excused_sub');
    if (elExcusedSub) {
        elExcusedSub.textContent = countExcused > 0 ? ("(" + countExcusedPrior + " مسبق + " + countExcusedLate + " لاحق)") : "";
    }
    if (elAbsent) elAbsent.innerText = countAbsent;
    if (elPct) elPct.innerText = attPct + '%';

    // تحديث أعداد الفلاتر (البادجات)
    const cntOnTimeBadge = document.getElementById('cntBadge_onTime');
    const cntMinorBadge = document.getElementById('cntBadge_minor');
    const cntApprovedDelayBadge = document.getElementById('cntBadge_approvedDelay');
    const cntSevereBadge = document.getElementById('cntBadge_severe');
    const cntExcusedBadge = document.getElementById('cntBadge_excused');
    const cntAbsentBadge = document.getElementById('cntBadge_absent');

    if (cntOnTimeBadge) cntOnTimeBadge.innerText = `(${countOnTime})`;
    if (cntMinorBadge) cntMinorBadge.innerText = "(" + countMinor + ")";
    if (cntApprovedDelayBadge) cntApprovedDelayBadge.innerText = "(" + countApprovedDelay + ")";
    if (cntSevereBadge) cntSevereBadge.innerText = `(${countSevere})`;
    if (cntExcusedBadge) cntExcusedBadge.innerText = `(${countExcused})`;
    if (cntAbsentBadge) cntAbsentBadge.innerText = `(${countAbsent})`;

    // دالة فلترة الصفوف بحسب مربعات الاختيار
    const showApprovedDelay = document.getElementById('chkExportApprovedDelay')?.checked ?? true;
    const matchesFilter = (item) => {
        if (item.status === 'on_time' && !showOnTime) return false;
        if (item.status === 'minor_delay' && !showMinor) return false;
        if (item.status === 'approved_delay' && !showApprovedDelay) return false;
        if (item.status === 'severe_delay' && !showSevere) return false;
        if ((item.status === 'excused' || item.status === 'excused_late') && !showExcused) return false;
        if (item.status === 'absent' && !showAbsent) return false;
        return true;
    };

    const filteredStage1 = stage1List.filter(matchesFilter);
    const filteredStage2 = stage2List.filter(matchesFilter);

    // تحديث أعداد تبويبات المراحل
    const tabAllCount = document.getElementById('stageTabCount_all');
    const tab1Count = document.getElementById('stageTabCount_stage1');
    const tab2Count = document.getElementById('stageTabCount_stage2');
    if (tabAllCount) tabAllCount.innerText = `(${filteredStage1.length + filteredStage2.length})`;
    if (tab1Count) tab1Count.innerText = `(${filteredStage1.length})`;
    if (tab2Count) tab2Count.innerText = `(${filteredStage2.length})`;

    // دالة إنشاء كود الجدول للشاشات
    const buildTableHtml = (list, stageTitle, totalCount, headerColor = '#0f172a') => {
        if (list.length === 0) {
            return `
                <div style="background:#ffffff; border:1px dashed #cbd5e1; border-radius:12px; padding:20px; text-align:center; color:#64748b; margin-bottom:16px;">
                    <div style="font-size:1.5rem; margin-bottom:6px;">🔍</div>
                    <strong>لا توجد سجلات مطابقة للفلاتر المختارة في ${stageTitle}.</strong>
                    <div style="font-size:0.8rem; margin-top:4px;">يمكنك تفعيل خيارات الفلاتر بالأعلى لعرض كافة المخدومين.</div>
                </div>
            `;
        }
        return `
            <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; overflow:hidden; margin-bottom:20px; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
                <div style="background:${headerColor}; color:#ffffff; padding:12px 18px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.2rem;">🎓</span>
                        <strong style="font-size:1.05rem; letter-spacing:0.2px;">${stageTitle}</strong>
                    </div>
                    <span style="font-size:0.82rem; font-weight:800; background:rgba(255,255,255,0.2); color:#ffffff; padding:4px 12px; border-radius:999px;">
                        المعروض: ${list.length} من أصل ${totalCount} مخدوم
                    </span>
                </div>
                <div class="table-responsive-wrapper" style="width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; margin:0; border:none; border-radius:0;">
                    <table style="width:100%; min-width:740px; table-layout:fixed; border-collapse:collapse; font-size:0.82rem; text-align:center;">
                        <thead>
                            <tr style="background:#f8fafc; color:#334155; border-bottom:2px solid #e2e8f0; font-weight:900;">
                                <th style="padding:9px 4px; width:40px;">م</th>
                                <th style="padding:9px 4px; width:70px;">الكود</th>
                                <th style="padding:9px 8px; width:180px; text-align:right;">اسم المخدوم</th>
                                <th style="padding:9px 6px; width:130px;">حالة الحضور</th>
                                <th style="padding:9px 4px; width:95px;">وقت الدخول</th>
                                <th style="padding:9px 8px; width:190px; text-align:right;">الملاحظة الرعوية / العذر</th>
                                <th style="padding:9px 4px; width:125px;">الهاتف</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map((s, idx) => `
                                <tr style="border-bottom:1px solid #f1f5f9; background:${idx % 2 === 0 ? '#ffffff' : '#fcfcfc'}; transition:background 0.15s ease;">
                                    <td style="padding:7px 4px; color:#94a3b8; font-weight:bold; font-size:0.78rem;">${idx + 1}</td>
                                    <td style="padding:7px 4px; font-weight:800; color:#475569; font-family:monospace; font-size:0.8rem;">${s.code}</td>
                                    <td style="padding:7px 8px; text-align:right; font-weight:900; color:#0f172a; font-size:0.84rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</td>
                                    <td style="padding:7px 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;">
                                        <span style="display:inline-flex; align-items:center; justify-content:center; gap:3px; padding:2px 8px; border-radius:999px; font-weight:800; font-size:0.74rem; white-space:nowrap; color:${s.color}; background:${s.bgColor}; border:1px solid ${s.color}33; max-width:100%; overflow:hidden; text-overflow:ellipsis;">
                                            ${s.icon} ${s.label}
                                        </span>
                                    </td>
                                    <td style="padding:7px 4px; color:#1e293b; font-weight:bold; font-size:0.78rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" dir="ltr">${s.time || '-'}</td>
                                    <td style="padding:7px 8px; text-align:right; font-size:0.78rem; font-weight:bold; color:${s.status === 'excused' ? '#0369a1' : (s.status === 'severe_delay' ? '#b91c1c' : (s.status === 'minor_delay' ? '#b45309' : (s.status === 'absent' ? '#991b1b' : '#15803d')))}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:190px;" title="${escapeHtml(s.note)}">
                                        ${escapeHtml(s.note)}
                                    </td>
                                    <td style="padding:7px 4px; color:#64748b; font-size:0.78rem; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:125px;" dir="ltr">${s.phone || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // رسم الجداول في واجهة المستخدم بحسب تبويب المرحلة
    const tablesContainer = document.getElementById('exportReportTablesContainer');
    if (tablesContainer) {
        let html = '';
        if (activeExportStageTab === 'all' || activeExportStageTab === 'stage1') {
            html += buildTableHtml(filteredStage1, 'الفرقة الأولى (سنة أولى)', stage1List.length, 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)');
        }
        if (activeExportStageTab === 'all' || activeExportStageTab === 'stage2') {
            html += buildTableHtml(filteredStage2, 'الفرقة الثانية (سنة ثانية)', stage2List.length, 'linear-gradient(135deg, #065f46 0%, #047857 100%)');
        }
        tablesContainer.innerHTML = html;
    }

    // بناء النسخة الطباعية المعتمدة لورقة واحدة A4
    buildOnePagePrintableA4(selectedDate, filteredStage1, filteredStage2, {
        totalStudents,
        countOnTime,
        countMinor,
        countApprovedDelay,
        countSevere,
        countExcused,
        countAbsent,
        attPct
    });
}

function buildOnePagePrintableA4(serviceDate, stage1List, stage2List, stats) {
    const printContainer = document.getElementById('printableAttendanceReport');
    if (!printContainer) return;

    const renderCompactPrintTable = (list, stageTitle, headerBg = '#1e3a8a') => {
        return `
            <div style="margin-bottom:4px; page-break-inside:avoid;">
                <div style="background:${headerBg}; color:#ffffff; padding:2px 8px; font-size:7.8pt; font-weight:900; display:flex; justify-content:space-between; border-radius:3px 3px 0 0;">
                    <span>🎓 ${stageTitle}</span>
                    <span>العدد المعروض: ${list.length}</span>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:7pt; text-align:center; border:1px solid #cbd5e1;">
                    <thead>
                        <tr style="background:#f1f5f9; color:#0f172a; border-bottom:1px solid #cbd5e1; font-weight:900;">
                            <th style="padding:1.5px 2px; width:18px; border:0.5px solid #cbd5e1;">م</th>
                            <th style="padding:1.5px 2px; width:30px; border:0.5px solid #cbd5e1;">كود</th>
                            <th style="padding:1.5px 4px; text-align:right; border:0.5px solid #cbd5e1;">اسم المخدوم</th>
                            <th style="padding:1.5px 3px; width:72px; border:0.5px solid #cbd5e1;">الحالة</th>
                            <th style="padding:1.5px 2px; width:45px; border:0.5px solid #cbd5e1;">الوقت</th>
                            <th style="padding:1.5px 4px; text-align:right; border:0.5px solid #cbd5e1;">الملاحظة / العذر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map((s, idx) => `
                            <tr style="border-bottom:0.5px solid #e2e8f0; background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; line-height:1.2;">
                                <td style="padding:1.2px 2px; border:0.5px solid #e2e8f0; color:#64748b;">${idx + 1}</td>
                                <td style="padding:1.2px 2px; border:0.5px solid #e2e8f0; font-weight:bold;">${s.code}</td>
                                <td style="padding:1.2px 4px; text-align:right; border:0.5px solid #e2e8f0; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:115px;">${s.name}</td>
                                <td style="padding:1.2px 2px; border:0.5px solid #e2e8f0; font-weight:bold; color:${s.color};">
                                    ${s.label}
                                </td>
                                <td style="padding:1.2px 2px; border:0.5px solid #e2e8f0;" dir="ltr">${s.time || '-'}</td>
                                <td style="padding:1.2px 4px; text-align:right; border:0.5px solid #e2e8f0; font-size:6.6pt; color:${s.status === 'excused' ? '#0284c7' : '#475569'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">
                                    ${s.note || '-'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    printContainer.innerHTML = `
        <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction:rtl; text-align:right; width:100%; box-sizing:border-box;">
            <!-- Official Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1e3a8a; padding-bottom:3px; margin-bottom:5px;">
                <div style="text-align:right;">
                    <div style="font-size:9pt; font-weight:bold; color:#1e3a8a;">كنيسة رئيس الملائكة ميخائيل والشهيد مارجرجس بالطرية</div>
                    <div style="font-size:8pt; font-weight:bold; color:#475569;">اجتماع القديس بولس الرسول لإعداد الخدام والشباب</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:10.5pt; font-weight:900; color:#1e3a8a;">📊 كشف الحضور والتأخيرات والغياب المعتمد</div>
                    <div style="font-size:8pt; font-weight:bold; color:#0f766e;">🗓️ لقاء جمعة: ${serviceDate}</div>
                </div>
                <div style="text-align:left; font-size:7.2pt; color:#64748b;">
                    <div>العام الدراسي: 2026 - 2027</div>
                    <div>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
                </div>
            </div>

            <!-- Stats Ribbon -->
            <div style="display:flex; justify-content:space-between; background:#f8fafc; border:1px solid #cbd5e1; border-radius:3px; padding:2px 8px; margin-bottom:6px; font-size:7.5pt; font-weight:bold;">
                <span>👥 المقيدين: <strong>${stats.totalStudents}</strong></span>
                <span style="color:#15803d;">🟢 في الموعد: <strong>${stats.countOnTime}</strong></span>
                <span style="color:#b45309;">🟡 تأخير بسيط: <strong>${stats.countMinor}</strong></span>
                ${stats.countApprovedDelay > 0 ? `<span style="color:#d97706;">⏰ بإذن: <strong>${stats.countApprovedDelay}</strong></span>` : ''}
                <span style="color:#b91c1c;">🔴 تأخير شديد: <strong>${stats.countSevere}</strong></span>
                <span style="color:#0284c7;">🕊️ بعذر: <strong>${stats.countExcused}</strong></span>
                <span style="color:#dc2626;">❌ غياب: <strong>${stats.countAbsent}</strong></span>
                <span style="color:#1e3a8a;">📈 نسبة الحضور: <strong>${stats.attPct}%</strong></span>
            </div>

            <!-- Dual Columns Layout for Single Page Efficiency -->
            <div style="display:grid; grid-template-columns: 1.12fr 0.88fr; gap:6px;">
                <div>
                    ${renderCompactPrintTable(stage1List, 'الفرقة الأولى', '#1e3a8a')}
                </div>
                <div>
                    ${renderCompactPrintTable(stage2List, 'الفرقة الثانية', '#065f46')}
                </div>
            </div>

            <!-- Footer Signatures -->
            <div style="display:flex; justify-content:space-between; margin-top:6px; padding-top:3px; border-top:1px dashed #cbd5e1; font-size:7.2pt; color:#475569;">
                <div>مسؤول رصد الحضور: ___________________</div>
                <div>أمين الخدمة: ___________________</div>
                <div>أب اعتراف الاجتماع: ___________________</div>
            </div>
        </div>
    `;
}

function printAttendanceOnePagePDF() {
    renderAttendanceExportReport();
    setTimeout(() => {
        window.print();
    }, 250);
}

function buildAttendanceWhatsAppReportText() {
    const dateSelect = document.getElementById('exportReportDateSelect');
    const selectedDate = dateSelect ? dateSelect.value : '2026-11-06';
    
    const rawRecord = (typeof attendanceRecord !== 'undefined' && attendanceRecord) ? attendanceRecord :
                      ((typeof attendance !== 'undefined' && attendance) ? attendance : {});
    const dayAttendance = rawRecord[selectedDate] || [];

    const excusesList = (typeof window !== 'undefined' && Array.isArray(window.lastRadarExcusesList)) ? window.lastRadarExcusesList : [];

    const allMembers = Array.isArray(members) ? members : [];
    const stage1Present = [];
    const stage1Excused = [];
    const stage1Absent = [];

    const stage2Present = [];
    const stage2Excused = [];
    const stage2Absent = [];

    const delaysList = [];

    allMembers.forEach(m => {
        const mCode = String(m.code || m.id || '').trim();
        const mName = String(m.name || '').trim();
        const mPhone = String(m.phone || '').trim().replace(/\D/g, '');
        if (!mName || ['500', '50005', '6650', 'admin', '10000001'].includes(mCode)) return;

        let attRecord = null;
        if (Array.isArray(dayAttendance)) {
            attRecord = dayAttendance.find(a => 
                (a.id && String(a.id).trim() === mCode) || 
                (a.code && String(a.code).trim() === mCode) ||
                (a.name && a.name.trim() === mName)
            );
        } else if (typeof dayAttendance === 'object' && dayAttendance !== null) {
            attRecord = dayAttendance[mCode] || Object.values(dayAttendance).find(a => a && (a.name === mName || a.phone === m.phone));
        }

        let matchedExcuse = null;
        if (!attRecord || (!attRecord.attended && !attRecord.time)) {
            matchedExcuse = excusesList.find(ex => {
                if (!ex) return false;
                if (ex.friday_date && ex.friday_date !== selectedDate) return false;
                const exName = (ex.student_name || '').trim();
                const exPhone = (ex.student_phone || '').trim().replace(/\D/g, '');
                return (exName && mName && (exName === mName || exName.includes(mName) || mName.includes(exName))) ||
                       (exPhone && mPhone && (exPhone.includes(mPhone) || mPhone.includes(exPhone)));
            });
        }

        const classification = classifyAttendanceStatus(attRecord, matchedExcuse);
        const stage = normalizeStudentStage(m.stage);

        if (classification.status === 'on_time' || classification.status === 'minor_delay' || classification.status === 'severe_delay') {
            const studentEntry = { name: mName, time: attRecord?.time || '', delayMinutes: classification.delayMinutes };
            if (stage === 'الفرقة الثانية') stage2Present.push(studentEntry);
            else stage1Present.push(studentEntry);

            if (classification.status === 'minor_delay' || classification.status === 'severe_delay') {
                delaysList.push({ name: mName, stage, label: classification.label, time: attRecord?.time || '', note: classification.note });
            }
        } else if (classification.status === 'excused' || classification.status === 'excused_late') {
            const excuseEntry = { 
                name: mName, 
                reason: classification.note, 
                isLate: classification.status === 'excused_late' 
            };
            if (stage === 'الفرقة الثانية') stage2Excused.push(excuseEntry);
            else stage1Excused.push(excuseEntry);
        } else {
            if (stage === 'الفرقة الثانية') stage2Absent.push(mName);
            else stage1Absent.push(mName);
        }
    });

    const totalStudents = stage1Present.length + stage1Excused.length + stage1Absent.length + 
                          stage2Present.length + stage2Excused.length + stage2Absent.length;
    const totalPresent = stage1Present.length + stage2Present.length;
    const totalExcused = stage1Excused.length + stage2Excused.length;
    const totalAbsent = stage1Absent.length + stage2Absent.length;
    const attPct = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    let text = `⛪ *كنيسة رئيس الملائكة والشهيد مارجرجس بالطرية*\n`;
    text += `📖 *اجتماع القديس بولس الرسول لإعداد الخدام والشباب*\n`;
    text += `📊 *كشف الحضور والتأخيرات والغياب الأسبوعي المعتمد*\n`;
    text += `🗓️ لقاء جمعة: ${selectedDate}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `📈 *الملخص الإحصائي العام:*\n`;
    text += `👥 إجمالي المقيدين: ${totalStudents} مخدوم\n`;
    text += `🟢 الحاضرون: ${totalPresent} مخدوم (${attPct}%)\n`;
    if (delaysList.length > 0) text += `🟡 التأخيرات: ${delaysList.length} مخدوم\n`;
    if (totalExcused > 0) text += `🕊️ غياب بعذر مقبول: ${totalExcused} مخدوم\n`;
    text += `❌ غياب بدون عذر: ${totalAbsent} مخدوم\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🎓 *الفرقة الأولى (سنة أولى):*\n`;
    text += `• الحضور: ${stage1Present.length} | الغياب: ${stage1Absent.length + stage1Excused.length} (منهم ${stage1Excused.length} بعذر)\n\n`;

    text += `🎓 *الفرقة الثانية (سنة ثانية):*\n`;
    text += `• الحضور: ${stage2Present.length} | الغياب: ${stage2Absent.length + stage2Excused.length} (منهم ${stage2Excused.length} بعذر)\n\n`;

    if (delaysList.length > 0) {
        text += `⏰ *كشف التأخيرات:* (${delaysList.length} مخدوم)\n`;
        delaysList.forEach((d, i) => {
            text += `${i + 1}. ${d.name} (${d.stage}) - ${d.label} [${d.time}] (${d.note})\n`;
        });
        text += `\n`;
    }

    if (totalExcused > 0) {
        const allExc = [...stage1Excused, ...stage2Excused];
        const priorExc = allExc.filter(e => !e.isLate);
        const lateExc = allExc.filter(e => e.isLate);

        text += `⚖️ *كشف الأعذار وموقفها من مهلة الأربعاء الرسمية:*\n`;
        text += `📌 _الحد الأقصى المعتمد لاستلام الأعذار هو نهاية يوم الأربعاء._\n\n`;

        if (priorExc.length > 0) {
            text += `🔹 *أعذار مسبقة (قبل الاجتماع):* (${priorExc.length} مخدوم)\n`;
            priorExc.forEach((ex, i) => {
                text += `${i + 1}. ${ex.name} - ${ex.reason}\n`;
            });
            text += `\n`;
        }

        if (lateExc.length > 0) {
            text += `🔸 *أعذار لاحقة (متأخرة بعد انتهاء الاجتماع):* (${lateExc.length} مخدوم)\n`;
            lateExc.forEach((ex, i) => {
                text += `${i + 1}. ${ex.name} - ${ex.reason}\n`;
            });
            text += `\n`;
        }
    }

    if (totalAbsent > 0) {
        text += `⚠️ *كشف الغائبين بدون عذر (للمتابعة والافتقاد الرعوي):*\n`;
        if (stage1Absent.length > 0) {
            text += `🔹 *سنة أولى:* ${stage1Absent.join('، ')}\n`;
        }
        if (stage2Absent.length > 0) {
            text += `🔹 *سنة ثانية:* ${stage2Absent.join('، ')}\n`;
        }
        text += `\n`;
    }

    text += `🕊️ *صلوا من أجل الخدمة وكل نفس مباركة*`;
    return text;
}

async function sendAttendanceReportToWhatsAppGroup() {
    const reportText = buildAttendanceWhatsAppReportText();
    const btn = document.getElementById('btnSendWA_group');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري إرسال التقرير...';
    }

    try {
        const res = await fetch('http://localhost:3000/api/group/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetJid: '120363430940374327@g.us', // خدام اجتماع القديس بولس الرسول 2027
                text: reportText
            })
        });
        const data = await res.json();
        if (data.success) {
            if (typeof showToast === 'function') {
                showToast('🎉 تم إرسال تقرير الحضور والتأخيرات إلى جروب الخدام بنجاح!');
            } else {
                alert('🎉 تم إرسال تقرير الحضور والغياب لجروب الخدام بالواتساب بنجاح! 🚀');
            }
        } else {
            throw new Error(data.error || 'تعذر الإرسال');
        }
    } catch(err) {
        console.warn('API send failed, fallback to direct WA link:', err);
        const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;
        if (confirm(`تعذر الإرسال المباشر عبر خادم الواتساب المحلي (${err.message}). هل ترغب في فتح واتساب لإرسال التقرير لجروب الخدام؟`)) {
            window.open(waLink, '_blank');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-brands fa-whatsapp me-1"></i> 📲 إرسال التقرير لجروب الواتس أب الخدام';
        }
    }
}

function shareAttendanceReportViaWhatsAppWeb() {
    const reportText = buildAttendanceWhatsAppReportText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`, '_blank');
}

function copyAttendanceReportToClipboard() {
    const reportText = buildAttendanceWhatsAppReportText();
    navigator.clipboard.writeText(reportText).then(() => {
        if (typeof showToast === 'function') {
            showToast('📋 تم نسخ تقرير الحضور والغياب كاملاً بنجاح!');
        } else {
            alert('📋 تم نسخ تقرير الحضور والغياب كاملاً للحافظة بنجاح!');
        }
    }).catch(() => {
        prompt('انسخ التقرير يدوياً:', reportText);
    });
}

// Window Exports
if (typeof window !== 'undefined') {
    window.renderAttendanceExportReport = renderAttendanceExportReport;
    window.setAttendanceExportStageTab = setAttendanceExportStageTab;
    window.printAttendanceOnePagePDF = printAttendanceOnePagePDF;
    window.sendAttendanceReportToWhatsAppGroup = sendAttendanceReportToWhatsAppGroup;
    window.shareAttendanceReportViaWhatsAppWeb = shareAttendanceReportViaWhatsAppWeb;
    window.copyAttendanceReportToClipboard = copyAttendanceReportToClipboard;
}

// ==========================================
// 📲 إرسال ومشاركة تقرير نبض الاجتماع التنفيذي لجروب الخدام (WhatsApp)
// ==========================================

function buildMeetingPulseWhatsAppReportText() {
    // التحقق من توافر بيانات النبض المحسوبة أو حسابها ديناميكياً
    if (!window.lastMeetingPulseData && typeof renderRadarPulseChart === 'function') {
        try { renderRadarPulseChart(window.lastValidMeetingDates || []); } catch(e){}
    }
    const d = window.lastMeetingPulseData || {};
    const date = d.date || '06-11-2026';
    const total = d.totalMembers || (typeof members !== 'undefined' ? members.length : 89);
    const actual = d.actualAttCount !== undefined ? d.actualAttCount : 56;
    const actualPct = d.attPct !== undefined ? d.attPct : Math.round((actual / total) * 100);
    const excuses = d.excuseCount !== undefined ? d.excuseCount : 5;
    const excusesPct = d.excusePct !== undefined ? d.excusePct : Math.round((excuses / total) * 100);
    const engaged = d.engagedCount !== undefined ? d.engagedCount : (actual + excuses);
    const engagedPct = d.engagedPct !== undefined ? d.engagedPct : Math.round((engaged / total) * 100);
    const unexcused = d.unexcusedCount !== undefined ? d.unexcusedCount : Math.max(0, total - engaged);
    const unexcusedPct = d.unexcusedPct !== undefined ? d.unexcusedPct : Math.round((unexcused / total) * 100);

    const s1Total = d.stage1Total || 65;
    const s1Att = d.attStage1 !== undefined ? d.attStage1 : 43;
    const s1AttPct = d.stage1AttPct !== undefined ? d.stage1AttPct : Math.round((s1Att / s1Total) * 100);
    const s1Exc = d.excuseStage1 !== undefined ? d.excuseStage1 : 5;
    const s1ExcPct = d.stage1ExcusePct !== undefined ? d.stage1ExcusePct : Math.round((s1Exc / s1Total) * 100);
    const s1Engaged = s1Att + s1Exc;
    const s1EngagedPct = d.stage1EngagedPct !== undefined ? d.stage1EngagedPct : Math.round((s1Engaged / s1Total) * 100);
    const s1Unexc = d.unexcusedStage1 !== undefined ? d.unexcusedStage1 : Math.max(0, s1Total - s1Engaged);
    const s1UnexcPct = d.stage1UnexcusedPct !== undefined ? d.stage1UnexcusedPct : Math.round((s1Unexc / s1Total) * 100);

    const s2Total = d.stage2Total || 24;
    const s2Att = d.attStage2 !== undefined ? d.attStage2 : 13;
    const s2AttPct = d.stage2AttPct !== undefined ? d.stage2AttPct : Math.round((s2Att / s2Total) * 100);
    const s2Exc = d.excuseStage2 !== undefined ? d.excuseStage2 : 0;
    const s2ExcPct = d.stage2ExcusePct !== undefined ? d.stage2ExcusePct : Math.round((s2Exc / s2Total) * 100);
    const s2Engaged = s2Att + s2Exc;
    const s2EngagedPct = d.stage2EngagedPct !== undefined ? d.stage2EngagedPct : Math.round((s2Engaged / s2Total) * 100);
    const s2Unexc = d.unexcusedStage2 !== undefined ? d.unexcusedStage2 : Math.max(0, s2Total - s2Engaged);
    const s2UnexcPct = d.stage2UnexcusedPct !== undefined ? d.stage2UnexcusedPct : Math.round((s2Unexc / s2Total) * 100);

    function renderPulseTextProgressBar(pct, len = 10) {
        const p = Math.min(100, Math.max(0, Number(pct) || 0));
        const filled = Math.round((p / 100) * len);
        const empty = Math.max(0, len - filled);
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    let t = `📊 *تقرير نبض الاجتماع ومؤشرات الحضور الرعوي* 🕊️\n`;
    t += `*اجتماع القديس بولس لإعداد الخدام*\n`;
    t += `📅 *جمعة:* ${date}\n`;
    t += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    t += `✨ *المؤشرات التنفيذية الكبرى:*` + `\n`;
    t += `🟢 *الحضور الفعلي الموثق:* ${actual} دارساً (${actualPct}%)\n`;
    t += `💌 *الغياب بعذر معتمد مسبقاً:* ${excuses} دارسين (${excusesPct}%)\n`;
    t += `🌟 *إجمالي التفاعل الإيجابي الموثق:* ${engaged} دارساً (${engagedPct}%)\n`;
    t += `🔴 *مستهدفو رادار الافتقاد:* ${unexcused} دارساً (${unexcusedPct}%)\n`;
    t += `👥 *إجمالي القوة المسجلة:* ${total} دارساً\n\n`;

    t += `━━━━━━━━━━━━━━━━━━━━\n`;
    t += `🎓 *مقارنة أداء وتنافسية الفرق (Stage Breakdown):*\n\n`;

    t += `🔹 *الفرقة الأولى (${s1Total} دارساً):*\n`;
    t += `  [${renderPulseTextProgressBar(s1AttPct)}] ${s1AttPct}% حضور (${s1Att} دارساً)\n`;
    t += `  [${renderPulseTextProgressBar(s1EngagedPct)}] ${s1EngagedPct}% تفاعل موثق (${s1Engaged} دارساً)\n`;
    t += `  • 🕊️ أعذار رسمية: ${s1Exc} دارسين (${s1ExcPct}%)\n`;
    t += `  • 🚨 مستهدفو افتقاد: ${s1Unexc} دارساً (${s1UnexcPct}%)\n\n`;

    t += `🔸 *الفرقة الثانية (${s2Total} دارساً):*\n`;
    t += `  [${renderPulseTextProgressBar(s2AttPct)}] ${s2AttPct}% حضور (${s2Att} دارساً)\n`;
    t += `  [${renderPulseTextProgressBar(s2EngagedPct)}] ${s2EngagedPct}% تفاعل موثق (${s2Engaged} دارساً)\n`;
    t += `  • 🕊️ أعذار رسمية: ${s2Exc} (${s2ExcPct}%)\n`;
    t += `  • 🚨 مستهدفو افتقاد: ${s2Unexc} دارساً (${s2UnexcPct}%)\n\n`;

    t += `━━━━━━━━━━━━━━━━━━━━\n`;
    t += `🔥 *التوجيه الرعوي ومستهدف الجمعة القادمة 13 نوفمبر:*` + `\n`;
    t += `💡 المستهدف المشترك للفرقتين: كسر حاجز *75% حضور مباشر* (الوصول لـ 70 مخدوماً بإذن ربنا).\n`;
    t += `🚨 نرجو من أحبائنا الخدام تكثيف الزيارات والمكالمات الهاتفية خلال هذا الأسبوع للمستهدفين بالافتقاد (${unexcused} دارساً).\n\n`;

    t += `*«كُلُّ وَاحِدٍ سَيَأْخُذُ أُجْرَتَهُ بِحَسَبِ تَعَبِهِ» (1 كو 3: 8)*\n`;
    t += `🕊️ صلواتكم لبركة الخدمة وسلامة الرعية`;
    return t;
}

function openPulseReportPreviewModal() {
    const text = buildMeetingPulseWhatsAppReportText();
    const txtArea = document.getElementById('pulseReportPreviewTextarea');
    if (txtArea) txtArea.value = text;
    const modal = document.getElementById('modalPulsePreview');
    if (modal) modal.style.display = 'flex';
}

function closePulseReportPreviewModal() {
    const modal = document.getElementById('modalPulsePreview');
    if (modal) modal.style.display = 'none';
}

// 📸 دالة التقاط بطاقة الإنفوجرافيك الرعوية كصورة عالية الدقة (2X Retina)
async function capturePulseInfographicCanvas() {
    if (typeof html2canvas === 'undefined') {
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        } catch(loadErr) {
            console.warn('Failed to load html2canvas from CDN:', loadErr);
            return null;
        }
    }

    const cardEl = document.querySelector('#radarSec_pulse .radar-section-box');
    if (!cardEl) return null;

    // إخفاء أزرار المشاركة مؤقتاً أثناء الالتقاط للحصول على صورة إنفوجرافيك نقية ومثالية
    const shareBar = document.getElementById('pulseShareActionsBar');
    const headerBtns = document.getElementById('pulseHeaderActionBtns');
    if (shareBar) shareBar.style.display = 'none';
    if (headerBtns) headerBtns.style.display = 'none';

    try {
        const canvas = await html2canvas(cardEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        return canvas;
    } finally {
        if (shareBar) shareBar.style.display = '';
        if (headerBtns) headerBtns.style.display = '';
    }
}

async function shareMeetingPulseToServantsGroup(actionType = 'bot') {
    const reportText = buildMeetingPulseWhatsAppReportText();

    if (actionType === 'copy') {
        try {
            await navigator.clipboard.writeText(reportText);
            if (typeof showToast === 'function') {
                showToast('📋 تم نسخ نص تقرير نبض الاجتماع بنجاح! جاهز للصق في جروب الخدام.');
            } else {
                alert('📋 تم نسخ تقرير نبض الاجتماع بنجاح!');
            }
        } catch(e) {
            console.warn('Clipboard write failed:', e);
            if (window.prompt) window.prompt('انسخ نص التقرير أدناه:', reportText);
        }
        return;
    }

    if (actionType === 'whatsapp') {
        const waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(reportText);
        window.open(waUrl, '_blank');
        return;
    }

    if (actionType === 'download_image') {
        try {
            if (typeof showToast === 'function') showToast('📸 جاري تجهيز وتحميل بطاقة الإنفوجرافيك كصورة...');
            const canvas = await capturePulseInfographicCanvas();
            if (canvas) {
                const a = document.createElement('a');
                a.download = `انفوجرافيك_نبض_الاجتماع_${new Date().toISOString().slice(0,10)}.png`;
                a.href = canvas.toDataURL('image/png');
                a.click();
                if (typeof showToast === 'function') showToast('🎉 تم تنزيل صورة إنفوجرافيك نبض الاجتماع بنجاح!');
            } else {
                alert('تعذر التقاط الصورة. يمكنك نسخ نص التقرير مباشرة.');
            }
        } catch(err) {
            console.error('Download image error:', err);
            alert('تعذر حفظ الصورة: ' + err.message);
        }
        return;
    }

    if (actionType === 'copy_image') {
        try {
            if (typeof showToast === 'function') showToast('📸 جاري التقاط صورة الإنفوجرافيك للحافظة...');
            const canvas = await capturePulseInfographicCanvas();
            if (canvas && navigator.clipboard && window.ClipboardItem) {
                canvas.toBlob(async (blob) => {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        if (typeof showToast === 'function') {
                            showToast('📋 تم نسخ صورة الإنفوجرافيك للحافظة! يمكنك الآن لصقها (Ctrl+V) مباشرة في واتساب ويب أو أي محادثة.');
                        } else {
                            alert('📋 تم نسخ صورة الإنفوجرافيك للحافظة! الصقها (Ctrl+V) في واتساب الآن.');
                        }
                    } catch(clipErr) {
                        await navigator.clipboard.writeText(reportText);
                        alert('تعذر نسخ الصورة المباشرة؛ تم نسخ نص التقرير المنسق للحافظة بنجاح.');
                    }
                }, 'image/png');
            } else {
                await navigator.clipboard.writeText(reportText);
                alert('تم نسخ نص التقرير المنسق للحافظة.');
            }
        } catch(err) {
            console.error('Copy image error:', err);
            alert('تعذر نسخ الصورة: ' + err.message);
        }
        return;
    }

    // الإرسال المباشر للبوت (يدعم إرفاق صورة الإنفوجرافيك + الكابشن)
    const btn = document.getElementById('btnSendPulseWA_bot') || document.getElementById('btnSendPulseWA_main');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري التقاط الصورة والإرسال...';
    }

    try {
        let imageBase64 = null;
        try {
            const canvas = await capturePulseInfographicCanvas();
            if (canvas) {
                imageBase64 = canvas.toDataURL('image/png');
            }
        } catch(snapErr) {
            console.warn('[Pulse Snapshot Warning] تعذر التقاط الصورة، سيتم إرسال التقرير كنص:', snapErr);
        }

        const res = await fetch('http://localhost:3000/api/group/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetJid: '120363430940374327@g.us', // جروب خدام اجتماع القديس بولس
                text: reportText,
                imageBase64: imageBase64
            })
        });
        const data = await res.json();
        if (data && data.success) {
            if (typeof showToast === 'function') {
                showToast('🎉 تم إرسال بطاقة إنفوجرافيك نبض الاجتماع بالصورة والألوان لجروب الخدام بنجاح!');
            } else {
                alert('🎉 تم إرسال بطاقة الإنفوجرافيك المصورة لجروب الخدام بنجاح! 🚀');
            }
        } else {
            throw new Error((data && data.error) || 'تعذر الإرسال عبر خادم الواتساب المحلي');
        }
    } catch(err) {
        console.warn('Direct Bot dispatch failed, opening WhatsApp fallback:', err);
        const waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(reportText);
        if (window.confirm('تعذر الإرسال المباشر عبر البوت (' + (err.message || 'السيرفر غير متصل') + ').\n\nهل ترغب في فتح الواتساب الآن وإرسال التقرير لجروب الخدام مباشرة؟')) {
            window.open(waUrl, '_blank');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
        }
    }
}

if (typeof window !== 'undefined') {
    window.shareMeetingPulseToServantsGroup = shareMeetingPulseToServantsGroup;
    window.openPulseReportPreviewModal = openPulseReportPreviewModal;
    window.closePulseReportPreviewModal = closePulseReportPreviewModal;
    window.buildMeetingPulseWhatsAppReportText = buildMeetingPulseWhatsAppReportText;
}
