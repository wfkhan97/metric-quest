import { chapterNumber, chapters } from '../content/chapters';
import { type Mission } from '../lib/missions';

type ChapterMapProps = {
  missions: Mission[];
  completedMissionIds: string[];
  activeMissionId?: Mission['id'];
  onSelectMission: (mission: Mission) => void;
  heading?: string;
};

export function ChapterMap({ missions, completedMissionIds, activeMissionId, onSelectMission, heading = 'Chapter map' }: ChapterMapProps) {
  return (
    <nav className="chapter-map" aria-label={heading}>
      <h2>{heading}</h2>
      <ol className="chapter-list">
        {chapters.map((chapter) => {
          const chapterMissions = missions.filter((mission) => chapterNumber(mission) === chapter.number);
          return (
            <li key={chapter.number} className="chapter-item">
              <p className="chapter-item-title">
                Chapter {chapter.number} · {chapter.title}
              </p>
              {chapterMissions.length === 0 ? (
                <p className="chapter-locked">Coming soon</p>
              ) : (
                <ul className="mission-list">
                  {chapterMissions.map((mission) => {
                    const isActive = mission.id === activeMissionId;
                    const isCompleted = completedMissionIds.includes(mission.id);
                    return (
                      <li key={mission.id}>
                        <button
                          type="button"
                          className={isActive ? 'mission-button active' : 'mission-button'}
                          onClick={() => onSelectMission(mission)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <strong>{mission.title}</strong>
                          <small>{isCompleted ? 'Completed' : `${mission.points} points`}</small>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
