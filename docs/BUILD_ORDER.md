# Metric Quest — Build Order

Companion to `docs/BACKLOG.md`. The backlog says *what* the four ideas are
and what's still undecided; this document says *in what order to build
them, in what size chunks, and how to know each chunk is done*.

Nothing here overrides `AGENTS.md`, `docs/AI_WORKFLOW.md`, or
`docs/GAME_DESIGN_BRIEF.md`. Nothing here authorizes starting a backlog
item whose open questions are still open — a work packet below that
depends on an unanswered question names that question in its
**Blocked on** line, and that line must be cleared by the product owner
(not by an agent's judgment call) before the packet starts.

Every packet is scoped to one branch, one handoff summary, and one merge
approval, per the git workflow in `docs/AI_WORKFLOW.md`.

---

## Session status (2026-08-09) — read this first

Everything below is now built, merged, and pushed to **`claude/game-feel-polish`**
on origin (`git log origin/claude/game-feel-polish` — HEAD is the "Add Sector 1
... diagnostic signatures" commit). That branch is **not yet merged to `main`**
— it needs the user's explicit approval first, per `docs/AI_WORKFLOW.md`. There
is no other unmerged work anywhere: every `claude/*` feature branch used this
session is fully merged into `game-feel-polish` (safe to ignore/delete).

**Done this session, in order:**
- Wave 0 (P0.1, P0.2, P0.3) — sector backgrounds, ROGUE.exe sprites, UI chrome
  buttons/panel frame. P0.4 (icon-corruption.png regen) explicitly **deferred
  by the user**, still open, still blocked on a design request nobody has made.
- Wave 1 (P1.1, P1.2, P1.3) — glossary data model + panel, 5 animated
  diagrams, deep-link from a mission's concept tag into its entry.
- P2.1 — opening cutscene + reusable between-sector beat mechanism.
  `sectorBeats` in `src/content/beats.ts` is wired but **empty** — no
  between-sector beat has been authored yet (see the still-open question
  below).
- P2.2 — mistake-aware diagnostic. Classifier plumbing plus signatures for
  **Sectors 1 through 8** (`src/lib/diagnostics.ts`). Two more dead-signature
  candidates were caught and dropped this round: `m6-2`'s CAST mistake
  (`Quantity` is already an INTEGER column, so a missing CAST doesn't
  change the executed result) and `m7-1`'s "forgot to combine in the
  Invoice side" mistake (`Customer.Country` alone already covers all 24
  countries, so dropping the Invoice side of the UNION doesn't actually
  produce a wrong result either). Sector 8's `m8-3` also flips the usual
  ORDER BY trap: this mission wants ascending ("weakest first"), so the
  diagnostic there flags DESC as the mistake, not its absence — worth
  remembering when a Sector 9 mission's sort direction isn't the default
  "highest/most first" framing. Sector 9 is NOT done — same shape:
  pull the mission definitions from `src/lib/missions.ts`, design 1-2
  signatures per mission, **verify every one against
  `SQL Databases/iTunes.sqlite` with the `sqlite3` CLI before writing it
  down** (this caught real dead-signature candidates twice already — see
  the diagnostics.ts file comment and the P2.2/Sector-1 commit messages),
  then wire + verify in the browser.

**Still open / outstanding:**
- P2.2 Sector 9 — the last one, not blocked.
- P0.4 — blocked on a design request; deferred, not declined.
- BACKLOG.md item 4's "does every sector transition get an authored beat"
  question — still open, blocks writing the Sector 8→9 beat specifically.
- Wave 3 (AI tutor, P3.1) — not a build packet, just a pending product
  decision. Don't prototype it.
- **The end-to-end playthrough smoke test is now fully complete, no bugs
  found.** Confirmed this session: cutscene → avatar creator → sector
  transition → mission flow (multiple times), the glossary from both Home
  and Mission headers and via concept-tag deep-links, 5 animated diagrams
  under simulated reduced-motion, diagnostic signatures in Sectors 1/2/3,
  the `m8-1` ROGUE.exe encounter (renders correctly, visually distinct
  corrupted-state sprite), the "Sector cleared" milestone banner (fired
  correctly completing `m8-3`), the "Campaign complete — mainframe restored"
  banner (fired correctly completing `m9-2`, the last mission, with the
  `Boardroom Analyst` badge unlocking alongside it), the Sector 9
  transition screen (renders correctly with avatar + background art), and
  the Home screen's 100%-complete state (25/25 terminals, both badges
  listed, gracefully swaps "Resume: <mission>" for "Replay a sector" with
  no crash). No console errors at any point. Verified live in-browser via
  seeded `localStorage` progress (not just unit tests) — localStorage was
  cleared afterward so it doesn't interfere with the user's own UAT pass.
  Every mission's `solutionSql` was executed for real against the dataset
  during this pass, not mocked.

**How to continue:** read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and
`docs/GAME_DESIGN_BRIEF.md` first (standard project instruction, not new).
The smoke test is done — pick the next P2.2 sector packet the same way the
last three were done, no new questions needed.

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
