import { useEffect, useRef, useState } from 'react';
import { ChapterMap } from './ChapterMap';
import { GlossaryPanel } from './GlossaryPanel';
import { ProgressBar } from './ProgressBar';
import { ResultTable } from './ResultTable';
import { RogueSprite } from './RogueSprite';
import { SchemaExplorer } from './SchemaExplorer';
import { SqlEditor } from './SqlEditor';
import iconBadge from '../assets/ui/icon-badge.png';
import iconPoints from '../assets/ui/icon-points.png';
import iconRestored from '../assets/ui/icon-restored.png';
import { chapterNumber } from '../content/chapters';
import { findGlossaryEntryForConcept } from '../content/glossary';
import { classifyAttempt, type MistakeSignature } from '../lib/diagnostics';
import { validateResult, type QueryResult } from '../lib/grading';
import { rogueInvalidQueryLine, rogueWrongResultLine, type Mission } from '../lib/missions';
import { completeMission, type Progress } from '../lib/progress';
import { runMissionQuery } from '../lib/sqlRunner';

type Feedback =
  | { tone: 'error'; heading: string; text: string }
  | {
      tone: 'success';
      heading: string;
      text: string;
      isNewCompletion: boolean;
      newBadge?: string;
      sectorNowComplete: boolean;
      campaignNowComplete: boolean;
    }
  | undefined;

type MissionViewProps = {
  mission: Mission;
  missions: Mission[];
  progress: Progress;
  onProgressChange: (next: Progress) => void;
  onSelectMission: (mission: Mission) => void;
  onBackToHome: () => void;
};

