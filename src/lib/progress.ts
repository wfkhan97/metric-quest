export type Progress = {
  completedMissionIds: string[];
  points: number;
  badges: string[];
};

const storageKey = 'metric-quest-progress-v1';
const emptyProgress: Progress = { completedMissionIds: [], points: 0, badges: [] };

export function loadProgress(): Progress {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return emptyProgress;
    const parsed = JSON.parse(value) as Partial<Progress>;
    if (!Array.isArray(parsed.completedMissionIds) || !Array.isArray(parsed.badges) || typeof parsed.points !== 'number') return emptyProgress;
    return { completedMissionIds: parsed.completedMissionIds.filter((id): id is string => typeof id === 'string'), badges: parsed.badges.filter((badge): badge is string => typeof badge === 'string'), points: Math.max(0, parsed.points) };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

export function completeMission(progress: Progress, missionId: string, points: number, badge?: string): Progress {
  if (progress.completedMissionIds.includes(missionId)) return progress;
  return {
    completedMissionIds: [...progress.completedMissionIds, missionId],
    points: progress.points + points,
    badges: badge && !progress.badges.includes(badge) ? [...progress.badges, badge] : progress.badges,
  };
}

