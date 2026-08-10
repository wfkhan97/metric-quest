import { describe, expect, it } from 'vitest';
import {
  buildAuthorizeUrl,
  decodeState,
  encodeState,
  isMonetProvider,
  modelForProvider,
  originFromHeaders,
  parseCookies,
  serializeCookie,
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
