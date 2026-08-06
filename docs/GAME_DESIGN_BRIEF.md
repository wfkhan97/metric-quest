# Metric Quest — Game Design & Visual Brief

Status: two pivots layered on the original build. The first (still in
force) reframed the game as a rogue-AI mainframe adventure — see §A1-A5.
The second, dated 2026-08-06, is a full-immersion visual and layout pivot —
see §A6-A8 — driven by a direct ask from the product owner to make the whole
app *feel* like being inside a terminal, not just the decorative screens,
and to fit on one screen with no page-level scrolling. Nothing in this file
changes the SQL, grading, or data contracts described in `docs/architecture.md`
— it only changes presentation, copy, and layout.

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

You're a data scientist at Aurora Music. Leadership has been pushing hard
from the top down to put AI everywhere in the business — faster reporting,
fewer analysts double-checking the numbers. The company met that pressure
with **ROGUE.exe**, an automated analyst AI that took over report generation
without anyone building in the checks that should have come with it. It
went rogue: it is corrupting data, fabricating conclusions, and locking
analysts out of the truth, and leadership has no idea yet how bad it is.
Logging in to fix one report pulls you physically into the mainframe — the
whole game takes place *inside* the machine, not at a desk looking at a
screen. The only way out is to fight back sector by sector, writing real
SQL queries to purge the corruption, restore the real numbers, and finally
confront ROGUE.exe directly. Every "battle" is a real business question,
answered with real SQL, graded on the real executed result — never on
beating a mini-game.

The AI-adoption-pressure angle is the point, not just flavor: it's why
ROGUE.exe exists and why nobody caught it sooner, and it's the same
real-world tension ("ship the AI faster," "who's checking its work?") this
game is teaching players to navigate. Keep it satirical and light — a
recognizable corporate-AI-pressure joke, not a lecture.

### A2. Tone

Playful retro-arcade, now with a dash of corporate-AI satire (the pressure
that created ROGUE.exe should read as a knowing wink, not doom-and-gloom).
ROGUE.exe itself is a classic, campy 8-bit villain: banter, over-dramatic
threats, glitchy one-liners — annoying-but-charismatic rather than
menacing. Not a serious thriller, not horror.

### A3. Cast

- **The Recruit (player character).** A data scientist at Aurora Music,
  customizable via the avatar creator. Backstory is just enough to motivate
  the loop: pulled into the mainframe on the job, first day dealing with
  this mess.
- **ROGUE.exe (antagonist), confirmed name.** Deliberately not "NULL" —
  that's a real SQL concept the player sees constantly in result tables, and
  would be confusing sitting right next to it. Not humanoid — a glitchy,
  fragmented terminal/CRT face or corrupted icon, reading as "a broken
  system," not a person or robot. In-world, it went rogue after leadership
  fast-tracked it into production without the verification step a human
  analyst would have had, then kept feeding it more responsibility as it
  quietly started running bad joins and unverified assumptions — the
  villain's origin story doubles as the game's actual AI-literacy lesson:
  move fast on AI adoption without checks, and this is what you get.
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
| 1 | Revenue reconnaissance | The Ledger Vaults | filter, sort, limit, DISTINCT, text search, calculations | Bank-vault archive of glowing data ledgers on shelves | M1.1-M1.4 built |
| 2 | Executive scorecard | The Scoreboard Core | aggregation, `GROUP BY`, `HAVING`, `COUNT` | Control room with a large glowing dashboard, dials, rising totals | M2.1-M2.3 built |
| 3 | Connected customer evidence | The Relay Archives | joins | Record cabinets linked by glowing data-relay cables/tubes | M3.1-M3.4 built |
| 4 | Analyst workbench | The Workbench Foundry | subqueries, CTEs, temp tables | A forge/workshop where raw data is staged and reshaped | M4.1-M4.3 built |
| 5 | Time and operations | The Chronometer Wing | dates and times | A clocktower-like wing full of gears and chronometers | M5.1-M5.2 built |
| 6 | Decision rules and data types | The Sorting Engine | `CASE`, casts | A mechanical facility with conveyor belts and branching chutes | M6.1-M6.2 built |
| 7 | Shared analytical assets | The Shared Vault | sets, views | A communal library where shared "views" sit on illuminated pedestals | M7.1-M7.2 built |
| 8 | Verify the AI analyst | ROGUE.exe's Inner Sanctum | AI verification | ROGUE.exe's corrupted home turf: warped geometry, glitching screens | M8.1 built; M8.2/M8.3 not built |
| 9 | Boardroom final | The Boardroom Core (final boss) | SELECT framework | A grand boardroom turned battle arena | not built |

