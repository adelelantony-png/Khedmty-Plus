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
window.currentRadarAbsenceFilter = 'all';
window.lastRadarAbsentMems = [];
window.lastRadarBirthdaysList = [];

function renderRadarPulseChart(validMeetingDates) {
    const container = document.getElementById('radar_attendancePulseBars');
    const commentEl = document.getElementById('radar_pulseTrendComment');
    const stabilityEl = document.getElementById('radar_pulseOverallStability');
    if (!container || !members || members.length === 0) return;

    const recentDates = (validMeetingDates || []).slice(0, 6).reverse();
    if (recentDates.length === 0) {
        container.innerHTML = '<div style="color:#94a3b8; font-size:0.85rem; padding:20px; width:100%; text-align:center;">لا توجد جلسات حضور مسجلة كافية لعرض النبض البياني حتى الآن.</div>';
        return;
    }

    const totalMembers = members.length;
    let rates = [];
    let barsHtml = '';

    recentDates.forEach(d => {
        const list = attendanceRecord[d] || [];
        const attended = list.filter(r => r.attended && !r.isAbsentDueToDelay).length;
        const liturgy = list.filter(r => r.communion || r.liturgy).length;
        const attPct = totalMembers > 0 ? Math.round((attended / totalMembers) * 100) : 0;
        const litPct = totalMembers > 0 ? Math.round((liturgy / totalMembers) * 100) : 0;
        rates.push(attPct);

        const dParts = d.split('-');
        const shortDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : d;
        const barHeight = Math.max(16, Math.round(attPct * 1.05));

        barsHtml += `
            <div style="flex: 1; min-width: 65px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 0.76rem; font-weight: 800; color: #1e3a8a;">${attPct}%</div>
                <div style="width: 100%; max-width: 46px; height: 110px; display: flex; align-items: flex-end; justify-content: center; background: #f1f5f9; border-radius: 8px; overflow: hidden; position: relative;" title="تاريخ: ${d} | الحضور: ${attended} (${attPct}%) | القداس: ${liturgy} (${litPct}%)">
                    <div style="width: 52%; height: ${barHeight}px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px 4px 0 0; transition: height 0.4s ease;"></div>
                    <div style="width: 48%; height: ${Math.max(8, Math.round(litPct * 1.05))}px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px 4px 0 0; transition: height 0.4s ease;"></div>
                </div>
                <div style="font-size: 0.74rem; font-weight: bold; color: #475569; margin-top: 2px;">${shortDate}</div>
                <div style="font-size: 0.68rem; color: #94a3b8;">${attended} مخدوم</div>
            </div>
        `;
    });

    container.innerHTML = barsHtml;

    const avgStability = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    if (stabilityEl) stabilityEl.textContent = `📈 متوسط الاستقرار: ${avgStability}%`;

    if (rates.length >= 2 && commentEl) {
        const lastRate = rates[rates.length - 1];
        const prevRate = rates[rates.length - 2];
        const diff = lastRate - prevRate;
        if (diff > 0) {
            commentEl.innerHTML = `<span style="color:#166534;">↗️ نمو مبارك في الحضور (+${diff}%) مقارنة بالجلسة السابقة! نشكر ربنا.</span>`;
        } else if (diff === 0) {
            commentEl.innerHTML = `<span style="color:#1e40af;">➡️ الحضور مستقر ومحافظ على معدله المتميز (${lastRate}%).</span>`;
        } else {
            commentEl.innerHTML = `<span style="color:#b45309;">↘️ تراجع في الحضور (${diff}%) - يرجى تفعيل دور رادار الافتقاد.</span>`;
        }
    }
}

