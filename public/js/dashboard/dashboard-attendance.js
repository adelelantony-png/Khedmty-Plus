/**
 * Khedmty-Plus Dashboard - Attendance Management Module
 * Extracted for offline PWA performance & modular maintainability.
 */


// ==========================================
// وظائف الماسح الضوئي فائق السرعة طِبق الأصل من الصورة المرفقة
// ==========================================
function openFastScannerModal() {
    const modal = document.getElementById('fastScannerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
    updateScannerDatePill();
    updateFastScannerSyncBadge();
    renderLiveCardsFeed();
    startCamera();
}

function closeFastScannerModal() {
    stopCamera();
    const modal = document.getElementById('fastScannerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateScannerDatePill() {
    const pill = document.getElementById('fastScannerDatePill');
    if (!pill) return;
    let targetDate = (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) ? activeSelectedDate : (typeof today !== 'undefined' ? today : new Date().toISOString().split('T')[0]);
    let parts = targetDate.split('-');
    if (parts.length === 3) {
        let y = parts[0];
        let m = parseInt(parts[1], 10);
        let d = parseInt(parts[2], 10);
        pill.innerText = 'حضور يوم ' + d + '-' + m + '-' + y;
    } else {
        pill.innerText = 'حضور يوم ' + targetDate;
    }
}

function updateFastScannerSyncBadge() {
    const badge = document.getElementById('fastScannerSyncStatusBadge');
    if (!badge) return;
    if (navigator.onLine) {
        badge.className = 'fast-scanner-sync-badge sync-online';
        badge.innerHTML = '☁️ مزامنة سحابية لحظية';
    } else {
        badge.className = 'fast-scanner-sync-badge sync-offline';
        badge.innerHTML = '📱 وضع الأوفلاين (محفوظ محلياً)';
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        updateFastScannerSyncBadge();
        if (window.KhedmtyOfflineSync && typeof KhedmtyOfflineSync.processQueue === 'function') {
            KhedmtyOfflineSync.processQueue().catch(() => {});
        }
    });
    window.addEventListener('offline', updateFastScannerSyncBadge);
}

let debounceBackgroundRenderTimer = null;
function scheduleBackgroundDashboardUpdates() {
    if (debounceBackgroundRenderTimer) clearTimeout(debounceBackgroundRenderTimer);
    debounceBackgroundRenderTimer = setTimeout(() => {
        try { if (typeof renderAttendanceTable === 'function') renderAttendanceTable(); } catch(e){}
        try { if (typeof renderMembersList === 'function') renderMembersList(); } catch(e){}
        try { if (typeof renderDashboard === 'function') renderDashboard(); } catch(e){}
        try { if (typeof renderAttendanceCalendar === 'function') renderAttendanceCalendar(); } catch(e){}
    }, 450);
}

// ==========================================
// 🚀 نظام التنبيه الذكي اللحظي فوق الكاميرا (Scanner HUD Alert)
// ==========================================
let hudTimer = null;
let feedbackTimer = null;
function showScannerHUD(status, title, studentName, studentMeta, durationMs = 1800) {
    const hud = document.getElementById('scannerHUDAlert');
    const cameraBox = document.getElementById('scannerCameraBox');
    const overlay = document.getElementById('scannerFeedbackOverlay');
    const card = document.getElementById('scannerFeedbackCard');
    const iconText = document.getElementById('feedbackIconText');
    const titleEl = document.getElementById('feedbackMainTitle');
    const nameEl = document.getElementById('feedbackStudentName');
    const metaEl = document.getElementById('feedbackStudentMeta');
    
    // 1. إرسال التنبيه العام أيضاً (z-index: 200000)
    if (typeof showToast === 'function') {
        showToast(title + (studentName ? ' : ' + studentName : ''), status !== 'success');
    }
    
    // 2. وميض إطار الكاميرا البصري اللحظي
    if (cameraBox) {
        cameraBox.classList.remove('flash-success', 'flash-warning', 'flash-error');
        cameraBox.classList.add('flash-' + status);
        setTimeout(() => {
            if (cameraBox) cameraBox.classList.remove('flash-' + status);
        }, 1200);
    }
    
    const icons = {
        success: '✔️',
        warning: '⚠️',
        error: '❌'
    };
    
    const escape = (str) => (str || '').replace(/[<>&"]/g, '');

    // 3. نافذة التأكيد المرئي الكبيرة في مركز الكاميرا (تظهر لثانيتين كبطاقة واضحة جداً)
    if (overlay && card) {
        if (feedbackTimer) clearTimeout(feedbackTimer);
        card.className = 'scanner-feedback-card card-' + status;
        if (iconText) iconText.innerText = icons[status] || '✔️';
        if (titleEl) titleEl.innerText = title;
        if (nameEl) {
            nameEl.innerText = studentName || '';
            nameEl.style.display = studentName ? 'block' : 'none';
        }
        if (metaEl) {
            metaEl.innerText = studentMeta || (status === 'success' ? 'تم الحفظ والتوثيق بنجاح' : (status === 'warning' ? 'مسجل مسبقاً اليوم' : 'يرجى مراجعة إدارة الكنترول'));
            metaEl.style.display = 'block';
        }
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';

        feedbackTimer = setTimeout(() => {
            overlay.style.transition = 'opacity 0.25s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.transition = '';
            }, 250);
        }, durationMs);
    }
    
    // 4. الشريط العلوي العائم HUD
    if (hud) {
        if (hudTimer) clearTimeout(hudTimer);
        hud.className = 'scanner-hud-alert hud-' + status;
        hud.innerHTML = `
            <div class="scanner-hud-icon">${icons[status] || '🔔'}</div>
            <div class="scanner-hud-info">
                <div class="scanner-hud-title">${escape(title)}</div>
                ${studentName ? `<div class="scanner-hud-sub">${escape(studentName)} ${studentMeta ? '• ' + escape(studentMeta) : ''}</div>` : ''}
            </div>
        `;
        hud.style.display = 'flex';
        hud.style.opacity = '1';
        hud.style.transform = 'none';
        
        hudTimer = setTimeout(() => {
            hud.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            hud.style.opacity = '0';
            hud.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                hud.style.display = 'none';
                hud.style.opacity = '1';
                hud.style.transform = 'none';
                hud.style.transition = '';
            }, 300);
        }, durationMs + 300);
    }
}

// ⏰ فحص هل المخدوم لديه إذن / عذر تأخير مسبق معتمد لهذا اليوم؟
function getStudentApprovedDelayExcuse(student, targetDate) {
    if (!student) return null;
    const sId = String(student.id || '').trim();
    const sCode = String(student.code || student.exam_code || '').trim();
    const sPhone = String(student.phone || '').trim().replace(/\D/g, '');
    const sName = String(student.name || '').trim();
    const dateStr = targetDate || (typeof activeSelectedDate !== 'undefined' ? activeSelectedDate : (typeof today !== 'undefined' ? today : ''));

    let excuses = (typeof window !== 'undefined' && Array.isArray(window.lastRadarExcusesList)) ? window.lastRadarExcusesList : [];
    if ((!excuses || excuses.length === 0) && typeof localStorage !== 'undefined') {
        try {
            excuses = JSON.parse(localStorage.getItem('khedmety_cached_excuses') || '[]');
        } catch(e) {}
    }
    if (!Array.isArray(excuses)) return null;

    return excuses.find(e => {
        if (!e) return false;
        if (e.status === 'rejected') return false;
        if (e.friday_date && dateStr && e.friday_date !== dateStr) return false;

        const cat = ((e.reason_category || '') + ' ' + (e.message_text || '') + ' ' + (e.servant_notes || '')).toLowerCase();
        const isDelayOrPermission = /تأخير|تاخير|استئذان|استأذان|استاذان|انصراف|بدري|بلاك فرايدي|black friday|شغل|نبطشية|نبطشيه|ايفنت|ايڤنت|event/i.test(cat);
        if (!isDelayOrPermission) return false;

        const eId = String(e.student_id || '').trim();
        const eCode = String(e.student_code || '').trim();
        const ePhone = String(e.student_phone || '').trim().replace(/\D/g, '');
        const eName = String(e.student_name || '').trim();

        if (sCode && eCode && sCode === eCode) return true;
        if (sId && eId && sId === eId) return true;
        if (sPhone && ePhone && (sPhone.endsWith(ePhone.slice(-9)) || ePhone.endsWith(sPhone.slice(-9)))) return true;
        if (sName && eName && (sName === eName || sName.includes(eName) || eName.includes(sName))) return true;

        return false;
    });
}
window.getStudentApprovedDelayExcuse = getStudentApprovedDelayExcuse;

// 10. تسجيل الحضور الذري

// ==========================================

function atomicRegisterAttendance(member) {

let pKey = (member.code || member.id || '').toString().replace(/\D/g, '');

let now = new Date();

let isFri = isFridaySession(activeSelectedDate);

let isSummerDay = settings.summerActive && (new Date(activeSelectedDate).getDay().toString() === settings.summerDay);

let approvedDelayExcuse = getStudentApprovedDelayExcuse(member, activeSelectedDate);

let isAbsent = false;

if (!isFri || (isSummerDay && settings.ignoreSummerDelay)) {

isAbsent = false;

} else if (approvedDelayExcuse) {
// ⏰ استئذان / تأخير مأذون به مسبقاً: لا يُعتبر غياباً!
isAbsent = false;

} else {

let startTimeStr = settings.startTime || "13:00";

let [startH, startM] = startTimeStr.split(':').map(Number);

let diffMinutes = (now.getHours() * 60 + now.getMinutes()) - (startH * 60 + startM);

isAbsent = diffMinutes >= (settings.absentAfter || 75);

}

let defaultPts = calculateBonusPointsForDate((typeof activeDate !== "undefined" && activeDate) ? activeDate : today, isFri);

let newRecord = {

id: member.id,

code: member.code || member.id,

name: member.name,

phone: member.phone || "",

stage: member.stage || 'سنة أولى',

gender: member.gender || 'بنين',

time: now.toLocaleTimeString('ar-EG'),

isAbsentDueToDelay: isAbsent,

hasApprovedDelay: !!approvedDelayExcuse,

delayExcuseReason: approvedDelayExcuse ? (approvedDelayExcuse.reason_category || 'طلب تأخير مسبق بعذر ⏰') : '',

attended: true,

communion: false,

participation: false,

points: defaultPts,

isBonusEvent: !isFri,

scannedBy: currentUser ? currentUser.name : 'خادم'

};

if (!attendanceRecord[activeSelectedDate]) attendanceRecord[activeSelectedDate] = [];

let localExisting = attendanceRecord[activeSelectedDate].find(a => a.id.toString() === member.id.toString());

if (localExisting) {
    playBeepSound('error');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([80, 50, 80]); } catch(e){}
    }
    showScannerHUD('warning', 'تم التسجيل مسبقاً ⚠️', member.name, 'مسجل بالفعل اليوم بالخدمة');
    return;
}

