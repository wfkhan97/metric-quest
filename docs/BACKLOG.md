# Metric Quest — Feature Backlog

Status: items 1-4 are the original four ideas (mostly built now — see each
section's status line and `docs/BUILD_ORDER.md`); items 5-8 were opened
2026-08-09 from the first real UAT playtest of the merged build; item 3
still needs explicit product-owner approval per `AGENTS.md` before any
implementation starts. P4.x and P5.x (items 5, 6, 9, and the P5.1 part of
item 4) have all since landed on `main`. Item 2 was found fully shipped
2026-08-10 (an earlier status note here was stale — corrected). Item 8
(multi-save) was un-deferred and designed 2026-08-10 and item 10 (public
deployment) was opened the same day from real research — both scheduled
as BUILD_ORDER.md P6.x. Read `docs/GAME_DESIGN_BRIEF.md` and
`docs/architecture.md` first; nothing here changes the grading contract,
the SQL loop, or the browser-only boundary unless a section explicitly
flags that it does.

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

### Status: fully shipped (2026-08-10)
All 25 missions (`m1-1` through `m9-2`) have signature arrays in
`src/lib/diagnostics.ts`, verified directly against the file rather than
assumed from an older status note. Nothing left to build here.

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

### Update (2026-08-09, continued) — second UAT round: onboarding order + a new beat

Product direction from a second playtest pass: the first-run sequence
should be **avatar creator → a new cutscene of the avatar being pulled
into the mainframe → the existing opening beat** (the "Login accepted"/
ROGUE.exe intro, unchanged) **→ Home/first mission.** Today's order
(`src/App.tsx`) is opening beat first, then avatar creator — the
opposite — per the P2.1 decision recorded below, which this supersedes.

Split into two pieces, one buildable now and one not:
- **Reorder only (buildable now):** avatar creator runs first, then the
  existing unchanged opening beat. No new copy, no new screen. Tracked as
  BUILD_ORDER.md P5.1.
- **New "pulled into the mainframe" cutscene (blocked):** a beat showing
  the just-created avatar getting pulled into the computer, slotted
  between avatar confirmation and the existing opening beat. **Waiting on
  the product owner to script it** (copy, beat/panel count, whether it
  needs anything beyond the existing Phase 1 CSS toolkit applied to the
  avatar sprite the player just picked). Not started; no placeholder
  dialogue will be invented for it. Tracked as BUILD_ORDER.md P5.5.

### Open questions still to resolve before build
- Does every sector transition get an authored beat, or only some (e.g.
  just the Sector 8→9 case plus the opening) for v1, with the rest as
  incremental follow-ups? **Still open** — P2.1 (2026-08-08) built the
  general between-sector beat mechanism but only authored the opening;
  `sectorBeats` in `src/content/beats.ts` is empty, so this question still
  needs an answer before Sector 8→9 (or any other) beat gets written.
- **New (2026-08-09, continued):** the "pulled into the mainframe" beat's
  script — content, panel count, and whether it stays Phase 1 (CSS on
  existing art) or needs something Phase 2-shaped. Blocks BUILD_ORDER.md
  P5.5 outright; see the update above.
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
  this ships, but "autocomplete" stays a future item. **Clarifying note
  (2026-08-09, continued):** this is plain CodeMirror-style
  keyword/schema autocomplete for the SQL editor — unrelated to item 3's
  "good AI" tutor character. It has no packet of its own yet; the visible
  placeholder tag is removed from the UI in BUILD_ORDER.md P5.2 (too much
  on-screen text), but the underlying future item and its markup/comment
  stay, so re-adding the visible note later (or replacing it once
  autocomplete actually ships) isn't a rediscovery.
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

### Status: 10 of 12 fixed (2026-08-10, PR #11) — 2 still broken, re-export needed
`recruit-analyst`, `-archivist`, `-auditor`, `-cartographer`, `-consultant`,
`-curator`, `-engineer`, `-registrar`, `-statistician`, and `-strategist`
were re-exported with real alpha transparency and merged. **`recruit-broker.png`
and `recruit-operator.png` are still defective** — see the correction
below for why they were wrongly marked "already fine" earlier tonight.
Tracked as BUILD_ORDER.md P4.5.

### Problem
The 10 sprites listed above were fully opaque (`alpha=255` everywhere)
with a checkerboard *pattern baked into the actual pixels* rather than a
real alpha channel — a visible gray/white checkerboard behind the
character, most noticeable on the avatar creator and sector-transition
screens. Every other delivered asset (ROGUE.exe sprites, sector
backgrounds, UI chrome) was checked the same way and confirmed to have
genuine transparency.

**Correction (2026-08-10, later the same night):** an earlier pass this
session claimed `recruit-broker.png` and `recruit-operator.png` "already
have genuine transparency" and excluded them from the re-export prompt —
that was wrong, caught while independently reviewing the PR that
delivered the other 10. `Image.getextrema()` alone is not a sufficient
check: both files return alpha extrema `(153, 255)` — not a flat `255`,
which looks like a pass — but a full per-pixel histogram shows only
**256 of 72,192 pixels (0.4%)** carry that `153` value; the other 99.6%
are flatly opaque at `255`, i.e. still the same baked-checkerboard defect
as the other 10, just with one small incidental non-opaque patch
somewhere in the file that happened to move the *extrema* without
reflecting the image as a whole. Compare a genuinely-fixed file, e.g.
`recruit-analyst.png`: 77% of its pixels are alpha `0`, the correct
shape for a real character-on-transparent-background cutout. `AGENTS.md`
is updated with the corrected check (proportion of transparent pixels,
not just whether the extrema differ from `255`).

### Fix
Not fixable in code — this is baked pixel content, not a CSS/rendering
bug, and per `AGENTS.md` this project doesn't generate replacement
character art directly. The re-export prompt (now covering just these 2
remaining files) and the corrected verification method are in
`docs/GAME_DESIGN_BRIEF.md` §B Step 1c.

### Open questions still to resolve before build
None — root cause confirmed for the remaining 2 files, fix prompt
drafted. Waiting on the product owner to run it and hand back the result.

---

## 8. Multi-save / new-game / profile state management

### Status: shipped (2026-08-10)
Built as BUILD_ORDER.md P6.2 and merged to `main` (PR #2). The design
below is a record of what shipped, not a plan still to build: the
`metric-quest-saves-v1` `SaveStore`, the one-time migration from the old
single-save key, `listSaveSlots`/`createNewSave`/`switchActiveSave`/
`deleteSave`/`renameSave` in `src/lib/progress.ts`, and the "Save slots"
entry point on Home. Nothing left to build here.

### Problem
Progress today is a single implicit save per browser (`localStorage`,
see `src/lib/progress.ts`) — there's no way to start a new game, keep
multiple save slots, or return to a previous game state once overwritten.
For a single-player classroom exercise this is fine; it's a real gap if
multiple students share a machine, or a player wants to replay from
scratch without losing their current run. It also matters more once
item 10 (public deployment) ships — friends playing on their own devices
already get separate saves for free (separate browsers), but anyone
sharing a device needs this.

### Design (2026-08-10)

**Data model.** A new top-level `localStorage` key,
`metric-quest-saves-v1`, holding a `SaveStore`:

```ts
type SaveSlot = {
  id: string;
  name: string;          // player-editable, defaults to the avatar's callsign
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp, bumped on every save
  progress: Progress;     // today's existing Progress type, unchanged
};

type SaveStore = {
  version: 2;
  activeSlotId: string | null;
  slots: SaveSlot[];
};
```

The existing `Progress` type (`completedMissionIds`, `points`, `badges`,
`avatar`, `seenSectors`, `seenOpening`) doesn't change shape at all — it
just moves from being the top-level saved object to being one slot's
payload. `MissionView`, `HomeView`, and everything else that reads/writes
`Progress` today needs **no changes** — they keep calling
`onProgressChange`/receiving `progress` exactly as now.

**Migration, one-time and non-destructive.** On load, if
`metric-quest-saves-v1` doesn't exist yet but the old
`metric-quest-progress-v1` key does, wrap the existing `Progress` into a
single slot (name defaults to the avatar's callsign, or "Recruit" if
none), mark it active, write the new key. The old key is left in place
afterward, untouched — negligible storage cost, and it means a migration
bug can't lose data since the pre-migration copy still exists. Migration
only runs when the new key is fully absent, so it can't double-run.

**API surface (`src/lib/progress.ts`).** `loadProgress()`/`saveProgress()`
keep working exactly as today (they become "act on the active slot"
under the hood — every existing call site is unaffected). New exports:
`listSaveSlots()`, `createNewSave(name?: string)`,
`switchActiveSave(slotId): Progress`, `deleteSave(slotId)`,
`renameSave(slotId, name)`. `App.tsx` needs one small addition: a
slot-switch handler that calls `setProgress(switchActiveSave(id))` —
plain state update, no remount trickery needed.

**UI.** Home gets one new small link (same visual weight as today's
"Edit avatar"/"Replay opening" row — not a new boxed control) that opens
a slot-picker overlay: same modal/overlay mechanics already established
by `GlossaryPanel` and P5.4's sector-map drawer (backdrop, trapped focus,
Escape closes, focus returns to the trigger) — no new interaction
paradigm. The overlay lists existing slots (name, last-played date,
points/completion summary) with a way to switch to one, a "New Game"
action, a rename action, and a delete action per slot.

**Why "New Game" needs no confirm step, but delete does:** creating a
slot is purely additive — it never touches another slot's data, so
there's nothing to accidentally overwrite. Only deleting a slot is
destructive and needs an explicit confirm, consistent with how the rest
of this project treats irreversible actions.

**Verified low-risk:** the whole design is additive over the existing
architecture — no existing component needs to know save slots exist at
all except `App.tsx`'s bootstrap and the new Home entry point.

### Non-goals
- No account system, no server-side sync — still 100% `localStorage`,
  still browser-only per `AGENTS.md`.
- No cap enforcement beyond a soft, easily-changed default (10 slots) —
  `Progress` objects are a few KB at most, storage quota isn't a real
  constraint here.

### Open questions still to resolve before build
None blocking — implementation-detail defaults were made above (slot
naming default, soft 10-slot cap, leaving the old key in place
indefinitely) and are cheap to change later if you want something
different. If you want to correct any of those defaults, do it whenever;
it doesn't need to happen before the packet starts.

---

## 10. Public deployment (Vercel)

### Status: prework shipped 2026-08-10 — going live is still blocked on you
All of BUILD_ORDER.md P6.1's prework merged to `main` (PR #3): the
`engines` pin, `vercel.json`, the README Deployment section, and the real
minimized 5-table derivative at `src/assets/data/iTunes.min.sqlite`
(verified against all 25 missions' expected results, not just spot-checked
— see the update below). **One specific finding below is still a hard
blocker on actually going live**, not a checklist item to route around —
see "Decision needed before deployment" further down. Nothing in this
item's prework is left to build; the remaining step is your decision, not
more agent work.

### Problem
The app runs locally (`npm run dev`/`npm run build`) but isn't deployed
anywhere the product owner can share a link to. Wanted: a public URL
(Vercel) friends can play without cloning the repo.

### Research findings (2026-08-10)
- **Deployment shape is simple.** No client-side router (`type View =
  'home' | 'avatar' | ...` is plain React state, not URL-based) — the
  whole app is one route. Vite's zero-config Vercel integration (build
  command `npm run build`, output directory `dist`) needs no rewrite
  rules, since there's nothing to route.
