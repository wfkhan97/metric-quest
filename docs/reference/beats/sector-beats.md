# sector-beats
Type: sector-entry lookup (Partial<Record<number, Beat>>)
Source: src/content/beats.ts (grep "export const sectorBeats")

Entries:
- Sector 8 → rogueEntranceBeat
- Sector 9 → sector9OpeningBeat

**Plays when:** Not a scene itself — `App.tsx`'s `enterMissionWithTransitionCheck` looks a sector up here on the player's first entry to it (`!hasSeenSector`); a sector with no entry transitions exactly as it does today, straight to the standard `SectorTransitionView`. Beats are authored incrementally, not all at once.

**Arc/tone:** N/A — this is a routing lookup, not authored content. See the linked beat file (rogue-entrance.md, sector9-opening.md) for tone.
