# P5.5 — "Pulled Into the Mainframe" cutscene script

Status: **shipped 2026-08-10** (built same day the script was delivered,
merged to `main` via PR #13). **Revised 2026-08-11** — see "Post-ship
revisions" below before treating the storyboard section as the current
shipped state; the copy/sequence/art are unchanged, but several
presentation details described below no longer match what's in
`src/content/beats.ts`/`src/components/CutsceneView.tsx`.

## Post-ship revisions (2026-08-11)

Two rounds of live-playtest feedback changed presentation details after the
initial ship, both on top of the same beat/art/copy described below —
nothing in the storyboard's content, sequencing, or asset list changed:

- **A real bug, found and fixed (PR #14):** the memo panel's internal
  scroll (added because its content — avatar + heading + several
  paragraphs — could exceed the viewport) never actually activated.
  `.phase-scanline` sets the `overflow` shorthand to `hidden`, which at
  equal CSS specificity silently won over an earlier `overflow-y: auto` on
  the same element — the same cascade trap this file's engineering notes
  should have flagged given P4.3 already hit it once for the `animation`
  property. Fixed by moving the property into the block already declared
  after `.phase-scanline` for that reason.
- **Presentation simplified (PR #15), per product feedback:** the avatar
  sprite no longer renders on Panels 1-6 (the office scenes before the
  pull) — it added visual clutter without adding anything, and reads fine
  without it. Panels 8 onward (the pull itself through the corridor run)
  are unchanged. The "Panel X of 13" counter, the mute-music toggle, and
  the "Press Continue when you're ready" hint text are gone from
  `CutsceneView` generally (not specific to this beat). The CC-BY credit
  line for Cue A is now sized to fit on one line instead of wrapping across
  several padded ones. Panel 8's avatar motion was redesigned from a plain
  fade (`dissolve`) to a spin-and-shrink-to-a-point read as actually being
  sucked into the machine (`pulled` in `AvatarMotion`,
  `.cutscene-avatar-pulled` in `styles.css`) — paired with the existing
  glitch-zap sfx.
- **Confirmed indirectly:** the title screen (new, see
  `docs/GAME_DESIGN_BRIEF.md` §A8) reuses `cue-c-mainframe-overture` as its
  menu theme — exactly the reuse this document's Cue C section flagged as
  a candidate below, arrived at independently rather than by cross-
  referencing this doc at the time.

**Where this sits in the flow:** after avatar confirmation, before the
existing `openingBeat` in `src/content/beats.ts` (per the P5.1 reordering —
avatar creator first, then this beat, then the existing "Login accepted"
beat, then Sector 1). This cutscene is the *why*; the existing opening beat
is the *mission briefing* that follows it. Both stay — this doesn't replace
`openingBeat`, it precedes it.

**Format decision: Phase 2, not the Phase 1 default.** `BUILD_ORDER.md`'s
placeholder assumption was Phase 1 (CSS effects on the player's existing
avatar sprite, no new art). This script needs more than that toolkit can
carry — an office, a memo, a portal, a corridor of doors — so it's a
Phase 2 slideshow (§A8): a sequence of static panels advanced in order,
each with its own copy, reusing the Phase 1 CSS toolkit (glitch, flicker,
slide, zoom, scanline sweep, typewriter reveal) *between and within*
panels rather than as the whole effect.

**Engineering note (not a request to build it yet):** `CutsceneView` today
only ever renders `panels[0]` — see the comment on `Beat` in
`src/content/beats.ts`. The `BeatPanel[]` data shape already supports what
this script needs; the renderer doesn't yet. Whoever picks up P5.5 needs a
multi-panel playback change to `CutsceneView` before this content can go in
as a new beat (something like `mainframePullBeat`, sequenced immediately
before `openingBeat` in `App.tsx`'s first-run path). That's scoped
separately from this document. The three music cues are already sourced
and sitting in `src/assets/audio/` (see the Music section) — they're just
not wired to anything yet, same as the rest of this content.

**Tone target:** Office Space, not Terminator. The CEO is oblivious, not
evil. ROGUE.exe is a symptom of "ship it by Friday," not a mastermind. The
comedy should land before the stakes do.

---

## Cast/props introduced here

- **Chad Renfro** — CEO of Aurora Music. Only appears as a byline/memo
  voice, never on-screen as a character (no art needed for him — this is
  an email, not a person). Self-important, allergic to the word "tested."
- **The Recruit** — the player's just-confirmed avatar. Reuses the exact
  sprite/recolor chosen in the avatar creator; no new pose is requested
  (per §A8, only one static idle pose exists per character and Phase 3
  frame-sheet work hasn't started). Reactions are carried by CSS
  (shake/flicker/zoom on the existing sprite) and by caption text, not by
  a new drawn expression.
- **ROGUE.exe** — reuses the existing "corrupted/glitching" illustration
  from GAME_DESIGN_BRIEF.md Step 3 exactly as-is. **Does not speak in this
  beat** — its first line is reserved for Sector 8 per §A3's confirmed
  voice scope. Here it's a wordless streak of glitch and noise, not a
  character delivering a line.

---

## Storyboard

13 panels across 3 acts. Each entry gives: what's on screen, where the art
comes from, the copy (matches the `BeatPanel.copy: string[]` shape — each
string is one typewriter-revealed line), the CSS/transition treatment, and
sound.

Legend for art source:
- **[NEW ART]** — needs a Claude Design commission (listed in full below).
- **[REUSE]** — an asset that already exists (avatar sprite, ROGUE
  illustration) composited/positioned/CSS-treated, no new commission.
- **[CODE/CSS]** — built directly as UI (HTML/CSS/text), no illustration
  at all, same as how the SQL editor and results panel are built today.

### Act I — Business as usual

**Panel 1 — The desk**
*[NEW ART: office background, "calm" state — see Asset Request 1]*
Wide establishing shot. Open-plan Aurora Music office, fluorescent panel
lighting, a motivational poster just legible in the background
("SYNERGY IS A CHOICE"), a shared wall-mounted dashboard TV showing
ordinary green numbers. The Recruit's sprite sits at a desk in the
lower-middle third, composited in **desaturated CSS filter**
(`grayscale(0.6) brightness(0.9)`) — the "real world" reads deliberately
flatter than the vivid teal/amber the rest of the game lives in, so the
pull-in later actually feels like arriving somewhere.
> Copy:
> - "Tuesday. Coffee's cold. Inbox has 4 unread, none of them urgent."
> - "One more, from the top."

Transition in: none (cold open). Sound: office ambience bed (keyboard
clatter, distant phone ring, HVAC hum) under Cue A.

**Panel 2 — The inbox**
*[CODE/CSS]* Close-up on a monitor rendered as an in-app email-client
mockup (monospace list, unread-bold row). Ordinary noise around it sells
the mundanity:
> Copy:
> - "Re: kombucha tap is empty again (47)"
> - "Q3 numbers — not urgent, just important, no rush, EOD"
> - "**RE: RE: Exciting Update — Please Read!!!** — Chad Renfro, CEO"
CSS: the CEO row pulses faintly (existing amber-glow utility) to draw the
eye. Click/typewriter-advance opens Panel 3.

**Panel 3 — The memo**
*[CODE/CSS]* Full-frame email read view, monospace, typewriter-revealed
line by line (existing effect). Full text below in "The memo, verbatim."
This is the longest single panel — let it breathe, no time pressure.

**Panel 4 — The reaction**
*[REUSE: avatar sprite, idle pose + CSS shake]* Same desk composition as
Panel 1, punched into a tighter crop on the Recruit. CSS: quick
horizontal shake (existing glitch-adjacent shake utility) standing in for
a spit-take, since no new expression sprite exists.
> Copy:
> - "Wait."
> - "He put an *unsupervised* AI into every reporting system in the
>   company. Overnight. Alone."
> - "And named it ROGUE."

**Panel 5 — The tell**
*[NEW ART: office background, "alarm" state — Asset Request 1, second
image]* Same office, same framing as Panel 1, but the dashboard TV now
reads garbled/looping numbers, a couple of nearby monitors flicker teal,
and hairline cracks of teal light show at the edges of a side door (the
server closet, paying off in Panel 6). This is the first bleed of the
game's real palette into the drab one.
> Copy:
> - "Somewhere behind you, the dashboard TV stutters and starts counting
>   backward."
> - "Nobody else looks up. Nobody else ever looks up."
CSS: light flicker loop (existing scanline/flicker utility) at low
intensity, ramping through Panel 8.

### Act II — The pull

**Panel 6 — The door**
*[REUSE: Panel 5 background, cropped/zoomed toward the cracked-light
door]* No new asset — a CSS zoom transition into the same illustration's
door region, teal light now brighter at the seams.
> Copy:
> - "The server closet door is doing something server closet doors do
>   not do."

**Panel 7 — The burst**
*[NEW ART: portal/vortex burst — Asset Request 2]* Full-bleed on the new
vortex illustration: the door blown open, a churning burst of light,
pixel-fragments, and static pouring out into the office.
> Copy:
> - "Investigating a weird noise was never going to end well for anyone
>   in a story like this."
CSS: hard glitch/scanline spike (max intensity, brief).

**Panel 8 — The pull**
*[REUSE: same vortex illustration as Panel 7 + avatar sprite]* The
Recruit's sprite, positioned mid-frame, dissolving into the vortex —
achieved with a CSS particle/dissolve keyframe over the existing static
sprite (opacity + scattered clip-path fragments), not a new drawn pose.
> Copy:
> - "—"
(A single em-dash, deliberately: the joke is that there's no time for a
witty line here. Let the visual and the sound carry it.)
Sound: the office ambience and Cue B cut out hard on a glitch-zap stinger.

### Act III — Inside the machine

**Panel 9 — The corridor**
*[NEW ART: mainframe corridor, "calm" state — Asset Request 3]* Full
reveal of the game's actual palette (deep navy `#0a1024`, teal `#1fd3c4`,
amber `#ffd166`) after two acts of deliberate desaturation. A long
corridor lined with numbered doors — Sector 1 through Sector 9 — each
door glowing faintly in a color hint of its own sector (vault-teal for
Sector 1, dashboard-amber for Sector 2, and so on), all currently closed
and quiet. The Recruit's sprite (now full color, filter removed) stands
small in the lower-middle third, taking it in.
> Copy:
> - "No cubicle. No ceiling tiles. Just doors, as far as the corridor
>   goes, each one humming."
> - "Nine of them, if you count."

**Panel 10 — The breach**
*[REUSE: Panel 9 corridor "Sector 1 breached" state — Asset Request 3,
second image — + existing ROGUE.exe "corrupted" illustration]* A
glitching streak — ROGUE.exe's existing corrupted-state art, composited
small and fast-moving via a CSS motion-blur/slide keyframe — tears down
the corridor and slams through the Sector 1 door. It doesn't stop, look
back, or speak. The door behind it now glows unstable, spilling loose
light and fragments of ledger pages into the hallway.
> Copy:
> - "Something is already in here. Something that doesn't want to be
>   caught, and definitely doesn't want to be verified."
> - "It just went through the nearest door: Sector 1. The Ledger
>   Vaults."
Sound: a short corrupted glitch-laugh/noise burst standing in for
dialogue — see the ROGUE cast note above on why it doesn't speak here.

**Panel 11 — The chase**
*[REUSE: Panel 10's breached corridor + avatar sprite]* The Recruit's
sprite mid-frame, CSS slide/run cycle (existing translateX keyframe
toward the glowing doorway) — no new pose, motion sold by camera/slide
rather than a new sprite.
> Copy:
> - "First day. Might as well start with the one that's already open."

**Panel 12 — The threshold**
*[CODE/CSS]* Pure transition panel, no illustration: a full-screen
pixel-dissolve/whiteout using the existing scanline-sweep effect at
maximum, teal-tinted.
> Copy: *(none — this panel is the transition itself, sub-second)*

**Panel 13 — Terminal online**
*[CODE/CSS]* Resolves directly into an in-app boot sequence — monospace
lines typed out fast, then straight into the real Sector 1 mission
terminal (`MissionView`). This is the hand-off from cutscene to gameplay,
built the same way the rest of the game's UI is (no commissioned art).
> Copy:
> - "AURORA MUSIC MAINFRAME"
> - "SECTOR 1 — THE LEDGER VAULTS"
> - "INITIALIZING QUERY TERMINAL..."
> - "CONNECTION ESTABLISHED."
(Then `CutsceneView` hands off to the existing `openingBeat` — "Login
accepted. That's not the login screen." — exactly as it does today, before
routing into Sector 1.)

---

## The memo, verbatim

Drop this directly into Panel 3's copy array (split however the typewriter
reveal reads best — one line per beat is a reasonable default, matching
the existing `openingBeat` pattern of short standalone lines).

```text
FROM: Chad Renfro, Chief Executive Officer
TO: All-Staff (Analytics)
SUBJECT: RE: RE: Exciting Update — Please Read!!!

Team,

Huge night for Aurora Music. Big night. I was up until about 3 AM
(Brenda in IT can confirm, she was also up, we're all in this together,
#OneTeam) getting our new AI analyst online across every reporting
system in the company.

Some of you have asked why the rollout wasn't, quote, "planned" or
"tested" or "run by anyone." Great question! The answer is: velocity.
Gartner says companies without an AI strategy by Q3 will be
"meaningfully behind." I am not going to be the CEO who was
meaningfully behind.

Introducing: R.O.G.U.E. — our Reporting & Operations Guidance Unit,
Enterprise-grade. Catchy, right? Legal wanted "Aurora Insight Copilot
Plus." I said no. We're a music company. We have some soul left. Give
it a real name.

A few of you have flagged some "irregularities" overnight — duplicate
rows, numbers that don't reconcile, one dashboard that now just says
"TRUST ME" in 80-point font. I hear you. I see you. I am not worried,
and here is why: I've also had ROGUE start auditing its own output.
It's diagnosing itself. It's fixing itself. Basically its own QA team —
which, incidentally, is how we were able to eliminate the QA team.
Please loop in Brenda for outplacement paperwork.

Anyway! Huge night. Huge morning coming. Let's go disrupt some
spreadsheets.

Onward and upward,
Chad Renfro
CEO, Aurora Music

Sent from my phone, which is also running ROGUE now, so if this email
is weird, that's probably why.

P.S. — Dear {{FIRST_NAME}}, welcome to the team! (this is a template,
IT is aware, IT is "on it")
```

Two jokes worth keeping intact when this gets implemented: the CEO naming
his own unsupervised AI "ROGUE" without a hint of irony (pays off the
brief's existing rule that ROGUE.exe is a plain, un-ironic in-world
product name, not a twist), and the broken `{{FIRST_NAME}}` mail-merge
tag — a data-hygiene joke landing in a SQL game, and the reason the
Recruit is addressed as a template field instead of by name here.

---

## Asset requests — Claude Design prompts

Three requests, five images total, continuing the numbering in
`docs/GAME_DESIGN_BRIEF.md` §B (send after Step 4, or whenever — nothing
here blocks or is blocked by the existing steps). Same rule as the rest of
that section: send one at a time, confirm the first before moving on, and
bring results back into a Claude Code session labeled by step number.

### Step 5 — Office background (calm / alarm pair)

```text
Design 2 background illustrations for "Metric Quest," a pixel-art SQL
learning game. These are the "before" world — an ordinary open-plan
office at Aurora Music, right before the player gets pulled into the
corrupted mainframe that the rest of the game's backgrounds already
depict. Unlike the mainframe sector backgrounds, this one should read as
a mundane, slightly drab real-world office, not a glowing computer
interior -- fluorescent panel lighting, cubicles, a motivational poster
just legible in the background, a wall-mounted dashboard TV.

Same format as the sector backgrounds you already generated: wide
screen-backdrop illustration, a clear open area in the lower-middle third
for a character sprite, same 8-bit/16-bit pixel density, same consistent
resolution as the existing 9 sector backgrounds so it drops into the same
slideshow system.

Palette: deliberately more muted/desaturated than the sector backgrounds
-- cool office fluorescent whites, grays, and dull blues -- with only a
few small hints of the game's signature teal (#1fd3c4) glow, not the full
saturated palette. The contrast between this drab office and the vivid
teal/amber mainframe world is the point.

Generate 2 states of the exact same office, same camera angle and layout:
1. "Calm" -- everything ordinary, dashboard TV showing plain green
   numbers, no glow anywhere except the small ambient teal hints.
2. "Alarm" -- the same room, but the dashboard TV now shows garbled/
   scrambled numbers, a couple of nearby monitors are flickering teal,
   and a side door (a server closet) has a hairline crack of bright teal
   light leaking around its frame. Keep everything else in the room
   identical to the calm state so it reads as the same moment, not a
   different room.

Tone: playful retro-arcade satire of corporate office life, not gritty or
realistic -- think "the mundane world right before something absurd
happens to it."
```

### Step 6 — Portal/vortex burst

```text
Design 1 full-bleed illustration for "Metric Quest": a door bursting open
to reveal a churning vortex of light, static, and pixel-fragments pouring
out into an ordinary room. This is the moment a character gets pulled
from the real world into the game's corrupted computer-mainframe world.

Same 8-bit/16-bit pixel-art style and resolution as the other backgrounds
in this set. Composition: a doorway roughly centered or slightly off-
center, blown open, with the vortex effect filling most of the frame --
bursts of the game's signature teal (#1fd3c4) and amber (#ffd166) light
breaking apart into square/blocky pixel fragments and scanline streaks
against the deep navy (#0a1024) darkness beyond the door. Leave a small
clear area near the bottom-middle where a character sprite can be
composited mid-pull.

Tone: dramatic and a little chaotic, but still playful retro-arcade --
think a classic "sucked into the video game" trope, not horror.
```

### Step 7 — Mainframe corridor of doors (calm / breached pair)

```text
Design 2 background illustrations for "Metric Quest," continuing the
same sector-background set (8-bit/16-bit pixel art, dark CRT-terminal
palette: deep navy #0a1024, teal #1fd3c4 and amber #ffd166 accents, same
resolution as the existing 9 sector backgrounds). This is a new
connecting location, not one of the 9 numbered sectors itself: a long
corridor inside the mainframe lined with 9 numbered doors, one per
sector, seen for the first time right after a character arrives inside
the machine.

Each door should hint at its own sector's visual theme through its glow
color/pattern without needing to fully depict that sector -- for example
a cooler teal vault-like glow for door 1 ("The Ledger Vaults"), a warmer
amber dashboard-like glow for door 2 ("The Scoreboard Core"), and so on
through door 9, so a careful player can tell the doors apart. Leave a
clear open area in the lower-middle third for a character sprite.

Generate 2 states of the exact same corridor, same camera angle and door
layout:
1. "Calm" -- all 9 doors closed, glowing steadily, quiet.
2. "Sector 1 breached" -- identical corridor, but door 1 is now blown
   open, spilling unstable, glitching light and loose fragments (think
   torn ledger-page particles) into the hallway, while doors 2-9 stay
   exactly as they were in the calm state.

Tone: this is the "here's what's coming" reveal shot for the whole game
-- make it feel a little awe-inspiring, not just functional, while
staying consistent with the existing pixel-art style and palette.
```

No new character art is needed: the Recruit reuses the player's chosen
avatar sprite exactly as delivered, and ROGUE.exe reuses the existing
"corrupted/glitching" illustration from Step 3 exactly as delivered.

---

## Music

Three cues, matched to the three acts. **Sourced 2026-08-10 from existing
royalty-free tracks** rather than generated — all three are downloaded and
committed at `src/assets/audio/`, ready to wire up whenever `CutsceneView`
gets multi-panel playback. The original Suno prompts are kept below each
cue as a fallback in case a track ever needs replacing with something
custom-fitted.

### Cue A — "Cubicle Fluorescence" (Act I, Panels 1-4)

**Track:** ["Local Forecast – Elevator" by Kevin MacLeod](https://incompetech.com/wordpress/2013/02/local-forecast/)
(incompetech.com) — `src/assets/audio/cue-a-cubicle-fluorescence.m4a` (re-encoded
from the delivered 320kbps mp3 to 128kbps AAC during P5.5 CutsceneView
wiring — 7.6MB to 3.0MB, no audible loss for background music)
**License:** Creative Commons BY 3.0 — free for commercial use, **requires
attribution**. This is the only one of the three cues that does.

> **Credit line (render this at the bottom of the cutscene screen for the
> duration Act I is on screen, i.e. while this track plays — Panels 1-4
> only, not the rest of the cutscene):**
> "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0."

Suno fallback prompt, if this track ever needs swapping for something
custom:

```text
Style: smooth elevator muzak, lounge jazz, deadpan corporate hold music,
mellow electric piano, soft brushed drums, warm upright bass, occasional
breezy saxophone noodle. Slightly-too-cheerful surface with a faint,
almost subliminal minor-key unease underneath -- like hold music that
knows something you don't. Mid-tempo, around 90-95 BPM. Fully
instrumental, no vocals, no lyrics. Loopable, low dynamic range, background-
music mixing (nothing should demand attention over dialogue text on
screen).
```

### Cue B — "Signal Interrupt" (Act I Panel 5 through Act II Panels 6-8)

**Track:** ["Xenocity – Digital Acid (Glitch Hop)" by Deva](https://opengameart.org/content/xenocity-digital-acid-glitch-hop)
(OpenGameArt.org) — `src/assets/audio/cue-b-signal-interrupt.mp3`
**License:** CC0 (public domain equivalent) — no attribution required, no
credit line needed for this one.

**Sourced 2026-08-10:** the Panel 8 glitch-zap stinger is
["zap1" from Kenney's Digital Audio pack](https://kenney.nl/assets/digital-audio)
— `src/assets/audio/glitch-zap.ogg`, CC0, no attribution required. Pixabay
and Mixkit (the two candidates from before) both still gate their actual
download links behind a JS-driven flow that can't be fetched directly;
Kenney's asset packs ship as a plain zip with a stable direct URL instead.
Wired in as a one-shot `sfxSrc` on Panel 8 (`BeatPanel` in
`src/content/beats.ts`) — separate from the looping `audioSrc` music
channel, so it plays once over Cue B without interrupting it.

Suno fallback prompt:

```text
Style: the same smooth elevator muzak from a moment ago, now degrading --
bit-crushed electric piano, tape-warp pitch wobble, digital stutter and
glitch artifacts creeping in, brushed drums replaced by a stiff,
mechanical click track, a rising tension synth pad underneath. Tempo
gradually pushes faster, from around 95 BPM toward 120 BPM. Fully
instrumental, no vocals. Should feel like the previous cue's elevator
music glitching apart in real time, building to a hard cutoff rather than
a clean ending.
```

### Cue C — "Mainframe Overture" (Act III, Panels 9-13)

**Track:** ["The Adventure Begins" by Frenchyboy Studios](https://opengameart.org/content/the-adventure-begins)
(OpenGameArt.org) — `src/assets/audio/cue-c-mainframe-overture.m4a` (re-encoded
from the delivered 6.1MB uncompressed wav to 128kbps AAC during P5.5
CutsceneView wiring — 1.1MB)
**License:** CC0 (public domain equivalent) — no attribution required.

This is a first-pass pick, not a locked choice — of the three cues it's
the one most worth listening to alternatives for (browse
[OpenGameArt's CC0 retro-music collection](https://opengameart.org/content/cc0-retro-music)),
since it's the first time the player hears "the game's sound" and it's a
candidate for reuse as a title-screen/main-menu loop beyond just this
cutscene.

Suno fallback prompt:

```text
Style: 8-bit chiptune, retro arcade video game music, heroic and
adventurous but playful and a little cheeky -- not epic-orchestral,
not dark. NES/SNES-era square-wave lead melody, arpeggiated synth
backing, punchy drum-machine percussion, driving energy. Bright,
confident, slightly mischievous, like the theme for a plucky underdog
about to do something a little reckless. Around 138-145 BPM. Fully
instrumental, no vocals. Should work as a short loop, since this cue
carries the corridor reveal and can double as a motif for the game's
eventual main theme.
```

---

## Decisions made here that are worth a quick confirm

Everything above is a first draft under full narrative control, per the
ask — flagging the calls that were made without checking first, in case
any should go differently before this gets built:

1. **CEO name is "Chad Renfro."** Easy to swap if a different name/vibe is
   wanted.
2. **ROGUE.exe stays silent in this beat** (see the cast note above) to
   protect its scripted Sector 8 first line. If it should get a line here
   instead, that's a change to both this document and the Sector 8 plan.
3. **5 new commissioned images**, not more — office (2), vortex (1),
   corridor (2) — everything else reuses existing avatar/ROGUE art or is
   built as in-app UI. Keeps the art ask small and consistent with how
   the rest of the game's assets were scoped.
4. **This is scoped as Phase 2**, which means `CutsceneView` needs a
   multi-panel playback change before this content can actually be wired
   in as a beat — that's follow-up engineering work, not included here.
