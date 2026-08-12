// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type Beat } from './content/beats';
import { type AvatarConfig, saveProgress } from './lib/progress';
import { App } from './App';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
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

vi.mock('./components/AvatarCreatorView', () => ({
  AvatarCreatorView: ({ onConfirm }: { onConfirm: (avatar: AvatarConfig) => void }) => (
    <button type="button" onClick={() => onConfirm({ spriteId: 'analyst', colorId: 'teal', callsign: 'Recruit' })}>
      Confirm avatar
    </button>
  ),
}));

vi.mock('./components/CutsceneView', () => ({
  CutsceneView: ({ beat, skippable, onFinish }: { beat: Beat; skippable: boolean; onFinish: () => void }) => (
    <main aria-label={`Cutscene ${beat.id}`}>
      <p>{beat.id}</p>
      <button type="button" onClick={onFinish}>{`Finish ${beat.id}`}</button>
      {skippable && beat.skipLabel && <button type="button" onClick={onFinish}>{beat.skipLabel}</button>}
    </main>
  ),
}));

vi.mock('./components/SectorTransitionView', () => ({
  SectorTransitionView: ({ onContinue }: { onContinue: () => void }) => (
    <main aria-label="Sector transition">
      <button type="button" onClick={onContinue}>Continue sector</button>
    </main>
  ),
}));

vi.mock('./components/TitleScreen', () => ({
  TitleScreen: ({ onNewGame, onResume }: { onNewGame: () => void; onResume: () => void }) => (
    <main aria-label="Title screen">
      <button type="button" onClick={onNewGame}>New game</button>
      <button type="button" onClick={onResume}>Resume game</button>
    </main>
  ),
}));

vi.mock('./components/CreditsButton', () => ({ CreditsButton: () => null }));

afterEach(cleanup);

beforeEach(() => {
  memoryStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

async function finishOpening(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Finish mainframe-pull' }));
  await user.click(screen.getByRole('button', { name: 'Finish opening' }));
}

describe('App tutorial routing', () => {
  it('routes a fresh New game through both opening beats, then the tutorial, and does not offer it again automatically', async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'New game' }));
    await user.click(screen.getByRole('button', { name: 'Confirm avatar' }));
    await finishOpening(user);

    expect(screen.getByLabelText('Cutscene terminal-orientation')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Finish terminal-orientation' }));
    expect(screen.getByLabelText('Cutscene mentor-intro')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Finish mentor-intro' }));
    expect(screen.getByRole('heading', { name: 'Incident brief' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Enter Sector 1: Priority invoices/ }));
    expect(screen.getByLabelText('Sector transition')).toBeTruthy();
  });

  it.each(['Finish terminal-orientation', 'Skip tutorial'])('preserves a queued mission through the mentor intro and Sector 1 transition when the tutorial uses %s', async (action) => {
    saveProgress({
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'analyst', colorId: 'teal', callsign: 'Recruit' },
    });
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    await user.click(screen.getByRole('button', { name: /Enter Sector 1: Priority invoices/ }));
    await finishOpening(user);
    expect(screen.getByLabelText('Cutscene terminal-orientation')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: action }));
    expect(screen.getByLabelText('Cutscene mentor-intro')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Finish mentor-intro' }));
    expect(screen.getByLabelText('Sector transition')).toBeTruthy();
  });

  it('replaying the opening returns Home without chaining into the tutorial', async () => {
    saveProgress({
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'analyst', colorId: 'teal', callsign: 'Recruit' },
      seenOpening: true,
    });
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    await user.click(screen.getByRole('button', { name: 'Replay opening' }));
    await finishOpening(user);

    expect(screen.getByRole('heading', { name: 'Incident brief' })).toBeTruthy();
    expect(screen.queryByLabelText('Cutscene terminal-orientation')).toBeNull();
  });

  it.each([false, true])('opens Review controls for legacy and current saves and returns Home (%s)', async (seenTutorial) => {
    saveProgress({
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'analyst', colorId: 'teal', callsign: 'Recruit' },
      seenOpening: true,
      ...(seenTutorial ? { seenTutorial: true } : {}),
    });
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    await user.click(screen.getByRole('button', { name: 'Review controls' }));
    expect(screen.getByLabelText('Cutscene terminal-orientation')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Finish terminal-orientation' }));
    expect(screen.getByRole('heading', { name: 'Incident brief' })).toBeTruthy();
  });
});

describe('Learn SQL Mode', () => {
  function fullyOnboardedProgress(overrides: Record<string, unknown> = {}) {
    return {
      completedMissionIds: [],
      points: 0,
      badges: [],
      avatar: { spriteId: 'analyst', colorId: 'teal', callsign: 'Recruit' },
      seenOpening: true,
      seenTutorial: true,
      seenMentorIntro: true,
      ...overrides,
    };
  }

  it('is off by default and does not insert a primer before Sector 1', async () => {
    saveProgress(fullyOnboardedProgress());
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    expect(screen.getByRole('button', { name: 'Learn SQL Mode: Off' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Enter Sector 1: Priority invoices/ }));
    expect(screen.getByLabelText('Sector transition')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Continue sector' }));
    expect(screen.queryByLabelText(/^Cutscene sector-primer-/)).toBeNull();
  });

  it('shows the Sector 1 mentor primer before the mission once toggled on', async () => {
    saveProgress(fullyOnboardedProgress());
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    await user.click(screen.getByRole('button', { name: 'Learn SQL Mode: Off' }));
    expect(screen.getByRole('button', { name: 'Learn SQL Mode: On' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Enter Sector 1: Priority invoices/ }));
    expect(screen.getByLabelText('Sector transition')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Continue sector' }));
    expect(screen.getByLabelText('Cutscene sector-primer-1')).toBeTruthy();
  });

  it('offers Review SQL primers on Home once a primer has been seen, and replays it', async () => {
    saveProgress(fullyOnboardedProgress({ learnSqlMode: true, seenPrimers: [1] }));
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Resume game' }));
    expect(screen.queryByRole('button', { name: 'Review SQL primers' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Review SQL primers' }));
    const dialog = screen.getByRole('dialog', { name: 'Review SQL primers' });
    await user.click(within(dialog).getByRole('button', { name: /Sector 1/ }));
    expect(screen.getByLabelText('Cutscene sector-primer-1')).toBeTruthy();
  });
});
