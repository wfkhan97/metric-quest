import sector1 from '../assets/audio/sector-1.m4a';
import sector2 from '../assets/audio/sector-2.m4a';
import sector3 from '../assets/audio/sector-3.m4a';
import sector4 from '../assets/audio/sector-4.m4a';
import sector5 from '../assets/audio/sector-5.m4a';
import sector6 from '../assets/audio/sector-6.m4a';
import sector7 from '../assets/audio/sector-7.ogg';
import sector8 from '../assets/audio/sector-8.ogg';
import sector9 from '../assets/audio/sector-9.m4a';

// One looping background track per sector, played by MissionView for as long
// as an active mission's chapter matches. A chapter number with no entry here
// (e.g. a future sector added before music is sourced) plays no music, same
// "missing asset degrades gracefully" rule as sectorBackgrounds.
export const sectorMusic: Partial<Record<number, string>> = {
  1: sector1,
  2: sector2,
  3: sector3,
  4: sector4,
  5: sector5,
  6: sector6,
  7: sector7,
  8: sector8,
  9: sector9,
};

export type MusicCredit = {
  label: string;
  track: string;
  artist: string;
  source: string;
  license: string;
};

// Every sourced audio asset in the game, in play order — the single source of
// truth for the Credits panel. Sourced 2026-08-11 from opengameart.org (CC0
// tracks, same trusted source as the 2026-08-10 cutscene cues) except cue-a,
// which is CC-BY 3.0 from incompetech.com and already carries its own inline
// credit line during the cutscene panels that use it — listed here too so
// every audio credit lives in one place, not split across two UI surfaces.
export const musicCredits: MusicCredit[] = [
  {
    label: 'Opening cutscene — office scenes',
    track: "'Local Forecast – Elevator' by Kevin MacLeod",
    artist: 'Kevin MacLeod',
    source: 'https://incompetech.com/wordpress/2013/02/local-forecast/',
    license: 'CC BY 3.0',
  },
  {
    label: 'Opening cutscene — the pull',
    track: "'Xenocity – Digital Acid (Glitch Hop)' by Deva",
    artist: 'Deva',
    source: 'https://opengameart.org/content/xenocity-digital-acid-glitch-hop',
    license: 'CC0',
  },
  {
    label: 'Opening cutscene — inside the mainframe; Title screen',
    track: "'The Adventure Begins' by Frenchyboy Studios",
    artist: 'Frenchyboy Studios',
    source: 'https://opengameart.org/content/the-adventure-begins',
    license: 'CC0',
  },
  {
    label: 'Sector 1 — The Ledger Vaults',
    track: "'On A Journey' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/on-a-journey',
    license: 'CC0',
  },
  {
    label: 'Sector 2 — The Scoreboard Core',
    track: "'Happy Chip-tune' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/happy-chip-tune',
    license: 'CC0',
  },
  {
    label: 'Sector 3 — The Relay Archives',
    track: "'Mysterious, Futuristic 8-bit Music Loop' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/mysterious-futuristic-8-bit-music-loop',
    license: 'CC0',
  },
  {
    label: 'Sector 4 — The Workbench Foundry',
    track: "'Robot Trouble!' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/robot-trouble',
    license: 'CC0',
  },
  {
    label: 'Sector 5 — The Chronometer Wing',
    track: "'Orbitron' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/orbitron',
    license: 'CC0',
  },
  {
    label: 'Sector 6 — The Sorting Engine',
    track: "'Mischief' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/mischief',
    license: 'CC0',
  },
  {
    label: 'Sector 7 — The Shared Vault',
    track: "'Keep Your Dream Alive!' by congusbongus",
    artist: 'congusbongus',
    source: 'https://opengameart.org/content/keep-your-dream-alive-seamless-loop',
    license: 'CC0',
  },
  {
    label: "Sector 8 — ROGUE.exe's Inner Sanctum",
    track: "'Chipped Urgency (combat)' by Centurion_of_war",
    artist: 'Centurion_of_war',
    source: 'https://opengameart.org/content/chipped-urgencycombat',
    license: 'CC0',
  },
  {
    label: 'Sector 9 — The Boardroom Core',
    track: "'Ending Song' by Frenchyboy",
    artist: 'Frenchyboy',
    source: 'https://opengameart.org/content/ending-song',
    license: 'CC0',
  },
  {
    label: 'Sound effect — the pull into the mainframe',
    track: "'zap1' from Kenney's Digital Audio pack",
    artist: 'Kenney',
    source: 'https://kenney.nl/assets/digital-audio',
    license: 'CC0',
  },
];
