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
| 1 | Revenue reconnaissance | The Ledger Vaults | filter, sort, limit, DISTINCT, text search, calculations, `BETWEEN`, `IN` | Bank-vault archive of glowing data ledgers on shelves | M1.1-M1.6 built |
| 2 | Executive scorecard | The Scoreboard Core | aggregation, `GROUP BY`, `HAVING`, `COUNT`, `MIN`/`MAX` | Control room with a large glowing dashboard, dials, rising totals | M2.1-M2.4 built |
| 3 | Connected customer evidence | The Relay Archives | joins | Record cabinets linked by glowing data-relay cables/tubes | M3.1-M3.4 built |
| 4 | Analyst workbench | The Workbench Foundry | subqueries, CTEs, temp tables | A forge/workshop where raw data is staged and reshaped | M4.1-M4.3 built |
| 5 | Time and operations | The Chronometer Wing | dates and times, date arithmetic | A clocktower-like wing full of gears and chronometers | M5.1-M5.3 built |
| 6 | Decision rules and data types | The Sorting Engine | `CASE`, casts | A mechanical facility with conveyor belts and branching chutes | M6.1-M6.2 built |
| 7 | Shared analytical assets | The Shared Vault | sets (`UNION`/`UNION ALL`/`INTERSECT`/`EXCEPT`), views | A communal library where shared "views" sit on illuminated pedestals | M7.1-M7.5 built |
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

- Each screen (Title, Home, Mission, Avatar Creator, Cutscene, Sector Transition) is laid
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

**Title screen (shipped 2026-08-11).** Reuses this same toolkit and existing
art rather than introducing a new visual language: the corridor-of-doors
background from the mainframe-pull beat, the same panel/button chrome, and
`cue-c-mainframe-overture` looping as the menu theme — closing the loop
`docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`'s music section flagged that track
as a title-screen candidate for. "Resume game"/"New game" gate the app on
first load; "New game" warns before overwriting existing progress.

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

### Step 1c — Fix: avatar sprite transparency defect (found 2026-08-09)

**Status (2026-08-10): 10 of 12 fixed and merged. 2 remain —
`recruit-broker.png` and `recruit-operator.png`.** An earlier pass
tonight wrongly cleared those two as "already fine" based on
`Image.getextrema()` alone returning a non-`255` alpha minimum. That check
is insufficient on its own: both files' alpha extrema are `(153, 255)`,
but a full per-pixel histogram shows only **256 of 72,192 pixels (0.4%)**
actually carry that `153` value — the other 99.6% are flatly opaque at
`255`, the same baked-checkerboard defect as the other 10, just with one
small incidental non-opaque patch that happened to move the *extrema*
without the image as a whole having real transparency. The corrected
verification method below checks the *proportion* of transparent pixels,
not just whether the minimum differs from `255`.

The 10 already-fixed sprites (analyst, archivist, auditor, cartographer,
consultant, curator, engineer, registrar, statistician, strategist) were
fully opaque with a checkerboard *pattern baked into the actual RGB
pixels* — a flattened transparency-preview grid, not real transparency —
and have been corrected. Use this prompt to get the remaining 2 fixed the
same way:

```text
2 sprites in the avatar set you generated earlier ("Recruit" character
sprites: broker, operator) still have a transparency export bug: instead
of a real alpha channel, the transparent areas were flattened into an
opaque checkerboard pattern (the standard "no background" preview grid
baked directly into the image pixels). The rest of the set (10 other
sprites) has already been corrected and matches the real-transparency
version you should match here.

Please re-export just these 2 sprites (broker, operator) with a genuine
alpha channel -- fully transparent (alpha = 0) in every area outside the
character, not a checkerboard fill. Keep everything else identical: same
pose, proportions, canvas size, pixel density, and color palette as what
you already delivered.

Export as individual PNG files with real alpha transparency, not
flattened against any background color or pattern.
```

Before wiring any re-delivered asset back in, verify the fix actually
landed rather than trusting how it looks in a preview pane — a checkerboard
*can* be a legitimate "no transparency" UI indicator that renders fine in
the design tool's own viewer while still being flattened into the actual
file, and a bare extrema check can itself be fooled by a single stray
non-opaque pixel (see the correction above). Check the actual proportion
of transparent pixels, not just the extrema:

