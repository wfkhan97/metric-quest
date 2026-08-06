import { useState, type FormEvent } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { colorOptions, defaultAvatar, defaultCallsign, getSpriteOption, spriteOptions } from '../lib/avatarOptions';
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
  const [colorId, setColorId] = useState(base.colorId);
  const [callsign, setCallsign] = useState(base.callsign === defaultCallsign ? '' : base.callsign);

  function submit(avatar: AvatarConfig) {
    onConfirm(avatar);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit({ spriteId, colorId, callsign: callsign.trim() || defaultCallsign });
  }

  function handleSkip() {
    submit(defaultAvatar);
  }

  const previewCallsign = callsign.trim() || defaultCallsign;
  const hasImageSprite = Boolean(getSpriteOption(spriteId).imageUrl);

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
            <AvatarPreview spriteId={spriteId} colorId={colorId} size={128} label={`${previewCallsign} preview`} />
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
                      <AvatarPreview spriteId={option.id} colorId={colorId} size={48} label={option.label} />
                      <span>
                        {option.label}
                        {selected ? ' (selected)' : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {!hasImageSprite && (
              <fieldset className="avatar-fieldset">
                <legend>Choose a color</legend>
                <div className="swatch-grid">
                  {colorOptions.map((option) => {
                    const selected = option.id === colorId;
                    return (
                      <label key={option.id} className={selected ? 'swatch-option selected' : 'swatch-option'}>
                        <input
                          type="radio"
                          name="avatar-color"
                          value={option.id}
                          checked={selected}
                          onChange={() => setColorId(option.id)}
                        />
                        <span className="color-chip" style={{ background: option.value }} aria-hidden="true" />
                        <span>
                          {option.label}
                          {selected ? ' (selected)' : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

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
