# CHANGELOG — KHEDMETY PLUS (خدمتي برو)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - Branch `audit/initial-fixes` (2026-11-08)

### Added
- **Authentication Gate on Help Page (`1dbe4ee`):** Added `auth-client.js` inclusion and role enforcement (`AuthClient.enforceAuth(['servant', 'admin'])`) to `public/servant_help.html`.
- **Test NPM Script (`17f8c02`):** Added `"test": "node run_all_suites.js"` to `package.json` for standardized automated test execution.
- **Quarantine Directory (`de86c8d`):** Established `_backups_archive/public_legacy_backups/` outside the web root to isolate historical backups from public web access.

### Changed
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