```bash
python3 -c "
from PIL import Image
import collections
img = Image.open('PATH.png').convert('RGBA')
w, h = img.size
hist = collections.Counter(a for _,_,_,a in img.getdata())
transparent = sum(c for a, c in hist.items() if a < 200)
print(f'{100*transparent/(w*h):.1f}% transparent', hist.most_common(5))
"
```

A real character-on-transparent-background cutout should show a large
majority of pixels (typically 70-90%, depending on how much of the canvas
the character fills) at or near alpha `0` — compare `recruit-analyst.png`
(77% transparent) as a known-good reference. A result in the low single
digits, even if the extrema technically isn't a flat `255`, means the fix
did not land.

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

*(Sectors 4-7 and 9 already have missions built — Step 2b below reuses this
same prompt shape for them. None of Sectors 1-9 have background art yet, so
every sector transition currently uses the text-only fallback from
Prompt 9.)*

### Step 2b — Remaining sector background scenes (Sectors 4, 5, 6, 7, 9)

```text
Design 5 more background illustrations for "Metric Quest," continuing the
exact same set as before -- same wide-screen-backdrop format, same clear
open area in the lower-middle third for a character sprite, same 8-bit/16-bit
dark CRT-terminal palette (deep navy #0a1024, teal #1fd3c4 and amber #ffd166
accents), same "a distinct room inside a computer mainframe" feel, not a
literal office.

The 5 scenes:

1. "The Workbench Foundry" (Sector 4) -- a forge/workshop where raw data
   gets staged and reshaped, half-finished pieces smoldering on benches.
2. "The Chronometer Wing" (Sector 5) -- a clocktower-like wing full of
   gears and chronometers, dials mid-scramble.
3. "The Sorting Engine" (Sector 6) -- a mechanical facility with conveyor
   belts splitting into branching chutes.
4. "The Shared Vault" (Sector 7) -- a communal library where shared
   "views" sit glowing on illuminated pedestals.
5. "The Boardroom Core" (Sector 9, final boss) -- a grand boardroom turned
   battle arena: an impossibly long table, chairs replaced by screens.
   This is the climax location, so it can read a little more dramatic and
   high-stakes than the others while staying in the same pixel-art style
   and playful-retro tone (not horror).

Generate them as 5 separate images at the same resolution as the first 4,
so all 9 sector backgrounds are a consistent set.
```

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

### Step 3b — Sector 8/9 confrontation cinematic (§A8 Phase 2, requested 2026-08-09; placeholder art wired 2026-08-12)

Not commissioned yet, but **no longer blocking on nothing** — a full
8-panel placeholder set (composited from the existing calm/corrupted
sprites by `codex/mentor-system-character`) is wired in: a Sector 8
entrance beat plays ROGUE.exe's first direct appearance on entering the
sector, and a post-campaign finale beat plays its defeat after the last
mission. See `docs/BACKLOG.md`'s Design asset tracker for exactly where.
Sending this prompt now replaces real exports panel-for-panel — send
whenever a "real" cinematic upgrade is wanted:

```text
Design a short multi-panel confrontation sequence for Metric Quest, in the
same 8-bit/16-bit pixel art style and transparent-canvas format as the
ROGUE.exe illustrations and sector backgrounds you already generated.

Two moments, 3-4 panels each, visual-novel/slideshow style (single static
image per panel, shown in sequence with text underneath -- not animation):

1. "ROGUE.exe's first direct appearance" (Sector 8, The Inner Sanctum) --
   the player enters ROGUE.exe's own territory for the first time and it
   speaks directly for the first time. Escalate from the "calm/smug"
   ROGUE.exe pose toward something more confrontational -- more of the
   screen filled with its glitching presence, closer/larger in frame --
   without becoming frightening or humanoid. Same campy 8-bit-villain tone
   as the existing illustrations, not horror.
2. "The final confrontation" (Sector 9, The Boardroom Core) -- the climax,
   set in the boardroom-turned-battle-arena background already generated
   for this sector. ROGUE.exe at its most chaotic/corrupted, then breaking
   down/defeated in the final panel as the player wins.

Reuse the existing ROGUE.exe character exactly (same design, same two
states already delivered) -- these panels compose and re-stage that
character rather than redesigning it. Keep every panel on a transparent
background, consistent canvas size, same palette as the rest of the set.

Export each panel as an individual PNG file.
```

