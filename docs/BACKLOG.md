# Metric Quest — Feature Backlog

Status: items 1-4 are the original four ideas (mostly built now — see each
section's status line and `docs/BUILD_ORDER.md`); items 5-8 were opened
2026-08-09 from the first real UAT playtest of the merged build. Items
5-7 are unblocked and scheduled as BUILD_ORDER.md P4.x packets; item 8 is
explicitly deferred (post-polish); item 3 still needs explicit
product-owner approval per `AGENTS.md` before any implementation starts.
Read `docs/GAME_DESIGN_BRIEF.md` and `docs/architecture.md` first; nothing
here changes the grading contract, the SQL loop, or the browser-only
boundary unless a section explicitly flags that it does.

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
- ~~How many mistake signatures per concept are "enough" for v1~~ —
  **Resolved 2026-08-08:** short list, not exhaustive. P2.2 shipped 4
  high-confidence signatures across Sector 2's 3 missions (2 for m2-1, 1
  each for m2-2/m2-3) rather than forcing 2+ per mission — a second m2-3
  candidate (an unnecessary-but-harmless join) was tested against the real
  dataset and dropped because it never actually produces a wrong result,
  so it could never fire.
- ~~Attempt threshold~~ — **Resolved 2026-08-08:** 2nd wrong attempt.
  Landed in P2.2.
- ~~Replace or supplement~~ — **Resolved 2026-08-08:** always supplements
  the generic wrong-answer feedback, never replaces it; grading.ts stays
  the sole verdict. Landed in P2.2.
- Does this want its own visual treatment (e.g. a distinct panel from the
  results panel) or should it slot into the existing feedback area?
  **Resolved during the packet** (per BUILD_ORDER.md's allowance for
  non-blocking questions): slots into the existing `.feedback.error`
  section as a nested `.diagnostic` block, not a separate panel — reads as
  "more detail on the miss," not a second, competing verdict.

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

### Update (2026-08-09) — playtest feedback, two new sub-items scoped
First real UAT pass (playing the merged build, not just unit tests) found
two spots where the existing Phase 1 treatment reads as flat rather than
dramatic. Both resolved to the same phased approach as everything else in
this item — CSS-only now, real art later, per product direction:
- **Opening cutscene needs more weight.** The intro establishes the pitch
  but doesn't feel jarring/dramatic. Scoped as a CSS pass on the existing
  beat (screen shake, glitch intensity ramping, scanline/typewriter
  emphasis) — no new art, extends the same Phase 1 toolkit this item
  already uses. Tracked as BUILD_ORDER.md P4.3.
- **`m8-1` (ROGUE.exe's first direct appearance) doesn't land as a
  confrontation.** It currently reuses the same static aside treatment as
  any other mission. Scoped as a CSS-only escalation on the existing
  `rogue-corrupted` sprite (more aggressive glitch, shake, a harder verbal
  beat) for now; a real cinematic upgrade (multi-panel slideshow, per §A8
  Phase 2) is scoped and prompt-drafted in `docs/GAME_DESIGN_BRIEF.md`
  §B Step 3b, but not commissioned yet — send that prompt whenever the
  real-art version is wanted. Tracked as BUILD_ORDER.md P4.4.

### Open questions still to resolve before build
- Does every sector transition get an authored beat, or only some (e.g.
  just the Sector 8→9 case plus the opening) for v1, with the rest as
  incremental follow-ups? **Still open** — P2.1 (2026-08-08) built the
  general between-sector beat mechanism but only authored the opening;
  `sectorBeats` in `src/content/beats.ts` is empty, so this question still
  needs an answer before Sector 8→9 (or any other) beat gets written.
- ~~Should the opening cutscene run before or after the avatar creator~~ —
  **Resolved 2026-08-08:** before. Landed in P2.1.
- ~~How is "skip" surfaced~~ — **Resolved 2026-08-08:** unskippable on
  first viewing (no skip control, Escape does nothing); skippable on
  replay via a new "Replay opening" control on Home. Landed in P2.1.
- ~~Any voice/audio component intended~~ — **Resolved 2026-08-08:** yes,
  per product direction, but there is no audio asset pipeline and no
  capability to generate or source a real sound file here. `BeatPanel`
  carries an unwired `audioSrc?` field so a future audio asset is a
  `CutsceneView` change, not a data-model one — no playback machinery was
  built around a field that's always undefined today. See the P2.1 handoff.

---

## 5. Chrome layout compaction & navigation cleanup

### Status
New item, opened from the first real UAT playtest of the merged build
(2026-08-09). Unblocked — no new art, no new dependency, pure layout/CSS
and a small component reshuffle. Tracked as BUILD_ORDER.md P4.1.

### Problem
The mission screen's top header box carries "Back to sector map" and
"Concept glossary" as explicit boxed buttons, duplicating navigation that's
already available elsewhere (the sector map is permanently visible in the
left pane) and crowding out the box that should just be a compact
points/integrity readout. Below that, generous padding on the brief,
schema, and editor panels pushes the actual SQL editor and its action
buttons below the fold on a typical viewport — players report "losing the
ability to see most of what I need," having to scroll to reach Run
query/Show hint/Reveal example on almost every mission.

### Goals
- Remove "Back to sector map" and "Concept glossary" from the top header
  box. Top header becomes just the compact points/integrity readout,
  visually thinner than today.
- "Back to sector map" becomes a small text link (not a boxed button),
  relocated out of the header — kept as a real, focusable, keyboard-
  operable control per `AGENTS.md`'s accessibility bar, just visually
  quiet rather than removed outright. (Per product decision 2026-08-09:
  accessibility parity wins over full removal.)
- "Concept glossary" relocates next to the SQL editor's action row (Run
  query / Show hint / Reveal example query) — closer to where a stuck
  player actually is when they'd reach for it, which may also help with
  the "glossary doesn't get much use" observation below.
