---
name: khidmety-audit
description: Comprehensive audit workflow for KHIDMETY PRO verifying codebase inventory, security posture, Firestore queries, and UI consistency.
---

# Khidmety Audit Workflow

## Objective
Execute a comprehensive code, security, and architectural audit across all HTML pages, API endpoints, and Firestore collections in KHIDMETY PRO.

## Audit Checklist
1. **Inventory Verification:** Catalog all 27 HTML files in `public/` and serverless functions in `api/`.
2. **Database Exclusivity:** Ensure Cloud Firestore is the ONLY database used in application code.
3. **Security Check:** Verify all sensitive API routes enforce JWT Bearer token authentication via `api/_lib/auth.js`.
4. **Data Integrity:** Check for any broken links, missing modal containers, or unhandled promise rejections.
5. **Quality Gates:** Verify that all 18 test suites pass at 100% via `run_all_suites.js`.
