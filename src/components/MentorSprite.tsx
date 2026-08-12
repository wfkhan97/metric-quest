import echoIdleSrc from '../assets/mentor/echo-idle.png';

export type MentorState = 'calm' | 'explaining';

// `calm` has real art now (ECHO, docs/GAME_DESIGN_BRIEF.md §B Step 3c —
// delivered ahead of the commissioned request, see
// src/assets/mentor/echo-idle.png). `explaining` has no second pose yet, so
// it keeps the placeholder glyph below — same swap-point pattern as
// AvatarPreview.tsx's sprite.imageUrl branch: once art lands, add a `src`
// per state and the <img> branch picks it up. No caller needs to change.
const MENTOR_ART: Record<MentorState, { src?: string; alt: string }> = {
  calm: { src: echoIdleSrc, alt: 'ECHO, calm and attentive' },
  explaining: { alt: 'A steady teal terminal cursor, brighter, actively explaining' },
};

type MentorSpriteProps = {
  state: MentorState;
  className?: string;
};

export function MentorSprite({ state, className }: MentorSpriteProps) {
  const art = MENTOR_ART[state];
  const wrapperClass = className ? `mentor-sprite ${className}` : 'mentor-sprite';

  if (art.src) {
    return <img className={wrapperClass} src={art.src} alt={art.alt} />;
  }

  return (
    <svg
      className={`${wrapperClass} mentor-sprite-placeholder${state === 'explaining' ? ' is-explaining' : ''}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={art.alt}
    >
      <rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="var(--retro-teal)" strokeWidth="3" />
      <rect x="18" y="28" width="20" height="8" fill="var(--retro-teal)" />
    </svg>
  );
}
