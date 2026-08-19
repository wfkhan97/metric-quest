import { track } from '@vercel/analytics';
import type { Mission } from './missions';
import type { QueryErrorCode } from './sqlRunner';
import type { ValidationResult } from './grading';

/**
 * The only data Metric Quest sends to Vercel Web Analytics. Keep this module
 * deliberately narrow: no SQL, result rows, save data, callsigns, or durable
 * player identifiers belong in analytics events.
 */
type EventData = Record<string, string | number | boolean | null>;

function safelyTrack(name: string, data: EventData): void {
  try {
    track(name, data);
  } catch {
    // Analytics must never block a lesson or turn a recoverable issue into a
    // player-visible failure (including in local development or preview).
  }
}

export function trackGameStarted(mode: 'new' | 'resume'): void {
  safelyTrack('game_started', { mode });
}

export function trackMissionOpened(mission: Mission): void {
  safelyTrack('mission_opened', { mission_id: mission.id, sector: mission.chapter });
}

export function trackQueryEvaluated(
  mission: Mission,
  outcome: 'correct' | 'wrong' | 'query_error',
  details: {
    attemptBucket?: 'first' | 'second' | 'third_or_more';
    validationKind?: Exclude<ValidationResult, { correct: true }>['kind'];
    mistakeSignatureId?: string;
    runnerErrorCode?: QueryErrorCode;
  } = {},
): void {
  safelyTrack('query_evaluated', {
    mission_id: mission.id,
    sector: mission.chapter,
    outcome,
    attempt_bucket: details.attemptBucket ?? null,
    validation_kind: details.validationKind ?? null,
    mistake_signature_id: details.mistakeSignatureId ?? null,
    runner_error_code: details.runnerErrorCode ?? null,
  });
}

export function trackMissionCompleted(mission: Mission): void {
  safelyTrack('mission_completed', { mission_id: mission.id, sector: mission.chapter });
}

export function trackHintRevealed(mission: Mission, hintNumber: number): void {
  safelyTrack('hint_revealed', { mission_id: mission.id, sector: mission.chapter, hint_number: hintNumber });
}

export function trackSolutionRevealed(mission: Mission): void {
  safelyTrack('solution_revealed', { mission_id: mission.id, sector: mission.chapter });
}

export function trackStorageUnavailable(): void {
  safelyTrack('storage_unavailable', {});
}

export function trackClientError(surface: 'error_boundary' | 'window_error' | 'unhandled_rejection'): void {
  safelyTrack('client_error', { surface });
}

/** Installs one safe, aggregate-only listener pair before React renders. */
export function installGlobalErrorTracking(): void {
  if (typeof window === 'undefined' || window.__metricQuestErrorTrackingInstalled) return;
  window.__metricQuestErrorTrackingInstalled = true;

  window.addEventListener('error', () => trackClientError('window_error'));
  window.addEventListener('unhandledrejection', () => trackClientError('unhandled_rejection'));
}

declare global {
  interface Window {
    __metricQuestErrorTrackingInstalled?: boolean;
  }
}
