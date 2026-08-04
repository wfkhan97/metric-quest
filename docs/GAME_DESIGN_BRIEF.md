# Metric Quest — Game Design & Visual Brief

Status: proposed narrative pivot, not yet implemented in code. Nothing in
this file changes the SQL, grading, or data contracts described in
`docs/architecture.md` — it only changes presentation and copy.

**How to use this file:** §A is background (read it once, you don't need to
paste it anywhere). §B is the actual working material — a numbered sequence
of ready-to-copy prompts for Claude Design. Send them one step at a time, not
all at once; Claude Design works better from a focused ask than a dense
dump, and each step builds on the last. After each result, paste it back
into a message to Claude Code (a link, an export, or even a screenshot) and
tell it which step number it was — that's enough for it to wire the asset
into the matching implementation prompt.

---

## A. Background (context, not something you paste anywhere)

### A1. Pitch

On your first day at Aurora Music, you log into the company mainframe to run
a routine report — and get pulled inside. **ROGUE.exe**, the automated
analyst AI that used to generate the company's reports, has gone rogue: it
is corrupting data, fabricating conclusions, and locking analysts out of the
truth. The only way out is to fight back sector by sector, writing real SQL
queries to purge the corruption, restore the real numbers, and finally
confront ROGUE.exe directly. Every "battle" is a real business question,
answered with real SQL, graded on the real executed result — never on
beating a mini-game.

### A2. Tone

Playful retro-arcade. ROGUE.exe is a classic, campy 8-bit villain: banter,
over-dramatic threats, glitchy one-liners — annoying-but-charismatic rather
than menacing. Not a serious thriller, not horror.

### A3. Cast

- **The Recruit (player character).** A new hire at Aurora Music,
  customizable via the avatar creator. No backstory beyond "new analyst,
  first day."
- **ROGUE.exe (antagonist), confirmed name.** Deliberately not "NULL" —
  that's a real SQL concept the player sees constantly in result tables, and
  would be confusing sitting right next to it. Not humanoid — a glitchy,
  fragmented terminal/CRT face or corrupted icon, reading as "a broken
  system," not a person or robot. In-world, it went rogue after being fed
  too many bad joins and unverified assumptions — the villain's origin story
  doubles as the game's actual AI-literacy lesson.
  - Voice, confirmed scope for v1: a small handful of reused lines, not a
    full script — one for its first appearance (Sector 8), one or two
    mocking/taunting lines reusable across missions, one for the Sector 9
    final-boss opening, one for defeat.
- *(Optional, later, not required for v1)* a friendly mentor/sysadmin voice
  delivering hints. Not blocking anything below.

### A4. World structure — the Sectors

Sectors map 1:1 to the existing chapters and syllabus topics — this is a
renaming and framing exercise only, no new SQL concepts, no reordering. The
"Visual theme" column below is what feeds the Sector background prompts in
§B.

| Ch. | Original title | Sector name | Concept | Visual theme | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Revenue reconnaissance | The Ledger Vaults | filter, sort, limit | Bank-vault archive of glowing data ledgers on shelves | M1.1 built |
| 2 | Executive scorecard | The Scoreboard Core | aggregation, `GROUP BY` | Control room with a large glowing dashboard, dials, rising totals | M2.1 built |
| 3 | Connected customer evidence | The Relay Archives | joins | Record cabinets linked by glowing data-relay cables/tubes | M3.1 built |
| 4 | Analyst workbench | The Workbench Foundry | subqueries, CTEs | A forge/workshop where raw data is staged and reshaped | not built |
| 5 | Time and operations | The Chronometer Wing | dates and times | A clocktower-like wing full of gears and chronometers | not built |
| 6 | Decision rules and data types | The Sorting Engine | `CASE`, casts | A mechanical facility with conveyor belts and branching chutes | not built |
| 7 | Shared analytical assets | The Shared Vault | sets, views | A communal library where shared "views" sit on illuminated pedestals | not built |
| 8 | Verify the AI analyst | ROGUE.exe's Inner Sanctum | AI verification | ROGUE.exe's corrupted home turf: warped geometry, glitching screens | M8.1 built |
| 9 | Boardroom final | The Boardroom Core (final boss) | SELECT framework | A grand boardroom turned battle arena | not built |

