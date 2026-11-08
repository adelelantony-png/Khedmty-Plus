# ARCHITECTURAL DECISIONS REQUIRING USER APPROVAL — KHEDMETY PLUS

> [!IMPORTANT]
> In accordance with Section 2, Section 11, and Section 20 of the Engineering Mission Guidelines, the following architectural and security modifications are strictly reserved for explicit user approval. None of these items have been modified in application code.

---

## Decision 1: Fallback Administrator Password & Lockout Safeguard (Finding SEC-04)

### Current Implementation:
In `api/login.js` line 211:
```javascript
const adminPass = process.env.ADMIN_PASSWORD || '1234567';
```
In `public/servant-dashboard.html` lines 7086-7087:
```javascript
if (rawPwd === '1234567' || pwdHash === '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918') {
    return true;
}
```

### The Problem:
If an attacker discovers or guesses that `ADMIN_PASSWORD` is unset in the production environment, the default password `'1234567'` grants full super-admin access across the service.

### Lockout Risk & Why Automatic Fix Was Halted:
Our environment inspection confirmed that `process.env.ADMIN_PASSWORD` is currently **NOT configured** in the active local/serverless environment. Removing `'1234567'` immediately would cause a complete administrator lockout in development and any staging deployment where the environment variable is not populated.

### Recommended Solution:
1. Administrator Mr. Adel George sets a strong secret in the Vercel Project Dashboard:
   `ADMIN_PASSWORD=<STRONG_PASS_PHRASE>`
2. After verifying the secret exists in Vercel, remove `'1234567'` from `api/login.js`:
   ```javascript
   const adminPass = process.env.ADMIN_PASSWORD;
   if (!adminPass) {
       console.error('[CRITICAL] ADMIN_PASSWORD environment variable is not configured.');
       return res.status(500).json({ success: false, message: 'خطأ في إعدادات أمان الخادم' });
   }
   ```
3. Update `servant-dashboard.html` to only accept `adminPasswordHash` when configured.

- **Benefits:** Eliminates hardcoded credential attack vector entirely.
- **Risks:** Administrator lockout if environment variable is forgotten or misnamed during deployment.
- **Estimated Effort:** 30 minutes.
- **User Approval Required:** **YES**.

---

## Decision 2: Offline Servant Emergency Login Word Matching (Finding SEC-02)

### Current Implementation:
In `public/index.html` lines 342-350:
```javascript
if (!navigator.onLine) {
    if (p === '1234567' || p === 'admin' || un.includes('خادم') || un.includes('servant')) {
        const sName = u.length >= 2 ? u : 'خادم معتمد';
        return {
            kind: 'staff',
            role: 'servant',
            user: { id: Date.now(), name: sName, role: 'servant', permission: 'servant', code: 'servant_offline', offlineSession: true }
        };
    }
}
```

### The Problem:
When offline, any student or untrusted user can type "خادم" or "servant" as their username with any password, and the system grants them an authenticated servant session with full offline access to attend disciples and view rosters.

### Recommended Solution:
Replace heuristic string matching with cryptographic verification against the locally cached servant roster (`my_church_servants`):
1. Only grant an offline servant session if the username and hashed password match an existing servant record cached during a prior online login.
2. If the servant has never logged in on that specific device, require a one-time pre-meeting online sync.

- **Benefits:** Prevents unauthorized role escalation when the browser is disconnected or in airplane mode.
- **Risks:** A servant using a brand new device in a church basement with zero cellular signal who has never previously logged in would not be granted access.
- **Estimated Effort:** 2 hours.
- **User Approval Required:** **YES**.

---

## Decision 3: Removal of Public Offline Plaintext Roster (Finding SEC-03)

### Current Implementation:
`public/js/khedmty-offline-roster.js` contains hundreds of actual disciple names, phone numbers, stages, birth dates, and QR codes hardcoded in a client-side JavaScript file served publicly to any visitor.

### The Problem:
Anyone on the public internet can request `https://<domain>/js/khedmty-offline-roster.js` without any authentication and obtain the entire personal directory of the church congregation, violating student privacy.

