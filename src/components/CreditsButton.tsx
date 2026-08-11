import { useEffect, useRef, useState } from 'react';
import { musicCredits } from '../content/sectorMusic';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

// A small, always-present trigger (every screen, via App.tsx rendering this
// once outside the view switch) rather than one Credits entry point per
// screen — avoids duplicating the button/overlay six times, and means a new
// screen gets it for free. Reuses GlossaryPanel's overlay/focus-trap chrome
// wholesale (same backdrop/panel/header classes) rather than inventing new
// visual language for what is otherwise the same interaction pattern.
export function CreditsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button type="button" className="credits-trigger" onClick={() => setIsOpen(true)} ref={triggerRef}>
        Credits
      </button>
      {isOpen && (
        <div
          className="glossary-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="glossary-panel" role="dialog" aria-modal="true" aria-labelledby="credits-title" ref={panelRef}>
            <header className="glossary-header">
              <div>
                <p className="eyebrow">Aurora Music mainframe · about this build</p>
                <h2 id="credits-title">Credits</h2>
              </div>
              <button type="button" className="link-button" onClick={close} ref={closeButtonRef}>
                <span aria-hidden="true">✕ </span>Close
              </button>
            </header>
            <div className="glossary-body">
              <section aria-labelledby="credits-team">
                <h3 id="credits-team">Team</h3>
                <ul className="credits-list">
                  <li>
                    <strong>Wally</strong> — Product Manager &amp; Project Lead
                  </li>
                  <li>
                    <strong>Claude Code</strong> (Anthropic) — Lead Engineer &amp; Designer
                  </li>
                </ul>
              </section>
              <section aria-labelledby="credits-music">
                <h3 id="credits-music">Music &amp; sound</h3>
                <p className="subtle">
                  Every track is used under its stated license — most are CC0 (public domain), no attribution required;
                  one cutscene cue is CC BY 3.0 and is credited both here and inline while it plays.
                </p>
                <ul className="credits-list">
                  {musicCredits.map((credit) => (
                    <li key={credit.label}>
                      <strong>{credit.label}:</strong> {credit.track} —{' '}
                      <a href={credit.source} target="_blank" rel="noopener noreferrer">
                        {credit.license}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
