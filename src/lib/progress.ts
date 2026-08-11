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
  /** Optional and additive, same rule as `avatar`: whether the opening
   * cutscene has played once. Missing means "not seen yet," not corrupt. */
  seenOpening?: boolean;
  /** Optional and additive: whether this save has been offered the terminal
   * orientation. Missing on an older save is valid and means "not offered." */
  seenTutorial?: boolean;
};

/** One save slot (P6.2 multi-save). `progress` is exactly today's `Progress`
 * shape, unchanged — a slot is just a name/timestamps wrapper around it. */
export type SaveSlot = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  progress: Progress;
};

type SaveStore = {
  version: 2;
  activeSlotId: string | null;
  slots: SaveSlot[];
};

/** Pre-multi-save single-save key. Never written to again after migration,
 * but never deleted either — see loadStore below. */
const legacyStorageKey = 'metric-quest-progress-v1';
const savesStorageKey = 'metric-quest-saves-v1';
const emptyProgress: Progress = { completedMissionIds: [], points: 0, badges: [] };
let progressPersistenceFailed = false;

function parseAvatar(value: unknown): AvatarConfig | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<AvatarConfig>;
  if (typeof candidate.spriteId !== 'string' || !candidate.spriteId) return undefined;
  if (typeof candidate.colorId !== 'string' || !candidate.colorId) return undefined;
  if (typeof candidate.callsign !== 'string') return undefined;
  return { spriteId: candidate.spriteId, colorId: candidate.colorId, callsign: candidate.callsign };
}

function parseProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') return emptyProgress;
  const parsed = value as Partial<Progress>;
  if (!Array.isArray(parsed.completedMissionIds) || !Array.isArray(parsed.badges) || typeof parsed.points !== 'number') {
    return emptyProgress;
  }
  const avatar = parseAvatar(parsed.avatar);
  const seenSectors = Array.isArray(parsed.seenSectors)
    ? parsed.seenSectors.filter((n): n is number => typeof n === 'number')
    : undefined;
  const seenOpening = typeof parsed.seenOpening === 'boolean' ? parsed.seenOpening : undefined;
  const seenTutorial = typeof parsed.seenTutorial === 'boolean' ? parsed.seenTutorial : undefined;
  return {
    completedMissionIds: parsed.completedMissionIds.filter((id): id is string => typeof id === 'string'),
    badges: parsed.badges.filter((badge): badge is string => typeof badge === 'string'),
    points: Math.max(0, parsed.points),
    ...(avatar ? { avatar } : {}),
    ...(seenSectors ? { seenSectors } : {}),
    ...(seenOpening !== undefined ? { seenOpening } : {}),
    ...(seenTutorial !== undefined ? { seenTutorial } : {}),
  };
}

function generateSlotId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultSlotName(progress: Progress): string {
  return progress.avatar?.callsign.trim() || 'Recruit';
}

function makeSlot(progress: Progress, name?: string): SaveSlot {
  const now = new Date().toISOString();
  return {
    id: generateSlotId(),
    name: name?.trim() || defaultSlotName(progress),
    createdAt: now,
    updatedAt: now,
    progress,
  };
}

function parseSlot(value: unknown): SaveSlot | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<SaveSlot>;
  if (typeof candidate.id !== 'string' || !candidate.id) return null;
  if (typeof candidate.name !== 'string') return null;
  if (typeof candidate.createdAt !== 'string') return null;
  if (typeof candidate.updatedAt !== 'string') return null;
  return {
    id: candidate.id,
    name: candidate.name,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    progress: parseProgress(candidate.progress),
  };
}

function parseSaveStore(value: unknown): SaveStore | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<SaveStore>;
  if (candidate.version !== 2 || !Array.isArray(candidate.slots)) return null;
  const slots = candidate.slots.map(parseSlot).filter((slot): slot is SaveSlot => slot !== null);
  if (slots.length === 0) return null;
  const activeSlotId =
    typeof candidate.activeSlotId === 'string' && slots.some((slot) => slot.id === candidate.activeSlotId)
      ? candidate.activeSlotId
      : slots[0].id;
  return { version: 2, activeSlotId, slots };
}

