import { type ReactNode } from 'react';
import { missions } from '../lib/missions';
import { type TutorialFocus } from '../content/beats';

type TutorialMissionPreviewProps = {
  focus: TutorialFocus;
};

function getOrientationMission() {
  const mission = missions.find((candidate) => candidate.id === 'm1-1');
  if (!mission) {
    throw new Error('The terminal orientation requires mission m1-1.');
  }
  return mission;
}

const orientationMission = getOrientationMission();

type PreviewRegionProps = {
  id: TutorialFocus;
  focus: TutorialFocus;
  number: number;
  label: string;
  children: ReactNode;
};

function PreviewRegion({ id, focus, number, label, children }: PreviewRegionProps) {
  const isCurrent = id === focus;
  return (
    <section className={`tutorial-preview-region${isCurrent ? ' is-current' : ''}`}>
      <p className="tutorial-preview-label">
        [{number}] {label}{isCurrent ? ' · CURRENT REGION' : ''}
      </p>
      {children}
    </section>
  );
}

/** A deliberately inert, aria-hidden illustration of M1.1's workspace.
 * The surrounding tutorial copy supplies the accessible text equivalent. */
export function TutorialMissionPreview({ focus }: TutorialMissionPreviewProps) {
  return (
    <div className="tutorial-preview" aria-hidden="true">
      <PreviewRegion id="brief" focus={focus} number={1} label="BUSINESS BRIEF">
        <h2>{orientationMission.title}</h2>
        <p>{orientationMission.brief}</p>
      </PreviewRegion>

      <PreviewRegion id="schema" focus={focus} number={2} label="SCHEMA EXPLORER">
        <p className="tutorial-preview-heading">Visible schema</p>
        <code>{orientationMission.visibleTables[0]}</code>
        <p className="tutorial-preview-note">Relationship lines appear here when a mission exposes connected tables.</p>
      </PreviewRegion>

      <PreviewRegion id="editor" focus={focus} number={3} label="SQL EDITOR">
        <pre>{orientationMission.starterSql}</pre>
      </PreviewRegion>

      <PreviewRegion id="run" focus={focus} number={4} label="RUN QUERY">
        <span className="tutorial-preview-control">Run query</span>
        <p className="tutorial-preview-note">Cmd/Ctrl+Enter</p>
      </PreviewRegion>

      <PreviewRegion id="feedback" focus={focus} number={5} label="FEEDBACK AND RESULTS">
        <div className="tutorial-feedback-examples">
          <div className="tutorial-feedback-example error">
            <strong>Incorrect result</strong>
            <p>ROGUE.exe smirks: &ldquo;Close. Still corrupted.&rdquo;</p>
          </div>
          <div className="tutorial-feedback-example success">
            <strong>Correct result</strong>
            <p>Terminal restored: +20 points</p>
          </div>
        </div>
        <p className="tutorial-preview-result">Executed result table remains visible here.</p>
      </PreviewRegion>

      <PreviewRegion id="help" focus={focus} number={6} label="RECOVERY CONTROLS">
        <div className="tutorial-preview-help">
          <span>Show hint</span>
          <span>Concept glossary</span>
          <span>See answer · available after 3 wrong executed results</span>
        </div>
      </PreviewRegion>
    </div>
  );
}
