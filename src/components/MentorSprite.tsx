import mentorActive from '../assets/mentor/mentor-active.png';
import mentorIdle from '../assets/mentor/mentor-idle.png';

export type MentorState = 'calm' | 'explaining';

// Real art landed 2026-08-12: mentor-idle.png/mentor-active.png (a matched
// idle/active CRT-monitor pair, docs/GAME_DESIGN_BRIEF.md §B Step 3c's
// spec) had been committed 2026-08-10 but never wired into any component —
// found and wired in here. Preferred over the single-state echo-idle.png
// delivered concurrently on codex/mentor-system-character since this is a
// complete pair and needed no new request. The `src?` swap-point pattern
// stays (same as AvatarPreview.tsx's sprite.imageUrl branch) so a future
// third state added without art yet still renders something, rather than
// breaking.
const MENTOR_ART: Record<MentorState, { src?: string; alt: string }> = {
  calm: { src: mentorIdle, alt: 'ECHO, a calm teal CRT terminal, steady and attentive' },
  explaining: { src: mentorActive, alt: 'ECHO, a bright teal CRT terminal, actively explaining' },
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