attendanceRecord[activeSelectedDate].unshift(newRecord);

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

// 🚀 تحديث لحظي وفوري لقائمة الحضور تحت الكاميرا + تغذية صوتية ولمسية (بدون أي شاشات معطلة)
renderLiveCardsFeed();
playBeepSound('success');
if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(60); } catch(e){}
}

// جدولة التحديثات الثقيلة في الخلفية دون إسقاط أي إطار من الكاميرا
scheduleBackgroundDashboardUpdates();

// إذا كان الجهاز غير متصل بالإنترنت أو تعذر فايربيز: الحفظ المحلي السريع وطابور المزامنة
if (!navigator.onLine || !isFirebaseActive || !fsdb) {

syncToCloud('attendance', attendanceRecord);

if (window.KhedmtyOfflineSync && typeof KhedmtyOfflineSync.enqueue === 'function') {
    KhedmtyOfflineSync.enqueue('ATTENDANCE', {
        date: activeSelectedDate,
        record: newRecord
    });
}

if (approvedDelayExcuse) {
    playBeepSound('success');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 30, 40]); } catch(e){}
    }
    showScannerHUD('success', '🟢 حاضر (بإذن تأخير مسبق ⏰)', member.name, `عذر تأخير مسجل: ${approvedDelayExcuse.reason_category || 'استئذان مسبق'}`);
    if (typeof showToast === 'function') {
        showToast(`⏰ تنبيه: [${member.name}] لديه طلب استئذان تأخير مسجل مسبقاً (${approvedDelayExcuse.reason_category || 'استئذان تأخير'})`);
    }
} else if (isAbsent) {
    playBeepSound('error');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([80, 50, 80]); } catch(e){}
    }
    showScannerHUD('warning', 'تم التسجيل (تأخير شديد) ⚠️', member.name, `${member.stage || 'سنة أولى'} • ${newRecord.time}`);
} else {
    playBeepSound('success');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(70); } catch(e){}
    }
    showScannerHUD('success', 'تم التسجيل بنجاح ✔️', member.name, `${member.stage || 'سنة أولى'} • ${newRecord.time}`);
}

logActivity("تسجيل حضور (أوفلاين)", member.name, `${activeSelectedDate} - ${isAbsent ? "تأخير" : "حاضر"}`);

return;

}

// Firestore: معاملة (transaction) تقرأ وتكتب بشكل ذري لمنع تسجيل نفس المخدوم مرتين في نفس اللحظة

let attDayRef = fsdb.collection('attendance').doc(activeSelectedDate);

fsdb.runTransaction(tx => tx.get(attDayRef).then(snap => {

let data = snap.exists ? (snap.data() || {}) : {};

if (data[pKey]) return { conflict: true, existing: data[pKey] };

tx.set(attDayRef, { [pKey]: newRecord }, { merge: true });

return { conflict: false };

})).then(result => {

if (result.conflict) {
    playBeepSound('error');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([80, 50, 80]); } catch(e){}
    }
    let recordedBy = result.existing ? result.existing.scannedBy : 'خادم آخر';
    showScannerHUD('warning', 'تم التسجيل مسبقاً ⚠️', member.name, `مسجل بواسطة: ${recordedBy}`);
} else {
    playBeepSound('success');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(approvedDelayExcuse ? [40, 30, 40] : 70); } catch(e){}
    }
    if (approvedDelayExcuse) {
        showScannerHUD('success', '🟢 حاضر (بإذن تأخير مسبق ⏰)', member.name, `عذر تأخير مسجل: ${approvedDelayExcuse.reason_category || 'استئذان مسبق'}`);
        if (typeof showToast === 'function') {
            showToast(`⏰ تنبيه: [${member.name}] لديه طلب استئذان تأخير مسجل مسبقاً (${approvedDelayExcuse.reason_category || 'استئذان تأخير'})`);
        }
    } else if (isAbsent) {
        showScannerHUD('warning', 'تم التسجيل (تأخير شديد) ⚠️', member.name, `${member.stage || 'سنة أولى'} • ${newRecord.time}`);
    } else {
        showScannerHUD('success', 'تم التسجيل بنجاح ✔️', member.name, `${member.stage || 'سنة أولى'} • ${newRecord.time}`);
    }
    logActivity("تسجيل حضور", member.name, `تاريخ: ${activeSelectedDate}`);
}

updateLastSyncTimestamp();

renderAttendanceCalendar();

}).catch(err => {

console.warn("تنبيه المزامنة السحابية اللحظية، تم الحفظ في طابور الأوفلاين:", err);
syncToCloud('attendance', attendanceRecord);
if (window.KhedmtyOfflineSync && typeof KhedmtyOfflineSync.enqueue === 'function') {
    KhedmtyOfflineSync.enqueue('ATTENDANCE', {
        date: activeSelectedDate,
        record: newRecord
    });
}
showToast(`💾 تم حفظ حضور: ${member.name} محلياً بدون نت وسيتم توثيقه سحابياً 📱`);

});

}

// ==========================================

// 11. عرض الرسم البياني الحراري

// ==========================================

function renderAttendanceHeatmap() {
    const container = document.getElementById('heatmapContainer');
    const badge = document.getElementById('attritionCountBadge');
    if (!container) return;
    container.innerHTML = '';

    const todayStr = (typeof today !== 'undefined' && today) ? today : new Date().toISOString().split('T')[0];

    // فقط اجتماعات الجمعة المنعقدة فعلياً حتى اليوم مع وجود حضور مسجل
    let fridayDates = Object.keys(attendanceRecord || {}).filter(d => {
        if (!isFridaySession(d)) return false;
        if (d > todayStr) return false;
        let list = attendanceRecord[d] || [];
        return Array.isArray(list) && list.length > 0;
    }).sort().reverse();

    // يتطلب رصد تراجع الالتزام وخطر الانقطاع تسجيل اجتماعي جمعة فعليين على الأقل
    if (fridayDates.length < 2) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; padding:16px; text-align:center; background:#f8fafc; border-radius:10px; border:1px dashed #cbd5e1;">
                <div style="font-size:22px; margin-bottom:6px;">📊</div>
                <div style="font-weight:bold; font-size:13px; color:var(--dark);">يتطلب بناء خريطة خطر الانقطاع تسجيل اجتماعي جمعة فعليين على الأقل لرصد معدل التراجع والالتزام بدقة.</div>
                <div style="font-size:11px; color:#64748b; margin-top:4px;">(تم تسجيل ${fridayDates.length === 1 ? 'اجتماع جمعة واحد حتى الآن: ' + fridayDates[0] : 'لا توجد اجتماعات مسجلة حتى الآن'})</div>
            </div>
        `;
        if (badge) {
            badge.style.display = 'none';
            badge.innerText = '0 معرض للتسرب';
        }
        return;
    }

    let recentDates = fridayDates.slice(0, 4);
    const N = recentDates.length;
    let riskCount = 0;

    members.forEach(m => {
        let attendedCount = 0;
        let delayedCount = 0;
        let historyBlocks = [];

        [...recentDates].reverse().forEach(d => {
            let rec = (attendanceRecord[d] || []).find(a => a && a.id.toString() === m.id.toString());
            if (rec) {
                if (rec.isAbsentDueToDelay) {
                    delayedCount++;
                    historyBlocks.push('<span title="' + d + ': تأخير شديد" style="display:inline-block; width:18px; height:18px; background:#e17055; border-radius:3px; margin:0 2px;"></span>');
                } else {
                    attendedCount++;
                    historyBlocks.push('<span title="' + d + ': حاضر" style="display:inline-block; width:18px; height:18px; background:#00b894; border-radius:3px; margin:0 2px;"></span>');
                }
            } else {
                historyBlocks.push('<span title="' + d + ': غائب" style="display:inline-block; width:18px; height:18px; background:#dfe6e9; border:1px solid #b2bec3; border-radius:3px; margin:0 2px;"></span>');
            }
        });

        // هل غاب آخر اجتماعي جمعة متتاليين؟
        let lastTwoAbsent = N >= 2 &&
            !(attendanceRecord[recentDates[0]] || []).some(x => x && x.id.toString() === m.id.toString() && !x.isAbsentDueToDelay) &&
            !(attendanceRecord[recentDates[1]] || []).some(x => x && x.id.toString() === m.id.toString() && !x.isAbsentDueToDelay);

        let statusTag = "";
        let isAtRisk = false;
        let borderCol = 'var(--warning)';

        // معايير رعوية ذكية دقيقة:
        // 1. خطر تسرب مرتفع: غياب آخر اجتماعين متتاليين، أو غياب تام لجميع اللقاءات الأخيرة (لـ 3 أو 4 اجتماعات)
        if (lastTwoAbsent || (N >= 3 && attendedCount === 0)) {
            statusTag = '<span style="color:var(--danger); font-weight:bold; font-size:11px;">🔴 خطر تسرب مرتفع</span>';
            isAtRisk = true;
            riskCount++;
            borderCol = 'var(--danger)';
        } 
        // 2. تذبذب وتراجع: حضور جلسة واحدة فقط من أصل 3 أو 4، أو تكرار التأخير الشديد، أو تراجع بعد حضور
        else if ((N >= 3 && attendedCount === 1) || delayedCount >= 2 || (N === 4 && attendedCount === 2 && !(attendanceRecord[recentDates[0]] || []).some(x => x && x.id.toString() === m.id.toString()))) {
            statusTag = '<span style="color:#d35400; font-weight:bold; font-size:11px;">🟡 تذبذب وتراجع</span>';
            isAtRisk = true;
            riskCount++;
            borderCol = '#d35400';
        }

        if (isAtRisk) {
            let cleanPhone = formatWhatsAppPhone(m.phone);
            let waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent('سلام ونعمة يا ' + m.name + '، بنطمن عليك ومستنيينك في اجتماعنا يوم الجمعة القادم ❤️')}` : '#';
            let card = document.createElement('div');
            card.style.cssText = `background:#fbfbfb; border:1px solid #eee; border-left:4px solid ${borderCol}; border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;`;
            card.innerHTML = `
                <div>
                    <div style="font-weight:bold; font-size:13px; color:var(--dark);">${m.name} (كود: ${m.code || m.id})</div>
                    <div style="font-size:11px; color:#636e72; margin:2px 0;">${m.stage || 'سنة أولى'} • ${statusTag}</div>
                    <div style="display:flex; align-items:center; margin-top:4px;">${historyBlocks.join('')}</div>
                </div>
                <div><a href="${waLink}" target="_blank" class="btn-mini btn-success" style="padding:5px 9px;">افتقاد 💬</a></div>
            `;
            container.appendChild(card);
        }
    });

    if (badge) {
        badge.innerText = `${riskCount} معرض للانقطاع`;
        badge.style.display = riskCount > 0 ? 'inline-block' : 'none';
    }

    if (riskCount === 0) {
        container.innerHTML = '<div style="color:var(--success); font-weight:bold; font-size:12px; padding:12px; text-align:center; background:#ecfdf5; border-radius:8px; border:1px solid #a7f3d0; grid-column:1/-1;">🌟 رائع! لا توجد مؤشرات تسرب أو تراجع في الالتزام حالياً بين المخدومين.</div>';
    }
}

