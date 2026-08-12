import { useEffect, useRef, useState } from 'react';
import { AvatarPreview } from './AvatarPreview';
import { MentorSprite } from './MentorSprite';
import { RogueSprite } from './RogueSprite';
import { TutorialMissionPreview } from './TutorialMissionPreview';
import nameplateEcho from '../assets/ui/nameplate-echo.png';
import nameplateRogue from '../assets/ui/nameplate-rogue.png';
import { defaultAvatar } from '../lib/avatarOptions';
import { type AvatarConfig } from '../lib/progress';
import { type Beat } from '../content/beats';

type CutsceneViewProps = {
  beat: Beat;
  avatar?: AvatarConfig;
  /** False on a beat's mandatory first viewing — no skip control, Escape does nothing. */
  skippable: boolean;
  isMusicMuted: boolean;
  onToggleMusicMute: () => void;
  onFinish: () => void;
  /** Called when the player picks either option on a panel.choice — fires before the normal Continue/finish advance. */
  onChoice?: (accepted: boolean) => void;
};

const avatarMotionClass: Record<string, string> = {
  entrance: 'phase-slide',
  shake: 'cutscene-avatar-shake',
  run: 'cutscene-avatar-run',
  pulled: 'cutscene-avatar-pulled',
};

const rogueMotionClass: Record<string, string> = {
  entrance: 'phase-slide',
  dash: 'cutscene-rogue-dash',
};

