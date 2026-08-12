import rogueCalm from '../assets/rogue/rogue-calm.png';
import rogueCorrupted from '../assets/rogue/rogue-corrupted.png';
import rogueEntrance04 from '../assets/cutscenes/rogue-entrance-04.png';

export type RogueState = 'calm' | 'corrupted' | 'confronting';

const ROGUE_ART: Record<RogueState, { src: string; alt: string }> = {
  calm: { src: rogueCalm, alt: 'ROGUE.exe terminal icon, steady and undamaged' },
  corrupted: { src: rogueCorrupted, alt: 'ROGUE.exe terminal icon, glitching and corrupted' },
  // Panel 4 of the Sector 8 entrance sequence (src/assets/cutscenes/README.md)
  // -- the closest/most confrontational frame, composited from the same
  // corrupted design. Used for m8-1's first direct encounter in place of the
  // plain `corrupted` icon.
  confronting: { src: rogueEntrance04, alt: 'ROGUE.exe, closer and more confrontational, glitching' },
};

type RogueSpriteProps = {
  state: RogueState;
  className?: string;
};

export function RogueSprite({ state, className }: RogueSpriteProps) {
  const art = ROGUE_ART[state];
  return <img className={className ? `rogue-sprite ${className}` : 'rogue-sprite'} src={art.src} alt={art.alt} />;
}
