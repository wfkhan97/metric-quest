import { useEffect, useRef } from 'react';
import { RogueSprite } from './RogueSprite';
import { type Beat } from '../content/beats';

type CutsceneViewProps = {
  beat: Beat;
  /** False on a beat's mandatory first viewing — no skip control, Escape does nothing. */
  skippable: boolean;
  onFinish: () => void;
};

export function CutsceneView({ beat, skippable, onFinish }: CutsceneViewProps) {
  const finishButtonRef = useRef<HTMLButtonElement>(null);
  const panel = beat.panels[0];

  useEffect(() => {
    finishButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!skippable) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onFinish();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [skippable, onFinish]);

  return (
    <main className="app-shell sector-transition cutscene" aria-labelledby="cutscene-title">
      <div className="sector-transition-frame cutscene-frame phase-scanline">
        <p className="eyebrow">{beat.eyebrow}</p>
        <h1 id="cutscene-title">{beat.heading}</h1>
        {panel.rogueState && (
          <div className="sector-sprite phase-slide">
            <RogueSprite state={panel.rogueState} />
          </div>
        )}
        <div className="cutscene-copy">
          {panel.copy.map((paragraph, index) => (
            <p
              key={index}
              className="sector-transition-flavor type-reveal"
              style={{ animationDelay: `${200 + index * 900}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        <div className="actions">
          <button type="button" className="primary" onClick={onFinish} ref={finishButtonRef}>
            Continue
          </button>
        </div>
        <p className="subtle sector-transition-hint">
          {skippable ? 'Press Escape or Continue to proceed.' : 'Press Continue when you’re ready.'}
        </p>
      </div>
    </main>
  );
}
