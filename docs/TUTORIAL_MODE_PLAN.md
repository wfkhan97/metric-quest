# Optional first-run tutorial — screen/mechanics orientation plan

Status: **implemented and merged to `main`** (via
`codex/tutorial-mode-implementation`).
This document scopes and records `docs/BACKLOG.md` item 14 only. It does not
expand item 13 Part B1's separate SQL-basics primer.

## Decision summary

- **Format:** a passive, six-panel walkthrough using the existing
  `CutsceneView` / `Beat` sequencing pattern, extended with a code-rendered,
  non-interactive mission-screen schematic.
- **Placement:** immediately after the first completion of `openingBeat`,
  before the existing route to Home or a queued Sector 1 mission.
- **Skip:** visibly skippable from panel 1 onward. Finishing or skipping has
  the same destination and records that the walkthrough was offered.
- **Replay:** a **Review controls** link on Home, beside **Replay opening**.
- **Assets:** **no new Claude Design assets.** Existing terminal chrome,
  feedback icons, and HTML/CSS callouts are the right materials for a UI
  orientation.

## Scope boundary

This walkthrough answers: "What am I looking at, and what happens when I use
it?" It covers the business brief, schema explorer, SQL editor, Run query,
feedback/results, and recovery controls.

It does **not** explain what `SELECT`, `WHERE`, `JOIN`, or any other SQL concept
means. It does not provide an ungraded practice query, execute a sample query,
change a mission, or award points. Those are curriculum decisions reserved for
item 13 Part B1/B2.

## 1. Format decision

### Recommendation: passive multi-panel walkthrough

Use the data-driven panel model already proven by `CutsceneView` and
`src/content/beats.ts`. Each panel should show the same compact schematic of
the real mission workspace, with one region numbered and emphasized while the
copy explains it. The schematic is illustrative only: none of its editor or
button elements is interactive.

This is the better tradeoff for item 14:

| Consideration | Passive walkthrough | Interactive tutorial over `MissionView` |
| --- | --- | --- |
| Orientation value | Gives a new player a clear map of every important region before the first mission | More literal, but asks a player to learn the screen while also manipulating it |
| Build surface | Reuses panel advance, focus movement, fixed-viewport framing, and the existing content model | Needs spotlight positioning, responsive target measurement, overlay focus rules, and escape/skip behavior over a dense live screen |
| SQL/grading risk | Loads no database, runs no query, and cannot mutate points, hints, wrong-attempt counts, or mission completion | Requires a sandbox or careful suppression of the real mission's grading and progress side effects |
| Accessibility | One reading flow with semantic navigation and a text equivalent for every visual callout | Must coordinate focus between overlay instructions, CodeMirror, drawers, result tables, and narrow-screen reflow |
| Maintenance | A small DOM schematic can use the live M1.1 content and existing style tokens | Spotlight coordinates and scripted interactions can break whenever `MissionView` moves |

An interactive version would be justified for item 13 B1/B2, where the player
is actually learning or practicing SQL. For a mechanics-only orientation, its
extra fidelity does not repay the additional state, testing, and accessibility
complexity.

### Recommended implementation shape

- Add a `terminalOrientationBeat` (suggested id: `terminal-orientation`) to
  the same scripted-content layer as the other beats.
- Extend the beat panel model with a tutorial layout/focus key rather than
  encoding screenshots. A small `TutorialMissionPreview` can render the
  schematic and emphasize `brief`, `schema`, `editor`, `run`, `feedback`, or
  `help` for the current panel.
- Populate the schematic from M1.1's existing mission definition where
  practical (`brief`, `visibleTables`, and `starterSql`) so the walkthrough
  does not copy strings that can drift from the real first mission.
- Keep all preview controls non-focusable and non-interactive. The active
  controls are only **Next/Continue** and **Skip tutorial**.
- Do not auto-advance. The player controls the pace.
- Do not add music, sound effects, a narrator character, or ROGUE.exe banter.
  This is terminal orientation, not a third opening story beat.

The diagram should use a numbered text tag such as `[3] SQL EDITOR` plus a
solid outline; never use glow/color alone to identify the current region. On a
narrow viewport it should stack in the same order as the real workspace. The
full explanatory copy remains real text, so the schematic may be `aria-hidden`
if every visual fact has an equivalent in the panel copy.

