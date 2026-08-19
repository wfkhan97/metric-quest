# Metric Quest — Build Order

Companion to `docs/BACKLOG.md`. The backlog says *what* each item is and
what's still undecided; this document says *in what order to build them,
in what size chunks, and how to know each chunk is done*.

Nothing here overrides `AGENTS.md`, `docs/AI_WORKFLOW.md`, or
`docs/GAME_DESIGN_BRIEF.md`. Nothing here authorizes starting a backlog
item whose open questions are still open — a work packet below that
depends on an unanswered question names that question in its
**Blocked on** line, and that line must be cleared by the product owner
(not by an agent's judgment call) before the packet starts.

Every packet is scoped to one branch, one handoff summary, and one merge
approval, per the git workflow in `docs/AI_WORKFLOW.md`.

---

## Session status (2026-08-09, continued) — read this first

**`claude/game-feel-polish` is merged into `main` and pushed** (commit
`79f8290`, "Merge claude/game-feel-polish into main"). Wave 0, Wave 1,
P2.1, and P2.2 (all 9 sectors) are live on `main`. `npm run check` passed
on `main` post-merge before the push. There is no unmerged work sitting
anywhere else — this is a good sync point.

**Then the product owner played the merged build live** (their own
browser, `npm run dev` at `localhost:5173`, not the Browser-pane smoke
test) and gave a full round of UAT feedback. That feedback is now fully
processed: `docs/BACKLOG.md` has three new items (5, 6, 7) plus one
explicitly deferred item (8), and this file has the P4.x packets below.
Three product decisions were confirmed via direct questions rather than
assumed:
- Sector 8's `m8-1` confrontation and the opening cutscene both get a
  **CSS-only escalation now**, real cinematic art **later** (prompt
  already drafted, not commissioned) — not "wait for art."
- "Back to sector map" becomes a **quiet text link, not removed outright**
  — accessibility parity (keyboard/screen-reader) won out over full
  removal, per `AGENTS.md`.

One more thing worth flagging for whoever picks this up: **a real defect
was found in shipped art**, not just a preference. All 12 avatar sprites
(`src/assets/avatars/recruit-*.png`) were pixel-inspected with PIL and
confirmed to have a checkerboard pattern baked into fully-opaque pixels
(`alpha=255` everywhere) instead of real transparency — see BACKLOG.md
item 7 and `docs/GAME_DESIGN_BRIEF.md` §B Step 1c for the fix prompt and
a verification command. **Lesson for future asset drops:** don't trust
that an asset "looks transparent" in a screenshot or design-tool preview
— verify the actual alpha channel (`python3 -c "from PIL import Image;
print(Image.open('PATH').convert('RGBA').getextrema())"`, alpha low end
should be `0`, not `255`) before wiring anything in as final.

**Still open / outstanding:**
- P0.4 — blocked on a design request; deferred, not declined.
- BACKLOG.md item 4's "does every sector transition get an authored beat"
  question — still open, blocks writing the Sector 8→9 beat specifically.
- Wave 3 (AI tutor, P3.1) — approval was granted and a working prototype
  was built 2026-08-11 (branch `claude/monet-oauth-relay`, not merged),
  but it's now paused per the product owner, not active work. See
  BACKLOG.md item 3's status line before touching this.
- BACKLOG.md item 8 (multi-save/state management) — explicitly deferred
  to post-polish, not scheduled into any packet below.
- P4.1's exact padding/sizing targets — the product owner said they'd
  send a separate look-and-feel note (screenshots/annotations); P4.1
  shipped on the directional guidance without it. That note never
  arrived — Wave 5's P5.2-P5.4 supersede it with more specific direction,
  so treat this as folded into Wave 5 rather than a separate follow-up.
- **New:** P5.5 (the "pulled into the mainframe" cutscene) — blocked on
  the product owner's script. See `docs/BACKLOG.md` item 4's update.
- **New:** P5.4's sector-map slide-out interaction is a judgment call
  (overlay/drawer off a header control), not a confirmed decision — flag
  for correction before/during the packet if wrong.

**How to continue:** read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and
`docs/GAME_DESIGN_BRIEF.md` first (standard project instruction, not new).
The four packets below (P4.1-P4.4) are all unblocked and independent of
each other — safe to parallelize across sessions/branches, one branch per
packet per the git workflow. P4.5 (avatar sprite fix) isn't agent-buildable
at all; it's waiting on the product owner to run a Claude Design prompt.

---

## Session status (2026-08-09, continued again) — read this first

**P4.2 and P4.4 are merged into `main` and pushed** (P4.2 on its own
branch first, then P4.4 rebased onto the post-P4.2 `main` and merged
second — both touched `MissionView.tsx` in non-overlapping regions, so
the rebase was clean). `npm run check` passed on `main` after each merge
and after the final push. P4.1 and P4.3 were already live from the prior
sync point. **P4.5 is still outstanding** — still waiting on the product
owner.

**Then a second UAT round on the merged build produced more feedback**,
now fully processed into `docs/BACKLOG.md` (item 9, plus an update to
item 4) and the Wave 5 packets below. Two things worth flagging:
- One sub-part of item 4's update (P5.5, the new "pulled into the
  mainframe" cutscene) is **blocked on the product owner scripting it** —
  not an open architectural question, just missing content. Everything
  else in Wave 5 is unblocked.
- P5.4 (header consolidation) contains one genuine judgment call — the
  sector-map slide-out interaction — made explicit in both this file and
  `docs/BACKLOG.md` item 9 rather than silently assumed. Confirm or
  correct it before/during that packet.

---

## Session status (2026-08-10) — read this first

**All of Wave 5 (P5.1-P5.4) is merged into `main` and pushed.** P5.2 and
P5.3 conflicted on the same `MissionView.tsx` region (expected — both
touched the SQL editor block) and were resolved manually; P5.4 conflicted
too (the header-relocated Terminal reward panel vs. P5.2's trimmed copy
of the same text) and was also resolved manually, keeping P5.2's trimmed
wording in its new P5.4 location. `npm run check` passed on `main` after
every merge and after the final push. P5.5 remains blocked on the product
owner's script.

**Then, direct product-owner request:** research what public deployment
(Vercel) needs, and design the previously-deferred multi-save system
(BACKLOG.md item 8). Both came back further along than expected:
- **BACKLOG.md item 2 was found already fully shipped** — a prior status
  note here said "Sectors 1, 4-9 still open," which was stale. Verified
  directly against `src/lib/diagnostics.ts`: all 25 missions have
  signatures. Corrected in both docs. There is no remaining
  diagnostic-signature work.
- **Item 8 (multi-save) is un-deferred and fully designed** — no open
  product question is left blocking a build. Scheduled as P6.2.
- **Item 10 (deployment) is real but split.** The prework (config, docs,
  preparing a minimized data derivative) is unblocked and scheduled as
  P6.1. **Actually deploying is a hard blocker, not a checklist item**:
  `sqlRunner.ts` currently ships the raw, unmodified
  `SQL Databases/iTunes.sqlite` in every production build — deploying
  today means publishing the course-material database to the public
  internet. This is exactly what `docs/AI_WORKFLOW.md`'s course-data
  release gate already covers; it needs an explicit product-owner
  decision (approve the full file, or switch to the verified minimized
  derivative) before any deploy happens. See BACKLOG.md item 10 for the
  full research, including the tested 356KB/1,092KB minimized-derivative
  numbers.

**Correction, same status block:** the data decision described above as
still blocking was in fact made and wired in later the same day
(2026-08-10) — see BACKLOG.md item 10's "Decision made" section.
`sqlRunner.ts` has pointed at the minimized derivative, not the full file,
since that day. What's still genuinely open is only *whether/where to
actually deploy*, not which dataset to ship.

---

## Session status (2026-08-11) — read this first

**PR #14 (fix, merged) and PR #15 (feature + refinement, merged) are both
on `main`.** Both came out of one continuous live-playtest session — the
product owner drove the browser directly across several rounds of
feedback in one sitting, rather than sending a written note. `npm run
check` passed before every commit and after both merges.

- **PR #14 — a real bug in P5.5's memo panel**, not a preference: its
  internal scroll (`overflow-y: auto`) never actually activated, because
  `.phase-scanline`'s `overflow: hidden` shorthand silently won the
  cascade at equal specificity — the exact same trap P4.3's own comment
  already warns about for the `animation` property, just not applied to
  this new rule. Fixed by moving the property into the block already
  declared after `.phase-scanline`.
- **PR #15 bundles four logically separate but simultaneously-shipped
  pieces** (see Wave 7 below for the individual packets): a second
  mission-header refinement pass (P5.6, extending P5.4), a new title
  screen (P7.1, BACKLOG.md item 11), an onboarding-flow correction so
  "New game" doesn't land on Home before the intro cutscene explains
  anything (P7.2), and a presentation-only simplification of the P5.5
  cutscene (P7.3) plus a title-screen centering fix found during
  verification.
- Doc pass done in the same session: corrected several stale claims found
  while auditing all of this — README's Deployment section still implied
  the data-release decision was unmade (it was resolved 2026-08-10, see
  above), `docs/architecture.md`'s view list and data-source line
  predated several shipped features, and `docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`
  still said "not yet built." See each doc's own change for detail — not
  repeated here.

**Still open / outstanding**, carried forward unchanged from prior status
blocks: P0.4 (icon regeneration, blocked on a design request), the
Sector 8→9 authored-beat question (BACKLOG.md item 4), Wave 3/P3.1 (AI
tutor, pending a product decision, do not prototype), P4.5 (avatar sprite
fix, waiting on the product owner — **note:** BACKLOG.md item 7 records
this as fully fixed 2026-08-10; if still listed here it's for historical
continuity, verify against item 7 before treating it as open), and item
10's actual-deployment decision (data source itself is resolved; whether
and where to deploy is not).

