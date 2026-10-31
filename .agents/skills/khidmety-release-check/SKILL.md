---
name: khidmety-release-check
description: Production release readiness verification workflow for KHIDMETY PRO executing full automated regression testing and validation of deployment configurations.
---

# Khidmety Release Check Workflow

## Objective
Execute final pre-release quality gates for KHIDMETY PRO:
1. **Automated Test Suites:** Execute `node run_all_suites.js` and require 100% PASS rate.
2. **Configuration Verification:** Verify `firebase.json`, `firestore.rules`, and `firestore.indexes.json`.
3. **No Dev Leftovers:** Verify no `debugger`, debug alerts, temporary mock files, or unresolved TODOs in production paths.
4. **Documentation Synchronization:** Verify that `CHANGELOG.md`, `PROGRESS.md`, and `FINAL_REPORT.md` are up to date.
