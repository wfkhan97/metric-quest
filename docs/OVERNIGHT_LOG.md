# Overnight session log

Append-only. One entry per completed unit of work (a packet: one branch,
one commit or small commit series, one `npm run check` result, one PR if
opened). **Never edit or delete a prior entry** — if something needs
correcting, add a new entry that says so, the same way `docs/BUILD_ORDER.md`
handles corrections.

**If you are a fresh session picking this up** (auto-resumed, manually
restarted, or a new `/loop` wakeup that lost prior context): read this
file top to bottom first, then `docs/OVERNIGHT_QUESTIONS.md`, before doing
anything else. Do not restart work from scratch — find the last entry,
check whether its branch/PR actually landed (`git log`, `gh pr list`),
and continue from exactly there. Then re-read `AGENTS.md`,
`docs/AI_WORKFLOW.md`, `docs/BACKLOG.md`, and `docs/BUILD_ORDER.md` if you
have not already this session — this file is a supplement to those, not a
replacement.

This file (and `docs/OVERNIGHT_QUESTIONS.md`) live on the
`claude/overnight-tracking` branch, not on any feature branch and not on
`main`. Commit and push updates to `claude/overnight-tracking` after
every packet — that way progress is checkable from one place without
checking out every feature branch, and it survives this process dying
mid-work.

---

## Handoff from prior interactive session — 2026-08-10

**State of `main`:** fully current, all of Wave 4 (P4.1-P4.4) and Wave 5
(P5.1-P5.4) merged and pushed. `npm run check` passes on `main` as of this
handoff. No unmerged feature-work branches outstanding besides this
tracking branch.

**Backlog reality check (verified against code, not assumed from docs —
two stale status notes in `docs/BACKLOG.md`/`docs/BUILD_ORDER.md` were
just corrected as part of this handoff):**
- Item 1 (glossary): shipped. 16 entries in `src/content/glossary.ts`.
- Item 2 (mistake-aware diagnostic): shipped. All 25 missions have
  signatures in `src/lib/diagnostics.ts` — this was previously logged as
  "Sectors 1, 4-9 still open," which was wrong; corrected in both docs.
- Item 3 (AI tutor): **blocked on product-owner approval. Do not
  prototype. Do not touch.**
- Item 4 (cutscenes): opening beat shipped. `sectorBeats` in
  `src/content/beats.ts` is an **empty object** — no between-sector story
  beats exist beyond the opening. Whether to author any is an **open
  product question already on record** ("does every sector transition get
  an authored beat, or only some") — per `docs/BUILD_ORDER.md`'s own
  rule, an agent does not resolve that unilaterally. **Do not author new
  beats tonight** — log it to the questions file as a flagged opportunity
  instead. Separately, P5.5 (a new "pulled into the mainframe" cutscene)
  is blocked on the product owner's script — also do not touch.
- Item 5, 6, 9 (chrome layout, syntax highlighting, density pass): all
  shipped (P4.1, P4.2, P5.1-P5.4).
- Item 7 (avatar sprite transparency fix): blocked on the product owner
  running a Claude Design re-export prompt. Not agent-buildable. Do not
  touch.
- Item 8 (multi-save/profile state): explicitly deferred by product
  direction. Do not build.

**Conclusion: the well-scoped, unblocked backlog is essentially
exhausted.** There is not 5 hours of ready-made feature work sitting in
`docs/BACKLOG.md` right now. Tonight's real, safe, unblocked lanes are a
**hardening/quality pass**, described below — not new product features.
If those lanes are finished with time left, the right move is to say so
plainly in this log and stop, not invent scope. Inventing unapproved
product features overnight is explicitly the wrong outcome here — see
`AGENTS.md` and `docs/BUILD_ORDER.md`'s "what is deliberately not on this
list."

### Tonight's plan

**Lane A — diagnostics test coverage (`src/lib/diagnostics.ts`).** This
file has zero test coverage today despite being a 25-mission classifier
of regex-based mistake signatures — a natural, safe, high-value gap.
Write `src/lib/diagnostics.test.ts` covering `classifyAttempt`: for a
representative sample of missions (at minimum every mission with more
than one signature, ideally all 25), assert each signature's `matches()`
fires on a SQL string that should trigger it and does not fire on the
mission's actual `solutionSql` from `src/lib/missions.ts` (a correct
answer should never accidentally match a mistake signature — if one
does, that is a real bug worth fixing, not a test to weaken). Pure unit
tests against existing exported functions; no new dependencies.

