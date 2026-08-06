# Metric Quest: Codex + Claude Code Playbook

This is the operating guide for building Metric Quest over three weeks. The
product plan and mission curriculum should live beside this file when available.

## Narrative pivot (read this before sending any new prompt)

After Prompt 1 (Codex) and Prompt 2 (Claude Code) shipped, the product
direction changed: Metric Quest is now framed as an 8-bit adventure where the
player is pulled into Aurora Music's mainframe to stop a rogue analyst AI
that is corrupting the company's data. The full story, world, cast, and
visual-asset needs live in `docs/GAME_DESIGN_BRIEF.md` — read it before
writing or sending any prompt below that touches copy or adds a screen.

This pivot changes **presentation and copy only**. It does not change:

- the SQL loop (read a brief, write a query, run it locally, get a
  result-based verdict);
- the grading contract (compare executed result tables, never SQL text);
- the syllabus coverage or mission data (same 9 chapters, same reference
  queries and expected results);
- the functional accessibility floor (keyboard operability, visible focus,
  readable/navigable tables, feedback that never relies on color alone) on
  any text-heavy learning surface.

**Second pivot, 2026-08-06 (read `docs/GAME_DESIGN_BRIEF.md` §A6-A8
before touching layout or CSS):** the terminal/CRT look that was previously
confined to decorative screens (avatar creator, sector transitions) is now
the whole app's visual system, including the brief, schema explorer, SQL
editor, results table, and feedback. The old rule that those surfaces must
keep the specific navy/cream/teal palette is retired — contrast is no
longer pinned to that palette, though it should still be checked and kept
high as the new palette rolls out (the retro palette already measures well
above WCAG AA on the screens that use it today). The functional floor above
(keyboard, focus, table readability, non-color feedback) is unaffected and
still applies everywhere. This pivot also adds a page-level no-scroll
layout requirement and a phased animation/cutscene plan — see
`docs/GAME_DESIGN_BRIEF.md` §A7-A8 for both.

Glossary — use these consistently in new copy and prompts:

| Real-world term | In-game term |
| --- | --- |
| Chapter | Sector (see the table in `docs/GAME_DESIGN_BRIEF.md` §4 for names) |
| Mission | Terminal (a corrupted terminal inside a sector) |
| Completing a mission | Purging / restoring a terminal |
| The AI-verification chapter's antagonist | ROGUE.exe |
| Player | The Recruit |

## The important mode clarification

You do **not** need to paste every prompt into one Goal Mode turn.

Use one Goal Mode objective per milestone, then send the implementation prompts
as ordinary follow-up messages, one at a time:

```text
Build and verify Metric Quest's Week 1 vertical slice: an accessible browser
SQL game with a local SQLite runner, result-based validation, saved progress,
points/badges, and the first four approved missions.
```

After Prompt 1 finishes, review the diff and checks, then send Prompt 2 in the
same active goal. Select Goal Mode again only when you start a new milestone or
the previous goal is complete. You do not need a separate goal for each feature.

Use Plan Mode when you want analysis without edits:

- before a major architecture decision;
- before changing the SQL execution or safety boundary;
- before comparing two UI designs;
- before a release audit where you want findings rather than fixes.

Approve the plan, then return to Goal Mode for implementation. Plan Mode is not
needed for every bounded coding prompt.

## Repository setup

Create a Git repository and keep these durable files at its root or in `docs/`:

```text
AGENTS.md                    Codex/project workflow rules
CLAUDE.md                    Claude Code project memory
README.md                    setup, scripts, project structure
docs/AI_WORKFLOW.md          shared rules, verification commands, git workflow
docs/architecture.md         product boundary and current foundation
docs/GAME_DESIGN_BRIEF.md    narrative, world, and visual-asset brief
SQL_CASEFILES_MISSION_CURRICULUM.md   source of truth for mission content
```

Keep shared decisions in `docs/AI_WORKFLOW.md`; do not duplicate the entire
curriculum in both `AGENTS.md` and `CLAUDE.md`.

## How to divide the work

Use Codex as the default owner for SQLite behavior, data inspection, mission
correctness, validators, tests, and release audits. Use Claude Code as the
default owner for component implementation, layout, learner-facing interaction,
narrative/UI copy, and accessibility polish. Either tool can do either kind of
work; the key rule is one named owner per bounded change.

