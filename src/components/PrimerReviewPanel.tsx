import { useEffect, useRef } from 'react';
import { chapters } from '../content/chapters';
import { useFocusTrap } from '../lib/useFocusTrap';

type PrimerReviewPanelProps = {
  /** Sector numbers whose primer has already been seen (progress.seenPrimers) — the only ones replayable. */
  sectors: number[];
  onSelect: (sector: number) => void;
  onClose: () => void;
};

/** Reuses the glossary panel/backdrop chrome wholesale (P1.1 pattern) —
 * only the list body is new. */
export function PrimerReviewPanel({ sectors, onSelect, onClose }: PrimerReviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);
  useFocusTrap(panelRef, onClose);

  return (
    <div
      className="glossary-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="glossary-panel" role="dialog" aria-modal="true" aria-labelledby="primer-review-title" ref={panelRef}>
        <header className="glossary-header">
          <div>
            <p className="eyebrow">Mentor channel · lesson log</p>
            <h2 id="primer-review-title">Review SQL primers</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body">
          <ul className="primer-review-list">
            {sectors.map((sector) => {
              const title = chapters.find((chapter) => chapter.number === sector)?.title ?? `Sector ${sector}`;
              return (
                <li key={sector}>
                  <button type="button" className="link-button" onClick={() => onSelect(sector)}>
                    Sector {sector} · {title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
