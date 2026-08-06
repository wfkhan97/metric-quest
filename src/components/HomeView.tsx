import { AvatarPreview } from './AvatarPreview';
import { ChapterMap } from './ChapterMap';
import { ProgressBar } from './ProgressBar';
import { type Mission } from '../lib/missions';
import { type Progress } from '../lib/progress';

type HomeViewProps = {
  missions: Mission[];
  progress: Progress;
  onSelectMission: (mission: Mission) => void;
  onEditAvatar: () => void;
};

export function HomeView({ missions, progress, onSelectMission, onEditAvatar }: HomeViewProps) {
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
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <strong>{progress.points} points</strong>
          <span>
            {progress.completedMissionIds.length} of {missions.length} terminals purged
          </span>
        </section>
      </header>

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
                  <span aria-hidden="true">★ </span>
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