## 2. Content and sequence

### Why six panels

Six panels are enough to give each mental step one job: read, inspect, write,
run, evaluate, recover. Fewer would collapse the two most easily confused
ideas—running a query versus interpreting its result—into one panel. More
would turn a roughly 90-second orientation into another opening cutscene and
delay the player's first real decision.

The walkthrough uses the established playful-retro-but-didactic voice: one
light mainframe line where it helps, followed by precise mechanics.

### Panel 1 of 6 — Business brief

**Visual focus:** the mission brief at the top of the workspace, using M1.1
`Priority invoices` as the representative screen.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 1 OF 6`

**Heading:** `Start with the brief.`

**Copy:**

1. `Every terminal opens with a business brief: what ROGUE.exe scrambled, what Aurora needs back, and exactly what the result must contain. Read it before touching the editor.`
2. `The mainframe is dramatic. The request is precise.`

### Panel 2 of 6 — Schema explorer

**Visual focus:** the real `SchemaExplorer` position, with M1.1's `Invoice`
table shown. Include a small secondary note that relationship lines appear
when a mission exposes connected tables.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 2 OF 6`

**Heading:** `Check what survived.`

**Copy:**

1. `The schema explorer lists the tables and columns this mission exposes. When more than one table is in play, relationship lines show which keys connect them.`
2. `It is the map of what exists, not a memory test. If a column is not listed, do not invent one.`

### Panel 3 of 6 — SQL editor

**Visual focus:** the `SQL editor` panel and M1.1 starter comments. Do not
show or pre-fill the solution SQL.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 3 OF 6`

**Heading:** `This is your workbench.`

**Copy:**

1. `Write or edit your query in the SQL editor. The starter comments point at the task; keep them, replace them, or clear them when you are ready.`
2. `This walkthrough maps the controls. It will not solve the query for you.`

### Panel 4 of 6 — Run query

**Visual focus:** the `Run query` control in the editor action row. Show the
keyboard equivalent as text, not as a separate interactive control.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 4 OF 6`

**Heading:** `Run the result, not the wording.`

**Copy:**

1. `Run query sends the editor's current text to the database in your browser. Use the button, or press Cmd/Ctrl+Enter.`
2. `The mainframe grades the table your SQL returns—not whether your query looks like a memorized answer.`

### Panel 5 of 6 — Incorrect versus correct results

**Visual focus:** the feedback/result region in two compact states. The
incorrect example uses the existing corruption icon and wrong-result heading;
the correct example uses the existing restored icon and success treatment.
Show that an executed result table remains visible below either state. These
are labeled examples, not live query output.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 5 OF 6`

**Heading:** `Read what came back.`

**Copy:**

1. `If the rows or columns are still off, the terminal marks the result as corrupted and explains what did not line up. The returned table stays visible so you can inspect it and try again.`
2. `When the result matches, the panel changes to Terminal restored, shows the lesson, and awards any new points or badge. A wrong run does not erase your progress.`

Use the actual UI language in the visual examples:

- Incorrect: `ROGUE.exe smirks: "Close. Still corrupted."`
- Correct: `Terminal restored: +20 points`

Do not invent a fake SQL error or fake result rows for this panel. The purpose
is to distinguish the two feedback states, not simulate a query.

### Panel 6 of 6 — Hints, glossary, diagnostics, and answer gate

**Visual focus:** `Show hint` and `Concept glossary`, plus a clearly labeled
locked-to-available illustration of `See answer`. The preview must not imply
that `See answer` is visible at the start of a mission.

**Eyebrow:** `QUERY TERMINAL ORIENTATION · 6 OF 6`

**Heading:** `Stuck is a status, not a dead end.`

**Copy:**

1. `Show hint reveals one clue at a time. Concept glossary opens a reference without taking you out of the mission.`
2. `After two executed wrong results, feedback may flag a likely cause. After three, See answer appears. It is hidden before then on purpose.`
3. `Brief. Schema. Editor. Run. Inspect. Adjust. That is the whole terminal loop. You can replay this orientation from the main screen.`

**Final button label:** `Continue`

## 3. Placement and App flow

The decided placement is correct: after the opening story finishes, before
the player reaches Sector 1. The tutorial should not precede the story, sit on
Home as an unsolicited overlay, or replace the Sector 1 transition.

The smallest change uses the existing `view === 'cutscene'` route; no new
top-level `View` value is necessary.

### First-run route

Current flow:

```text
title -> avatar -> mainframePullBeat -> openingBeat -> home
                                              or -> queued mission flow
