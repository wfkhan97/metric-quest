/**
 * Pure helpers for the Monet OAuth relay (P?: "friendly AI" tutor, BYO
 * ChatGPT/Claude subscription via monet.gg). Kept dependency-free and
 * side-effect-free so they're unit-testable without a live Vercel/Monet
 * environment — see monet.test.ts.
 */

export const MONET_HOST = 'https://www.monet.gg';

export type MonetProvider = 'openai' | 'anthropic';

export function isMonetProvider(value: string | null | undefined): value is MonetProvider {
  return value === 'openai' || value === 'anthropic';
}

/** Model Monet allowlists per provider, per the metric-quest project's Integrate docs. */
export function modelForProvider(provider: MonetProvider): string {
  return provider === 'anthropic' ? 'claude-sonnet-4' : 'gpt-4o';
}

/**
 * The `state` param round-trips through Monet unmodified, so it doubles as
 * both CSRF defense and a way to recover which provider the user picked
 * (Monet's own integration example does the same: `${provider}_${csrf}`).
 */
export function encodeState(provider: MonetProvider, csrf: string): string {
  return `${provider}_${csrf}`;
}

export function decodeState(state: string | null | undefined): { provider: MonetProvider; csrf: string } | null {
  if (!state) return null;
  const separatorIndex = state.indexOf('_');
  if (separatorIndex <= 0) return null;
  const provider = state.slice(0, separatorIndex);
  const csrf = state.slice(separatorIndex + 1);
  if (!isMonetProvider(provider) || !csrf) return null;
  return { provider, csrf };
}

/**
 * Vercel terminates TLS in front of the function, so the function itself
 * always sees plain HTTP — `x-forwarded-proto` is the only place the real
 * scheme survives. Falls back to http for bare `vercel dev`/localhost,
 * where that header isn't set.
 */
export function originFromHeaders(headers: { host?: string; 'x-forwarded-proto'?: string | string[] }): string {
  const host = headers.host ?? 'localhost:3000';
  const forwardedProto = headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(',')[0];
  const scheme = proto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${scheme}://${host}`;
}

export function buildAuthorizeUrl(params: {
  clientId: string;
  provider: MonetProvider;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL('/authorize', MONET_HOST);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('provider', params.provider);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('state', params.state);
  return url.toString();
}

export type TokenExchangeResult = { access_token: string; connection_id: string };

export async function exchangeCodeForToken(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<TokenExchangeResult> {
  const response = await fetch(`${MONET_HOST}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: params.redirectUri,
    }),
  });
  if (!response.ok) {
    throw new Error(`Monet token exchange failed (${response.status})`);
  }
  const body = (await response.json()) as Partial<TokenExchangeResult>;
  if (typeof body.access_token !== 'string' || typeof body.connection_id !== 'string') {
    throw new Error('Monet token exchange returned an unexpected shape');
  }
  return { access_token: body.access_token, connection_id: body.connection_id };
}

export type ChatMessage = { role: string; content: string };

export async function callMonetChatCompletions(params: {
  accessToken: string;
  provider: MonetProvider;
  messages: ChatMessage[];
}): Promise<unknown> {
  const response = await fetch(`${MONET_HOST}/api/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: modelForProvider(params.provider), messages: params.messages }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Monet chat completion failed (${response.status}): ${text}`);
  }
  return JSON.parse(text);
}

/** Minimal cookie parsing — only what's needed to read our own two cookies back. */
export function parseCookies(header: string | undefined | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) continue;
    const name = part.slice(0, separatorIndex).trim();
    if (!name) continue;
    const value = part.slice(separatorIndex + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }
  return cookies;
}

export function serializeCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds?: number; clear?: boolean } = {},
): string {
  const segments = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax'];
  if (options.clear) {
    segments.push('Max-Age=0');
  } else if (options.maxAgeSeconds) {
    segments.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  return segments.join('; ');
}

export const CSRF_COOKIE = 'monet_csrf';
export const TOKEN_COOKIE = 'monet_token';
export const PROVIDER_COOKIE = 'monet_provider';

/** 10 minutes — just long enough to complete the redirect round-trip to Monet and back. */
export const CSRF_COOKIE_MAX_AGE_SECONDS = 600;
/** 8 hours — a study session, not a persistent login; there's no refresh flow yet. */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;
