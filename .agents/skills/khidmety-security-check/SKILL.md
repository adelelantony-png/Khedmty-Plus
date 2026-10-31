---
name: khidmety-security-check
description: Security verification workflow for KHIDMETY PRO auditing JWT token verification, role permissions (admin, servant, student), and Firestore security rules.
---

# Khidmety Security Check Workflow

## Objective
Verify the end-to-end security boundary of KHIDMETY PRO:
1. **API Endpoints:** Confirm that `verifyAuth` from `api/_lib/auth.js` is invoked on all mutative requests (`admin.js`, `harvest.js`, `submit_sheet.js`, `spiritual_note.js`, `mark_plan_read.js`).
2. **Firestore Security Rules:** Ensure `firestore.rules` isolates student collections (`/students/{code}`, `/members/{code}`) so students cannot view or edit peer records.
3. **Audit Log:** Ensure administrative and high-impact operations generate immutable records in the `/audit` collection.
4. **Credential Safety:** Confirm zero exposure of private keys or service account tokens in client-side code.
