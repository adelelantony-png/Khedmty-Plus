# Servant Dashboard Attendance UX Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UX of the servant dashboard page (`/servant-dashboard`, attendance tab "الحضور") in `public/servant-dashboard.html` and supporting dashboard JS/CSS modules into a modern, compact, accessible, mobile-first Arabic RTL interface without changing any business logic, data models, or Firebase/offline sync.

**Architecture:** Client-side PWA architecture with vanilla HTML/JS/CSS, modularized in `public/js/dashboard/` and `public/css/app-theme.css`, served cleanly via Vercel (`cleanUrls: true, outputDirectory: "public"`). Refactor preserves all existing global function stubs, element IDs required by test suites, and Firebase/IndexedDB sync operations while updating layout, component hierarchy, visual tokens, and responsive presentation.

**Tech Stack:** Vanilla JS (ES6+), HTML5, CSS3 with CSS variables & logical properties, Lucide / FontAwesome icons, Tailwind/custom responsive utilities, Vercel Serverless / Static Hosting.

**Spec:** Direct requirements in User Request:
1. Compact header (max ~72px desktop, ~56px mobile; RTL start logo+church, RTL end quick tools, notif bell, cloud dot, avatar dropdown; dismissible PWA banner).
2. Sticky navigation & mobile bottom navigation bar (<768px); segmented sub-tabs for attendance.
3. Compact date bar with Arabic long format ("الجمعة، ١٣ نوفمبر ٢٠٢٦") and Arabic-Indic numerals; previous/next/today + overflow menu; yellow past-date notice.
4. Primary check-in area: large autofocus search with live autocomplete; single camera button; secondary walk-in button; collapsible manual list header.
5. Stat chips row (total, on-time, late, severe late, communion, participation) with filter-on-click; toolbar with Excel export; admin-only delete confirmation dialog in overflow menu.
6. Modern attendance table: toolbar with filters/sort; sticky header; combined name+stage column; pill status; label-less toggles; row "⋯" menu with 5-second undo toast; mobile card layout (<768px).
7. Cohesive visual system: navy primary, gold accent, semantic status colors; eliminate purple/teal; standard card styles (8px grid); floating "?" button repositioned.
8. Accessibility (aria-labels, focus rings, WCAG AA, RTL logical properties, 360px/768px/1280px responsiveness with no horizontal overflow, loading skeletons, empty state).

---

## Global Constraints
- Database Exclusivity: Cloud Firestore and local persistence (`localStorage`, `KhedmtyDB`, `KhedmtyOfflineSync`) must remain strictly intact.
- Zero Business Logic Mutation: Do not alter scoring formulas, delay thresholds, attendance deduplication keys, or sync logic.
- Backward Compatibility: Keep all existing IDs and globals asserted by automated test suites (`test_batch_a1.js`, `test_servant_open_date_attendance.js`, `test_attendance_time_editor.js`, `test_ui_pwa.js`, etc.).
- Language & Direction: Arabic-only UI (`ar-EG`), strict Right-to-Left (`dir="rtl"`), and Arabic-Indic digits for all displayed dates, times, codes, counts, and points.
- 100% Automated Test Pass Rate: All 35 existing suites plus newly created verification suites must pass before deployment.

---

## Review Focus
1. Input with leading/trailing spaces or Arabic-Indic digits in the autocomplete search box: must cleanly match names or codes regardless of digit type (Eastern vs. Western Arabic).
2. Re-registering an already-checked-in member from autocomplete or Enter key: must trigger duplicate warning toast "مسجّل بالفعل" without creating a duplicate record or corrupting state.
3. Undoing attendance cancellation within 5 seconds: must cleanly restore the record locally, re-render feeds, and cancel any pending deletion timer.
4. Viewport resizing to 360px: app bar, date row, check-in controls, stat chips, and mobile attendance cards must fit cleanly with zero horizontal window scroll.
5. Date picker interaction: changing the date must update the Arabic long display, toggle the past-date alert banner, and load records for that date seamlessly.

---

### Task 1: Visual Design Tokens, CSS Variables & Shared Formatting Utilities

**Files:**
- Modify: `public/css/app-theme.css`
- Modify: `public/js/dashboard/dashboard-attendance.js`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Produces:
  - Global CSS variables: `--k-primary: #071A38`, `--k-primary-dark: #051329`, `--k-accent: #D4AF37`, `--k-accent-hover: #B8860B`, `--k-success: #059669`, `--k-warning: #D97706`, `--k-danger: #DC2626`, `--k-card-radius: 12px`, `--k-spacing-unit: 8px`.
  - JS utilities: `window.toArabicIndic(numStr)`, `window.formatArabicLongDate(dateStr)`.