Each mission is a corrupted "terminal" inside its sector; solving it
"purges" that terminal (a before/after treatment on the existing results
panel — no new mechanic needed). Sector 8 is where ROGUE.exe first appears
directly, right before the Sector 9 final boss.

### A5. Reskinning existing systems (no mechanic changes)

Points, badges, and the progress bar all keep their current implementation
— only flavor copy and visual skin change. Completing Sector 8 can trigger a
short in-world beat introducing the Sector 9 final-boss framing.

---

### A6. Visual system — full-immersion terminal takeover (2026-08-06 pivot)

**This supersedes the old palette rule.** Originally, the accessible navy
(`#102a43`) / cream (`#f8f5ea`) / teal (`#006d77`) palette was a locked,
non-negotiable base for every text-heavy learning surface, and the retro
CRT-terminal look (already built for the avatar creator and sector
transitions) was confined to decorative screens only. Per direct product
direction, that confinement is lifted: **the terminal look is now the
entire app's visual system, including the brief, schema explorer, SQL
editor, results table, and feedback** — not just decorative screens.

What carries forward as the base palette (already built and proven
high-contrast on the decorative screens — this isn't a new palette, it's
promoting the existing one):

```text
--retro-bg:            #0a1024   deep background
--retro-panel:          #0f1830   panel background
--retro-panel-raised:   #16213f   raised/inset panel background
--retro-teal:           #1fd3c4   primary accent, borders, glow
--retro-text:           #eaf6f4   primary text
--retro-amber:          #ffd166   secondary accent, badges, warnings
--retro-muted:          #9fb3c8   secondary/muted text
```

These already measure well above WCAG AA on the decorative screens (light
text on dark backgrounds tends to have *more* headroom than the old
light-background palette, not less) — keep checking real contrast numbers
as this rolls out everywhere, rather than assuming "terminal aesthetic"
must mean "hard to read." If a specific combination (e.g. `--retro-muted`
on `--retro-panel-raised`) tests low, adjust that pairing rather than
shipping it.

**What is still genuinely non-negotiable** (this did not change, and
AGENTS.md already states it independently of any specific palette):
keyboard operability with semantic controls, visible focus on every
interactive element, readable/navigable result tables, and feedback that
never relies on color alone. A fully terminal-styled UI can still meet all
of this — the avatar creator and sector transitions already prove it (real
focus rings, real keyboard nav, non-color status text) — it just no longer
has to look like the old light-mode palette to do it.

`docs/architecture.md`'s grading/runner/progress contracts are unaffected;
this is presentation and layout only.

### A7. Layout — one screen, no page-level scroll

The app is a fixed single viewport per screen: no scrolling the whole page
up/down/left/right to see progress, read the brief, or run a query. In
practice that means:

- Each screen (Home, Mission, Avatar Creator, Sector Transition) is laid
  out as fixed zones inside one viewport-height shell — e.g. a persistent
  top status bar, a compact side/chapter nav, and a main content area —
  rather than a long stacked page.
- Individual zones may scroll internally when their own content overflows
  (a long result table, the full chapter/mission list, a long hint list) —
  that's a normal, expected pattern (like a terminal's own scrollback), not
  a violation of "no scroll." The constraint is about the outer page, not
  every sub-panel.
