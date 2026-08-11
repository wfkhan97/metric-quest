// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TutorialMissionPreview } from './TutorialMissionPreview';

afterEach(cleanup);

describe('TutorialMissionPreview', () => {
  it('is an inert, text-equivalent schematic rather than a live mission workspace', () => {
    render(<TutorialMissionPreview focus="feedback" />);

    expect(screen.getByText('Priority invoices')).toBeTruthy();
    expect(screen.getByText('ROGUE.exe smirks: “Close. Still corrupted.”')).toBeTruthy();
    expect(screen.getByText('Terminal restored: +20 points')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