- [ ] **Step 1: Write the failing test for visual tokens and formatting utils**
```javascript
// in tests/test_servant_attendance_ux.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '../public/css/app-theme.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js'), 'utf8');

assert.ok(js.includes('function toArabicIndic'), 'toArabicIndic must be defined');
assert.ok(js.includes('function formatArabicLongDate'), 'formatArabicLongDate must be defined');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL with missing functions.

- [ ] **Step 3: Implement design tokens and formatting utilities**
1. In `public/css/app-theme.css`, harmonize `:root` variables to the standard navy/gold and semantic tokens, removing stray purple/teal styling rules.
2. In `public/js/dashboard/dashboard-attendance.js`, implement `toArabicIndic(str)` converting 0-9 to ٠-٩, and `formatArabicLongDate(dateStr)` using Arabic-Indic numbering for day and year with full Arabic weekday and month names.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/css/app-theme.css public/js/dashboard/dashboard-attendance.js tests/test_servant_attendance_ux.js
git commit -m "feat(ux): add design tokens and Arabic-Indic formatting utils"
```

---

### Task 2: Compact Top App Bar & Dismissible PWA Banner

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/css/app-theme.css`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Consumes: `openMyServantProfileModal()`, `toggleQuickToolsMenu()`, `GentleReminders.openNotificationsModal()`, `ThemeManager.openThemePicker()`, `logout()`.
- Produces: Compact top bar element `#compactTopAppBar` (max 72px desktop, 56px mobile), dismissible `#pwaInstallBanner`.

- [ ] **Step 1: Write test for compact app bar and PWA banner structure**
```javascript
// in tests/test_servant_attendance_ux.js
const html = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
assert.ok(html.includes('id="compactTopAppBar"'), 'Must contain compactTopAppBar');
assert.ok(html.includes('id="btnUserAvatarDropdown"'), 'Must contain user avatar dropdown button');
assert.ok(html.includes('id="userAvatarDropdownMenu"'), 'Must contain user avatar dropdown menu');
assert.ok(html.includes('id="btnQuickToolsIcon"'), 'Must contain quick tools icon button in app bar');
assert.ok(html.includes('dismissPwaBanner()'), 'Must contain dismissible PWA banner logic');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement compact app bar and dismissible PWA banner**
1. In `public/servant-dashboard.html`, replace `.app-hero-banner` and `.role-bar` with `#compactTopAppBar`.
2. Right side (RTL start): Small logo (36px) + "كنيسة الملاك والروماني بالمطرية" (single line); desktop-only verse "«أعدّوا لخدمة الرب بكل قلبكم» (كولوسي 3: 23)"; mobile hides subtitle and verse.
3. Left side (RTL end):
   - Quick tools icon button (⚡) opening `#quickToolsDropdownMenu`.
   - Notifications bell button with badge (`#khedmty-servant-notif-badge`).
   - Cloud sync indicator dot (`#cloudIndicator`) with tooltip ("متصل سحابياً").
   - Avatar button opening `#userAvatarDropdownMenu` containing username, role badge (`#currentRoleBadge`), profile, spiritual tools, theme picker, app update container (`#appUpdateContainer`), and red-text logout (`logout()`).
