import type { ReactNode } from 'react';

// P1.2 — animated CSS/SVG explanatory diagrams for the glossary. Each is
// purely supplementary: the entry's text already stands alone (P1.1), so
// these are aria-hidden and add a plain-text caption instead of alt text.
// All animation is done with CSS keyframes (not JS timers) so the global
// `prefers-reduced-motion: reduce` rule in styles.css — which forces every
// animation to a single, non-looping pass — applies automatically. Each
// diagram's keyframes are written so the 100% state is the fully "resolved"
// picture, since that's what a reduced-motion viewer freezes on.

type DiagramProps = {
  caption: string;
};

function VisualFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="glossary-visual">
      <svg viewBox="0 0 320 140" role="img" aria-hidden="true" className="glossary-visual-svg">
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function FilterSortLimitDiagram({ caption }: DiagramProps) {
  const rows = [
    { y: 10, w: 190, cls: 'viz-fsl-kept' },
    { y: 32, w: 165, cls: 'viz-fsl-kept' },
    { y: 54, w: 140, cls: 'viz-fsl-limited' },
    { y: 76, w: 115, cls: 'viz-fsl-filtered' },
    { y: 98, w: 90, cls: 'viz-fsl-filtered' },
  ];
  return (
    <VisualFrame caption={caption}>
      <text x="8" y="126" className="viz-label">
        WHERE removes flagged rows · LIMIT keeps only the top rows left
      </text>
      {rows.map((row) => (
        <g key={row.y} className={row.cls}>
          <rect x="8" y={row.y} width="220" height="16" className="viz-fsl-track" />
          <rect x="8" y={row.y} width={row.w} height="16" className="viz-fsl-bar" />
        </g>
      ))}
    </VisualFrame>
  );
}

export function WhereVsHavingDiagram({ caption }: DiagramProps) {
  return (
    <VisualFrame caption={caption}>
      <text x="8" y="18" className="viz-label viz-label-strong">
        WHERE (before grouping)
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="8"
          y={30 + i * 20}
          width="130"
          height="14"
          className={i === 1 ? 'viz-wh-row viz-wh-row-removed' : 'viz-wh-row'}
        />
      ))}

      <line x1="164" y1="10" x2="164" y2="130" className="viz-divider" />

      <text x="180" y="18" className="viz-label viz-label-strong">
        HAVING (after grouping)
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="180"
          y={30 + i * 26}
          width={40 + i * 25}
          height="18"
          className={i === 1 ? 'viz-wh-bucket viz-wh-bucket-removed' : 'viz-wh-bucket'}
        />
      ))}
    </VisualFrame>
  );
}

export function JoinDiagram({ caption }: DiagramProps) {
  const leftRows = ['A', 'B', 'C'];
  return (
    <VisualFrame caption={caption}>
      <text x="8" y="14" className="viz-label viz-label-strong">
        INNER JOIN
      </text>
      {leftRows.map((label, i) => (
        <g key={label}>
          <rect x="8" y={22 + i * 24} width="26" height="18" className="viz-join-node" />
          <text x="21" y={22 + i * 24 + 13} className="viz-join-node-text">
            {label}
          </text>
          {i !== 1 && (
            <>
              <line x1="34" y1={22 + i * 24 + 9} x2="70" y2={22 + i * 24 + 9} className="viz-join-line" />
              <rect x="70" y={22 + i * 24} width="26" height="18" className="viz-join-node" />
            </>
          )}
          {i === 1 && <rect x="8" y={22 + i * 24} width="26" height="18" className="viz-join-node viz-join-dropped" />}
        </g>
      ))}

      <line x1="120" y1="10" x2="120" y2="130" className="viz-divider" />

      <text x="136" y="14" className="viz-label viz-label-strong">
        LEFT JOIN
      </text>
      {leftRows.map((label, i) => (
        <g key={label}>
          <rect x="136" y={22 + i * 24} width="26" height="18" className="viz-join-node" />
          <text x="149" y={22 + i * 24 + 13} className="viz-join-node-text">
            {label}
          </text>
          {i !== 1 && (
            <>
              <line x1="162" y1={22 + i * 24 + 9} x2="198" y2={22 + i * 24 + 9} className="viz-join-line" />
              <rect x="198" y={22 + i * 24} width="26" height="18" className="viz-join-node" />
            </>
          )}
          {i === 1 && (
            <text x="168" y={22 + i * 24 + 13} className="viz-join-null">
              NULL
            </text>
          )}
        </g>
      ))}
    </VisualFrame>
  );
}

export function GroupByDiagram({ caption }: DiagramProps) {
  const sourceRows = [
    { y: 8, cls: 'viz-group-a' },
    { y: 26, cls: 'viz-group-b' },
    { y: 44, cls: 'viz-group-a' },
    { y: 62, cls: 'viz-group-c' },
    { y: 80, cls: 'viz-group-b' },
    { y: 98, cls: 'viz-group-c' },
  ];
  return (
    <VisualFrame caption={caption}>
      <g className="viz-group-source">
        {sourceRows.map((row) => (
          <rect key={row.y} x="8" y={row.y} width="90" height="12" className={row.cls} />
        ))}
      </g>
      <g className="viz-group-buckets">
        <rect x="140" y="30" width="34" height="70" className="viz-group-a" />
        <rect x="190" y="55" width="34" height="45" className="viz-group-b" />
        <rect x="240" y="70" width="34" height="30" className="viz-group-c" />
      </g>
      <text x="8" y="126" className="viz-label">
        GROUP BY collapses rows into one bar per bucket
      </text>
    </VisualFrame>
  );
}

export function UnionDiagram({ caption }: DiagramProps) {
  return (
    <VisualFrame caption={caption}>
      <text x="8" y="14" className="viz-label viz-label-strong">
        UNION
      </text>
      {['USA', 'Canada', 'USA'].map((label, i) => (
        <g key={`a-${i}`} className={i === 2 ? 'viz-union-row viz-union-row-dedup' : 'viz-union-row'}>
          <rect x="8" y={22 + i * 20} width="70" height="14" />
          <text x="14" y={22 + i * 20 + 11}>
            {label}
          </text>
        </g>
      ))}

      <line x1="100" y1="10" x2="100" y2="130" className="viz-divider" />

      <text x="116" y="14" className="viz-label viz-label-strong">
        UNION ALL
      </text>
      {['USA', 'Canada', 'USA'].map((label, i) => (
        <g key={`b-${i}`} className={i === 2 ? 'viz-union-row viz-union-row-kept' : 'viz-union-row'}>
          <rect x="116" y={22 + i * 20} width="70" height="14" />
          <text x="122" y={22 + i * 20 + 11}>
            {label}
          </text>
        </g>
      ))}
      <text x="8" y="126" className="viz-label">
        UNION drops the repeat; UNION ALL keeps both
      </text>
    </VisualFrame>
  );
}
