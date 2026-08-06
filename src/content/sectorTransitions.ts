// One-time flavor line per sector, shown by SectorTransitionView the first time a
// player enters that sector. Visual themes pulled from docs/GAME_DESIGN_BRIEF.md §A4;
// no background art exists yet for any sector, so every sector uses this text-only
// treatment (see Prompt 9 in METRIC_QUEST_CODEX_CLAUDE_PLAYBOOK.md).
export const sectorFlavor: Record<number, string> = {
  1: 'Rows of invoice ledgers glow in the dark, half of them flickering with fake totals ROGUE.exe slipped in to bury the real numbers. Sort the noise from the signal and the vault comes back online.',
  2: "A dashboard the size of a wall used to show the CFO real numbers — now the dials spin on inflated totals from ROGUE.exe's double-counting. Rebuild the scorecard and the dials settle.",
  3: "Record cabinets that once linked customers to their invoices sit dark, relay cables severed. Reconnect the wires and names come back to the numbers.",
  4: "A forge where raw data gets staged and reshaped before it goes anywhere — ROGUE.exe left half-built queries smoldering on every bench. Time to finish what it could not.",
  5: 'Gears and chronometers line the walls, ticking out of sync since ROGUE.exe scrambled the calendar logic. Get the dates right and the wing keeps time again.',
  6: 'Conveyor belts split into branching chutes, sorting nothing but garbage since ROGUE.exe broke the rules that used to route each item. Write the rules back and the belts run straight again.',
  7: 'A communal library of shared views sits on illuminated pedestals, every one dark since ROGUE.exe corrupted the queries other analysts relied on. Rebuild one and the light comes back for everyone.',
  8: "The geometry here does not sit right — screens glitch, walls fold in on themselves. This is ROGUE.exe's home turf, and for the first time, it is talking back.",
  9: 'The boardroom table stretches longer than physically possible, chairs replaced by screens ROGUE.exe filled with fabricated pitches. This is the final terminal — beat it, and the mainframe is yours again.',
};