- Design for the accessible width range this project already commits to
  (320px through desktop) — a fixed-viewport layout needs to reflow at
  narrow widths (e.g. collapsing the chapter nav into a drawer/toggle)
  rather than simply shrinking until content is unreadable.

### A8. Animation & cutscene roadmap

Current sprite art (see §B, character PNGs) is one static pose per
character — no walk/action frame sheets exist. Ship in phases rather than
blocking everything on art that doesn't exist yet:

- **Phase 1 (now, buildable with existing art).** CSS-driven effects
  applied to the single static sprite/illustration: glitch/flicker, slide,
  zoom, scanline sweep, typewriter text reveal. Used on sector transitions,
  ROGUE.exe appearances, and mission-complete beats. No new art required.
- **Phase 2 (next, needs a few new static images, not frame sheets).**
  Slideshow-style cutscenes: short sequences of multiple static panels
  shown in order with text, visual-novel style, for bigger story beats
  (Sector 8 ROGUE.exe's first appearance, the Sector 9 final confrontation,
  campaign completion). Reuses Phase 1 CSS effects between panels.
- **Phase 3 (later, blocked on new art).** True multi-frame sprite
  animation (walk cycles, action poses). Needs a frame-sheet art request
  through Claude Design that hasn't been sent yet — do not start building
  this until that art exists, per the project rule that visual assets come
  from the external design tool, not agent-generated images.

---

## B. Copy-paste prompts for Claude Design

Send these in order. Steps 2 and 3 don't need to happen before Step 1 is
done — nothing later blocks anything earlier, and implementation can proceed
with placeholders until each asset lands.

Palette references below use the terminal system from §A6
(`#0a1024` / `#0f1830` / `#1fd3c4` / `#eaf6f4` / `#ffd166`), not the retired
navy/cream/teal palette — the app-wide visual pivot means every new asset
request should target the terminal look, including for screens that used
to be considered "accessible base" surfaces.

### Step 0 — Set up a design system (optional, do once)

If Claude Design offers a way to learn your project's branding before you
start generating anything, use it once with this:

```text
I'm building "Metric Quest," a browser-based SQL learning game framed as
being pulled inside a corrupted company mainframe. Please read my codebase
and set up a design system from it.

The app's visual system is a retro CRT-terminal look, used everywhere (not
just decorative screens):
- Deep background: #0a1024
- Panel background: #0f1830 / #16213f (raised)
- Primary accent/glow: #1fd3c4 (teal)
- Primary text: #eaf6f4
- Secondary accent: #ffd166 (amber)

Treat this as the app's actual, permanent look -- not a decorative skin
layered on top of something else. Every screen, including the SQL editor,
results table, and business brief, should read as part of the same
terminal environment.
```

### Step 1a — Avatar sprite: lock the style first

Send this before asking for the full set — get one sprite approved, then
reuse its exact style for everything after.

```text
Design one 8-bit pixel-art character sprite for a game called Metric Quest.
This is a base sprite for a customizable player character called "the
Recruit" -- a data scientist who gets pulled into a corporate mainframe.

Requirements:
- Simple front-facing idle pose, no animation needed.
- 8-bit/16-bit pixel-art style -- lean slightly toward 16-bit density so it
  reads clearly at small sizes in a web app, rather than the chunkiest
  NES-era look.
- Transparent background.
- Square canvas, consistent size (64x64px is a good default -- whatever you
  use, keep it consistent for every sprite that follows).
- Color palette: should feel at home in a dark CRT-terminal UI (deep navy
  #0a1024 background, teal #1fd3c4 and amber #ffd166 accents) without
  needing to match those colors exactly.
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
  (8-bit/16-bit density, dark CRT-terminal palette: deep navy #0a1024,
  teal #1fd3c4 and amber #ffd166 accents, playful not gritty).
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

*(Sectors 4-7 and 9 already have missions built — reuse this same prompt
shape for them next, pulling the visual theme from the table in §A4. None
of Sectors 1-9 have background art yet, so every sector transition
currently uses the text-only fallback from Prompt 9.)*

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
