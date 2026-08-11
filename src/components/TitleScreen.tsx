import { useEffect, useRef, useState } from 'react';
import corridorCalm from '../assets/backgrounds/corridor-calm.jpg';
import cueMainframeOverture from '../assets/audio/cue-c-mainframe-overture.m4a';
import { hasAnyProgress, type Progress } from '../lib/progress';

type TitleScreenProps = {
  progress: Progress;
  isMusicMuted: boolean;
  onToggleMusicMute: () => void;
  onResume: () => void;
  onNewGame: () => void;
};

// The very first screen on a fresh page load — reuses the sector-transition
// frame/background chrome wholesale (same as the opening cutscenes do) so it
// costs no new visual language, just new copy and two buttons.
export function TitleScreen({ progress, isMusicMuted, onToggleMusicMute, onResume, onNewGame }: TitleScreenProps) {
  const canResume = hasAnyProgress(progress);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryButtonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMusicMuted;
  }, [isMusicMuted]);

  // Cold-start autoplay is blocked until the page has had a user gesture —
  // same limitation CutsceneView's music has. Attempting play() on every
  // click here (capture phase, before the button's own handler) means the
  // very first click anywhere on this screen is the gesture that unlocks it,
  // same as CutsceneView's syncAudio retrying from a real click handler.
  function tryPlay() {
    const audioEl = audioRef.current;
    if (audioEl && audioEl.paused) {
      void audioEl.play().catch(() => {});
    }
  }

  useEffect(() => {
    tryPlay();
  }, []);

  function handleNewGameClick() {
    if (canResume) {
      setConfirmingNewGame(true);
      return;
    }
    onNewGame();
  }

  return (
    <main className="app-shell sector-transition cutscene title-screen" aria-labelledby="title-screen-heading" onClickCapture={tryPlay}>
      <audio ref={audioRef} src={cueMainframeOverture} loop muted={isMusicMuted} aria-hidden="true" />
      <div className="cutscene-bg" style={{ backgroundImage: `url(${corridorCalm})` }} aria-hidden="true" />
      <div className="sector-transition-frame title-screen-frame">
        <p className="eyebrow">Aurora Music mainframe · analyst access</p>
        <h1 id="title-screen-heading">Metric Quest</h1>
        <div className="cutscene-copy">
          <p className="sector-transition-flavor">
            Nine sectors of the mainframe are corrupted. ROGUE.exe is faking the numbers — real SQL is the only way to
            prove it and get out.
          </p>
        </div>

        {!confirmingNewGame ? (
          <div className="actions">
            {canResume && (
              <button type="button" className="primary" onClick={onResume} ref={primaryButtonRef}>
                Resume game
              </button>
            )}
            <button type="button" onClick={handleNewGameClick} ref={canResume ? undefined : primaryButtonRef}>
              New game
            </button>
          </div>
        ) : (
          <>
            <div className="cutscene-copy">
              <p className="sector-transition-flavor">Starting a new game will overwrite your current progress. This can&apos;t be undone.</p>
            </div>
            <div className="actions">
              <button type="button" className="primary" onClick={onNewGame}>
                Yes, start new game
              </button>
              <button type="button" onClick={() => setConfirmingNewGame(false)}>
                Cancel
              </button>
            </div>
          </>
        )}

        <button type="button" className="link-button cutscene-mute-toggle" onClick={onToggleMusicMute}>
          {isMusicMuted ? 'Unmute music' : 'Mute music'}
        </button>
      </div>
    </main>
  );
}
