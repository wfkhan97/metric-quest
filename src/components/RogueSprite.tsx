import rogueCalm from '../assets/rogue/rogue-calm.png';
import rogueCorrupted from '../assets/rogue/rogue-corrupted.png';
import rogueNamed from '../assets/rogue/rogue-named.png';
import rogueEntrance1 from '../assets/cutscenes/rogue-entrance-01.png';
import rogueEntrance2 from '../assets/cutscenes/rogue-entrance-02.png';
import rogueEntrance3 from '../assets/cutscenes/rogue-entrance-03.png';
import rogueEntrance4 from '../assets/cutscenes/rogue-entrance-04.png';
import rogueFinal1 from '../assets/cutscenes/rogue-final-01.png';
import rogueFinal2 from '../assets/cutscenes/rogue-final-02.png';
import rogueFinal3 from '../assets/cutscenes/rogue-final-03.png';
import rogueFinal4 from '../assets/cutscenes/rogue-final-04.png';

export type RogueState =
  | 'calm'
  | 'corrupted'
  | 'named'
  | 'entrance1'
  | 'entrance2'
  | 'entrance3'
  | 'entrance4'
  | 'final1'
  | 'final2'
  | 'final3'
  | 'final4';

// entrance1-4 and final1-4 are the Sector 8 entrance / Sector 9 finale
// cinematic panels (src/assets/cutscenes/README.md) -- composited
// placeholders built from the calm/corrupted designs, one state per beat
// panel (src/content/beats.ts's rogueEntranceBeat/rogueFinaleBeat). `named`
// bakes its own "ROGUE" nameplate into the image, unlike every other state
// here, so CutsceneView skips the separate nameplate overlay for it.
const ROGUE_ART: Record<RogueState, { src: string; alt: string }> = {
  calm: { src: rogueCalm, alt: 'ROGUE.exe terminal icon, steady and undamaged' },
  corrupted: { src: rogueCorrupted, alt: 'ROGUE.exe terminal icon, glitching and corrupted' },
  named: { src: rogueNamed, alt: 'ROGUE.exe, labeled with its name' },
  entrance1: { src: rogueEntrance1, alt: 'ROGUE.exe, composed and watching' },
  entrance2: { src: rogueEntrance2, alt: 'ROGUE.exe, addressing the player directly' },
  entrance3: { src: rogueEntrance3, alt: 'ROGUE.exe, closer, more confrontational' },
  entrance4: { src: rogueEntrance4, alt: 'ROGUE.exe, close and confrontational, glitching' },
  final1: { src: rogueFinal1, alt: 'ROGUE.exe at peak corruption' },
  final2: { src: rogueFinal2, alt: 'ROGUE.exe, corruption spreading further' },
  final3: { src: rogueFinal3, alt: 'ROGUE.exe visibly breaking apart' },
  final4: { src: rogueFinal4, alt: 'ROGUE.exe fragmented and defeated' },
};

type RogueSpriteProps = {
  state: RogueState;
  className?: string;
};

export function RogueSprite({ state, className }: RogueSpriteProps) {
  const art = ROGUE_ART[state];
  return <img className={className ? `rogue-sprite ${className}` : 'rogue-sprite'} src={art.src} alt={art.alt} />;
}