Never have both tools edit the same feature simultaneously. Finish a task,
review the diff, run checks, and commit before handing the repository to the
other tool. Both tools branch per session and get merge approval before
touching `main` — see the git workflow section of `docs/AI_WORKFLOW.md`.

## Claude Code practices to use

1. Run Claude Code from the repository root so it can inspect the project.
2. Run `/init` once to create project memory, then keep `CLAUDE.md` short and
   specific. Reference `docs/AI_WORKFLOW.md` rather than copying everything.
3. For architecture or design questions, start a read-only planning session:

   ```text
   claude --permission-mode plan
   ```

   Ask Claude to inspect the repository, identify risks, and propose a plan.
   Do not ask it to implement until you approve the plan.
4. For implementation, use normal permission prompts or a bounded edit mode.
   Review commands and diffs. Do not use a permission bypass for this project.
5. Keep related follow-ups in the same session with `claude -c` or
   `claude --continue`. Start a fresh session when ownership or scope changes.
6. Ask for tests after every edit and require a handoff summary.
7. Let Claude inspect the repository rather than pasting the whole codebase into
   the prompt.

## The prompt shape to use every time

Each request should contain five pieces:

```text
Context: read these files and inspect the current implementation.
Bounded task: change only this feature.
Constraints: preserve these contracts and safety rules.
Acceptance criteria: these behaviors/tests must pass.
Handoff: report changed files, checks run, decisions, and remaining risk.
```

## Status as of the narrative pivot

Prompts 1-13 below have all actually been run (Prompt 1's execution went
further than its own text asked for and already delivered the outcomes
originally planned as separate Prompts 3, 5, and 6). Concretely, the
codebase has:

- a working browser-only `sql.js` runner with error handling and tests,
  including correct handling of a valid query that legitimately returns
  zero rows, and an approved, narrow, opt-in exception (`allowsTempWorkspace`
  on a mission) that lets exactly two missions run one CREATE TEMP
  TABLE/VIEW setup statement before the graded SELECT (`src/lib/sqlRunner.ts`);
- a result-based validator with normalization for column case, numeric
  precision, and optional row order (`src/lib/grading.ts`);
- 25 tested missions covering the full curriculum, Chapters 1-9: M1.1-M1.4,
  M2.1-M2.3, M3.1-M3.4, M4.1-M4.3, M5.1-M5.2, M6.1-M6.2, M7.1-M7.2,
  M8.1-M8.3, M9.1-M9.2 (`src/lib/missions.ts`), each with a fixture test
  (`src/lib/missions.test.ts`) that runs its reference solution against the
  real approved dataset, through the same executor the app uses, and checks
  it actually validates;
- versioned local progress, additive avatar and seen-sector fields
  (`src/lib/progress.ts`);
- the accessible learner-facing shell (Home/onboarding view, Mission view,
  chapter map, progress bar, schema explorer, SQL editor, hints, feedback,
  results table);
- the rogue-AI narrative pass (Prompt 7), a real-art avatar creator (Prompt
  8), one-time text-only sector-transition interstitials (Prompt 9), and an
  accessibility/interaction polish pass (Prompt 10).

Prompts 3, 4, 5, and 6 below are kept for historical record but do **not**
need to be re-run. Prompts 7-13 are also done -- Week 2 is complete.
Prompt 14 (final cases M8.2, M8.3, M9.1, M9.2) is also done -- run by
Claude Code this session, adapted to keep all four as real graded-SQL
missions rather than introducing a new reflection/multiple-choice mechanic
(that stays future work; see the mission-by-mission curriculum note on
M8.3/M9.1). Prompt 15 (release UX review) is also done -- run by Claude
Code this session: contrast, keyboard flow/focus visibility, 320px-desktop
responsiveness, and the never-before-reachable campaign-completion state
(all 25 missions done -- only possible now that Sector 9 exists) were all
checked with no defects found, so nothing needed fixing. Prompt 16 (final
audit and deployment preparation) is also done -- **Week 3, and the full
three-week plan, are complete.** See Prompt 16's entry below for the audit
findings and the two low-risk doc fixes it made. Nothing in this playbook
is queued next; new work now comes from a genuine backlog (real
sector-background/ROGUE.exe art from Claude Design, the Phase 2/3
animation roadmap in `docs/GAME_DESIGN_BRIEF.md` §A8, or a real
structured-answer mechanic for a future M8.3/M9.1-style mission) rather
than from an unsent prompt in this file.