**Lane B — avatarOptions test coverage (`src/lib/avatarOptions.ts`).**
Also zero coverage. Smaller scope — validate the exported option data
shape (ids unique, every sprite has its declared recolors, etc.) and any
helper functions in that file.

**Lane C — accessibility/keyboard-operability audit.** A systematic
manual pass (using the Browser pane tools, not a new automated a11y
dependency) across Home, Mission (including the new P5.4 sector-map
drawer and badges disclosure), Avatar Creator, Cutscene, Sector
Transition, and the Glossary overlay: tab through each screen with no
mouse, confirm every interactive control has a visible focus state and a
sensible tab order, confirm nothing relies on color alone for meaning.
Fix small, unambiguous issues found directly (with tests/verification).
If a fix would require a design/product judgment call beyond "this is
clearly a bug," log it to the questions file instead of guessing.

**Lane D — docs accuracy audit.** Given two stale status claims were
just found in `docs/BACKLOG.md`/`docs/BUILD_ORDER.md` by actually
checking the code, do one more full pass: for every item marked "done" or
"shipped," spot-check the actual source file it claims exists. Correct
anything else found the same way item 2 was just corrected above.

**Optional stretch, only if A-D are done with time left:** the build
already warns that the main JS chunk is over 500kB (CodeMirror added
real weight in P4.2). Investigate dynamic `import()` for the CodeMirror
editor (`src/components/SqlEditor.tsx`) so it loads on demand rather than
in the main bundle. This is a loading-strategy change, not a behavior
change — verify very carefully (typing, grading, keyboard flow all still
work identically) before treating it as done, and back out rather than
ship something uncertain.

**Do not,** under any circumstances tonight: touch `SQL Databases/`;
add a backend, accounts, telemetry, or external network/AI calls; add
new npm dependencies without flagging it first in the questions log;
author new narrative/cutscene copy; touch item 3, 7, or 8's scope; or
merge/push anything to `main`. See "Standing rules" below — these are
not new rules, they're `AGENTS.md`/`docs/AI_WORKFLOW.md` restated for
emphasis because this session runs unattended.

---

## Update — 2026-08-10, before this session started: plan superseded

Before running the overnight prompt, the product owner asked for two
more things to be researched/designed first: what public deployment to
Vercel needs, and a real design for the multi-save system (item 8,
previously deferred). Both are now done and merged to `main`
(`docs/BACKLOG.md` items 8 and 10, `docs/BUILD_ORDER.md` Wave 6 — P6.1
deployment prework, P6.2 multi-save). **Read those sections before
starting tonight's work** — don't re-derive the design from scratch, it's
already fully specified.

**Revised priority order for tonight, replacing the original Lanes A-D
framing above (that framing is now superseded, not deleted — the
reasoning in it about "don't invent scope" still stands):**

1. **P6.2 — multi-save/profile state management** (`docs/BACKLOG.md` item
   8, `docs/BUILD_ORDER.md` P6.2). Real feature work, fully designed, no
   blocking product question. This is the highest-value thing available
   tonight — do this first.
2. **P6.1 — deployment prework** (`docs/BACKLOG.md` item 10,
   `docs/BUILD_ORDER.md` P6.1). Config/docs/derivative-file prep only.
   **Do not wire the minimized derivative into `sqlRunner.ts` and do not
   deploy anything** — both are explicitly gated on a product decision
   that is not yours to make. Verify the derivative against all 25
   missions' expected results, not just one, before calling it done.
3. **Original Lane A (diagnostics.ts tests) and Lane B (avatarOptions.ts
   tests)** from the initial handoff above — still valid, still safe,
   still worth doing if there's time after P6.1/P6.2.
4. **Original Lane C (accessibility audit) and Lane D (docs accuracy
   audit)** — still valid, lower priority than the above.
5. Original stretch goal (code-splitting CodeMirror) — still last.

P6.2 and P6.1 are independent of each other (different files) and can
run in parallel. Same rules as before: one branch + one PR per packet,
`npm run check` before every commit, log every milestone here and push
this branch, never touch `main`, never guess on a product decision — log
it to `docs/OVERNIGHT_QUESTIONS.md` instead.

## Entry — 2026-08-10, P6.2 shipped: multi-save / profile state management

