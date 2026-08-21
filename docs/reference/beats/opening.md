# opening
Beat id: 'opening' · 1 panel(s)
Source: src/content/beats.ts (grep "export const openingBeat")

**Plays when:** Never standalone — `App.tsx`'s `handleCutsceneFinish` auto-chains it from `mainframePullBeat`'s last panel (`beat?.id === 'mainframe-pull'`), so the two read as one continuous intro. Replays the same way, via `handleReplayOpening`.

**Arc/tone:** One panel, ROGUE.exe's voice-over origin monologue — "you logged in to fix one report," leadership shipped an unsupervised AI analyst, the login pulled you inside the machine. Sets premise and villain voice before any gameplay.