// ==========================================

// 14. عرض جدول الحضور

// ==========================================

function renderAttendanceTable() {

const tbody = document.querySelector('#attendanceTable tbody');

if (!tbody) return;

tbody.innerHTML = '';

let count = 0;

let list = attendanceRecord[activeSelectedDate] || [];

if (list.length === 0) {

tbody.innerHTML = '<tr><td colspan="10" class="empty-state">لا توجد أي حركات حضور مسجلة لهذا التاريخ.</td></tr>';

}

list.forEach(a => {

count++;

let tr = document.createElement('tr');

let status = a.hasApprovedDelay
    ? '<span style="color:#d97706; font-weight:bold;">⏰ حاضر (بإذن تأخير)</span>'
    : (a.isAbsentDueToDelay ? '<span style="color:red">تأخير شديد</span>' : (a.isBonusEvent ? '<span style="color:var(--purple); font-weight:bold;">⭐ بونص فعالية</span>' : '<span style="color:green">حاضر</span>'));

let editTimeBtn = (currentPermission === 'admin')

? `<button class="btn-mini btn-warning" onclick="editAttendanceTime('${a.id}')" style="padding:2px 5px; font-size:10px; margin-right:4px;">✏️</button>`

: '';

tr.innerHTML = `

<td data-label="كود الامتحان"><strong style="color:var(--primary); font-size:14px;">${escapeHtml(a.code) || escapeHtml(a.id)}</strong></td>

<td data-label="الاسم">${escapeHtml(a.name)}</td>

<td data-label="المرحلة">${escapeHtml(a.stage) || '-'}</td>

<td data-label="وقت المسح" dir="ltr">${escapeHtml(a.time)} ${editTimeBtn}</td>

<td data-label="حضور">${status}</td>

<td data-label="تناول 🕊️">
    <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:bold; color:#059669; justify-content:center;">
        <input type="checkbox" ${a.communion ? 'checked' : ''} onchange="toggleSpiritualStatus('${a.id}', 'communion', this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#059669;">
        <span>تناول</span>
    </label>
</td>

<td data-label="مشاركة 💡">
    <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:bold; color:#d97706; justify-content:center;">
        <input type="checkbox" ${a.participation ? 'checked' : ''} onchange="toggleSpiritualStatus('${a.id}', 'participation', this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#d97706;">
        <span>مشاركة</span>
    </label>
</td>

<td data-label="النقاط ⭐"><strong style="color:var(--accent);">${a.points || 5}</strong></td>

<td data-label="المسجِّل">${escapeHtml(a.scannedBy) || '-'}</td>

<td data-label="إجراء" class="can-attend"><button class="btn-mini btn-danger" onclick="cancelMemberAttendance('${a.id}')">إلغاء ❌</button></td>

`;

tbody.insertBefore(tr, tbody.firstChild);

});

const elCount = document.getElementById('todayAttendanceCount');

if (elCount) elCount.innerText = count;

let todayDateEl = document.getElementById('todayDate');

if (todayDateEl) {

let isFri = isFridaySession(activeSelectedDate);

let label = isFri ? "(اجتماع الجمعة)" : "(نشاط إضافي / بونص ⭐)";

todayDateEl.innerText = `${activeSelectedDate} ${label} ${activeSelectedDate === today ? '• اليوم' : ''}`;

}

let searchActiveBadge = document.getElementById('searchActiveDateBadge');

if (searchActiveBadge) searchActiveBadge.innerText = activeSelectedDate;

updateRoleUI();

}

// ==========================================

// 15. التقويم التفاعلي

// ==========================================

function renderAttendanceCalendar() {

const grids = [
    document.getElementById('attendanceCalendarGrid'),
    document.getElementById('attendanceCalendarGridModal')
].filter(Boolean);

const monthLabels = [
    document.getElementById('calendarCurrentMonthLabel'),
    document.getElementById('calendarCurrentMonthLabelModal')
].filter(Boolean);

if (grids.length === 0) return;

const year = calendarDisplayDate.getFullYear();

const month = calendarDisplayDate.getMonth();

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const monthText = `${monthNames[month]} ${year}`;
monthLabels.forEach(ml => { if (ml) ml.innerText = monthText; });

const curStudentDate = activeSelectedDate || (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));
const sPicker = document.getElementById('studentAttendanceDatePicker');
if (sPicker && !sPicker.value) sPicker.value = curStudentDate;
const sLabel = document.getElementById('studentAttendanceSelectedDateLabel');
if (sLabel && (!sLabel.innerText || sLabel.innerText === '...')) {
    sLabel.innerText = formatStudentArabicDate(curStudentDate);
}

const dayHeaders = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const firstDayIndex = (new Date(year, month, 1).getDay() + 1) % 7;
const totalDays = new Date(year, month + 1, 0).getDate();

grids.forEach(grid => {
    grid.innerHTML = '';

    dayHeaders.forEach(dh => {
        let th = document.createElement('div');
        th.style.cssText = "font-weight:bold; font-size:11px; color:#636e72; padding:4px 0;";
        th.innerText = dh;
        grid.appendChild(th);
    });

    for (let i = 0; i < firstDayIndex; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= totalDays; d++) {
        let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let isToday = (dateStr === today);
        let isSelected = (dateStr === activeSelectedDate);
        let records = attendanceRecord[dateStr] || [];
        let isFri = isFridaySession(dateStr);

        // حساب الحضور الفعلي بدقة واستبعاد مجرد وجود طلب إذن مستقبلي
        let attendedCount = records.filter(r => r && (r.attended || (!r.isAbsent && !r.isAbsentDueToDelay && !r.isExcused))).length;
        let excusedCount = records.filter(r => r && (r.isExcused || r.hasApprovedDelay)).length;
        let hasActualAttendance = attendedCount > 0;
        let isFuture = (today && dateStr > today);

        let cell = document.createElement('div');
        cell.style.cssText = "padding: 8px 4px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s; position: relative; background: #f8f9fa; border: 1px solid #dfe6e9;";

        if (hasActualAttendance) {
            if (isFri) { cell.style.background = "var(--success)"; cell.style.color = "#fff"; }
            else { cell.style.background = "var(--purple)"; cell.style.color = "#fff"; }
        } else if (isFri) {
            if (isFuture && excusedCount > 0) {
                // جمعة قادمة بها إذن مسبق دون اعتبارها جمعة مسجلة
                cell.style.background = "#eff6ff";
                cell.style.color = "#1e40af";
                cell.style.border = "1.5px dashed #3b82f6";
            } else {
                cell.style.background = "#fff3cd";
                cell.style.color = "#856404";
            }
        }

        if (isToday) cell.style.boxShadow = "0 0 0 2px var(--accent)";
        if (isSelected) cell.style.outline = "2px solid #2d3436";

        let subLabel = '';
        if (hasActualAttendance) {
            subLabel = `<div style="font-size:10px; opacity:0.9;">(${attendedCount})</div>`;
        } else if (isFuture && isFri && excusedCount > 0) {
            subLabel = `<div style="font-size:9px; font-weight:700;">(إذن مسبق)</div>`;
        }

        cell.innerHTML = `<div>${d}</div>${subLabel}`;
        cell.onclick = () => {
            selectAttendanceDate(dateStr);
            if (typeof switchTab === 'function') switchTab('attendanceTab');
            closeAttendanceCalendarModal();
        };

        grid.appendChild(cell);
    }
});
}

function changeCalendarMonth(offset) {

calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() + offset);

renderAttendanceCalendar();

}

function formatStudentArabicDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    } catch(e) {}
    return dateStr;
}