function sendWhatsAppAbsenceDirect(name, phone, weeks, btn) {
    const rawMsg = `سلام ونعمة يا أخي الحبيب ${name} ✝️\nافتقدناك جداً في اجتماع القديس بولس لإعداد الخدام، ومكانك غالي علينا. حابين نطمئن عليك ونسمع صوتك، وربنا يدبر ونفرح بوجودك معنا الجمعة القادمة بالقداس والاجتماع 🕊️`;
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

    if (displayList.length === 0) {
        tbodyAbs.innerHTML = `<tr><td colspan="7" style="padding: 20px; color: #166534; font-weight: bold; background: #f0fdf4;">نشكر ربنا! لا توجد حالات مطابقة لشرط الفلتر حالياً. 🟢</td></tr>`;
        return;
    }

    tbodyAbs.innerHTML = displayList.map(m => {
        let cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;
        const waMsg = encodeURIComponent(`سلام ونعمة يا أخي الحبيب ${m.name} ✝️\nافتقدناك جداً في اجتماع القديس بولس لإعداد الخدام الجمعة الماضية، وحابين نطمئن عليك ونسمع صوتك. ربنا يدبر ونشوفك الجمعة القادمة بالقداس والاجتماع 🕊️`);

        const isCritical = m.consecutiveWeeks >= 3;
        const badgeHtml = isCritical 
            ? `<span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #f87171; font-size:0.85rem; font-weight:900;">🔴 انقطاع حرج (${m.consecutiveWeeks} أسابيع)</span>`
            : `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-size:0.85rem; font-weight:bold;">🟡 غياب أسبوعين</span>`;

        return `
            <tr style="border-bottom: 1px solid #f1f5f9; background: ${isCritical ? '#fff5f5' : 'transparent'};">
                <td style="padding: 8px; text-align: right; font-weight: bold; color: #0c2461;">${escapeHtml(m.name)}</td>
                <td style="padding: 8px; font-weight: bold;">${escapeHtml(m.code)}</td>
                <td style="padding: 8px;">${escapeHtml(m.stage)}</td>
                <td style="padding: 8px;"><span class="badge ${m.gender === 'بنات' ? 'bg-danger' : 'bg-primary'}" style="font-size:0.75rem;">${escapeHtml(m.gender)}</span></td>
                <td style="padding: 8px;">${badgeHtml}</td>
                <td style="padding: 8px;">${m.phone || '-'}</td>
                <td style="padding: 8px;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        ${m.phone ? `
                            <button type="button" class="btn-custom" onclick="sendWhatsAppAbsenceDirect('${escapeHtml(m.name)}', '${cleanPhone}', ${m.consecutiveWeeks}, this)" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-brands fa-whatsapp"></i> افتقاد واتساب 🚀
                            </button>
                            <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="btn-custom" style="padding: 4px 6px; font-size: 0.75rem; background: #f1f5f9; color: #334155; text-decoration: none; border-radius: 6px;" title="فتح يدوي">📲</a>
                            <a href="tel:${m.phone}" class="btn-custom" style="padding: 4px 8px; font-size: 0.75rem; background: #f1f5f9; color: #334155; text-decoration: none; border-radius: 6px;">
                                <i class="fa-solid fa-phone"></i>
                            </a>
                        ` : '<span style="color:#94a3b8; font-size:0.75rem;">لا يوجد هاتف</span>'}
                    </div>
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
                    list.push({ name: m.name, role: 'دارس (' + (m.stage || 'سنة أولى') + ')', phone: m.phone || '', date: `${p.day}/${p.month}`, diffDays });
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
                    list.push({ name: s.name, role: 'خادم (' + (s.role || 'خادم') + ')', phone: s.phone || '', date: `${p.day}/${p.month}`, diffDays });
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
        const waMsg = encodeURIComponent(`كل سنة وأنت طيب يا ${b.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`);

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
                <td style="padding: 8px; text-align: right; font-weight: bold; color: #78350f;">${escapeHtml(b.name)}</td>
                <td style="padding: 8px; font-weight: bold; color: #475569;">${escapeHtml(b.role)}</td>
                <td style="padding: 8px; font-weight: bold;">${escapeHtml(b.date)}</td>
                <td style="padding: 8px;">${statusBadge}</td>
                <td style="padding: 8px;">${b.phone || '-'}</td>
                <td style="padding: 8px;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        ${cleanPhone ? `
                            <button type="button" class="btn-custom" onclick="sendWhatsAppBirthdayDirect('${escapeHtml(b.name)}', '${cleanPhone}', this)" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
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

        const rawMsg = `كل سنة وأنت طيب يا ${item.name} وعقبال 100 سنة مع المسيح في خدمته المباركة ❤️🎂\nأسرة خدمة القديس بولس لإعداد الخدام تهنئك بعيد ميلادك وتصلي لك بعام ملئ بالنعمة والبركة والسلام 🕊️✨`;
        
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

function renderRadarDashboard() {
        if (!members || members.length === 0) return;
        renderRadarCopticFasting();

        // 1. تحديد التواريخ الخاصة بالاجتماعات
        const allDates = Object.keys(attendanceRecord || {}).sort().reverse();
        const activeDate = activeSelectedDate || allDates[0] || new Date().toISOString().split('T')[0];
        const currentList = attendanceRecord[activeDate] || [];

        const totalMems = members.length;
        const attendedCount = currentList.filter(r => r.attended && !r.isAbsentDueToDelay).length;
        const liturgyCount = currentList.filter(r => r.communion || r.liturgy).length;
        const liturgyPct = attendedCount > 0 ? Math.round((liturgyCount / attendedCount) * 100) : 0;

        // تحديث كروت النبض
        const elMeetingAtt = document.getElementById('radar_kpiMeetingAttended');
        if (elMeetingAtt) elMeetingAtt.textContent = attendedCount;
        const elTotalMems = document.getElementById('radar_kpiTotalMembers');
        if (elTotalMems) elTotalMems.textContent = `من إجمالي ${totalMems} مخدوم (${totalMems > 0 ? Math.round((attendedCount/totalMems)*100) : 0}%)`;

        const elLiturgyPct = document.getElementById('radar_kpiLiturgyPct');
        if (elLiturgyPct) elLiturgyPct.textContent = `${liturgyPct}%`;
        const elLiturgyCount = document.getElementById('radar_kpiLiturgyCount');
        if (elLiturgyCount) elLiturgyCount.textContent = `${liturgyCount} من ${attendedCount} حاضرين تناولوا بالقداس`;

        // 2. حساب الغياب المتتالي المحصّن (Absence Radar)
        let sSettings = {};
        try { sSettings = JSON.parse(localStorage.getItem('my_church_settings')) || {}; } catch(e){}
        const serviceStartStr = sSettings.serviceStart || '2026-09-01';
        const todayIso = new Date().toISOString().split('T')[0];

        const validMeetingDates = allDates.filter(d => d >= serviceStartStr && d <= todayIso);

        const absentMems = [];
        if (validMeetingDates.length > 0) {
            members.forEach(m => {
                const mCode = String(m.code || m.id || '');
                let consecAbs = 0;
                let lastSeen = null;

                for (let i = 0; i < validMeetingDates.length; i++) {
                    const d = validMeetingDates[i];
                    const recs = attendanceRecord[d] || [];
                    const found = recs.find(r => String(r.id) === String(m.id) || String(r.code) === mCode);
                    if (found && found.attended && !found.isAbsentDueToDelay) {
                        if (!lastSeen) lastSeen = d;
                        break;
                    } else {
                        consecAbs++;
                    }
                }

                if (consecAbs >= 2) {
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
        if (elAbsCount) elAbsCount.textContent = absentMems.length;
        const elAbsBadge = document.getElementById('radar_absenceAlertBadge');
        if (elAbsBadge) elAbsBadge.innerHTML = `<i class="fa-solid fa-bell"></i> تم رصد: ${absentMems.length} مخدومين`;

        // رسم جدول الغياب الذكي
        renderRadarAbsenceTableBody();

        // 3. رسم نبض الاجتماع البياني
        renderRadarPulseChart(validMeetingDates);

        // 4. رادار مهلة الاعتراف
        renderRadarConfessionSection();

        // 5. رادار أعياد الميلاد
        renderRadarBirthdays('week');

        // 6. تحميل درع الأمان والتراخيص
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
                            <td style="padding: 8px; text-align: right; font-weight: bold; color: #0c2461;">${c.name}</td>
                            <td style="padding: 8px; font-weight: bold;">${c.code}</td>
                            <td style="padding: 8px; color: #b45309; font-weight: bold;">${c.confessor}</td>
                            <td style="padding: 8px;">
                                <span class="radar-alert-badge ${c.countdownClass}">
                                    ${c.countdownText}
                                </span>
                            </td>
                            <td style="padding: 8px;">${c.phone || '-'}</td>
                            <td style="padding: 8px;">
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

if (tabId === 'dataTab') checkLocalStorageUsage();

if (tabId === 'cloudUsageTab') updateCloudUsageMetrics();

if (tabId === 'followupTab') renderFollowupTab();

}

// دعم زر الرجوع والتقدم في المتصفح للتنقل بين التبويبات دون إعادة تحميل

if (typeof window !== 'undefined') {

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
                <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #0c2461;">
                    ${escapeHtml(t.name)}
                </td>
                <td style="padding: 10px 8px; font-family: monospace; font-size: 0.85rem;">
                    <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;" title="${escapeHtml(t.token)}">
                        ${escapeHtml(maskedToken)}
                    </span>
                    <button type="button" onclick="copySecurityToken('${escapeHtml(t.token)}')" class="btn-mini" style="background: transparent; border: none; cursor: pointer; color: #0284c7;" title="نسخ المفتاح">📋</button>
                </td>
                <td style="padding: 10px 8px;">
                    <span class="badge ${isMaster ? 'bg-danger' : 'bg-primary'}" style="font-size: 0.75rem;">
                        ${isMaster ? 'أمين الخدمة 👑' : 'خادم أسرة 👤'}
                    </span>
                </td>
                <td style="padding: 10px 8px;">${stageBadge}</td>
                <td style="padding: 10px 8px; font-weight: bold; color: #475569;">
                    ${t.hourly_limit} رسالة/ساعة
                </td>
                <td style="padding: 10px 8px;">
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
