import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiTutorPanel } from './AiTutorPanel';
import { ChapterMap } from './ChapterMap';
import { GlossaryPanel } from './GlossaryPanel';
import { ProgressBar } from './ProgressBar';
import { ResultTable } from './ResultTable';
import { RogueSprite } from './RogueSprite';
import { SchemaExplorer } from './SchemaExplorer';
import iconBadge from '../assets/ui/icon-badge.png';
import iconCorruption from '../assets/ui/icon-corruption.png';
import iconPoints from '../assets/ui/icon-points.png';
import iconRestored from '../assets/ui/icon-restored.png';
import { type TutorContext } from '../lib/aiTutor';
import { chapterNumber } from '../content/chapters';
import { findGlossaryEntryForConcept } from '../content/glossary';
import { sectorMusic } from '../content/sectorMusic';
import { classifyAttempt, type MistakeSignature } from '../lib/diagnostics';
import { validateResult, type QueryResult } from '../lib/grading';
import { rogueInvalidQueryLine, rogueWrongResultLine, type Mission } from '../lib/missions';
import { completeMission, type Progress } from '../lib/progress';
import { playSfx } from '../content/sfx';
import { runMissionQuery } from '../lib/sqlRunner';
import { useFocusTrap } from '../lib/useFocusTrap';

// CodeMirror (via SqlEditor) is the single largest dependency in the main
// bundle. Every other screen (Home, avatar creator, cutscenes) never needs
// it, so it is loaded on demand here rather than eagerly with the rest of
// MissionView — a loading-strategy change only, not a behavior change: same
// props, same DOM shape once loaded.
const SqlEditor = lazy(() => import('./SqlEditor').then((module) => ({ default: module.SqlEditor })));

// Release plan (docs/RELEASE_2026-08-11.md), Track A: the tutor's api/
// routes need MONET_CLIENT_ID/MONET_CLIENT_SECRET configured in Vercel,
// which hasn't happened yet — a visible control with no working backend is
// release-blocking. Flip this back on once those secrets are set and the
// Track B smoke test has run (see BACKLOG.md item 3). No tutor code below
// was removed, just gated off.
const AI_TUTOR_ENABLED = false;

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
  isMusicMuted: boolean;
  onToggleMusicMute: () => void;
  onProgressChange: (next: Progress) => void;
  onSelectMission: (mission: Mission) => void;
  onBackToHome: () => void;
};