function shiftStudentAttendanceDate(days) {
    const cur = (typeof activeSelectedDate !== 'undefined' && activeSelectedDate) ? activeSelectedDate : (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));
    try {
        const parts = cur.split('-');
        const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dt.setDate(dt.getDate() + days);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        selectAttendanceDate(`${y}-${m}-${d}`);
    } catch(e) {
        console.error('shiftStudentAttendanceDate error:', e);
    }
}

function syncWithServantAttendanceDate() {
    let sDate = (typeof activeServantAttendanceDate !== 'undefined' && activeServantAttendanceDate) ? activeServantAttendanceDate : (typeof today !== 'undefined' ? today : new Date().toLocaleDateString('en-CA'));
    selectAttendanceDate(sDate);
}

async function selectAttendanceDate(dateStr) {
activeSelectedDate = dateStr;

// مزامنة شريط التاريخ العلوي للمخدومين
const studentPicker = document.getElementById('studentAttendanceDatePicker');
if (studentPicker) studentPicker.value = dateStr;
const studentLabel = document.getElementById('studentAttendanceSelectedDateLabel');
if (studentLabel) studentLabel.innerText = formatStudentArabicDate(dateStr);

// تعديل شهر التقويم تلقائياً إذا كان التاريخ في شهر مختلف
if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (typeof calendarDisplayDate !== 'undefined' && calendarDisplayDate && (calendarDisplayDate.getFullYear() !== y || calendarDisplayDate.getMonth() !== m)) {
            calendarDisplayDate = new Date(y, m, 1);
        }
    }
}

if (typeof changeServantAttendanceDate === 'function') {
    try { changeServantAttendanceDate(dateStr); } catch(e) {}
} else if (typeof activeServantAttendanceDate !== 'undefined') {
    activeServantAttendanceDate = dateStr;
    if (typeof renderServantsAttendanceTable === 'function') renderServantsAttendanceTable();
}

if (!attendanceRecord[activeSelectedDate]) attendanceRecord[activeSelectedDate] = [];

renderAttendanceTable();

renderLiveCardsFeed();

renderAttendanceCalendar();

showToast(`📅 تم فتح سجل تاريخ: ${dateStr}`);

// ترشيد استهلاك السحابة: إذا لم يكن هذا اليوم محملاً محلياً، نجلبه سحابياً عند الطلب فقط (وثيقة واحدة)

if (isFirebaseActive && fsdb && (!attendanceRecord[dateStr] || attendanceRecord[dateStr].length === 0)) {

try {

const snap = await fsdb.collection('attendance').doc(dateStr).get();

if (snap.exists) {

const dayData = Object.values(snap.data() || {}).filter(Boolean);

if (dayData.length > 0) {

attendanceRecord[dateStr] = dayData;

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

renderAttendanceTable();

renderLiveCardsFeed();

renderAttendanceCalendar();

showToast(`✅ تم جلب حضور (${dateStr}) سحابياً`);

}

}

} catch (e) {}

}

}

async function loadFullAttendanceHistory(btnEl) {

if (!isFirebaseActive || !fsdb) {

showToast("⚠️ لا يوجد اتصال سحابي حالياً", true);

return;

}

if (btnEl) {

btnEl.disabled = true;

btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري جلب كامل سجلات السنة...';

}

try {

const fullSnap = await fsdb.collection('attendance').get();

let fullFormatted = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || {};

fullSnap.forEach(doc => {

fullFormatted[doc.id] = Object.values(doc.data() || {}).filter(Boolean);

});

attendanceRecord = fullFormatted;

if (!attendanceRecord[today]) attendanceRecord[today] = [];

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderAttendanceCalendar();

showToast(`✅ تم جلب السجل التاريخي بالكامل (${fullSnap.size} يوماً) وتخزينه محلياً`);

} catch (e) {

console.error(e);

showToast("❌ تعذر جلب السجل الكامل: " + (e.message || ''), true);

} finally {

if (btnEl) {

btnEl.disabled = false;

btnEl.innerHTML = '🔄 جلب السجل الكامل';

}

}

}


// 19. تعديل وقت الحضور

// ==========================================

let currentEditingAttendanceMemberId = null;

function parseAnyTimeTo24h(str) {
    if (!str) return '13:00';
    const arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    let clean = String(str).trim();
    arabicNums.forEach((c, i) => { clean = clean.split(c).join(i.toString()); });
    
    const isPM = clean.includes('م') || clean.toLowerCase().includes('pm');
    const isAM = clean.includes('ص') || clean.toLowerCase().includes('am');
    
    clean = clean.replace(/[^\d:]/g, '');
    const parts = clean.split(':').map(Number);
    if (parts.length === 0 || isNaN(parts[0])) return '13:00';
    
    let h = parts[0];
    let m = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;
    
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    
    if (h > 23) h = 23;
    if (m > 59) m = 59;
    
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function openEditAttendanceTimeModal(memberId) {
    if (currentPermission !== 'admin') {
        alert("عفواً، تعديل وقت الحضور متاح لأمين الخدمة العام فقط!");
        return;
    }

    const dayList = attendanceRecord[activeSelectedDate] || [];
    const rec = dayList.find(a => String(a.id) === String(memberId) || String(a.code || '') === String(memberId));
    if (!rec) {
        showToast("⚠️ لم يتم العثور على سجل الحضور لهذا المخدوم");
        return;
    }

    currentEditingAttendanceMemberId = memberId;

    const modal = document.getElementById('modalEditAttendanceTime');
    if (!modal) {
        // Fallback
        const newTime = prompt(`تعديل وقت حضور (${rec.name}) لتاريخ (${activeSelectedDate}):\nيرجى كتابة الوقت مثل 01:15 أو 13:30`, "13:00");
        if (newTime) {
            const time24 = parseAnyTimeTo24h(newTime);
            const [h, m] = time24.split(':').map(Number);
            const d = new Date(); d.setHours(h, m, 0, 0);
            applyAttendanceTimeChange(memberId, h, m, d.toLocaleTimeString('ar-EG'));
        }
        return;
    }

    const nameEl = document.getElementById('modalTimeStudentName');
    if (nameEl) nameEl.innerText = `المخدوم: ${rec.name || 'مجهول'}`;
    const codeEl = document.getElementById('modalTimeStudentCode');
    if (codeEl) codeEl.innerText = `الكود: ${rec.code || rec.id || '-'}`;
    const dateEl = document.getElementById('modalTimeTargetDate');
    if (dateEl) dateEl.innerText = `تاريخ: ${activeSelectedDate}`;
    const curEl = document.getElementById('modalTimeCurrentRecorded');
    if (curEl) curEl.innerText = `الوقت الحالي بالسجل: ${rec.time || 'غير محدد'}`;

    const time24 = parseAnyTimeTo24h(rec.time);
    const input = document.getElementById('modalTimePickerInput');
    if (input) input.value = time24;

    modal.style.display = 'flex';
}

function closeEditAttendanceTimeModal() {
    const modal = document.getElementById('modalEditAttendanceTime');
    if (modal) modal.style.display = 'none';
    currentEditingAttendanceMemberId = null;
}

function setModalTimePreset(val) {
    const input = document.getElementById('modalTimePickerInput');
    if (input) input.value = val;
}

function setModalTimeToNow() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const input = document.getElementById('modalTimePickerInput');
    if (input) input.value = `${h}:${m}`;
}

async function submitAttendanceTimeFromModal() {
    if (!currentEditingAttendanceMemberId) return;
    const input = document.getElementById('modalTimePickerInput');
    if (!input || !input.value) {
        alert('يرجى تحديد وقت صالح!');
        return;
    }

    const timeVal = input.value.trim();
    const [h, m] = timeVal.split(':').map(Number);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        alert('صيغة الوقت غير صحيحة!');
        return;
    }

    const d = new Date();
    d.setHours(h, m, 0, 0);
    const formattedDisplayTime = d.toLocaleTimeString('ar-EG');

    await applyAttendanceTimeChange(currentEditingAttendanceMemberId, h, m, formattedDisplayTime);
    closeEditAttendanceTimeModal();
}

async function applyAttendanceTimeChange(memberId, h, m, formattedDisplayTime) {
    let rec = (attendanceRecord[activeSelectedDate] || []).find(a => String(a.id) === String(memberId) || String(a.code || '') === String(memberId));
    if (!rec) return;

    let oldTime = rec.time;
    rec.time = formattedDisplayTime;

    let isFri = isFridaySession(activeSelectedDate);
    let isSummerDay = settings.summerActive && (new Date(activeSelectedDate).getDay().toString() === settings.summerDay);

    if (!isFri || (isSummerDay && settings.ignoreSummerDelay) || rec.hasApprovedDelay) {
        rec.isAbsentDueToDelay = false;
    } else {
        let startTimeStr = settings.startTime || "13:00";
        let [startH, startM] = startTimeStr.split(':').map(Number);
        let diffMinutes = (h * 60 + m) - (startH * 60 + startM);
        rec.isAbsentDueToDelay = diffMinutes >= (settings.absentAfter || 75);
    }

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

    let pKey = (rec.code || rec.id || '').toString().replace(/\D/g, '');
    if (isFirebaseActive && fsdb && pKey) {
        fsdb.collection('attendance').doc(activeSelectedDate).update({
            [`${pKey}.time`]: formattedDisplayTime,
            [`${pKey}.isAbsentDueToDelay`]: rec.isAbsentDueToDelay
        }).catch(() => {});
    }

    logActivity("تعديل وقت حضور", rec.name, `تاريخ: ${activeSelectedDate} من ${oldTime} إلى ${formattedDisplayTime}`);

    renderAttendanceTable();
    renderLiveCardsFeed();
    if (typeof renderDashboard === 'function') renderDashboard();

    showToast(`✅ تم تعديل وقت الحضور إلى (${formattedDisplayTime})`);
}

function editAttendanceTime(memberId) {
    openEditAttendanceTimeModal(memberId);
}


// 24. Kiosk ونافذة الترحيب

// ==========================================

