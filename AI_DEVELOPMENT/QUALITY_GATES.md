# QUALITY GATES — KHIDMETY PRO

## Gate Criteria by Development Phase

| Phase | Quality Gate Criteria | Required Evidence | Verification Method |
| :--- | :--- | :--- | :--- |
| **Phase 1: Audit** | Complete catalog of pages, modules, APIs, and Firestore collections | Audit matrix in `PROGRESS.md` | Static analysis & inventory |
| **Phase 2: Security & Auth** | All API endpoints require verified JWT; Firestore rules disallow unauthorized reads/writes; no secrets exposed | Test reports; Rules validation | Automated test suites |
| **Phase 3: Firestore** | Firestore is the only DB; compound indexes covered in `firestore.indexes.json`; listener leak cleanup verified | Code review; index file | Static analysis & tests |
| **Phase 4: Bug Remediation** | Zero broken buttons or modal errors; all fallback routes functioning | Manual & automated functional tests | Functional test suites |
| **Phase 5: UI/UX Polish** | Complete Arabic RTL layout; font family consistency; responsive layout; ecclesiastical color palette | Visual verification & CSS review | Responsive check |
| **Phase 6: Mobile PWA** | Valid `manifest.json`; service worker registered and caching assets; touch targets >= 48px | Lighthouse / PWA audit script | `test_ui_pwa.js` |
| **Phase 7: Offline Sync** | Multi-tab persistence enabled; network indicator present; idempotent write protections | Offline simulation test | Simulation script |
| **Phase 8: Dashboards** | Dashboard navigation smooth; executive radar active; grades entry functional with curve calculations | Regression test suites | Test suites 6, 7, 8, 18 |
| **Phase 9: Reports** | Excel export functions with accurate formulas; absence reports generated cleanly | XLSX generator check | Test suite 11 |
| **Phase 10: AI Pastoral** | Orthodox spiritual quiz functioning; accurate biblical quotes; guardrails verified | Quiz test suite | Test suite 17 |
| **Phase 11: Performance** | No memory leaks; script size optimized; smooth rendering | Performance benchmark | Script review |
| **Phase 12: QA & Release** | 100% test pass rate across all suites; comprehensive final report delivered in Arabic | `FINAL_REPORT.md` | `run_all_suites.js` |