Each mission is a corrupted "terminal" inside its sector; solving it
"purges" that terminal (a before/after treatment on the existing results
panel — no new mechanic needed). Sector 8 is where ROGUE.exe first appears
directly, right before the Sector 9 final boss.

### A5. Reskinning existing systems (no mechanic changes)

Points, badges, and the progress bar all keep their current accessible
implementation — only flavor copy changes (e.g. "Restoring: 2 of 9
sectors"). Completing Sector 8 can trigger a short in-world beat introducing
the Sector 9 final-boss framing.

### A6. Accessibility floor — non-negotiable

The existing navy (`#102a43`) / cream (`#f8f5ea`) / teal (`#006d77`)
accessible palette stays the base for every text-heavy learning surface:
brief, schema explorer, SQL editor, results table, feedback. It does not get
reskinned into low-contrast pixel colors. Decorative surfaces (avatar
creator, transition scenes, sector cards, HUD borders) can carry a pixel-art
treatment, but never at the cost of that floor. SQL editor, results table,
schema explorer, hints, and feedback panels need no art at all — leave them
in their current accessible styling.

---

## B. Copy-paste prompts for Claude Design

Send these in order. Steps 2 and 3 don't need to happen before Step 1 is
done — nothing later blocks anything earlier, and implementation can proceed
with placeholders until each asset lands.

### Step 0 — Set up a design system (optional, do once)

If Claude Design offers a way to learn your project's branding before you
start generating anything, use it once with this:

```text
I'm building "Metric Quest," a browser-based SQL learning game for business
school students. Please read my codebase and set up a design system from it.

The existing app uses a high-contrast, accessible color palette:
- Navy: #102a43 (primary text / dark backgrounds)
- Cream: #f8f5ea (page background)
- Teal: #006d77 (accent, primary actions)

That accessible palette is the permanent base for every text-heavy screen
(mission briefs, the SQL editor, results tables, feedback) and must never be
compromised for style -- no dropping contrast in the name of a retro look.

Separately, I'm adding a set of decorative, 8-bit/pixel-art game screens (a
character creator, "mainframe sector" background scenes, and a villain
character) that intentionally look different from the rest of the app -- a
distinct pixel-art skin layered on top of, not replacing, the accessible
base. When I ask you to design one of those screens, treat it as a
deliberate style departure, not something to normalize back into the base
design system. It should still feel like part of the same product without
matching the base palette exactly.
```

### Step 1a — Avatar sprite: lock the style first

Send this before asking for the full set — get one sprite approved, then
reuse its exact style for everything after.

```text
Design one 8-bit pixel-art character sprite for a game called Metric Quest.
This is a base sprite for a customizable player character called "the
Recruit" -- a new-hire analyst who gets pulled into a corporate mainframe.

Requirements:
- Simple front-facing idle pose, no animation needed.
- 8-bit/16-bit pixel-art style -- lean slightly toward 16-bit density so it
  reads clearly at small sizes in a web app, rather than the chunkiest
  NES-era look.
- Transparent background.
- Square canvas, consistent size (64x64px is a good default -- whatever you
  use, keep it consistent for every sprite that follows).
- Color palette: should feel at home next to a navy (#102a43) / cream
  (#f8f5ea) / teal (#006d77) UI without needing to match those colors
  exactly.
- Tone: friendly, approachable, playful retro-arcade -- not gritty or
  realistic.

Show me one sprite plus one alternate color/outfit recolor of the same
sprite, so I can confirm the style before you generate the rest of the set.
```

Only move to Step 1b once you're happy with what comes back. If it's off,
say what's wrong and iterate in the same thread rather than starting a new
prompt from scratch.

### Step 1b — Avatar sprite: the full set

```text
Great, I like this style -- please generate the rest of the character
creator set using the exact same pose, proportions, canvas size, and pixel
density as the approved sprite:

- 2-3 more base sprites (different body/hair/silhouette options), each with
  2-3 color/outfit recolors, so a player can mix a base sprite with a
  recolor.
- Keep every sprite on the same transparent, fixed-size canvas.
- Total should land around 3-4 distinct base sprites.

Export each as an individual image file, not just visible in a prototype
canvas, so I can hand them to my developer as image assets.
```

### Step 2 — Sector background scenes (Sectors 1, 2, 3, 8 first)

```text
Design 4 background illustrations for "Metric Quest," a pixel-art SQL
learning game. These are scene backgrounds for different "sectors" inside a
corrupted company mainframe that the player restores one at a time. Each
background should:

- Be a wide illustration suitable as a screen backdrop.
- Leave a clear, uncluttered open area in the lower-middle third where a
  small character sprite will be placed on top.
- Match the pixel-art style and palette approach from the character sprites
  (8-bit/16-bit density, plays well near navy #102a43 / cream #f8f5ea / teal
  #006d77, playful not gritty).
- Feel like a distinct "room" inside a computer mainframe, not a literal
  office.

The 4 scenes:

1. "The Ledger Vaults" (Sector 1) -- a bank-vault archive of glowing data
   ledgers on shelves.
2. "The Scoreboard Core" (Sector 2) -- a control room with a large glowing
   dashboard, dials, and rising totals.
3. "The Relay Archives" (Sector 3) -- record cabinets linked by glowing
   data-relay cables/tubes.
4. "ROGUE.exe's Inner Sanctum" (Sector 8) -- the villain's corrupted home
   turf: warped geometry, glitching screens, a darker palette than the other
   three, while staying in the same pixel-art style.

Generate them as 4 separate images at a consistent resolution.
```

*(Sectors 4–7 and 9 aren't needed yet — their missions don't exist. Reuse
this same prompt shape for them later, pulling the visual theme from the
table in §A4.)*

### Step 3 — ROGUE.exe illustrations

```text
Design 2 illustrations of "ROGUE.exe," the villain of Metric Quest -- a
rogue analyst AI that corrupts a company's data and fabricates conclusions.
It is explicitly NOT humanoid: think a glitchy, fragmented terminal/CRT-
monitor face, or a corrupted system icon -- it should read as "a broken
system," not a person or a robot.

Two states, same character:
1. "Calm/smug" -- composed, a little arrogant, like it thinks it's winning.
2. "Corrupted/glitching" -- visually breaking down, fragmented, chaotic --
   used when it's losing.

Style: same 8-bit/16-bit pixel art as the rest of the set, transparent
background, consistent canvas size. Tone: playful retro-arcade villain, not
horror -- a classic, campy 8-bit boss character, not something frightening.
```

### Step 4 — UI chrome kit (optional, do this last if at all)

```text
Design a small reusable pixel-art UI chrome kit for Metric Quest:
- One panel border/frame graphic.
- One button frame in 4 states: idle, hover, active, disabled.
- A small icon set: a "points" icon, a "badge" icon, a "progress" icon.

Style: consistent with the sprite/background pixel art already generated.
```

This one is a nice-to-have — CSS borders can approximate the look well
enough if you'd rather skip it entirely for v1.

---

## After you get results back

Claude Design's real output is a live/interactive design, not necessarily a
folder of image files — export formats and options may vary. Whatever you
get (individual image exports, a shareable link, a packaged handoff, or just
screenshots), bring it back into a Claude Code session and say which step
number it came from. That's enough context for it to wire the asset into
the right prompt (avatar sprites → Prompt 8, sector backgrounds → Prompt 9,
ROGUE.exe → the Sector 8/9 work in Prompt 14) without needing to re-explain
the brief.
