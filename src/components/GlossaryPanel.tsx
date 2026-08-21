import { useEffect, useRef } from 'react';
import { chapters } from '../content/chapters';
import { glossary, type GlossaryEntry } from '../content/glossary';
import { useFocusTrap } from '../lib/useFocusTrap';
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
  /** Entry id to auto-expand and scroll into view on open (P1.3 deep link). */
  initialEntryId?: string;
};

function formatSectorList(sectors: number[]): string {
  const labeled = sectors.map((sector) => `Sector ${sector}`);
  if (labeled.length === 1) return labeled[0];
  return `${labeled.slice(0, -1).join(', ')} and ${labeled[labeled.length - 1]}`;
}

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

export function GlossaryPanel({ onClose, initialEntryId }: GlossaryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const groupedEntries = groupBySector(glossary);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!initialEntryId || !panelRef.current) return;
    const details = panelRef.current.querySelector<HTMLDetailsElement>(`[data-entry-id="${initialEntryId}"]`);
    if (!details) return;
    details.open = true;
    details.scrollIntoView({ block: 'start' });
  }, [initialEntryId]);
  useFocusTrap(panelRef, onClose);

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
                    <details key={entry.id} className="glossary-entry" data-entry-id={entry.id}>
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
                        <p className="subtle">Also comes up in {formatSectorList(entry.sectors.slice(1))}.</p>
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
