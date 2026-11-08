# COMPLETE PROJECT INVENTORY & ARCHITECTURE MAP — KHEDMETY PLUS

## 1. System Overview
- **Application Name:** KHEDMETY PLUS (خدمتي برو)
- **Primary Domain:** Coptic Orthodox Church Service Management & Servant Preparation Course.
- **Repository Location:** `D:\StPaul_Service_System\03_Web_Khedmty_Plus`
- **Active Branch:** `audit/initial-fixes`
- **Primary Cloud Database:** Google Cloud Firestore (Project: `khedmety-plus`)
- **Backend Architecture:** Vercel Serverless Functions (`/api/*`) on Node.js.
- **Frontend Architecture:** Vanilla JavaScript, Mobile-First PWA, Right-to-Left (RTL) Arabic UI (`lang="ar" dir="rtl"`), Offline IndexedDB Cache.

---

## 2. Pages Inventory & Responsibilities (27 Active HTML Pages)

| Page | Role/Audience | Primary Responsibilities | Auth Required | Offline Support |
|---|---|---|---|---|
| `public/index.html` | Public / Gateway | Unified login portal for Servants (by name/code) and Students (by exam code/phone). Supports offline fallback. | No (Public) | Yes (Service Worker + Local Cache) |
| `public/servant-dashboard.html` | Servant & Admin | Core administration hub: Attendance tracking, Servant management, Master plan, Statistical radar, WhatsApp campaigns, Rollover. | Yes (`servant`, `admin`) | Yes (PWA + Offline Roster) |
| `public/servant_grades_entry.html` | Servant & Admin | Exam scores & interview marks entry, reality curve bell adjustment, formula weighting, Excel import/export. | Yes (`servant`, `admin`) | Yes (localStorage) |
| `public/servant_followup.html` | Servant & Admin | Spiritual and pastoral follow-up tracking for servant preparation disciples. | Yes (`servant`, `admin`) | Yes |
| `public/servant_spiritual_report.html` | Servant & Admin | Consolidated spiritual health and commitment analytics for servants. | Yes (`servant`, `admin`) | Yes |
| `public/servant_spiritual_note.html` | Servant & Admin | Servant personal spiritual journal with templated entries. | Yes (`servant`, `admin`) | Yes |
| `public/servant_journal.html` | Servant & Admin | Personal servant diary, reflections, and pastoral notes. | Yes (`servant`, `admin`) | Yes |
| `public/servant_help.html` | Servant & Admin | Interactive servant operational manual, permission hierarchy guide, FAQ. | Yes (`servant`, `admin`) | Yes |
| `public/servant_grades_guide.html` | Servant & Admin | Grading formulas reference, pass mark standards, simulation playground. | Yes (`servant`, `admin`) | Yes |
| `public/servant_quick_guide.html` | Servant & Admin | Concise cheat-sheet for servants on Friday meetings. | Yes (`servant`, `admin`) | Yes |
| `public/servant_migrate_attendance.html` | Admin | Data migration utility for importing historical attendance sheets. | Yes (`admin`) | Yes |
| `public/admin_subjects.html` | Admin | Curriculum management: Subject creation, semester assignment, pass rates. | Yes (`admin`) | Yes |
| `public/student.html` | Student / Disciple | Student portal: View personal attendance, grades, spiritual notes, daily reading plan. | Yes (`student`) | Yes |
| `public/student_attendance.html` | Student / Disciple | Personal historical attendance records and excuse submission. | Yes (`student`) | Yes |
| `public/student_help.html` | Student / Disciple | Help center and FAQ for disciples and students. | Yes (`student`) | Yes |
| `public/student_quick_guide.html` | Student / Disciple | Quick-start guide for disciples using the mobile PWA. | Yes (`student`) | Yes |
| `public/spiritual_note.html` | Student / Disciple | Daily spiritual note entry (prayer, fasting, Bible reading, confession). | Yes (`student`) | Yes |
| `public/bible.html` | Student & Servant | Complete Arabic Bible reader with dynamic yearly reading plan highlighter. | Yes (`student`, `servant`, `admin`) | Yes (Full offline text via `bible-data.js`) |
| `public/katamaros.html` | Student & Servant | Coptic Liturgical Katamaros readings (Vespers, Matins, Liturgy). | Yes | Partial (online readings) |
| `public/synaxarium.html` | Student & Servant | Daily Coptic Synaxarium saint biographies and commemorations. | Yes | Partial (online feed) |
| `public/quiz.html` | Student / Disciple | Interactive Bible and dogma competition quizzes with timer and score tracking. | Yes (`student`) | Yes |
| `public/results.html` | Student / Disciple | Official academic and interview result certificates. | Yes (`student`) | Yes |
| `public/harvest.html` | Student / Disciple | Spiritual harvest points and activity ledger. | Yes (`student`) | Yes |
| `public/sheet.html` | Student / Disciple | Academic worksheet questionnaire submission interface. | Yes (`student`) | Yes |
| `public/sheets_list.html` | Student / Disciple | Directory of available course worksheets and assignments. | Yes (`student`) | Yes |
| `public/barcode.html` | Servant & Admin | Printable student ID card generator with QR codes and batch export. | Yes (`servant`, `admin`) | Yes |
| `public/recover.html` | Public / Self-Service | Account access recovery and password reset request. | No | Yes |

