export type AvatarConfig = {
  spriteId: string;
  colorId: string;
  callsign: string;
};

export type Progress = {
  completedMissionIds: string[];
  points: number;
  badges: string[];
  /** Optional and additive: older saved progress may have no `avatar` at all.
   * Treat that (or a malformed value) as "no avatar yet," never as corrupt
   * progress requiring a reset — see parseAvatar below. */
  avatar?: AvatarConfig;
  /** Optional and additive, same rule as `avatar`: chapter numbers whose
   * sector-transition screen has already been shown once. Missing entirely
   * on older saves means "nothing seen yet," not corrupt progress. */
  seenSectors?: number[];
};

const storageKey = 'metric-quest-progress-v1';
const emptyProgress: Progress = { completedMissionIds: [], points: 0, badges: [] };

function parseAvatar(value: unknown): AvatarConfig | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<AvatarConfig>;
  if (typeof candidate.spriteId !== 'string' || !candidate.spriteId) return undefined;
  if (typeof candidate.colorId !== 'string' || !candidate.colorId) return undefined;
  if (typeof candidate.callsign !== 'string') return undefined;
  return { spriteId: candidate.spriteId, colorId: candidate.colorId, callsign: candidate.callsign };
}

export function loadProgress(): Progress {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return emptyProgress;
    const parsed = JSON.parse(value) as Partial<Progress>;
    if (!Array.isArray(parsed.completedMissionIds) || !Array.isArray(parsed.badges) || typeof parsed.points !== 'number') return emptyProgress;
    const avatar = parseAvatar(parsed.avatar);
    const seenSectors = Array.isArray(parsed.seenSectors)
      ? parsed.seenSectors.filter((n): n is number => typeof n === 'number')
      : undefined;
    return {
      completedMissionIds: parsed.completedMissionIds.filter((id): id is string => typeof id === 'string'),
      badges: parsed.badges.filter((badge): badge is string => typeof badge === 'string'),
      points: Math.max(0, parsed.points),
      ...(avatar ? { avatar } : {}),
      ...(seenSectors ? { seenSectors } : {}),
    };
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
    ...progress,
    completedMissionIds: [...progress.completedMissionIds, missionId],
    points: progress.points + points,
    badges: badge && !progress.badges.includes(badge) ? [...progress.badges, badge] : progress.badges,
  };
}

export function setAvatar(progress: Progress, avatar: AvatarConfig): Progress {
  return { ...progress, avatar };
}

export function hasSeenSector(progress: Progress, chapterNumber: number): boolean {
  return progress.seenSectors?.includes(chapterNumber) ?? false;
}

export function markSectorSeen(progress: Progress, chapterNumber: number): Progress {
  if (hasSeenSector(progress, chapterNumber)) return progress;
  return { ...progress, seenSectors: [...(progress.seenSectors ?? []), chapterNumber] };
}

