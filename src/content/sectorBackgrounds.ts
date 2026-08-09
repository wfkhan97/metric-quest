import sector1 from '../assets/backgrounds/sector-1.jpg';
import sector2 from '../assets/backgrounds/sector-2.jpg';
import sector3 from '../assets/backgrounds/sector-3.jpg';
import sector4 from '../assets/backgrounds/sector-4.jpg';
import sector5 from '../assets/backgrounds/sector-5.jpg';
import sector6 from '../assets/backgrounds/sector-6.jpg';
import sector7 from '../assets/backgrounds/sector-7.jpg';
import sector8 from '../assets/backgrounds/sector-8.jpg';
import sector9 from '../assets/backgrounds/sector-9.jpg';

// One background per sector, shown behind SectorTransitionView. Composed with a
// clear lower-middle third for copy — see SectorTransitionView's frame alignment.
// A chapter number with no entry here (e.g. a future sector added before art
// lands) falls back to the plain panel treatment, not a broken image.
export const sectorBackgrounds: Partial<Record<number, string>> = {
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