### Recommended Solution:
1. Remove real student records from `public/js/khedmty-offline-roster.js`.
2. Populate the offline IndexedDB cache dynamically upon authorized servant login via `/api/admin` (`get_sync_data`).
3. Store the offline cache securely in browser IndexedDB (`khedmty-db.js`) instead of bundling it into the publicly downloadable web bundle.

- **Benefits:** Protects congregational privacy and eliminates unauthorized bulk data scraping.
- **Risks:** Requires an initial online login before a servant can use the device completely offline.
- **Estimated Effort:** 2 hours.
- **User Approval Required:** **YES**.

---

## Decision 4: Migration of Student Grades from LocalStorage to Cloud Firestore (Finding SEC-11)

### Current Implementation:
In `public/servant_grades_entry.html` lines 4076-4084:
```javascript
localStorage.setItem('khedmety_new_applicants_grades', JSON.stringify(candidatesList));
localStorage.setItem('khedmety_target_pass_rate', currentTargetPassRate);
localStorage.setItem('khedmety_pass_threshold', passThreshold);
```
Grades, exam marks, and interview decisions are saved exclusively in the browser's `localStorage` of the specific servant entering them.

### The Problem:
1. If the servant clears their browser cookies/cache, all grades are permanently lost.
2. Grades are not synchronized with other servants or the general meeting leader.
3. Students cannot view their grades in `student.html` or `results.html` through Cloud Firestore.
4. Violates the specification in `docs/GRADES-SPEC.md` (`students/{code}/grades/{subjectId}`).

### Recommended Solution:
Implement the specification documented in `docs/GRADES-SPEC.md`:
1. Save each grade record to Cloud Firestore under `students/{code}/grades/{subjectId}`.
2. Provide an explicit "سحب ومزامنة الدرجات السحابية" (Pull & Sync Cloud Grades) button in `servant_grades_entry.html`.
3. Provide local fallback caching in IndexedDB for offline resilience.

- **Benefits:** Multi-device synchronization, automated cloud backups, student portal integration.
- **Risks:** Requires careful migration of existing local data so that whatever grades are currently stored on the servant's laptop are not overwritten.
- **Estimated Effort:** 4 hours.
- **User Approval Required:** **YES**.

---

## Decision 5: Standardization of Servant UID Format (Finding SEC-13)

### Current Implementation:
- In `api/login.js` line 156: `uid = 'servant_' + code`
- In `api/admin.js` line 367: `uid = 'srv_' + cleanCode`

### The Problem:
An account created via `create_servant_auth` in `api/admin.js` gets Firebase Auth UID `srv_102`. But when that servant logs in via `api/login.js`, their custom token is minted with UID `servant_102`. This causes Firebase Auth to treat them as two different identities.

### Recommended Solution:
Standardize all servant UIDs to `servant_<code>`:
- Update `api/admin.js`: `const uid = 'servant_' + cleanCode;`

- **Benefits:** Consistent identity across Firebase Auth, Firestore security rules, and audit logs.
- **Risks:** Existing users created under the old `srv_*` UID in Firebase Auth would need their auth records refreshed or mapped.
- **Estimated Effort:** 1 hour.
- **User Approval Required:** **YES**.

---

## Decision 6: Proposed Firestore Security Rule for `quiz_achievements` (Finding SEC-07)

### Current Implementation:
`quiz.html` attempts to record solo quiz scores to `students/{code}/quiz_achievements`, but `firestore.rules` has no rule for this subcollection, causing all student writes to be denied by the default-deny rule.

### Proposed Rule:
```firestore
match /students/{code}/quiz_achievements/{id} {
  allow read: if isStaff() || isMe(code);
  allow create: if isMe(code) && 
                   request.resource.data.score is number && 
                   request.resource.data.score >= 0 &&
                   request.resource.data.score <= 100 &&
                   request.resource.data.timestamp is timestamp;
  allow update, delete: if isFull();
}
```

### Blocker:
Firebase Emulator is currently unavailable on the local machine (Java runtime is missing). Under Section 11.3 and Section 18, security rule changes cannot be applied without verified emulator testing.

- **Benefits:** Unlocks quiz score tracking for students.
- **Risks:** Must be tested with Firebase Emulator before deployment to ensure no regressions for legitimate students.
- **User Approval Required:** **YES**.
