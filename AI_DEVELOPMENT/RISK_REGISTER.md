# RISK REGISTER — KHIDMETY PRO

| Risk ID | Category | Description | Severity | Likelihood | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | Architecture | Accidental introduction of secondary or non-Firestore database | CRITICAL | LOW | Strict enforcement of non-negotiable rule in `AGENTS.md` and automated code scan | **MITIGATED** |
| **RSK-002** | Data Loss | Overwriting or corrupting production student data or grades | CRITICAL | LOW | Pre-flight git checkpoint, automated backups, and zero-mock-data policy | **MITIGATED** |
| **RSK-003** | Security | Unauthenticated API endpoint allowing unauthorized write/read | HIGH | MEDIUM | Comprehensive audit of `api/` endpoints to verify `verifyAuth` on all operations | **IN_PROGRESS** |
| **RSK-004** | Security | Insecure Firestore security rules leaking cross-student data | HIGH | LOW | Audit `firestore.rules` to ensure strict `isMe()` and `isStaff()` checks | **PENDING** |
| **RSK-005** | Offline Sync | Conflicting offline attendance records causing duplicate entries | HIGH | MEDIUM | Use deterministic date-based document IDs (`attendance/{YYYY-MM-DD}`) | **MITIGATED** |
| **RSK-006** | Performance | Unbounded `onSnapshot` listeners causing client memory leaks | MEDIUM | MEDIUM | Ensure every subscription unbinds on page navigate or tab switch | **PENDING** |
| **RSK-007** | Cost | Excessive Firestore read counts exceeding Firebase free Spark quota | MEDIUM | LOW | Enable local persistence caching and limit document fetch sizes | **PENDING** |
| **RSK-008** | UX | Inconsistent RTL alignment or untranslated technical terms | LOW | MEDIUM | Comprehensive Arabic language check across all 27 HTML pages | **PENDING** |