### Step 3c — "Good AI" mentor character (art delivered and wired 2026-08-12)

This is the friendly counterpart to ROGUE.exe that
`docs/GAME_DESIGN_BRIEF.md` §A3's "optional, later" mentor/sysadmin voice
reserves space for. **Status: done, not pending.** A matched two-state
pair (`mentor-idle.png`/`mentor-active.png`) matching this exact prompt's
spec was actually committed 2026-08-10 (`be517b6`, "fix: refresh feedback
and mentor visual assets") but never wired into any component — found
and wired into `src/components/MentorSprite.tsx` on 2026-08-12 on branch
`claude/learn-sql-mode`, replacing the placeholder glyph that shipped
with the character's first narrative use, **Learn SQL Mode**
(`docs/BACKLOG.md` item 13 Part B1, built 2026-08-11/12), which also
gave the character its first-draft working name, **ECHO** (not locked
in — one string to edit in `src/content/beats.ts` and
`src/content/primers.ts` if you want it changed).

It's also still the character `docs/BACKLOG.md` item 3 (the Monet.gg-
connected in-game tutor) reserves this same slot for, should that ever
get named/fronted by a character too — using this art there **does not
approve or resume building item 3**, which stays gated per its own
status line.

The prompt below is kept as a record of what was actually requested and
delivered, and stays reusable if a revised or alternate version is ever
wanted — no need to send it again for the current pair.

```text
Design 1-2 illustrations of a friendly system-mentor character for Metric
Quest, a companion piece to "ROGUE.exe" (the game's antagonist, which you
may have already designed for me -- a glitchy, corrupted, non-humanoid
terminal/CRT-monitor face). This new character is ROGUE.exe's opposite:
an uncorrupted, helpful presence inside the same mainframe -- think of it
as "what ROGUE.exe should have been" before it went rogue.

Like ROGUE.exe, it should NOT be humanoid or robotic -- it should read as
"a clean, orderly system," the same way ROGUE.exe reads as "a broken
one." Some directions to consider: a calm, steady terminal/CRT face with
crisp uncorrupted lines (vs. ROGUE.exe's fragmented glitch), a glowing
steady cursor or waveform, or a simple geometric "system icon" shape that
feels trustworthy and orderly by contrast. I don't have a name locked in
yet, so don't bake specific text/labels into the art.

Two states, same character (parallel to ROGUE.exe's calm/corrupted pair):
1. "Idle/attentive" -- steady, calm, present but not intrusive.
2. "Active/helping" -- a brighter or more animated-feeling variant used
   when it's actively assisting, without becoming showy or distracting.

Style: same 8-bit/16-bit pixel art as the rest of the set, transparent
background, consistent canvas size. Palette: lean toward the terminal
system's teal (#1fd3c4) and the app's success/positive tone rather than
ROGUE.exe's corrupted-glitch coloring -- it should read as calm and
trustworthy at a glance, distinct from ROGUE.exe even in a thumbnail.
Tone: friendly, approachable, playful retro-arcade -- a helpful in-game
presence, not a mascot or a person.
```

### Step 4 — UI chrome kit (optional, do this last if at all)

```text
Design a small reusable pixel-art UI chrome kit for Metric Quest:
- One panel border/frame graphic.
- One button frame in 4 states: idle, hover, active, disabled.
- A small icon set: a "points" icon, a "badge" icon, a "progress" icon.
- Two small feedback-state icons for the mission results panel: a
  "corruption detected" icon (glitchy, red/amber, shown when a query is
  wrong) and a "signal restored" icon (clean, teal, shown when a query is
  right). Think small status badges, not full illustrations -- roughly
  icon-sized, meant to sit right next to a line of feedback text.

Style: consistent with the sprite/background pixel art already generated.
```