---

## 3. Serverless API Layer (`api/`)

| Endpoint | Method | Required Auth | Purpose & Business Logic |
|---|---|---|---|
| `/api/login` | `POST` | Public | Authenticates credentials, checks brute-force rate limiter, issues Firebase Custom Token with claims (`role`, `code`, `perm`). |
| `/api/public-config` | `GET` | Public | Serves Firebase public web configuration (`apiKey`, `projectId`, `appId`). |
| `/api/health` | `GET` | Public | Connectivity probe for Firestore and runtime environment. |
| `/api/admin` | `POST` | `admin` JWT | Administrative operations: `add_subject`, `delete_member`, `delete_servant`, `delete_attendance_date`, `import_students`, `save_settings`, `create_servant_auth`, `get_sync_data`, `get_feedback`, `save_master_plan`, `update_servants_batch`. |
| `/api/get_subjects` | `GET` | `student` / `staff` | Retrieves curriculum subjects filtered by stage and semester. |
| `/api/harvest` | `GET`, `POST` | `student` / `staff` | Queries or logs spiritual activity points with student isolation checks. |
| `/api/mark_plan_read`| `POST` | `student` / `staff` | Records completed Bible reading chapters and calculates reading points. |
| `/api/spiritual_note`| `GET`, `POST` | `student` / `staff` | Fetches or saves daily spiritual diary entries with student isolation. |
| `/api/submit_sheet` | `POST` | `student` / `staff` | Submits answers for course study sheets and worksheets. |

---

## 4. Cloud Firestore Collections & Subcollections

| Collection / Path | Read Access | Write Access | Purpose |
|---|---|---|---|
| `students/{code}` | `isStaff() \|\| isMe(code)` | `isFull()` | Student profile records (name, phone, stage, level). |
| `students/{code}/daily_reading_logs/{id}` | `isStaff() \|\| isMe(code)` | `isMe(code) \|\| isFull()` | Daily Bible reading progress logs. |
| `students/{code}/daily_logs/{date}` | `isStaff() \|\| isMe(code)` | `isMe(code) \|\| isFull()` | Daily spiritual diary entries. |
| `students/{code}/sheet_submissions/{subId}`| `isStaff() \|\| isMe(code)` | `isMe(code) \|\| isFull()` | Submitted study sheet responses. |
| `students/{code}/feedback/{date}` | `isStaff() \|\| isMe(code)` | `isMe(code) \|\| isFull()` | Student Friday meeting ratings & feedback. |
| `students/{code}/quiz_achievements/{id}` | `isStaff() \|\| isMe(code)` | `isMe(code) \|\| isFull()` | Solo quiz completion scores *(Proposed rule in NEEDS_DECISION.md)*. |
| `members/{code}` | `isStaff() \|\| isMe(code)` | `isFull()` | Secondary member cohort collection. |
| `attendance/{YYYY-MM-DD}` | `signedIn()` | `isStaff()` | Friday meeting attendance records, times, excuse notes. |
| `servants_attendance/{YYYY-MM-DD}` | `isStaff()` | `isStaff()` | Servant meeting attendance logs. |
| `servants/{servantId}` | `isStaff()` | `isAdmin()` | Servant profiles, role permissions, contact info. |
| `subjects/{id}` | `signedIn()` | `isAdmin()` | Course study subjects and curriculum weights. |
| `config/settings` | `signedIn()` | `isStaff()` | General service configuration and year settings. |
| `config/master_plan` | `signedIn()` | `isStaff()` | Annual service calendar, lecture dates, speakers. |
| `settings/service_info` | `signedIn()` | `isAdmin()` | Service year name, start date, end date. |
| `audit_logs/{id}` | `isAdmin()` | `isStaff()` (create only) | Immutable administrative audit trails. |
| `active_sessions/{id}` | `isStaff()` | `signedIn()` | Real-time kiosk session tracking. |
| `error_logs/{id}` | `isAdmin()` | `signedIn()` (create only) | Frontend error and exception logs. |
| `feedback/{id}` | `isStaff()` | `signedIn()` (create only) | Collective student meeting feedback. |

