# CHANGELOG — KHIDMETY PRO

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-10-31
### Added
- Created `AGENTS.md` specifying permanent architecture, security, coding, testing, and UX rules.
- Established `AI_DEVELOPMENT/` governance framework (`MASTER_PLAN.md`, `TASK_QUEUE.md`, `PROGRESS.md`, `DECISIONS.md`, `TEST_RESULTS.md`, `CHANGELOG.md`, `NEXT_ACTION.md`, `QUALITY_GATES.md`, `RISK_REGISTER.md`, `PROMPT_HISTORY.md`, `FINAL_REPORT.md`).
- Tagged `v-pre-autonomous-goal` and created git checkpoint branch `checkpoint/pre-autonomous-goal`.
- Created full local backup in `D:\StPaul_Service_System\_Backups\03_Web_Khedmty_Plus_PreGoal_20261031`.

## [1.0.0-PRO] - 2026-10-31
### Security Hardening
- Enhanced `api/login.js`: Upgraded `timingSafeCompare` to utilize fixed 32-byte SHA-256 hashes before `crypto.timingSafeEqual`, preventing length-based timing leaks.
- Implemented sliding-window in-memory rate limiting in `api/login.js` (maximum 5 failed attempts within 5 minutes per IP/client blocks brute-force guessing with HTTP 429).
- Hardened `firestore.rules`: Authored granular rules for 11 subpaths including `servants_attendance`, `active_sessions`, `audit_logs`, `error_logs`, `auto_backups`, `archive`, and `version_history`.

### Firestore & Offline Optimization
- Populated `firestore.indexes.json` with 7 composite indexes to accelerate queries on `subjects`, `members`, `students`, `feedback`, and `audit_logs`.
- Enhanced `public/auth-client.js`: Added centralized listener registry (`registerListener`, `unsubscribeAllListeners`) and unbinding during user logout and page unload.
- Added `initKhedmtyFirestore()` in `public/js/firebase-config.js` to enforce offline persistence with multi-tab synchronization (`db.enablePersistence({ synchronizeTabs: true })`).
- Updated `public/sw.js` to precache `quiz.html` for offline quiz taking.

### Bug Fixes & UX Remediation
- Repaired latent quote unescaping error in `public/servant_grades_guide.html` table rendering template.
- Connected `quiz.html` with Firebase and `auth-client.js` to record student quiz achievements and dynamic portal navigation.
- Fixed missing listener closure parens in `public/servant-dashboard.html`.

### Automated Testing
- Created `tests/test_phase2_security_hardening.js` (6/6 passing).
- Created `tests/test_full_platform_syntax_and_ui.js` validating all 26 HTML pages (78/78 passing).
- Integrated both into `run_all_suites.js` bringing total regression suites to 20/20 (100% pass rate).

## [1.1.0-DECLUTTER] - 2026-10-31
### UI Declutter & Architecture Reorganization (servant-dashboard.html)
- **Pre-modification Backup**: Created verified backup at `public/servant-dashboard.html.backup_declutter_20261031` and `D:\StPaul_Service_System\_Backups\servant-dashboard.html.pre_declutter`.
- **Zen Mode (الوضع الهادئ 🌿)**: Added `#btnZenToggle` in the dashboard header with `toggleZenMode()` to cleanly hide emergency code bars and noisy technical telemetry (`.zen-hide`), remembered in `localStorage`.
- **Settings Sub-Pills**: Deconstructed the 600+ lines in `settingsTab` into 4 segmented tab pills:
  1. `[ ⚙️ إعدادات الخدمة والمواعيد ]` (`#setSection_general`)
  2. `[ 🎁 محرك التحفيز والبونص ]` (`#setSection_incentives`)
  3. `[ 🧹 تهيئة السنة والوضع التجريبي ]` (`#setSection_reset`)
  4. `[ ☁️ سحابة Firebase والأجهزة ]` (`#setSection_cloud`)
- **Radar Collapsible Sections**: Added interactive chevron toggles (`toggleRadarCard`) to radar cards for pulse, absence alerts, excuses, and birthdays.
- **Fast-Discovery Tables**: Collapsed the add forms in `membersTab` and `servantsTab` into clean expandable drawers so the search filters and student/servant rosters appear instantly without scrolling.
- **Navigation Groups Mapping**: Updated `public/js/dashboard/dashboard-navigation.js` to correctly route `radarTab`, `feedbackTab`, `cloudUsageTab`, and `smartPrepTab` into the top group navigation bar.
- **Regression Quality**: All 21 test suites passed with 100% success rate (588/588 user event handlers verified).