---

## Session status (2026-08-12) — read this first

A documentation-accuracy pass this session found several of the "still
open" items above and status lines elsewhere in this doc had actually
been resolved since 2026-08-11, just never corrected here. Verified
directly against `main`'s current state, not assumed:

- **Item 10's deployment decision is resolved — the app is live.** Vercel
  auto-deploys `main` to Production via its GitHub integration; the
  public URL is **https://metric-quest.vercel.app**. See
  `docs/BACKLOG.md` item 10's corrected status line for the smoke-test
  record. P4.5 (avatar sprite fix) is confirmed fully fixed, same as
  BACKLOG.md item 7 already said — no longer listed as open.
- **Wave 3/P3.1 (AI tutor) and item 13 Part B1 ("Learn SQL Mode") are
  both merged to `main`**, not sitting on unmerged branches as prior
  status blocks said — the tutor stays gated off in the release
  candidate (`.vercelignore` excludes `api/`), per `docs/BACKLOG.md`
  item 3's still-standing approval gate; Learn SQL Mode ships live,
  off by default. BACKLOG.md item 14 (first-run tutorial) is also
  merged, not "awaiting approval" as its own doc previously said.
- **`pnpm audit --prod` was run for the first time (2026-08-12): clean,
  no known vulnerabilities.** See BACKLOG.md item 12 finding 3.
- **Missions grew from 25 to 32** (`m1-5`/`m1-6` BETWEEN/IN, `m2-4`
  MIN/MAX, `m5-3` date arithmetic, `m7-3`/`m7-4`/`m7-5` UNION ALL/
  INTERSECT/EXCEPT — added to close gaps found auditing the game against
  the Cornell course syllabus and its SQL reference guide, distributed
  into existing Sectors 1, 2, 5, and 7). `docs/architecture.md`,
  `docs/GAME_DESIGN_BRIEF.md`'s sector table, and this doc's mission
  counts are corrected to match.

The Sector 8/9 confrontation cinematic (§A8 Phase 2 in
`docs/GAME_DESIGN_BRIEF.md`) also shipped 2026-08-12 — see that doc's
own corrected status and `docs/BACKLOG.md`'s design asset tracker.
Nothing above changes the SQL loop, grading contract, or syllabus
coverage.

**Still open / outstanding, unchanged:** P0.4 (icon regeneration,
blocked on a design request) and the Sector 8→9 authored-beat question
(BACKLOG.md item 4).

---

## The ordering principle

Three things determine order:

1. **Already-paid-for value first.** Art that has been generated and
   verified but is not wired into the app is the cheapest possible win —
   the expensive part (design) is done, and the remaining work is
   mechanical. The asset tracker currently lists 9 sector backgrounds,
   2 ROGUE.exe states, and a panel frame + 4 button states in exactly
   this state.
2. **Unblocked before blocked.** Backlog items 1, 2, and 4 need no
   approval exception; item 3 needs an explicit product-owner decision.
   Item 3 therefore never sits on the critical path.
3. **Dependencies before dependents.** Item 2's diagnostic wants to link
   into item 1's glossary entries, and item 4's Phase 2 cutscenes want
   the sector art wired in first. Build the thing that gets depended on.

That yields the sequence below. Packets inside a wave are independent of
each other and can be picked up in any order (or by different sessions,
one branch each — never two sessions on the same packet).

---

## Wave 0 — Cash in the landed art (no new decisions required)

The single highest-value-per-hour work available right now. Every packet
here is "art exists, wire it in," and none of them touch the SQL loop,
grading, or progress contracts.

### P0.1 — Wire sector backgrounds into `SectorTransitionView`