---

## 5. Client JavaScript Modular Architecture

- **`public/auth-client.js`**: Core authentication client. Handles token storage, Firebase custom token exchange, session role decoding, logout, and simulation gating.
- **`public/js/firebase-config.js`**: Firebase Web SDK initialization, offline Firestore persistence setup (`synchronizeTabs: true`).
- **`public/js/app-updater.js`**: Instant PWA update engine, cache invalidation, unsaved form guard (`hasUnsavedInputs`).
- **`public/js/pwa-helper.js`**: Service Worker registration, network status monitoring, install prompt banner.
- **`public/js/khedmty-db.js`**: Local IndexedDB wrapper for offline storage resilience.
- **`public/js/khedmty-offline-sync.js`**: Offline write queue, exponential backoff sync, server acknowledgement verification.
- **`public/js/dashboard/dashboard-radar.js`**: Executive meeting pulse charts, absence radar, WhatsApp infographic snapshot engine.
- **`public/js/dashboard/dashboard-plan.js`**: Service master plan schedule, upcoming lecture alerts, birthday celebration fireworks.
- **`public/js/dashboard/dashboard-servants.js`**: Servant roster management, permissions assignment, cohort filtering.
- **`public/js/dashboard/dashboard-attendance.js`**: Friday attendance scanning, manual entry, delay calculations.
- **`public/js/dashboard/dashboard-members.js`**: Disciple roster, stage classification, contact updates.
- **`public/js/dashboard/dashboard-curriculum.js`**: Course lectures, exams schedule, curriculum distribution table.
- **`public/js/dashboard/dashboard-navigation.js`**: Tab switching, URL query state synchronization, back navigation.
- **`public/js/dashboard/dashboard-area-suggestions.js`**: Intelligent geographic grouping and pastoral visit clustering.
- **`public/js/dashboard/dashboard-feedback.js`**: Student feedback aggregation, sentiment indicators.
- **`public/js/dashboard/dashboard-incentives.js`**: Pastoral recognition, attendance streak calculations.

---

## 6. Feature Status Matrix

| Feature | Execution Path | Status | Verification Evidence |
|---|---|---|---|
| Student Login (Exam Code + Phone) | `api/login.js` -> `auth-client.js` | **COMPLETE AND VERIFIED** | Tested in `test_phase1_security.js` |
| Servant Login (Name + Password) | `api/login.js` -> `auth-client.js` | **COMPLETE AND VERIFIED** | Tested in `test_phase1_security.js` |
| Meeting Pulse WhatsApp Infographic | `dashboard-radar.js` -> `html2canvas` -> Baileys Bot | **COMPLETE AND VERIFIED** | Tested in `test_birthday_and_radar.js` |
| Birthday Celebration & Fireworks | `dashboard-plan.js` -> `servant-dashboard.html` | **COMPLETE AND VERIFIED** | Tested in `test_birthday_and_radar.js` |
| Offline Attendance Storage | `khedmty-db.js` -> IndexedDB | **COMPLETE AND VERIFIED** | Tested in `tests/test_offline_login_and_attendance.js` |
| Background PWA Caching | `public/sw.js` (v7.0) | **COMPLETE AND VERIFIED** | Tested in `test_ui_pwa.js` |
| Offline Sync Queue | `khedmty-offline-sync.js` | **COMPLETE AND VERIFIED** | Tested in `tests/test_offline_and_sync_engine.js` |
| Bible Reader (Full Offline) | `bible.html` + `bible-data.js` | **COMPLETE AND VERIFIED** | Tested in `test_phase1_security.js` |
| Dynamic Bible Plan Tracking | `bible_plan.js` + `api/mark_plan_read.js` | **COMPLETE AND VERIFIED** | Tested in `tests/test_granular_chapter_tracking.js` |
| Student Grades Storage | `servant_grades_entry.html` (localStorage only) | **PARTIALLY IMPLEMENTED** | Documented in `NEEDS_DECISION.md` (Awaiting approval to move to Firestore) |
| Quiz Solo Achievements Cloud Save | `quiz.html` -> Firestore `quiz_achievements` | **BLOCKED** | Firestore rules lack collection rule; blocked pending Firebase emulator verification |
| Barcode Badge Printing | `barcode.html` -> `html5-qrcode` / print | **COMPLETE AND VERIFIED** | Tested in `tests/simulate_real_user_journeys.js` |
