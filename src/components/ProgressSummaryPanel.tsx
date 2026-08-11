import { useEffect, useMemo, useRef, useState } from 'react';
import { chapters } from '../content/chapters';
import { type Mission } from '../lib/missions';
import { type Progress } from '../lib/progress';

type ProgressSummaryPanelProps = {
  missions: Mission[];
  progress: Progress;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

function buildSummaryText(missions: Mission[], progress: Progress): string {
  const sectorLines = chapters.map((chapter) => {
    const sectorMissions = missions.filter((mission) => mission.chapter.startsWith(`${chapter.number} ·`));
    const completed = sectorMissions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length;
    return `Sector ${chapter.number}: ${completed}/${sectorMissions.length} terminals purged — ${chapter.title}`;
  });

  return [
    'METRIC QUEST // LOCAL PROGRESS REPORT',
    `Terminals purged: ${progress.completedMissionIds.length}/${missions.length}`,
    `Points: ${progress.points}`,
    `Badges: ${progress.badges.length ? progress.badges.join(', ') : 'None recovered yet'}`,
    '',
    ...sectorLines,
    '',
    'Generated on this device. Nothing was sent from the mainframe.',
  ].join('\n');
}

export function ProgressSummaryPanel({ missions, progress, onClose }: ProgressSummaryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const sectorStatus = useMemo(
    () =>
      chapters.map((chapter) => {
        const sectorMissions = missions.filter((mission) => mission.chapter.startsWith(`${chapter.number} ·`));
        const completed = sectorMissions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length;
        return { ...chapter, completed, total: sectorMissions.length };
      }),
    [missions, progress.completedMissionIds],
  );
  const clearedSectors = sectorStatus.filter((sector) => sector.total > 0 && sector.completed === sector.total).length;
  const summaryText = useMemo(() => buildSummaryText(missions, progress), [missions, progress]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
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
  }, [onClose]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('unavailable');
    }
  }

  return (
    <div
      className="glossary-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="glossary-panel progress-summary-panel" role="dialog" aria-modal="true" aria-labelledby="progress-summary-title" ref={panelRef}>
        <header className="glossary-header">
          <div>
            <p className="eyebrow">Aurora Music mainframe · local report</p>
            <h2 id="progress-summary-title">Player progress report</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body progress-summary-body">
          <p className="progress-summary-note">Generated only from this save on this device. Nothing leaves the mainframe unless you choose to share it.</p>
          <section className="progress-summary-printout" aria-label="Current progress">
            <p className="progress-summary-stamp">// STATUS TRANSMISSION</p>
            <dl className="progress-summary-totals">
              <div>
                <dt>Terminals purged</dt>
                <dd>{progress.completedMissionIds.length} / {missions.length}</dd>
              </div>
              <div>
                <dt>Sectors cleared</dt>
                <dd>{clearedSectors} / {chapters.length}</dd>
              </div>
              <div>
                <dt>Points recovered</dt>
                <dd>{progress.points}</dd>
              </div>
              <div>
                <dt>Badges earned</dt>
                <dd>{progress.badges.length}</dd>
              </div>
            </dl>

            <h3>Sector signal log</h3>
            <ul className="progress-summary-sectors">
              {sectorStatus.map((sector) => (
                <li key={sector.number}>
                  <strong>Sector {sector.number}</strong>
                  <span>{sector.completed} / {sector.total} purged</span>
                  <span>{sector.title}</span>
                </li>
              ))}
            </ul>

            <h3>Recovered badges</h3>
            <p className="progress-summary-badges">{progress.badges.length ? progress.badges.join(' · ') : 'No badges recovered yet. One clean query at a time.'}</p>
          </section>
          <div className="actions progress-summary-actions">
            <button type="button" className="primary" onClick={() => void copySummary()}>
              Copy summary
            </button>
            <p className="subtle" aria-live="polite">
              {copyStatus === 'copied' && 'Report copied. Share it only if you want to.'}
              {copyStatus === 'unavailable' && 'Copying is unavailable in this browser. A screenshot works just as well.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
