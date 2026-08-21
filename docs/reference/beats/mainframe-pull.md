# mainframe-pull
Beat id: 'mainframe-pull' · 13 panel(s)
Source: src/content/beats.ts (grep "export const mainframePullBeat")

**Plays when:** `App.tsx`'s `proceedPastAvatar`, the first time `!hasSeenOpening(progress)` — i.e. right after avatar confirmation on a brand-new save. Its last panel chains straight into `openingBeat` (see that file). Replayable any time via `handleReplayOpening`.

**Arc/tone:** 13-panel "pulled into the mainframe" cinematic — an ordinary Tuesday office cold open, the CEO's unhinged all-caps rollout email, the office glitching, the player physically pulled in, a corridor of nine sector doors, ROGUE.exe already breaching Sector 1. Ends on the Sector 1 boot screen.