function showKioskWelcome(person, isAbsent, type = 'member') {

const card = document.getElementById('kioskCard');

const icon = document.getElementById('kioskIcon');

const name = document.getElementById('kioskName');

const badge = document.getElementById('kioskBadge');

const stats = document.getElementById('kioskStats');

const reflectionBox = document.getElementById('kioskReflectionBox');

if (!card) return;

if (reflectionBox) reflectionBox.innerHTML = '';

if (type === 'servant') {

icon.innerText = "👔";

name.innerText = person.name;

badge.innerText = "خادم مسجل";

badge.style.background = "var(--primary)";

stats.innerHTML = `تم تسجيل حضورك في تمام <strong>${new Date().toLocaleTimeString('ar-EG')}</strong><br>خدمة مباركة ومثمرة! 🕊️`;

} else {

let grad = calculateGraduationStatus(person.id);

if (isAbsent) {

icon.innerText = "⚠️";

name.innerText = person.name;

badge.innerText = "تأخير شديد";

badge.style.background = "var(--danger)";

stats.innerHTML = `كود الامتحان: <strong>${escapeHtml(person.code) || escapeHtml(person.id)}</strong><br>تم رصد حضورك متأخراً في <strong>${new Date().toLocaleTimeString('ar-EG')}</strong><br>نسبة الحضور: <strong>${grad.percent}%</strong>`;

} else {

icon.innerText = "✨";

name.innerText = person.name;

badge.innerText = `حاضر - ${person.stage || 'سنة أولى'}`;

badge.style.background = "var(--success)";

stats.innerHTML = `كود الامتحان: <strong>${escapeHtml(person.code) || escapeHtml(person.id)}</strong><br>نورت كورس إعداد الخدام! 🎉<br>نسبة حضور الجمعة: <strong>${grad.percent}%</strong> (${grad.attended}/${grad.total} لقاء)<br>رصيد بونص: <strong>+${grad.bonus} نقطة</strong>`;

}

// تقييم ذاتي روحي اختياري - يدوسه الدارس بنفسه في نفس لحظة تسجيل حضوره

if (reflectionBox) {

let starsRow = [1,2,3,4,5].map(n =>

`<span onclick="submitSelfReflection('${person.id}', '${escapeHtml(person.name).replace(/'/g, "\\'")}', ${n})" style="cursor:pointer; font-size:26px; padding:0 2px;" title="${n} من 5">⭐</span>`

).join('');

reflectionBox.innerHTML = `

<div style="border-top:1px dashed #dfe6e9; padding-top:8px; margin-top:6px;">

<div style="font-size:12px; color:#636e72; margin-bottom:5px;">🙏 إزاي حاسس روحيًا النهاردة؟ (اختياري - دوس على عدد النجوم)</div>

<div style="text-align:center;">${starsRow}</div>

</div>`;

}

}

card.style.display = 'block';

let hideDelay = (type === 'member' && !isAbsent) ? 9000 : 2500;

setTimeout(() => { card.style.display = 'none'; }, hideDelay);

}

// ==========================================


// 26. كود الطوارئ (WhatsApp)

// ==========================================

function exportTodaySessionToWhatsApp(adminPhone = "") {

let todayData = {

date: activeSelectedDate,

servant: currentUser ? currentUser.name : 'غير محدد',

attendance: attendanceRecord[activeSelectedDate] || [],

servantsAtt: servantsAttendance[today] || []

};

if (todayData.attendance.length === 0 && todayData.servantsAtt.length === 0) {

return alert("لا توجد أي حركات حضور مسجلة لهذا التاريخ لتصديرها!");

}

let targetPhone = adminPhone;

if (!targetPhone || targetPhone === "") {

let adminObj = servants.find(s => s.role === 'admin' || s.permission === 'admin');

targetPhone = adminObj ? adminObj.phone : (settings.adminWhatsApp || "201200000000");

}

targetPhone = formatWhatsAppPhone(targetPhone);

let payload = btoa(unescape(encodeURIComponent(JSON.stringify(todayData))));

let msg = `🚨 *تقرير طوارئ حضور كورس الخدام (${activeSelectedDate})*\nمسجل بواسطة: ${todayData.servant}\nعدد الحاضرين: ${todayData.attendance.length}\nعدد الخدام: ${todayData.servantsAtt.length}\n\n*كود المزامنة (انسخه بالكامل):*\n\`\`\`${payload}\`\`\``;

window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');

}

function importFromEmergencyCode() {

let code = prompt("الصق كود المزامنة المستلم من رسالة الواتساب هنا:");

if (!code) return;

try {

let decodedStr = decodeURIComponent(escape(atob(code.trim())));

let imported = JSON.parse(decodedStr);

if (!imported.date || !imported.attendance) return alert("❌ كود غير صالح أو تالف!");

let targetDate = imported.date;

if (!attendanceRecord[targetDate]) attendanceRecord[targetDate] = [];

if (!servantsAttendance[targetDate]) servantsAttendance[targetDate] = [];

imported.attendance.forEach(newItem => {

if (!attendanceRecord[targetDate].some(x => x.id.toString() === newItem.id.toString())) {

attendanceRecord[targetDate].push(newItem);

}

});

imported.servantsAtt.forEach(newServ => {

if (!servantsAttendance[targetDate].some(x => x.id.toString() === newServ.id.toString())) {

servantsAttendance[targetDate].push(newServ);

}

});

localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecord));

localStorage.setItem(STORAGE_KEYS.SERVANTS_ATTENDANCE, JSON.stringify(servantsAttendance));

syncToCloud('attendance', attendanceRecord);

syncToCloud('servants_attendance', servantsAttendance);

logActivity("استيراد كود طوارئ", targetDate, `استيراد ${imported.attendance.length} حضور`);

renderAttendanceTable();

renderLiveCardsFeed();

renderServantsAttendanceTable();

renderDashboard();

renderAttendanceCalendar();

checkLocalStorageUsage();

alert(`✅ تم استيراد حركات حضور يوم (${targetDate}) بنجاح!`);

} catch (e) {

alert("❌ حدث خطأ أثناء فك تشفير الكود: تأكد من نسخه كاملاً.");

}

}


// 28.5 تصدير مصفوفة كشف الحضور والغياب (Excel / CSV)

// مطابق لنموذج شيت الحضور والغياب الرسمي

// ==========================================

function formatMatrixDateHeader(dateStr) {

if (!dateStr) return '';

let s = String(dateStr).trim();

let parts = s.split(/[-/]/);

if (parts.length === 3) {

if (parts[0].length === 4) {

// YYYY-MM-DD -> D-M-YYYY

let y = parts[0];

let m = parseInt(parts[1], 10);

let d = parseInt(parts[2], 10);

return `${d}-${m}-${y}`;

} else if (parts[2].length === 4) {

// DD-MM-YYYY or D-M-YYYY -> D-M-YYYY

let d = parseInt(parts[0], 10);

let m = parseInt(parts[1], 10);

let y = parts[2];

return `${d}-${m}-${y}`;

}

}

let dt = new Date(dateStr);

if (!isNaN(dt.getTime())) {

return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;

}

return s;

}

function isMemberAttendedOnDate(member, dateKey) {

if (!member || !dateKey) return false;

let dayList = attendanceRecord[dateKey];

if (!Array.isArray(dayList) || dayList.length === 0) return false;

let memId = member.id != null ? String(member.id).trim() : '';

let memCode = member.code != null ? String(member.code).trim() : '';

return dayList.some(a => {

if (!a) return false;

let aId = a.id != null ? String(a.id).trim() : '';

let aCode = a.code != null ? String(a.code).trim() : '';

let match = (memId && (aId === memId || aCode === memId)) ||

(memCode && (aId === memCode || aCode === memCode));

return match && !a.isAbsentDueToDelay;

});

}

function openAttendanceExportModal(initialScope) {

let modal = document.getElementById('attendanceExportModal');

if (!modal) return;

// ضبط التاريخ الحالي

let curDateEl = document.getElementById('exportModalCurrentDate');

if (curDateEl) curDateEl.innerText = activeSelectedDate || today;

// اسم الخدمة الافتراضي

let nameInput = document.getElementById('exportClassNameInput');

if (nameInput) {

let defaultName = (settings && settings.serviceName) ? settings.serviceName : 'مخدومين إعداد خدام 2025-2026';

if (!nameInput.value || nameInput.value.trim() === '') {

nameInput.value = defaultName;

}

}

// جمع التواريخ المسجلة لتحديد حدود الفترة الافتراضية

let recordedDates = Object.keys(attendanceRecord || {}).filter(d => {

let list = attendanceRecord[d];

return Array.isArray(list) && list.length > 0;

}).sort();

let startInput = document.getElementById('exportStartDate');

let endInput = document.getElementById('exportEndDate');

if (startInput && endInput) {

if (recordedDates.length > 0) {

startInput.value = recordedDates[0];

endInput.value = recordedDates[recordedDates.length - 1];

} else {

let d = new Date();

let y = d.getFullYear();

let m = String(d.getMonth() + 1).padStart(2, '0');

startInput.value = `${y}-${m}-01`;

endInput.value = activeSelectedDate || today;

}

}

// تحديث خيارات المراحل ديناميكياً

let stageSelect = document.getElementById('exportStageFilterSelect');

if (stageSelect) {

let uniqueStages = new Set();

(members || []).forEach(m => {

let st = m.stage || m.level;

if (st && typeof st === 'string' && st.trim()) uniqueStages.add(st.trim());

});

let currentVal = stageSelect.value || 'all';

let optsHtml = '<option value="all">كل المراحل والمخدومين</option>';

if (uniqueStages.size > 0) {

uniqueStages.forEach(st => {

optsHtml += `<option value="${escapeHtml(st)}">${escapeHtml(st)}</option>`;

});

} else {

optsHtml += '<option value="سنة أولى">سنة أولى إعداد خدام</option><option value="سنة ثانية">سنة ثانية إعداد خدام</option>';

}

stageSelect.innerHTML = optsHtml;

stageSelect.value = currentVal;

}

// ضبط النطاق المطلوب

if (initialScope === 'all') {

let rAll = document.getElementById('scopeAll');

if (rAll) rAll.checked = true;

} else if (initialScope === 'range') {

let rRange = document.getElementById('scopeRange');

if (rRange) rRange.checked = true;

} else {

let rSingle = document.getElementById('scopeSingle');

if (rSingle) rSingle.checked = true;

}

handleExportScopeChange();

modal.style.display = 'block';

}

