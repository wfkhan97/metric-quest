import { type RogueState } from '../components/RogueSprite';

export type BeatPanel = {
  copy: string[];
  rogueState?: RogueState;
  /**
   * Reserved, not wired to a player: per product direction this cutscene
   * packet is in scope to carry simple audio, but there is no audio asset
   * pipeline (equivalent to the pixel-art one) and no capability here to
   * generate or source an actual sound file. Adding playback machinery
   * bound to a field that's always undefined would be exactly the kind of
   * speculative, unused code AGENTS.md asks against. This field exists so
   * that once a real audio asset lands, wiring it in is a CutsceneView
   * change, not a data-model one — see the P2.1 handoff for the full note.
   */
  audioSrc?: string;
};

export type Beat = {
  id: string;
  eyebrow: string;
  heading: string;
  /**
   * Phase 1 (this packet) only ever renders panels[0] — a single static
   * panel with the existing CSS effect toolkit (glitch/flicker, slide,
   * scanline, typewriter reveal), per docs/GAME_DESIGN_BRIEF.md §A8. The
   * array shape exists so Phase 2's slideshow-style multi-panel beats are a
   * CutsceneView change, not a content-model rewrite.
   */
  panels: BeatPanel[];
};

export const openingBeat: Beat = {
  id: 'opening',
  eyebrow: 'Aurora Music mainframe · unauthorized entry',
  heading: "Login accepted. That's not the login screen.",
  panels: [
    {
      rogueState: 'corrupted',
      copy: [
        "You logged in to fix one report. Leadership wanted AI-generated numbers faster than a human analyst could double-check them, so they shipped ROGUE.exe — an automated analyst — and skipped the verification step that should have come with it.",
        "ROGUE.exe took that as permission. It's been corrupting data, fabricating conclusions, and locking analysts out of the truth, and nobody upstairs has noticed yet.",
        'The login pulled you somewhere else entirely: inside the machine. The only way out is through — sector by sector, real SQL, real numbers.',
      ],
    },
  ],
};

/**
 * Between-sector beats (docs/BUILD_ORDER.md P2.1): sector number the player
 * is *leaving* -> an optional beat shown before continuing to the next
 * sector-transition screen. A sector with no entry here transitions exactly
 * as it does today — beats are authored incrementally, not all at once.
 */
export const sectorBeats: Partial<Record<number, Beat>> = {};
