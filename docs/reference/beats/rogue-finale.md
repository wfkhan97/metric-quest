# rogue-finale
Beat id: 'rogue-finale' · 5 panel(s)
Source: src/content/beats.ts (grep "export const rogueFinaleBeat")

**Plays when:** `App.tsx`'s `handleCampaignComplete`, once the campaign's last mission (m9-2) grades correct — wired as `MissionView`'s `onCampaignComplete`. Skippable (`skipLabel`): the campaign is already complete and saved by the time this plays, nothing is gated behind it.

**Arc/tone:** 5 panels, the final confrontation — ROGUE.exe insists the board already approved its fabricated numbers, gets confronted with the real ones query-by-query, glitches, and fragments into static without reassembling. Closes on "every number in it is finally real."
