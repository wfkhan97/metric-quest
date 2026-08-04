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
          <p className="eyebrow">Aurora Music · quarterly operating review</p>
          <h1 id="page-title">Metric Quest</h1>
          <p className="lede">Practice business SQL. Run it locally. Verify the result.</p>
        </div>
        <section className="scoreboard" aria-label="Your progress">
          <strong>{progress.points} points</strong>
          <span>
            {progress.completedMissionIds.length} of {missions.length} missions complete
          </span>
        </section>
      </header>

      <div id="home-main" className="home-content">
        <section className="panel intro-panel" aria-labelledby="brief-title">
          <h2 id="brief-title">Your assignment</h2>
          <p>
            You have just joined Aurora Music's business insights team. Leadership does not want opinions, it wants
            numbers pulled straight from the company's sales database. Each mission drops you into a real business
            question from a stakeholder (the CFO, the U.S. sales lead, or an AI analyst whose claim needs checking) and asks
            you to answer it with one read-only SQL query.
          </p>
          <ol className="how-it-works">
            <li>
              <strong>Read the business brief.</strong> Every mission states who is asking and what decision depends on the
              answer.
            </li>
            <li>
              <strong>Write a query.</strong> The schema for that mission is listed so you know exactly what is available.
            </li>
            <li>
              <strong>Run it locally and verify.</strong> Your SQL executes in your browser against the course dataset; Metric
              Quest checks the executed result, not your query text.
            </li>
          </ol>
        </section>

        <section className="panel progress-panel" aria-labelledby="progress-title">
          <h2 id="progress-title">Your progress</h2>
          <ProgressBar label="Course progress" completed={progress.completedMissionIds.length} total={missions.length} />
          <p className="badges-summary">
            <strong>Badges:</strong>{' '}
            {progress.badges.length ? (
              progress.badges.map((badge) => (
                <span key={badge} className="badge">
                  ★ {badge}
                </span>
              ))
            ) : (
              <span>Complete a mission to earn your first badge.</span>
            )}
          </p>
          <button type="button" className="start-button" onClick={() => onSelectMission(ctaMission)}>
            {allComplete ? 'Replay a mission' : hasStarted ? `Resume: ${ctaMission.title}` : `Start Mission 1: ${ctaMission.title}`}
          </button>
        </section>

        <ChapterMap
          missions={missions}
          completedMissionIds={progress.completedMissionIds}
          onSelectMission={onSelectMission}
          heading="Course chapter map"
        />
      </div>
    </main>
  );
}
