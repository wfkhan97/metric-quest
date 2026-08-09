import rogueCalm from '../assets/rogue/rogue-calm.png';
import rogueCorrupted from '../assets/rogue/rogue-corrupted.png';

export type RogueState = 'calm' | 'corrupted';

const ROGUE_ART: Record<RogueState, { src: string; alt: string }> = {
  calm: { src: rogueCalm, alt: 'ROGUE.exe terminal icon, steady and undamaged' },
  corrupted: { src: rogueCorrupted, alt: 'ROGUE.exe terminal icon, glitching and corrupted' },
};

type RogueSpriteProps = {
  state: RogueState;
  className?: string;
};

export function RogueSprite({ state, className }: RogueSpriteProps) {
  const art = ROGUE_ART[state];
  return <img className={className ? `rogue-sprite ${className}` : 'rogue-sprite'} src={art.src} alt={art.alt} />;
}