## [1.2.0-COMPACT-UX] - 2026-10-31
### Information Hierarchy & Compact Prioritization (servant-dashboard.html)
- **Pre-modification Backup**: Created verified backup at `public/servant-dashboard.html.backup_compact_ux_20261031` and `D:\StPaul_Service_System\_Backups\servant-dashboard.html.pre_compact_ux`.
- **Above-The-Fold Core Statistics**: Reordered `dashTab` to place live vital KPI cards (Students total, Today's attendance, Communion count, Percentage, Servants count & attendance) at the very top of the screen, eliminating the need to scroll down to view basic data.
- **Compact Promotional & Alert Banners**: Streamlined the oversized Smart Prep card into a horizontal compact ribbon and grouped upcoming plan and birthday notifications into a responsive side-by-side grid.
- **Bounded Absence List Scroll**: Styled `#absentAlertList` with a fixed `max-height: 160px; overflow-y: auto;` so lists of 40+ absent students remain contained in a neat scrollable card without stretching the page vertically.
- **Radar Segmented Switcher (Pill Navigation)**: Partitioned `radarTab` into 6 segmented sections (`[ ⚠️ الغياب والافتقاد ]`, `[ 🔔 الاعتذارات الواردة ]`, `[ 📈 نبض الحضور ]`, `[ 🕊️ مهلة الاعتراف ]`, `[ 🎂 أعياد الميلاد ]`, `[ 🛡️ الأمان والباسوردات ]`, `[ 🌐 عرض الكل ]`), reducing a 3000px scroll into a compact, single-screen view.
- **Compact Navigation Bar**: Tightened margins and chip padding on `.grp-bar` and `.tabs`, reclaiming ~60px of vertical viewport height.
- **Session-Persistent Dismissal**: Enhanced `hideBackupReminder()` to persist dismissal in `sessionStorage`, keeping the top of the viewport free of persistent yellow banners during active sessions.
- **Quality Gates**: All 21 test suites passed (100%), and 554 servant event handlers verified without errors.

## [1.3.0-LITURGICAL-POLISH] - 2026-10-31
### One-Click Group Navigation & Liturgical Design Polish
- **Full Project Pre-modification Backup**: Created verified snapshot at `D:\StPaul_Service_System\_Backups\03_Web_Khedmty_Plus_PreDesignPolish_20261031` (242 files, 26 MB, Robocopy Exit Code 1 / Success).
- **One-Click Group Auto Switch (`public/js/dashboard/dashboard-navigation.js`)**:
  - Eliminated the double-click barrier: Clicking any top group chip (`.grp-chip`) now automatically activates the first visible tab content of that group via `window.switchTab(firstTabId, firstBtn)`.
  - Immediate view transitions:
    * "🏠 الرئيسية" -> Opens Overview Dashboard (`dashTab`)
    * "📷 الحضور" -> Opens Attendance Matrix (`attendanceTab`)
    * "👥 المخدومون" -> Opens Member Directory (`membersTab`)
    * "🎓 الدراسة" -> Opens Subject Catalog (`coursesTab`)
    * "🕊️ الروحيات" -> Opens Spiritual Oasis Hub (`reflectionsTab`)
    * "⚙️ الإدارة" -> Opens Administrative Settings (`settingsTab`)
- **Spiritual Oasis Hub (`#reflectionsTab` in `public/servant-dashboard.html`)**:
  - Built an embedded spiritual oasis directly in the dashboard featuring a royal navy and gold banner.
  - Houses 5 luxury cards linking to:
    * `servant_spiritual_note.html` (نوتة الخادم الروحية)
    * `servant_journal.html` (مفكرة الخادم الشخصية)
    * `bible.html` (قارئ الكتاب المقدس)
    * `katamaros.html` (القطمارس الكنسي اليومي)
    * `synaxarium.html` (السنكسار وسير الآباء والشهداء)
- **Elevated Grades Studio (`servant_grades_entry.html`)**:
  - Direct prominent entry tab added to the "Study / الدراسة 🎓" group in `servant-dashboard.html`, allowing admission & ministry readiness grades entry with zero searching.
- **Royal Liturgical Design System & Color Harmony**:
  - Refined color palette with Coptic church liturgical hues: Deep Royal Navy (`#0f2744`), Indigo Blue (`#1e3a8a`), Warm Liturgical Gold (`#c59b27`), Emerald (`#059669`).
  - Styled `.grp-chip` with clean white elevation cards, gold accent border on hover, and active gradient (`linear-gradient(135deg, #0f2744 0%, #1e3a8a 100%)`).
  - Harmonized `.stat-card`, `.tabs`, and `.tab-btn` with clean borders, micro-interactions, and visual depth.
- **Strict Non-Destructive Integrity**:
  - 100% feature preservation: Zero functions, tabs, buttons, or database paths were deleted or modified destructively.
- **Quality Gates**:
  - Full test suite passed: **21/21 suites (100%)**.
  - Event simulation verified: **605 user event handlers (555 servant + 50 student)** across the entire platform with 0 ReferenceErrors.
