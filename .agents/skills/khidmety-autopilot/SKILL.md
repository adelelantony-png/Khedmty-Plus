---
name: khidmety-autopilot
description: Autonomous engineering driver for KHIDMETY PRO executing tasks sequentially through the task queue without requiring external human prompts.
---

# Khidmety Autopilot Workflow

## Autonomous Engineering Loop
1. **Read State:** Review `AI_DEVELOPMENT/TASK_QUEUE.md` and `AI_DEVELOPMENT/NEXT_ACTION.md`.
2. **Select Task:** Pick the highest-priority pending task.
3. **Plan & Execute:** Generate safe, targeted implementation edits.
4. **Test & Verify:** Run automated tests to prove the fix/feature works.
5. **Record Progress:** Update `AI_DEVELOPMENT/PROGRESS.md`, `CHANGELOG.md`, and `TEST_RESULTS.md`.
6. **Advance:** Select the next task in the queue and continue without interruption.