**What:** Copy the 9 verified sector backgrounds out of the Claude Design
export into `src/assets/backgrounds/` and render them behind the existing
sector interstitial, keeping the copy in the open lower-middle third the
art was composed to leave clear.

**Why now:** The interstitial is the one screen whose entire job is
atmosphere, and it is currently carrying that job with CSS placeholders
while finished art sits in `~/Downloads`.

**Done when:**
- All 9 sectors render their own background; a sector with a missing or
  failed image still shows readable copy (no blank screen, no layout
  shift).
- Text contrast over the art meets the brief's readability bar — verify
  the transition copy against the busiest background (Sector 8), not the
  calmest.
- No page-level scroll introduced (§A7 of the brief).
- Images are sized/compressed for web delivery, not shipped at raw
  export resolution.
- `npm run check` passes.

**Blocked on:** Nothing.

**Watch out for:** the tracker flags Sector 8 as leaning more
body-horror than the brief's "campy, not horror" target. Ship it, note it
in the handoff, and let the product owner decide whether it wants a
touch-up pass — don't silently re-request art.

---

### P0.2 — Wire the ROGUE.exe sprites (calm + corrupted)

**What:** Replace the CSS glitch-icon placeholder in `MissionView`'s
m8-1 aside with the real calm/corrupted ROGUE.exe art, and expose the
two states as a small reusable component so cutscene work (P2.1) can
reuse it rather than re-solving it.

**Done when:**
- Both states render, are visually distinct, and swap without layout
  shift.
- The component takes state as a prop (`calm` | `corrupted`) — the
  cutscene packet must not need to fork it.
- Placeholder CSS glitch icon is deleted, not left dead alongside the
  real art.
- `npm run check` passes.

**Blocked on:** Nothing.

---

### P0.3 — Finish the UI chrome kit wiring (buttons + panel frame)

**What:** The tracker says 7 of 10 kit assets are wired; buttons and the
panel frame are verified-good art that is *not* wired, for two concrete
reasons: idle and hover are nearly indistinguishable, and the soft edge
glow won't survive `border-image` slicing at responsive sizes.

Those are art-side problems with code-side workarounds. This packet's job
is to decide which path and execute it:

- **Path A (preferred):** request a touch-up export from Claude Design —
  harder idle/hover differentiation and a hard-edged frame that slices
  cleanly — then wire the corrected assets.
- **Path B (fallback):** wire the existing frame with a 9-slice that
  crops the glow, and add the hover differentiation in CSS (brightness /
  translate) on top of the flat sprite.

**Done when:** interactive controls use the kit art, hover and focus
states are *visibly* distinct from idle without relying on color alone
(`AGENTS.md` accessibility rule), keyboard focus remains visible over
the sprite, and the asset tracker row is updated to match reality.

**Blocked on:** Path A needs someone to actually make the Claude Design
request. If that hasn't happened, take Path B and say so in the handoff.

---

### P0.4 — Regenerate `icon-corruption.png`

**What:** The tracker calls this asset illegible — it reads as static
rather than "corruption." This packet is a design request plus the wiring
once it lands; the CSS glitch placeholder stays until then.

**Done when:** a legible replacement is generated, verified against the
brief's tone, wired into the error-feedback slot, and the tracker row
updated.

**Blocked on:** the design request being made. This is the smallest
packet here and the easiest to forget — it is listed separately so it
doesn't get buried inside P0.3.

---

## Wave 1 — The glossary (backlog item 1)

Built before the diagnostic because the diagnostic's payoff is
"explanation + link to the relevant glossary visual." Building them in
the other order means item 2 ships pointing at nothing.

### P1.1 — Glossary data model and shell

**What:** A static content module in the shape of
`src/content/chapters.ts` — one entry per curriculum concept, each with
title, plain-language explanation, a short worked SQL example, and a
reference to the visual component that illustrates it. Plus the panel
itself: openable from anywhere, internal scroll only, keyboard-operable,
closes back to exactly where the player was.

**Deliberately not in this packet:** the animated diagrams. Ship the
panel with text entries and empty visual slots first — that makes the
navigation, deep-linking, and accessibility work reviewable on its own
instead of arriving tangled with a pile of SVG.

**Done when:** every concept the curriculum tests has an entry, the panel
opens and closes from every mission via both mouse and keyboard, focus
is trapped and restored correctly, and `npm run check` passes.

**Blocked on:** Nothing — both data-model questions were resolved
2026-08-08 (recorded in `docs/BACKLOG.md`): closely related concepts share
a comparison entry, and the glossary overlays the mission rather than
leaving it. The third open question (documentation voice vs. in-world
voice) is answered during the packet, since it changes copy but not
structure.

---

### P1.2 — Glossary visuals

**What:** The CSS/SVG explanatory diagrams — row filtering before/after,
tables merging on a join key, grouping and aggregation. Functional
diagrams, built in code, in the terminal palette. Per `AGENTS.md` these
are in scope to build directly precisely because they're explanatory, not
character art.

**Done when:** each entry that warrants a visual has one, animations
respect `prefers-reduced-motion`, and no diagram is the *only* carrier of
its explanation (text stands alone).

**Blocked on:** P1.1 landing first.

**Research note from the backlog, restated because it's easy to get
wrong:** public SQL references are for checking accuracy and borrowing
diagram *concepts*. Do not copy their text and do not embed their
images. Rewrite in Metric Quest's voice, redraw in the terminal palette.

---

### P1.3 — Deep-link from mission concept tag into its glossary entry

**What:** The "I'm stuck on *this specific thing*" path — a mission's
concept tag becomes a jump into the matching entry.

**Done when:** every mission's concept tag resolves to a real entry (no
dead links), and a mission whose concept has no entry degrades to opening
the glossary index rather than erroring.

**Blocked on:** P1.1.

---

## Wave 2 — Cutscenes Phase 1 (backlog item 4) and the diagnostic (item 2)

Independent of each other; both depend on Wave 0/1 output.

### P2.1 — Opening cutscene + reusable between-sector beat mechanism

**What:** Phase 1 of §A8's roadmap — the opening beat that establishes
Aurora Music and ROGUE.exe, plus a *general* data-driven mechanism for
between-sector beats (not just the one-off Sector 8→9 case). Beats are
data: sector transition → optional copy + effect sequence, defaulting to
"no beat," so beats can be authored incrementally per sector.

**Done when:** the opening runs once for a new player and never again
unless explicitly re-triggered; skip works and is discoverable; a sector
with no authored beat transitions exactly as it does today; and the beat
data structure could carry multi-panel Phase 2 content without a rewrite.

