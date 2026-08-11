import { useEffect, useRef, useState } from 'react';
import { missions } from '../lib/missions';
import {
  createNewSave,
  deleteSave,
  getActiveSaveId,
  listSaveSlots,
  loadProgress,
  renameSave,
  switchActiveSave,
  type Progress,
  type SaveSlot,
} from '../lib/progress';
import { useFocusTrap } from '../lib/useFocusTrap';

type SaveSlotPanelProps = {
  onClose: () => void;
  activeSlotId: string | null;
  /** Called whenever a switch/create/delete may have changed which slot is
   * active and what its progress is — the caller (App) owns `progress` state
   * and needs to pick it up. Rename never changes the active slot's data, so
   * it does not call this. */
  onActiveProgressChange: (progress: Progress) => void;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'unknown date';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function SaveSlotPanel({ onClose, activeSlotId, onActiveProgressChange }: SaveSlotPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [slots, setSlots] = useState<SaveSlot[]>(() => listSaveSlots());
  const [activeId, setActiveId] = useState<string | null>(activeSlotId);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);
  useFocusTrap(panelRef, onClose);

  function refresh() {
    setSlots(listSaveSlots());
  }

  function handleSwitch(id: string) {
    if (id === activeId) return;
    const progress = switchActiveSave(id);
    setActiveId(id);
    onActiveProgressChange(progress);
    refresh();
  }

  function handleCreate() {
    const progress = createNewSave();
    setActiveId(getActiveSaveId());
    onActiveProgressChange(progress);
    refresh();
  }

  function startRename(slot: SaveSlot) {
    setConfirmingDeleteId(null);
    setRenamingId(slot.id);
    setRenameValue(slot.name);
  }

  function commitRename(id: string) {
    const trimmed = renameValue.trim();
    if (trimmed) renameSave(id, trimmed);
    setRenamingId(null);
    refresh();
  }

  function handleDeleteConfirmed(id: string) {
    const wasActive = id === activeId;
    deleteSave(id);
    setConfirmingDeleteId(null);
    refresh();
    if (wasActive) {
      const nextActiveId = getActiveSaveId();
      setActiveId(nextActiveId);
      onActiveProgressChange(loadProgress());
    }
  }

  return (
    <div
      className="glossary-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="glossary-panel save-slot-panel" role="dialog" aria-modal="true" aria-labelledby="save-slots-title" ref={panelRef}>
        <header className="glossary-header">
          <div>
            <p className="eyebrow">Aurora Music mainframe · analyst sessions</p>
            <h2 id="save-slots-title">Save slots</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body">
          <button type="button" className="start-button" onClick={handleCreate}>
            + New game
          </button>
          <ul className="save-slot-list">
            {slots.map((slot) => {
              const isActive = slot.id === activeId;
              const completed = slot.progress.completedMissionIds.length;
              return (
                <li key={slot.id} className={isActive ? 'save-slot-item save-slot-item-active' : 'save-slot-item'}>
                  {renamingId === slot.id ? (
                    <form
                      className="save-slot-rename-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        commitRename(slot.id);
                      }}
                    >
                      <label htmlFor={`rename-${slot.id}`}>Save name</label>
                      <input
                        id={`rename-${slot.id}`}
                        type="text"
                        maxLength={40}
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                      />
                      <div className="save-slot-actions">
                        <button type="submit" className="link-button">
                          Save name
                        </button>
                        <button type="button" className="link-button" onClick={() => setRenamingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="save-slot-summary">
                      <p className="save-slot-name">
                        <strong>{slot.name}</strong>
                        {isActive && <span className="save-slot-badge">Active</span>}
                      </p>
                      <p className="subtle">
                        {completed} of {missions.length} terminals purged · {slot.progress.points} points
                      </p>
                      <p className="subtle">Last played {formatDate(slot.updatedAt)}</p>
                    </div>
                  )}
                  {renamingId !== slot.id && (
                    <div className="save-slot-actions">
                      {!isActive && (
                        <button type="button" className="link-button" onClick={() => handleSwitch(slot.id)}>
                          Switch to this save
                        </button>
                      )}
                      <button type="button" className="link-button" onClick={() => startRename(slot)}>
                        Rename
                      </button>
                      {confirmingDeleteId === slot.id ? (
                        <>
                          <span className="subtle">Delete this save?</span>
                          <button type="button" className="link-button" onClick={() => handleDeleteConfirmed(slot.id)}>
                            Confirm delete
                          </button>
                          <button type="button" className="link-button" onClick={() => setConfirmingDeleteId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        slots.length > 1 && (
                          <button type="button" className="link-button" onClick={() => setConfirmingDeleteId(slot.id)}>
                            Delete
                          </button>
                        )
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
