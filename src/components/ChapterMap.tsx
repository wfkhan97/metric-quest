import { useEffect, useId, useState } from 'react';
import { chapterNumber, chapters } from '../content/chapters';
import { type Mission } from '../lib/missions';

type ChapterMapProps = {
  missions: Mission[];
  completedMissionIds: string[];
  activeMissionId?: Mission['id'];
  onSelectMission: (mission: Mission) => void;
  heading?: string;
  /** When provided, the heading itself becomes a "back to sector map" control
   * (P4.1) instead of a separate boxed button elsewhere on the page — the
   * sector map is already the thing being pointed back to, so it doubles as
   * its own link. Kept as a real focusable button (not a hover-only
   * affordance) per AGENTS.md's keyboard-operability bar. */
  onBack?: () => void;
  /** When true, skip the internal mobile collapse toggle entirely — the
   * parent already controls whether this is visible at all (P5.4's
   * sector-map drawer in MissionView). Home's permanent-sidebar usage
   * leaves this unset, so its existing mobile collapse is unaffected. */
  alwaysOpen?: boolean;
};

export function ChapterMap({
  missions,
  completedMissionIds,
  activeMissionId,
  onSelectMission,
  heading = 'Sector map',
  onBack,
  alwaysOpen = false,
}: ChapterMapProps) {
  const listId = useId();
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches);
  const [isOpen, setIsOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 720px)').matches);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const updateLayout = () => {
      setIsCompact(media.matches);
      setIsOpen(!media.matches);
    };

    updateLayout();
    media.addEventListener('change', updateLayout);
    return () => media.removeEventListener('change', updateLayout);
  }, []);

  return (
    <nav className="chapter-map" aria-label={heading}>
      <div className="chapter-map-heading">
        <h2>
          {onBack ? (
            <button type="button" className="chapter-map-heading-link" onClick={onBack}>
              <span aria-hidden="true">← </span>
              {heading}
            </button>
          ) : (
            heading
          )}
        </h2>
        {!alwaysOpen && (
          <button
            type="button"
            className="chapter-toggle"
            aria-expanded={isOpen}
            aria-controls={listId}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? 'Hide sectors' : 'Browse sectors'}
          </button>
        )}
      </div>
      <ol id={listId} className="chapter-list" hidden={!alwaysOpen && isCompact && !isOpen}>
        {chapters.map((chapter) => {
          const chapterMissions = missions.filter((mission) => chapterNumber(mission) === chapter.number);
          return (
            <li key={chapter.number} className="chapter-item">
              <p className="chapter-item-title">
                Sector {chapter.number} · {chapter.title}
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
                          <small>{isCompleted ? 'Purged' : `${mission.points} points`}</small>
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
