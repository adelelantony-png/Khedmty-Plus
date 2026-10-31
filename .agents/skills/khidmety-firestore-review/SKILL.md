---
name: khidmety-firestore-review
description: Firestore database architecture review for KHIDMETY PRO verifying index definitions, query cost optimization, offline persistence, and snapshot listener management.
---

# Khidmety Firestore Review Workflow

## Objective
Review, optimize, and audit the Cloud Firestore implementation across the platform:
1. **Schema Consistency:** Verify standard document keys and subcollections (`attendance/{YYYY-MM-DD}`, `students/{code}/daily_logs`, `servants/{id}`).
2. **Index Coverage:** Verify all compound queries (`where` + `orderBy`) are properly registered in `firestore.indexes.json`.
3. **Cost Optimization:** Eliminate unbounded reads. Enforce limit queries and cache-first access patterns within the Firebase free tier.
4. **Listener Teardown:** Ensure client `onSnapshot` subscriptions store unsubscribe functions and clean up on view unmount to prevent memory leaks.