## Week 1: foundation and vertical slice

Send these as separate follow-ups inside the Week 1 Goal.

### Prompt 1 — Codex: inspect and scaffold ✅ done

```text
Read the current repository before editing. We are building Metric Quest, an
accessible browser SQL game for Tech MBA students using a local SQLite music
retailer dataset.

Create a React + TypeScript project foundation and durable instructions. Add
AGENTS.md, CLAUDE.md, docs/AI_WORKFLOW.md, and docs/architecture.md. Document
the browser-only SQLite boundary, result-based grading, local progress, the
required test/typecheck/lint/build commands, and the rule that course data must
be approved or minimized before public deployment.

Do not build the full UI or curriculum yet. Inspect any supplied iTunes
database without modifying it. Add one smoke test. Show the proposed file
structure first, then implement it. Run all available checks and provide a
handoff summary.
```

### Prompt 2 — Claude Code: shell and onboarding ✅ done

```text
Read README.md, CLAUDE.md, docs/AI_WORKFLOW.md, docs/architecture.md, and the
existing source tree. Implement only the learner-facing shell for Metric Quest.

Create an accessible home/onboarding view and mission view with Aurora Music
business context, chapter map, progress bar, points/badges, business brief,
schema explorer placeholder, SQL editor placeholder, results area, hints, and
feedback. Use a high-contrast navy/cream/teal visual system. Support keyboard
navigation, visible focus, readable tables, and 320px through desktop widths.

Do not change database or mission-validation logic. Run the existing checks and
report changed files, manual accessibility checks, and remaining placeholders.
```

### Prompt 3 — Codex: SQLite runner (already delivered, see Status above)

```text
Inspect the existing shell and documentation. Implement the browser-only SQLite
runner using sql.js or an equivalent browser-safe package. Load an approved
local copy or minimized derivative of iTunes.sqlite without modifying the
original course file.

Return typed columns and serializable rows, map syntax/runtime errors to plain
language, and reset database state when a mission starts. Initially allow only
read-only SELECT queries; reject writes with a clear explanation. Keep the
interface extensible for later isolated temporary-table/view missions.

Add tests for successful execution, syntax errors, and blocked writes. Run
typecheck, lint, tests, and build. Provide a handoff.
```

### Prompt 4 — Claude Code: first mission (already delivered, see Status above)

```text
Read the mission curriculum and current query-runner interfaces. Implement the
complete learner flow for M1.1 Priority invoices: business brief, starter SQL,
two hints, schema visibility, Run Query, result table, specific error feedback,
success lesson, points, local progress, and the Revenue Scout badge.

Do not compare SQL strings. Use the existing result-validation contract. Do not
reveal the solution unless the player requests it. Do not change the SQLite
runner. Test the keyboard path and run all project checks. Provide a handoff.
```

### Prompt 5 — Codex: validator (already delivered, see Status above)

```text
Inspect M1.1, the mission model, and the current runner. Implement a reusable
result-table validator. Normalize column-name case, NULL/number/string values,
and numeric precision safely. Preserve row order only for order-sensitive
missions. Return actionable mismatch categories: wrong columns, row count,
values, or order.

Add fixtures showing that an equivalent correct query passes and common near
misses fail. Refactor M1.1 to use it. Never accept an unexecuted query or bypass
the SQLite runner. Run the full suite and report examples of pass/fail behavior.
```

### Prompt 6 — Codex: remaining vertical-slice missions (already delivered, see Status above)

```text
Add and test M2.1 Country revenue, M3.1 Name the high-value customers, and M8.1
Duplicate-customer trap from the approved curriculum. Validate every reference
query against the approved local iTunes data before encoding expected results.

M8.1 must teach why a customer/invoice join can overcount customers and accept
the correct result of 59 unique purchasers. Preserve result-based grading,
hints, points, badges, and beginner-readable explanations. Do not add visual
features. Run tests and provide a handoff.
```

