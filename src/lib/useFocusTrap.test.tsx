// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';

afterEach(cleanup);

function DialogFixture({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose);

  return (
    <div ref={dialogRef} role="dialog">
      <button type="button">First control</button>
      <button type="button">Last control</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('wraps Tab in both directions and closes on Escape', () => {
    const onClose = vi.fn();
    render(<DialogFixture onClose={onClose} />);

    const first = screen.getByRole('button', { name: 'First control' });
    const last = screen.getByRole('button', { name: 'Last control' });

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