function closeAttendanceExportModal() {

let modal = document.getElementById('attendanceExportModal');

if (modal) modal.style.display = 'none';

}

function handleExportScopeChange() {

let rangeInputs = document.getElementById('exportDateRangeInputs');

let isRange = document.getElementById('scopeRange') && document.getElementById('scopeRange').checked;

if (rangeInputs) {

rangeInputs.style.display = isRange ? 'flex' : 'none';

}

updateExportPreview();

}

function getAttendanceExportDates() {

let scope = 'single';

let singleEl = document.getElementById('scopeSingle');

let rangeEl = document.getElementById('scopeRange');

let allEl = document.getElementById('scopeAll');

if (rangeEl && rangeEl.checked) scope = 'range';

else if (allEl && allEl.checked) scope = 'all';

if (scope === 'single') {

return [activeSelectedDate || today];

} else if (scope === 'range') {

let sVal = (document.getElementById('exportStartDate') ? document.getElementById('exportStartDate').value : '') || '2000-01-01';

let eVal = (document.getElementById('exportEndDate') ? document.getElementById('exportEndDate').value : '') || '2099-12-31';

if (sVal > eVal) {

let tmp = sVal; sVal = eVal; eVal = tmp;

}

let allDates = Object.keys(attendanceRecord || {}).filter(d => {

return d >= sVal && d <= eVal && Array.isArray(attendanceRecord[d]) && attendanceRecord[d].length > 0;

});

if (allDates.length === 0 && activeSelectedDate >= sVal && activeSelectedDate <= eVal) {

allDates = [activeSelectedDate];

}

return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

} else {

// all

let allDates = Object.keys(attendanceRecord || {}).filter(d => {

return Array.isArray(attendanceRecord[d]) && attendanceRecord[d].length > 0;

});

if (allDates.length === 0) {

allDates = [activeSelectedDate || today];

}

return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

}

}

function getFilteredMembersForExport() {

let stageSelect = document.getElementById('exportStageFilterSelect');

let stage = stageSelect ? stageSelect.value : 'all';

let list = (members || []).slice();

if (stage !== 'all') {

let normTarget = normalizeStageText(stage);

list = list.filter(m => normalizeStageText(m.stage || m.level) === normTarget);

}

list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));

return list;

}

function updateExportPreview() {

let dates = getAttendanceExportDates();

let mems = getFilteredMembersForExport();

let pMems = document.getElementById('previewMemberCount');

let pDates = document.getElementById('previewDateCount');

if (pMems) pMems.innerText = mems.length;

if (pDates) pDates.innerText = dates.length;

}

function buildAttendanceMatrixData() {

let mems = getFilteredMembersForExport();

if (mems.length === 0) {

alert("⚠️ لا يوجد مخدومين في المرحلة المحددة للتصدير!");

return null;

}

let dates = getAttendanceExportDates();

if (dates.length === 0) {

alert("⚠️ لا توجد تواريخ مسجلة في النطاق المحدد!");

return null;

}

let nameInput = document.getElementById('exportClassNameInput');

let className = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : ((settings && settings.serviceName) ? settings.serviceName : 'مخدومين إعداد خدام 2025-2026');

// الصف الأول: أسم الفصل | [اسم الفصل]

let aoa = [

["أسم الفصل", className]

];

// الصف الثاني: الاسم/ايام الحضور | 14-8-2026 | 21-8-2026 ...

let headerRow = ["الاسم/ايام الحضور"];

dates.forEach(d => {

headerRow.push(formatMatrixDateHeader(d));

});

aoa.push(headerRow);

// الصفوف التالية: لكل مخدوم صف به علامة حضور أو غياب

mems.forEach(m => {

let row = [m.name || 'مخدوم بدون اسم'];

dates.forEach(d => {

let attended = isMemberAttendedOnDate(m, d);

row.push(attended ? '   ✔   ' : '  X  ');

});

aoa.push(row);

});

// توليد اسم ملف معبر

let scopeRange = document.getElementById('scopeRange');

let scopeAll = document.getElementById('scopeAll');

let fileName = 'كشف_حضور_الاجتماع';

if (dates.length === 1) {

fileName = `كشف_حضور_${formatMatrixDateHeader(dates[0])}`;

} else if (scopeRange && scopeRange.checked) {

fileName = `كشف_حضور_من_${formatMatrixDateHeader(dates[0])}_الى_${formatMatrixDateHeader(dates[dates.length - 1])}`;

} else if (scopeAll && scopeAll.checked) {

fileName = `كشف_حضور_شامل_${dates.length}_اجتماعات`;

}

return { aoa, fileName, dates, memsCount: mems.length };

}

function exportMatrixToCSV(aoa, baseFileName) {

let csvContent = "\uFEFF"; // UTF-8 BOM لضمان فتح الحروف العربية بشكل سليم تماماً داخل Microsoft Excel

aoa.forEach(row => {

let line = row.map(cell => {

let val = (cell === null || cell === undefined) ? '' : String(cell);

if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {

val = '"' + val.replace(/"/g, '""') + '"';

}

return val;

}).join(",");

csvContent += line + "\r\n";

});

let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download = baseFileName.endsWith('.csv') ? baseFileName : (baseFileName + '.csv');

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

}

async function triggerAttendanceExport(format) {

let data = buildAttendanceMatrixData();

if (!data) return;

let { aoa, fileName } = data;

if (format === 'xlsx') {

await ensureXlsxLoaded().catch(() => {});

if (typeof XLSX !== 'undefined') {

try {

let ws = XLSX.utils.aoa_to_sheet(aoa);

// تعيين عرض مناسب للأعمدة: عمود الأسماء 32، وباقي أعمدة التواريخ 14

ws['!cols'] = [{ wch: 32 }].concat(data.dates.map(() => ({ wch: 14 })));

let wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

XLSX.writeFile(wb, fileName + ".xlsx");

} catch (err) {

console.warn("تعذر تصدير XLSX عبر المكتبة، جاري التحويل التلقائي لـ CSV المتوافق:", err);

exportMatrixToCSV(aoa, fileName);

}

} else {

// في حال غياب مكتبة XLSX (أوفلاين)، تصدير CSV متوافق 100% مع إكسل

exportMatrixToCSV(aoa, fileName);

}

} else {

exportMatrixToCSV(aoa, fileName);

}

if (typeof logActivity === "function") {

logActivity("تصدير الحضور", "إكسل", `${fileName} (${data.memsCount} مخدوم)`);

}

closeAttendanceExportModal();

if (typeof showToast === "function") {

showToast(`✅ تم استخراج كشف الحضور بنجاح!`);

}

}

// تكامل الدالة السابقة المطلوبة في لوحة التقارير

function exportAttendance(showModal = true) {

if (showModal) {

openAttendanceExportModal();

} else {

openAttendanceExportModal('all');

}

}

// ==========================================


// 30. تغذية المسح المباشر

// ==========================================

function renderLiveCardsFeed() {
    const feed = document.getElementById('liveCardsFeed');
    const countBadge = document.getElementById('liveScanCount');
    if (!feed) return;

    let targetDate = (typeof activeSelectedDate !== "undefined" && activeSelectedDate) ? activeSelectedDate : (typeof today !== "undefined" ? today : new Date().toISOString().split('T')[0]);
    let todayList = attendanceRecord[targetDate] || [];

    if (countBadge) countBadge.innerText = todayList.length;

    if (todayList.length === 0) {
        feed.innerHTML = `
            <div style="text-align:center; color:#94a3b8; padding:22px 10px; font-size:13px; font-weight:600;">
                وجّه الكاميرا نحو باركود الكارنيه لبدء التسجيل السريع...
            </div>
        `;
        return;
    }

    feed.innerHTML = '';
    const totalCount = todayList.length;

    todayList.forEach((item, index) => {
        let tagHtml = '';
        if (item.hasApprovedDelay) {
            tagHtml = '<span style="font-size:0.7rem; background:#fffbeb; color:#b45309; border:1px solid #fde68a; padding:1px 6px; border-radius:4px; font-weight:800; margin-right:6px;">⏰ بإذن تأخير</span>';
        } else if (item.isAbsentDueToDelay) {
            tagHtml = '<span style="font-size:0.7rem; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:1px 6px; border-radius:4px; font-weight:800; margin-right:6px;">🔴 تأخير شديد</span>';
        }
        let card = document.createElement('div');
        card.className = 'fast-scan-card';
        card.innerHTML = `
            <div class="fast-scan-left">
                <div class="fast-scan-check-circle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${item.isAbsentDueToDelay ? '#ef4444' : '#16a34a'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="fast-scan-name" style="display:flex; align-items:center; gap:4px;">
                    <span>${escapeHtml(item.name || 'مخدوم')}</span>
                    ${tagHtml}
                </div>
            </div>
            <div class="fast-scan-index">#${totalCount - index}</div>
        `;
        feed.appendChild(card);
    });
}

function manualMarkMemberFromInput() {

let input = document.getElementById('manualAttendInput').value.trim();

if (!input) return alert("يرجى كتابة كود الامتحان أو اسم الدارس أولاً!");

let member = members.find(m => {

let mCode = m.code ? m.code.toString().trim() : "";

let mName = m.name ? m.name.trim().toLowerCase() : "";

return (mCode === input || mName.includes(input.toLowerCase()));

});

// إذا لم يُعثر على الدارس في members، نبحث في candidatesList من الكنترول
if (!member) {
    try {
        const cList = JSON.parse(localStorage.getItem('candidatesList') || '[]');
        member = cList.find(c => {
            let cCode = c.code ? c.code.toString().trim() : "";
            let cName = c.name ? c.name.trim().toLowerCase() : "";
            return (cCode === input || cName.includes(input.toLowerCase()));
        });
    } catch(e) {}
}

// إذا كان المخدوم غير مسجل محلياً لكن الخادم أدخل كوداً في الكنيسة أوفلاين:
if (!member && input) {
    member = {
        id: input,
        code: input,
        name: 'دارس (كود ' + input + ')',
        stage: 'الفرقة الأولى',
        gender: 'بنين',
        phone: ''
    };
}

if (member) {

const delayExcuse = getStudentApprovedDelayExcuse(member, activeSelectedDate);
if (delayExcuse && typeof showToast === 'function') {
    showToast(`⏰ تنبيه: الدارس [${member.name}] مسجل لديه استئذان تأخير مسبق! (${delayExcuse.reason_category || 'استئذان مسبق'})`);
}

atomicRegisterAttendance(member);

document.getElementById('manualAttendInput').value = '';

} else {

playBeepSound('error');

showToast(`❌ لم يتم العثور على أي دارس بهذا الكود أو الاسم`, true);

}

}

// ==========================================

// 31. الماسح الرئيسي

// ==========================================

let html5QrCode = null;

async function populateCameraDevices() {

try {

if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {

const devices = await navigator.mediaDevices.enumerateDevices();

const videoDevices = devices.filter(d => d.kind === 'videoinput');

const select = document.getElementById('cameraSelectionDropdown');

if (select) {

select.innerHTML = '<option value="">تحديد الكاميرا الخلفية تلقائياً...</option>';

videoDevices.forEach((device, index) => {

const opt = document.createElement('option');

opt.value = device.deviceId;

opt.text = device.label || `كاميرا ${index + 1}`;

select.appendChild(opt);

});

}

}

} catch(e){ console.warn("[خدمتي برو]", e); }

}

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return alert("يرجى استخدام متصفح حديث يدعم الكاميرا.");
    }

    const modal = document.getElementById('fastScannerModal');
    if (modal && modal.style.display !== 'flex') {
        modal.style.display = 'flex';
        updateScannerDatePill();
        updateFastScannerSyncBadge();
        renderLiveCardsFeed();
    }

    if (typeof Html5Qrcode === 'undefined') {
        showToast("⏳ جاري تهيئة كاميرا المسح الضوئي...");
        await ensureHtml5QrLoaded().catch(() => {});
    }

    try {
        const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
        testStream.getTracks().forEach(t => t.stop());
        await populateCameraDevices();

        const startBtn = document.getElementById('startCameraBtn');
        if (startBtn) startBtn.style.display = 'none';
        const stopBtn = document.getElementById('stopCameraBtn');
        if (stopBtn) stopBtn.style.display = 'block';

        if (html5QrCode) {
            try { await html5QrCode.stop(); } catch(e){ console.warn("[خدمتي برو]", e); }
        }

        html5QrCode = new Html5Qrcode("reader");
        const chosenDeviceId = document.getElementById('cameraSelectionDropdown')?.value;
        const cameraConfig = {
            fps: 20,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                return { width: Math.floor(minEdge * 0.78), height: Math.floor(minEdge * 0.78) };
            },
            aspectRatio: 1.0
        };

        if (chosenDeviceId) {
            await html5QrCode.start(chosenDeviceId, cameraConfig, markAttendance, () => {});
        } else {
            try {
                await html5QrCode.start({ facingMode: "environment" }, cameraConfig, markAttendance, () => {});
            } catch (envErr) {
                await html5QrCode.start({ facingMode: "user" }, cameraConfig, markAttendance, () => {});
            }
        }
    } catch (err) {
        stopCamera();
        alert("❌ تم رفض إذن الكاميرا. يرجى التأكد من إعطاء إذن الكاميرا للمتصفح.");
    }
}

