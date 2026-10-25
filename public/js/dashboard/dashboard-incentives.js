// ========================================================
    // 🚀 منظومة رسائل الواتساب المشوقة للشباب وحملات NewWhats الذكية
    // ========================================================
    function generateYouthWhatsAppMessage(r, settings) {
        const activationDate = (settings && settings.activationDate) || '2026-05-29';
        
        // عبارات تشجيعية شبابية مخصصة بحسب مستوى الإنجاز
        let cheerMsg = '';
        if (r.totalDiscount >= 500) {
            cheerMsg = 'أنت محقق رقم قياسي واستثنائي في الدفعة! تعبك يستحق كل تقدير وفخر 🌟🏆';
        } else if (r.totalDiscount >= 200) {
            cheerMsg = 'مستواك والتزامك عالي جداً وماشي بخطوات ثابتة نحو التميز! عاش يا بطل 💪';
        } else {
            cheerMsg = 'بداية قوية وبإذن ربنا هتعوض وتضاعف رصيدك في الجلسات القادمة! 🙏✨';
        }

        return '🌟 *مفاجأة كبرى بانتظارك يا ' + r.name + '! مكافأة تميزك للمؤتمر السنوي وصلت* 🏕️🔥\n' +
'━━━━━━━━━━━━━━━━━━━━\n' +
'سلام ونعمة يا بطل 🙏\n' +
'تقديراً لالتزامك ومشاركتك المباركة في الخدمة السنة دي.. يسر أمانة كورس إعداد الخدام إبلاغك باعتماد *"كوبون الخصم الذهبي"* الخاص بيك لحضور مؤتمر 2026:\n\n' +
'🎯 *تفاصيل كشف حساب استحقاقك وتخفيضك:*\n' +
'├ 🏷️ اشتراك المؤتمر الأصلي: *' + r.baseFee + ' ج.م*\n' +
'├ 🗓️ مكافأة الحضور والالتزام: *' + r.attendanceDiscount + ' ج.م* (' + r.totalSessions + ' جلسة - بطل حقيقي! 💪)\n' +
'├ 🎓 بونص التفوق الدراسي (' + r.stage + '): *' + r.examDiscount + ' ج.م*\n' +
'└ 💎 إجمالي الخصم المعتمد ليك: *' + r.totalDiscount + ' ج.م* كاملة!\n\n' +
'━━━━━━━━━━━━━━━━━━━━\n' +
'🔥 *الصافي المطلوب منك سداده فقط: ' + r.netPayable + ' ج.م لا غير!*\n' +
'*(مبروك! وفرت ' + r.totalDiscount + ' جنيه كاملين بمجهودك وتعبك واستحقاقك 👏🎉)*\n' +
'━━━━━━━━━━━━━━━━━━━━\n\n' +
'💡 *كلمة تشجيع من خدمتك:*\n' +
cheerMsg + '\n\n' +
'⏳ *موعد بدء سداد الاشتراكات وتأكيد الحجز رسمياً:* ' + activationDate + '\n' +
'⚠️ *تنبيه هام للشباب:* مقاعد الأتوبيسات وتسكين الغرف محدودة وتُحجز بأسبقية السداد وتأكيد الاشتراك مع أمين الصندوق!\n\n' +
'منتظرينك تنور المؤتمر ونصنع مع بعض ذكريات لا تُنسى.. ربنا يفرح قلبك ويبارك كل خطواتك! 🙏❤️\n' +
'*أسرة خدمة القديس بولس - كورس إعداد الخدام* 🕊️';
    }

    function sendYouthWhatsAppNotification(code) {
        const data = computeConferenceLedgerData();
        const r = data.rows.find(x => String(x.code) === String(code));
        if (!r) return;

        const phone = (r.phone || '').replace(/[^0-9]/g, '');
        let cleanPhone = phone;
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;

        const msg = generateYouthWhatsAppMessage(r, data.settings);

        if (cleanPhone) {
            window.open('https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(msg), '_blank');
        } else {
            navigator.clipboard.writeText(msg).then(() => {
                alert('لم يتم العثور على رقم هاتف مسجل للمخدوم (' + r.name + ').\nتم نسخ نص الإشعار الشبابي بنجاح إلى الحافظة لإرساله يدوياً! 📋');
            }).catch(() => {
                prompt('انسخ نص رسالة المؤتمر لـ ' + r.name + ':', msg);
            });
        }
    }

    let activeCampaignTasks = [];

    function openNewWhatsCampaignModal() {
        const modal = document.getElementById('newWhatsCampaignModal');
        if (!modal) return;

        const data = computeConferenceLedgerData();
        // تصفية من لديهم أرقام هواتف
        activeCampaignTasks = data.rows.filter(r => {
            const p = (r.phone || '').replace(/[^0-9]/g, '');
            return p.length >= 10;
        });

        // تحديث المؤشرات
        const elCnt = document.getElementById('confCampTargetCount');
        if (elCnt) elCnt.textContent = activeCampaignTasks.length + ' مخدوم';

        const elSubs = document.getElementById('confCampTotalSubsidy');
        if (elSubs) elSubs.textContent = activeCampaignTasks.reduce((acc, r) => acc + r.totalDiscount, 0).toLocaleString('ar-EG') + ' ج.م';

        // ملء قائمة المعاينة
        const sel = document.getElementById('confCampPreviewStudentSelect');
        if (sel) {
            sel.innerHTML = activeCampaignTasks.map(r => '<option value="' + r.code + '">' + escapeHtml(r.name) + ' (' + r.code + ')</option>').join('');
        }

        updateNewWhatsCampaignPreview();
        checkNewWhatsServerStatus();

        modal.style.display = 'flex';
    }

    function closeNewWhatsCampaignModal() {
        const modal = document.getElementById('newWhatsCampaignModal');
        if (modal) modal.style.display = 'none';
    }

    function updateNewWhatsCampaignPreview() {
        const sel = document.getElementById('confCampPreviewStudentSelect');
        const code = sel ? sel.value : null;
        const bubble = document.getElementById('confCampMessagePreviewBubble');
        if (!bubble) return;

        const data = computeConferenceLedgerData();
        let targetRow = data.rows.find(r => String(r.code) === String(code));
        if (!targetRow && data.rows.length > 0) targetRow = data.rows[0];

        if (targetRow) {
            bubble.textContent = generateYouthWhatsAppMessage(targetRow, data.settings);
        } else {
            bubble.textContent = 'لا توجد بيانات مخدومين للمعاينة.';
        }
    }

    async function checkNewWhatsServerStatus() {
        const statusEl = document.getElementById('confCampServerStatus');
        const detailEl = document.getElementById('confCampServerDetail');
        const serverUrlInput = document.getElementById('confCampServerUrl');
        const serverUrl = (serverUrlInput ? serverUrlInput.value : 'http://localhost:3000').replace(/\/+$/, '');

        if (!statusEl) return;
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> فحص الاتصال...';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch(serverUrl + '/api/status', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json = await res.json();
                statusEl.innerHTML = '<span style="color:#15803d;"><i class="fa-solid fa-circle-check me-1"></i> جاهز ومتصل (' + (json.status || 'متصل') + ')</span>';
                if (detailEl) detailEl.textContent = 'سيرفر NewWhats جاهز لاستقبال الحملات';
            } else {
                statusEl.innerHTML = '<span style="color:#eab308;"><i class="fa-solid fa-circle-exclamation me-1"></i> السيرفر يعمل (بانتظار مسح QR)</span>';
                if (detailEl) detailEl.textContent = 'امسح رمز QR في شاشة البوت للربط';
            }
        } catch(err) {
            statusEl.innerHTML = '<span style="color:#64748b;"><i class="fa-solid fa-plug-circle-exclamation me-1"></i> غير متصل محلياً</span>';
            if (detailEl) detailEl.textContent = 'يمكنك تصدير شيت إكسل جاهز أو الإرسال الفردي';
        }
    }

    async function startNewWhatsAutoCampaign() {
        if (!activeCampaignTasks || activeCampaignTasks.length === 0) {
            alert('لا يوجد مخدومين مستهدفين لديهم أرقام هواتف صالحة!');
            return;
        }

        const data = computeConferenceLedgerData();
        const serverUrlInput = document.getElementById('confCampServerUrl');
        const serverUrl = (serverUrlInput ? serverUrlInput.value : 'http://localhost:3000').replace(/\/+$/, '');
        const delayMs = parseInt(document.getElementById('confCampSafeDelay')?.value || '6000');

        const tasksPayload = activeCampaignTasks.map(r => {
            let p = (r.phone || '').replace(/[^0-9]/g, '');
            if (p.startsWith('01')) p = '2' + p;
            return {
                phone: p,
                message: generateYouthWhatsAppMessage(r, data.settings),
                name: r.name,
                code: r.code
            };
        });

        const progressSection = document.getElementById('confCampProgressSection');
        const progressText = document.getElementById('confCampProgressText');
        const progressPct = document.getElementById('confCampProgressPct');
        const progressBar = document.getElementById('confCampProgressBar');
        const liveLogs = document.getElementById('confCampLiveLogs');
        const btnStart = document.getElementById('btnStartNewWhatsAuto');

        if (progressSection) progressSection.style.display = 'block';
        if (btnStart) btnStart.disabled = true;

        const addLog = (msg) => {
            if (liveLogs) {
                const div = document.createElement('div');
                div.textContent = '[' + new Date().toLocaleTimeString('ar-EG') + '] ' + msg;
                liveLogs.appendChild(div);
                liveLogs.scrollTop = liveLogs.scrollHeight;
            }
        };

        addLog('🚀 جاري إرسال حملة إشعارات المؤتمر (' + tasksPayload.length + ' رسالة) إلى سيرفر NewWhats...');

        try {
            const res = await fetch(serverUrl + '/api/campaign/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_name: 'إشعارات تخفيضات المؤتمر السنوي 2026',
                    tasks: tasksPayload,
                    batch_size: 50,
                    rest_time: 15
                })
            });

            if (res.ok) {
                const resJson = await res.json();
                addLog('✅ تم قبول الحملة بنجاح من محرك NewWhats! رقم الحملة: ' + (resJson.campaign_id || '#'));
                if (progressBar) progressBar.style.width = '100%';
                if (progressPct) progressPct.textContent = '100%';
                if (progressText) progressText.textContent = 'تم إطلاق الحملة بنجاح في الخلفية!';
                if (typeof showToast === 'function') showToast("🎉 تم إطلاق حملة إشعارات المؤتمر بنجاح عبر NewWhats!");
                else alert("🎉 تم إطلاق حملة إشعارات المؤتمر بنجاح عبر NewWhats!");
            } else {
                const errJson = await res.json().catch(() => ({}));
                addLog('⚠️ تعذر بدء الحملة المباشرة: ' + (errJson.error || res.statusText));
                addLog('💡 جاري تجهيز بديل التصدير الفوري لشيت الإكسل المعتمد...');
                exportNewWhatsCampaignToExcel();
            }
        } catch(err) {
            addLog('⚠️ لم يتم العثور على سيرفر NewWhats يعمل على المنفذ المحلي.');
            addLog('📥 تم تلقائياً تحميل شيت إكسل الحملة بكافة النصوص المنسقة لتشغيلها من واجهة بايثون أو البوت!');
            exportNewWhatsCampaignToExcel();
        } finally {
            if (btnStart) btnStart.disabled = false;
        }
    }

    function exportNewWhatsCampaignToExcel() {
        const data = computeConferenceLedgerData();
        const headers = ['م', 'كود المخدوم', 'اسم المخدوم', 'الفرقة', 'رقم الواتساب', 'المبلغ الصافي', 'إجمالي الخصم', 'نص الرسالة الشبابية المشوقة'];
        const rows = data.rows.map((r, i) => {
            let p = (r.phone || '').replace(/[^0-9]/g, '');
            if (p.startsWith('01')) p = '2' + p;
            return [
                i + 1,
                r.code,
                r.name,
                r.stage,
                p,
                r.netPayable,
                r.totalDiscount,
                generateYouthWhatsAppMessage(r, data.settings)
            ];
        });

        const fileName = 'حملة_إشعارات_المؤتمر_السنوي_NewWhats.xlsx';

        if (typeof XLSX !== 'undefined') {
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "حملة_المؤتمر");
            XLSX.writeFile(wb, fileName);
            if (typeof showToast === 'function') showToast("📥 تم تصدير شيت حملة إشعارات الواتساب بنجاح!");
            else alert("📥 تم تصدير شيت حملة إشعارات الواتساب بنجاح!");
        } else {
            let csv = '\uFEFF' + [headers, ...rows].map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName.replace('.xlsx', '.csv');
            link.click();
        }
    }

    function copyAllYouthWhatsAppMessages() {
        const data = computeConferenceLedgerData();
        const allMsgs = data.rows.map((r, i) => '=== [' + (i + 1) + '] ' + r.name + ' (' + (r.phone || 'بدون هاتف') + ') ===\n' + generateYouthWhatsAppMessage(r, data.settings)).join('\n\n' + '─'.repeat(40) + '\n\n');

        navigator.clipboard.writeText(allMsgs).then(() => {
            if (typeof showToast === 'function') showToast("📋 تم نسخ كافة نصوص رسائل الشباب للحافظة بنجاح!");
            else alert("📋 تم نسخ كافة نصوص رسائل الشباب للحافظة بنجاح!");
        }).catch(() => {
            prompt("انسخ نصوص رسائل المؤتمر:", allMsgs.slice(0, 500) + '...');
        });
    }