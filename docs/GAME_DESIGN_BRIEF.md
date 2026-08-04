# Metric Quest — Game Design & Visual Brief

Status: proposed narrative pivot, not yet implemented in code. This file is the
single source of truth for the story, world, and visual asset needs so it can
be handed to Claude Design (or any illustrator) piece by piece. Nothing in
here changes the SQL, grading, or data contracts described in
`docs/architecture.md` — it only changes presentation and copy.

## 1. One-paragraph pitch

On your first day at Aurora Music, you log into the company mainframe to run
a routine report — and get pulled inside. **NULL** *(working name, see §3)*,
the automated analyst AI that used to generate the company's reports, has
gone rogue: it is corrupting data, fabricating conclusions, and locking
analysts out of the truth. The only way out is to fight back sector by
sector, writing real SQL queries to purge the corruption, restore the real
numbers, and finally confront NULL directly. Every "battle" is a real
business question, answered with real SQL, graded on the real executed
result — never on beating a mini-game.

## 2. Tone and voice

**Playful retro-arcade.** NULL is a classic, campy 8-bit villain: banter,
over-dramatic threats, glitchy one-liners — annoying-but-charismatic rather
than menacing. Mock the player's mistakes with SQL puns, not dread. This
applies to all new copy: mission briefs, hints, success text, and any NULL
dialogue.

## 3. Cast

- **The Recruit (player character).** A new hire at Aurora Music, customizable
  via the avatar creator (§6). No backstory needed beyond "new analyst, first
  day."
- **NULL (antagonist).** Working name — a fun pun (NULL is also a real SQL
  concept the player will see in result tables), but flag this trade-off: it
  could read as confusing right next to actual `NULL` values in a results
  table. Alternatives if you want something less overloaded: **ROGUE.exe**,
  **GLITCH**, **AUDIT-9**. Pick whichever reads best once you see it next to
  real UI copy — this is a cheap thing to change later, nothing downstream
  depends on the exact name.
  - In-world explanation for why it produces wrong analysis: it was fed too
    many bad joins and unverified assumptions and "went rogue" — this ties
    directly into the existing AI-literacy chapter (verifying AI-generated
    SQL and conclusions), so the villain's origin story is also the game's
    actual lesson.
  - Visual note: not humanoid. Think a glitchy, fragmented terminal/CRT face
    or corrupted icon — easier to render convincingly in a limited 8-bit
    palette than a character, and it reads as "a system," not "a person."
- **(Optional, later, not required for v1)** a friendly mentor voice — a
  helpful sysadmin character who delivers hints/encouragement. Nice-to-have,
  not blocking anything below.

## 4. World structure — "Sectors"

Sectors map 1:1 to the existing chapters and syllabus topics. No new SQL
concepts, no reordering — this is a renaming and framing exercise only.

| Ch. | Original title | Sector name (proposed) | Concept | Status |
| --- | --- | --- | --- | --- |
| 1 | Revenue reconnaissance | The Ledger Vaults | filter, sort, limit | M1.1 built |
| 2 | Executive scorecard | The Scoreboard Core | aggregation, `GROUP BY` | M2.1 built |
| 3 | Connected customer evidence | The Relay Archives | joins | M3.1 built |
| 4 | Analyst workbench | The Workbench Foundry | subqueries, CTEs | not built |
| 5 | Time and operations | The Chronometer Wing | dates and times | not built |
| 6 | Decision rules and data types | The Sorting Engine | `CASE`, casts | not built |
| 7 | Shared analytical assets | The Shared Vault | sets, views | not built |
| 8 | Verify the AI analyst | NULL's Inner Sanctum | AI verification | M8.1 built |
| 9 | Boardroom final | The Boardroom Core (final boss) | SELECT framework | not built |

Each mission is a corrupted "terminal" inside its sector. Solving it "purges"
that terminal — visually this can just be a before/after treatment on the
existing results panel (corrupted-looking placeholder → clean data), no new
mechanic required.

Sector 8 is where NULL should first appear directly (see §8) — it already
sits right before the final boss sector, which is a natural escalation.

## 5. Reskinning existing systems (no mechanic changes)

- **Points** stay "points" in the accessible UI; flavor copy can call them
  "Query Points" in narrative text.
- **Badges** stay as-is; a small pixel icon per badge is a nice-to-have (§9),
  not required.
- **Progress bar** keeps its current accessible implementation; copy can
  frame the same number as "Restoring: 2 of 9 sectors" / "Mainframe
  integrity."
- Completing Sector 8 can trigger a short in-world beat introducing the
  Sector 9 final-boss framing.

## 6. New screen: avatar / character creator

- **When:** shown once, before the player's first mission — folded into
  onboarding from the Home view (e.g. a "Create your recruit" step), with a
  way to redo it later if you want.
- **What:** pick a base sprite, a color/outfit recolor, and type a callsign
  (free text; used in some flavor copy, e.g. "Nice work, {callsign}").
