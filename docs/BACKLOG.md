# Metric Quest — Feature Backlog

Status: loose PRDs for four ideas, not yet scheduled into any sector's build
order. None of this is authorized to start implementation — each item still
needs the open questions below answered (some need explicit product-owner
approval per `AGENTS.md`, called out where relevant) before an agent should
turn it into a plan. Read `docs/GAME_DESIGN_BRIEF.md` and `docs/architecture.md`
first; nothing here changes the grading contract, the SQL loop, or the
browser-only boundary unless a section explicitly flags that it does.

More assets are being generated on an ongoing basis via Claude Design (the
same workflow as `docs/GAME_DESIGN_BRIEF.md` §B), so items below are not
blocked on missing art — each notes what design assets it would need, and
the **[Design asset tracker](#design-asset-tracker)** at the bottom is the
single place to update once a given asset actually lands (status + a link
or path to the delivered art). Keep that table current rather than letting
asset status drift out of sync with what's actually been generated.

---

## 1. Concept glossary / index with visuals & animations

### Problem
Players who get stuck mid-mission have no in-app reference for the SQL
concept they're being tested on — they either guess, look it up outside the
game, or give up. There's no single place that explains "what is a `JOIN`"
or "what does `HAVING` do differently from `WHERE`" in the game's own voice.

### Goals
- A glossary of SQL concepts (one entry per concept the curriculum tests:
  filter/sort/limit, `DISTINCT`, aggregation, `GROUP BY`/`HAVING`, joins,
  subqueries/CTEs, dates, `CASE`/casts, views — see the Sector table in
  `docs/GAME_DESIGN_BRIEF.md` §A4 for the full list) that a stuck player can
  open without leaving their current mission.
- Each entry explains the concept in plain language, shows a minimal
  worked example, and includes a small animated/visual aid (e.g. an
  animated diagram of rows being filtered, or two tables merging on a join
  key) — built with CSS/SVG, not agent-generated images, per `AGENTS.md`'s
  rule that illustrated art comes from the external design tool only.
  Diagrams here are functional/explanatory, not character art, so they're
  in scope to build directly in code.
- Entries reuse the terminal visual system (§A6 of the brief) so the
  glossary reads as another in-world terminal screen, not a bolted-on help
  widget.

### Non-goals
- Not a full SQL reference manual — scope is exactly the concepts the
  curriculum teaches, no more.
- Not AI-generated or dynamically personalized (see item 2 for the
  mistake-aware version of this idea) — this is a static, hand-authored
  reference.
- Doesn't change grading, hints, or mission content.

### Rough scope
- **Access:** an always-available control (e.g. a status-bar button/hotkey)
  opens the glossary from any mission, per product decision. It's
  player-initiated — nothing pops up uninvited.
- **Structure:** glossary is organized by sector/concept, with a way to
  jump straight to the entry relevant to the mission the player is
  currently on (e.g. deep-link from the mission's concept tag).
- **Content:** static data (like `src/content/chapters.ts` today) — one
  entry per concept with title, plain-language explanation, a short SQL
  example, and a reference to which CSS/SVG animation component renders
  its visual.
- **Research source, not copy source:** draw on public SQL references
  (W3Schools, the SQLite/PostgreSQL docs, Mode's SQL tutorial, etc.) to
  check accuracy and borrow well-tested diagram *concepts* — e.g. the
  classic Venn-diagram framing for join types, or a row-filtering
  before/after visual for `WHERE`/`HAVING`. Don't copy their text or embed
  their images directly: rewrite explanations in Metric Quest's own voice
  and redraw diagrams as CSS/SVG in the terminal palette (§A6), both to
  avoid reproducing copyrighted site content and to keep every glossary
  entry visually consistent with the rest of the app. If a more polished,
  hand-illustrated version of a diagram is wanted later, that's a
  candidate for a Claude Design request — track it in the asset tracker
  below rather than building it ad hoc.
- Internal scroll only (consistent with §A7's "no page-level scroll" rule)
  — the glossary panel itself may scroll if the list is long.

### Open questions still to resolve before build
- ~~Exact entry list and count~~ — **Resolved 2026-08-08:** closely related
  concepts (e.g. `WHERE` vs `HAVING`) share one entry with a comparison,
  rather than a strict one-entry-per-mission-concept-tag model. Landed in
  P1.1 as 16 entries covering all 25 missions' concept tags.
- ~~Overlay vs. leave the mission~~ — **Resolved 2026-08-08:** the glossary
  opens as an overlay on top of the active mission (or Home); closing it
  returns exactly where the player was. Landed in P1.1 as `GlossaryPanel`.
- Copy voice: should glossary entries go through the same design-brief
  tone pass as mission copy (in-world, playful-retro), or is a more
  neutral "documentation" voice acceptable given this is reference
  material rather than story content? (Sourcing itself is resolved above
  — public sites for research/accuracy, rewritten in-house either way.)

---

## 2. Mistake-aware diagnostic (local, rule-based)

### Problem
Players who fail a mission repeatedly get the same generic
correct/incorrect feedback every time, with no escalation toward "here's
specifically what's wrong with your approach." There's no mechanism that
notices *what kind* of mistake a player keeps making and responds to it.

### Decision made
Per product direction, this stays **fully local and rule-based** — no
external AI call. A pattern-matching layer classifies a failed query
against a small taxonomy of common mistake types and retrieves a
pre-authored explanation (and, where useful, a glossary visual from item 1)
from a hand-built library. This fits the current browser-only architecture
with no `AGENTS.md` exception needed. A future AI-generated version is
explicitly out of scope for this item — if wanted later, it should be
scoped as its own item, phased behind the same approval gate as item 3.

### Goals
- Classify a failed submission into one of a fixed set of known mistake
  patterns per concept — e.g. for joins: "missing join condition (cartesian
  product)," "wrong join direction/table," "joined on the wrong column";
  for aggregation: "forgot GROUP BY," "used WHERE instead of HAVING to
  filter an aggregate," "off-by-one in a LIMIT/date range."
- On a repeated failure (e.g. 2nd or 3rd wrong attempt on the same
  mission), surface the matched explanation instead of (or alongside) the
  generic wrong-answer feedback, with an optional link into the relevant
  glossary entry from item 1.
- Classification runs entirely on the already-executed result table and/or
  a light structural read of the submitted SQL (e.g. does it contain a
  `GROUP BY` clause) — never sends the query anywhere, consistent with
  `docs/architecture.md`'s "sends no query text ... to a server."

### Non-goals
- Not a general SQL linter or full parser — only needs to detect the
  specific mistake shapes the curriculum's missions are prone to.
- Doesn't change the grading contract (`grading.ts` stays the source of
  truth for correct/incorrect) — this is an additive feedback layer, not a
  new pass/fail mechanism.
- No telemetry/analytics collection about what mistakes players make
  (per `AGENTS.md`'s no-telemetry rule) — pattern matching happens
  client-side per-attempt and isn't logged anywhere beyond the session.

### Rough scope
- A per-mission (or per-concept) list of "known mistake signatures" — each
  signature paired with a check (structural SQL check, and/or a check on
  the executed-but-wrong result shape, like "row count too high" as a
  cartesian-product signal) and an explanation string/visual reference.
- A small classifier function that runs after a failed grading check,
  tries each known signature for that mission's concept in order, and
  returns the first match (or falls back to today's generic feedback if
  nothing matches).
- Authoring the signature library is the bulk of the work — likely one
  pass per sector/concept, reusing whichever missions already exist.

### Open questions still to resolve before build
- How many mistake signatures per concept are "enough" for v1 — a
  short list per sector (3-5 common ones) or exhaustive coverage?
- Attempt threshold: surface the diagnostic on the 2nd wrong attempt,
  3rd, or configurable per mission difficulty?
- Should the diagnostic ever *replace* the generic wrong-answer feedback,
  or always appear alongside it as a "need a hint?" affordance the player
  opts into (keeping the base feedback loop unchanged for players who
  don't want it)?
- Does this want its own visual treatment (e.g. a distinct panel from the
  results panel) or should it slot into the existing feedback area?

---

## 3. Player-connected AI subscriptions → in-game SQL tutor ("good AI" character)

### Status: research/prototype scoping only — not approved to build
This is the one idea that structurally conflicts with current project
rules: `AGENTS.md` says *"The app is browser-only. Do not add accounts,
servers, telemetry, external AI calls, or network-dependent query
execution without explicit approval."* A tutor backed by a player's own
ChatGPT/Claude subscription requires exactly that — an account-connect
flow and live external API calls. Per product direction, this PRD is
scoped as a **privacy-limited prototype concept** to keep flushing out,
not a green light to implement. Building it for real needs an explicit,
separate approval decision, tracked the same way the course-data release
gate is tracked in `docs/AI_WORKFLOW.md`.

### What Monet.gg is (researched 2026-08-06)
Monet positions itself as "OAuth for AI subscriptions" — a service that
lets a SaaS product integrate AI capabilities without owning the AI bill.
Mechanically:
- Players connect an existing ChatGPT Plus/Claude Pro/Team subscription
  via a hosted OAuth-style flow, or supply their own API key (BYOK).
- Credentials are vaulted (AES-256-GCM) and never exposed to the
  integrating app.
- The app calls Monet's API, which proxies the request to the underlying
  provider and streams the response back; Monet logs token usage per
  request for billing/rate-limiting.
- Integration is a three-step flow: Connect → Consent → Proxy, via a
  developer dashboard.
This would mean Metric Quest calls a third-party API (Monet's proxy)
directly — it's an open question whether that can happen straight from
the browser (no game-owned backend needed) or whether Monet's flow
requires a server-side piece, which would be a bigger architecture change.
Monet's own pricing/billing details weren't published on the page fetched.

### Narrative fit
The brief (`docs/GAME_DESIGN_BRIEF.md` §A3) already reserves space for
this: *"Optional, later, not required for v1) a friendly mentor/sysadmin
voice delivering hints."* The "good AI" tutor is a natural fit for that
slot — a counterpart to ROGUE.exe, in-world justified as an uncorrupted
assistant helping the player fight back.

**Design asset needed:** a character sprite/illustration for this mentor,
parallel to the ROGUE.exe prompt in §B Step 3 but friendly rather than
villainous — not yet requested from Claude Design (see tracker below).
Text-only/placeholder chat UI can ship before that art exists, same
pattern as every other not-yet-illustrated surface in this game.

### Goals (for the prototype scoping, not final build)
- Let a player who opts in connect their own AI subscription/API key via
  Monet, and get a chat-style tutor character available during missions.
- The tutor should help players reason through *their own* stuck query —
  not solve it for them outright (design question below).
- Entirely opt-in: players who don't connect anything see zero change to
  the current experience.

### Privacy-limited scope (per product decision)
To respect the course-data release gate in `docs/AI_WORKFLOW.md` (the
original course database is instructional source material, not a public
asset), the tutor should be scoped so it **never receives the underlying
dataset, schema contents, or query results** — only:
- The mission's business question (already player-facing copy).
- The player's own submitted SQL attempt and the error/mismatch category
  from grading (e.g. "wrong number of rows," "syntax error near X") —
  not the actual row data returned.
This keeps the course data itself from ever leaving the browser, even
though the tutor call itself leaves the browser. This scoping is a
starting assumption for the PRD, not a final security review — a real
build would still need a privacy/security pass before shipping.

### Non-goals (for now)
- Not a general-purpose chatbot — scoped tightly to the current mission's
  SQL problem.
- Not a replacement for item 2's local diagnostic — item 2 stays
  available with zero setup; this is an optional upgrade for players who
  connect an account.
- No in-game billing or payment handling by Metric Quest itself — if
  BYOK/subscription costs apply, they're between the player and their AI
  provider/Monet, never routed through the game.

### Open questions still to resolve before build
- **Approval:** does the product owner want to formally approve the
  external-AI-call exception for this feature, and under what conditions
  (e.g. prototype/flagged-off first, or full review before any code)?
- Does Monet's flow require Metric Quest to run any server-side code, or
  can the browser call Monet directly? This changes whether it violates
  the "browser-only" rule or just the "no external AI calls" rule.
- How much should the tutor be allowed to say — hints only, or full
  answers if asked? (Affects both pedagogy and scope.)
- What happens to a player's connected account/session — reconnect every
  visit, or persisted somehow? (Progress today is localStorage-only and
  per-browser; an account connection is a different kind of state.)
- Cost/support exposure: if Monet's proxy has usage-based pricing, who
  is expected to pay — the player via their own subscription, or does
  Metric Quest need its own Monet developer account and bill?
- Does this need its own explicit consent/disclosure screen (what data
  leaves the browser, to whom) before a player connects anything?

---

## 4. Cutscenes — opening story + between-sector beats

### Status
Builds directly on the roadmap already written in
`docs/GAME_DESIGN_BRIEF.md` §A8 — this backlog item doesn't introduce a
new system, it schedules Phase 1 of that roadmap concretely: an opening
cutscene and a general between-sector beat mechanism, both using only
existing static art with CSS effects (no new art dependency), so it can
ship immediately. Phase 2 (multi-panel slideshow cutscenes) is the noted
upgrade path — since sector background and ROGUE.exe art is being
generated via Claude Design on an ongoing basis (§B Steps 2/2b/3), Phase 2
isn't blocked indefinitely, just blocked on whichever specific pieces of
art haven't landed yet. Check the asset tracker below before scoping a
Phase 2 pass — art that's already delivered by then should just be used.

### Problem
Right now the story context (why the player is inside the mainframe,
who ROGUE.exe is) lives only in the design brief, not in the actual
player experience — there's no opening beat that establishes it in-app.
Between sectors, the only story beat currently planned is the one-off
"Sector 8 completion teases Sector 9" moment (§A5) — there's no general,
reusable pattern for between-sector story beats elsewhere in the game.

### Goals
- **Opening cutscene:** a short, skippable sequence shown before/at the
  start of Sector 1 that establishes the pitch (§A1) — Aurora Music,
  ROGUE.exe, why the player is pulled into the mainframe — using existing
  sprites/panels and Phase 1 CSS effects (glitch/flicker, slide, zoom,
  scanline sweep, typewriter text reveal), styled as part of the terminal
  system (§A6), not a separate visual language.
- **Between-sector beats:** a reusable, lightweight mechanism (not just
  the one-off Sector 8→9 case) for showing a short in-world story beat
  when a player completes a sector and unlocks the next one — reusing the
  same Phase 1 CSS-effect toolkit and the existing `SectorTransitionView`
  screen rather than inventing a new component type.
- Skippable and replayable-safe: a returning player shouldn't be forced
  through the opening cutscene again, and any player should be able to
  skip a beat they've already seen (consistent with progress being
  localStorage-tracked already).

### Non-goals
- Shipping v1 doesn't require waiting on any new art — if a beat needs an
  image that hasn't landed yet, it falls back to the existing
  text-only/placeholder treatment already used for sectors without art.
  **Update (2026-08-06): that caveat no longer applies** — all 9 sector
  backgrounds and both ROGUE.exe states have been generated and verified
  (see the asset tracker below), though none are wired into the app yet.
  Phase 2 (multi-panel slideshow) is no longer blocked on missing art; it's
  now blocked only on someone actually building it.
- Not building Phase 2's multi-panel slideshow format now — this item
  should be structured so Phase 2 is a clean upgrade (swap in more
  panels/art) rather than a rewrite, but only Phase 1 is in scope to ship.
- Doesn't change mission content, grading, or sector ordering — purely a
  presentational/story layer on top of the existing flow.

### Rough scope
- Opening cutscene as a new one-time screen (or a mode of
  `SectorTransitionView`) shown before the first sector, gated the same
  way the avatar creator is (one-time, re-triggerable from settings/menu
  if that pattern exists).
- Between-sector beats as data: a short list of (sector transition →
  optional beat copy + CSS effect sequence), defaulting to "no beat" for
  sectors that don't have one authored yet, so this ships incrementally
  per sector rather than needing all beats written before launch.
- Reuses `docs/GAME_DESIGN_BRIEF.md` copy/tone guidance directly — no new
  tone decisions needed, this is presentation of story already defined
  in §A1-A3.

### Open questions still to resolve before build
- Does every sector transition get an authored beat, or only some (e.g.
  just the Sector 8→9 case plus the opening) for v1, with the rest as
  incremental follow-ups?
- Should the opening cutscene run before or after the avatar creator in
  the onboarding sequence?
- How is "skip" surfaced — a visible skip button/key from the start, or
  only available on replay (first viewing is unskippable)?
- Any voice/audio component intended, or purely visual + text (current
  game appears to have no audio system — confirm before scoping sound)?

---

## Design asset tracker

Single source of truth for which art each backlog item needs and whether
it exists yet. **Update this table (status + link/path) whenever a Claude
Design result comes back**, and update the corresponding item's section
above to remove any "not built yet" caveat that no longer applies.

| Asset | Needed for | Status | Link / path |
| --- | --- | --- | --- |
| Sector backgrounds, Sectors 1-3 & 8 | Item 4 (Phase 2 cutscenes); general sector polish | **Wired in (2026-08-08).** All 9 sector backgrounds render behind `SectorTransitionView`, mapped by chapter number in `sectorBackgrounds.ts`; the interstitial frame is bottom-anchored into the open lower-middle third and stays fully opaque so contrast never depends on the art. Sector 8 still leans slightly more organic/body-horror (pulsing red veins) than the brief's "campy, not horror" target — shipped as-is per prior note; still a candidate for a touch-up pass, not a re-do. | `src/assets/backgrounds/sector-{1-9}.jpg` (compressed from the export at `~/Downloads/stage_backgrounds/`) |
| Sector backgrounds, Sectors 4-7 & 9 | Item 4 (Phase 2 cutscenes); general sector polish | **Wired in (2026-08-08).** Same mechanism as above. Sector 9 (Boardroom Core) is a standout, exact match to brief. | Same as above |
| ROGUE.exe illustrations (calm + corrupted) | Item 4 (opening/Sector 8 cutscene beats) | **Wired in (2026-08-08).** Both states live as a reusable `<RogueSprite state="calm" \| "corrupted" />` component (`src/components/RogueSprite.tsx`); `MissionView`'s m8-1 aside now renders `corrupted` in place of the CSS glitch-icon placeholder, which has been deleted. `calm` is not yet used anywhere — it's available for the P2.1 opening cutscene. | `src/assets/rogue/rogue-{calm,corrupted}.png` (192×192, resized/compressed from the Claude Design export at `~/Downloads/rogue_sprites/`) |
| Avatar sprite set | Not a backlog item here, but shared dependency | Built and shipped — 12 real sprites in `src/assets/avatars/`, wired into `avatarOptions.ts`. Exceeds the original 3-4-base-sprite ask. | `src/lib/avatarOptions.ts` |
| UI chrome kit (panels, buttons, status icons) | Optional polish for items 1 and 2's panels | **9 of 10 assets wired in (2026-08-08).** Points/badge/progress/restored icons live in `HomeView`/`MissionView`/`ProgressBar`. Buttons + panel-frame now wired via **Path B** (no touch-up request was made): cropped each source PNG to its hard-edged bounding box to remove the bloom that doesn't survive slicing, then applied as CSS `border-image`. Idle/hover still share one source image (they're genuinely near-identical, as originally flagged) — hover is differentiated with `brightness`+`translateY` instead; the amber `button-active.png` art is repurposed for the real `:active` press state, `button-disabled.png` for `:disabled`. `button-hover.png` was left unused (source-only) since it doesn't read as distinct from idle at UI size. Wiring scope: `.actions button`/`.start-button` (all action buttons) and `.sector-transition-frame` only — the many generic `.panel` surfaces app-wide were deliberately left on their existing CSS border, out of scope for a Path-B fallback pass. `icon-corruption.png` is still illegible and still needs regeneration; CSS glitch placeholder still used for the error feedback icon. | Cropped/resized assets in `src/assets/ui/{button-idle,button-active,button-disabled,panel-frame}.png`; original exports at `~/Downloads/metric-quest-design-system_8_6/project/pixel_art/assets/ui/` |
| "Good AI" mentor/tutor character sprite | Item 3 | Not yet requested — no Claude Design prompt drafted yet | — |
| Glossary concept diagrams (join Venn diagram, grouping/filtering visuals, etc.) | Item 1 | Building as CSS/SVG in-house for v1; polished Claude Design versions are an optional later upgrade, not requested | — |

---

## Cross-cutting notes for whoever picks these up

- **Sequencing lives in `docs/BUILD_ORDER.md`.** This document is the
  *what*; that one is the *in what order, in what size chunks, and how to
  know a chunk is done*. It splits these four items (plus the unwired art
  in the tracker above) into branch-sized packets with acceptance
  criteria, and names which open question blocks each one. Read it before
  scoping any of this into a session.
- Items 1, 2, and 4 fit the current architecture with no approval
  needed — they can be scoped into normal sector/session work whenever
  prioritized.
- Item 3 needs an explicit approval decision before any implementation
  work starts, per `AGENTS.md`. Treat it as a standing research item
  until that decision is made.
- Follow the existing git workflow (`docs/AI_WORKFLOW.md`): one branch
  per bounded change, summarize changed files/checks/risks, and get
  merge approval before touching `main`.