- **Bundle size is fine.** `dist/` is ~6.1MB total, comfortably inside
  any Vercel tier's static-asset limits.
- **Node version isn't pinned.** Local dev runs Node v26; Vercel's build
  image supports Node 20+, but v26 specifically isn't confirmed
  available. Recommend an explicit `"engines"` field in `package.json`
  pinning a known LTS (e.g. 22) rather than assuming the newest local
  version matches Vercel's build environment.
- **No environment variables are used today** — nothing to configure in
  Vercel's project settings on that front.
- **The hard blocker: `SQL Databases/iTunes.sqlite` ships as-is in every
  production build, unminimized.** `src/lib/sqlRunner.ts` loads the
  database via `new URL('../../SQL Databases/iTunes.sqlite',
  import.meta.url)` — Vite bundles that exact file into
  `dist/assets/iTunes-*.sqlite` (confirmed: the shipped file's size
  matches the source file's size on disk exactly). Deploying today means
  publishing the raw course-material database to the public internet,
  downloadable by anyone — precisely the scenario
  `docs/AI_WORKFLOW.md`'s course-data release gate exists for ("Do not
  publish a source database by default"). **This must be resolved before
  any public deployment**, per that existing rule — it is not new scope
  invented for this item, it's the same gate `AGENTS.md` already states.
- **Helpful context, not a substitute for approval:** the shipped data
  matches the well-known open "Chinook" sample database (recognizable
  from `Customer`'s canonical first rows) — a widely-used, freely-
  licensed public teaching dataset, not proprietary business data. That's
  useful context for making the call, but the project's own rule still
  requires an explicit decision, not an agent's assumption that
  "it's probably fine."
- **A minimized derivative is ready to evaluate, not yet applied.**
  Checked which tables the game's 25 missions actually touch
  (`visibleTables` across `src/lib/missions.ts`, cross-checked against
  every `solutionSql`): only `Customer`, `Genre`, `Invoice`,
  `InvoiceLine`, and `Track` — 5 of the database's 11 tables. Built and
  tested a derivative keeping only those 5: **356KB vs. 1,092KB (a 67%
  reduction)**, spot-verified to return byte-identical results for an
  existing mission's reference query. This is a concrete, low-effort
  "minimized derivative" option per the release gate, ready to apply
  the moment it's approved — not applied yet, since switching the data
  source is itself the gated decision, not a prework step.

### Update (2026-08-10) — derivative built for real and fully verified (BUILD_ORDER.md P6.1)
The estimate above was a scratch proof-of-concept; this is the real
artifact. Built at `src/assets/data/iTunes.min.sqlite` by copying only
the `Customer`, `Genre`, `Invoice`, `InvoiceLine`, and `Track` tables
(schema + data, `VACUUM`ed) out of `SQL Databases/iTunes.sqlite` — that
source file was only read, never modified. Row counts match the source
exactly for every one of the 5 tables (Customer 59, Genre 25, Track
3503, Invoice 412, InvoiceLine 2240). Actual size: **528KB vs. 1,067KB
(1,092,608 bytes) — a 51% reduction** (the earlier 356KB/67% figure was
an unverified estimate; this measured number supersedes it, same
"verify before trusting" rule as everywhere else in this project).
**Verified against all 25 missions, not a spot check:** every mission's
`solutionSql` was executed against both the source database and this
derivative and both matched `mission.expected` exactly, columns and
rows, including the two `allowsTempWorkspace` missions. Foreign keys to
the 6 excluded tables (`Album`, `Artist`, `Employee`, `MediaType`,
`Playlist`, `PlaylistTrack`) were dropped from the derivative's schema
(the referencing columns like `Track.AlbumId` and
`Customer.SupportRepId` are kept, just without a `FOREIGN KEY`
constraint to a table that no longer exists) — no mission's
`solutionSql` references any of those 6 tables, so this has no effect
on grading. **Still not wired into `src/lib/sqlRunner.ts`** — that
switch remains the gated decision above, not a prework step.

### Decision made (2026-08-10)
Per `docs/AI_WORKFLOW.md`'s course-data release gate — **approved: switch
to the minimized 5-table derivative**, not the full file. Recorded here
per the release gate's own requirement:

- **Decision:** ship `src/assets/data/iTunes.min.sqlite` (`Customer`,
  `Genre`, `Invoice`, `InvoiceLine`, `Track` only) as the production data
  source, not the full `SQL Databases/iTunes.sqlite`.
- **Provenance:** the well-known open "Chinook" sample database (see the
  research findings above) — not proprietary Aurora Music/course business
  data, and already the same file the app has run against locally since
  before this decision.
- **Minimization method:** kept only the tables the game's 25 missions'
  `visibleTables`/`solutionSql` actually touch; dropped `Album`, `Artist`,
  `Employee`, `MediaType`, `Playlist`, `PlaylistTrack` (6 of 11 tables) and
  the foreign keys pointing at them. Built via `sqlite3` (schema recreate
  + `ATTACH`/`INSERT INTO ... SELECT`), `VACUUM`ed. Verified against all
  25 missions' expected results (not a sample) before this decision was
  acted on — see the P6.1 update above. No other database file in
  `SQL Databases/` is or was ever tracked in this repository (confirmed —
  `git ls-files 'SQL Databases/'` shows only `iTunes.sqlite`), so there was
  nothing else to drop.
- **Wired in 2026-08-10:** `src/lib/sqlRunner.ts`'s `databaseUrl` now
  points at `src/assets/data/iTunes.min.sqlite` instead of
  `SQL Databases/iTunes.sqlite`. Verified in-browser post-wiring: the
  production build now bundles the 540.67kB derivative instead of the
  1,092.60kB full file, and a representative 3-table-join mission
  (`m3-3`, `InvoiceLine`⋈`Track`⋈`Genre`) graded correctly end to end
  against it.
- **Still not done:** actually deploying anywhere. This decision unblocks
  that (the data-release gate is now clear), but deploying itself is a
  separate step nobody has asked for yet.

### Rough scope (prework only — safe to build now, does not deploy anything)
- `"engines"` field in `package.json` pinning a known Vercel-supported
  Node LTS.
- A `vercel.json` (or documented zero-config settings) pinning build
  command/output directory explicitly rather than relying on
  auto-detection silently continuing to guess right.
- A "Deployment" section in `README.md` that documents the process *and*
  states the data-release-gate requirement inline, so a future deploy
  can't happen by accident without seeing the warning.
- The minimized-derivative SQLite file, built for real (not just the
  scratch proof-of-concept above) and kept ready alongside the existing
  loader — wired in only once the decision above is made, per
  `AGENTS.md`'s "use an approved copy or minimized derivative" rule.

### Non-goals
- Not actually deploying or sharing a live URL — that's the part gated
  on the decision above.
- Not adding accounts, a backend, or telemetry — deployment target
  doesn't change the browser-only architecture.

### Open questions still to resolve before going live
- **The data decision above.** Hard blocker.
- Custom domain, or the default `*.vercel.app` URL? Cosmetic, not
  blocking prework.

---

## 9. Mission screen information density & hierarchy pass

### Status
New item, opened 2026-08-09 (continued) from a second UAT round on the
merged build (P4.1-P4.4 all live). Unblocked — no new art, no new
dependency, pure layout/CSS and small component reshuffles, same
character as item 5. Scheduled as BUILD_ORDER.md P5.2-P5.4.

### Problem
P4.1 thinned the header and moved controls around, but the mission
screen as a whole still reads as an undifferentiated wall of text and
boxes of similar visual weight — the brief, the schema panel, the
terminal-reward panel, the runner disclaimer, and the action buttons all
compete for attention roughly equally. Nothing draws the eye to the two
things that actually matter moment-to-moment: the mission's business
context and the SQL editor itself. Feedback verbatim: "there's just too
much text — it's hard to see what's actually important... eye should be
drawn to the box where the context is & where the SQL editor is."

### Goals
- **Trim copy that doesn't earn its place** (BUILD_ORDER.md P5.2):
  - Remove the runner-note paragraph under the SQL editor ("Runs locally
    in your browser against the real dataset behind this terminal —
    nothing leaves your machine. This runner allows one read-only SELECT
    query.") — players don't need or want this explained every mission.
  - Remove "Points are awarded once; hints never lock progress." from
    the Terminal reward panel.
  - Remove the "Placeholder — autocomplete is coming in a later release"
    tag from the visible UI (keep the underlying future item — see item
    6's clarifying note above — the tag is just visual noise today).
- **Restructure the SQL editor's action row** (BUILD_ORDER.md P5.3):
  - Run query / Show hint / Concept glossary become smaller, lighter-
    weight controls (they're already positioned next to the editor since
    P4.1 — this is a size/weight pass, not a relocation).
  - Remove the always-visible "Reveal example query" control. Per the
    product owner's read (confirmed correct): `mission.solutionSql` is
    the actual reference answer, not a lighter "example," so showing it
    on demand undercuts the exercise. Replace it with a 4th control,
    **"See answer,"** that only becomes available after 3 consecutive
    wrong attempts on the current mission (a `wrongAttemptCount` state
    already exists in `MissionView` and already gates the mistake-aware
    diagnostic at 2 — reuse the same counter, new threshold).
- **Consolidate the header** (BUILD_ORDER.md P5.4, the largest piece):
  - The sector map (`ChapterMap`) starts collapsed and lives behind a
    control in the top header box rather than as a permanent sidebar —
    clicking it slides the map out. `ChapterMap` already has an
    open/closed toggle for narrow viewports (`isOpen`/`isCompact` in
    `src/components/ChapterMap.tsx`) that this can generalize rather
    than building a second mechanism from scratch.
  - Terminal reward moves into the header, to the right of the existing
    points/integrity readout — both expand to use the header's freed-up
    width instead of sitting in a mostly-empty box.
  - The "Badges" footer strip is removed; earned badges become a
    togglable disclosure inside the header's progress area instead of a
    permanently-visible footer.

### Non-goals
- Not a redesign of the terminal visual system (§A6) — same palette,
  same panel-frame/border language, just resized, relocated, and made
  collapsible.
- Not touching the SQL loop, grading, or mission content. The "See
  answer" gate changes *when a control is available*, never what
  counts as correct.
- Not a full tutorial system — the product owner flagged a tutorial as a
  possible longer-run answer to the same "too much text" problem, but
  that's a materially bigger feature and out of scope here. If wanted
  later, scope it as its own backlog item rather than folding it into
  this density pass.

### Rough scope
See the three BUILD_ORDER.md packets (P5.2-P5.4) referenced under each
goal above — split so the cheap, low-risk copy trims can land and be
reviewed independently from the larger header-layout change.

### Open questions still to resolve before build
- **Sector-map slide-out interaction:** the product owner described
  "put it into the top box and if someone clicks it then it slides out"
  — read here as an overlay/drawer triggered from a header control
  (similar pattern to the existing `GlossaryPanel` overlay), rather than
  an inline-expanding accordion that would push mission content around.
  This is a judgment call, not a confirmed decision — flagged for the
  product owner to correct before or during P5.4 if the intended
  interaction is different (e.g. an inline expand instead of an
  overlay).
- Exact visual treatment of the consolidated header (how the map
  trigger, points/integrity readout, terminal reward, and badges toggle
  share the header's width without becoming cramped again) is an
  implementation call for whoever builds P5.4, in the same spirit as
  item 5's deferred exact padding numbers — direction is clear, pixel
  values aren't.

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
| ROGUE.exe illustrations (calm + corrupted) | Item 4 (opening/Sector 8 cutscene beats) | **Wired in (2026-08-08).** Both states live as a reusable `<RogueSprite state="calm" \| "corrupted" />` component (`src/components/RogueSprite.tsx`); `MissionView`'s m8-1 aside now renders `corrupted` in place of the CSS glitch-icon placeholder, which has been deleted. **Correction (2026-08-10):** this row previously said `calm` was "available for the P2.1 opening cutscene" — P2.1 has since shipped and its `openingBeat` panel in `src/content/beats.ts` uses `rogueState: 'corrupted'`, not `calm`. `calm` remains genuinely unused today; no shipped screen currently renders it. | `src/assets/rogue/rogue-{calm,corrupted}.png` (192×192, resized/compressed from the Claude Design export at `~/Downloads/rogue_sprites/`) |
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
- Items 1, 2, 4, 8, and 9 fit the current architecture with no approval
  needed — they can be scoped into normal sector/session work whenever
  prioritized. Item 4's new "pulled into the mainframe" beat is the one
  exception inside an otherwise-unblocked item: it's waiting on the
  product owner's script, not an approval decision.
- Item 3 needs an explicit approval decision before any implementation
  work starts, per `AGENTS.md`. Treat it as a standing research item
  until that decision is made.
- Item 10 (deployment) is split: the prework (config, docs, preparing a
  minimized data derivative) needs no approval and fits the current
  architecture; actually going live needs an explicit data-release
  decision first, per `docs/AI_WORKFLOW.md`'s course-data gate — the same
  standing rule item 3 references, not a new one invented for this item.
- Follow the existing git workflow (`docs/AI_WORKFLOW.md`): one branch
  per bounded change, summarize changed files/checks/risks, and get
  merge approval before touching `main`.
