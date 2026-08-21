# terminal-orientation
Beat id: 'terminal-orientation' · 6 panel(s)
Source: src/content/beats.ts (grep "export const terminalOrientationBeat")

**Plays when:** `App.tsx`'s `handleCutsceneFinish`, chained from a player's true first-ever completion of `openingBeat` (`isFirstOpeningCompletion && !hasSeenTutorial`) — mandatory only on that first pass. Has a visible `skipLabel`, and is replayable any time via `handleReplayTutorial`.

**Arc/tone:** 6 passive panels, one per terminal region (brief, schema, editor, run, feedback, help) — a CSS/HTML schematic walkthrough (`layout: 'tutorial'`), never a live `MissionView`, so no query/grade/hint/progress can occur during it.