**Blocked on:** Nothing — the three open questions were resolved
2026-08-08 (recorded in `docs/BACKLOG.md`): opening plays before the
avatar creator; unskippable on first viewing, skippable via a "Replay
opening" control on Home; audio scoped in by product direction, but
shipped as an unwired `audioSrc?` field only — no capability here to
generate or source a real sound file, and no playback machinery was
built around a field that's always undefined. A fourth open question
(whether every sector transition gets an authored beat) is still open
and blocks writing the Sector 8→9 beat specifically, not this packet.

**Depends on:** P0.1 and P0.2 (the beats want the real art) — both landed.

---

### P2.2 — Mistake-aware diagnostic (local, rule-based)

**What:** After a failed grading check, classify the attempt against a
per-concept library of known mistake signatures and surface the matching
pre-authored explanation, optionally linking into the glossary entry from
Wave 1.

**Architectural guardrails, non-negotiable:**
- `grading.ts` stays the sole source of truth for correct/incorrect. This
  layer is additive feedback and must never flip a verdict.
- Classification runs on the already-executed result table and a light
  structural read of the submitted SQL. Nothing is sent anywhere.
- No logging or telemetry about player mistakes, per `AGENTS.md`.

**Suggested split, because the signature library is the bulk of the
work:** one packet for the classifier plumbing plus one sector's
signatures end-to-end, then one packet per remaining sector's signatures.
That gets the mechanism reviewed early and turns the long tail into
repeatable content work.

**Blocked on:** Nothing — the three open questions were resolved
2026-08-08 (recorded in `docs/BACKLOG.md`): a short, high-confidence
signature list rather than exhaustive coverage; the 2nd wrong attempt
triggers the diagnostic; it always supplements the generic feedback,
never replaces it.

**Status: fully shipped.** The classifier-plumbing-plus-one-sector split
landed 2026-08-08 — Sector 2 (`m2-1`/`m2-2`/`m2-3`), 4 signatures. Sector
3 (`m3-1`-`m3-4`, joins) landed the same day, 7 signatures. **Correction
(2026-08-10):** this file previously said Sectors 1, 4-9 were still
open — stale. Verified directly against `src/lib/diagnostics.ts`: all 25
missions (`m1-1` through `m9-2`) have signature arrays. Item 2 is done;
no remaining packets here.

**Depends on:** P1.1 if the explanations link into glossary entries —
landed and used.

---

## Wave 3 — AI tutor replanning (backlog item 3)

### P3.1 — Moonshot tutor migration: first code pass complete, awaiting model-selection gate (2026-08-18)

The prior Monet OAuth relay is merged into `main` but dormant; it is a
reference implementation, not the next build packet. Product direction now
calls for one game-owned Moonshot API key in a small Vercel chat route, with
no learner OAuth, BYOK, provider picker, callback URLs, or connection
cookies. The existing mission context, hints-first behavior, accessibility,
and result-based grading boundary remain required.

**Blocked on:** the short tutor-specific model-selection trial documented in
`docs/BACKLOG.md` item 3, plus a fresh implementation/release go-ahead. The
trial must choose the least expensive Moonshot model that passes the
hints-first SQL-help quality bar using the actual capped prompt. Until then,
do not re-enable the tutor, remove `api/` from `.vercelignore`, configure
Monet or Moonshot secrets, or deploy a tutor route.

**Current branch state:** the first migration pass replaces the Monet OAuth
routes and connection UI with a direct, server-only Moonshot call, explicit
learner disclosure, bounded chat history/output, a per-instance request
guard, and mocked helper coverage. The code default is `kimi-k3` (corrected
2026-08-19 from `moonshot-v1-8k`, which sunsets 2026-08-31 — see
`docs/BACKLOG.md` item 3); it's a provisional configuration default only,
not the trial's result. No key has been supplied, no live API call has been
made, and `AI_TUTOR_ENABLED` plus `.vercelignore` remain unchanged.

**Then build:** complete item 3's four-step Moonshot migration packet in
one branch: direct server-side chat call, no OAuth code or cookies, revised
disclosure/UI, bounded-rate route tests, and Preview/Production smoke tests.

---

## Wave 4 — First UAT feedback round (backlog items 5, 6, 7)

Opened 2026-08-09 from the product owner's first playtest of the merged
build. P4.1-P4.4 are independent of each other and of everything above —
safe to parallelize across sessions, one branch each. P4.5 is not an agent
packet at all; it's tracked here only so it isn't lost.

### P4.1 — Chrome layout compaction & navigation cleanup

**What:** BACKLOG.md item 5. Remove "Back to sector map" and "Concept
glossary" from `MissionView`'s top header box. Reduce that header to a
compact points/integrity readout. Re-add "Back to sector map" as a small
text link (not a boxed button) somewhere lower-weight — it must stay a
real, focusable, keyboard-operable control, not disappear outright (see
the accessibility note in BACKLOG.md item 5; this was an explicit
product decision, not an agent judgment call). Relocate "Concept
glossary" next to the SQL editor's action row (Run query / Show hint /
Reveal example query). Tighten padding across the brief/schema/editor
panels so "Run query" is reachable without scrolling on a typical laptop
viewport.

**Done when:**
- Top header is visually thinner and carries only the points/integrity
  readout.
- "Back to sector map" still exists, is keyboard-reachable (tab order,
  visible focus state), and is visually de-emphasized vs. today's boxed
  button.
- "Concept glossary" opens from its new location next to the action row;
  every existing way into the glossary (Home header, concept-tag
  deep-links) still works unchanged.
