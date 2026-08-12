import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeMission,
  createNewSave,
  deleteSave,
  getActiveSaveId,
  hasProgressPersistenceFailure,
  hasSeenMentorIntro,
  hasSeenPrimer,
  hasSeenSector,
  hasSeenTutorial,
  isLearnSqlModeOn,
  listSaveSlots,
  loadProgress,
  markMentorIntroSeen,
  markPrimerSeen,
  markSectorSeen,
  markTutorialSeen,
  renameSave,
  saveProgress,
  setAvatar,
  setLearnSqlMode,
  switchActiveSave,
  toggleLearnSqlMode,
  type Progress,
} from './progress';

const storageKey = 'metric-quest-progress-v1';
const savesStorageKey = 'metric-quest-saves-v1';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const memoryStorage = new MemoryStorage();
vi.stubGlobal('localStorage', memoryStorage);

function setStored(value: unknown) {
  memoryStorage.setItem(storageKey, JSON.stringify(value));
}

beforeEach(() => {
  memoryStorage.clear();
});

describe('loadProgress avatar handling', () => {
  it('tolerates an older saved record with no avatar field at all', () => {
    setStored({ completedMissionIds: ['m1.1'], points: 100, badges: ['First badge'] });
    expect(loadProgress()).toEqual({ completedMissionIds: ['m1.1'], points: 100, badges: ['First badge'] });
  });

  it('treats a malformed avatar as "no avatar yet" without discarding other progress', () => {
    setStored({ completedMissionIds: ['m1.1'], points: 50, badges: [], avatar: { spriteId: 'sprite-analyst' } });
    const progress = loadProgress();
    expect(progress.avatar).toBeUndefined();
    expect(progress.completedMissionIds).toEqual(['m1.1']);
    expect(progress.points).toBe(50);
  });

  it('does not throw on a non-object avatar value', () => {
    setStored({ completedMissionIds: [], points: 0, badges: [], avatar: 'not-an-object' });
    expect(() => loadProgress()).not.toThrow();
    expect(loadProgress().avatar).toBeUndefined();
  });

  it('round-trips a valid avatar through save and load', () => {
    const progress: Progress = {
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'sprite-engineer', colorId: 'color-amber', callsign: 'Rookie' },
    };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});

describe('storage write failures', () => {
  it('does not throw when the browser blocks progress writes', () => {
    const blockedStorage = new MemoryStorage();
    blockedStorage.setItem = () => {
      throw new DOMException('Storage is disabled', 'SecurityError');
    };
    vi.stubGlobal('localStorage', blockedStorage);

    expect(() => saveProgress({ completedMissionIds: ['m1-1'], points: 50, badges: [] })).not.toThrow();
    expect(hasProgressPersistenceFailure()).toBe(true);

    vi.stubGlobal('localStorage', memoryStorage);
    saveProgress({ completedMissionIds: [], points: 0, badges: [] });
    expect(hasProgressPersistenceFailure()).toBe(false);
  });
});

describe('setAvatar', () => {
  it('adds an avatar without disturbing other progress fields', () => {
    const progress: Progress = { completedMissionIds: ['m1.1'], points: 100, badges: ['First badge'] };
    const next = setAvatar(progress, { spriteId: 'sprite-analyst', colorId: 'color-teal', callsign: 'Recruit' });
    expect(next.completedMissionIds).toEqual(['m1.1']);
    expect(next.points).toBe(100);
    expect(next.badges).toEqual(['First badge']);
    expect(next.avatar).toEqual({ spriteId: 'sprite-analyst', colorId: 'color-teal', callsign: 'Recruit' });
  });
});

describe('sector transition tracking', () => {
  it('tolerates an older saved record with no seenSectors field at all', () => {
    setStored({ completedMissionIds: [], points: 0, badges: [] });
    const progress = loadProgress();
    expect(progress.seenSectors).toBeUndefined();
    expect(hasSeenSector(progress, 1)).toBe(false);
  });

  it('marks a sector seen without disturbing other progress fields', () => {
    const progress: Progress = { completedMissionIds: ['m1.1'], points: 20, badges: [] };
    const next = markSectorSeen(progress, 1);
    expect(hasSeenSector(next, 1)).toBe(true);
    expect(hasSeenSector(next, 2)).toBe(false);
    expect(next.completedMissionIds).toEqual(['m1.1']);
    expect(next.points).toBe(20);
  });

  it('is idempotent: marking the same sector twice does not duplicate it', () => {
    const progress: Progress = { completedMissionIds: [], points: 0, badges: [], seenSectors: [1] };
    const next = markSectorSeen(progress, 1);
    expect(next).toBe(progress);
    expect(next.seenSectors).toEqual([1]);
  });

  it('round-trips seenSectors through save and load', () => {
    const progress: Progress = { completedMissionIds: [], points: 0, badges: [], seenSectors: [1, 2] };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});

describe('tutorial tracking', () => {
  it.each([
    ['missing', undefined, undefined],
    ['true', true, true],
    ['false', false, false],
    ['malformed', 'yes', undefined],
  ])('parses a %s tutorial flag safely', (_label, seenTutorial, expected) => {
    setStored({ completedMissionIds: [], points: 0, badges: [], ...(seenTutorial === undefined ? {} : { seenTutorial }) });
    const progress = loadProgress();
    expect(progress.seenTutorial).toBe(expected);
    expect(hasSeenTutorial(progress)).toBe(expected ?? false);
  });

  it('marks the tutorial as offered without disturbing other progress', () => {
    const progress: Progress = { completedMissionIds: ['m1-1'], points: 20, badges: ['Revenue Scout'], seenOpening: true };
    const next = markTutorialSeen(progress);
    expect(next).toEqual({ ...progress, seenTutorial: true });
    expect(markTutorialSeen(next)).toBe(next);
  });
});

describe('completeMission', () => {
  it('preserves an existing avatar when a mission is completed', () => {
    const progress: Progress = {
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'sprite-analyst', colorId: 'color-teal', callsign: 'Recruit' },
    };
    const next = completeMission(progress, 'm1.1', 50, 'First badge');
    expect(next.avatar).toEqual(progress.avatar);
    expect(next.completedMissionIds).toEqual(['m1.1']);
    expect(next.points).toBe(50);
  });
});

describe('multi-save (P6.2)', () => {
  it('cold start: a browser with no existing save gets exactly one default slot', () => {
    expect(loadProgress()).toEqual({ completedMissionIds: [], points: 0, badges: [] });
    const slots = listSaveSlots();
    expect(slots).toHaveLength(1);
    expect(getActiveSaveId()).toBe(slots[0].id);
    // The v2 store is now persisted so a second read doesn't create a second slot.
    expect(memoryStorage.getItem(savesStorageKey)).not.toBeNull();
    expect(listSaveSlots()).toHaveLength(1);
    expect(listSaveSlots()[0].id).toBe(slots[0].id);
  });

  it('migrates an existing v1 single save into one slot, preserving progress', () => {
    setStored({
      completedMissionIds: ['m1.1', 'm1.2'],
      points: 150,
      badges: ['First badge'],
      avatar: { spriteId: 'sprite-analyst', colorId: 'color-teal', callsign: 'Ada' },
    });

    const progress = loadProgress();
    expect(progress.completedMissionIds).toEqual(['m1.1', 'm1.2']);
    expect(progress.points).toBe(150);
    expect(progress.avatar?.callsign).toBe('Ada');

    const slots = listSaveSlots();
    expect(slots).toHaveLength(1);
    expect(slots[0].name).toBe('Ada');
    expect(slots[0].progress).toEqual(progress);

    // The legacy key is left in place, not deleted, per the migration design.
    expect(memoryStorage.getItem(storageKey)).not.toBeNull();
  });

  it('does not double-run the migration on a second load', () => {
    setStored({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    loadProgress(); // triggers migration, creates the v2 key
    const slotId = listSaveSlots()[0].id;

    // Progress moves on via the normal save path.
    saveProgress({ completedMissionIds: ['m1.1', 'm1.2'], points: 100, badges: [] });

    // A second "cold" read must not re-migrate the (now stale) legacy key
    // over the top of the newer v2 progress.
    const progress = loadProgress();
    expect(progress.points).toBe(100);
    expect(progress.completedMissionIds).toEqual(['m1.1', 'm1.2']);
    expect(listSaveSlots()).toHaveLength(1);
    expect(listSaveSlots()[0].id).toBe(slotId);
  });

  it('creates a new save, switches to it, and leaves the original slot untouched', () => {
    saveProgress({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    const originalId = getActiveSaveId();

    const fresh = createNewSave('Second run');
    expect(fresh).toEqual({ completedMissionIds: [], points: 0, badges: [] });
    expect(getActiveSaveId()).not.toBe(originalId);
    expect(loadProgress()).toEqual({ completedMissionIds: [], points: 0, badges: [] });

    const slots = listSaveSlots();
    expect(slots).toHaveLength(2);
    const original = slots.find((slot) => slot.id === originalId);
    expect(original?.progress.completedMissionIds).toEqual(['m1.1']);
    expect(original?.progress.points).toBe(50);
  });

  it('switches the active save back and forth without losing either slot’s progress', () => {
    saveProgress({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    const firstId = getActiveSaveId()!;
    createNewSave('Second run');
    saveProgress({ completedMissionIds: ['m2.1'], points: 30, badges: [] });
    const secondId = getActiveSaveId()!;

    expect(switchActiveSave(firstId)).toEqual({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    expect(loadProgress().completedMissionIds).toEqual(['m1.1']);

    expect(switchActiveSave(secondId)).toEqual({ completedMissionIds: ['m2.1'], points: 30, badges: [] });
    expect(loadProgress().completedMissionIds).toEqual(['m2.1']);
  });

  it('renames a slot without touching its progress', () => {
    saveProgress({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    const id = getActiveSaveId()!;
    renameSave(id, '  Weekend save  ');
    const slot = listSaveSlots().find((candidate) => candidate.id === id);
    expect(slot?.name).toBe('Weekend save');
    expect(slot?.progress.completedMissionIds).toEqual(['m1.1']);
  });

  it('ignores a rename to a blank name', () => {
    const id = getActiveSaveId()!;
    const before = listSaveSlots().find((slot) => slot.id === id)?.name;
    renameSave(id, '   ');
    expect(listSaveSlots().find((slot) => slot.id === id)?.name).toBe(before);
  });

  it('deletes a non-active slot without disturbing the active one', () => {
    saveProgress({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    const firstId = getActiveSaveId()!;
    createNewSave('Second run');
    const secondId = getActiveSaveId()!;

    deleteSave(firstId);
    expect(getActiveSaveId()).toBe(secondId);
    expect(listSaveSlots()).toHaveLength(1);
  });

  it('deleting the active slot falls back to another remaining slot', () => {
    saveProgress({ completedMissionIds: ['m1.1'], points: 50, badges: [] });
    const firstId = getActiveSaveId()!;
    createNewSave('Second run');
    const secondId = getActiveSaveId()!;

    deleteSave(secondId);
    expect(getActiveSaveId()).toBe(firstId);
    expect(loadProgress().completedMissionIds).toEqual(['m1.1']);
  });

  it('refuses to delete the last remaining slot', () => {
    const id = getActiveSaveId()!;
    deleteSave(id);
    expect(listSaveSlots()).toHaveLength(1);
    expect(getActiveSaveId()).toBe(id);
  });
});

describe('Learn SQL Mode helpers', () => {
  const empty: Progress = { completedMissionIds: [], points: 0, badges: [] };

  it('is off by default and toggles both ways', () => {
    expect(isLearnSqlModeOn(empty)).toBe(false);
    const on = toggleLearnSqlMode(empty);
    expect(isLearnSqlModeOn(on)).toBe(true);
    const off = toggleLearnSqlMode(on);
    expect(isLearnSqlModeOn(off)).toBe(false);
  });

  it('setLearnSqlMode sets the explicit value regardless of the current one (mentor-intro choice)', () => {
    expect(isLearnSqlModeOn(setLearnSqlMode(empty, true))).toBe(true);
    expect(isLearnSqlModeOn(setLearnSqlMode(empty, false))).toBe(false);
    const alreadyOn = toggleLearnSqlMode(empty);
    expect(isLearnSqlModeOn(setLearnSqlMode(alreadyOn, true))).toBe(true);
  });

  it('tracks seen primers per sector without disturbing others', () => {
    expect(hasSeenPrimer(empty, 1)).toBe(false);
    const afterSector1 = markPrimerSeen(empty, 1);
    expect(hasSeenPrimer(afterSector1, 1)).toBe(true);
    expect(hasSeenPrimer(afterSector1, 2)).toBe(false);
    // Idempotent — marking an already-seen sector again is a no-op.
    expect(markPrimerSeen(afterSector1, 1)).toBe(afterSector1);
  });

  it('tracks the mentor intro as a one-time flag', () => {
    expect(hasSeenMentorIntro(empty)).toBe(false);
    const seen = markMentorIntroSeen(empty);
    expect(hasSeenMentorIntro(seen)).toBe(true);
    expect(markMentorIntroSeen(seen)).toBe(seen);
  });

  it('round-trips Learn SQL Mode fields through save/load', () => {
    saveProgress({ ...empty, learnSqlMode: true, seenPrimers: [1, 2], seenMentorIntro: true });
    const loaded = loadProgress();
    expect(loaded.learnSqlMode).toBe(true);
    expect(loaded.seenPrimers).toEqual([1, 2]);
    expect(loaded.seenMentorIntro).toBe(true);
  });
});
