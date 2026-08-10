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
- Wave 3 (AI tutor, P3.1) — not a build packet, just a pending product
  decision. Don't prototype it.
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

**Status:** the classifier-plumbing-plus-one-sector split landed
2026-08-08 — Sector 2 (`m2-1`/`m2-2`/`m2-3`), 4 signatures. Sector 3
(`m3-1`-`m3-4`, joins) landed the same day, 7 signatures. Both linked
into Wave 1's glossary entries. Sectors 1, 4-9 are still open, repeatable
content-work packets, one per sector, per the suggested split above.

**Depends on:** P1.1 if the explanations link into glossary entries —
landed and used.

---

## Wave 3 — Standing research (backlog item 3)

### P3.1 — AI tutor: approval decision, not implementation

Not a build packet. The only next step is a product-owner decision on
whether to grant the external-AI-call exception and under what
conditions, tracked the way the course-data release gate is tracked.

Until that decision exists, an agent's correct action on this item is to
keep the PRD current — not to prototype, not to add a feature flag, not
to "just try the browser-direct call to see if it works." The unresolved
question of whether Monet's flow needs server-side code is exactly the
question that determines whether this violates the browser-only rule or
only the external-AI-call rule, and finding out by building is the wrong
order.

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

### P5.5 — New "pulled into the mainframe" cutscene (blocked)

**What:** BACKLOG.md item 4's second-round update. A new cutscene beat
between avatar confirmation and the existing opening beat, showing the
player's just-chosen avatar being pulled into the mainframe. **Not
started — blocked on the product owner scripting it** (copy, beat/panel
count, whether it stays Phase 1 CSS-on-existing-art or needs something
Phase 2-shaped). No placeholder dialogue will be invented for a named,
on-screen story beat.

**Default assumption once the script lands:** Phase 1, CSS-only (§A8),
reusing the avatar sprite the player just picked with the same
glitch/slide/zoom/scanline-sweep toolkit already used elsewhere — no new
art dependency, consistent with every cutscene beat shipped so far. If
the script needs more than that toolkit can do, that's a Phase 2 scope
call, same escalation path as item 4's other Phase 2 candidates (see the
asset tracker in `docs/BACKLOG.md`).

**Blocked on:** Product owner's script (see `docs/BACKLOG.md` item 4's
update). Do not prototype placeholder copy for this in the meantime.

**Depends on:** P5.1 (needs the reordered flow to have a slot for it).

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