- Tighten padding/spacing across the mission workspace (brief, visible
  schema, SQL editor, actions) so the fold reaches further down the
  screen — goal is reaching "Run query" without scrolling on a typical
  laptop viewport, not eliminating all internal scroll (§A7 already
  allows sub-panel scroll for genuinely long content like a big result
  table or the full mission list).

### Non-goals
- Not a redesign of the terminal visual system (§A6) — same palette,
  same panel-frame/border language, just resized and rearranged.
- Not touching the SQL loop, grading, or mission content.
- Concept glossary underuse might also be a discoverability problem
  beyond placement (naming, visual weight) — this item addresses
  placement only; revisit if relocating it doesn't move the needle.

### Open questions still to resolve before build
- Exact padding/sizing targets — the product owner said they'd send a
  separate note with specific look-and-feel observations (screenshots/
  annotations). **Still open** — implement the directional guidance above
  first, then do a follow-up pass once that note arrives rather than
  guessing at exact pixel values now.

---

## 6. SQL editor syntax highlighting

### Status
New item, approved 2026-08-09. Unblocked to start, but adds the project's
first non-trivial new dependency. Tracked as BUILD_ORDER.md P4.2.

### Problem
The SQL editor is a plain `<textarea>` — no syntax highlighting, no
bracket matching, nothing that signals "this is a real code editor."
Product direction: add real SQL syntax highlighting, both because it
reduces friction writing queries and because matching the highlighting
players may already know from SQLite tooling makes the editor feel more
credible/professional.

### Goals
- Real SQL syntax highlighting in the query editor (keywords, strings,
  numbers, comments at minimum).
- Visually themed to match the existing terminal palette (§A6:
  `#0a1024`/`#0f1830`/`#1fd3c4`/`#eaf6f4`/`#ffd166`) rather than a
  library's stock theme.
- Preserve every current behavior: the textarea's value is still the
  thing graded, hints/reveal-example still work, keyboard operability is
  not regressed (the editor must remain fully usable via keyboard, per
  `AGENTS.md`).

### Non-goals
- Not adding autocomplete, linting, or schema-aware completions in this
  pass — the "Placeholder — syntax highlighting and autocomplete are
  coming in a later release" note can drop "syntax highlighting" once
  this ships, but "autocomplete" stays a future item.
- Not changing the grading/runner boundary — the editor is still a plain
  text source for one read-only SELECT (or the temp-table two-statement
  form); this is presentational only.

### Rough scope
- CodeMirror 6 (`@codemirror/*` packages) with its SQL language mode —
  the standard client-side-only editor toolkit; no server/network
  component, so it doesn't touch the browser-only constraint. This is a
  real new dependency (first non-trivial one in `package.json`) and will
  add real bundle weight (rough estimate 150-300KB) — acceptable given
  `sql.js`'s WASM payload is already the app's biggest asset by far, but
  worth checking `npm run build`'s output size after landing it.
- Custom theme extension matching the terminal palette, not a stock
  CodeMirror theme.

### Open questions still to resolve before build
None — scoped and approved. Implementation detail (exact CodeMirror
package set, theme construction) is an implementation call, not a product
question.

---

## 7. Avatar sprite transparency fix

### Status
New item, defect found during 2026-08-09 UAT playtest. Blocked on the
product owner running a Claude Design prompt (already drafted) and
handing back the result — not an agent-buildable item. Tracked as
BUILD_ORDER.md P4.5.