```

Planned flow:

```text
title -> avatar -> mainframePullBeat -> openingBeat
       -> terminalOrientationBeat -> home
                                  or -> queued mission/sector-transition flow
```

In `handleCutsceneFinish`:

1. Keep the existing `mainframe-pull` branch unchanged: it chains to
   `openingBeat`.
2. In the `opening` branch, determine whether this was the mandatory first
   completion **before** calling `markOpeningSeen`. A replay launched by
   `handleReplayOpening` must continue to return to Home; it should not
   unexpectedly chain into the tutorial.
3. On a first opening completion, if the active save has not been offered the
   tutorial, persist the additive tutorial flag, set
   `pendingBeat = terminalOrientationBeat`, set `cutsceneSkippable = true`,
   keep `pendingMission` intact, and remain in `view = 'cutscene'`.
4. Add a `terminal-orientation` branch. On finish or skip, clear the pending
   beat and preserve the destination that existed before the tutorial:
   - if `pendingMission` exists, pass it through
     `enterMissionWithTransitionCheck` so the normal Sector 1 transition and
     seen-sector rules still run;
   - otherwise, route to `home`, matching the current New game path.

The tutorial must not call `goToMission` directly. Doing so would bypass the
existing sector-transition check.

### Persistence

Add an optional, additive `seenTutorial?: boolean` field to `Progress`, with
`hasSeenTutorial` / `markTutorialSeen` helpers matching the existing opening
helpers. Parse it like `seenOpening`; missing on an older save is valid, not
corrupt data. The save-store version does not need to change.

Record the flag when the automatic tutorial is opened, rather than waiting
for panel 6. That makes "shown once" literal and prevents a refresh halfway
through from trapping the player in an automatic replay loop. `New game`
already resets to `emptyProgress`, and save-slot switching naturally keeps the
flag per profile. `hasAnyProgress` needs no tutorial-specific change because
an automatically offered tutorial already follows avatar creation and the
opening.

Do not retroactively interrupt existing players whose save already has
`seenOpening = true`. They can use **Review controls** on Home. The automatic
route only follows a first opening completion.

## 4. Skip and replay mechanics

### Skippable from the first panel: yes

The tutorial should be skippable on its first viewing, unlike the opening
story. Story continuity justifies one mandatory opening; mechanical
orientation does not. An SQL-literate player can recognize the interface in
seconds, and forcing six panels would make an accessibility aid feel like a
gate.

- Show a semantic **Skip tutorial** button on every panel, including panel 1.
- Keep Escape as a keyboard shortcut only when the tutorial is skippable.
- Skip and final Continue use the same routing branch and both preserve a
  queued mission.
- The visible button matters; Escape alone is not a discoverable skip
  mechanism.

`CutsceneView` currently uses `skippable` for Escape behavior but does not
render a visible skip control. Add a tutorial-specific optional label/control
(for example, a `skipLabel` on the beat) so this requirement does not silently
change the first-view behavior of story cutscenes.

### Replay location

Add **Review controls** to Home's status-console action group directly beside
**Replay opening**. Use an `onReplayTutorial` prop parallel to
`onReplayOpening` and an App handler that sets `pendingMission = null`, loads
`terminalOrientationBeat`, enables skipping, and sets `view = 'cutscene'`.
Finishing or skipping a replay returns to Home.

The control should remain available after first-run onboarding. It is a help
control, not a one-time trophy, and it should be available to older saves too.

## 5. Asset recommendation

### No new visual assets

This can and should ship entirely with existing terminal chrome and code-built
UI. No Claude Design request is needed, and item 14 should not be added to the
design asset tracker.

Reasons:

- The subject being taught is the interface itself. Recreating that interface
  with its real CSS, labels, and existing feedback icons is more accurate than
  drawing it into an image.
- HTML/CSS callouts reflow from 320px through desktop, remain sharp at zoom,
  and can provide a text equivalent. A screenshot or illustrated pointer would
  be more fragile and less accessible.
- Reuse the same live feedback icons/treatments as `MissionView`; the adjacent
  `Incorrect` / `Correct` labels and headings carry the meaning, so the
  walkthrough does not depend on an icon alone. The separately tracked
  `icon-corruption.png` legibility replacement in design-brief Step 4a can
  flow through automatically if it lands later; item 14 should not commission
  a duplicate asset. Panel borders, numbered tags, outlines, and arrows are
  functional explanatory graphics and are appropriate to build in CSS/SVG.
- A guide character would add story and imply a mentor role that belongs to
  the separately gated AI-tutor/mentor work. It would not make these six
  controls clearer.

If the product owner later wants a character-hosted version, treat that as a
presentation upgrade after usability testing, not as a prerequisite for this
plan. There is therefore intentionally no Claude Design prompt in this doc.

## 6. Accessibility and responsive acceptance criteria

- The outer tutorial remains one fixed viewport with internal scroll only,
  matching §A7 of the design brief.
- Verify at 1280×800, 375×812, and 320×568. The schematic stacks rather than
  shrinking labels below readable size.
- **Next/Continue** and **Skip tutorial** are semantic buttons with visible
  focus. Panel changes move focus predictably without scrolling past the
  heading.
- The highlighted region is identified by number and text, not color/glow
  alone. Decorative lines and previews are hidden from assistive technology
  when the same information is in the copy.
- Motion is limited to the existing restrained panel transition/type reveal
  and honors `prefers-reduced-motion`.
- No preview control can receive focus, run a query, open the glossary, reveal
  an answer, or mutate progress.
- Copy remains readable at 200% zoom and does not require music or sound to
  make sense.

## 7. Implementation and verification handoff

Likely implementation files, after approval:

- `src/content/beats.ts` — tutorial beat data and the exact copy above.
- `src/components/CutsceneView.tsx` — tutorial layout plus visible skip
  treatment, or a small child preview component called from that layout.
- `src/components/HomeView.tsx` — **Review controls** replay entry point.
- `src/App.tsx` — first-run chain, replay handler, and destination-preserving
  tutorial finish branch.
- `src/lib/progress.ts` — optional tutorial flag and helpers.
- relevant CSS and focused tests.

Required verification:

1. Fresh New game: avatar -> both opening beats -> tutorial -> Home; tutorial
   is not offered automatically again.
2. Fresh save with a queued mission: tutorial finish and tutorial skip both
   continue through the normal Sector 1 transition before M1.1.
3. Opening replay on an existing save returns to Home without chaining into
   the tutorial.
4. **Review controls** opens the tutorial for both old and new saves and
   returns to Home.
5. Skip is visible and keyboard-operable on every tutorial panel; Escape skips
   only when allowed.
6. The preview never invokes `runMissionQuery`, `validateResult`,
   `completeMission`, hint counters, diagnostics, or solution state.
7. `npm run check` passes, followed by a human keyboard pass and the three
   viewport checks above.

## Product-owner decision record

The product owner approved the following before implementation began:

1. Passive six-panel format rather than a live sandbox.
2. Skippable from the first panel.
3. **Review controls** as the Home replay label/location.
4. No new art or Claude Design commission.

## Implementation closeout (2026-08-11)

- Shipped as `terminalOrientationBeat`, a data-driven six-panel `Beat` using
  a CSS/HTML `TutorialMissionPreview`. The preview reads M1.1's title, brief,
  visible schema, and starter comments from the existing mission definition;
  it contains no interactive controls and does not mount `MissionView`.
- `CutsceneView` gained an opt-in visible skip label for this tutorial only.
  Story beats retain their mandatory first-view behavior.
- Progress adds the optional, per-save `seenTutorial` flag. The automatic
  route records it as soon as the tutorial opens, preserves a queued mission
  through `enterMissionWithTransitionCheck`, and does not interrupt existing
  saves that have already seen the opening. Home now offers **Review controls**
  beside **Replay opening** for every save.
- Automated coverage verifies tutorial routing, queued-mission finish/skip,
  replay behavior, legacy/current review access, parsing, inert-preview DOM,
  and tutorial skip/Escape behavior. Browser checks covered the first-run
  route, review/skip return, normal Sector 1 transition, and 1280×800,
  375×812, and 320×568 outer-overflow checks. A human screen-reader pass
  remains advisable before public release.
