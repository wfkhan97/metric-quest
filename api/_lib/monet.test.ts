import { describe, expect, it } from 'vitest';
import {
  buildAuthorizeUrl,
  buildTutorSystemPrompt,
  decodeState,
  encodeState,
  isMonetProvider,
  modelForProvider,
  originFromHeaders,
  parseCookies,
  serializeCookie,
  type TutorContext,
} from './monet';

describe('isMonetProvider', () => {
  it('accepts openai and anthropic only', () => {
    expect(isMonetProvider('openai')).toBe(true);
    expect(isMonetProvider('anthropic')).toBe(true);
    expect(isMonetProvider('google')).toBe(false);
    expect(isMonetProvider(undefined)).toBe(false);
    expect(isMonetProvider(null)).toBe(false);
    expect(isMonetProvider('')).toBe(false);
  });
});

describe('modelForProvider', () => {
  it('maps to the allowlisted model string per provider', () => {
    expect(modelForProvider('anthropic')).toBe('claude-sonnet-4');
    expect(modelForProvider('openai')).toBe('gpt-4o');
  });
});

describe('encodeState / decodeState', () => {
  it('round-trips provider and csrf', () => {
    const state = encodeState('anthropic', 'abc-123');
    expect(decodeState(state)).toEqual({ provider: 'anthropic', csrf: 'abc-123' });
  });

  it('rejects malformed or tampered state', () => {
    expect(decodeState(null)).toBeNull();
    expect(decodeState('')).toBeNull();
    expect(decodeState('no-separator')).toBeNull();
    expect(decodeState('google_abc')).toBeNull();
    expect(decodeState('openai_')).toBeNull();
    expect(decodeState('_abc')).toBeNull();
  });

  it('handles csrf values that themselves contain underscores', () => {
    const state = encodeState('openai', 'a_b_c');
    expect(decodeState(state)).toEqual({ provider: 'openai', csrf: 'a_b_c' });
  });
});

describe('buildAuthorizeUrl', () => {
  it('builds a Monet authorize URL with all required params', () => {
    const url = buildAuthorizeUrl({
      clientId: 'proj_metric_quest_sandbox_d9e1ec',
      provider: 'openai',
      redirectUri: 'https://example.com/api/oauth/callback',
      state: 'openai_csrf123',
    });
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://www.monet.gg');
    expect(parsed.pathname).toBe('/authorize');
    expect(parsed.searchParams.get('client_id')).toBe('proj_metric_quest_sandbox_d9e1ec');
    expect(parsed.searchParams.get('provider')).toBe('openai');
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://example.com/api/oauth/callback');
    expect(parsed.searchParams.get('state')).toBe('openai_csrf123');
  });
});

describe('originFromHeaders', () => {
  it('uses x-forwarded-proto when present (Vercel production/preview)', () => {
    expect(originFromHeaders({ host: 'metric-quest.vercel.app', 'x-forwarded-proto': 'https' })).toBe(
      'https://metric-quest.vercel.app',
    );
  });

  it('takes the first value when x-forwarded-proto is a comma-separated list', () => {
    expect(originFromHeaders({ host: 'metric-quest.vercel.app', 'x-forwarded-proto': 'https,http' })).toBe(
      'https://metric-quest.vercel.app',
    );
  });

  it('falls back to http for localhost with no forwarded-proto header', () => {
    expect(originFromHeaders({ host: 'localhost:3000' })).toBe('http://localhost:3000');
  });

  it('falls back to https for a non-localhost host with no forwarded-proto header', () => {
    expect(originFromHeaders({ host: 'metric-quest.example.com' })).toBe('https://metric-quest.example.com');
  });
});

