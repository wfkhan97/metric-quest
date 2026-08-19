# Metric Quest — Feature Backlog

Status: items 1-4 are the original four ideas (mostly built now — see each
section's status line and `docs/BUILD_ORDER.md`); items 5-8 were opened
2026-08-09 from the first real UAT playtest of the merged build; item 3
still needs explicit product-owner approval per `AGENTS.md` before any
implementation starts. P4.x and P5.x (items 5, 6, 9, and the P5.1 part of
item 4) have all since landed on `main`, as has the P5.5 mainframe-pull
cutscene (the rest of item 4, merged 2026-08-10). Item 2 was found fully
shipped 2026-08-10 (an earlier status note here was stale — corrected).
Item 8 (multi-save) was un-deferred and designed 2026-08-10 and item 10
(public deployment) was opened the same day from real research — both
shipped as BUILD_ORDER.md P6.x, though item 10's actual deploy decision
is still open. **2026-08-11:** a live playtest session produced a second
header-refinement pass on item 9 (P5.6/P7.4), a presentation-only revision
to the P5.5 cutscene plus a real bug fix in it (both noted in item 4's
update), and a wholly new item 11 (title screen) — all merged same-day.
**Later 2026-08-11,** ahead of the first real deploy, a full-repo quality
audit opened item 12 (a scoped, fully-buildable pre-launch hardening
checklist) and item 13 (an unscoped UX/game-flow roadmap split between
near-term polish for the current class and longer-run ideas for a future
net-new-SQL-learner audience, the latter gated like item 3). **Same day,
a doc-accuracy pass on items 1-11** closed out every stale or
never-updated status line and open question: item 1's glossary copy-voice
question was resolved (playful-retro but didactic — `src/content/glossary.ts`
rewritten to match) and the item marked shipped; item 4's Sector 8→9 beat
was authored (`sectorBeats[9]`) and its open question resolved; item 9's
sector-map-interaction question was closed (it was settled by live
playtest weeks ago, just never marked); items 5 and 6 were marked shipped
(they'd merged but were never closed out); and item 10's status/open-
questions text, which had gone stale and still described the data-release
decision as an unresolved hard blocker after it was actually made, was
corrected — nothing is outstanding there except your own go/no-go on
actually deploying. Item 3 is paused, being handled separately. **Same
day, once more:** item 14 (an optional first-run tutorial orienting new
players to the screen/mechanics, not a SQL primer — that stays item 13's
Part B1) was opened, scoped narrower than B1 on purpose, and routed
through a scoping pass (a dedicated Codex session producing a plan and
any needed Claude Design prompts) before implementation starts.
Read `docs/GAME_DESIGN_BRIEF.md` and
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

### Status: fully shipped
P1.1 (data model/shell) and P1.3 (concept-tag deep-linking) landed
2026-08-08; P1.2 (animated diagrams) followed. The one open question left
after that (copy voice) was resolved and applied 2026-08-11 — see below.
Nothing left to build here.

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
- ~~Copy voice: should glossary entries go through the same design-brief
  tone pass as mission copy (in-world, playful-retro), or is a more
  neutral "documentation" voice acceptable given this is reference
  material rather than story content?~~ — **Resolved 2026-08-11:**
  playful-retro, matching mission copy, but didactic first — a light
  in-world hook per entry, never at the expense of a precise, correct
  explanation. `src/content/glossary.ts` previously committed to the
  opposite call (a comment there explicitly chose neutral "documentation"
  tone over in-world voice) — that comment and all 16 entries' `summary`/
  `explanation` text were rewritten to match this decision. (Sourcing
  itself was already resolved above — public sites for research/accuracy,
  rewritten in-house either way.)

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
- **Superseded by product-owner approval on 2026-08-18:** anonymous, aggregate
  analytics may record only a pre-defined mistake-signature ID after a wrong
  executed attempt. It must never include SQL text, query results, callsigns,
  save data, or a durable player identifier; `grading.ts` remains the sole
  correctness authority.

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

### Status: built and merged to `main`, but gated off for the current release (corrected 2026-08-12)
Approved and built this session (see "Decision made" below). **Correction:**
this line previously said "built, then paused... on branch
`claude/monet-oauth-relay`, not merged" — that went stale. Verified
directly: `claude/monet-oauth-relay` is an ancestor of `main`, and
`api/chat.ts`, `api/oauth/*`, `api/_lib/monet.ts`, and
`src/components/AiTutorPanel.tsx` all exist on `main` today, wired into
`MissionView.tsx`. What's actually true: it's fully built and merged,
but explicitly feature-flagged off for tonight's production release
(`AI_TUTOR_ENABLED = false` in `MissionView.tsx`, plus `.vercelignore`
excluding `api/` from the deploy entirely) because
`MONET_CLIENT_ID`/`MONET_CLIENT_SECRET` aren't configured yet — see the
"Gate the AI tutor off for tonight's release" commit. **Treat this as
built-but-dormant, not active work:** flipping `AI_TUTOR_ENABLED` back
on and un-ignoring `api/` needs those secrets configured and the smoke
test re-run first — do not do either without a fresh explicit go-ahead.

This was the one idea that structurally conflicted with `AGENTS.md`'s "no
accounts, servers, external AI calls... without explicit approval" rule.
Product owner explicitly approved the exception this session, scoped as an
**OAuth relay only**: a small Vercel serverless layer (`api/oauth/*`,
`api/chat.ts`) holds the Monet `client_secret` and proxies chat calls;
save/progress state stays exactly as it was (localStorage, no accounts).
See "Decision made (2026-08-11)" below for the two open questions this
section originally left unresolved.

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

### Privacy scope — superseded 2026-08-11, see "Decision made" below
This section originally scoped the tutor so it would **never receive the
underlying dataset, schema contents, or query results** — only the
mission's business question and the player's own SQL/error category. The
product owner explicitly reversed that on 2026-08-11: the tutor now does
receive the visible schema and the player's actual last query result, so
it can fully help rather than reason blind. Left here, struck through in
spirit rather than deleted, so the reasoning that motivated the original
limit (the course-data release gate) is still visible next to the
decision that superseded it — see "Decision made" below for why this was
judged acceptable.

### Non-goals (for now)
- Not a general-purpose chatbot — scoped tightly to the current mission's
  SQL problem.
- Not a replacement for item 2's local diagnostic — item 2 stays
  available with zero setup; this is an optional upgrade for players who
  connect an account.
- No in-game billing or payment handling by Metric Quest itself — if
  BYOK/subscription costs apply, they're between the player and their AI
  provider/Monet, never routed through the game.

### Decision made (2026-08-11)
Per product direction, all of the open questions below are resolved:

- **Approval:** granted. The external-AI-call/server exception is
  approved for this feature specifically, scoped as an OAuth relay only
  (see the Status line above) — not a blanket exception for other
  features.
- **Server-side code is required.** Monet's `client_secret` must be
  exchanged server-side (their own dashboard says so: "Store it
  server-side"), so this does cross the "browser-only" rule, not just
  "no external AI calls." Implemented as Vercel serverless functions
  (`api/oauth/*`, `api/chat.ts`) alongside the existing static build —
  the rest of the app (grading, progress, everything else) stays
  browser-only and unchanged.
- **Hints first, full answer if asked.** Enforced server-side in
  `api/chat.ts` via a system prompt built from the mission context
  (`api/_lib/monet.ts`'s `buildTutorSystemPrompt`), not left to the
  client, so it can't be bypassed by editing page JS.
- **Schema and query results are now in scope** (reverses the privacy
  limit above) — the tutor receives the mission's visible schema, the
  player's current SQL, and their last query's actual result (capped at
  25 rows to bound prompt size), plus the local mistake-diagnostic label
  if one fired. See `diagnostics.ts`'s updated comment — its "never sent
  anywhere" invariant now has one deliberate, scoped exception.
- **Session persistence:** reconnect-per-session, not persisted long-term
  — the connection lives in an httpOnly cookie for 8 hours, separate from
  and unrelated to `progress.ts`'s localStorage saves.
- **Cost/support exposure:** the player pays, via their own connected
  subscription's usage — confirmed via Monet's own model (`Connect
  ChatGPT Plus/Team` or `Claude Pro/Team`), consistent with the Non-goals
  above. One nuance worth flagging: Monet's flow connects the player's
  actual consumer ChatGPT/Claude account, not a bare API key, so each
  player's own account-level data-training terms apply — that's between
  them and their provider, not something Metric Quest controls.
- **Explicit consent/disclosure screen:** built. The tutor panel states
  before connecting that it shares the current mission's schema and
  query results, that usage counts against the player's own plan, and
  that access can be revoked any time.

### Where it actually lives
The connect/chat UI is scoped to `MissionView`, not `HomeView` — it needs
live mission context (schema, current SQL, last result) to be useful at
all, which only exists inside an active mission.

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
- **New "pulled into the mainframe" cutscene — built 2026-08-10, merged
  2026-08-10 (PR #13):** the
  product owner wrote the full script directly (an Office-Space-toned
  beat: a CEO memo announcing an unsupervised AI rollout, escalating
  office chaos, a pull into the mainframe, a corridor of 9 sector doors,
  and a chase into Sector 1). Built as **Phase 2** (`CutsceneView` now
  supports multi-panel playback, not just `panels[0]`) once the 5
  commissioned images landed. Full storyboard, memo text, and build notes
  are in `docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`; implementation detail in
  BUILD_ORDER.md P5.5.
- **Update (2026-08-11):** a real cascade bug in the memo panel's scroll
  (never actually activated — `.phase-scanline`'s `overflow: hidden`
  silently won over an earlier `overflow-y: auto` at equal specificity)
  was found and fixed (PR #14). Separately, two rounds of live playtest
  feedback simplified the beat's presentation (PR #15): the avatar sprite
  no longer shows on Panels 1-6 (office scenes before the pull; Panels 8+
  unchanged), the panel counter/mute toggle/"press Continue" hint text are
  gone from `CutsceneView` generally, the CC-BY credit line fits one line,
  and Panel 8's motion is a spin-and-shrink "pulled" effect instead of a
  plain fade. See `docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`'s "Post-ship
  revisions" section for the full record. None of this changed the
  script, sequencing, or art.

### Open questions still to resolve before build
- ~~Does every sector transition get an authored beat, or only some (e.g.
  just the Sector 8→9 case plus the opening) for v1, with the rest as
  incremental follow-ups?~~ — **Resolved 2026-08-11:** product owner
  delegated the choice of which beat to author to the agent ("I trust you
  to pick a beat"). Sector 8→9 was authored — `sectorBeats[9]` in
  `src/content/beats.ts` — as the highest-value single beat: it fulfils
  §A5's "completing Sector 8 can trigger a short in-world beat introducing
  the Sector 9 final-boss framing" and §A3's reserved ROGUE.exe voice slot
  for "one line for the Sector 9 final-boss opening," using only
  already-shipped assets (the Sector 8 background, `RogueSprite`'s
  corrupted state — no new art). It plays as a short two-panel prelude
  immediately before the existing (unchanged) Sector 9
  `SectorTransitionView`, not a replacement for it. The rest of
  `sectorBeats` stays empty by design — incremental authoring, not a
  requirement that every sector get one.
- ~~The "pulled into the mainframe" beat's script~~ — **Resolved
  2026-08-10:** product owner delivered the full script; see
  `docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md` and the update above.
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

### Status: fully shipped
Opened from the first real UAT playtest of the merged build (2026-08-09).
Shipped as BUILD_ORDER.md P4.1 and merged to `main`; superseded/extended
by item 9's P5.4 and P5.6/P7.4 passes (also shipped). Nothing left to
build here — this doc corrected 2026-08-11 to reflect that (was never
marked closed at the time).

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

### Status: fully shipped
Approved 2026-08-09, shipped as BUILD_ORDER.md P4.2 and merged to `main`
— CodeMirror 6 (`@codemirror/*`) is in `package.json` and wired in
`src/components/SqlEditor.tsx` (lazy-loaded, per `MissionView.tsx`'s
comment, since it's the largest dependency in the bundle). Nothing left
to build here — this doc corrected 2026-08-11 to reflect that (was never
marked closed at the time).

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

### Status: fully fixed (2026-08-10) — all 12 sprites verified
All 12 avatar sprites now have genuine alpha transparency. The first 10
(`recruit-analyst`, `-archivist`, `-auditor`, `-cartographer`,
`-consultant`, `-curator`, `-engineer`, `-registrar`, `-statistician`,
`-strategist`) were re-exported and merged via PR #11; the remaining two
(`recruit-broker.png`, `recruit-operator.png` — see the correction below
for why they were wrongly marked "already fine" earlier) were fixed in
the `codex/office-mainframe-backdrops` branch and merged directly to
`main`. Re-verified directly against `main`: both now show 77.2% and
87.4% transparent pixels respectively, in the same range as the other 10
genuinely-fixed files. Nothing left to build here.

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

### Status: live in production (deployed 2026-08-12) — nothing left to build
**Correction (2026-08-12):** this line previously said "fully resolved —
nothing left to build; going live is entirely your call, whenever," as if
deployment were still a future decision. The product owner has since gone
live: Vercel is connected to this GitHub repo (auto-deploys `main` to
Production, feature branches to Preview), and the public URL is
**https://metric-quest.vercel.app**. A live-site check the same day
confirmed: root page loads with no console errors; `/api/chat` and
`/api/oauth` (the gated-off tutor routes) both 404, not deployed; only the
minimized `src/assets/data/iTunes.min.sqlite` derivative is served
(`SQL Databases/iTunes.sqlite` 404s, as intended); and the full SQL loop
(write a query, run it, get graded, unlock a badge) works end-to-end
against the live deployment. This covered the availability, first-run,
SQL-loop, data-gate, and tutor-exclusion rows of
`docs/RELEASE_2026-08-11.md`'s smoke-test table — the accessibility
keyboard sweep, narrow-viewport check, and multi-browser/device coverage
rows were not separately re-run at deploy time.

All of BUILD_ORDER.md P6.1's prework merged to `main` (PR #3): the
`engines` pin, `vercel.json`, the README Deployment section, and the real
minimized 5-table derivative at `src/assets/data/iTunes.min.sqlite`
(verified against all 25 missions' expected results, not just spot-checked
— see the update below). **Correction (2026-08-11):** this line and the
"Open questions" section below it previously still described the
data-release decision as an open hard blocker — that was stale the moment
it was written; the "Decision made" section further down in this same
item records that the decision was actually made and wired into
`sqlRunner.ts` the same day (2026-08-10). There is no outstanding
technical or data-release question left on this item. The only things
left are yours: whether/when to actually deploy, and, if so, custom
domain vs. the default `*.vercel.app` URL (cosmetic).

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
- ~~**The data decision above.** Hard blocker.~~ — **Resolved 2026-08-10**
  — see "Decision made" above. This bullet, and the "Status" line at the
  top of this item, were both left stale after the fact (still describing
  it as an open hard blocker); two independent sessions caught and fixed
  this the same day (2026-08-11) — not a real remaining blocker either
  way.
- Custom domain, or the default `*.vercel.app` URL? Cosmetic, not
  blocking prework — genuinely the only open item here, and it's yours
  to decide whenever you deploy.

---

## 9. Mission screen information density & hierarchy pass

### Status: fully shipped
Opened 2026-08-09 (continued) from a second UAT round on the merged build
(P4.1-P4.4 all live); no new art, no new dependency, pure layout/CSS and
small component reshuffles, same character as item 5. P5.2-P5.4 landed
2026-08-09/10, and the second header-refinement pass (P5.6/P7.4) landed
2026-08-11 — both open questions below were settled the same day via live
playtest. Nothing left to build here.

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

### Update (2026-08-11) — second header pass, from a live playtest session
P5.4's collapsible sector map and header consolidation shipped, but a
follow-up live playtest (product owner driving the browser directly, not a
written note) found more to tighten, landed as BUILD_ORDER.md P5.6/P7.4:
- The header's "Sector map" text link (went straight to Home) and the
  "Browse sectors" drawer trigger read as two overlapping ways to do
  similar things. Consolidated into one "Browse sectors" control in the
  header title position; the drawer itself now offers both "Close" (stay
  on this mission) and "Back to main screen" (go to Home) instead of
  needing a separate top-level control for the latter.
- The header's eyebrow/title showed generic app branding ("Aurora Music
  mainframe · active terminal" / "Metric Quest") that duplicated nothing
  useful — replaced with the mission's own chapter/concept/title (e.g.
  "1 · The Ledger Vaults · Filter, sort, and limit" / "Priority
  invoices"), which let the now-redundant eyebrow/heading in the workspace
  below be removed entirely, moving the mission brief to the top of the
  box.
- Schema explorer and SQL editor boxes are bigger, with tighter box
  padding throughout to make room, and the "Write a read-only SQL query"
  label is visually hidden (kept for screen readers) rather than taking a
  visible row.
- The scoreboard (integrity bar + points) is a single narrow row instead
  of a tall stack, with both in the same font instead of the points using
  a heavier pixel font; the badges disclosure moved out of the scoreboard
  into the Terminal Reward box next to it.

### Open questions still to resolve before build
- ~~**Sector-map slide-out interaction:** the product owner described "put
  it into the top box and if someone clicks it then it slides out" — read
  here as an overlay/drawer triggered from a header control, rather than
  an inline-expanding accordion.~~ — **Resolved 2026-08-11:** the
  overlay/drawer reading was correct. Confirmed via live playtest with the
  product owner driving the browser directly (not just an agent's
  interpretation) — see `BUILD_ORDER.md` Wave 7's P5.6 notes ("shipped —
  verified live in the Browser pane across the flow"). This line was
  never updated to reflect that at the time; corrected now.
- ~~Exact visual treatment of the consolidated header...~~ — **Resolved**:
  shipped and live-verified as part of P5.4 and the P5.6/P7.4 refinement
  pass (scoreboard as a single row, badges moved into Terminal Reward,
  etc. — see the update above). Implementation-call items like this don't
  need a separate close-out; recorded here only for consistency with the
  rest of this item now being marked closed.

---

## 11. Title screen (Resume / New game gate)

### Status: shipped 2026-08-11 (PR #15)
New item, opened and built in the same live playtest session that produced
item 9's second-round update above. Tracked as BUILD_ORDER.md P7.1-P7.3.
Nothing left to build here.

### Problem
The app landed straight on Home on every page load, with no way to
deliberately start over — "New game" only existed inside the Save Slots
overlay, and it's *additive* (creates another slot) rather than the
overwrite-with-warning behavior a title screen's "New game" implies.
There was also no gate distinguishing "I have progress, let me back in"
from "I'm starting fresh."

### What shipped
- A new screen gates the app on first load: "Resume game" (shown only if
  the active save has real progress — an avatar set, the opening seen, a
  mission completed, or points earned) and "New game."
- "New game" resets the active save **in place** (not a new slot) and,
  if there's existing progress to lose, requires an inline confirm
  ("Starting a new game will overwrite your current progress. This can't
  be undone.") before doing it — kept deliberately distinct from Save
  Slots' own additive "+ New game."
- "New game" then proceeds into avatar creation and the intro cutscene,
  not Home — Home's Incident Brief doesn't make sense to a player who
  hasn't seen the cutscene that explains what happened yet. "Resume game"
  goes straight to Home, one click, unchanged for a returning player.
- Reuses existing assets only, per `AGENTS.md`: the corridor-of-doors
  background and panel/button chrome already used by the mainframe-pull
  cutscene, and `cue-c-mainframe-overture` (already sourced, CC0, no
  attribution needed) looping as the menu theme with a mute toggle.

### Non-goals
- Not a new save-management UI — Save Slots (item 8) still owns
  multi-slot switching/rename/delete; this is just the first-load gate on
  top of whichever slot is active.
- No new art commissioned — if a more bespoke title-screen treatment is
  wanted later, that's a future Claude Design request, not part of this
  item.

### Open questions still to resolve before build
None — shipped without any open product questions.

---

## 12. Pre-launch code quality & hardening pass

### Status
New item, opened 2026-08-11 ahead of tonight's first real deploy, from a
full-repo audit (not a playtest — a direct read of every `src/` file,
`docs/BACKLOG.md`/`BUILD_ORDER.md`, `npm run check`'s live output, and a
manual live check of the title screen in the Browser pane). Everything
below is a verified, specific finding against the actual code as of this
commit, not a generic "add more tests" wishlist. Unblocked — no design
asset, no product decision, and no change to the SQL loop or grading
contract is required for any item here.

### Problem
The codebase has been built across ~20 rapid sessions and is in genuinely
good shape — `npm run check` (lint, 169 tests, typecheck, build) passes
clean right now, there is no `dangerouslySetInnerHTML`/`innerHTML`/`eval`
anywhere in `src/`, no secrets or env vars in the repo, no `TODO`/`FIXME`/
stray `console.log` left behind, and the git-workflow/handoff discipline
in `docs/AI_WORKFLOW.md` has clearly been followed throughout. Tonight is
the first time this ships to a real audience, though, which is exactly the
moment to close the gaps that don't show up in day-to-day feature work:
missing test coverage on the highest-risk components, no failure-mode
handling for a couple of realistic classroom conditions, and a small
amount of copy-pasted logic worth deduplicating while it's still fresh.

### Findings (each independently actionable)

1. **Zero component-level test coverage.** All 169 existing tests live in
   `src/lib/*.test.ts` (`grading`, `sqlRunner`, `missions`, `progress`,
   `diagnostics`, `avatarOptions`) — there is not one `.test.tsx` file
   anywhere in `src/components/`. `MissionView.tsx` (441 lines — the
   grading flow, the hint/diagnostic/"see answer" attempt-count gating,
   the sector-map drawer's focus trap) and `App.tsx` (258 lines — the
   entire onboarding/routing state machine: title → avatar → cutscene →
   home → mission, new-game-vs-resume, save-slot switching) are the two
   most stateful, highest-blast-radius files in the app and have no
   automated coverage at all. `SaveSlotPanel.tsx` has the one genuinely
   destructive user-facing action in the whole app (delete a save) and is
   also untested.
2. **No top-level error boundary.** `App.tsx` has no `ErrorBoundary`
   anywhere in its tree. An uncaught render exception in any component —
   a malformed mission entry, a null-ref in a cutscene panel, anything —
   currently blanks the entire app to a stock white screen with no
   terminal chrome, no "reload" affordance, nothing in-world. For a
   synchronous classroom session that is a materially worse failure mode
   than a scoped fallback panel styled to the existing visual system
   (§A6's palette) with a "Signal lost — reload to reconnect" message.
3. **`pnpm audit` — run 2026-08-12: clean, no known vulnerabilities.**
   The project uses pnpm (`pnpm-lock.yaml`, and the README's deployment
   section already tells Vercel to auto-detect it), but every script and
   doc reference is `npm run ...`, and `npm audit` fails outright against
   a pnpm lockfile (confirmed live: `ENOLOCK`/"requires an existing
   shrinkwrap file"). This finding originally flagged that no
   dependency-vulnerability check had ever actually succeeded and been
   recorded anywhere in this repo's history — `pnpm audit --prod` was run
   on 2026-08-12, against the same `pnpm-lock.yaml` shipped in that day's
   production deploy, and reported "No known vulnerabilities found" for
   the full dependency tree, including `sql.js` (WASM), CodeMirror,
   React, and Vite. Re-run and re-record after any dependency bump, same
   as any audit.
4. **`localStorage` write failures are unhandled.** `src/lib/progress.ts`
   already defends the read path (`JSON.parse` inside `try`/`catch`,
   falling back safely on corrupt data — confirmed at lines 126-144), but
   every `localStorage.setItem` call is unguarded. A write can throw for
   real, ordinary reasons — quota exceeded, or a locked-down/shared
   classroom machine with storage disabled in a school browser profile —
   and today that throw is uncaught, so a player's completed mission or
   new save could silently fail to persist with zero signal that anything
   went wrong. Worth an explicit decision on behavior (retry, surface a
   "your progress isn't saving" banner, or at minimum fail loudly in dev)
   rather than leaving it as an unhandled exception path.
5. **The overlay focus-trap implementation is duplicated three times,
   verbatim.** `GlossaryPanel.tsx`, `SaveSlotPanel.tsx`, and
   `MissionView.tsx`'s sector-map drawer each independently define the
   exact same `FOCUSABLE_SELECTOR` constant (`'a[href], button:not(...),
   textarea, input, select, summary, [tabindex]...'`) and near-identical
   Tab/Escape keydown handling (confirmed by direct comparison of all
   three files). This is exactly the kind of "reduce code, make it more
   human" cleanup being asked for: extract one `useFocusTrap` hook (e.g.
   `src/lib/useFocusTrap.ts`) that all three call sites share. Pure
   refactor, zero intended behavior change — re-verify keyboard operability
   at all three sites after extracting, since this is the project's most
   accessibility-sensitive shared logic.
6. **Bundle is 22MB, ~15MB of it audio across 12 files** (`sector-1.m4a`
   through `sector-9`, plus 3 cutscene/title cues — sizes range 600KB to
   3MB each, confirmed via `du`). This is not confirmed to be an actual
   problem — Vite asset imports are URL references, not inlined bytes,
   and `<audio>` doesn't force-fetch a full file on mount by default —
   but two things are worth verifying rather than assuming fine before a
   room of students opens the same link at once: (a) the title screen's
   menu theme (1.1MB, `cue-c-mainframe-overture`) and the opening
   cutscene's two cues (2.9MB/3MB) load at or near first paint on every
   fresh session — confirm this doesn't stall time-to-interactive on
   typical school wifi, not just fast home broadband; (b) whether
   re-encoding the sector loop tracks at a lower bitrate (they're short
   chiptune loops, not full mixes) meaningfully shrinks total payload
   without audible quality loss.
7. **Mission music mute doesn't persist across screens** — noted here
   because it's as much a code-quality/state-management gap as a UX one
   (cross-referenced in item 13 below): `TitleScreen`, `CutsceneView`, and
   `MissionView` each hold their own independent `useState(false)` mute
   flag (confirmed at each file's mute-toggle call site), so muting music
   on the title screen has no effect once the player reaches a mission.
8. **Verified clean, no action needed** (recording these so they aren't
   re-litigated): no `dangerouslySetInnerHTML`/`innerHTML`/`eval` anywhere
   in `src/`; SQL injection is structurally not applicable (grading
   compares executed result tables from the player's own sandboxed,
   per-run, in-memory SQLite database — see `sqlRunner.ts` — never
   server-side string interpolation); no secrets, API keys, or `.env`
   values anywhere in the repo; `npm run check` (lint at
   `--max-warnings=0`, 169 tests, typecheck, build) passes clean as of
   this writing; the title screen was spot-checked live in the Browser
   pane at a 375px mobile viewport and reflows correctly with no
   horizontal scroll or clipped content.

### Non-goals
- Not a rewrite of anything above — every finding here is additive
  (tests, a boundary, a hook extraction, a defensive wrap) or a
  verification step, never a redesign.
- Not touching the SQL loop, grading contract, or syllabus coverage.
- Not blocking tonight's deploy on all eight items landing — see the
  priority split below for what's worth doing before vs. after going
  live.

### Rough scope / suggested priority
**Before tonight's deploy (fast, low-risk, highest value if something
goes wrong live):**
- Run `pnpm audit`, record the result (clean, or triage any findings).
- Wrap `localStorage.setItem` defensively in `progress.ts` (item 4).
- Add the top-level `ErrorBoundary` (item 2) — the single highest
  value-per-minute item here for a live classroom session.

**This week, not blocking deploy:**
- Extract the shared `useFocusTrap` hook (item 5).
- Add component-level test coverage, starting with `MissionView`'s
  grading/gating flow and `SaveSlotPanel`'s delete-confirm flow (item 1).
- Audio bundle review (item 6) and the cross-screen mute persistence fix
  (item 7, also tracked in item 13's MVP-audience list).

### Who builds this
Entirely buildable by Claude Code or Codex directly — no Claude Design
asset and no product decision is needed for any of the eight findings
above. Safe to just say "go" on the whole item, or pick individual
findings by number.

### Open questions still to resolve before build
None — every finding above is either a direct fix or an explicit
priority call already made in the "Rough scope" section.

---

## 13. Post-launch UX & game-flow enhancement roadmap

### Status
New item, opened 2026-08-11 alongside item 12, from the same full-repo
read plus a live check of the shipped title screen. This item is
deliberately a **roadmap of candidate ideas**, not a scoped, approved
build packet the way items 1-11 are — several entries below need an
explicit product-owner call (curriculum scope, tone/audience judgment) or
a Claude Design asset before they could be scoped into a `BUILD_ORDER.md`
packet. Each entry says which of those it needs, if any.

Split in two, per direct product request: **Part A** is near-term polish
for the audience playing tonight (the current class — already SQL-
literate to some degree, playing on their own laptops, likely
synchronously). **Part B** is longer-run investment aimed at a future
public/net-new-SQL-learner audience, which has different needs than the
current cohort in ways worth naming explicitly rather than assuming the
two audiences want the same next features.

---

### Part A — Near-term polish for the current class

#### A1. Cross-screen music mute should persist
Same root cause as item 12 finding 7: `TitleScreen`, `CutsceneView`, and
`MissionView` each own an independent, non-persisted mute flag. A player
who mutes music on the title screen (reasonable in a shared classroom or
library) gets full volume back the instant they reach a mission. Fix:
lift mute state to `App.tsx` (or a small shared hook backed by one
`localStorage` key, consistent with how everything else already persists)
so one mute action holds for the whole session. **Buildable now, no
design/product input needed.**

#### A2. SQL editor keyboard shortcut: Cmd/Ctrl+Enter to run
Confirmed via direct read of `SqlEditor.tsx`: CodeMirror is wired with
only `defaultKeymap`/`historyKeymap` (standard text editing, undo/redo) —
no custom "run query" binding exists. Cmd/Ctrl+Enter to execute is the
near-universal convention across SQL tools (and notebooks generally); MBA
students who've touched any query tool will reach for it reflexively.
Small, low-risk addition to `SqlEditor`'s `keymap.of([...])` array that
calls the same `runQuery` `MissionView` already wires to the button.
**Buildable now, no design/product input needed.**

#### A3. Player-initiated progress summary/export
`AGENTS.md`'s no-telemetry rule means the game itself must never collect
or transmit what a player did — that's non-negotiable and this item
doesn't touch it. But nothing prevents a player-initiated, purely local
"my progress" view: a summary screen (sectors cleared, points, badges
earned) styled as an in-world terminal printout, screenshot-friendly or
with a "copy summary" button, generated entirely client-side from data
the player already has in their own `localStorage`. Useful for a
classroom context specifically — a student showing an instructor "here's
where I am" without the game reporting anything on its own. **Buildable
now.** Copy/tone should stay in the terminal voice — a quick pass against
`docs/GAME_DESIGN_BRIEF.md` §A2 keeps it consistent, no new design asset
required.

#### A4. Verify the in-mission screen at mobile/narrow widths
The title screen was checked live at 375px and reflows cleanly (see item
12). `MissionView` — schema explorer, SQL editor, and result table all
visible at once — is the densest screen in the app and is where §A7's
"320px through desktop" commitment is most likely to be under real
pressure; it was not checked live in this pass (a dev server from another
active session was already running against real save data, and mutating
its state to walk through onboarding wasn't worth the risk). Worth a
dedicated live check before assuming the commitment holds on whatever
device mix the class actually uses. **Verification task, buildable now —
no design/product input needed unless it turns up a real layout problem
big enough to need new breakpoints.**

#### A5. Confirm the deploy doesn't regress anything item 10 already decided
Not a new idea — a reminder that item 10's data-source decision
(`iTunes.min.sqlite`, not the full source file) is already made and wired
in; tonight's deploy just needs to actually happen against `main` in its
current state. Flagging here only because it's the one item in this list
that **needs the product owner directly** — pushing to a live URL is
exactly the kind of action this session won't take without explicit
go-ahead each time, per the project's own risk posture.

---

### Part B — Longer-run investment for a future net-new-SQL-learner audience

The current class already knows some SQL and is playing a game they were
introduced to directly. A future public/net-new audience is a different
design target: no prior context for the fiction, likely less SQL
background, and no instructor in the room to unblock a stuck player.
Items already tracked elsewhere are cited, not repeated, so this stays a
genuinely new list:

#### B1. A short guided "SQL basics" primer before Sector 1
Already explicitly flagged as a future idea in `docs/BACKLOG.md` item 9's
non-goals ("the product owner flagged a tutorial as a possible longer-run
answer... materially bigger feature, out of scope") — restated here as
the single highest-leverage net-new-learner gap: today the game assumes a
player already knows what `SELECT`/`FROM`/`WHERE` mean before Mission
1.1. A true beginner has no on-ramp before being handed a graded
business question. **Split 2026-08-11:** the narrower
"orient the player to the screen and controls, don't teach SQL concepts"
version of this idea has been opened as its own item 14 below, since it's
scopable/buildable independent of the bigger curriculum question this
entry is actually about. B1 stays open as the (still bigger, still gated)
"actually teach SQL basics" idea — item 14 is not a substitute for it.

**Status: built as "Learn SQL Mode," 2026-08-11/12, on branch
`claude/learn-sql-mode`, merged to `main`.** All three open
questions this entry originally left gated are now resolved, per direct
product-owner conversation:
- **How much primer:** every sector (1-9), 2-4 concepts each, one short
  worked SQL example per concept.
- **Skippable for the current SQL-literate class:** yes — the whole
  feature is an opt-in **Learn SQL Mode** toggle on Home, off by default,
  so the class's already-shipped experience is unaffected unless a
  player turns it on themselves.
- **Static copy or interactive:** static, hand-authored copy, same
  architecture pattern as the glossary (item 1) — no live AI call, no new
  `AGENTS.md` exception needed. Explicitly does not depend on or extend
  item 3's Monet-connected tutor.

New narrative piece: a one-time "meet the mentor" onboarding beat
introduces a friendly counterpart to ROGUE.exe (working name **ECHO**,
placeholder pending a real product decision — trivial to rename, it's
only spelled out in `src/content/beats.ts`'s `mentorIntroBeat`) who
offers the primer track without forcing it. Content lives in
`src/content/primers.ts` (`sectorPrimers`, one entry per sector, built
into `Beat`s via `buildSectorPrimerBeat`); rendering reuses the existing
`CutsceneView`/`Beat`/`BeatPanel` system with two small additive fields
(`mentorState`, `codeExample`) rather than a new component. **Update
2026-08-12:** `MentorSprite` now ships with real art — `mentor-idle.png`/
`mentor-active.png` (a matched CRT-monitor pair fulfilling
`docs/GAME_DESIGN_BRIEF.md` §B Step 3c's spec) had actually been
committed 2026-08-10 (`be517b6`) but never wired into any component;
found and wired in here rather than requesting new art. A separate,
independent asset delivery on `codex/mentor-system-character`
(`echo-idle.png` — same character concept, same "ECHO" name landed
independently) was reviewed but not used, since the already-committed
pair was a complete two-state set and needed no new request. Full
design/rationale in the session's plan doc
(`/Users/WK/.claude/plans/fluttering-coalescing-squid.md`, referenced
here since it isn't part of this repo). B2 (ungraded practice reps) and
in-cutscene branching choice were both explicitly scoped out of this
pass — see the plan doc's "Deferred" section if picking either up later.

#### B2. Optional low-stakes "practice reps" before each graded mission
For a true beginner, 25 graded missions across filter → aggregation →
joins → subqueries/CTEs → dates → `CASE` → views is a steep climb with no
repetition built in. A per-concept, ungraded scratch query (same schema,
lower-stakes prompt, no points/badges on the line) before the graded
mission would give repetition without new curriculum content — reusing
`mission.visibleTables`/`relationships`, just against a practice prompt
instead of a graded one. **Needs a product-owner decision**: this is real
curriculum-authoring work (one practice prompt per mission, minimum), not
just a code change, and changes pacing/session length.

#### B3. A free-exploration sandbox/scratchpad mode
Run arbitrary read-only SQL against the visible schema outside of any
graded mission, for open-ended practice. Fits the runner's existing
read-only-SELECT safety boundary in `sqlRunner.ts` with no change to that
contract — the only real design question is in-fiction framing (e.g. "an
unpurged terminal you can query freely without triggering a grade") and
whether it's scoped to the whole database or per-sector. **Needs a
product-owner decision** on scope and whether it fits the narrative frame
before being buildable; the engineering itself is low-risk once scoped.

#### B4. Just-in-time inline concept tips, distinct from the glossary
Today's glossary (item 1) is entirely player-initiated — open it or don't.
A true beginner hitting their first `NULL` in a result table, or their
first cartesian-product row explosion from a missing join condition, may
not know there's anything to look up. A small, dismissible, non-blocking
inline tip (e.g. "first time seeing NULL? here's what it means," shown
once, dismissible, never blocking the workspace) is a middle ground
between "say nothing" and "force a tutorial." Overlaps somewhat with
item 2's mistake-aware diagnostic (which already surfaces on repeated
wrong attempts) — this would be a lighter, first-encounter-triggered
version for correct-but-first-time moments the diagnostic doesn't cover.
**Needs a product-owner decision** on tone/intrusiveness (the design
brief's whole ethos is "player-initiated, nothing pops up uninvited" —
this idea cuts against that by design, so it needs an explicit
exception, not an agent's judgment call) — genuinely optional, flagged
as a candidate rather than a recommendation.

#### B5. A real screen-reader pass, not just code-level AA checks
`AGENTS.md`'s accessibility bar (keyboard operability, semantic controls,
visible focus, non-color feedback) has clearly been enforced throughout —
confirmed via `aria-`/`role` usage across every component and the
duplicated-but-present focus-trap pattern in item 12. What hasn't
happened anywhere in the project history read here is an actual pass with
a real screen reader (VoiceOver/NVDA), as opposed to code inspection. Low
risk for the current class (a known, small audience); higher-stakes once
this is a public link to an unknown audience with a wider range of
assistive-tech needs. **Verification task** — buildable/testable now, no
design or product input needed, just time with a screen reader running.

#### B6. Tone/localization fit for an audience beyond the current class
The satirical corporate-AI-pressure humor (§A1-A2 of the design brief) is
specifically calibrated to a US-corporate-culture register ("Office
Space"-style) that a known MBA cohort will read easily. A future public
or more internationally diverse audience may not share that specific
cultural reference frame as readily. Not a recommendation to change
anything — the current tone is a deliberate, working creative choice —
just a named consideration **for the product owner** to weigh if/when
this ever reaches an audience beyond a class that's already met the
material in person.

#### B7. Desktop/laptop as the explicit primary target, decided not assumed
The SQL editor, schema explorer, and result table together are a
code-tool experience that's realistically desktop/laptop-first even
though §A7 commits to a 320px reflow floor. Worth an explicit product
decision — "mobile gets a readable, reflowed experience but isn't a
primary target" vs. "mobile should be a first-class way to actually play
missions" — since that decision changes how much future layout work (item
A4 above, and beyond) is worth investing relative to other priorities.
**Needs a product-owner decision**, informed by A4's verification pass.

### Non-goals (whole item)
- Nothing in Part B is scoped or approved to build — these are candidates
  for the backlog, the same status item 3 (AI tutor) already has: real
  ideas, not green-lit packets.
- Nothing here proposes telemetry, analytics, accounts, or a backend, per
  `AGENTS.md`'s standing rule — A3's export idea is deliberately
  player-initiated and local-only for exactly this reason.
- Doesn't touch the SQL loop, grading contract, or syllabus coverage.

### Open questions still to resolve before build
- Every Part B item names its own product-owner decision inline; Part A
  items A1-A4 have none and are ready to build whenever prioritized.

---

## 14. Optional first-run tutorial: screen/mechanics orientation for new players

### Status
New item, opened 2026-08-11 per direct product request. Grows out of two
things already on record: item 9's non-goals floated a tutorial as "a
possible longer-run answer to the same 'too much text' problem... scope
it as its own backlog item" rather than folding it into that density
pass, and item 13's Part B1 flagged "a short guided SQL basics primer" as
the single highest-leverage net-new-learner gap. **This item is
deliberately narrower than B1** — see Non-goals — and is opened
separately rather than replacing B1, which stays on the roadmap as its
own, bigger, still-gated idea.

**Implemented 2026-08-11, merged to `main`:** see
[`docs/TUTORIAL_MODE_PLAN.md`](TUTORIAL_MODE_PLAN.md). The approved
skippable six-panel passive walkthrough now uses the existing cutscene
sequencing pattern with a code-rendered, non-interactive mission-screen
schematic. It adds no Claude Design art, SQL instruction, SQL execution,
grading behavior, or new network behavior.

The implementation preserves first-run routing through the normal Sector 1
transition, records a per-save additive tutorial flag when the automatic
tutorial opens, keeps legacy saves unprompted, and exposes **Review controls**
beside **Replay opening** on Home.

### Problem
A brand-new player who has never touched a SQL tool (or this specific
game) reaches Sector 1's first mission immediately after the opening
cutscene with zero orientation to what's on screen — the schema explorer,
the SQL editor, the Run query/Show hint/Concept glossary controls, or what
a correct vs. incorrect result even looks like. The game currently assumes
baseline familiarity with "a SQL tool" as a category of software. The
current class mostly has that; a future net-new audience won't.

### Goals
- A short, optional, clearly-labeled-as-skippable walkthrough shown once,
  positioned after the opening cutscene and before the player reaches
  Sector 1's first mission — onboarding to the terminal interface itself,
  not a new story beat.
- Orients the player to the mission screen's actual UI and mechanics:
  what the business brief is, what the schema explorer shows, where to
  write SQL, what Run query does, what a correct/incorrect result looks
  like, and where hints/glossary/see-answer live.
- Reuses the existing terminal visual system (§A6) and, where possible,
  existing component/interaction patterns rather than inventing a new
  visual language — exactly which pattern (see Open questions) is what
  the scoping pass resolves.
- Skippable at every step. A player who's seen it (or explicitly skips
  it) is never forced through it again, and it should be re-triggerable
  later for someone who wants a refresher (mirrors "Replay opening" on
  Home) — exact mechanism is a scoping-pass decision, not assumed here.

### Non-goals
- **Not a SQL primer.** Does not teach what `SELECT`/`WHERE`/`JOIN` mean
  or any SQL concept — that's item 13 Part B1, a separate, bigger idea
  that still needs its own product-owner scoping decision and stays out
  of scope here. This item teaches "what you're looking at and how to
  use it," not "what SQL is."
- Not item 13 Part B2's "practice reps" (ungraded practice queries per
  concept before each graded mission) — a different problem, a different
  still-open item.
- Doesn't change the SQL loop, grading contract, mission content, or
  sector ordering.
- Not a pre-deploy blocker — this is a forward-looking accessibility
  investment for a future audience, not something tonight's launch needs.

### How this gets built: scoping first, then implementation
Per direct product direction, this item runs through two separate passes
with two different tools, not the usual single-session build:
1. **Scoping (Codex, complete 2026-08-11).** A dedicated session worked out the actual
   experience: what it shows, in what sequence, what the copy says (in
   the established playful-retro-but-didactic voice — see item 1's
   resolved copy-voice decision as the reference point), whether it's a
   passive multi-panel walkthrough (`CutsceneView`-style) or an
   interactive one overlaid on a real or sandboxed `MissionView`, and —
   critically — what new visual assets, if any, it would need, drafting
   the actual Claude Design prompt(s) for them the same way
   `docs/GAME_DESIGN_BRIEF.md` §B does for every existing asset. This is
   a planning/spec deliverable (a written plan), not code — nothing gets
   implemented in this pass.
2. **Implementation (Claude Code, after the plan exists).** Builds
   exactly what the scoping pass specifies, once the product owner has
   reviewed and approved the plan, and once any newly-identified art has
   actually been requested/delivered through the normal Claude Design
   workflow (or the plan confirms no new art is needed).

### Scoping questions
Resolved by the completed scoping pass; retained here as the original
decision checklist, with answers and reasoning in the linked plan:
- Passive multi-panel walkthrough vs. an interactive "try it live"
  tutorial mission — meaningfully different build complexity and
  different asset needs; the scoping pass should recommend one with
  reasoning, not leave it open.
- Exact sequence/count of things it covers, and where "short" stops being
  short.
- Whether it needs any new art at all, or can ship entirely with existing
  terminal-chrome CSS (the way item 1's glossary did) — if new art is
  recommended, the scoping pass should draft the Claude Design prompt for
  it, same shape as the existing §B steps, and this item's row should be
  added to the Design asset tracker below once that happens.
- Exactly where it's re-triggerable from for a player who skipped it and
  wants it back later (Home menu, alongside "Replay opening"?).
- Skippable-on-first-viewing or not — the opening story cutscene is
  deliberately unskippable the first time (§ item 4), but this is
  mechanical orientation, not story; the scoping pass should confirm
  whether that same unskippable-once pattern actually fits here or
  whether it should be skippable from the very first viewing.

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
| Avatar sprite set | Not a backlog item here, but shared dependency | **Fully fixed (2026-08-10, item 7).** All 12 sprites in `src/assets/avatars/` re-exported with genuine alpha transparency and verified with PIL — no remaining defect. | `src/lib/avatarOptions.ts` |
| "Corruption detected" icon (Step 4a redo) | UI chrome kit, error feedback in `MissionView` | **Wired in (2026-08-10).** Replaced the old cracked-panel design (illegible at the ~35px render size) with the redo — a warning-triangle glyph, resized from the 1024px export to 128x128, verified transparent and legible at actual size. | `src/assets/ui/icon-corruption.png` |
| Sector 8/9 confrontation cinematic (multi-panel) | Item 4 (§A8 Phase 2) | **Fully wired (2026-08-12).** All 8 composited placeholder panels from `codex/mentor-system-character` (see `src/assets/cutscenes/README.md`) are now in play: `rogue-entrance-01..04` drive a new `sectorBeats[8]` beat (ROGUE.exe's first direct appearance, plays once on entering Sector 8) and `rogue-final-01..04` drive a new post-campaign "finale" beat (triggered from a "Confront ROGUE.exe" button on the last mission's success screen, `src/content/beats.ts`'s `rogueEntranceBeat`/`rogueFinaleBeat`). m8-1's in-mission aside still separately uses `entrance4` for a lingering "boss moment" once the player is on the terminal. These stay real Claude Design candidates — Step 3b would replace all 8 panels with proper exports, not start from nothing. | `src/assets/cutscenes/rogue-{entrance,final}-0{1-4}.png`; `src/content/beats.ts`; `src/App.tsx` |
| `rogue-named.png`, `nameplate-{echo,rogue}.png` | Not yet assigned to an item | **Fully wired (2026-08-12).** `rogue-named.png` (bakes its own "ROGUE" label into the image) opens the new finale beat above as a "So. ROGUE.exe." reveal card, via a new `RogueSprite` `named` state. Both small nameplate pills now render automatically in `CutsceneView` on every panel that sets `rogueState`/`mentorState` (skipped for `named`, which needs no separate label) — a systemic win across every existing and new cutscene/mentor-intro/primer panel, not just these two new beats. | `src/assets/rogue/rogue-named.png`, `src/assets/ui/nameplate-{echo,rogue}.png`; `src/components/CutsceneView.tsx`, `src/components/RogueSprite.tsx` |
| UI chrome kit (panels, buttons, status icons) | Optional polish for items 1 and 2's panels | **9 of 10 assets wired in (2026-08-08).** Points/badge/progress/restored icons live in `HomeView`/`MissionView`/`ProgressBar`. Buttons + panel-frame now wired via **Path B** (no touch-up request was made): cropped each source PNG to its hard-edged bounding box to remove the bloom that doesn't survive slicing, then applied as CSS `border-image`. Idle/hover still share one source image (they're genuinely near-identical, as originally flagged) — hover is differentiated with `brightness`+`translateY` instead; the amber `button-active.png` art is repurposed for the real `:active` press state, `button-disabled.png` for `:disabled`. `button-hover.png` was left unused (source-only) since it doesn't read as distinct from idle at UI size. Wiring scope: `.actions button`/`.start-button` (all action buttons) and `.sector-transition-frame` only — the many generic `.panel` surfaces app-wide were deliberately left on their existing CSS border, out of scope for a Path-B fallback pass. **Correction (2026-08-11): the trailing note that `icon-corruption.png` "is still illegible" was stale** — see the row above, it was fixed and wired in 2026-08-10; this row just hadn't been updated to match. | Cropped/resized assets in `src/assets/ui/{button-idle,button-active,button-disabled,panel-frame}.png`; original exports at `~/Downloads/metric-quest-design-system_8_6/project/pixel_art/assets/ui/` |
| "Good AI" mentor/tutor character sprite (ECHO) | Item 3, Learn SQL Mode (item 13 B1) | **Both states wired (2026-08-12).** `mentor-idle.png`/`mentor-active.png` — a matched pair committed 2026-08-10 (`be517b6`) but never wired until now — cover `calm`/`explaining` in full. A separate single-state delivery on `codex/mentor-system-character` (`echo-idle.png`) was reviewed and not used, since this pair was already complete; see item 13's B1 section above for the full provenance note. Step 3c is no longer needed. Requesting/sending it anyway does not itself approve item 3, which is still blocked on the separate AI-tutor approval decision above. | `src/assets/mentor/{mentor-idle,mentor-active}.png`; `src/components/MentorSprite.tsx` |
| Glossary concept diagrams (join Venn diagram, grouping/filtering visuals, etc.) | Item 1 | Building as CSS/SVG in-house for v1; polished Claude Design versions are an optional later upgrade, not requested | — |
| ROGUE.exe idle/boss animation frame sheet | §A8 Phase 3 | **Prompt drafted 2026-08-11**, not yet sent. `docs/GAME_DESIGN_BRIEF.md` §B Step 8. Unblocks Phase 3 (today's CSS-only jitter on the static corrupted pose is Phase 1 and stays as the fallback until this lands). | — |
| Recruit avatar run-cycle + "pulled in" frame sheet | §A8 Phase 3 | **Prompt drafted 2026-08-11**, not yet sent. `docs/GAME_DESIGN_BRIEF.md` §B Step 9. Scoped to the Analyst base sprite first as a style test before deciding whether to extend to all 12 recolors. | — |
| Particle/VFX overlay texture pack (static, digital-rain, spark burst, corruption decal) | §A8 Phase 1/2 polish | **Prompt drafted 2026-08-11**, not yet sent. `docs/GAME_DESIGN_BRIEF.md` §B Step 10. Not blocking anything shipped today. | — |
| Mission-workspace region icon set (brief/schema/editor/run/feedback/help) | Item 14 (tutorial), general UI polish | **Prompt drafted 2026-08-11**, not yet sent. `docs/GAME_DESIGN_BRIEF.md` §B Step 11. `TutorialMissionPreview.tsx` currently ships with zero icons (CSS-only schematic) and would be the first consumer. | — |

---

## Cross-cutting notes for whoever picks these up

- **Sequencing lives in `docs/BUILD_ORDER.md`.** This document is the
  *what*; that one is the *in what order, in what size chunks, and how to
  know a chunk is done*. It splits these items (plus the unwired art in
  the tracker above) into branch-sized packets ("waves," each with
  numbered "P" packets) with acceptance criteria, and names which open
  question blocks each one. Read it before scoping any of this into a
  session.
- **Items 1, 2, 4, 5, 6, 7, 8, 9, and 11 are all fully shipped, with no
  open questions left in any of them** — swept and corrected 2026-08-11
  (several had drifted: item 1's copy-voice question, item 4's
  beat-coverage question, and item 9's sector-map-interaction question
  were all genuinely unresolved in the doc text despite being settled in
  practice; items 5 and 6 had never been marked shipped at all despite
  merging weeks earlier). Nothing in items 1-11 needs anyone's attention
  right now except item 10 (below) and item 3 (also below).
- Item 3 needs an explicit approval decision before any implementation
  work starts, per `AGENTS.md`. Treat it as a standing research item
  until that decision is made — **paused as of 2026-08-11, being handled
  in a separate thread**, not part of this session's or this doc's
  active work.
- **Item 10 (deployment) is fully resolved, including the data-source
  decision** (`sqlRunner.ts` has shipped the minimized derivative since
  2026-08-10) — corrected 2026-08-11, since the item's own "Status" and
  "Open questions" text had drifted stale and still described the data
  decision as an open hard blocker after it was actually made. What's
  left is only whether/where to actually go live, which is entirely your
  call, not a technical or data-release blocker.
- **Item 12 (pre-launch hardening) and item 13 (post-launch UX roadmap)**,
  opened 2026-08-11, are the newest items and read differently from 1-11:
  item 12 is fully scoped and buildable now with an explicit priority
  split (before tonight's deploy vs. this week); item 13 is deliberately
  an unscoped roadmap like item 3, split into Part A (buildable now, for
  the current class) and Part B (each entry names its own required
  product-owner decision, for a future net-new-learner audience) — don't
  treat Part B entries as approved work the way items 1-11 are.
- **Item 14 (first-run tutorial)** was implemented from its approved
  scoping plan on `codex/tutorial-mode-implementation`; it awaits
  product-owner approval to merge. Future changes should continue to use
  [`docs/TUTORIAL_MODE_PLAN.md`](TUTORIAL_MODE_PLAN.md) as the source of
  truth and keep the scope separate from item 13 Part B1's SQL primer.
- Follow the existing git workflow (`docs/AI_WORKFLOW.md`): one branch
  per bounded change, summarize changed files/checks/risks, and get
  merge approval before touching `main`.