4. Convert `#pwaInstallBanner` into a slim dismissible banner with close button (✕); persist dismissal in `localStorage.setItem('khedmety_pwa_dismissed', '1')` wrapped in try/catch; hide if standalone.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/servant-dashboard.html public/css/app-theme.css tests/test_servant_attendance_ux.js
git commit -m "feat(ux): implement compact top app bar and dismissible PWA banner"
```

---

### Task 3: Sticky Navigation, Mobile Bottom Nav & Segmented Sub-Tabs

**Files:**
- Modify: `public/js/dashboard/dashboard-navigation.js`
- Modify: `public/css/app-theme.css`
- Modify: `public/servant-dashboard.html`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Produces: Sticky `.grp-bar` on desktop; fixed bottom nav on mobile (<768px); segmented control styling for sub-tabs in `attendanceTab`; relocated `.help-fab`.

- [ ] **Step 1: Write test for sticky nav, mobile bottom bar, and segmented control**
```javascript
// in tests/test_servant_attendance_ux.js
const css = fs.readFileSync(path.join(__dirname, '../public/css/app-theme.css'), 'utf8');
const navJs = fs.readFileSync(path.join(__dirname, '../public/js/dashboard/dashboard-navigation.js'), 'utf8');
assert.ok(css.includes('sticky-nav') || css.includes('.grp-bar'), 'CSS must style grp-bar navigation');
assert.ok(css.includes('@media (max-width: 767px)'), 'CSS must include mobile breakpoint rules');
assert.ok(css.includes('attendance-segmented-control') || css.includes('segmented-control'), 'Must style segmented sub-tabs');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement sticky desktop navigation, mobile bottom navigation, and segmented sub-tabs**
1. In `public/css/app-theme.css`:
   - Style `.grp-bar` as sticky under app bar on desktop (`position: sticky; top: 72px; z-index: 90`).
   - On mobile (`@media (max-width: 767px)`), fix `.grp-bar` at the screen bottom (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;`) with flex column icon + short label and safe-area padding.
   - Reposition `.help-fab` to bottom-left with `bottom: 74px` on mobile so it never overlaps the bottom nav or content.
   - Add `.attendance-segmented-control` styling (iOS-style background pill with smooth active indicator).
2. In `public/servant-dashboard.html`, wrap the attendance sub-tab buttons (`تسجيل الحضور 📷` and `سجل الخدام 📋`) inside a clean segmented control bar directly under the attendance page title.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/js/dashboard/dashboard-navigation.js public/css/app-theme.css public/servant-dashboard.html tests/test_servant_attendance_ux.js
git commit -m "feat(ux): add sticky desktop nav, mobile bottom nav, and segmented sub-tabs"
```

---

### Task 4: Compact Date Bar, Unified Arabic Formatting & Past Date Notice

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/js/dashboard/dashboard-attendance.js`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Preserves: `studentAttendanceDatePicker`, `studentAttendanceSelectedDateLabel`, `shiftStudentAttendanceDate(-7)`, `shiftStudentAttendanceDate(7)`, `syncWithServantAttendanceDate()`, `openAttendanceCalendarModal()`.
- Produces: Compact date row with overflow menu button `#studentDateOverflowBtn`, past-date warning banner `#pastDateNotice`.

- [ ] **Step 1: Write test for compact date bar and past-date banner**
```javascript
// in tests/test_servant_attendance_ux.js
const html = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
assert.ok(html.includes('id="pastDateNotice"'), 'Must contain pastDateNotice banner');
assert.ok(html.includes('id="studentDateOverflowBtn"'), 'Must contain date overflow menu button');
assert.ok(html.includes('shiftStudentAttendanceDate(-7)'), 'Must preserve shiftStudentAttendanceDate(-7)');
assert.ok(html.includes('shiftStudentAttendanceDate(7)'), 'Must preserve shiftStudentAttendanceDate(7)');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement compact date bar and past-date notice**
1. In `public/servant-dashboard.html`, refactor the date bar into a single compact row:
   `[◀ السابقة]` `[date display — clicking triggers date picker]` `[التالية ▶]` `[اليوم]` and an overflow `⋯` dropdown holding "نفس يوم الخدام" and "بانوراما الشهر والأرشيف".
2. Add yellow notice banner `#pastDateNotice` styled with `background: #fef3c7; border: 1.5px solid #f59e0b; color: #92400e; border-radius: 8px; padding: 8px 14px; margin-bottom: 12px; font-weight: 800; font-size: 0.85rem; display: none;`.
3. In `public/js/dashboard/dashboard-attendance.js`:
   - Update `selectAttendanceDate` and `renderAttendanceTable` to format the date with `formatArabicLongDate(activeSelectedDate)`.
   - Toggle `#pastDateNotice`: if `activeSelectedDate !== today`, display "⚠️ أنت تعرض/تسجل ليوم سابق (الجمعة، ...)"; if today, hide it.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/servant-dashboard.html public/js/dashboard/dashboard-attendance.js tests/test_servant_attendance_ux.js
git commit -m "feat(ux): implement compact date bar, Arabic date formatting, and past-date notice"
```

---

### Task 5: Check-in Area Primary Action Reorder & Smart Autocomplete

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/js/dashboard/dashboard-attendance.js`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Preserves: `manualAttendInput`, `manualMarkMemberFromInput()`, `openFastScannerModal()`, `openQuickWalkinModal()`, `openManualAttendanceModal()`.
- Produces: Live autocomplete container `#manualAttendAutocomplete`, single camera launch button, collapsible section header `#manualAttendanceCollapsibleHeader`.

- [ ] **Step 1: Write test for check-in area reordering and autocomplete**
```javascript
// in tests/test_servant_attendance_ux.js
const html = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js'), 'utf8');
assert.ok(html.includes('id="manualAttendAutocomplete"'), 'Must contain manualAttendAutocomplete container');
assert.ok(html.includes('id="btnSingleCameraScan"'), 'Must contain single camera button');
assert.ok(!html.includes('تسجيل فوري بدون أي تأخير، تظهر فيه الأسماء مباشرة'), 'Marketing text block must be removed');
assert.ok(js.includes('function handleManualAttendSearch'), 'Must have handleManualAttendSearch');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement check-in area reorder, autocomplete, and clean scanner modal**
1. In `public/servant-dashboard.html`:
   - Primary action row: Big search input `#manualAttendInput` with `autofocus`, live dropdown `#manualAttendAutocomplete`.
   - Right next to it: ONE camera button `#btnSingleCameraScan` ("📷 مسح بالكاميرا") calling `openFastScannerModal()`. Remove duplicate buttons and marketing paragraph.
   - Place `#cameraSelectionDropdown` inside `#fastScannerModal` so it is only visible when the camera opens.
   - Walk-in secondary outline button `+ مخدوم جديد (Walk-in)`.
   - "تسجيل حضور يدوي من قائمة الأسماء" becomes a collapsible card header `#manualAttendanceCollapsibleHeader` with chevron icon.
2. In `public/js/dashboard/dashboard-attendance.js`:
   - Implement `handleManualAttendSearch(query)` filtering `members` by name or code; render matching items with name, code, stage, and "مسجّل" pill if already attended.
   - On click or Enter, register member, show success toast with name + time, or duplicate toast "مسجّل بالفعل", clear input, maintain focus on `#manualAttendInput`.
   - Update `renderLiveCardsFeed()` in `fastScannerModal` to slice the last 5 records (`todayList.slice(0, 5)`).

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/servant-dashboard.html public/js/dashboard/dashboard-attendance.js tests/test_servant_attendance_ux.js
git commit -m "feat(ux): reorder check-in area, add autocomplete, and streamline scanner"
```

---

### Task 6: Stat Chips & Table Toolbar Actions

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/js/dashboard/dashboard-attendance.js`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Preserves: `todayAttendanceCount`, `openAttendanceExportModal()`, `clearEntireTodayAttendance()`.
- Produces: Stat chips container `#attendanceStatChips`, filter state `activeAttendanceFilter`, delete confirmation modal `#modalConfirmDeleteDay`.

- [ ] **Step 1: Write test for stat chips and table toolbar actions**
```javascript
// in tests/test_servant_attendance_ux.js
const html = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js'), 'utf8');
assert.ok(html.includes('id="attendanceStatChips"'), 'Must contain attendanceStatChips row');
assert.ok(html.includes('id="btnAttendanceExportExcel"'), 'Must contain Excel export button in toolbar');
assert.ok(html.includes('id="btnAttendanceToolbarOverflow"'), 'Must contain toolbar overflow menu');
assert.ok(js.includes('function filterAttendanceByChip'), 'Must contain filterAttendanceByChip');
assert.ok(js.includes('function promptDeleteEntireAttendance'), 'Must contain promptDeleteEntireAttendance');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement stat chips and toolbar overflow menu**
1. In `public/servant-dashboard.html`:
   - Replace "العدد: 71" with `#attendanceStatChips` holding clickable chips: إجمالي الحضور (`#todayAttendanceCount`), في الموعد, متأخر, تأخير شديد, تناول 🕊️, مشاركة 💡.
   - Add table toolbar with search box, filters for stage, status, recorder, sort selector, secondary button "تصدير Excel" (`#btnAttendanceExportExcel`), and toolbar overflow `⋯` (`#btnAttendanceToolbarOverflow`) holding red "حذف كشف هذا اليوم بالكامل" (admin-only).
2. In `public/js/dashboard/dashboard-attendance.js`:
   - Implement `filterAttendanceByChip(chipType)` updating the active filter and triggering filtered table render.
   - Implement `promptDeleteEntireAttendance()` opening confirmation dialog where admin must type the active date or "حذف" before calling `clearEntireTodayAttendance()`.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/servant-dashboard.html public/js/dashboard/dashboard-attendance.js tests/test_servant_attendance_ux.js
git commit -m "feat(ux): add stat chips filtering, table toolbar, and safe delete confirmation"
```

---

### Task 7: Attendance Table Refactor, Sticky Header & Mobile Cards

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/js/dashboard/dashboard-attendance.js`
- Modify: `public/css/app-theme.css`
- Test: `tests/test_servant_attendance_ux.js`

**Interfaces:**
- Preserves: `toggleSpiritualStatus(memberId, type, checked)`, `editAttendanceTime(memberId)`.
- Produces: Merged name+stage column, status pills, label-less checkboxes, row action menu with 5-second undo toast, empty state `#attendanceEmptyState`, mobile card rendering.

- [ ] **Step 1: Write test for table refactor, status pills, and mobile cards**
```javascript
// in tests/test_servant_attendance_ux.js
const js = fs.readFileSync(path.join(__dirname, '../public/js/dashboard/dashboard-attendance.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../public/css/app-theme.css'), 'utf8');
assert.ok(js.includes('function cancelAttendanceWithUndo'), 'Must contain cancelAttendanceWithUndo');
assert.ok(js.includes('function editAttendancePoints'), 'Must contain editAttendancePoints');
assert.ok(css.includes('.attendance-card-mobile') || css.includes('.adaptive-card-table'), 'Must include mobile card styling');
assert.ok(js.includes('لا يوجد حضور مسجل لهذا اليوم بعد'), 'Must include empty state message');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: FAIL.

- [ ] **Step 3: Implement table refactor, row menu with undo toast, and mobile cards**
1. In `public/js/dashboard/dashboard-attendance.js`:
   - Refactor `renderAttendanceTable()`:
     - Header columns: الكود | الاسم | الوقت | الحالة | تناول 🕊️ | مشاركة 💡 | النقاط ⭐ | المسجِّل | ⋯
     - Combine stage as small grey subtext under name: `<div class="fw-bold">${escapeHtml(a.name)}</div><div class="text-muted fs-xs">${escapeHtml(a.stage || '-')}</div>`.
     - Status pills: حاضر (green pill), متأخر (amber pill), تأخير شديد (red pill).
     - Label-less checkboxes for communion and participation with instant save and subtle check animation.
     - Replace per-row red delete and edit buttons with a single "⋯" row dropdown menu: تعديل الوقت (`editAttendanceTime`), تعديل النقاط (`editAttendancePoints`), إلغاء الحضور (`cancelAttendanceWithUndo`).
     - `cancelAttendanceWithUndo`: removes row immediately, shows 5-second toast "تم إلغاء حضور [الاسم] [تراجع ↩️]". Clicking "تراجع" restores the record; otherwise finalizes deletion after 5 seconds.
     - Sticky table header (`thead th`).
     - Empty state when list is empty: "لا يوجد حضور مسجل لهذا اليوم بعد" with a button to focus `#manualAttendInput`.
     - Pagination controls if `list.length > 100`.
2. In `public/css/app-theme.css`:
   - Add mobile card layout for `#attendanceTable` on screens `< 768px`: display cards with name+code on top, status pill+time, toggles for communion/participation, points, and ⋯ menu. Zero horizontal table scrolling.

- [ ] **Step 4: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add public/servant-dashboard.html public/js/dashboard/dashboard-attendance.js public/css/app-theme.css tests/test_servant_attendance_ux.js
git commit -m "feat(ux): refactor attendance table with status pills, row menu with undo toast, and mobile cards"
```

---

### Task 8: Accessibility, RTL Polish, Lucide Integration, Full Regression & Vercel Preview

**Files:**
- Modify: `public/servant-dashboard.html`
- Modify: `public/css/app-theme.css`
- Run: `run_all_suites.js`
- Deploy: Vercel preview deployment

**Interfaces:**
- Produces: WCAG AA color contrast, visible focus rings (`:focus-visible`), aria-labels on icon buttons, zero horizontal overflow across 360px, 768px, and 1280px widths, 100% test pass rate across all 36 test suites, and Vercel preview URL.

- [ ] **Step 1: Write accessibility and RTL audit test**
```javascript
// in tests/test_servant_attendance_ux.js
const html = fs.readFileSync(path.join(__dirname, '../public/servant-dashboard.html'), 'utf8');
const iconButtons = html.match(/<button[^>]*class="[^"]*(?:icon-btn|btn-mini|btn-round)[^"]*"[^>]*>/g) || [];
iconButtons.forEach(btn => {
    if (!btn.includes('aria-label') && !btn.includes('title')) {
        assert.fail(`Button missing accessibility label: ${btn}`);
    }
});
```

- [ ] **Step 2: Run test to verify it passes**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" tests/test_servant_attendance_ux.js`
Expected: PASS.

- [ ] **Step 3: Run full regression test suite (all 35 suites + new suite)**
Run: `Set-Location "D:\StPaul_Service_System\03_Web_Khedmty_Plus"; & "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\node.exe" run_all_suites.js`
Expected: 100% PASS across all suites.

- [ ] **Step 4: Commit all changes**
```bash
git add .
git commit -m "refactor(ux): complete servant dashboard attendance UX overhaul"
```

- [ ] **Step 5: Deploy to Vercel preview**
Run: `& "d:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node\npx.cmd" vercel` (preview deployment, not `--prod`).
Capture output and preview URL.
