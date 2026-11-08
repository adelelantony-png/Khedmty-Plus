# COMPREHENSIVE SECURITY AUDIT — KHEDMETY PLUS (خدمتي برو)

## 1. Authentication Architecture Analysis

### 1.1 Custom Token Generation
- **Implementation:** `api/login.js` uses `firebase-admin` auth to issue custom tokens (`auth.createCustomToken(uid, claims)`).
- **Custom Claims Issued:**
  - `role`: `'admin'` | `'servant'` | `'student'`
  - `code`: Student code or servant identifier
  - `perm`: `'admin'` | `'full'` | `'attend'` (for servants)
  - `name`: Display name
- **Verification:** Custom claims are properly signed by Firebase Admin using service account private keys and decoded by Firebase Client SDK.

### 1.2 Password Verification Logic
- **Servants:** Authenticated by matching `cleanPwd` against stored `passwordHash` using SHA-256 with timing-safe comparison (`timingSafeCompare(computed, record.passwordHash)`).
- **Students:** Authenticated primarily by matching their exam code with their phone number or parent's phone number (`phonesMatch(record.phone, rawPassword) || phonesMatch(record.parent_phone, rawPassword)`). If a student has set a custom password, `passwordHash` is checked.
- **Vulnerabilities Identified:**
  - `api/login.js:211`: Fallback password `'1234567'` for admin when `process.env.ADMIN_PASSWORD` is unset *(Finding SEC-04)*.
  - `public/index.html:211, 343`: Default password `'1234567'` / `'admin'` accepted for servants in offline fallback *(Finding SEC-02)*.

---

## 2. API Endpoints Security Review

| Endpoint | Auth Mechanism | Authorization Enforced | Input Validation | Sensitive Leakage | Risk Level |
|---|---|---|---|---|---|
| `/api/login` | Rate Limiter (IP/ID) | Public entry point | Trims and cleans Arabic digits | None | Medium (In-memory rate limiter) |
| `/api/public-config` | Public | Public read-only | None needed | Project & App IDs only | Low (Synchronized in Fix 6) |
| `/api/health` | Public | Public probe | None | None (Environment names stripped in Fix 3) | Low |
| `/api/admin` | Bearer JWT | `isAdmin(authResult.user)` | Action-specific payload checks | None (Stack trace stripped in Fix 4) | Low |
| `/api/get_subjects` | Bearer JWT | `isStaff() \|\| isStudent()` | Stage / level queries | None | Low |
| `/api/harvest` | Bearer JWT | `canAccessStudent()` | Student code validation | None | Low |
| `/api/mark_plan_read`| Bearer JWT | `canAccessStudent()` | Month / day integers validated | Points formula calculated on server | Medium (Needs chapter array bounds check) |
| `/api/spiritual_note`| Bearer JWT | `canAccessStudent()` | Date string validation | None | Low |
| `/api/submit_sheet` | Bearer JWT | `canAccessStudent()` | Subject and answers validated | None | Low |

---

## 3. Cloud Firestore Security Rules Audit (`firestore.rules`)

### 3.1 Role Hierarchy & Access Bounds
- **Helper Functions:**
  - `signedIn()`: Verifies `request.auth != null`.
  - `isMe(code)`: Restricts student access strictly to documents matching their token's `code`.
  - `isStaff()`: Grants access to servants and admins.
  - `isFull()`: Restricts destructive operations to admins or servants with `perm == 'full'`.
  - `isAdmin()`: Requires `request.auth.token.role == 'admin'`.

### 3.2 Collection Coverage Audit
1. `students/{code}`:
   - Profile documents require `isStaff() || isMe(code)` for read.
   - Subcollections (`daily_reading_logs`, `daily_logs`, `sheet_submissions`, `feedback`) correctly enforce `isMe(code) || isFull()`.
   - **Missing Subcollection:** `students/{code}/quiz_achievements` is missing from rules, causing silent failures on student quiz submission *(Finding SEC-07)*.
2. `attendance/{date}`:
   - Reading permitted for any `signedIn()` user.
   - Modification restricted to `isStaff()`. Deletion restricted to `isFull()`.
3. `servants/{servantId}`:
   - Reading restricted to `isStaff()`. Write restricted to `isAdmin()`.
4. `audit_logs` & `error_logs`:
   - Append-only (`allow create: if ...; allow update, delete: if false;`).
   - Immutable audit logs guaranteed.

---

## 4. Client-Side Security & Data Privacy

### 4.1 Development Simulation Parameter Hardening
- **Vulnerability:** `public/auth-client.js` previously accepted `?sim_role=admin` on any domain, setting `localStorage.user_role = 'admin'`.
- **Remediation:** In Commit `e1bfb89`, parameter handling was wrapped with:
  ```javascript
  const host = (window.location.hostname || '').toLowerCase();
  const isLocalDev = host === 'localhost' || host === '127.0.0.1' || host === '';
  if (sim && !isLocalDev) {
      console.warn('[Security] Simulation parameter (?sim_role) is strictly disallowed in non-local environments.');
  }
  ```

### 4.2 Public Offline Roster Data Exposure
- `public/js/khedmty-offline-roster.js` contains hundreds of unencrypted disciple records.
- Documented in `NEEDS_DECISION.md` (Decision 3) for user approval to decouple from public static assets.

### 4.3 Public Deployment of Backup Artifacts
- Legacy files like `public/servant_grades_entry.backup_declutter.html` and `public/*.bak` were publicly routable on Vercel.
- In Commit `de86c8d`, all backup files were relocated to `_backups_archive/public_legacy_backups/`.
