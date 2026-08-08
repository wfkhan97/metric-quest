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

**Blocked on:** three of item 4's open questions —
- Opening cutscene before or after the avatar creator?
- Is skip available on first viewing or only on replay?
- Any audio intended? (The game has no audio system today — confirm
  before scoping sound rather than inventing one.)

**Depends on:** P0.1 and P0.2 (the beats want the real art).

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

**Blocked on:** three of item 2's open questions — how many signatures
per concept count as v1, which attempt number triggers the diagnostic,
and whether it replaces or supplements the generic feedback.

**Depends on:** P1.1 if the explanations link into glossary entries.
Can ship without the links if Wave 1 slips.

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
