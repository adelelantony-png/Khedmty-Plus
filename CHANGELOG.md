# CHANGELOG — KHEDMETY PLUS (خدمتي برو)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - Branch `audit/initial-fixes` (2026-11-08)

### Added
- **NLP Excuse Recognition for Delays & Early Departure:** Expanded `EXCUSE_INTENT_PATTERNS` and `UNAMBIGUOUS_REASON_PHRASES` in `Backend_Node/services/kioskHandler.js` to automatically detect delay/early-leave work excuses (such as Black Friday, shifts, and events).
- **Stage-Scoping in Pastoral Absence Radar:** Regular servants are now automatically scoped to view only students in their assigned stage (e.g. الفرقة الأولى), keeping whole-service pastoral data under the Service Leader.
- **Authentication Gate on Help Page (`1dbe4ee`):** Added `auth-client.js` inclusion and role enforcement (`AuthClient.enforceAuth(['servant', 'admin'])`) to `public/servant_help.html`.
- **Test NPM Script (`17f8c02`):** Added `"test": "node run_all_suites.js"` to `package.json` for standardized automated test execution.
- **Quarantine Directory (`de86c8d`):** Established `_backups_archive/public_legacy_backups/` outside the web root to isolate historical backups from public web access.

### Changed
- **Eliminated Table Text Overlap & Restored Responsive Scrolling:**
  - Removed `overflow-x: hidden !important;` from `.table-responsive-wrapper` in `public/servant-dashboard.html` and `public/js/dashboard/dashboard-radar.js`.
  - Added responsive `min-width: 740px` and `760px` with cell ellipsis clipping (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`), completely eliminating text collision between phone numbers, names, and absence badges on mobile and desktop.
  - Bumped Service Worker cache to `khedmety-ultra-v7.1`.
- **Protected Service Leader Radar & Tightened Regular Servant Defaults:**
  - Default permissions for regular servants now set `excuses: 'view'`, `pulse: 'view'`, `followup: 'view'`, and `members: 'view'`, completely hiding excuse approval/rejection/cancellation buttons and WhatsApp pulse group dispatch from regular servants.
- **Development Simulation Restrictions (`e1bfb89`):** Restricted `?sim_role=admin` and `?sim_role=student` in `public/auth-client.js` strictly to `localhost` and `127.0.0.1`. Query simulation is completely ignored on production domains.
- **Health Check Information Scrubbing (`6d21c0a`):** Removed internal environment variable names and missing keys list from `/api/health`.
- **Admin Error Response Scrubbing (`250a343`):** Removed Node.js call stack trace (`details: error.stack`) from HTTP 500 error responses in `/api/admin.js`.
- **Firebase Public Config Synchronization (`f8080df`):** Aligned default fallback values in `api/public-config.js` with verified client configuration (`khedmety-plus`, App ID `1:25101228841:web:3164821d165014a1e2b538`).
- **Test Infrastructure Modernization (`17f8c02`):**
  - Updated `test_batch_a1.js` regex to support cache-busting query strings `?v=...`.
  - Updated `test_batch_a_design.js` and `test_deep_simulation.js` to match modern Service Worker cache names (`khedmety-ultra-v[2-9]\.\d+`).
  - Repaired `tests/simulate_real_user_journeys.js` to strip query strings before verifying file existence on disk, resolving 172 false undefined function alerts.

### Security
- Closed unauthenticated access to servant operational documentation.
- Eliminated remote role elevation vector via client URL query parameters.
- Prevented architecture and file-system leakage via API error stack traces and health checks.