describe('parseCookies', () => {
  it('parses a standard Cookie header', () => {
    expect(parseCookies('a=1; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('returns an empty object for missing/empty header', () => {
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies(null)).toEqual({});
    expect(parseCookies('')).toEqual({});
  });

  it('decodes URI-encoded values', () => {
    expect(parseCookies('monet_provider=openai%20test')).toEqual({ monet_provider: 'openai test' });
  });

  it('ignores malformed segments without throwing', () => {
    expect(parseCookies('a=1; malformed; b=2')).toEqual({ a: '1', b: '2' });
  });
});

describe('buildTutorSystemPrompt', () => {
  const baseContext: TutorContext = {
    missionTitle: 'Priority invoices',
    missionBrief: 'Return the five highest-value invoices billed to the United States.',
    concept: 'Filter, sort, and limit',
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    currentSql: 'SELECT * FROM Invoice;',
  };

  it('returns a system-role message', () => {
    expect(buildTutorSystemPrompt(baseContext).role).toBe('system');
  });

  it('includes the mission brief, concept, and schema', () => {
    const content = buildTutorSystemPrompt(baseContext).content;
    expect(content).toContain('Priority invoices');
    expect(content).toContain('Return the five highest-value invoices billed to the United States.');
    expect(content).toContain('Filter, sort, and limit');
    expect(content).toContain('Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)');
  });

  it('instructs hints-first but a full answer once explicitly asked', () => {
    const content = buildTutorSystemPrompt(baseContext).content;
    expect(content.toLowerCase()).toContain('hint');
    expect(content).toContain('If they explicitly ask for the full answer');
  });

  it('notes when the player has not written anything yet', () => {
    const content = buildTutorSystemPrompt({ ...baseContext, currentSql: '   ' }).content;
    expect(content).toContain("(empty — they haven't written anything yet)");
  });

  it('includes relationships when present', () => {
    const content = buildTutorSystemPrompt({ ...baseContext, relationships: ['InvoiceLine.TrackId -> Track.TrackId'] }).content;
    expect(content).toContain('InvoiceLine.TrackId -> Track.TrackId');
  });

  it('includes the last result set, row count, and columns', () => {
    const content = buildTutorSystemPrompt({
      ...baseContext,
      lastResult: { columns: ['InvoiceId', 'Total'], rows: [[1, 9.99], [2, 4.5]] },
    }).content;
    expect(content).toContain('2 row(s), columns: InvoiceId, Total');
    expect(content).toContain('[1,9.99]');
    expect(content).toContain('[2,4.5]');
  });

  it('truncates result sets past the row cap', () => {
    const rows = Array.from({ length: 30 }, (_, index) => [index]);
    const content = buildTutorSystemPrompt({ ...baseContext, lastResult: { columns: ['n'], rows } }).content;
    expect(content).toContain('… (5 more row(s) truncated)');
    expect(content).not.toContain('[29]');
  });

  it('includes the diagnostic label when present', () => {
    const content = buildTutorSystemPrompt({ ...baseContext, diagnosticLabel: 'wrong number of rows' }).content;
    expect(content).toContain('Automated diagnostic on their last wrong attempt: wrong number of rows');
  });

  it('omits result and diagnostic sections when absent', () => {
    const content = buildTutorSystemPrompt(baseContext).content;
    expect(content).not.toContain('actual result');
    expect(content).not.toContain('Automated diagnostic');
  });
});

describe('serializeCookie', () => {
  it('sets HttpOnly, Secure, SameSite=Lax, and a Max-Age', () => {
    const cookie = serializeCookie('monet_token', 'secret-value', { maxAgeSeconds: 3600 });
    expect(cookie).toContain('monet_token=secret-value');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=3600');
  });

  it('clears the cookie with Max-Age=0 when clear is set', () => {
    const cookie = serializeCookie('monet_token', '', { clear: true });
    expect(cookie).toContain('Max-Age=0');
  });

  it('URI-encodes the value', () => {
    const cookie = serializeCookie('monet_provider', 'a b');
    expect(cookie).toContain('monet_provider=a%20b');
  });
});
