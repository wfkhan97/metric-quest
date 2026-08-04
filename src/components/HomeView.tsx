import { ChapterMap } from './ChapterMap';
import { ProgressBar } from './ProgressBar';
import { type Mission } from '../lib/missions';
import { type Progress } from '../lib/progress';

type HomeViewProps = {
  missions: Mission[];
  progress: Progress;
  onSelectMission: (mission: Mission) => void;
};

export function HomeView({ missions, progress, onSelectMission }: HomeViewProps) {
  const nextMission = missions.find((mission) => !progress.completedMissionIds.includes(mission.id));
  const allComplete = !nextMission;
  const ctaMission = nextMission ?? missions[0];
  const hasStarted = progress.completedMissionIds.length > 0;

  return (
    <main className="app-shell" aria-labelledby="page-title">
      <a className="skip-link" href="#home-main">
        Skip to onboarding content
      </a>
      <header className="masthead">
        <div>
          <p className="eyebrow">Aurora Music mainframe · Day one, unauthorized access granted</p>
          <h1 id="page-title">Metric Quest</h1>
          <p className="lede">
            The mainframe just pulled you in. ROGUE.exe — the analyst AI that used to run this place — has gone rogue and
            is corrupting the company's data, sector by sector. Fight back with real SQL.
          </p>
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
          <h2 id="brief-title">Your mission</h2>
          <p>
            You're the newest hire on Aurora Music's business insights team — except your first day just got hijacked.
            ROGUE.exe has corrupted terminal after terminal of the sales database, feeding leadership fabricated numbers.
            Each mission drops you into one corrupted terminal with a real business question behind it (from the CFO, the
            U.S. sales lead, or ROGUE.exe itself) and one way out: write a real, read-only SQL query and get the real
            answer.
          </p>
          <ol className="how-it-works">
            <li>
              <strong>Read the terminal brief.</strong> Every corrupted terminal still remembers who was asking and what
              decision depends on the answer.
            </li>
            <li>
              <strong>Write a query.</strong> The schema for that terminal is listed so you know exactly what's still
              intact.
            </li>
            <li>
              <strong>Run it locally and verify.</strong> Your SQL executes in your browser against the real dataset;
              Metric Quest checks the executed result — not your query text — before it calls a terminal purged.
            </li>
          </ol>
        </section>

        <section className="panel progress-panel" aria-labelledby="progress-title">
          <h2 id="progress-title">Mainframe status</h2>
          <ProgressBar label="Mainframe integrity" completed={progress.completedMissionIds.length} total={missions.length} />
          <p className="badges-summary">
            <strong>Recovered badges:</strong>{' '}
            {progress.badges.length ? (
              progress.badges.map((badge) => (
                <span key={badge} className="badge">
                  ★ {badge}
                </span>
              ))
            ) : (
              <span>Purge a terminal to earn your first badge.</span>
            )}
          </p>
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
