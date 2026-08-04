import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeMission, loadProgress, saveProgress, setAvatar, type Progress } from './progress';

const storageKey = 'metric-quest-progress-v1';

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