### Problem
All 12 delivered avatar sprites (`src/assets/avatars/recruit-*.png`) were
verified pixel-by-pixel and confirmed defective: fully opaque
(`alpha=255` everywhere) with a checkerboard *pattern baked into the
actual pixels* rather than a real alpha channel. It renders as a visible
gray/white checkerboard behind every character — most noticeable on the
avatar creator and sector-transition screens. Every other delivered
asset (ROGUE.exe sprites, sector backgrounds, UI chrome) was checked the
same way and confirmed to have genuine transparency — this defect is
isolated to the avatar set.

### Fix
Not fixable in code — this is baked pixel content, not a CSS/rendering
bug, and per `AGENTS.md` this project doesn't generate replacement
character art directly. The re-export prompt and a verification method
(so the fix can be confirmed before re-wiring, rather than trusted by
eye) are in `docs/GAME_DESIGN_BRIEF.md` §B Step 1c.

### Open questions still to resolve before build
None — root cause confirmed, fix prompt drafted. Waiting on the product
owner to run it and hand back the result.

---

## 8. Multi-save / new-game / profile state management

### Status
New item, explicitly deferred by product direction 2026-08-09 — **do
not build now**. Logged so it isn't lost, not scheduled into
BUILD_ORDER.md.

### Problem
Progress today is a single implicit save per browser (`localStorage`,
see `src/lib/progress.ts`) — there's no way to start a new game, keep
multiple save slots, or return to a previous game state once overwritten.
For a single-player classroom exercise this is fine for now; it becomes
a real gap if multiple students share a machine, or a player wants to
replay from scratch without losing their current run.

### Explicit product direction
Revisit **post-polish** — after the current visual/UX polish pass (P4.x)
and any remaining P2.2-style content work, not before. Not blocked on a
missing decision so much as intentionally not prioritized yet.

### Open questions (for whenever this gets picked up)
- Save-slot model: named slots, a slot picker on Home, or something
  simpler (just an explicit "New Game" that confirms before overwriting)?
- Does this change the `localStorage` schema in `progress.ts` in a way
  that needs a migration for existing single-save players, or is it
  additive?

---

## Design asset tracker

Single source of truth for which art each backlog item needs and whether
it exists yet. **Update this table (status + link/path) whenever a Claude
Design result comes back**, and update the corresponding item's section
above to remove any "not built yet" caveat that no longer applies.

| Asset | Needed for | Status | Link / path |
| --- | --- | --- | --- |
| Sector backgrounds, Sectors 1-3 & 8 | Item 4 (Phase 2 cutscenes); general sector polish | **Wired in (2026-08-08).** All 9 sector backgrounds render behind `SectorTransitionView`, mapped by chapter number in `sectorBackgrounds.ts`; the interstitial frame is bottom-anchored into the open lower-middle third and stays fully opaque so contrast never depends on the art. Sector 8's body-horror lean — **resolved 2026-08-09:** product owner played it live and confirmed it reads fine; no touch-up pass needed, closing that open note. | `src/assets/backgrounds/sector-{1-9}.jpg` (compressed from the export at `~/Downloads/stage_backgrounds/`) |
| Sector backgrounds, Sectors 4-7 & 9 | Item 4 (Phase 2 cutscenes); general sector polish | **Wired in (2026-08-08).** Same mechanism as above. Sector 9 (Boardroom Core) is a standout, exact match to brief. | Same as above |
| ROGUE.exe illustrations (calm + corrupted) | Item 4 (opening/Sector 8 cutscene beats) | **Wired in (2026-08-08).** Both states live as a reusable `<RogueSprite state="calm" \| "corrupted" />` component (`src/components/RogueSprite.tsx`); `MissionView`'s m8-1 aside now renders `corrupted` in place of the CSS glitch-icon placeholder, which has been deleted. `calm` is not yet used anywhere — it's available for the P2.1 opening cutscene. | `src/assets/rogue/rogue-{calm,corrupted}.png` (192×192, resized/compressed from the Claude Design export at `~/Downloads/rogue_sprites/`) |
| Avatar sprite set | Not a backlog item here, but shared dependency | Shipped, but **defective — found 2026-08-09 (item 7).** All 12 sprites in `src/assets/avatars/` have a checkerboard pattern baked into opaque pixels instead of real alpha transparency (verified with PIL: `alpha=255` everywhere). Re-export prompt + verification method in `docs/GAME_DESIGN_BRIEF.md` §B Step 1c — blocked on the product owner running it. | `src/lib/avatarOptions.ts` |
| Sector 8/9 confrontation cinematic (multi-panel) | Item 4 (§A8 Phase 2) | Not yet requested — prompt drafted 2026-08-09 in `docs/GAME_DESIGN_BRIEF.md` §B Step 3b, ready to send whenever wanted. A CSS-only stand-in ships first (BUILD_ORDER.md P4.3/P4.4) so this isn't blocking. | — |
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