export function MissionView({
  mission,
  missions,
  progress,
  isMusicMuted,
  onToggleMusicMute,
  onProgressChange,
  onSelectMission,
  onBackToHome,
}: MissionViewProps) {
  const [sql, setSql] = useState(mission.starterSql);
  const [result, setResult] = useState<QueryResult>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryEntryId, setGlossaryEntryId] = useState<string | undefined>(undefined);
  const glossaryTriggerRef = useRef<HTMLButtonElement | null>(null);
  // P5.4: the sector map is a collapsed-by-default drawer off a header
  // trigger rather than a permanent sidebar. Focus handling mirrors
  // GlossaryPanel's overlay pattern (focus the close control on open,
  // trap Tab inside, Escape closes, return focus to the trigger on close).
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mapPanelRef = useRef<HTMLDivElement>(null);
  const mapCloseButtonRef = useRef<HTMLButtonElement>(null);
  const mapTriggerRef = useRef<HTMLButtonElement | null>(null);
  const completed = progress.completedMissionIds.includes(mission.id);
  const pointsRef = useRef(progress.points);
  const [pointsPulsing, setPointsPulsing] = useState(false);
  // Counts wrong-but-executed attempts on this mission visit only (resets on
  // remount, e.g. leaving and coming back — same lifetime as hintCount).
  // Never incremented by an invalid-SQL attempt, since classification needs
  // an executed result to read.
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [diagnostic, setDiagnostic] = useState<MistakeSignature | undefined>(undefined);
  // Furls the editor once a mission is graded correct, so the player mainly
  // sees the "terminal restored" feedback instead of a wall of SQL they've
  // already solved. They can still reopen it (e.g. to tweak and re-run) via
  // the disclosure's own summary toggle.
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const nextMission = useMemo(() => {
    const index = missions.findIndex((candidate) => candidate.id === mission.id);
    return index === -1 ? undefined : missions[index + 1];
  }, [missions, mission.id]);
  const sectorTrack = sectorMusic[chapterNumber(mission)];
  const musicRef = useRef<HTMLAudioElement>(null);

  // Same cold-start autoplay limitation as TitleScreen/CutsceneView: the
  // first play() on a page needs a user gesture in its own call stack, so
  // this best-effort attempt on mount is backed up by retrying from the
  // capture-phase click handler below, which is guaranteed gesture-attached.
  function tryPlayMusic() {
    const audioEl = musicRef.current;
    if (audioEl && audioEl.paused) {
      void audioEl.play().catch(() => {});
    }
  }

  useEffect(() => {
    tryPlayMusic();
    const audioEl = musicRef.current;
    return () => audioEl?.pause();
    // Mission is keyed by App.tsx (key={activeMission.id}), so this effect's
    // cleanup/re-run boundary already matches a mission change — no need to
    // depend on sectorTrack explicitly.
  }, []);

  useEffect(() => {
    if (musicRef.current) musicRef.current.muted = isMusicMuted;
  }, [isMusicMuted]);

  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const aiTutorButtonRef = useRef<HTMLButtonElement>(null);

  // Rebuilt whenever the player's SQL, last result, or diagnostic changes,
  // so the tutor always sees the current state of their attempt rather than
  // a stale snapshot from when the panel was first opened.
  const tutorContext = useMemo<TutorContext>(
    () => ({
      missionTitle: mission.title,
      missionBrief: mission.brief,
      concept: mission.concept,
      visibleTables: mission.visibleTables,
      relationships: mission.relationships,
      currentSql: sql,
      lastResult: result,
      diagnosticLabel: diagnostic?.label,
    }),
    [mission, sql, result, diagnostic],
  );

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

  const closeMap = useCallback(() => {
    setIsMapOpen(false);
    mapTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isMapOpen) mapCloseButtonRef.current?.focus();
  }, [isMapOpen]);
  useFocusTrap(mapPanelRef, closeMap, isMapOpen);

  async function runQuery() {
    setIsRunning(true);
    setFeedback(undefined);
    setResult(undefined);
    setDiagnostic(undefined);
    playSfx('queryRun', isMusicMuted);
    const outcome = await runMissionQuery(sql, { allowsTempWorkspace: mission.allowsTempWorkspace });
    setIsRunning(false);
    if (!outcome.ok) {
      setFeedback({ tone: 'error', heading: rogueInvalidQueryLine, text: outcome.message });
      playSfx('queryError', isMusicMuted);
      return;
    }
    setResult(outcome.result);
    const validation = validateResult(outcome.result, mission.expected, { orderMatters: mission.orderMatters });
    if (!validation.correct) {
      setFeedback({ tone: 'error', heading: rogueWrongResultLine, text: validation.message });
      playSfx('queryError', isMusicMuted);
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
    playSfx(sectorNowComplete || campaignNowComplete ? 'sectorComplete' : 'querySuccess', isMusicMuted);
    setIsEditorCollapsed(true);
  }

  return (
    <main className="app-shell mission-view" aria-labelledby="page-title" onClickCapture={tryPlayMusic}>
      {sectorTrack && <audio ref={musicRef} src={sectorTrack} loop muted={isMusicMuted} aria-hidden="true" />}
      <a className="skip-link" href="#mission">
        Skip to active mission
      </a>
      <header className="terminal-hud">
        <div className="terminal-hud-title">
          <p className="eyebrow">
            {mission.chapter} ·{' '}
            <button type="button" className="concept-tag-link" onClick={(event) => openGlossary(conceptEntryId, event.currentTarget)}>
              {mission.concept}
            </button>
          </p>
          <h1 id="page-title">{mission.title}</h1>
          <button
            type="button"
            className="map-toggle"
            aria-expanded={isMapOpen}
            aria-controls="sector-map-drawer"
            onClick={() => setIsMapOpen(true)}
            ref={mapTriggerRef}
          >
            Browse sectors
          </button>
          {sectorTrack && (
            <button type="button" className="link-button cutscene-mute-toggle" onClick={onToggleMusicMute}>
              {isMusicMuted ? 'Unmute music' : 'Mute music'}
            </button>
          )}
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <ProgressBar label="Mainframe integrity" completed={progress.completedMissionIds.length} total={missions.length} />
          <strong className={pointsPulsing ? 'points-pulse' : undefined}>
            <img className="icon-inline" src={iconPoints} alt="" aria-hidden="true" />
            {progress.points} points
          </strong>
        </section>
        <section className="panel header-reward" aria-labelledby="rewards-title">
          <div className="header-reward-text">
            <h2 id="rewards-title">Terminal reward</h2>
            <p>
              <strong>{mission.points} points</strong>
              {mission.badge ? ` · ${mission.badge} badge` : ''}
            </p>
            {completed && <p>Purged terminals can be replayed without changing your points.</p>}
          </div>
          <details className="badges-disclosure">
            <summary>Badges{progress.badges.length ? ` (${progress.badges.length})` : ''}</summary>
            <div className="badges-list">
              {progress.badges.length ? (
                progress.badges.map((badge) => (
                  <span key={badge} className="badge">
                    <img className="icon-inline" src={iconBadge} alt="" aria-hidden="true" />
                    {badge}
                  </span>
                ))
              ) : (
                <p className="subtle">Purge Priority invoices or Duplicate-customer trap to earn a badge.</p>
              )}
            </div>
          </details>
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

      {AI_TUTOR_ENABLED && isAiTutorOpen && (
        <AiTutorPanel
          context={tutorContext}
          onClose={() => {
            setIsAiTutorOpen(false);
            aiTutorButtonRef.current?.focus();
          }}
        />
      )}

      {isMapOpen && (
        <div
          className="sector-map-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMap();
          }}
        >
          <div id="sector-map-drawer" className="sector-map-drawer" role="dialog" aria-modal="true" aria-label="Sector map" ref={mapPanelRef}>
            <div className="sector-map-drawer-actions">
              <button type="button" className="link-button" onClick={closeMap} ref={mapCloseButtonRef}>
                <span aria-hidden="true">✕ </span>Close
              </button>
              <button type="button" className="link-button" onClick={onBackToHome}>
                <span aria-hidden="true">← </span>Back to main screen
              </button>
            </div>
            <ChapterMap
              missions={missions}
              completedMissionIds={progress.completedMissionIds}
              activeMissionId={mission.id}
              onSelectMission={(selected) => {
                setIsMapOpen(false);
                onSelectMission(selected);
              }}
              alwaysOpen
            />
          </div>
        </div>
      )}

      <div className="game-layout">
        <section id="mission" className="mission-workspace" aria-labelledby="page-title">
          <p className="brief type-reveal">{mission.brief}</p>

          {mission.id === 'm8-1' && (
            <aside className="rogue-encounter rogue-boss-moment" aria-label="ROGUE.exe transmission">
              <RogueSprite state="corrupted" className="rogue-sprite-boss" />
              <p className="rogue-boss-line type-reveal">
                <strong>ROGUE.exe:</strong> &ldquo;Verification is such a delightfully inefficient human habit.&rdquo;
              </p>
            </aside>
          )}

          <SchemaExplorer tables={mission.visibleTables} relationships={mission.relationships} />

          <details
            className="panel sql-editor-panel"
            open={!isEditorCollapsed}
            onToggle={(event) => setIsEditorCollapsed(!event.currentTarget.open)}
          >
            <summary className="editor-header">
              <h3 id="editor-title">SQL editor</h3>
              {/* P5.2: the "syntax highlighting and autocomplete" placeholder tag is
                  removed from view (too much on-screen text) but the future item it
                  tracked is not dropped — see BACKLOG.md item 6's clarifying note. */}
              {isEditorCollapsed && <span className="subtle">Click to edit query</span>}
            </summary>
            <span className="sql-label sr-only" id="sql-label">
              Write a read-only SQL query
            </span>
            <Suspense fallback={<div className="sql-editor" aria-hidden="true" />}>
              <SqlEditor
                id="sql-editor"
                value={sql}
                onChange={setSql}
                onRunQuery={() => void runQuery()}
                ariaLabelledBy="sql-label"
                ariaDescribedBy={mission.allowsTempWorkspace ? 'runner-note' : undefined}
              />
            </Suspense>
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
              {AI_TUTOR_ENABLED && (
                <button type="button" className="link-button" onClick={() => setIsAiTutorOpen(true)} ref={aiTutorButtonRef}>
                  Friendly AI tutor
                </button>
              )}
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
          </details>

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
                  <img className="feedback-icon error" src={iconCorruption} alt="" aria-hidden="true" />
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
              {feedback.tone === 'success' && nextMission && (
                <button type="button" className="start-button next-mission-button" onClick={() => onSelectMission(nextMission)}>
                  {feedback.sectorNowComplete ? 'Next sector' : 'Next mission'}
                </button>
              )}
            </section>
          )}
          {result && <ResultTable result={result} />}
        </section>
      </div>
    </main>
  );
}
