---
name: khidmety-offline-test
description: Offline-first architecture test workflow for KHIDMETY PRO verifying Firestore persistence, service worker asset caching, and offline-to-online sync.
---

# Khidmety Offline Test Workflow

## Objective
Validate the offline capabilities of KHIDMETY PRO:
1. **Firestore Local Persistence:** Verify that `db.enablePersistence({ synchronizeTabs: true })` initializes cleanly without unhandled rejection.
2. **Service Worker (`sw.js`):** Verify that the PWA Service Worker caches core HTML, CSS, JavaScript, and icon assets for offline access.
3. **Offline Attendance Marking:** Confirm that when offline, marking a student as present queues the write locally and marks the UI with an offline indicator.
4. **Idempotent Sync:** Confirm that upon reconnecting, pending writes commit to Firestore using deterministic document keys without duplicates.