function stopCamera() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            try { html5QrCode.clear(); } catch(e){}
        }).catch(() => {});
    }
    const modal = document.getElementById('fastScannerModal');
    if (modal) modal.style.display = 'none';
    const startBtn = document.getElementById('startCameraBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    const stopBtn = document.getElementById('stopCameraBtn');
    if (stopBtn) stopBtn.style.display = 'none';
}

let lastScannedCode = "";
let lastScannedTime = 0;
const DUPLICATE_COOLDOWN_MS = 1200; // منع التكرار العرضي لنفس الكارنيه فقط

function markAttendance(scannedText) {
    scannedText = scannedText.trim();
    let nowTimestamp = Date.now();

    // إذا كان نفس الكود تماماً ومضى أقل من 1.2 ثانية: تجاهل لتفادي تكرار اللقطة أثناء حمل الكارنيه
    if (scannedText === lastScannedCode && (nowTimestamp - lastScannedTime) < DUPLICATE_COOLDOWN_MS) {
        return;
    }
    // لأي شخص آخر أو كود مختلف: تسجيل فوري بلحظة الصفر (0ms)
    lastScannedCode = scannedText;
    lastScannedTime = nowTimestamp;

    let parsedName = scannedText;
    if (scannedText.includes('/')) parsedName = scannedText.split('/')[0].trim();

    let member = members.find(m => {
        let mName = m.name ? m.name.trim().toLowerCase() : "";
        let mCode = m.code ? m.code.toString().trim() : "";
        let mId = m.id ? m.id.toString().trim() : "";
        let mQr = m.qrCode ? m.qrCode.toLowerCase() : "";
        return (mCode === scannedText || (mQr !== "" && mQr === scannedText.toLowerCase()) || mName === parsedName.toLowerCase() || mId === scannedText);
    });

    if (!member && typeof candidatesList !== 'undefined' && Array.isArray(candidatesList)) {
        member = candidatesList.find(c => {
            let cCode = c.code ? c.code.toString().trim() : "";
            let cId = c.id ? c.id.toString().trim() : "";
            let cName = c.name ? c.name.trim().toLowerCase() : "";
            return (cCode === scannedText || cId === scannedText || cName === parsedName.toLowerCase());
        });
    }

    if (member) {
        atomicRegisterAttendance(member);
    } else {
        let s = servants.find(x => (x.code && x.code.toString() === scannedText) || x.id.toString() === scannedText || (x.name && scannedText.includes(x.name)));
        if (s) {
            recordServantAttendance(s);
            playBeepSound('success');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(70); } catch(e){}
            }
            showScannerHUD('success', 'تم تسجيل حضور الخادم ✔️', s.name, 'خادم بالخدمة ✝️');
        } else {
            playBeepSound('error');
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate([100, 60, 100]); } catch(e){}
            }
            showScannerHUD('error', 'عفواً الطالب غير مسجل ❌', 'الكود غير موجود في المنظومة', 'يرجى مراجعة إدارة الكنترول');
        }
    }
}

// ==========================================

// 32. الحضور اليدوي من قائمة

// ==========================================

function openManualAttendanceModal() {

document.getElementById('manualModalSearchBox').value = '';

renderManualAttendanceModalList();

document.getElementById('manualAttendanceModal').style.display = 'flex';

}

function closeManualAttendanceModal() {

document.getElementById('manualAttendanceModal').style.display = 'none';

}

function renderManualAttendanceModalList() {

const tbody = document.getElementById('manualAttendanceModalTbody');

const search = document.getElementById('manualModalSearchBox').value.toLowerCase();

if (!tbody) return;

tbody.innerHTML = '';

let todayMap = {};

(attendanceRecord[activeSelectedDate] || []).forEach(a => { todayMap[a.id.toString()] = a; });

let filtered = members.filter(m => (m.name || '').toLowerCase().includes(search) || (m.code || '').toString().includes(search));

if (filtered.length === 0) {

tbody.innerHTML = '<tr><td colspan="4" class="empty-state">لا توجد نتائج مطابقة للبحث.</td></tr>';

return;

}

filtered.forEach(m => {

let rec = todayMap[m.id.toString()];

let isAtt = !!rec;

let isCom = rec ? !!rec.communion : false;

let isPart = rec ? !!rec.participation : false;

let tr = document.createElement('tr');
tr.className = 'manual-modal-row-card';
tr.innerHTML = `
<td data-label="المخدوم" class="modal-col-name" style="text-align:right; border-bottom:1px solid #f1f5f9; padding-bottom:6px;">
    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:4px;">
        <strong style="color:var(--primary); font-size:14px;">${escapeHtml(m.name)}</strong>
        <div>
            <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:bold; font-size:11px;">كود: ${escapeHtml(m.code) || '-'}</span>
            <span class="badge" style="background:#f1f5f9; color:#475569; font-size:11px; margin-right:4px;">${escapeHtml(normalizeStageText(m.stage) || '')}</span>
        </div>
        ${(() => {
            const de = getStudentApprovedDelayExcuse(m, activeSelectedDate);
            return de ? `<div style="width:100%; margin-top:4px;"><span class="badge" style="background:#f5f3ff; color:#6d28d9; border:1px solid #c4b5fd; font-size:11px; padding:3px 8px; font-weight:800; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">⏰ تنبيه: قدم طلب استئذان تأخير (${escapeHtml(de.reason_category || 'استئذان مسبق')})</span></div>` : '';
        })()}
    </div>
</td>
<td data-label="حضور اليوم" class="modal-col-check">
    <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; cursor:pointer; padding:7px 10px; border-radius:8px; background:${isAtt ? '#dcfce7' : '#f8fafc'}; border:1.5px solid ${isAtt ? '#10b981' : '#cbd5e1'}; font-weight:bold; color:${isAtt ? '#15803d' : '#334155'}; transition:0.2s;">
        <span style="font-size:12px;">👥 حضور الاجتماع</span>
        <input type="checkbox" ${isAtt ? 'checked' : ''} onchange="toggleManualModalAttendance('${m.id}', this.checked)" style="width:20px; height:20px; cursor:pointer; accent-color:#10b981;">
    </label>
</td>
<td data-label="التناول بالقداس" class="modal-col-check">
    <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; cursor:pointer; padding:7px 10px; border-radius:8px; background:${isCom ? '#e0f2fe' : '#f8fafc'}; border:1.5px solid ${isCom ? '#0284c7' : '#cbd5e1'}; font-weight:bold; color:${isCom ? '#0369a1' : '#64748b'}; opacity:${!isAtt ? '0.45' : '1'}; transition:0.2s;">
        <span style="font-size:12px;">🍞 تناول بالقداس (+10)</span>
        <input type="checkbox" ${isCom ? 'checked' : ''} ${!isAtt ? 'disabled' : ''} onchange="toggleSpiritualStatus('${m.id}', 'communion', this.checked)" style="width:20px; height:20px; cursor:pointer; accent-color:#0284c7;">
    </label>
</td>
<td data-label="مشاركة بالدرس" class="modal-col-check">
    <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; cursor:pointer; padding:7px 10px; border-radius:8px; background:${isPart ? '#fef3c7' : '#f8fafc'}; border:1.5px solid ${isPart ? '#f59e0b' : '#cbd5e1'}; font-weight:bold; color:${isPart ? '#b45309' : '#64748b'}; opacity:${!isAtt ? '0.45' : '1'}; transition:0.2s;">
        <span style="font-size:12px;">💡 تفاعل ومشاركة (+5)</span>
        <input type="checkbox" ${isPart ? 'checked' : ''} ${!isAtt ? 'disabled' : ''} onchange="toggleSpiritualStatus('${m.id}', 'participation', this.checked)" style="width:20px; height:20px; cursor:pointer; accent-color:#f59e0b;">
    </label>
</td>
`;

tbody.appendChild(tr);

});

}

