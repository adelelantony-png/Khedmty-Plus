---
name: khidmety-ui-review
description: User interface and experience review for KHIDMETY PRO verifying Arabic RTL typography, mobile touch responsiveness, ecclesiastical themes, and accessibility.
---

# Khidmety UI Review Workflow

## Objective
Verify the visual design, accessibility, and responsiveness of the user interface:
1. **Arabic RTL Compliance:** Ensure `<html lang="ar" dir="rtl">` is set on every page, with proper RTL margin/padding order and Tajawal/Cairo fonts.
2. **Ecclesiastical Palette:** Ensure visual consistency with the church theme: deep navy (`#0c2461`, `#0a192f`), royal blue (`#1e3799`), liturgical gold (`#d4af37`), and emerald (`#059669`).
3. **Form Validation & Feedback:** Guarantee all forms display immediate, polite Arabic feedback toasts rather than raw alert boxes.
4. **Mobile Usability:** Verify touch targets exceed 48px, bottom navigation is reachable, and tables have horizontal touch scroll wrappers.
