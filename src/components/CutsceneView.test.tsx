// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { terminalOrientationBeat } from '../content/beats';
import { CutsceneView } from './CutsceneView';

afterEach(cleanup);

function renderOrientation(skippable: boolean, onFinish = vi.fn()) {
  render(
    <CutsceneView
      beat={terminalOrientationBeat}
      skippable={skippable}
      isMusicMuted={false}
      onToggleMusicMute={vi.fn()}
      onFinish={onFinish}
    />,
  );
  return onFinish;
}

describe('CutsceneView terminal orientation', () => {
  it('shows Skip tutorial on every panel and finishes only after the sixth Continue', async () => {
    const onFinish = renderOrientation(true);
    const user = userEvent.setup();

    for (let panel = 1; panel <= 6; panel += 1) {
      expect(screen.getByRole('button', { name: 'Skip tutorial' })).toBeTruthy();
      expect(screen.getByText(`QUERY TERMINAL ORIENTATION · ${panel} OF 6`)).toBeTruthy();
      if (panel < 6) {
        await user.click(screen.getByRole('button', { name: 'Next' }));
      }
    }

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('honors Escape only while the orientation is skippable', async () => {
    const blockedFinish = renderOrientation(false);
    const user = userEvent.setup();

    expect(screen.queryByRole('button', { name: 'Skip tutorial' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(blockedFinish).not.toHaveBeenCalled();

    cleanup();
    const allowedFinish = renderOrientation(true);
    await user.keyboard('{Escape}');
    expect(allowedFinish).toHaveBeenCalledTimes(1);
  });
});