- On a typical laptop viewport, a mission's "Run query" button is
  reachable without scrolling past the fold for at least the shorter
  mission briefs (schema-heavy missions with many tables may still need
  internal scroll on the schema panel itself — that's fine per §A7,
  sub-panel scroll isn't the thing being fixed).
- `npm run check` passes.

**Blocked on:** Nothing for the directional changes above. Exact
padding/sizing numbers are pending a separate look-and-feel note from
the product owner — implement the directional guidance now; treat the
note as a follow-up pass, not a blocker.

**Watch out for:** don't reduce padding so far that panel-frame border
art (P0.3) starts clipping content, and don't drop focus-visible styling
while de-emphasizing the back-link visually.

---

### P4.2 — SQL editor syntax highlighting

**What:** BACKLOG.md item 6. Replace the plain `<textarea>` SQL editor
with CodeMirror 6 + its SQL language mode, themed to the terminal
palette (`#0a1024`/`#0f1830`/`#1fd3c4`/`#eaf6f4`/`#ffd166`).

**Done when:**
- Keywords, strings, numbers, and comments are visually distinguished in
  the editor.
- The editor's content is still exactly what gets graded — no change to
  the runner boundary or the temp-table two-statement allowance.
- Fully keyboard-operable (typing, selection, and the existing
  hint/reveal-example/run-query flow all still work with no mouse).
- The "Placeholder — syntax highlighting and autocomplete are coming in
  a later release" note is updated to drop the "syntax highlighting"
  half (autocomplete stays a future item).
- `npm run check` passes, and `npm run build`'s output size is checked
  and noted in the handoff (new dependency — worth knowing the actual
  cost, not just the estimate).

**Blocked on:** Nothing. Approved 2026-08-09, no open questions.

---

### P4.3 — Onboarding cutscene CSS drama pass

**What:** BACKLOG.md item 4's 2026-08-09 update. Extend the existing
opening beat (P2.1) with stronger Phase 1 CSS effects — screen shake,
glitch intensity ramping, harder scanline/typewriter emphasis — so it
reads as more jarring/dramatic. No new art; reuses the existing
sprites/panels already wired into `CutsceneView`.

**Done when:** the opening cutscene visibly escalates (shake/glitch)
rather than reading as a static panel with text; unskippable-on-first-
viewing and "Replay opening" behavior from P2.1 are both unchanged;
effects respect `prefers-reduced-motion` the same way the glossary's
animated diagrams already do (don't introduce a new reduced-motion gap).

**Blocked on:** Nothing.

**Depends on:** P2.1 (extends it, doesn't replace it).

---

### P4.4 — Sector 8 boss-moment CSS escalation

**What:** BACKLOG.md item 4's 2026-08-09 update. `m8-1`'s ROGUE.exe
aside in `MissionView` currently reuses the same static-aside treatment
as any other mission moment. Escalate it with CSS-only effects on the
existing `rogue-corrupted` sprite (more aggressive glitch, shake, a
harder verbal beat) so the first direct ROGUE.exe encounter reads as a
confrontation. A real cinematic upgrade (multi-panel slideshow) is
scoped and prompt-drafted in `docs/GAME_DESIGN_BRIEF.md` §B Step 3b but
explicitly not part of this packet — send that prompt separately
whenever the art is wanted, then this packet's CSS version is the
fallback/transition state, not throwaway work.

**Done when:** `m8-1`'s ROGUE.exe moment is visibly more dramatic than a
standard mission aside; the existing `RogueSprite` component is reused,
not forked; respects `prefers-reduced-motion`.

**Blocked on:** Nothing.

**Depends on:** P0.2 (RogueSprite component; landed).

---

### P4.5 — Avatar sprite transparency fix (not an agent packet)

**What:** BACKLOG.md item 7. Not buildable by an agent — the fix is a
Claude Design re-export, prompt already drafted in
`docs/GAME_DESIGN_BRIEF.md` §B Step 1c.

**Status:** waiting on the product owner to run the prompt and hand back
the result. Once it lands, a small follow-up packet swaps the 12 files
in `src/assets/avatars/` and verifies transparency landed for real (the
verification command is in the same doc section) before treating it as
done — don't just eyeball the new files.

---

## Wave 5 — Second UAT feedback round (BACKLOG.md item 9, item 4 update)

Opened 2026-08-09 (continued) from a second playtest pass on the merged
build. Ordered by value-per-effort rather than by BACKLOG.md item number:
the cheapest, lowest-risk copy trims first (P5.2), then the action-row
change (P5.3), then the larger and more judgment-call-heavy header
consolidation (P5.4) — each is independently reviewable, and doing the
small wins first means the header work (the packet most likely to need a
correction round) isn't blocking anything else while that happens. P5.1
(onboarding reorder) is cheap and independent of the density work, so it
runs in parallel with no particular urgency relative to P5.2-P5.4. P5.5
is parked last because it cannot start yet — it's a hard content
blocker, not a priority call.

### P5.1 — Onboarding order: avatar creator before the opening cutscene

**What:** BACKLOG.md item 4's second-round update. Today's first-run
path (`src/App.tsx`) is: `handleSelectMission` plays the opening cutscene
(if unseen) via `pendingBeat`/`openingBeat`, then `handleCutsceneFinish`
calls `proceedToMission`, which sends a player with no saved avatar into
`AvatarCreatorView` before finally reaching the mission. Swap the order
so the avatar creator runs first and the existing opening beat (unchanged
content) plays after — no new screen, no new copy, purely a sequencing
change across `handleSelectMission`, `proceedToMission`, and
`handleAvatarConfirm`.

**Done when:**
- A first-time player's path is: avatar creator → existing opening
  cutscene → Home/first mission.
- "Replay opening" (`handleReplayOpening`, Home) and avatar edit
  (`handleEditAvatar`) still work exactly as today — this reorder only
  touches the first-run path, not those standalone entry points.
- A returning player (avatar already set, opening already seen) sees no
  behavior change at all.
- `npm run check` passes.

**Blocked on:** Nothing.

**Depends on:** Nothing, but P5.5 depends on this landing first (it needs
somewhere to slot the new beat in between).

---

### P5.2 — Trim mission-screen copy

**What:** BACKLOG.md item 9. Three independent, low-risk deletions from
`MissionView.tsx`/`styles.css`:
- Remove the `#runner-note` paragraph under the SQL editor ("Runs locally
  in your browser... This runner allows one read-only SELECT query.").
  `SqlEditor`'s `ariaDescribedBy="runner-note"` prop and wiring need to
  come out with it, not point at a deleted element.
- Remove "Points are awarded once; hints never lock progress." from the
  Terminal reward panel (the `completed` ternary's other branch, "Purged
  terminals can be replayed without changing your points," stays — that
  one's load-bearing, not filler).
- Remove the `.placeholder-tag` span ("Placeholder — autocomplete is
  coming in a later release") from the rendered editor header. Per
  BACKLOG.md item 6's clarifying note, leave the underlying future item
  and a short code comment pointing back to it — don't delete the
  concept, just stop showing it every mission.

**Done when:**
- All three are gone from the rendered page; no dangling `aria-describedby`
  reference to a removed element.
- Nothing else in the SQL editor panel changes layout awkwardly once the
  removed lines free up vertical space (a quick visual check, not a
  redesign — P5.4 is where the header gets redesigned).
- `npm run check` passes.

**Blocked on:** Nothing.

---

### P5.3 — SQL editor action row: resize + gated "See answer"

**What:** BACKLOG.md item 9. Two changes to `MissionView.tsx`'s
`.actions` row (Run query / Show hint / Reveal example query / Concept
glossary, already co-located next to the editor since P4.1):
- Give the row a visually smaller/lighter treatment than today's full
  pixel-art button styling — it shouldn't compete with the SQL editor
  for attention.
- Remove the always-available "Reveal example query" control. Add a 4th
  control, **"See answer"**, that reveals `mission.solutionSql` (the
  same content, same `.solution` panel) but is only enabled/visible once
  `wrongAttemptCount >= 3` on the current mission — reuse the existing
  `wrongAttemptCount` state (already tracks consecutive wrong attempts
  this mission visit and already gates the diagnostic at 2; this is a
  second, higher threshold reading the same counter, not a new one).

**Done when:**
- Run query / Show hint / Concept glossary are visually smaller/lighter
  than today, still fully keyboard-operable with visible focus.
- "See answer" is absent or disabled below 3 consecutive wrong attempts,
  and becomes available at exactly 3 — verify against a real mission,
  not just the counter logic in isolation.
- Once available, "See answer" behaves like today's "Reveal example
  query" (toggles the `.solution` panel open/closed) — same content,
  same accessibility, just gated and relabeled.
- A player who gets a mission right before reaching 3 wrong attempts
  never sees "See answer" for that mission (it's moot once solved, but
  shouldn't flash into existence in feedback either).
- `npm run check` passes.

**Blocked on:** Nothing.

**Watch out for:** `wrongAttemptCount` resets on remount (leaving and
returning to a mission), same as today's diagnostic gate — that's
existing, accepted behavior per the comment already in `MissionView.tsx`,
not a new gap introduced by this packet.

---

### P5.4 — Mission header consolidation

**What:** BACKLOG.md item 9, the largest piece of this wave. Three
changes to `MissionView.tsx`'s header/layout that share the same
real estate, bundled into one packet rather than three overlapping ones:
- **Collapsible sector map.** `ChapterMap` stops being a permanent
  sidebar in `.game-layout` and starts collapsed, behind a trigger control
  placed in the top header box; clicking it slides the map out.
  `ChapterMap` already has an `isOpen`/`isCompact` toggle for narrow
  viewports (`src/components/ChapterMap.tsx`) — generalize that
  mechanism rather than building a second one. See the open interaction
  question below before starting.
- **Terminal reward relocation.** Move the Terminal reward panel's
  content into the header, to the right of the existing points/integrity
  readout; both expand to use the width the header currently leaves
  empty. The standalone Terminal reward panel (currently paired with
  `SchemaExplorer` in `.two-column`) is removed once its content moves.
- **Badges toggle.** Remove the `<footer className="badges mission-badges">`
  strip entirely; earned badges become a togglable disclosure inside the
  header's progress area (collapsed/hidden by default, per the same
  "don't show everything all the time" principle as the sector map).

**Done when:**
- Sector map starts collapsed on every mission load, is reachable and
  operable via keyboard (a real focusable trigger, `aria-expanded`
  reflecting state), and doesn't shift mission content when it opens
  (overlay, not a layout push — see the open question below).
- Terminal reward info (points, badge name, purged-replay note) is
  readable from the header with no loss of information versus today's
  panel.
- Badges are still reachable (toggle open, keyboard-operable) but not
  permanently on-screen; the "no badges yet" copy still has somewhere to
  live.
- Header doesn't feel cramped at the accessible width range the project
  already commits to (320px through desktop) — reflow narrow widths
  (e.g. badges/reward collapse further, or the map trigger becomes the
  only thing shown) rather than shrinking text until unreadable, per §A7.
- Keyboard operability, visible focus, and non-color-dependent feedback
  hold throughout (`AGENTS.md`'s standing bar) — this packet touches more
  interactive surface than most, so this is the item most likely to
  regress it if rushed.
- `npm run check` passes.

**Blocked on:** Nothing architecturally, but see the open interaction
question in `docs/BACKLOG.md` item 9 before starting — the sector-map
slide-out is documented as a judgment call (overlay/drawer off a header
control), not a confirmed product decision. Cheap to confirm before
building, expensive to redo after.

**Watch out for:** this is the packet most likely to be worth splitting
further once someone is actually in the code (e.g. sector-map collapse
as its own commit within the branch before the reward/badges moves) —
the three changes are bundled here because they share the same header
real estate and reviewing them separately would mean reviewing the same
region three times mid-flight, not because they must land in one commit.

---

### P5.5 — New "pulled into the mainframe" cutscene (built and merged 2026-08-10; see Wave 7 for a 2026-08-11 bug fix and presentation revision)

**What:** BACKLOG.md item 4's second-round update. A new cutscene beat
between avatar confirmation and the existing opening beat, showing the
player's just-chosen avatar being pulled into the mainframe. Full
storyboard, the CEO memo text, and the asset/music sourcing are in
`docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`.

**Shipped as Phase 2**, not the Phase 1 default this item originally
assumed — the script needed an office, a memo, a portal, and a corridor of
9 sector doors, more than CSS effects on the existing avatar sprite alone
could carry:

- **`CutsceneView` now supports multi-panel playback.** It no longer
  hardcodes `panels[0]` — `BeatPanel` gained `eyebrow`/`heading` (moved
  from the beat level, since each panel needs its own), `background`,
  `backgroundZoom`, `showAvatar`/`avatarMotion`, `rogueState`/
  `rogueMotion`, `whiteoutTransition`, `audioSrc`, `creditLine`, and a
  `layout: 'boot'` variant for the full-bleed terminal hand-off panel.
  `openingBeat` was migrated to the new per-panel eyebrow/heading shape
  (still one panel, unchanged content/behavior).
- **`mainframePullBeat`** (`src/content/beats.ts`) is the 13-panel beat
  itself, sequenced in `App.tsx` between avatar confirmation and
  `openingBeat` — its last panel (the boot screen) chains straight into
  `openingBeat` rather than the two being separately gated, so a player
  sees them as one continuous intro. `App.tsx` now passes `avatar` into
  `CutsceneView` and keys it by `beat.id` so panel state resets cleanly
  when the beat changes (deliberately not a `useEffect` calling
  `setPanelIndex(0)` — that trips the react-hooks
  "no setState synchronously in an effect" lint rule).
- **All 5 art assets landed** (office calm/alarm, portal burst, corridor
  calm/breached) and were re-compressed from uncompressed PNG exports
  (1.3-1.8MB each) to JPG matching the existing sector-background
  convention (~200-400KB each) before wiring in — the raw exports would
  have ~doubled the production bundle for no visual gain at this palette.
- **Audio autoplay needed a real fix, not just a `<audio autoPlay>`
  attempt:** Chrome only honors the first `play()` call as
  gesture-attached if it runs inside the click handler's own call stack —
  a `useEffect` firing after React's render/commit is one tick removed
  and gets silently blocked. `CutsceneView`'s `syncAudio` helper is called
  both from an effect (best-effort) and synchronously from
  `handleContinue`/the mute toggle (guaranteed gesture-attached), so the
  first real click in the cutscene reliably unlocks playback for the rest
  of the session.
- **The CEO memo panel needed frame-level scroll, not just a capped
  copy block** — a `.cutscene-frame` `max-block-size` + `overflow-y:auto`
  (`docs/../src/styles.css`), because the panel's total content (avatar +
  heading + several paragraphs) exceeded the viewport even with the copy
  block itself capped. Also needed `focus({ preventScroll: true })` on
  the per-panel Continue/Next button — without it, the frame's own new
  scroll container would auto-scroll to reveal the focused button and
  hide the heading above it on every panel change.
- Verified end-to-end in the Browser pane: fresh avatar → all 13 panels →
  chains into the existing opening beat → sector transition → Sector 1
  mission, no console errors. `npm run check` green throughout.

**Depends on:** P5.1 (needs the reordered flow to have a slot for it).

---

## Wave 6 — Deployment prework and save-slot state management

Opened 2026-08-10 from direct product-owner request: research what
public deployment (Vercel) needs, and design the multi-save system
(BACKLOG.md item 8) that was previously deferred. Both came back
unblocked enough to schedule immediately. P6.1 and P6.2 are independent
of each other — safe to parallelize, one branch each.

### P6.1 — Deployment prework (not a deploy)

**What:** BACKLOG.md item 10. Everything in that item's "Rough scope"
that does not require the data-release decision:
- `"engines"` field in `package.json` pinning a known Vercel-supported
  Node LTS (e.g. 22) instead of leaving the build Node version
  unspecified.
- A `vercel.json` (or equivalent documented zero-config settings)
  explicitly pinning build command (`npm run build`) and output
  directory (`dist`).
- A "Deployment" section in `README.md` documenting the process, with
  the data-release-gate requirement stated inline and impossible to miss
  — not a footnote.
- Build the minimized 5-table SQLite derivative (`Customer`, `Genre`,
  `Invoice`, `InvoiceLine`, `Track` — see item 10's research for the
  exact method and verified size) for real, save it alongside the
  existing `SQL Databases/iTunes.sqlite` reference (**never modify or
  replace anything inside `SQL Databases/` itself** — the derivative is
  a new file elsewhere, e.g. `src/assets/data/`), and verify it against
  every mission's expected results (not just the one spot-checked during
  research), the same way `docs/AI_WORKFLOW.md` requires reference SQL
  to be checked against real data before being trusted. **Do not wire it
  into `sqlRunner.ts` as the active data source** — that switch is the
  gated decision itself, not prework.

**Done when:**
- `npm run check` still passes with the new `engines` field and
  `vercel.json` in place.
- README's deployment section exists and states the data-gate
  requirement before any deploy-command instructions, not after.
- The minimized derivative file exists, is verified against all 25
  missions' expected results (not a sample), and is **not** referenced
  by any runtime code path yet.
- Nothing in `SQL Databases/` was modified.
- Nothing was actually deployed anywhere.

**Blocked on:** Nothing for the prework above. Actually deploying is
blocked on the data-release decision in BACKLOG.md item 10 — that
decision is not this packet's job to make or wait on; it just shouldn't
be crossed.

---

### P6.2 — Multi-save / profile state management

**What:** BACKLOG.md item 8's full design, implemented: a new
`metric-quest-saves-v1` `SaveStore` (`src/lib/progress.ts`), a one-time
non-destructive migration from the existing single-save
`metric-quest-progress-v1` key, new exports (`listSaveSlots`,
`createNewSave`, `switchActiveSave`, `deleteSave`, `renameSave`) beside
the unchanged `loadProgress`/`saveProgress`, and a Home-screen entry
point into a slot-picker overlay reusing `GlossaryPanel`'s established
overlay/focus-trap pattern (see item 8's design for the full rationale on
each of these — read it before starting, don't re-derive it from
scratch).

**Done when:**
- A fresh browser with no existing save gets exactly one default slot,
  created transparently — no "no save found" dead end.
- A browser with an existing v1 single save migrates to exactly one slot
  on first load post-upgrade, with all existing progress intact, and the
  migration does not run again on subsequent loads.
- A player can create a new save (no confirm needed — additive, nothing
  is overwritten), switch between saves, rename a save, and delete a
  save (confirm required — destructive).
- Every existing component (`MissionView`, `HomeView`, `AvatarCreatorView`,
  etc.) needs **zero changes** beyond `App.tsx`'s bootstrap and the new
  Home entry point — if a component besides those two needs to change,
  that's a signal the `Progress`-shaped API surface wasn't preserved
  correctly and is worth stopping to reconsider, not pushing through.
- The slot-picker overlay is keyboard-operable end to end (trapped Tab,
  Escape closes, focus returns to the trigger), matching
  `GlossaryPanel`'s existing bar.
- New tests in `src/lib/progress.test.ts` cover: migration from a v1
  save, migration not double-running, create/switch/delete/rename, and
  the cold-start no-existing-data case.
- `npm run check` passes.

**Blocked on:** Nothing — see BACKLOG.md item 8's "Open questions" note:
the remaining implementation-detail defaults (slot-naming default, soft
10-slot cap, leaving the old v1 key in place indefinitely) are cheap to
change later and don't need to block starting.

---

## Wave 7 — Third UAT round: title screen, onboarding fix, cutscene simplification (2026-08-11)

Opened and shipped in one continuous live-playtest session — the product
owner drove the browser directly and gave feedback across several rounds
in one sitting, not a written note. All four packets below plus the P5.5
correction landed together in PR #15 (the correction landed separately
first, in PR #14) rather than as four separate branches, since they were
discovered and fixed within one session rather than planned in advance —
described separately here for traceability, not because they need
separate future work.

### P5.6 — Mission view header refinement, round 2

**What:** BACKLOG.md item 9's 2026-08-11 update, extending P5.4. Merges
the header's "Sector map" text link and "Browse sectors" drawer trigger
into one control (the drawer gains a "Back to main screen" action to
cover what the removed link did); swaps the header's generic app-branding
eyebrow/title for the mission's own chapter/concept/title, letting the
now-redundant duplicate in the workspace below be removed; enlarges the
schema explorer and SQL editor and tightens box padding to make room;
visually hides (not removes) the "Write a read-only SQL query" label; and
moves the schema panel's description inline next to its heading.

**Done when:** all of the above hold, `npm run check` passes, and no
accessibility regression (the visually-hidden label keeps an
`aria-labelledby` reference, the consolidated map control keeps
`aria-expanded`/keyboard operability). **Shipped** — verified live in the
Browser pane across the flow, screenshots taken at each step.

**Blocked on:** Nothing.

---

### P7.1 — Title screen (Resume / New game gate)

**What:** BACKLOG.md item 11, new. A new `TitleScreen` component gates
`App.tsx`'s `view` state on first load (`'title'` instead of `'home'`).
"Resume game" renders only when `hasAnyProgress` (a new `progress.ts`
export: avatar set, opening seen, a mission completed, or points > 0) is
true, and just sets `view: 'home'`. "New game" resets the active save in
place (`resetActiveSave`, a new `progress.ts` export reusing
`saveProgress`) rather than creating a new slot, and if there's real
progress to lose, shows an inline warning with confirm/cancel before
doing it. Reuses the mainframe-pull beat's corridor background, the
existing panel/button chrome, and `cue-c-mainframe-overture` (already
sourced, CC0) as a looping menu theme with a mute toggle — no new art.

**Done when:**
- A fresh browser sees only "New game"; a browser with real progress sees
  both options.
- "New game" with existing progress requires an explicit confirm before
  touching anything; cancel returns to the two-option state with no
  side effects.
- "Resume game" is one click straight to Home with existing progress
  intact.
- The screen is centered like every other cutscene/transition panel (it
  needs the `sector-transition` class for this — a real bug, found and
  fixed the same session: without it, the panel rendered pinned to the
  top-left).
- `npm run check` passes.

**Shipped** — verified live end-to-end: fresh-state and existing-save
title screens, the warn/confirm/cancel flow, Resume landing on Home,
audio autoplay's gesture-unlock behavior (same limitation/pattern as
`CutsceneView`'s), and the centering fix, all via direct DOM inspection
and screenshots in the Browser pane, not just code review.

**Blocked on:** Nothing.

---

### P7.2 — Onboarding flow correction: New game skips Home

**What:** A correction surfaced by P7.1 itself: "New game" originally
just set `view: 'home'` after resetting progress, which meant a brand
new player saw Home's Incident Brief before ever seeing the cutscene that
explains what happened. Fixed by sending "New game" into avatar creation
instead (`setAvatarMode('onboarding'); setView('avatar')`), and
generalizing `proceedPastAvatar` to accept `mission: Mission | null` so
the existing avatar-confirm -> intro-cutscene chain works with no mission
queued up (lands on Home once the cutscene finishes, via the same
already-existing null check in `handleCutsceneFinish`) instead of needing
a special case.

**Done when:** "New game" -> avatar creator -> intro cutscene -> Home,
with no regression to "Redo your badge" (avatar edit, still lands on Home
directly, unaffected by the generalization) or "Resume game" (unaffected,
still direct to Home). `npm run check` passes.

**Shipped** — verified live: New game reaches "Print your access badge"
(not Home), and Resume still reaches Home directly with existing
progress.

**Blocked on:** Nothing.

**Depends on:** P7.1 (this is a fix to behavior P7.1 introduced).

---

### P7.3 — Intro cutscene simplification (presentation only)

**What:** Product feedback on the already-shipped P5.5 cutscene, applied
without touching its script, sequencing, or art:
- Avatar sprite removed from Panels 1-6 (`showAvatar: true` deleted from
  each in `src/content/beats.ts`) — added clutter, no narrative value.
  Panels 8+ unchanged, per explicit feedback that those already work.
- `CutsceneView`'s panel counter ("Panel X of Y"), mute-music toggle, and
  "Press Continue when you're ready" hint text removed — generally, not
  scoped to this one beat. (`.cutscene-mute-toggle` and
  `.sector-transition-hint` CSS stayed, since `TitleScreen` and
  `SectorTransitionView` still use them respectively — checked before
  deleting either rule.)
- The CC-BY credit line for Cue A (the only one of the three cues that
  needs attribution) resized to fit on one line instead of wrapping
  across several padded ones.
- Panel 8's avatar motion redesigned: `AvatarMotion`'s `'dissolve'` key
  renamed to `'pulled'`, with new keyframes (spin + shrink-to-a-point,
  increasing blur) reading as being sucked into the machine, rather than
  a plain fade — paired with the existing glitch-zap sfx on the same
  panel.

**Done when:** all of the above hold with no change to the beat's copy,
image assets, or panel sequence; `npm run check` passes.

**Shipped** — verified live panel-by-panel through the full
`mainframePullBeat` sequence, including confirming the new
`.cutscene-avatar-pulled` class applies on Panel 8 via direct DOM
inspection.

**Blocked on:** Nothing.

**Depends on:** P5.5 (revises it, doesn't replace it).

---

### P7.4 — Mission scoreboard reorg, round 2

**What:** BACKLOG.md item 9's 2026-08-11 update, the other half (P5.6
above covers the sector-map/eyebrow/schema-editor changes from earlier in
the same session; this is the scoreboard/badges change from later in it).
`MissionView`'s `.scoreboard` (integrity bar + points) stacked vertically
and carried the badges disclosure too, both reading as taller/heavier
than they needed to. Reordered to a single horizontal row (integrity bar
to the left of points), unified the points `<strong>` to the same
(non-pixel) font as the progress bar's label instead of a heavier
Press-Start-2P treatment, and moved the badges disclosure out of the
scoreboard into the Terminal Reward box beside it.

**Done when:** the scoreboard renders as one narrow row, both pieces of
text share a font, badges are reachable from Terminal Reward instead of
the scoreboard, and nothing regresses keyboard operability on the
`<details>` disclosure. `npm run check` passes.

**Shipped** — verified live via screenshot: the scoreboard is a single
row, "Mainframe integrity" and "0 points" match in font, and badges
appear under "Terminal reward."

**Blocked on:** Nothing.

**Depends on:** P5.4 (reorganizes header real estate P5.4 established).

---

## Definition of done (applies to every packet)

A packet is finished when all of the following are true:

- The change is on its own branch off `main`, never committed to `main`
  directly.
- `npm run check` passes (lint, tests, typecheck, build) — or every check
  that could not run is named in the handoff along with why. Never claim
  a check passed when its dependencies were unavailable.
- Any reference SQL added or changed was executed against the approved
  local dataset before its expected result was encoded. AI-generated SQL
  is a hypothesis, not evidence.
- `SQL Databases/` is untouched.
- Keyboard operability, visible focus, and non-color-dependent feedback
  hold on every text-heavy learning surface the packet touched.
- Placeholders replaced by real assets are *deleted*, not left dead
  beside them.
- The asset tracker in `docs/BACKLOG.md` is updated if the packet
  consumed, requested, or invalidated any design asset.
- The handoff lists changed files, checks run and their results, checks
  that couldn't run and why, user-visible behavior, and remaining risks
  or placeholders — then asks for merge approval.

---

## What is deliberately *not* on this list

Recording these so they don't get quietly reintroduced as "obvious"
improvements:

- A backend, an account system, or a deployment bundle of course data —
  all gated on explicit approval.
- Telemetry or analytics of any kind, including well-intentioned
  "which missions do players fail most" instrumentation.
- Agent-generated pixel art or character illustration. Explanatory
  CSS/SVG diagrams are in scope; sprites and illustrations come from the
  external design tool.
- Any change to the SQL loop, the grading contract, or syllabus coverage
  in service of presentation work. The narrative pivot changes
  presentation and copy only.
