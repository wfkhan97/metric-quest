import { useEffect, useRef } from 'react';
import { chapters } from '../content/chapters';
import { glossary, type GlossaryEntry } from '../content/glossary';
import {
  FilterSortLimitDiagram,
  GroupByDiagram,
  JoinDiagram,
  UnionDiagram,
  WhereVsHavingDiagram,
} from './GlossaryVisuals';

const glossaryVisuals: Record<string, typeof FilterSortLimitDiagram> = {
  'filter-sort-limit': FilterSortLimitDiagram,
  'where-vs-having': WhereVsHavingDiagram,
  joins: JoinDiagram,
  'group-by-aggregation': GroupByDiagram,
  'union-vs-union-all': UnionDiagram,
};

type GlossaryPanelProps = {
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

function groupBySector(entries: GlossaryEntry[]): Map<number, GlossaryEntry[]> {
  const groups = new Map<number, GlossaryEntry[]>();
  for (const entry of entries) {
    const primarySector = entry.sectors[0];
    const existing = groups.get(primarySector);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(primarySector, [entry]);
    }
  }
  return groups;
}

export function GlossaryPanel({ onClose }: GlossaryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const groupedEntries = groupBySector(glossary);

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

  return (
    <div
      className="glossary-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="glossary-panel" role="dialog" aria-modal="true" aria-labelledby="glossary-title" ref={panelRef}>
        <header className="glossary-header">
          <div>
            <p className="eyebrow">Aurora Music mainframe · reference index</p>
            <h2 id="glossary-title">Concept glossary</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body">
          {chapters
            .filter((chapter) => groupedEntries.has(chapter.number))
            .map((chapter) => (
              <section key={chapter.number} aria-labelledby={`glossary-sector-${chapter.number}`}>
                <h3 id={`glossary-sector-${chapter.number}`}>
                  Sector {chapter.number} · {chapter.title}
                </h3>
                {groupedEntries.get(chapter.number)!.map((entry) => {
                  const Visual = entry.visualId ? glossaryVisuals[entry.visualId] : undefined;
                  return (
                    <details key={entry.id} className="glossary-entry">
                      <summary>
                        <strong>{entry.title}</strong> — {entry.summary}
                      </summary>
                      {entry.explanation.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      {Visual && <Visual caption={entry.summary} />}
                      <div className="glossary-example">
                        <p className="subtle">{entry.example.description}</p>
                        <pre>
                          <code>{entry.example.sql}</code>
                        </pre>
                      </div>
                      {entry.sectors.length > 1 && (
                        <p className="subtle">Also comes up in Sector {entry.sectors.slice(1).join(', Sector ')}.</p>
                      )}
                    </details>
                  );
                })}
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