export function MissionView({ mission, missions, progress, onProgressChange, onSelectMission, onBackToHome }: MissionViewProps) {
  const [sql, setSql] = useState(mission.starterSql);
  const [result, setResult] = useState<QueryResult>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryEntryId, setGlossaryEntryId] = useState<string | undefined>(undefined);
  const glossaryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const completed = progress.completedMissionIds.includes(mission.id);
  const pointsRef = useRef(progress.points);
  const [pointsPulsing, setPointsPulsing] = useState(false);
  // Counts wrong-but-executed attempts on this mission visit only (resets on
  // remount, e.g. leaving and coming back — same lifetime as hintCount).
  // Never incremented by an invalid-SQL attempt, since classification needs
  // an executed result to read.
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [diagnostic, setDiagnostic] = useState<MistakeSignature | undefined>(undefined);

  function openGlossary(entryId: string | undefined, trigger: HTMLButtonElement) {
    setGlossaryEntryId(entryId);
    glossaryTriggerRef.current = trigger;
    setIsGlossaryOpen(true);
  }

  const conceptEntryId = findGlossaryEntryForConcept(mission.concept)?.id;

  useEffect(() => {
    if (progress.points === pointsRef.current) return;
    pointsRef.current = progress.points;
    setPointsPulsing(true);
    const timeout = setTimeout(() => setPointsPulsing(false), 700);
    return () => clearTimeout(timeout);
  }, [progress.points]);

  async function runQuery() {
    setIsRunning(true);
    setFeedback(undefined);
    setResult(undefined);
    setDiagnostic(undefined);
    const outcome = await runMissionQuery(sql, { allowsTempWorkspace: mission.allowsTempWorkspace });
    setIsRunning(false);
    if (!outcome.ok) {
      setFeedback({ tone: 'error', heading: rogueInvalidQueryLine, text: outcome.message });
      return;
    }
    setResult(outcome.result);
    const validation = validateResult(outcome.result, mission.expected, { orderMatters: mission.orderMatters });
    if (!validation.correct) {
      setFeedback({ tone: 'error', heading: rogueWrongResultLine, text: validation.message });
      const nextWrongAttemptCount = wrongAttemptCount + 1;
      setWrongAttemptCount(nextWrongAttemptCount);
      if (nextWrongAttemptCount >= 2) {
        setDiagnostic(classifyAttempt(mission.id, sql, outcome.result));
      }
      return;
    }
    const isNewCompletion = !completed;
    const newBadge = isNewCompletion && mission.badge && !progress.badges.includes(mission.badge) ? mission.badge : undefined;
    const nextProgress = completeMission(progress, mission.id, mission.points, mission.badge);
    onProgressChange(nextProgress);
    const sectorMissions = missions.filter((candidate) => chapterNumber(candidate) === chapterNumber(mission));
    const sectorNowComplete = isNewCompletion && sectorMissions.every((candidate) => nextProgress.completedMissionIds.includes(candidate.id));
    const campaignNowComplete = isNewCompletion && missions.every((candidate) => nextProgress.completedMissionIds.includes(candidate.id));
    setFeedback({
      tone: 'success',
      heading: completed ? 'Terminal already restored' : `Terminal restored: +${mission.points} points`,
      text: mission.successLesson,
      isNewCompletion,
      newBadge,
      sectorNowComplete,
      campaignNowComplete,
    });
  }

  return (
    <main className="app-shell mission-view" aria-labelledby="page-title">
      <a className="skip-link" href="#mission">
        Skip to active mission
      </a>
      <header className="terminal-hud">
        <div>
          <p className="eyebrow">Aurora Music mainframe · active terminal</p>
          <h1 id="page-title">Metric Quest</h1>
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <strong className={pointsPulsing ? 'points-pulse' : undefined}>
            <img className="icon-inline" src={iconPoints} alt="" aria-hidden="true" />
            {progress.points} points
          </strong>
          <ProgressBar label="Mainframe integrity" completed={progress.completedMissionIds.length} total={missions.length} />
        </section>
      </header>

      {isGlossaryOpen && (
        <GlossaryPanel
          initialEntryId={glossaryEntryId}
          onClose={() => {
            setIsGlossaryOpen(false);
            glossaryTriggerRef.current?.focus();
          }}
        />
      )}

      <div className="game-layout">
        <ChapterMap
          missions={missions}
          completedMissionIds={progress.completedMissionIds}
          activeMissionId={mission.id}
          onSelectMission={onSelectMission}
          onBack={onBackToHome}
        />

        <section id="mission" className="mission-workspace" aria-labelledby="mission-title">
          <p className="eyebrow">
            {mission.chapter} ·{' '}
            <button type="button" className="concept-tag-link" onClick={(event) => openGlossary(conceptEntryId, event.currentTarget)}>
              {mission.concept}
            </button>
          </p>
          <h2 id="mission-title">{mission.title}</h2>
          <p className="brief type-reveal">{mission.brief}</p>

          {mission.id === 'm8-1' && (
            <aside className="rogue-encounter rogue-boss-moment" aria-label="ROGUE.exe transmission">
              <RogueSprite state="corrupted" className="rogue-sprite-boss" />
              <p className="rogue-boss-line type-reveal">
                <strong>ROGUE.exe:</strong> &ldquo;Verification is such a delightfully inefficient human habit.&rdquo;
              </p>
            </aside>
          )}

          <div className="two-column">
            <SchemaExplorer tables={mission.visibleTables} relationships={mission.relationships} />
            <section className="panel" aria-labelledby="rewards-title">
              <h3 id="rewards-title">Terminal reward</h3>
              <p>
                <strong>{mission.points} points</strong>
                {mission.badge ? ` · ${mission.badge} badge` : ''}
              </p>
              {completed && <p>Purged terminals can be replayed without changing your points.</p>}
            </section>
          </div>

          <section className="panel sql-editor-panel" aria-labelledby="editor-title">
            <div className="editor-header">
              <h3 id="editor-title">SQL editor</h3>
              {/* P5.2: the "syntax highlighting and autocomplete" placeholder tag is
                  removed from view (too much on-screen text) but the future item it
                  tracked is not dropped — see BACKLOG.md item 6's clarifying note. */}
            </div>
            <span className="sql-label" id="sql-label">
              Write a read-only SQL query
            </span>
            <SqlEditor
              id="sql-editor"
              value={sql}
              onChange={setSql}
              ariaLabelledBy="sql-label"
              ariaDescribedBy={mission.allowsTempWorkspace ? 'runner-note' : undefined}
            />
            {/* P5.2: the generic "runs locally, nothing leaves your machine, one SELECT"
                boilerplate is removed (players don't need it explained every mission),
                but the two-statement setup-statement allowance stays for the two
                temp-workspace missions — that's functional information about what the
                runner will accept, not filler, and the starter SQL's own comments don't
                reliably survive a player editing/deleting them. */}
            {mission.allowsTempWorkspace && (
              <p id="runner-note" className="subtle">
                This terminal accepts one setup statement (CREATE TEMP TABLE or CREATE TEMP VIEW) followed by one read-only SELECT to grade — or a
                single equivalent SELECT.
              </p>
            )}
            <div className="actions sql-editor-actions">
              <button type="button" className={isRunning ? 'primary running' : 'primary'} onClick={() => void runQuery()} disabled={isRunning}>
                {isRunning ? 'Running query…' : 'Run query'}
              </button>
              <button
                type="button"
                onClick={() => setHintCount((count) => Math.min(count + 1, mission.hints.length))}
                disabled={hintCount === mission.hints.length}
              >
                {hintCount === mission.hints.length ? 'All hints shown' : `Show hint${hintCount ? ` ${hintCount + 1}` : ''}`}
              </button>
              <button type="button" className="link-button" onClick={(event) => openGlossary(undefined, event.currentTarget)}>
                Concept glossary
              </button>
              {/* P5.3: was an always-visible "Reveal example query" button. mission.solutionSql
                  is the actual reference answer, not a lighter "example," so it only becomes
                  available after 3 consecutive wrong attempts on this mission visit (reuses the
                  same wrongAttemptCount counter the mistake-aware diagnostic already gates at 2). */}
              {wrongAttemptCount >= 3 && (
                <button type="button" onClick={() => setShowSolution((shown) => !shown)}>
                  {showSolution ? 'Hide answer' : 'See answer'}
                </button>
              )}
            </div>
          </section>

          {hintCount > 0 && (
            <section className="hints" aria-label="Mission hints">
              <h3>Hints</h3>
              <ol>
                {mission.hints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            </section>
          )}
          {showSolution && (
            <section className="solution" aria-label="Answer">
              <h3>Answer</h3>
              <pre>
                <code>{mission.solutionSql}</code>
              </pre>
            </section>
          )}
          {feedback && (
            <section
              className={`feedback ${feedback.tone}${feedback.tone === 'success' && feedback.isNewCompletion ? ' mission-complete' : ''}`}
              aria-live="polite"
              role="status"
            >
              {feedback.tone === 'success' && feedback.isNewCompletion && (feedback.campaignNowComplete || feedback.sectorNowComplete) && (
                <p className="milestone-banner">{feedback.campaignNowComplete ? 'Campaign complete — mainframe restored' : 'Sector cleared'}</p>
              )}
              <div className="feedback-signal">
                {feedback.tone === 'success' ? (
                  <img className="feedback-icon success" src={iconRestored} alt="" aria-hidden="true" />
                ) : (
                  <span className="feedback-icon error" aria-hidden="true" />
                )}
                <div>
                  <h3>{feedback.heading}</h3>
                  {feedback.tone === 'success' && feedback.isNewCompletion && (
                    <span className="points-chip" aria-hidden="true">
                      +{mission.points} pts
                    </span>
                  )}
                </div>
              </div>
              <p>{feedback.text}</p>
              {feedback.tone === 'error' && diagnostic && (
                <div className="diagnostic">
                  <p className="diagnostic-label">Likely cause: {diagnostic.label}</p>
                  <p>{diagnostic.explanation}</p>
                  {diagnostic.glossaryEntryId && (
                    <button
                      type="button"
                      className="link-button"
                      onClick={(event) => openGlossary(diagnostic.glossaryEntryId, event.currentTarget)}
                    >
                      See glossary entry
                    </button>
                  )}
                </div>
              )}
              {feedback.tone === 'success' && feedback.newBadge && (
                <p className="badge-unlock">
                  <img className="icon-inline" src={iconBadge} alt="" aria-hidden="true" /> Badge unlocked: <strong>{feedback.newBadge}</strong>
                </p>
              )}
            </section>
          )}
          {result && <ResultTable result={result} />}
        </section>
      </div>

      <footer className="badges mission-badges" aria-label="Earned badges">
        <strong>Badges:</strong>
        {progress.badges.length ? (
          progress.badges.map((badge) => (
            <span key={badge} className="badge">
              <img className="icon-inline" src={iconBadge} alt="" aria-hidden="true" />
              {badge}
            </span>
          ))
        ) : (
          <span>Purge Priority invoices or Duplicate-customer trap to earn a badge.</span>
        )}
      </footer>
    </main>
  );
}
