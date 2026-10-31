const fs = require('fs');
const path = require('path');

// 1. CHANGELOG.md
const changelogPath = path.join(__dirname, '../AI_DEVELOPMENT/CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

const changelogEntry = `

## [1.4.0-GRANULAR-CHAPTERS] - 2026-10-31
### Granular Chapter-by-Chapter Tracking Across Student Portal, Spiritual Note, Harvest & Pastoral Followup
- **Full Project Pre-modification Backup**: Created verified snapshot at \`D:\\StPaul_Service_System\\_Backups\\03_Web_Khedmty_Plus_PreChapterGranular_20261031\` (250 files, 27.15 MB, Robocopy Exit Code 1 / Success).
- **Chapter-by-Chapter Tracking Engine (\`api/mark_plan_read.js\`)**:
  - Transitioned from binary daily plan tracking (all or nothing) to fine-grained chapter tracking.
  - Supports individual chapter logging, array of chapters, and chapter toggling (\`toggle_chapter\`, \`unmark_chapter\`).
  - Implemented dynamic scoring: **+2 points per chapter read**, plus **+3 bonus points** when all chapters of the day are completed.
  - Preserves 100% backward compatibility for legacy records and API calls.
- **Student Portal Chapter Matrix (\`public/student.html\`)**:
  - Redesigned the today reading card into an interactive Chapter Studio.
  - Live progress bar showing exact chapters read vs total for today (e.g. 2 of 3 chapters, 67%).
  - Responsive chapter chips allowing one-click instant marking and direct reading links (\`bible.html?book=...&chapter=...\`).
  - Instant local and cloud synchronization without page reloads.
- **Spiritual Note Daily Catchup (\`public/spiritual_note.html\`)**:
  - Replaced the single binary button with an interactive chapter pill grid for the selected date.
  - Allows the student or servant to mark individual completed chapters for past dates and view completion percentages.
- **Harvest Dashboard (\`public/harvest.html\` & \`api/harvest.js\`)**:
  - Upgraded Bible reading metric from simple day count to total Holy Bible chapters read (out of 1189 chapters).
  - Displays accurate percentages and aggregated chapter totals across historical logs.
- **Pastoral Servant Followup & Leadership Dashboard (\`public/servant_spiritual_report.html\` & \`servant-dashboard.html\`)**:
  - Updated \`countBibleReadingsFor\` and spiritual evaluation rows to aggregate actual chapters read.
  - Enhanced automated pastoral WhatsApp messages to report exact chapter counts (\`\${r.bible} إصحاحاً مقروءاً 📖\`).
- **Comprehensive Verification**:
  - Authored \`tests/test_granular_chapter_tracking.js\` (Suite 22).
  - Executed all 22 test suites with **100% PASS rate (22/22 suites)**.
`;

if (!changelog.includes('1.4.0-GRANULAR-CHAPTERS')) {
    fs.writeFileSync(changelogPath, changelog.trim() + changelogEntry, 'utf8');
    console.log('✅ CHANGELOG.md updated');
}

// 2. PROGRESS.md
const progressPath = path.join(__dirname, '../AI_DEVELOPMENT/PROGRESS.md');
let progress = fs.readFileSync(progressPath, 'utf8');

const progressEntry = `

### [2026-10-31] Granular Chapter-by-Chapter Tracking Across Student Portal, Spiritual Note, Harvest & Followup (TSK-018)
- **Status:** **COMPLETED & VERIFIED**
- **Safety Pre-check:** Full project backup created and verified at \`D:\\StPaul_Service_System\\_Backups\\03_Web_Khedmty_Plus_PreChapterGranular_20261031\` (250 files, 27.15 MB, Robocopy Exit Code 1 / Success).
- **Key Enhancements Implemented:**
  1. **Granular Reading Architecture:** Replaced binary all-or-nothing daily plan tracking with chapter-by-chapter logging.
  2. **Student Portal Studio:** Added progress bar and responsive interactive chapter chips with real-time sync.
  3. **Spiritual Note Integration:** Updated catchup section with interactive chapter pills for selected dates.
  4. **Harvest & Bible Progress:** Aggregates exact chapters read against the 1189 chapters of the Holy Bible.
  5. **Pastoral Report & Servant Dashboard:** Displays exact chapters read for each student and custom WhatsApp followup messaging.
  6. **100% Feature Preservation:** Zero features deleted, zero destructive database changes.
- **Verification:** All 22 test suites passed 100% (\`run_all_suites.js\` 22/22 PASS).
`;

if (!progress.includes('TSK-018')) {
    fs.writeFileSync(progressPath, progress.trim() + progressEntry, 'utf8');
    console.log('✅ PROGRESS.md updated');
}
