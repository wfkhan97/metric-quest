import { useEffect, useRef, useState } from 'react';
import { AiTutorPanel } from './AiTutorPanel';
import { AvatarPreview } from './AvatarPreview';
import { ChapterMap } from './ChapterMap';
import { GlossaryPanel } from './GlossaryPanel';
import { ProgressBar } from './ProgressBar';
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
  /** Called after a save-slot switch, create, or delete-of-active changes
   * which progress is active — App owns `progress` state and needs to sync. */
  onActiveProgressChange: (progress: Progress) => void;
};

export function HomeView({
  missions,
  progress,
  onSelectMission,
  onEditAvatar,
  onReplayOpening,
  onActiveProgressChange,
}: HomeViewProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSaveSlotsOpen, setIsSaveSlotsOpen] = useState(false);
  // Monet's OAuth callback redirects back here with ?connected=<provider>
  // once the connection is live — reopen the tutor panel so the player
  // lands somewhere that confirms it worked.
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(() => new URLSearchParams(window.location.search).has('connected'));
  const glossaryButtonRef = useRef<HTMLButtonElement>(null);
  const saveSlotsButtonRef = useRef<HTMLButtonElement>(null);
  const aiTutorButtonRef = useRef<HTMLButtonElement>(null);

  // Drop the query param once read, so a page refresh doesn't reopen the
  // panel. Pure side effect on the URL, not on React state, by design.
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
          <button type="button" className="link-button" onClick={() => setIsAiTutorOpen(true)} ref={aiTutorButtonRef}>
            Friendly AI tutor
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

      {isAiTutorOpen && (
        <AiTutorPanel
          onClose={() => {
            setIsAiTutorOpen(false);
            aiTutorButtonRef.current?.focus();
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
          {onReplayOpening && (
            <button type="button" className="link-button" onClick={onReplayOpening}>
              Replay opening
            </button>
          )}
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