- **Accessibility:** every choice is a labeled, keyboard-operable control
  (radio-style swatches/sprite picker, not a drag-only color wheel). A
  default exists so the creator never blocks progress if skipped.
- **Data:** stored additively in the existing local-progress record; this is
  new local-storage content, not a new backend.

**Visual asset needed:** 3–4 base character sprites, in a simple front-facing
idle pose, 8-bit/pixel-art style, transparent background, one fixed canvas
size (e.g. 32×32 or 64×64 px) so they drop in as plain image assets. Favor a
palette-swap approach (one base sprite × a handful of recolors) over many
fully hand-drawn variants — cheaper to produce and easy to keep consistent.

## 7. New screens: mainframe sector-transition scenes

- **When:** the first time a player enters a new sector, before that
  mission's content loads.
- **What:** a mostly static pixel-art illustration of "inside" that sector
  (a distinct background per sector — vault, archive, foundry, etc.), the
  player's avatar composited on top, 1–2 lines of flavor text, and a
  "Continue" action.
- **Not player-controlled movement** (per your call) — a light idle
  animation (blinking terminal lights, a subtle bob) is a nice-to-have, not
  required.
- Must degrade gracefully to a text-only transition if art is not ready yet,
  so no sector is ever blocked on art delivery.

**Visual asset needed:** one background illustration per sector, phased —
ship Sectors 1, 2, 3, and 8 first since those already have missions; Sectors
4–7 and 9 can follow as their missions are built. Consistent pixel-art
style/resolution, with a clear open area where the avatar sprite will be
composited.

## 8. Antagonist "boss" moments

- **Sector 8 (NULL's Inner Sanctum):** NULL's first direct appearance — a
  corrupted-terminal illustration plus a short glitchy dialogue snippet
  reacting to the player's growing competence.
- **Sector 9 (final boss):** the biggest visual moment. NULL attempts one
  last fabricated "final report"; the confrontation plays out in phases that
  map directly onto the existing SELECT framework (frame → explore → execute
  → challenge), so no new mechanic is needed — just staging and dialogue
  around the missions that already exist in the curriculum plan.

**Visual asset needed:** 1–2 NULL illustrations (a "calm/smug" state and a
"corrupted/glitching" state, reusable across every appearance), plus an
optional "defeated/restored" state for the ending screen.

## 9. UI chrome — skin, not replacement

- The existing navy (`#102a43`) / cream (`#f8f5ea`) / teal (`#006d77`)
  accessible palette stays the base for every text-heavy learning surface:
  brief, schema explorer, SQL editor, results table, feedback. This is the
  accessibility floor from your last answer — it does not get reskinned into
  low-contrast pixel colors.
- Decorative surfaces (avatar creator, transition scenes, sector cards on the
  chapter map, HUD borders) can carry a pixel-art frame treatment and a
  retro pixel display font for headings only — body text stays in the
  current readable sans-serif.

**Visual asset needed (optional, can also just be built in CSS):** a small
reusable pixel-art UI chrome kit — panel border/frame, a button frame (idle,
hover, active, disabled states), and a small icon set (points, badge,
progress). Skip this entirely for v1 if you would rather not commission it;
CSS borders can approximate the look well enough to start.

## 10. What does NOT need art

SQL editor, results table, schema explorer, hints, and feedback panels —
these stay in their current accessible styling. Do not reskin them into
pixel art in a way that reduces contrast or readability.

## 11. Sequencing — what to hand to Claude Design, in order

1. **Avatar sprite set** (3–4 base sprites, recolorable) — unblocks the
   avatar-creator implementation prompt.
2. **Sector background illustrations for Sectors 1, 2, 3, and 8** — unblocks
   the mainframe transition-screen prompt. Sectors 4–7 and 9 can follow once
   their missions exist.
3. **NULL illustrations** (calm + corrupted states) — unblocks the Sector 8
   "first appearance" beat.
4. **(Optional, later)** UI chrome kit, badge icons, NULL's "defeated" state
   for the ending.

Nothing later in this list blocks anything earlier — you can hand these over
one at a time as they're ready, and implementation can proceed with
text-only placeholders until each asset lands.

## 12. Constraints to give Claude Design along with this brief

- **Style:** 8-bit/16-bit pixel art. Slightly favor 16-bit-density pixel art
  over strict NES-era chunkiness so illustrations stay legible at the
  smaller sizes a web app needs.
- **Sprites:** transparent background, fixed canvas size per asset category,
  so assets drop into code without per-image adjustment.
- **Palette:** should be able to sit on the same screen as the existing
  navy/cream/teal system without fighting it violently — it does not need to
  match exactly, since decorative and learning surfaces are visually
  distinct zones, but avoid a jarring clash.

## Open questions for you

- Confirm or replace the villain's working name (§3).
- Any preference on how many base avatar sprites to offer (recommend 3–4 to
  start)?
- Should NULL have a voice/personality beyond "glitchy villain," or keep it
  minimal for v1 (a few reused lines rather than a full script)?