function readStore(): SaveStore | null {
  try {
    const raw = localStorage.getItem(savesStorageKey);
    if (!raw) return null;
    return parseSaveStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStore(store: SaveStore): void {
  // Browser storage can be unavailable in shared or locked-down classroom
  // profiles, and quota can be exhausted. Keep the current interaction alive
  // rather than turning a progress write into an uncaught app-wide exception.
  try {
    localStorage.setItem(savesStorageKey, JSON.stringify(store));
    progressPersistenceFailed = false;
  } catch {
    progressPersistenceFailed = true;
    // Progress remains available in the current React state for this session,
    // but cannot be restored after a reload while browser storage is blocked.
  }
}

/** Lets the UI warn a player when browser storage is unavailable, while the
 * current in-memory session continues to work. */
export function hasProgressPersistenceFailure(): boolean {
  return progressPersistenceFailed;
}

function readLegacyProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(legacyStorageKey);
    if (!raw) return null;
    return parseProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Loads the save store, running the one-time legacy migration (or a
 * cold-start default slot) if the `v2` key is absent. Safe to call
 * repeatedly: migration only fires when `metric-quest-saves-v1` doesn't
 * exist yet, so it cannot double-run, and the legacy key is left in place
 * afterward rather than deleted. */
function loadStore(): SaveStore {
  const existing = readStore();
  if (existing) return existing;

  const legacyProgress = readLegacyProgress();
  const slot = makeSlot(legacyProgress ?? emptyProgress);
  const store: SaveStore = { version: 2, activeSlotId: slot.id, slots: [slot] };
  writeStore(store);
  return store;
}

function getActiveSlot(store: SaveStore): SaveSlot {
  return store.slots.find((slot) => slot.id === store.activeSlotId) ?? store.slots[0];
}

export function loadProgress(): Progress {
  return getActiveSlot(loadStore()).progress;
}

export function saveProgress(progress: Progress): void {
  const store = loadStore();
  const active = getActiveSlot(store);
  const updatedAt = new Date().toISOString();
  const slots = store.slots.map((slot) => (slot.id === active.id ? { ...slot, progress, updatedAt } : slot));
  writeStore({ ...store, activeSlotId: active.id, slots });
}

/** Resets the active save's progress in place (same slot, same name) —
 * distinct from createNewSave, which adds a whole new slot. This is what the
 * title screen's "New game" uses, since the player is told it overwrites
 * what's there, not that it adds another save. */
export function resetActiveSave(): Progress {
  saveProgress(emptyProgress);
  return emptyProgress;
}

export function listSaveSlots(): SaveSlot[] {
  return [...loadStore().slots].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getActiveSaveId(): string | null {
  return loadStore().activeSlotId;
}

/** Purely additive — never touches another slot's data, so unlike delete
 * this needs no confirm step. Switches to and returns the new slot. */
export function createNewSave(name?: string): Progress {
  const store = loadStore();
  const slot = makeSlot(emptyProgress, name);
  writeStore({ ...store, activeSlotId: slot.id, slots: [...store.slots, slot] });
  return slot.progress;
}

export function switchActiveSave(slotId: string): Progress {
  const store = loadStore();
  const slot = store.slots.find((candidate) => candidate.id === slotId);
  if (!slot) return getActiveSlot(store).progress;
  writeStore({ ...store, activeSlotId: slot.id });
  return slot.progress;
}

/** Destructive — callers must confirm with the player first. Refuses to
 * delete the last remaining slot so the player is never left with none. If
 * the active slot is deleted, the next-most-recently-updated slot becomes
 * active. */
export function deleteSave(slotId: string): void {
  const store = loadStore();
  if (store.slots.length <= 1) return;
  const slots = store.slots.filter((slot) => slot.id !== slotId);
  if (slots.length === store.slots.length) return;
  const activeSlotId =
    store.activeSlotId === slotId
      ? [...slots].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0].id
      : store.activeSlotId;
  writeStore({ ...store, activeSlotId, slots });
}

export function renameSave(slotId: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const store = loadStore();
  const slots = store.slots.map((slot) => (slot.id === slotId ? { ...slot, name: trimmed } : slot));
  writeStore({ ...store, slots });
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

/** Whether the active save has anything worth resuming — the title screen
 * (App.tsx) uses this to decide whether "Resume game" is even an option. A
 * freshly created slot (cold start, or right after "New game") has none of
 * these, so it correctly reads as no progress yet. */
export function hasAnyProgress(progress: Progress): boolean {
  return Boolean(progress.avatar) || Boolean(progress.seenOpening) || progress.completedMissionIds.length > 0 || progress.points > 0;
}

export function hasSeenOpening(progress: Progress): boolean {
  return progress.seenOpening ?? false;
}

export function markOpeningSeen(progress: Progress): Progress {
  if (hasSeenOpening(progress)) return progress;
  return { ...progress, seenOpening: true };
}

export function hasSeenTutorial(progress: Progress): boolean {
  return progress.seenTutorial ?? false;
}

/** Records that the automatic terminal orientation was offered. This is
 * deliberately separate from completion so a refresh midway through cannot
 * reopen it automatically. */
export function markTutorialSeen(progress: Progress): Progress {
  if (hasSeenTutorial(progress)) return progress;
  return { ...progress, seenTutorial: true };
}
