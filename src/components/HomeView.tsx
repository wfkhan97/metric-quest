import { useEffect, useRef, useState } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { ChapterMap } from './ChapterMap';
import { GlossaryPanel } from './GlossaryPanel';
import { PrimerReviewPanel } from './PrimerReviewPanel';
import { ProgressBar } from './ProgressBar';
import { ProgressSummaryPanel } from './ProgressSummaryPanel';
import { SaveSlotPanel } from './SaveSlotPanel';
import iconBadge from '../assets/ui/icon-badge.png';
import iconPoints from '../assets/ui/icon-points.png';
import { type Mission } from '../lib/missions';
import { getActiveSaveId, type Progress } from '../lib/progress';

type HomeViewProps = {
  missions: Mission[];
  progress: Progress;
  onSelectMission: (mission: Mission) => void;
  onEditAvatar: () => void;
  /** Undefined until the opening cutscene has been seen once — nothing to replay yet. */
  onReplayOpening?: () => void;
  /** Always available once Home is reached, including on older saves. */
  onReplayTutorial: () => void;
  /** Undefined until the mentor-intro beat has been seen once — nothing to replay yet. */
  onReplayMentorIntro?: () => void;
  /** Called after a save-slot switch, create, or delete-of-active changes
   * which progress is active — App owns `progress` state and needs to sync. */
  onActiveProgressChange: (progress: Progress) => void;
  /** Learn SQL Mode (docs/BACKLOG.md item 13 Part B1): off by default. */
  learnSqlMode: boolean;
  onToggleLearnSqlMode: () => void;
  /** Sector numbers whose mentor primer has already played once — the only ones "Review SQL primers" can replay. */
  seenPrimerSectors: number[];
  onReviewPrimer: (sector: number) => void;
};

