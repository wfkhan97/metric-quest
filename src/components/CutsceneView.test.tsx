// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { terminalOrientationBeat, type Beat } from '../content/beats';
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

describe('CutsceneView mentor + code-example panels (Learn SQL Mode)', () => {
  const mentorBeat: Beat = {
    id: 'test-mentor-beat',
    panels: [
      {
        eyebrow: 'Mentor channel',
        heading: 'WHERE, ORDER BY, LIMIT',
        mentorState: 'explaining',
        copy: ['WHERE filters first.'],
        codeExample: {
          description: 'The three highest-value US invoices.',
          sql: "SELECT InvoiceId FROM Invoice WHERE BillingCountry = 'USA';",
        },
      },
    ],
  };

  it('renders the mentor sprite and the worked SQL example', () => {
    render(
      <CutsceneView
        beat={mentorBeat}
        skippable={false}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: /terminal cursor/ })).toBeTruthy();
    expect(screen.getByText('The three highest-value US invoices.')).toBeTruthy();
    expect(screen.getByText(/SELECT InvoiceId FROM Invoice/)).toBeTruthy();
  });

  it('shows a Skip control on the default (non-tutorial) layout when the beat has a skipLabel', async () => {
    const skippableBeat: Beat = { ...mentorBeat, id: 'test-skippable-mentor-beat', skipLabel: 'Skip primer' };
    const onFinish = vi.fn();
    render(
      <CutsceneView
        beat={skippableBeat}
        skippable={true}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={onFinish}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Skip primer' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('does not show Skip on the default layout when the beat has no skipLabel (e.g. story beats)', () => {
    render(
      <CutsceneView
        beat={mentorBeat}
        skippable={true}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Skip/ })).toBeNull();
  });
});

describe('CutsceneView panel.choice (Learn SQL Mode mentor-intro)', () => {
  const choiceBeat: Beat = {
    id: 'test-choice-beat',
    panels: [
      {
        eyebrow: 'Mentor channel',
        heading: 'Want a hand?',
        mentorState: 'explaining',
        copy: ['Your call.'],
        choice: { yesLabel: 'Yes please', noLabel: 'No thanks' },
      },
    ],
  };

  it('renders both options instead of a single Continue button', () => {
    render(
      <CutsceneView
        beat={choiceBeat}
        skippable={false}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Yes please' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No thanks' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
  });

  it('calls onChoice with the picked value, then finishes/advances same as a normal Continue', async () => {
    const onChoice = vi.fn();
    const onFinish = vi.fn();
    render(
      <CutsceneView
        beat={choiceBeat}
        skippable={false}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={onFinish}
        onChoice={onChoice}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'No thanks' }));
    expect(onChoice).toHaveBeenCalledWith(false);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('works with no onChoice handler provided (choice panel on a beat that never wires one)', async () => {
    const onFinish = vi.fn();
    render(
      <CutsceneView
        beat={choiceBeat}
        skippable={false}
        isMusicMuted={false}
        onToggleMusicMute={vi.fn()}
        onFinish={onFinish}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Yes please' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
