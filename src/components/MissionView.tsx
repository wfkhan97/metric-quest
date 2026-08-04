import { useState } from 'react';
import { ChapterMap } from './ChapterMap';
import { ProgressBar } from './ProgressBar';
import { ResultTable } from './ResultTable';
import { SchemaExplorer } from './SchemaExplorer';
import { validateResult, type QueryResult } from '../lib/grading';
import { rogueInvalidQueryLine, rogueWrongResultLine, type Mission } from '../lib/missions';
import { completeMission, type Progress } from '../lib/progress';
import { runMissionQuery } from '../lib/sqlRunner';

type Feedback = { tone: 'success' | 'error'; heading: string; text: string } | undefined;

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
  const completed = progress.completedMissionIds.includes(mission.id);

  async function runQuery() {
    setIsRunning(true);
    setFeedback(undefined);
    setResult(undefined);
    const outcome = await runMissionQuery(sql);
    setIsRunning(false);
    if (!outcome.ok) {
      setFeedback({ tone: 'error', heading: rogueInvalidQueryLine, text: outcome.message });
      return;
    }
    setResult(outcome.result);
    const validation = validateResult(outcome.result, mission.expected, { orderMatters: mission.orderMatters });
    if (!validation.correct) {
      setFeedback({ tone: 'error', heading: rogueWrongResultLine, text: validation.message });
      return;
    }
    const nextProgress = completeMission(progress, mission.id, mission.points, mission.badge);
    onProgressChange(nextProgress);
    setFeedback({
      tone: 'success',
      heading: completed ? 'Terminal already restored' : `Terminal restored: +${mission.points} points`,
      text: mission.successLesson,
    });
  }

  return (
    <main className="app-shell" aria-labelledby="page-title">
      <a className="skip-link" href="#mission">
        Skip to active mission
      </a>
      <header className="masthead">
        <div>
          <p className="eyebrow">Aurora Music mainframe · Day one, unauthorized access granted</p>
          <h1 id="page-title">Metric Quest</h1>
          <button type="button" className="link-button" onClick={onBackToHome}>
            ← Back to sector map
          </button>
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <strong>{progress.points} points</strong>
          <ProgressBar label="Mainframe integrity" completed={progress.completedMissionIds.length} total={missions.length} />
        </section>
      </header>

      <div className="game-layout">
        <ChapterMap
          missions={missions}
          completedMissionIds={progress.completedMissionIds}
          activeMissionId={mission.id}
          onSelectMission={onSelectMission}
        />

        <section id="mission" className="mission-workspace" aria-labelledby="mission-title">
          <p className="eyebrow">
            {mission.chapter} · {mission.concept}
          </p>
          <h2 id="mission-title">{mission.title}</h2>
          <p className="brief">{mission.brief}</p>

          <div className="two-column">
            <SchemaExplorer tables={mission.visibleTables} />
            <section className="panel" aria-labelledby="rewards-title">
              <h3 id="rewards-title">Terminal reward</h3>
              <p>
                <strong>{mission.points} points</strong>
                {mission.badge ? ` · ${mission.badge} badge` : ''}
              </p>
              <p>
                {completed
                  ? 'Purged terminals can be replayed without changing your points.'
                  : 'Points are awarded once; hints never lock progress.'}
              </p>
            </section>
          </div>

          <section className="panel sql-editor-panel" aria-labelledby="editor-title">
            <div className="editor-header">
              <h3 id="editor-title">SQL editor</h3>
              <span className="placeholder-tag">Placeholder — syntax highlighting and autocomplete are coming in a later release</span>
            </div>
            <label className="sql-label" htmlFor="sql-editor">
              Write a read-only SQL query
            </label>
            <textarea
              id="sql-editor"
              className="sql-editor"
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              spellCheck="false"
              aria-describedby="runner-note"
            />
            <p id="runner-note" className="subtle">
              Runs locally in your browser against the real dataset behind this terminal — nothing leaves your machine. This
              Week 1 runner allows one read-only SELECT query.
            </p>
            <div className="actions">
              <button type="button" className="primary" onClick={() => void runQuery()} disabled={isRunning}>
                {isRunning ? 'Running query…' : 'Run query'}
              </button>
              <button
                type="button"
                onClick={() => setHintCount((count) => Math.min(count + 1, mission.hints.length))}
                disabled={hintCount === mission.hints.length}
              >
                Show hint{hintCount ? ` ${hintCount + 1}` : ''}
              </button>
              <button type="button" onClick={() => setShowSolution((shown) => !shown)}>
                {showSolution ? 'Hide example' : 'Reveal example query'}
              </button>
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
            <section className="solution" aria-label="Example query">
              <h3>Example query</h3>
              <pre>
                <code>{mission.solutionSql}</code>
              </pre>
            </section>
          )}
          {feedback && (
            <section className={`feedback ${feedback.tone}`} aria-live="polite" role="status">
              <h3>{feedback.heading}</h3>
              <p>{feedback.text}</p>
            </section>
          )}
          {result && <ResultTable result={result} />}
        </section>
      </div>

      <footer className="badges" aria-label="Earned badges">
        <strong>Badges:</strong>
        {progress.badges.length ? (
          progress.badges.map((badge) => (
            <span key={badge} className="badge">
              ★ {badge}
            </span>
          ))
        ) : (
          <span>Purge Priority invoices or Duplicate-customer trap to earn a badge.</span>
        )}
      </footer>
    </main>
  );
}
