// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { missions } from '../lib/missions';
import { type Progress } from '../lib/progress';
import { type QueryRunResult, runMissionQuery } from '../lib/sqlRunner';
import { MissionView } from './MissionView';

vi.mock('./SqlEditor', () => ({
  SqlEditor: ({ value, onChange, ariaLabelledBy }: { value: string; onChange: (value: string) => void; ariaLabelledBy: string }) => (
    <textarea aria-labelledby={ariaLabelledBy} value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('../content/sectorMusic', () => ({ sectorMusic: {} }));

vi.mock('../lib/diagnostics', () => ({
  classifyAttempt: vi.fn(() => ({
    id: 'test-diagnostic',
    label: 'Test diagnosis',
    explanation: 'The second incorrect result opens the diagnostic gate.',
  })),
}));

vi.mock('../lib/sqlRunner', () => ({ runMissionQuery: vi.fn() }));

afterEach(cleanup);

const mission = missions[0];
const initialProgress: Progress = { completedMissionIds: [], points: 0, badges: [] };
const mockedRunMissionQuery = vi.mocked(runMissionQuery);

function renderMission(onProgressChange = vi.fn()) {
  render(
    <MissionView
      mission={mission}
      missions={missions}
      progress={initialProgress}
      isMusicMuted={false}
      onToggleMusicMute={vi.fn()}
      onProgressChange={onProgressChange}
      onSelectMission={vi.fn()}
      onBackToHome={vi.fn()}
    />,
  );
  return onProgressChange;
}

beforeEach(() => {
  mockedRunMissionQuery.mockReset();
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

describe('MissionView grading flow', () => {
  it('records a correct executed result and reports terminal restoration', async () => {
    mockedRunMissionQuery.mockResolvedValue({ ok: true, result: mission.expected });
    const onProgressChange = renderMission();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Run query' }));

    await waitFor(() => expect(onProgressChange).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status').textContent).toContain('Terminal restored');
    expect(onProgressChange).toHaveBeenCalledWith(expect.objectContaining({ completedMissionIds: [mission.id], points: mission.points }));
  });

  it('opens the diagnostic after two wrong executed results and the answer after three', async () => {
    const wrongResult: QueryRunResult = { ok: true, result: { columns: ['Wrong'], rows: [] } };
    mockedRunMissionQuery.mockResolvedValue(wrongResult);
    renderMission();
    const user = userEvent.setup();
    const runButton = screen.getByRole('button', { name: 'Run query' });

    await user.click(runButton);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('ROGUE.exe'));
    expect(screen.queryByRole('button', { name: 'See answer' })).toBeNull();

    await user.click(runButton);
    await waitFor(() => expect(screen.getByText('Likely cause: Test diagnosis')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'See answer' })).toBeNull();

    await user.click(runButton);
    expect(await screen.findByRole('button', { name: 'See answer' })).toBeTruthy();
  });

  it('closes the sector drawer with Escape and restores focus to its trigger', async () => {
    renderMission();
    const user = userEvent.setup();
    const mapTrigger = screen.getByRole('button', { name: 'Browse sectors' });

    await user.click(mapTrigger);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(document.activeElement).toBe(closeButton);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Sector map' })).toBeNull();
    expect(document.activeElement).toBe(mapTrigger);
  });
});
