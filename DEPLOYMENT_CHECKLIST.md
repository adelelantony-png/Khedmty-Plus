# DEPLOYMENT CHECKLIST — KHEDMETY PLUS (خدمتي برو)

**Target Environment:** Vercel Serverless + Google Cloud Firestore  
**Primary Database:** Cloud Firestore (Project: `khedmety-plus`)  
**Status:** Pre-Staging Verification  

---

## 1. Environment Variables Configuration (Vercel Console)

Before deploying or migrating branch `audit/initial-fixes` to production, verify that the following environment variables are securely configured in your Vercel Project Settings (**Settings → Environment Variables**):

| Variable Name | Required | Sensitivity | Description |
| :--- | :--- | :--- | :--- |
| `FIREBASE_PROJECT_ID` | Yes | Public / Standard | `khedmety-plus` |
| `FIREBASE_CLIENT_EMAIL` | Yes | Confidential | Firebase service account email address. |
| `FIREBASE_PRIVATE_KEY` | Yes | **CRITICAL SECRET** | RSA Private Key for Firebase Admin SDK. Note: Ensure `\n` linebreaks are preserved or properly escaped. |
| `JWT_SECRET` | Yes | **CRITICAL SECRET** | High-entropy random string (at least 32 characters) used to sign session tokens for servants and admins. |
| `ADMIN_PASSWORD` | Yes | **CRITICAL SECRET** | High-entropy password for the service leader / administrator. **DO NOT USE DEFAULT `'1234567'`**. |
| `FIREBASE_API_KEY` | Optional | Public | Client Web API Key if dynamic public configuration is enabled. |
| `FIREBASE_APP_ID` | Optional | Public | Client App ID (`1:25101228841:web:3164821d165014a1e2b538`). |

> [!WARNING]
> In local development, `ADMIN_PASSWORD` is currently unset. The code retains a temporary fallback to `'1234567'` to prevent administrative lockout. **You must set `ADMIN_PASSWORD` in Vercel before removing the fallback in `api/login.js` and `api/admin.js`.**

---

## 2. Pre-Deployment Staging Verification Steps

1. **Local Test Suite Verification:**
   Run the full test suite locally before pushing:
   ```powershell
   $env:PATH = "D:\StPaul_Service_System\02_WhatsApp_NewWhats\Backend_Node\node;$env:PATH"
   node run_all_suites.js
   ```
   Confirm that all **28/28 test suites pass with 100% success**.

2. **Deploy to Vercel Preview (Staging):**
   - Push branch `audit/initial-fixes` to Git remote.
   - Vercel will automatically generate a Preview Deployment URL (e.g., `https://khedmety-plus-git-audit-initial-fixes-...vercel.app`).
   - Do NOT promote to production domain yet.

3. **Verify Admin Login in Staging:**
   - Navigate to `/servant_login.html` on the preview URL.
   - Enter your newly configured `ADMIN_PASSWORD`.
   - Verify successful authentication and redirection to `admin.html` and `servant-dashboard.html`.

4. **Verify Simulation Lockout in Staging:**
   - Attempt to access `/servant-dashboard.html?sim_role=admin` on the preview URL.
   - Confirm that access is denied or redirects to the login screen, proving the localhost restriction is active.

5. **Verify Servant Operational Security:**
   - Attempt to open `/servant_help.html` directly without logging in.
   - Confirm that the page redirects unauthenticated visitors to `/servant_login.html`.

6. **Verify Service Worker & Offline PWA:**
   - Open Chrome DevTools → Application → Service Workers.
   - Verify that cache name is `khedmety-ultra-v7.0` and that all core assets are cached.
   - Toggle "Offline" mode in DevTools and confirm that the dashboard shell and student portal render gracefully with the offline pill (`يعمل بدون نت 🟠`).

---

## 3. Production Promotion & Cutover Procedure

1. Merge branch `audit/initial-fixes` into `main` after user review and approval of `NEEDS_DECISION.md`.
2. Vercel will build and deploy to the production domain.
3. Once in production, log in as administrator and perform a synthetic attendance test (e.g. check-in a test student and undo).
4. Monitor Google Cloud Firestore Console for quota and rule rejections.
