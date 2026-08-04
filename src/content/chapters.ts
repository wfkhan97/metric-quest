import { type Mission } from '../lib/missions';

export type Chapter = {
  number: number;
  title: string;
};

// Full curriculum outline; chapters without a matching mission render as "coming soon".
// Titles lead with the Sector name from docs/GAME_DESIGN_BRIEF.md §4, keeping the original
// concept subtitle after the dash for continuity with the pre-pivot curriculum labels.
export const chapters: Chapter[] = [
  { number: 1, title: 'The Ledger Vaults — Revenue reconnaissance' },
  { number: 2, title: 'The Scoreboard Core — Executive scorecard' },
  { number: 3, title: 'The Relay Archives — Connected customer evidence' },
  { number: 4, title: 'The Workbench Foundry — Analyst workbench' },
  { number: 5, title: 'The Chronometer Wing — Time and operations' },
  { number: 6, title: 'The Sorting Engine — Decision rules and data types' },
  { number: 7, title: 'The Shared Vault — Shared analytical assets' },
  { number: 8, title: "ROGUE.exe's Inner Sanctum — Verify the AI analyst" },
  { number: 9, title: 'The Boardroom Core — Boardroom final' },
];

export function chapterNumber(mission: Mission): number {
  const [prefix] = mission.chapter.split('·');
  return Number.parseInt(prefix.trim(), 10);
}