// Callers must render this with `key={beat.id}` when the beat can change
// (e.g. App.tsx chaining mainframe-pull into opening) — that's what resets
// panelIndex to 0 for the new beat; there is deliberately no effect that
// calls setPanelIndex(0) on a `beat` change, since that pattern trips the
// react-hooks "no setState synchronously in an effect" rule.
export function CutsceneView({ beat, avatar, skippable, isMusicMuted, onToggleMusicMute, onFinish, onChoice }: CutsceneViewProps) {
  const [panelIndex, setPanelIndex] = useState(0);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);
  const lastAudioSrcRef = useRef<string | undefined>(undefined);

  const panel = beat.panels[panelIndex];
  const isLastPanel = panelIndex === beat.panels.length - 1;
  const isBoot = panel.layout === 'boot';
  const hasAnyAudio = beat.panels.some((candidate) => candidate.audioSrc);
  const hasAnySfx = beat.panels.some((candidate) => candidate.sfxSrc);

  useEffect(() => {
    // preventScroll: the frame itself can now scroll internally (long
    // panels, e.g. the memo) — without this, focusing the button on every
    // panel change would scroll straight to it and hide the heading above.
    continueButtonRef.current?.focus({ preventScroll: true });
  }, [panelIndex]);

  useEffect(() => {
    if (!skippable) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onFinish();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [skippable, onFinish]);

  // Loads/switches the <audio> element to `src` (no-op if already loaded)
  // and, if it's not already playing, attempts to start it. Called both
  // from an effect (best-effort — works once a page has already had one
  // gesture-driven play succeed) and synchronously from click handlers
  // below (guaranteed gesture-driven, since it runs inside a real onClick):
  // Chrome's autoplay policy requires the *first* play() on a page to
  // happen within a user gesture's own call stack, not a useEffect firing
  // a render cycle later — after that first unlock, subsequent programmatic
  // play() calls (e.g. from the effect, when a later panel's src changes)
  // are allowed for the rest of the page's session.
  function syncAudio(src: string | undefined) {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (src !== lastAudioSrcRef.current) {
      lastAudioSrcRef.current = src;
      if (src) {
        audioEl.src = src;
        audioEl.loop = true;
      } else {
        audioEl.pause();
        audioEl.removeAttribute('src');
        return;
      }
    }
    if (src && audioEl.paused) {
      void audioEl.play().catch(() => {
        // Still blocked (e.g. no gesture yet on this page at all) — the
        // next real click (handleContinue) retries from a gesture.
      });
    }
  }

  useEffect(() => {
    syncAudio(panel.audioSrc);
  }, [panel.audioSrc]);

  useEffect(() => {
    const audioEl = audioRef.current;
    const sfxEl = sfxRef.current;
    return () => {
      audioEl?.pause();
      sfxEl?.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMusicMuted;
  }, [isMusicMuted]);

  // One-shot sound effect, separate from the looping audioSrc music channel
  // above — fired from handleContinue (a real click), not an effect, for
  // the same gesture-attachment reason syncAudio is.
  function playSfx(src: string) {
    const sfxEl = sfxRef.current;
    if (!sfxEl) return;
    sfxEl.src = src;
    sfxEl.currentTime = 0;
    void sfxEl.play().catch(() => {});
  }

  function handleContinue() {
    syncAudio(panel.audioSrc);
    if (isLastPanel) {
      onFinish();
      return;
    }
    const nextPanel = beat.panels[panelIndex + 1];
    if (nextPanel.sfxSrc) playSfx(nextPanel.sfxSrc);
    setPanelIndex((index) => index + 1);
  }

  function handleChoice(accepted: boolean) {
    onChoice?.(accepted);
    handleContinue();
  }

  const continueLabel = panel.continueLabel ?? (isLastPanel ? 'Continue' : 'Next');

  if (isBoot) {
    return (
      <main className="app-shell cutscene cutscene-boot" aria-labelledby="cutscene-boot-title">
        <h1 id="cutscene-boot-title" className="sr-only">
          Terminal boot sequence
        </h1>
        {hasAnyAudio && <audio ref={audioRef} muted={isMusicMuted} aria-hidden="true" />}
        <div key={panelIndex} className="cutscene-boot-lines">
          {panel.copy.map((line, index) => (
            <p key={index} className="cutscene-boot-line type-reveal" style={{ animationDelay: `${index * 400}ms` }}>
              {line}
            </p>
          ))}
        </div>
        <div className="actions cutscene-boot-actions">
          <button type="button" className="primary" onClick={handleContinue} ref={continueButtonRef}>
            {continueLabel}
          </button>
          {hasAnyAudio && (
            <button type="button" className="link-button cutscene-mute-toggle" onClick={onToggleMusicMute}>
              {isMusicMuted ? 'Unmute music' : 'Mute music'}
            </button>
          )}
        </div>
      </main>
    );
  }

  if (panel.layout === 'tutorial' && panel.tutorialFocus) {
    return (
      <main className="app-shell sector-transition cutscene tutorial-cutscene" aria-labelledby="cutscene-title">
        <div className="sector-transition-frame cutscene-frame tutorial-cutscene-frame phase-scanline">
          <p className="eyebrow">{panel.eyebrow}</p>
          <h1 id="cutscene-title">{panel.heading}</h1>
          <div className="tutorial-scroll-area">
            <TutorialMissionPreview focus={panel.tutorialFocus} />
            <div className="cutscene-copy tutorial-copy">
              {panel.copy.map((paragraph, index) => (
                <p
                  key={index}
                  className="sector-transition-flavor type-reveal"
                  style={{ animationDelay: `${200 + index * 900}ms` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="actions tutorial-actions">
            <button type="button" className="primary" onClick={handleContinue} ref={continueButtonRef}>
              {continueLabel}
            </button>
            {skippable && beat.skipLabel && (
              <button type="button" className="link-button" onClick={onFinish}>
                {beat.skipLabel}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell sector-transition cutscene" aria-labelledby="cutscene-title">
      <div className="cutscene-glitch-overlay" aria-hidden="true" />
      {hasAnyAudio && <audio ref={audioRef} muted={isMusicMuted} aria-hidden="true" />}
      {hasAnySfx && <audio ref={sfxRef} aria-hidden="true" />}
      {panel.background && (
        <div
          key={`bg-${panelIndex}`}
          className={panel.backgroundZoom ? 'cutscene-bg cutscene-bg-zoom' : 'cutscene-bg'}
          style={{ backgroundImage: `url(${panel.background})` }}
          aria-hidden="true"
        />
      )}
      <div key={panelIndex} className="sector-transition-frame cutscene-frame phase-scanline">
        {panel.whiteoutTransition && <div className="cutscene-whiteout" aria-hidden="true" />}
        <p className="eyebrow">{panel.eyebrow}</p>
        <h1 id="cutscene-title">{panel.heading}</h1>
        {(panel.showAvatar || panel.rogueState || panel.mentorState) && (
          <div className="sector-sprite">
            {panel.rogueState && (
              <div className={rogueMotionClass[panel.rogueMotion ?? 'entrance']}>
                <RogueSprite
                  state={panel.rogueState}
                  // The entrance/final/named cinematic panels are full
                  // illustrations (src/assets/cutscenes/README.md), not the
                  // small reusable calm/corrupted icon -- shown bigger so
                  // detail survives.
                  className={panel.rogueState === 'calm' || panel.rogueState === 'corrupted' ? undefined : 'rogue-sprite-cinematic'}
                />
                {/* `named` already bakes its own nameplate into the image. */}
                {panel.rogueState !== 'named' && <img className="cutscene-nameplate" src={nameplateRogue} alt="" aria-hidden="true" />}
              </div>
            )}
            {panel.mentorState && (
              <div className="phase-slide">
                <MentorSprite state={panel.mentorState} />
                <img className="cutscene-nameplate" src={nameplateEcho} alt="" aria-hidden="true" />
              </div>
            )}
            {panel.showAvatar && (
              <div className={avatarMotionClass[panel.avatarMotion ?? 'entrance']}>
                <AvatarPreview
                  spriteId={(avatar ?? defaultAvatar).spriteId}
                  colorId={(avatar ?? defaultAvatar).colorId}
                  size={96}
                  label={`${(avatar ?? defaultAvatar).callsign} — ${panel.heading}`}
                />
              </div>
            )}
          </div>
        )}
        <div className="cutscene-copy">
          {panel.copy.map((paragraph, index) => (
            <p
              key={index}
              className="sector-transition-flavor type-reveal"
              style={{ animationDelay: `${200 + index * 900}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        {panel.codeExample && (
          <div className="cutscene-code-example">
            <p className="subtle">{panel.codeExample.description}</p>
            <pre>
              <code>{panel.codeExample.sql}</code>
            </pre>
          </div>
        )}
        <div className="actions">
          {panel.choice ? (
            <>
              <button type="button" className="primary" onClick={() => handleChoice(true)} ref={continueButtonRef}>
                {panel.choice.yesLabel}
              </button>
              <button type="button" onClick={() => handleChoice(false)}>
                {panel.choice.noLabel}
              </button>
            </>
          ) : (
            <button type="button" className="primary" onClick={handleContinue} ref={continueButtonRef}>
              {continueLabel}
            </button>
          )}
          {hasAnyAudio && (
            <button type="button" className="link-button cutscene-mute-toggle" onClick={onToggleMusicMute}>
              {isMusicMuted ? 'Unmute music' : 'Mute music'}
            </button>
          )}
          {skippable && beat.skipLabel && (
            <button type="button" className="link-button" onClick={onFinish}>
              {beat.skipLabel}
            </button>
          )}
        </div>
        {panel.creditLine && <p className="subtle cutscene-credit">{panel.creditLine}</p>}
      </div>
    </main>
  );
}
