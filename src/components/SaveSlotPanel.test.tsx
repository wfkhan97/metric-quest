// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewSave, getActiveSaveId } from '../lib/progress';
import { SaveSlotPanel } from './SaveSlotPanel';

afterEach(cleanup);

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

beforeEach(() => {
  memoryStorage.clear();
  vi.stubGlobal('localStorage', memoryStorage);
});

describe('SaveSlotPanel delete confirmation', () => {
  it('does not delete until confirmed, then switches active progress when deleting the active slot', async () => {
    const firstSaveId = getActiveSaveId()!;
    createNewSave('Second run');
    const secondSaveId = getActiveSaveId()!;
    const onActiveProgressChange = vi.fn();
    const user = userEvent.setup();

    render(<SaveSlotPanel activeSlotId={secondSaveId} onClose={vi.fn()} onActiveProgressChange={onActiveProgressChange} />);

    const secondSave = screen.getByText('Second run').closest('li')!;
    await user.click(within(secondSave).getByRole('button', { name: 'Delete' }));

    expect(screen.getByText('Delete this save?')).toBeTruthy();
    expect(screen.getByText('Second run')).toBeTruthy();

    await user.click(within(secondSave).getByRole('button', { name: 'Confirm delete' }));

    expect(screen.queryByText('Second run')).toBeNull();
    expect(onActiveProgressChange).toHaveBeenCalledWith(expect.objectContaining({ completedMissionIds: [] }));
    expect(getActiveSaveId()).toBe(firstSaveId);
  });
});