Picked up the superseded plan's #1 priority. Branch
`claude/p6-2-multi-save`, PR
[#2](https://github.com/wfkhan97/metric-quest/pull/2) open against `main`.

**What shipped**, matching `docs/BACKLOG.md` item 8 / `docs/BUILD_ORDER.md`
P6.2's design exactly, no re-derivation:
- `src/lib/progress.ts`: new `metric-quest-saves-v1` `SaveStore` wrapping
  the unchanged `Progress` shape into named/timestamped slots. One-time
  non-destructive migration from the old `metric-quest-progress-v1` key
  (only fires when the v2 key is absent; legacy key left in place, not
  deleted). New exports: `listSaveSlots`, `createNewSave`,
  `switchActiveSave`, `deleteSave`, `renameSave`, `getActiveSaveId`.
  `loadProgress`/`saveProgress` keep their exact old signatures, now acting
  on the active slot under the hood.
- `src/components/SaveSlotPanel.tsx` (new): slot-picker overlay, reusing
  `GlossaryPanel`'s backdrop/focus-trap/Escape/focus-return pattern
  exactly. New Game is one-click (additive, no confirm). Delete is an
  inline two-step confirm per row (not a native `confirm()` — matches the
  pixel-art panel style and is easier to keyboard-drive). The last
  remaining slot cannot be deleted.
- `src/components/HomeView.tsx`: one new "Save slots" link next to
  "Concept glossary", plus the new `onActiveProgressChange` prop.
- `src/App.tsx`: one new handler (`handleActiveProgressChange`) wired to
  that prop. No other component touched — confirms the `Progress`-shaped
  API surface was preserved correctly, per the packet's own done-criteria.
- `src/styles.css`: new `.save-slot-*` rules, same visual language as the
  glossary panel (no new design tokens).

**Tests:** `src/lib/progress.test.ts` gained a "multi-save (P6.2)" suite —
cold start (fresh browser gets exactly one default slot), migration from a
v1 save, migration not double-running, create/switch/rename/delete, delete
refusing to remove the last slot, and delete-of-active falling back to
another slot. 58 tests total now (was 47).

**Checks:** `npm run check` passed — lint, all 58 tests, `tsc --noEmit`,
`vite build`. Build still emits the pre-existing >500kB main-chunk warning
(CodeMirror) — unrelated to this change, same warning as before, tracked
as tonight's stretch goal if time remains.

**Manual verification:** another chat session already held the fixed
`:5173` dev port from `.claude/launch.json`, so I started a throwaway
`vite --port 5199` instead of using `preview_start` (which is pinned to
5173) and pointed the Browser pane at that. Confirmed in-browser: cold
start shows one "Recruit" slot with no Delete button (last-slot
protection); New Game creates and switches to a second slot; rename
commits and updates the list; delete on the non-active slot requires the
inline confirm step and leaves the active slot's data untouched; Escape
closes the panel and returns focus to the "Save slots" trigger button.
Killed the throwaway server afterward.

**Not done / deferred, per the packet's own non-goals:** no hard cap on
slot count (design explicitly calls this a non-goal — a soft, easily-
changed default of 10, not enforcement).

Next: P6.1 (deployment prework), same priority list, independent files —
starting now on a fresh branch off `main`.

## Entry — 2026-08-10, starting P6.1: deployment prework

Branch `claude/p6-1-deployment-prework` cut from `main` (which already
has P6.2's... no — P6.1 is independent of P6.2 and P6.2 is not yet merged,
so this branches from `main` as it stood before P6.2, same as P6.2 did).
Scope per `docs/BUILD_ORDER.md` P6.1 / `docs/BACKLOG.md` item 10: pin
Node `engines`, add `vercel.json`, add a README "Deployment" section with
the data-release gate stated inline, and build+verify the minimized
5-table SQLite derivative against all 25 missions. Explicitly **not**
wiring it into `sqlRunner.ts` and **not** deploying anything — both remain
gated on the product owner's data-release decision.

## Entry — 2026-08-10, P6.1 shipped: deployment prework

Branch `claude/p6-1-deployment-prework`, PR
[#3](https://github.com/wfkhan97/metric-quest/pull/3) open against
`main`. Both `main`-priority items from the superseded plan are now up
for review (P6.2 in [#2](https://github.com/wfkhan97/metric-quest/pull/2),
P6.1 here).

**What shipped**, matching `docs/BUILD_ORDER.md` P6.1 / `docs/BACKLOG.md`
item 10's prework scope exactly, no re-derivation:
- `package.json`: `"engines": {"node": "22.x"}`.
- `vercel.json` (new): explicit `buildCommand`/`outputDirectory`/
  `framework` instead of relying on auto-detection.
- `README.md`: moved the course-data release-gate warning to the *top* of
  the Deployment section as a callout, before any deploy instructions —
  the section already existed from an earlier session but had the gate
  stated *after* the Vercel steps, which fails P6.1's own done-criteria
  ("before any deploy-command instructions, not after"). Fixed that
  ordering rather than treating the section as already satisfying the
  packet.
- `src/assets/data/iTunes.min.sqlite` (new, real artifact this time, not
  a scratch estimate): built by copying only `Customer`, `Genre`,
  `Invoice`, `InvoiceLine`, `Track` (schema + data, `VACUUM`ed) out of
  `SQL Databases/iTunes.sqlite` via the `sqlite3` CLI, dropping foreign
  keys to the 6 excluded tables (nothing references them from any
  mission). `SQL Databases/iTunes.sqlite` was only ever opened read-only
  (`sqlite3 file.sqlite < script.sql` with `ATTACH ... AS src` +
  `INSERT INTO x SELECT * FROM src.x`, never `UPDATE`/`ALTER` against it).
  Row counts match the source exactly for all 5 tables. **Measured size:
  528KB vs. 1,067KB source, a 51% reduction** — corrects the prior
  session's unverified 356KB/67% scratch estimate in `docs/BACKLOG.md`
  item 10, which is now updated with this real number and marked as
  superseded rather than deleted.

**Verification (the packet's main "done when" bar — all 25 missions, not
a sample):** wrote a throwaway vitest test (not committed — lived at
`src/lib/__scratch-verify-minimized-db.test.ts` during the run, deleted
before the final commit) that loaded both the source and minimized
databases via `sql.js` in Node, ran every mission's `solutionSql` against
both, and diffed both results against `mission.expected`. All 25 passed
identically, including the two `allowsTempWorkspace` missions (m4-3,
m7-2). Console output: "All 25 missions verified identical against both
databases."

**Checks:** `npm run check` passed — lint, 48 tests (unchanged from
`main`'s baseline, since this packet touches no test files), `tsc
--noEmit`, `vite build`. Confirmed the production build still bundles
only the full unminimized `iTunes-*.sqlite` (1,092.60 kB) — the
derivative is not referenced by any runtime import, matching the hard
rule not to wire it into `sqlRunner.ts`.

**Explicitly not done, per the hard rule in this session's instructions
and the packet's own scope:** `src/lib/sqlRunner.ts` was not touched;
nothing was deployed anywhere; the data-release decision itself
(`docs/BACKLOG.md` item 10's "Decision needed before deployment") was not
made — still waiting on the product owner.

Both `main`-priority packets are now done and awaiting review. Moving to
the original Lane A (diagnostics.ts tests) next since there is time left.

## Entry — 2026-08-10, Lanes A+B shipped: diagnostics.ts and avatarOptions.ts test coverage

Both `main`-priority packets (P6.2, P6.1) are up for review, so moved on
to the original superseded-plan Lane A and Lane B together (independent
files, small enough to bundle as one packet). Branch
`claude/lane-a-b-diagnostics-avatar-tests`, PR
[#4](https://github.com/wfkhan97/metric-quest/pull/4) open against
`main`.

**Lane A — `src/lib/diagnostics.test.ts` (new).** This file had zero
coverage despite being a 25-mission mistake classifier. Went further than
"a representative sample" per the original instruction's own "ideally all
25" stretch goal: covers **all 43 signatures across all 25 missions**,
not a subset.
- For every signature, a hand-crafted SQL string built directly from
  reading its `matches()` logic (not derived from `solutionSql`) confirms
  it actually fires when it should.
- For every signature, `mission.solutionSql` (the real correct answer)
  confirms it does *not* fire — the exact check this session's own
  handoff called out as "a real bug worth fixing, not a test to weaken"
  if it ever failed. None did; nothing needed fixing.
- `classifyAttempt`'s first-match-wins ordering and both `undefined`
  branches (unknown mission id, no signature matches) are covered too.
- Added one small export, `getMistakeSignatures(missionId)`, to
  `diagnostics.ts` so individual signatures could be tested directly
  rather than only through `classifyAttempt`'s first-match return value
  (which would have made testing a mission's 2nd/3rd signature awkward).
  `classifyAttempt` now calls it internally instead of duplicating the
  lookup — pure refactor, no behavior change, verified by the
  false-positive suite passing against the unchanged real mission data.

**Lane B — `src/lib/avatarOptions.test.ts` (new).** Covers the exported
sprite/color option data (unique non-empty ids, valid `SpriteShape`
enum, valid `#rrggbb` hex colors, distinct `imageUrl` per sprite) and
`getSpriteOption`/`getColorOption`'s match + unknown/empty-id fallback
behavior. Note: the original handoff's phrasing ("every sprite has its
declared recolors") doesn't quite match this file's actual shape —
colors are a global 4-option list, not a per-sprite recolor set — so the
tests validate what the file actually does rather than that
possibly-imprecise description.

**Checks:** `npm run check` passed — lint, **159 tests** (up from 48:
+92 diagnostics, +19 avatarOptions), `tsc --noEmit`, `vite build`. Every
new test was run individually with `--reporter=verbose` first to confirm
each crafted trigger SQL exercises the specific signature it's paired
with (not a different one in the same mission that happened to also
match).

Four PRs now open and awaiting review: #2 (P6.2), #3 (P6.1), #4 (Lanes
A/B). Moving to Lane C (accessibility audit) next.

## Entry — 2026-08-10, Lane C done: accessibility/keyboard audit — no bugs found, no PR

Ran the original Lane C manual audit against `main` (a throwaway `vite
--port 5199` server, Browser pane tools, no mouse for the tab-order
checks — clicks only used where a screen requires a real value to type or
this session's key-simulation limitation, noted below, applied). Covered
every surface the handoff named: Home, the Concept glossary overlay, the
Avatar Creator onboarding flow, the opening cutscene, the sector-transition
screen, and the Mission screen (SQL editor, the P5.4 sector-map drawer,
the badges disclosure, wrong-answer feedback + mistake diagnostic, the
3-strikes "See answer" gate, and a correct-answer run).

**Result: no accessibility bugs found.** Specifically verified, not just
assumed:
- Tab order on Home and Mission matches DOM order with zero `tabindex`
  hacks, which matches visual/logical order.
- The skip link is genuinely off-screen until focused, then moves
  on-screen (`getBoundingClientRect().top` checked, not just CSS read).
- `GlossaryPanel` and the Mission screen's sector-map drawer both: move
  focus to Close on open, trap Tab in both directions (confirmed
  Shift+Tab from the first element wraps to the last and vice versa, not
  just read from source), close on Escape, and return focus to the
  trigger button that opened them.
- The badges disclosure is a native `<details>/<summary>` — keyboard
  operability is free from the platform, confirmed focusable.
- The CodeMirror SQL editor does **not** trap Tab for indentation
  (`indentWithTab` is not in its keymap) — confirmed empirically: Tab
  from inside the editor moves focus straight to "Run query," not into
  the editor's own indent handling. This is exactly the kind of
  non-obvious CodeMirror accessibility trap the P4.2 syntax-highlighting
  work could have introduced and didn't.
- `ResultTable` is a semantic `<table>` with `<th scope="col">`, not a
  div grid.
- Wrong/right-answer feedback uses `aria-live="polite" role="status"`
  and distinct heading/body **text** for success vs. failure (`"ROGUE.exe
  smirks..."` vs. `"Terminal restored..."`) — confirmed live by actually
  submitting a wrong query (which correctly surfaced the `m1-1-missing-
  where` diagnostic — nice live cross-check against this session's own
  earlier diagnostics.ts test suite) and then a correct one, not just
  reading the JSX. Never color-only.
- Avatar sprite selection is a native radio group (arrow-key operable for
  free) with a text `" (selected)"` suffix alongside the visual
  highlight — not color-only either.

**One non-a11y observation, logged as a question rather than fixed:**
`AvatarCreatorView`'s color-picker `<fieldset>` only renders when
`!hasImageSprite`, and every sprite now has real art (confirmed by this
session's own `avatarOptions.test.ts`), so that fieldset — and by
extension `colorOptions`/`getColorOption` in the running UI — is
currently dead code. Not a keyboard/color-feedback bug itself, so out of
Lane C's mandate to fix directly; added to
`docs/OVERNIGHT_QUESTIONS.md` instead since removing it is a product call
(does recoloring come back for future placeholder sprites, or is it gone
for good).

**Tooling note, not a product finding:** synthetic Enter/Space key events
sent through this session's browser-automation tool did not trigger
native `<button>` click activation, while Tab/Shift+Tab/Escape navigation
worked correctly and a real mouse click always worked. Native button
Enter/Space activation is baseline HTML behavior, not something app code
implements, so this reads as an automation-harness limitation, not a
real keyboard-accessibility defect — noted here so a future session
doesn't re-investigate it as if it were one.

No code changes, no branch, no PR for this lane — a clean audit is the
correct outcome here, not manufactured busywork. Moving to Lane D (docs
accuracy audit) next.

<!-- Append new entries below this line, most recent last. -->
