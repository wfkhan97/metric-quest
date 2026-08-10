import { useState, type FormEvent } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { defaultAvatar, defaultCallsign, spriteOptions } from '../lib/avatarOptions';
import { type AvatarConfig } from '../lib/progress';

type AvatarCreatorViewProps = {
  initialAvatar?: AvatarConfig;
  mode: 'onboarding' | 'edit';
  onConfirm: (avatar: AvatarConfig) => void;
  onCancel?: () => void;
};

export function AvatarCreatorView({ initialAvatar, mode, onConfirm, onCancel }: AvatarCreatorViewProps) {
  const base = initialAvatar ?? defaultAvatar;
  const [spriteId, setSpriteId] = useState(base.spriteId);
  const [callsign, setCallsign] = useState(base.callsign === defaultCallsign ? '' : base.callsign);

  function submit(avatar: AvatarConfig) {
    onConfirm(avatar);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // colorId is carried through unchanged: every sprite ships with real art
    // now, so there is no player-facing color choice left to make (see
    // AvatarPreview's imageUrl branch — colorId only affects the CSS
    // placeholder shape used when a sprite has no real art yet).
    submit({ spriteId, colorId: base.colorId, callsign: callsign.trim() || defaultCallsign });
  }

  function handleSkip() {
    submit(defaultAvatar);
  }

  const previewCallsign = callsign.trim() || defaultCallsign;

  return (
    <main className="app-shell avatar-creator" aria-labelledby="avatar-title">
      <a className="skip-link" href="#avatar-form">
        Skip to avatar options
      </a>
      <div className="avatar-creator-frame">
        <header className="masthead">
          <div>
            <p className="eyebrow">Aurora Music mainframe · Access badge printer</p>
            <h1 id="avatar-title">{mode === 'onboarding' ? 'Print your access badge' : 'Reprint your access badge'}</h1>
            <p className="lede">
              {mode === 'onboarding'
                ? 'Before you can touch a terminal, the mainframe wants a badge photo on file. Pick a look — you can change it anytime from the sector map.'
                : 'Update your look. Your points, badges, and completed sectors are unaffected.'}
            </p>
          </div>
        </header>

        <form id="avatar-form" className="home-content" onSubmit={handleSubmit}>
          <section className="panel avatar-preview-panel" aria-labelledby="avatar-preview-title">
            <h2 id="avatar-preview-title">Badge preview</h2>
            <AvatarPreview spriteId={spriteId} colorId={base.colorId} size={128} label={`${previewCallsign} preview`} />
            <p className="callsign-preview">{previewCallsign}</p>
          </section>

          <section className="panel avatar-form-panel">
            <fieldset className="avatar-fieldset">
              <legend>Choose a base sprite</legend>
              <div className="swatch-grid">
                {spriteOptions.map((option) => {
                  const selected = option.id === spriteId;
                  return (
                    <label key={option.id} className={selected ? 'swatch-option selected' : 'swatch-option'}>
                      <input
                        type="radio"
                        name="avatar-sprite"
                        value={option.id}
                        checked={selected}
                        onChange={() => setSpriteId(option.id)}
                      />
                      <AvatarPreview spriteId={option.id} colorId={base.colorId} size={48} label={option.label} />
                      <span>
                        {option.label}
                        {selected ? ' (selected)' : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="avatar-callsign-field">
              <label htmlFor="callsign-input">Callsign</label>
              <input
                id="callsign-input"
                type="text"
                maxLength={24}
                value={callsign}
                onChange={(event) => setCallsign(event.target.value)}
                placeholder={defaultCallsign}
                aria-describedby="callsign-hint"
              />
              <p id="callsign-hint" className="subtle">
                Optional — defaults to &ldquo;{defaultCallsign}&rdquo; if left blank.
              </p>
            </div>

            <div className="actions">
              <button type="submit" className="primary">
                {mode === 'onboarding' ? 'Confirm and enter the mainframe' : 'Save badge'}
              </button>
              {mode === 'onboarding' && (
                <button type="button" onClick={handleSkip}>
                  Skip for now (use default badge)
                </button>
              )}
              {mode === 'edit' && onCancel && (
                <button type="button" onClick={onCancel}>
                  Cancel
                </button>
              )}
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
