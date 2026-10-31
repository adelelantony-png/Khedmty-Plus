# AGENTS.md — KHIDMETY PRO (خدمتي برو)

## 1. Project Identity & Architecture
- **Project Name:** KHIDMETY PRO (خدمتي برو)
- **Primary Domain:** Comprehensive Coptic Orthodox Church Service & Servant Preparation Management Platform.
- **Repository Location:** `D:\StPaul_Service_System\03_Web_Khedmty_Plus`
- **Core Technology Stack:**
  - **Database:** Firebase Cloud Firestore is the **ONLY** application database. No alternative database engines (no MySQL, PostgreSQL, MongoDB, SQLite, Supabase) may be introduced for the web application.
  - **Authentication:** Firebase Authentication manages identity and issues verified JWT tokens with custom claims (`role`, `code`, `perm`).
  - **Offline Persistence:** Firestore offline cache persistence must be enabled and maintained (`enablePersistence` / offline-first cache).
  - **Runtime & APIs:** Node.js serverless/API layer for secured administrative actions (`api/`), client-side PWA architecture (`public/`).

## 2. Non-Negotiable Operational Rules
1. **Database Exclusivity:** Cloud Firestore is the single source of truth. Never create parallel databases or alternative persistence layers for the web application.
2. **Preserve Existing Features & Data:** Never delete, overwrite, or corrupt real user data, student records, attendance logs, or servant grades.
3. **Preserve Documentation & Code Integrity:** Preserve existing functional comments, docstrings, and Arabic contextual annotations.
4. **Never Expose Secrets:** Service account private keys, passwords, and sensitive credentials must remain in environment variables or secure storage only. Never commit credentials to version control.
5. **No Fake / Mock Data:** Do not replace real production data with mock data. Real operations must execute with verified server confirmation or clear offline indicators.

## 3. Language & Internationalization Policy
- **Internal Engineering:** English only for code, variable names, architecture documentation, technical plans, test suites, and internal commit messages.
- **End-User Interface:** Arabic only (`ar-EG`), with strict Right-to-Left (RTL) layout consistency:
  - Arabic typography (Tajawal / Cairo font families).
  - Arabic validation, error messages, and success toasts.
  - Arabic form labels, buttons, navigation pills, and modals.
  - Dual calendar support: Coptic Liturgical Calendar and Gregorian Calendar.

## 4. Security & Access Control Policy
- **Role Hierarchy:**
  - `admin`: Super-admin / Ministry Leader (أمين الخدمة) — full access across all years, audit logs, servant accounts.
  - `servant`: Servant (خادم) — scoped by permission (`perm`: `full` vs `attend`), managing assigned cohort/stages.
  - `student`: Disciple / Student (مخدوم / دارس) — scoped to their own profile, attendance, grades, spiritual notes.
- **Principle of Least Privilege:**
  - Server endpoints in `api/` must verify JWT tokens via `api/_lib/auth.js` (`verifyAuth`).
  - Firestore Security Rules (`firestore.rules`) must enforce ownership checks (`isMe(code)`, `isStaff()`, `isAdmin()`).

## 5. Offline & Synchronization Policy
- Firestore offline persistence must be initialized cleanly:
  ```javascript
  db.enablePersistence({ synchronizeTabs: true }).catch(err => { ... });
  ```
- Writes executed offline must be handled gracefully with UI feedback indicating synchronization state.
- Financial and attendance operations must prevent duplicate submissions via idempotent document keys (e.g., date-based doc IDs like `attendance/{YYYY-MM-DD}`).

## 6. Testing & Quality Gates
- Every modification must be validated against automated test suites (`run_all_suites.js`).
- 100% test pass rate is mandatory before committing to `main`.
- Continuous regression testing across:
  - Security & Authentication tests (`test_phase1_security.js`, `test_phase3_security.js`)
  - UI & PWA layout tests (`test_ui_pwa.js`)
  - Grades, curves & simulation tests (`test_syntax_grades.js`, `test_reality_curve_analytics.js`, `test_deep_simulation.js`)
  - Birthday, radar & WhatsApp tests (`tests/test_birthday_and_radar.js`)

## 7. Autonomous Development Recordkeeping
All autonomous engineering operations must be logged and tracked inside `AI_DEVELOPMENT/`:
- `MASTER_PLAN.md`: Strategic architecture roadmap across all 12 development phases.
- `TASK_QUEUE.md`: Prioritized task queue with statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`).
- `PROGRESS.md`: Chronological log of completed tasks, evidence, and verification logs.
- `DECISIONS.md`: Architectural Decision Records (ADRs).
- `TEST_RESULTS.md`: Exact test suite outputs and quality gate verifications.
- `CHANGELOG.md`: Detailed record of all modified files and features.
- `NEXT_ACTION.md`: Immediate next autonomous task and execution steps.
- `QUALITY_GATES.md`: Matrix of verification requirements for each phase.
- `RISK_REGISTER.md`: Identified risks, impact, and mitigation strategies.
- `PROMPT_HISTORY.md`: Record of user goals and mission directions.
- `FINAL_REPORT.md`: Comprehensive final report written in Arabic for the ministry leadership.