### Prompt 7 — Claude Code: rogue-AI narrative pass ✅ done

```text
Read docs/GAME_DESIGN_BRIEF.md and the current source tree. This is a copy and
content pass only — do not touch grading, the runner, expected results, or
mission IDs.

Rewrite the brief, hints, and success-lesson text for the four existing
missions (M1.1, M2.1, M3.1, M8.1) into the rogue-AI/mainframe narrative from
the design brief: the player is restoring a corrupted terminal, not just
answering a business memo. Keep each mission's underlying business question
recognizable so the SQL objective stays clear.

Rename the chapters shown in src/content/chapters.ts to their Sector names
from the design brief (keep chapter numbers and the original concept
subtitle for continuity). Update Home/Mission view copy (masthead, onboarding
text, mission-reward copy) to match the new framing. Use the tone from the
design brief: playful retro-arcade, not a serious thriller.

Do not add any new screens, sprites, or illustrations in this prompt — text
only. Run all checks and report exactly which copy changed.
```

### Prompt 8 — Claude Code: avatar / character-creation screen ✅ done

```text
Read docs/GAME_DESIGN_BRIEF.md section 6 and the current progress/localStorage
contract in src/lib/progress.ts. Build a one-time avatar/character-creation
screen shown before the player's first mission, reachable again later if the
player wants to redo it.

Let the player pick a base sprite, a color/outfit recolor, and type a
callsign. Store the choice additively in local progress (extend the schema
without breaking existing saved progress; default-fill if a saved record has
no avatar yet). Ship with simple placeholder art (CSS/SVG shapes, or a
provided sprite sheet if art has landed from Claude Design by the time you
run this) — structure the component so swapping in final art later is a
drop-in asset change, not a rewrite.

Every choice must be a labeled, keyboard-operable control, with visible focus
and a sensible default so skipping the creator never blocks progress. Do not
change grading, the runner, or mission data. Run all checks and report
whether placeholder or final art was used.
```

### Prompt 9 — Claude Code: mainframe sector-transition screens ✅ done

```text
Read docs/GAME_DESIGN_BRIEF.md section 7. Add a short, mostly static
transition screen shown the first time a player enters a new sector, before
that mission's content loads: a background scene for the sector, the
player's avatar composited on it, 1-2 lines of flavor text, and a Continue
action. This is not player-controlled movement.

Cover Sectors 1, 2, 3, and 8 first (they already have missions). If no
illustration exists yet for a sector, fall back gracefully to a text-only
transition — never block a sector on missing art. Make the transition
skippable and keyboard-dismissible, and make sure it only shows once per
sector per player (respect existing progress). Do not change grading, the
runner, or mission data. Run all checks and report which sectors have real
art versus a text fallback.
```

### Prompt 10 — Claude Code: accessibility and interaction polish ✅ done

```text
Review the working four-mission vertical slice, now including the narrative
pass, avatar creator, and sector transitions, as a novice Tech MBA learner.
Improve only interaction clarity and accessibility: onboarding, transitions,
hint disclosure, loading/empty/error states, result-table readability, mobile
layout, focus visibility, and non-color feedback.

Preserve SQL behavior, mission content, and validator contracts. Confirm the
retro/pixel-art presentation added in Prompts 7-9 has not reduced contrast or
keyboard operability anywhere on a text-heavy learning surface (brief, schema
explorer, SQL editor, results table, feedback) — that floor is non-negotiable
per docs/GAME_DESIGN_BRIEF.md. Run checks and provide a manual keyboard test
checklist.
```

## Week 2: full syllabus

Create a new Goal Mode objective:

```text
Complete and verify Metric Quest's full NBA 6550 SQL learning path using the
approved mission curriculum, with tested result validation and isolated
multi-statement exercises, authored in the rogue-AI narrative voice from the
start.
```

Then send these separately:

### Prompt 11 — Codex: content batches ✅ done (run by Claude Code this session)

