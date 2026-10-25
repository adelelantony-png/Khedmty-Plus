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

        // حصر تواريخ الحضور فقط بالاجتماعات التي تمت في نطاق السنة الخدمية الحالية وحتى اليوم
        const validMeetingDates = allDates.filter(d => d >= serviceStartStr && d <= todayIso);

        const absentMems = [];
        // إذا لم تبدأ الخدمة بعد أو لم تُعقد جلسات حضور بعد تاريخ البداية، يكون الغياب تلقائياً صفراً
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
                        break; // انقطعت سلسلة الغياب
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

        // ترتيب الغائبين تنازلياً حسب مدة الانقطاع
        absentMems.sort((a, b) => b.consecutiveWeeks - a.consecutiveWeeks);

        const elAbsCount = document.getElementById('radar_kpiAbsenceCount');
        if (elAbsCount) elAbsCount.textContent = absentMems.length;
        const elAbsBadge = document.getElementById('radar_absenceAlertBadge');
        if (elAbsBadge) elAbsBadge.innerHTML = `<i class="fa-solid fa-bell"></i> تم رصد: ${absentMems.length} مخدومين`;

        const tbodyAbs = document.getElementById('radar_absenceTableBody');
        if (tbodyAbs) {
            if (absentMems.length === 0) {
                tbodyAbs.innerHTML = `<tr><td colspan="7" style="padding: 20px; color: #166534; font-weight: bold; background: #f0fdf4;">نشكر ربنا! لا يوجد مخدومون متغيبون لأسبوعين متتاليين حالياً. 🟢</td></tr>`;
            } else {
                tbodyAbs.innerHTML = absentMems.map(m => {
                    let cleanPhone = m.phone.replace(/[^0-9]/g, '');
                    if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;
                    const waMsg = encodeURIComponent(`سلام ونعمة يا أخي الحبيب ${m.name} ✝️\nافتقدناك جداً في اجتماع القديس بولس لإعداد الخدام الجمعة الماضية، وحابين نطمئن عليك ونسمع صوتك. ربنا يدبر ونشوفك الجمعة القادمة بالقداس والاجتماع 🕊️`);

                    return `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px; text-align: right; font-weight: bold; color: #0c2461;">${m.name}</td>
                            <td style="padding: 8px; font-weight: bold;">${m.code}</td>
                            <td style="padding: 8px;">${m.stage}</td>
                            <td style="padding: 8px;"><span class="badge ${m.gender === 'بنات' ? 'bg-danger' : 'bg-primary'}" style="font-size:0.75rem;">${m.gender}</span></td>
                            <td style="padding: 8px; font-weight: 900; color: #dc2626; font-size: 0.95rem;">
                                ⚠️ ${m.consecutiveWeeks} أسابيع
                            </td>
                            <td style="padding: 8px;">${m.phone || '-'}</td>
                            <td style="padding: 8px;">
                                <div style="display: flex; gap: 6px; justify-content: center;">
                                    ${m.phone ? `
                                        <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="btn-custom" style="padding: 4px 10px; font-size: 0.75rem; background: #25d366; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                            <i class="fa-brands fa-whatsapp me-1"></i> افتقاد واتساب
                                        </a>
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
        }

        // 3. رادار مهلة الاعتراف (Confession Radar)
        renderRadarConfessionSection();
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