import { useEffect, useRef } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { defaultAvatar } from '../lib/avatarOptions';
import { sectorFlavor } from '../content/sectorTransitions';
import { type AvatarConfig } from '../lib/progress';

type SectorTransitionViewProps = {
  chapterNumber: number;
  sectorTitle: string;
  avatar?: AvatarConfig;
  onContinue: () => void;
};

export function SectorTransitionView({ chapterNumber, sectorTitle, avatar, onContinue }: SectorTransitionViewProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const flavor = sectorFlavor[chapterNumber] ?? 'The terminal ahead is corrupted. Time to purge it.';

  useEffect(() => {
    continueButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onContinue();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  return (
    <main className="app-shell sector-transition" aria-labelledby="sector-transition-title">
      <div className="sector-transition-frame">
        <p className="eyebrow">Sector access · Now entering</p>
        <h1 id="sector-transition-title">{sectorTitle}</h1>
        <AvatarPreview
          spriteId={(avatar ?? defaultAvatar).spriteId}
          colorId={(avatar ?? defaultAvatar).colorId}
          size={96}
          label={`${(avatar ?? defaultAvatar).callsign} entering ${sectorTitle}`}
        />
        <p className="sector-transition-flavor">{flavor}</p>
        <div className="actions">
          <button type="button" className="primary" onClick={onContinue} ref={continueButtonRef}>
            Continue
          </button>
        </div>
        <p className="subtle sector-transition-hint">Press Escape or Continue to proceed — this only shows once per sector.</p>
      </div>
    </main>
  );
}