```text
Read docs/GAME_DESIGN_BRIEF.md for the narrative voice and Sector names, then
implement the next mission batch from the curriculum. Start with M1.2-M1.4,
M2.2-M2.3, and M3.2-M3.4. Write each business brief, hint set, and success
lesson in the rogue-AI/mainframe voice directly — do not write a real-world
memo version first and re-theme it later.

Verify every reference query against the approved database, add
expected-result fixtures, and add a test for every mission. Report any query
that needs correction instead of silently changing the curriculum. Preserve
existing accessibility and grading contracts.
```

Repeat the same prompt for each chapter batch rather than asking for the entire
curriculum in one turn.

### Prompt 12 — Codex: advanced SQL safety ✅ done (run by Claude Code this session)

```text
Assess whether the current runner can safely support M4.1-M7.2: subqueries,
CTEs, dates, CASE, CAST, UNION, temporary tables, and views. First propose the
smallest safe design for multi-statement missions in read-only/isolated state.
Do not edit until the design is approved.
```

After approving the plan, send:

```text
Implement the approved isolated multi-statement design and the M4.1-M7.2
missions, written in the rogue-AI narrative voice per docs/GAME_DESIGN_BRIEF.md.
Reset state at every mission, restrict permitted statements to the configured
exercise, and add tests for both accepted workflows and blocked unsafe writes.
Run all checks and report the security boundary.
```

### Prompt 13 — Claude Code: advanced learning UX ✅ done (run by Claude Code this session)

```text
Read the new mission definitions and improve the learner experience for joins,
CTEs, dates, CASE, casts, sets, and views. Add a compact schema relationship
aid, clear multi-statement instructions, and fixed teaching explanations from
mission data. If sector-transition art for Sectors 4-7 has landed from Claude
Design by this point, wire it in per Prompt 9's pattern; otherwise leave the
text-only fallback in place. Do not call an external AI API and do not change
SQL evaluation or expected results. Test keyboard and small-screen use and
provide a handoff.
```

## Week 3: responsible analysis and release

Create a new Goal Mode objective:

```text
Finish, assess, and release Metric Quest: complete the final AI-verification
and SELECT-framework cases as the Sector 8 and Sector 9 (final boss)
confrontations with the rogue AI, verify every syllabus topic, and prepare a
tested static deployment.
```

### Prompt 14 — Codex: final cases ✅ done (run by Claude Code this session)

```text
Implement M8.2, M8.3, M9.1, and M9.2 exactly as structured in the curriculum,
framed per docs/GAME_DESIGN_BRIEF.md as ROGUE.exe's Inner Sanctum (Sector 8) and
the Boardroom Core final confrontation (Sector 9). AI-review cases must expose
missing filters, duplicate counts, or unsupported claims without calling an
external model. The final case must capture a measurable framing choice,
validate SQL output, and require a caveat about inference limits — stage it as
the frame/explore/execute/challenge phases of the final battle described in
the design brief. Add tests for accepted and rejected structured answers and
run the complete suite.
```

Delivered as four ordinary graded-SQL missions (same shape as every other
mission in `src/lib/missions.ts`) rather than a new structured-answer/
multiple-choice mechanic — the "AI-review" and "caveat about inference
limits" beats live in each mission's brief/successLesson copy, not as a
separate grading path. A new mechanic type stays explicit future work.

### Prompt 15 — Claude Code: release UX review ✅ done (run by Claude Code this session)

```text
Perform a release-readiness pass without changing architecture or mission
correctness. Inspect every screen for visual consistency, responsiveness,
keyboard flow, focus visibility, contrast, table readability, and clear
wording — including the avatar creator, sector transitions, and any ROGUE.exe
illustrations added since Prompt 7. Confirm decorative/narrative elements
degrade gracefully wherever art has not landed yet. Fix only verified
presentation/accessibility issues. Run existing checks and leave a checklist
of anything requiring human review.
```

