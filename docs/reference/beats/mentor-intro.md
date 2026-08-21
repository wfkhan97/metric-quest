# mentor-intro
Beat id: 'mentor-intro' · 2 panel(s)
Source: src/content/beats.ts (grep "export const mentorIntroBeat")

**Plays when:** `App.tsx`'s `offerMentorIntro`, called right after a player's first-ever completion of `openingBeat` (chained through `terminalOrientationBeat` first if that also played) — gated `hasSeenMentorIntro`, so it fires once. Replayable via `handleReplayMentorIntro`.

**Arc/tone:** 2 panels introducing ECHO, ROGUE.exe's calmer counterpart, who offers to walk the player through each sector's SQL ahead of time. Ends on a real two-way `choice` (Learn SQL Mode opt-in), not a plain Continue — App.tsx does not itself flip the setting from here, the player toggles it from Home afterward.
