# ARCHITECTURAL DECISIONS (ADR) — KHIDMETY PRO

## ADR-001: Cloud Firestore as the Sole Application Database
- **Date:** 2026-10-31
- **Status:** **ACCEPTED (NON-NEGOTIABLE)**
- **Context:** The application manages church service attendance, student profiles, servant preparation curriculum, grades, and spiritual journals.
- **Decision:** Firebase Cloud Firestore is the sole database engine for the application. No relational engines (MySQL, Postgres, SQLite) or alternative NoSQL (MongoDB, Supabase) may be introduced for application data.
- **Consequences:** All models, queries, rules, and offline caching must be designed natively for Firestore NoSQL collection/document paradigms.

## ADR-002: Offline-First Synchronization via Native Firestore Persistence
- **Date:** 2026-10-31
- **Status:** **ACCEPTED**
- **Context:** Church basement halls and meeting rooms frequently experience mobile signal dropouts or intermittent internet connectivity.
- **Decision:** Enable native Firestore multi-tab persistence (`enablePersistence({ synchronizeTabs: true })`). Operations must be idempotent (using deterministic document IDs like `${date}_${studentCode}`) so that offline writes synchronize without duplicates upon reconnection.
- **Consequences:** Attendance and grade marking are completely immune to network dropouts.

## ADR-003: JWT Custom Claims for Role-Based Access Control (RBAC)
- **Date:** 2026-10-31
- **Status:** **ACCEPTED**
- **Context:** Three primary user categories exist: `admin` (super-admin / أمين الخدمة), `servant` (خادم), and `student` (دارس / مخدوم).
- **Decision:** Authenticate via Firebase Custom Auth Tokens carrying claims `{ role, code, perm }`. Both the Node.js API layer (`api/_lib/auth.js`) and Firestore Security Rules (`firestore.rules`) enforce authorization based on these cryptographically verified claims.
- **Consequences:** Eliminates insecure client-side role spoofing and prevents unauthorized reading/writing of sensitive records.

## ADR-004: Standardized Arabic RTL User Experience
- **Date:** 2026-10-31
- **Status:** **ACCEPTED**
- **Context:** End users are Egyptian Coptic Orthodox servants and students.
- **Decision:** All user interfaces must render natively in Arabic with proper RTL alignment, Tajawal/Cairo typography, and culturally respectful ecclesiastical visual styling.
- **Consequences:** All error messages, confirmation dialogues, and reports must be in clear Arabic.

## ADR-005: Sliding-Window Rate Limiting & Constant-Time Authentication
- **Date:** 2026-10-31
- **Status:** **ACCEPTED**
- **Context:** Public login endpoints (`/api/login`) could be vulnerable to automated brute-force password guessing and subtle microsecond timing attacks on password verification.
- **Decision:** Implement an in-memory sliding-window rate limiter (5 failed attempts per 5 minutes per IP/client identifier returns HTTP 429). In addition, `timingSafeCompare` pre-hashes strings into uniform 32-byte SHA-256 buffers before calling `crypto.timingSafeEqual` to eliminate length disclosure.
- **Consequences:** Brute-force bot attacks are effectively halted, and timing disparity between valid and invalid password lengths is completely eliminated.

## ADR-006: Pre-emptive Composite Indexing & Subscription Lifecycle Registry
- **Date:** 2026-10-31
- **Status:** **ACCEPTED**
- **Context:** Firestore real-time queries with multiple filters fail if compound indexes are missing, and long-lived client web sessions leak memory if `onSnapshot` listeners are not unbound.
- **Decision:** All compound query patterns used across dashboards and student portals are pre-configured in `firestore.indexes.json`. Client applications register subscriptions through `KhedmtyAuth.registerListener()`, and all listeners are automatically detached upon user logout or `beforeunload`.
- **Consequences:** Zero unindexed query errors in production, and zero memory leaks or phantom background network traffic.