Findings: computed WCAG contrast for every palette pair in `src/styles.css`
(all pass AA, most 7:1+, including the `--retro-muted` on
`--retro-panel-raised` pairing the design brief flagged as worth re-checking);
walked Home, Mission, Avatar Creator, and all 9 Sector Transitions across
320px/mobile/tablet/1280px desktop; verified tab order and `:focus-visible`
across every interactive element; and — for the first time ever, since
Sector 9 didn't exist before this session — simulated full campaign
completion (25/25 missions, all 9 badges) to confirm the Home view's
end state renders cleanly with no dead-end. No presentation or
accessibility defects found; no fixes were needed. One tooling note, not an
app defect: the browser-automation harness's synthetic Enter/Space key
dispatch doesn't trigger Chromium's default action on native `<button>`
elements app-wide (confirmed by testing unrelated buttons; `element.click()`
always worked). All interactive controls are plain semantic HTML
(`button`, `input`, `textarea`, `details`/`summary`) with no custom keydown
handling that could block real keyboard activation, so this doesn't reflect
an app-side keyboard-accessibility gap.

### Prompt 16 — Codex: final audit and deployment preparation ✅ done (run by Claude Code this session)

```text
Audit the current project against the product plan, mission curriculum, and
docs/GAME_DESIGN_BRIEF.md. Verify that every syllabus topic has an implemented
mission, every reference query is tested against approved data, grading is
result-based, progress (including avatar data) works and tolerates old saves,
and no backend/account/paid API is required for v1.

Run tests, typecheck, lint, and production build. Update README.md deployment
instructions for a static host such as Vercel, including the actual build
command and output directory. Do not publish anything. Report prioritized
findings with file and line references, and fix only clear low-risk defects.
```

Audit results, all confirmed:
- Full syllabus coverage: 25/25 missions (M1.1-M9.2) match the curriculum's
  chapter/concept structure one-for-one.
- Every mission's `solutionSql` is executed against the real
  `SQL Databases/iTunes.sqlite` and validated in
  `src/lib/missions.test.ts` (25 fixture tests, one per mission).
- Grading is strictly result-based (`src/lib/grading.ts` compares executed
  tables; `src/lib/sqlRunner.ts` never accepts unexecuted SQL).
- `src/lib/progress.test.ts` explicitly tests backward compatibility: an
  older save missing `avatar` or `seenSectors` entirely, and a malformed
  `avatar` value, both load safely without discarding other progress.
- No backend/account/paid API: the only `fetch` in the codebase
  (`src/lib/sqlRunner.ts:179`) loads the bundled same-origin
  `iTunes.sqlite` asset, not an external service.

Fixes applied (both low-risk doc corrections, no code/behavior changes):
- `docs/architecture.md`: corrected a stale line claiming
  `src/lib/missions.ts` "contains only M1.1, M2.1, M3.1, and M8.1" (true at
  Week 1, false since Week 2) to reflect the full 25-mission curriculum.
- `README.md`: added a **Deployment** section (build command `npm run
  build`, output directory `dist/`, Vercel-specific settings, and a pointer
  to the `docs/AI_WORKFLOW.md` course-data release gate before any public
  deploy) and fixed the Quick Start section, which said `pnpm install` /
  `pnpm run dev` while every other doc in the repo (`AGENTS.md`,
  `CLAUDE.md`, `docs/AI_WORKFLOW.md`) says `npm run ...` — now consistent
  on `npm` throughout the README.

Not fixed, flagged for awareness only: the repo has a tracked
`pnpm-lock.yaml` even though every instruction file standardizes on `npm`.
Both package managers run the existing scripts fine once `node_modules`
exists, so this is a documentation-consistency question, not a functional
defect — pick one canonical package manager and remove the other's lockfile
when convenient, but that's a call for the user, not an unprompted fix.

`npm run check` (lint + test + typecheck + build) is green after all fixes.

## Handoff template

```text
Handoff
- Outcome completed:
- Files changed:
- Checks run and result:
- Decisions made:
- Known limitations or follow-up:
- Recommended next owner: Codex / Claude Code / me
```

## Rule of thumb

If the prompt says "inspect," "compare," "propose," or "audit," use Plan Mode.
If it says "implement," "add," "fix," or "test and repair," use Goal Mode when it
belongs to the active milestone. Send one bounded prompt, wait for its handoff,
review the diff, then continue.

### Sources for the Claude Code practices

- [Claude Code CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
- [Claude Code common workflows](https://docs.anthropic.com/en/docs/claude-code/common-tasks)
- [Claude Code memory and `CLAUDE.md`](https://docs.anthropic.com/en/docs/claude-code/memory)