export function HomeView({
  missions,
  progress,
  onSelectMission,
  onEditAvatar,
  onReplayOpening,
  onReplayTutorial,
  onReplayMentorIntro,
  onActiveProgressChange,
  learnSqlMode,
  onToggleLearnSqlMode,
  seenPrimerSectors,
  onReviewPrimer,
}: HomeViewProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSaveSlotsOpen, setIsSaveSlotsOpen] = useState(false);
  const [isProgressSummaryOpen, setIsProgressSummaryOpen] = useState(false);
  const [isPrimerReviewOpen, setIsPrimerReviewOpen] = useState(false);
  const glossaryButtonRef = useRef<HTMLButtonElement>(null);
  const saveSlotsButtonRef = useRef<HTMLButtonElement>(null);
  const progressSummaryButtonRef = useRef<HTMLButtonElement>(null);
  const primerReviewButtonRef = useRef<HTMLButtonElement>(null);

  // Monet's OAuth callback redirects back here with ?connected=<provider>
  // once the connection is live (the tutor itself lives in MissionView, not
  // Home — there's no mission context to chat about here). Just drop the
  // query param so a page refresh doesn't leave it dangling.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('connected')) return;
    params.delete('connected');
    const nextSearch = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (nextSearch ? `?${nextSearch}` : ''));
  }, []);
  const nextMission = missions.find((mission) => !progress.completedMissionIds.includes(mission.id));
  const allComplete = !nextMission;
  const ctaMission = nextMission ?? missions[0];
  const hasStarted = progress.completedMissionIds.length > 0;

  return (
    <main className="app-shell home-view" aria-labelledby="page-title">
      <a className="skip-link" href="#home-main">
        Skip to onboarding content
      </a>
      <header className="terminal-hud">
        <div>
          <p className="eyebrow">Aurora Music mainframe · analyst access</p>
          <h1 id="page-title">Metric Quest</h1>
          <button type="button" className="link-button" onClick={() => setIsGlossaryOpen(true)} ref={glossaryButtonRef}>
            Concept glossary
          </button>
          <button type="button" className="link-button" onClick={() => setIsSaveSlotsOpen(true)} ref={saveSlotsButtonRef}>
            Save slots
          </button>
          <button type="button" className="link-button" onClick={() => setIsProgressSummaryOpen(true)} ref={progressSummaryButtonRef}>
            Progress report
          </button>
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <strong>
            <img className="icon-inline" src={iconPoints} alt="" aria-hidden="true" />
            {progress.points} points
          </strong>
          <span>
            {progress.completedMissionIds.length} of {missions.length} terminals purged
          </span>
        </section>
      </header>

      {isGlossaryOpen && (
        <GlossaryPanel
          onClose={() => {
            setIsGlossaryOpen(false);
            glossaryButtonRef.current?.focus();
          }}
        />
      )}

      {isSaveSlotsOpen && (
        <SaveSlotPanel
          activeSlotId={getActiveSaveId()}
          onActiveProgressChange={onActiveProgressChange}
          onClose={() => {
            setIsSaveSlotsOpen(false);
            saveSlotsButtonRef.current?.focus();
          }}
        />
      )}

      {isProgressSummaryOpen && (
        <ProgressSummaryPanel
          missions={missions}
          progress={progress}
          onClose={() => {
            setIsProgressSummaryOpen(false);
            progressSummaryButtonRef.current?.focus();
          }}
        />
      )}

      {isPrimerReviewOpen && (
        <PrimerReviewPanel
          sectors={seenPrimerSectors}
          onSelect={(sector) => {
            setIsPrimerReviewOpen(false);
            onReviewPrimer(sector);
          }}
          onClose={() => {
            setIsPrimerReviewOpen(false);
            primerReviewButtonRef.current?.focus();
          }}
        />
      )}

      <div id="home-main" className="home-content">
        <section className="panel intro-panel" aria-labelledby="brief-title">
          <h2 id="brief-title">Incident brief</h2>
          <p>
            You&apos;re Aurora Music&apos;s data scientist. Leadership fast-tracked an automated analyst, ROGUE.exe, into
            production to ship reports faster — without the verification a human analyst would have demanded. It is now
            fabricating conclusions, corrupting data, and locking the real analysts out of the truth.
          </p>
          <p>
            Logging in pulled you into the mainframe. Purge each corrupted terminal with real SQL, restore the real
            numbers, and make it out sector by sector.
          </p>
          <ol className="how-it-works">
            <li>
              <strong>Read the terminal brief.</strong> Every corrupted terminal still holds a real business question and
              the decision that depends on it.
            </li>
            <li>
              <strong>Write a query.</strong> The schema for that terminal is listed so you know exactly what's still
              intact.
            </li>
            <li>
              <strong>Run it locally and verify.</strong> Your SQL executes against the real dataset; the mainframe checks
              the executed result, never just the query text.
            </li>
          </ol>
        </section>

        <section className="panel progress-panel" aria-labelledby="progress-title">
          <h2 id="progress-title">Status console</h2>
          <ProgressBar label="Mainframe integrity" completed={progress.completedMissionIds.length} total={missions.length} />
          <p className="badges-summary">
            <strong>Recovered badges:</strong>{' '}
            {progress.badges.length ? (
              progress.badges.map((badge) => (
                <span key={badge} className="badge">
                  <img className="icon-inline" src={iconBadge} alt="" aria-hidden="true" />
                  {badge}
                </span>
              ))
            ) : (
              <span>Purge a terminal to earn your first badge.</span>
            )}
          </p>
          {progress.avatar && (
            <div className="avatar-summary">
              <AvatarPreview spriteId={progress.avatar.spriteId} colorId={progress.avatar.colorId} size={40} />
              <span>
                Badge on file: <strong>{progress.avatar.callsign}</strong>
              </span>
              <button type="button" className="link-button" onClick={onEditAvatar}>
                Redo your badge
              </button>
            </div>
          )}
          <button type="button" className="start-button" onClick={() => onSelectMission(ctaMission)}>
            {allComplete ? 'Replay a sector' : hasStarted ? `Resume: ${ctaMission.title}` : `Enter Sector 1: ${ctaMission.title}`}
          </button>
          <div className="home-review-controls" aria-label="Review controls">
            {onReplayOpening && (
              <button type="button" className="link-button" onClick={onReplayOpening}>
                Replay opening
              </button>
            )}
            <button type="button" className="link-button" onClick={onReplayTutorial}>
              Review controls
            </button>
            {onReplayMentorIntro && (
              <button type="button" className="link-button" onClick={onReplayMentorIntro}>
                Meet ECHO again
              </button>
            )}
            <button type="button" className="link-button" onClick={onToggleLearnSqlMode}>
              Learn SQL Mode: {learnSqlMode ? 'On' : 'Off'}
            </button>
            {seenPrimerSectors.length > 0 && (
              <button type="button" className="link-button" onClick={() => setIsPrimerReviewOpen(true)} ref={primerReviewButtonRef}>
                Review SQL primers
              </button>
            )}
          </div>
        </section>

        <ChapterMap
          missions={missions}
          completedMissionIds={progress.completedMissionIds}
          onSelectMission={onSelectMission}
          heading="Sector map"
        />
      </div>
    </main>
  );
}
