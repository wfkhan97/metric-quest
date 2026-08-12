import queryErrorSrc from '../assets/audio/sfx/query-error.ogg';
import queryRunSrc from '../assets/audio/sfx/query-run.ogg';
import querySuccessSrc from '../assets/audio/sfx/query-success.ogg';
import sectorCompleteSrc from '../assets/audio/sfx/sector-complete.ogg';

export type SfxEvent = 'queryRun' | 'querySuccess' | 'queryError' | 'sectorComplete';

// Kenney.nl CC0 packs (Interface Sounds, Digital Audio — the latter already
// used for glitch-zap.ogg), same sourcing standard as the game's music. No
// attribution required.
const sfxSources: Record<SfxEvent, string> = {
  queryRun: queryRunSrc,
  querySuccess: querySuccessSrc,
  queryError: queryErrorSrc,
  sectorComplete: sectorCompleteSrc,
};

// One-shot, not looped — mirrors the existing glitch-zap sfxSrc pattern in
// CutsceneView rather than reusing the looping <audio ref> used for sector
// music. Fire-and-forget: a rejected/missing play() (autoplay policy, no
// user gesture yet, or no HTMLMediaElement support at all — e.g. jsdom in
// tests, where play() exists as a stub returning undefined rather than a
// Promise) is not worth surfacing to the player over a UI sound effect.
export function playSfx(event: SfxEvent, muted: boolean) {
  if (muted) return;
  try {
    new Audio(sfxSources[event]).play()?.catch(() => {});
  } catch {
    // No Audio support in this environment — skip silently.
  }
}
