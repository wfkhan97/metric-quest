import { beforeEach, describe, expect, it, vi } from 'vitest';
import { missions } from './missions';

const analyticsMock = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock('@vercel/analytics', () => analyticsMock);

import { trackMissionOpened, trackQueryEvaluated } from './analytics';

describe('analytics privacy boundary', () => {
  beforeEach(() => analyticsMock.track.mockReset());

  it('records only fixed mission metadata for a mission open', () => {
    trackMissionOpened(missions[0]);

    expect(analyticsMock.track).toHaveBeenCalledWith('mission_opened', {
      mission_id: missions[0].id,
      sector: missions[0].chapter,
    });
  });

  it('records an aggregate query outcome without accepting SQL or result data', () => {
    trackQueryEvaluated(missions[0], 'wrong', {
      attemptBucket: 'second',
      validationKind: 'row-count',
      mistakeSignatureId: 'm1-1-missing-limit',
    });

    expect(analyticsMock.track).toHaveBeenCalledWith('query_evaluated', {
      mission_id: missions[0].id,
      sector: missions[0].chapter,
      outcome: 'wrong',
      attempt_bucket: 'second',
      validation_kind: 'row-count',
      mistake_signature_id: 'm1-1-missing-limit',
      runner_error_code: null,
    });
  });
});
