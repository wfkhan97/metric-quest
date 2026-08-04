import { type Mission } from '../lib/missions';

export type Chapter = {
  number: number;
  title: string;
};

// Full curriculum outline; chapters without a matching mission render as "coming soon".
export const chapters: Chapter[] = [
  { number: 1, title: 'Revenue reconnaissance' },
  { number: 2, title: 'Executive scorecard' },
  { number: 3, title: 'Connected customer evidence' },
  { number: 4, title: 'Analyst workbench' },
  { number: 5, title: 'Time and operations' },
  { number: 6, title: 'Decision rules and data types' },
  { number: 7, title: 'Shared analytical assets' },
  { number: 8, title: 'Verify the AI analyst' },
  { number: 9, title: 'Boardroom final' },
];

export function chapterNumber(mission: Mission): number {
  const [prefix] = mission.chapter.split('·');
  return Number.parseInt(prefix.trim(), 10);
}