This one is a nice-to-have — CSS borders/shapes already approximate all of
this well enough to ship without it. **Update (2026-08-08):** most of this
kit has since been delivered and wired in — panel border, button frame
(idle/active/disabled; hover is CSS `brightness`+`translateY` on the idle
art instead, see `docs/BACKLOG.md`'s asset tracker), and the points/badge/
progress/**signal-restored** icons are all live. Only the "corruption
detected" icon came back illegible and is still the original CSS
placeholder (a glitching red square) — see Step 4a below for a focused
re-request rather than resending this whole kit.

### Step 4a — Fix: `icon-corruption.png` legibility (requested 2026-08-10)

**Status: delivered and wired in (2026-08-10)** — see `docs/BACKLOG.md`'s
Design asset tracker. Kept below for the prompt-history record; nothing
left to send here.

The corruption-detected icon from the Step 4 kit came back
illegible — it reads as generic static/noise rather than communicating
"corruption" the way the delivered "signal restored" icon clearly reads
as "restored." This is a narrow re-request for just that one icon, not
the whole kit.

```text
The "corruption detected" icon from the small feedback-icon set I asked
for earlier didn't come through legibly -- it reads as generic static or
noise rather than clearly communicating "corruption" or "something is
wrong." Please redesign just that one icon.

Context: it's the visual counterpart to the "signal restored" icon you
already delivered (clean, teal, checkmark/pulse-ring feeling, shown next
to positive feedback text when a player's query is correct). This icon is
its opposite -- shown next to feedback text when a player's query is
wrong. It needs to read clearly as "corrupted/broken/wrong" at a glance,
at small size (roughly icon-sized, sitting right next to a line of body
text, not a full illustration).

Some directions to consider: a fractured/glitching square or signal
icon, a broken/jagged shape breaking apart, static interference lines
across a simple glyph -- something with clear silhouette and readable
contrast at small sizes, not fine detail that disappears when scaled
down.

Style: same 8-bit/16-bit pixel art as the rest of the UI kit. Color:
red/amber, matching the app's existing error-state color
(#ff8a80) rather than the teal/positive palette used for "signal
restored." Transparent background, same square canvas size as the other
small icons in the kit (128x128px, matching points/badge/progress/
signal-restored).
```

### Before Step 8 — one already-drafted prompt still waiting to be sent

- **Step 3b** (Sector 8/9 confrontation cinematic) — ready to copy-paste as-is,
  still not sent. **Update (2026-08-12):** all 8 composited placeholder
  panels `codex/mentor-system-character` delivered are now fully wired —
  `rogue-entrance-01..04` drive a new Sector 8 entrance beat and
  `rogue-final-01..04` drive a new post-campaign finale beat (see
  `docs/BACKLOG.md`'s Design asset tracker for exactly where). Sending
  Step 3b now would replace all 8 placeholders with real exports, not
  start from nothing.
- ~~Step 3c~~ ("Good AI" mentor character) — **done, see Step 3c below.**
  Real art for both states landed and got wired 2026-08-12; no prompt left
  to send here.

### Step 8 — ROGUE.exe idle/escalation animation frame sheet (§A8 Phase 3)

Unblocks the animation described in §A8 Phase 3. `src/styles.css` already
has CSS-only jitter placeholders (`rogue-glitch`, `rogue-boss-glitch`) sitting
on the single static `corrupted` pose — this replaces that placeholder with
a real frame cycle once delivered, no CSS rewrite needed beyond swapping a
background-position/frame-step animation in for the current transform jitter.

```text
Continuing the ROGUE.exe character you already designed (the glitchy,
fragmented, non-humanoid terminal/CRT-monitor face -- calm and corrupted
states already delivered), I'd like a short animation frame sheet for its
"corrupted" state, reusing that exact design.

Two short loops, same character, same canvas size and palette as the
existing corrupted illustration:
1. "Idle glitch" -- 4-6 frames of a subtle, continuous glitch-jitter loop
   (the kind of thing that plays constantly while ROGUE.exe is on screen,
   not a big event).
2. "Boss escalation" -- 4-6 frames of the same character breaking down
   further/more chaotically, for the moment it's confronted directly and
   losing (used bigger and closer to camera than the idle loop).

Export as a single sprite sheet (frames laid out in a horizontal row) for
each loop, or as individually numbered frame files if that's easier on
your end -- whichever makes the frame order unambiguous. Keep every frame
on the same transparent canvas size as the existing rogue-corrupted
illustration so it drops into the same on-screen footprint.
```

### Step 9 — Recruit avatar run-cycle + "pulled in" frame sheet (§A8 Phase 3)

Unblocks the other half of §A8 Phase 3. Today the opening cutscene fakes
motion on the single static avatar sprite via CSS transform tricks
(`cutscene-avatar-run`, `cutscene-avatar-pulled` in `src/styles.css`) — this
is the frame-sheet version of that. Scoped to one base sprite first (style-
lock, same reasoning as Step 1a) rather than all 12 recolors at once.

```text
Continuing the "Recruit" player-character sprite set you designed (the
customizable base sprites with color/outfit recolors), I'd like a short
animation frame sheet using the "Analyst" base sprite specifically, as a
style test before we decide whether to extend this to the other base
sprites too.

Two short sequences, same pose proportions, canvas size, and pixel density
as the existing Analyst sprite:
1. "Run" -- 4-6 frames of a simple side-on or 3/4-view running cycle.
2. "Pulled in" -- 4-6 frames of the character being yanked/spun/dissolving
   into a bright teal (#1fd3c4) vortex, ending mostly consumed by light
   -- this plays once, at the moment the character is pulled from the
   real world into the mainframe.

Export as a sprite sheet or individually numbered frames, transparent
background, same canvas size as the existing base sprite. Once this style
is approved, let me know what it'd take to apply the same two sequences to
the other 11 recolors -- I may not need all of them animated, just want to
know the lift before deciding.
```

### Step 10 — Particle/VFX overlay texture pack

New, not part of any earlier step. These are small tileable/loopable
textures meant to sit as CSS overlay layers (blend-mode, opacity, or
position-animated) on top of existing art — not full illustrations — for
moments the current CSS-only effects (glitch/flicker/scanline) don't quite
sell on their own: the "floor gives way to static" cutscene panel, a
corruption-in-progress decal for sectors under active attack, and a spark
burst for the "pulled in" zap moment.

```text
Design a small set of overlay textures/effects for "Metric Quest," meant to
be layered on top of existing scene art in a web app via CSS (opacity,
blend modes, or simple position animation) -- not full illustrations, just
effect textures. Same 8-bit/16-bit pixel-art style and palette as the rest
of the set (deep navy #0a1024, teal #1fd3c4, amber #ffd166, plus the
existing error color #ff8a80 where noted below).

Four textures:
1. "Static/noise" -- a tileable field of pixel-block static/interference,
   teal-tinted, usable at partial opacity over a scene to suggest a screen
   losing signal.
2. "Digital rain/data shatter" -- vertical streaks of falling
   teal/amber pixel fragments, transparent background, tileable
   horizontally, suggesting a screen or object breaking apart into data.
3. "Spark/ember burst" -- a single burst/explosion of small teal and amber
   pixel particles radiating outward, transparent background, sized to
   composite behind or around a character sprite at the moment of a sudden
   event (e.g. being pulled through a portal).
4. "Corruption crack decal" -- a jagged, glitchy crack/fracture pattern in
   the error color (#ff8a80), transparent background, meant to overlay
   part of a scene or panel to signal "this is actively corrupted right
   now," distinct from the character-facing icon-corruption.png you
   already delivered.

Export each as an individual transparent PNG. Where a texture is meant to
tile or loop (1, 2), please say so explicitly and make the edges seamless.
```

### Step 11 — Mission-workspace region icon set (Learn SQL Mode + general UI)

Small, icon-sized (not full illustrations) — extends the Step 4 UI chrome
kit rather than replacing it. Useful for the first-run terminal orientation
(`TutorialMissionPreview.tsx`, currently CSS-only with no icons at all) and
any future per-region visual anchor in the main mission workspace.

```text
Extending the small UI icon set you designed earlier (points, badge,
progress, signal-restored, corruption-detected icons -- 128x128px,
transparent, same 8-bit/16-bit pixel style), please add one more small set:
simple glyph icons representing the parts of a SQL mission workspace, for
use as a visual anchor next to each region's label, not as a full
illustration.

Six icons, same canvas size and style as the existing kit:
1. "Brief" -- a short document/scroll glyph.
2. "Schema" -- a small connected-tables/grid glyph.
3. "Editor" -- a cursor/prompt glyph (">_" or similar).
4. "Run" -- a play/execute glyph.
5. "Feedback" -- a small speech-bubble or status-pulse glyph.
6. "Help/hint" -- a lightbulb or question-mark glyph.

Keep the set visually consistent with each other (same line weight,
same "read as one family" feeling as the existing points/badge/progress
icons), teal (#1fd3c4) as the default state color unless a specific one
calls for the amber/error accents already established elsewhere in the kit.
```

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