function toggleManualModalAttendance(memberId, isChecked) {

let member = members.find(x => x.id.toString() === memberId.toString());

if (!member) return;

if (isChecked) atomicRegisterAttendance(member);

else cancelMemberAttendance(memberId, true);

renderAttendanceTable();

renderLiveCardsFeed();

renderMembersList();

renderDashboard();

renderManualAttendanceModalList();

checkLocalStorageUsage();

}

function selectAllManualAttendance(isSelectAll) {
    const searchBox = document.getElementById('manualModalSearchBox');
    const search = searchBox ? searchBox.value.toLowerCase().trim() : '';
    const filtered = members.filter(m => (m.name || '').toLowerCase().includes(search) || (m.code || '').toString().includes(search));
    
    filtered.forEach(m => {
        let isAtt = !!(attendanceRecord[activeSelectedDate] || []).some(a => a.id.toString() === m.id.toString());
        if (isSelectAll && !isAtt) {
            atomicRegisterAttendance(m);
        } else if (!isSelectAll && isAtt) {
            cancelMemberAttendance(m.id, true);
        }
    });

    renderAttendanceTable();
    renderLiveCardsFeed();
    renderMembersList();
    renderDashboard();
    renderManualAttendanceModalList();
    checkLocalStorageUsage();
    if (typeof showToast === 'function') {
        showToast(isSelectAll ? `✅ تم تحديد ${filtered.length} مخدوم كحاضرين` : `❌ تم إلغاء تحديد ${filtered.length} مخدوم (تسجيل غياب)`);
    }
}

function invertSelectionManualAttendance() {
    const searchBox = document.getElementById('manualModalSearchBox');
    const search = searchBox ? searchBox.value.toLowerCase().trim() : '';
    const filtered = members.filter(m => (m.name || '').toLowerCase().includes(search) || (m.code || '').toString().includes(search));
    
    filtered.forEach(m => {
        let isAtt = !!(attendanceRecord[activeSelectedDate] || []).some(a => a.id.toString() === m.id.toString());
        if (isAtt) {
            cancelMemberAttendance(m.id, true);
        } else {
            atomicRegisterAttendance(m);
        }
    });

    renderAttendanceTable();
    renderLiveCardsFeed();
    renderMembersList();
    renderDashboard();
    renderManualAttendanceModalList();
    checkLocalStorageUsage();
    if (typeof showToast === 'function') {
        showToast(`🔄 تم عكس حالة الحضور لـ ${filtered.length} مخدوم بنجاح`);
    }
}

// ==========================================

// Explicit Window Exports
if (typeof window !== 'undefined') {
  window.renderAttendanceTable = renderAttendanceTable;
  window.renderLiveCardsFeed = renderLiveCardsFeed;
  window.renderAttendanceCalendar = renderAttendanceCalendar;
  window.renderAttendanceHeatmap = renderAttendanceHeatmap;
  window.atomicRegisterAttendance = atomicRegisterAttendance;
  window.exportTodaySessionToWhatsApp = exportTodaySessionToWhatsApp;
  window.formatMatrixDateHeader = formatMatrixDateHeader;

  window.showKioskWelcome = showKioskWelcome;
  window.closeKioskWelcome = closeKioskWelcome;
  window.openAttendanceExportModal = openAttendanceExportModal;
  window.closeAttendanceExportModal = closeAttendanceExportModal;
  window.openManualAttendanceModal = openManualAttendanceModal;
  window.closeManualAttendanceModal = closeManualAttendanceModal;
  window.selectAllManualAttendance = selectAllManualAttendance;
  window.invertSelectionManualAttendance = invertSelectionManualAttendance;
  window.changeCalendarMonth = changeCalendarMonth;
  window.selectAttendanceDate = selectAttendanceDate;
  window.openEditAttendanceTimeModal = openEditAttendanceTimeModal;
  window.closeEditAttendanceTimeModal = closeEditAttendanceTimeModal;
  window.setModalTimePreset = setModalTimePreset;
  window.setModalTimeToNow = setModalTimeToNow;
  window.submitAttendanceTimeFromModal = submitAttendanceTimeFromModal;
  window.editAttendanceTime = editAttendanceTime;
  window.parseAnyTimeTo24h = parseAnyTimeTo24h;
  window.shiftStudentAttendanceDate = shiftStudentAttendanceDate;
  window.syncWithServantAttendanceDate = syncWithServantAttendanceDate;
  window.formatStudentArabicDate = formatStudentArabicDate;

}

// ==========================================
// 🚪 وظائف استيعاب وتسجيل مخدوم جديد على الباب (Quick Walk-in)
// ==========================================
function openQuickWalkinModal() {
    const modal = document.getElementById('quickWalkinModal');
    if (modal) {
        modal.style.display = 'flex';
        const nameInput = document.getElementById('walkin_name');
        if (nameInput) {
            nameInput.value = '';
            setTimeout(() => nameInput.focus(), 150);
        }
        const phoneInput = document.getElementById('walkin_phone');
        if (phoneInput) phoneInput.value = '';
        const confInput = document.getElementById('walkin_confessor');
        if (confInput) confInput.value = '';
    }
}

function closeQuickWalkinModal() {
    const modal = document.getElementById('quickWalkinModal');
    if (modal) modal.style.display = 'none';
}

function submitQuickWalkinMember() {
    const nameInput = document.getElementById('walkin_name');
    const phoneInput = document.getElementById('walkin_phone');
    const stageInput = document.getElementById('walkin_stage');
    const confInput = document.getElementById('walkin_confessor');

    const name = nameInput ? nameInput.value.trim() : '';
    let phone = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
    const stage = stageInput ? stageInput.value : 'سنة أولى';
    const confessor = confInput ? confInput.value.trim() : '';

    if (!name || name.length < 3) {
        if (typeof showToast === 'function') showToast('⚠️ يرجى إدخال اسم المخدوم بشكل صحيح', true);
        else alert('يرجى إدخال اسم المخدوم بشكل صحيح');
        return;
    }

    if (phone && phone.startsWith('0')) {
        phone = '2' + phone;
    } else if (phone && !phone.startsWith('20') && phone.length === 10) {
        phone = '20' + phone;
    }

    // توليد كود تلقائي جديد
    let maxCode = 100;
    if (Array.isArray(members)) {
        members.forEach(m => {
            const c = parseInt(m.code, 10);
            if (!isNaN(c) && c > maxCode && c < 5000) maxCode = c;
        });
    }
    const newCode = String(maxCode + 1);
    const newId = Date.now();

    const newMember = {
        id: newId,
        code: newCode,
        name: name,
        phone: phone,
        stage: stage,
        confessor: confessor,
        level: stage,
        created_at: new Date().toISOString()
    };

    if (!Array.isArray(members)) members = [];
    members.push(newMember);

    try {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
        if (typeof syncToCloud === 'function') syncToCloud('members', members);
    } catch(e) {
        console.warn('Error saving new walkin member:', e);
    }

    // تسجيل الحضور فوراً
    atomicRegisterAttendance(newMember);

    // تحديث القوائم والشاشات
    if (typeof renderMembersList === 'function') renderMembersList();
    if (typeof renderDashboard === 'function') renderDashboard();

    closeQuickWalkinModal();

    if (typeof showToast === 'function') {
        showToast(`🎉 تم إضافة المخدوم [${name}] وتسجيل حضوره بنجاح! 🚀`);
    } else {
        alert(`🎉 تم إضافة المخدوم [${name}] واحتساب حضوره فورياً بنجاح!`);
    }
}

if (typeof window !== 'undefined') {
  window.openQuickWalkinModal = openQuickWalkinModal;
  window.closeQuickWalkinModal = closeQuickWalkinModal;
  window.submitQuickWalkinMember = submitQuickWalkinMember;
}


function openAttendanceCalendarModal() {
    const modal = document.getElementById('modalAttendanceCalendar');
    if (!modal) return;
    modal.style.display = 'flex';
    renderAttendanceCalendar();
}

function closeAttendanceCalendarModal() {
    const modal = document.getElementById('modalAttendanceCalendar');
    if (modal) modal.style.display = 'none';
}
window.openAttendanceCalendarModal = openAttendanceCalendarModal;
window.closeAttendanceCalendarModal = closeAttendanceCalendarModal;
