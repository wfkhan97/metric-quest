import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CSRF_COOKIE,
  decodeState,
  exchangeCodeForToken,
  originFromHeaders,
  parseCookies,
  PROVIDER_COOKIE,
  serializeCookie,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  TOKEN_COOKIE,
} from '../_lib/monet';

/**
 * GET /api/oauth/callback — Monet redirects here after the user approves
 * (or denies) the connection.
 *
 * The access token never reaches the browser: it's exchanged server-side
 * and stored only in an httpOnly cookie, so page JS (and any XSS in it)
 * can't read it. That's a deliberate departure from Monet's own sample
 * callback code, which stashes the token in `sessionStorage` — a plain
 * browser API that can't run in a server route in the first place, and
 * wouldn't be safe to use for this even if it could.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const clientId = process.env.MONET_CLIENT_ID;
  const clientSecret = process.env.MONET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'MONET_CLIENT_ID / MONET_CLIENT_SECRET are not configured' });
    return;
  }

  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;
  const decodedState = decodeState(state);
  const cookies = parseCookies(req.headers.cookie);
  const expectedCsrf = cookies[CSRF_COOKIE];

  // Always clear the one-time CSRF cookie regardless of outcome.
  const clearCsrf = serializeCookie(CSRF_COOKIE, '', { clear: true });

  if (!code || !decodedState || !expectedCsrf || decodedState.csrf !== expectedCsrf) {
    res.setHeader('Set-Cookie', clearCsrf);
    res.status(400).send('Connection request could not be verified. Please try connecting again.');
    return;
  }

  try {
    const redirectUri = new URL('/api/oauth/callback', originFromHeaders(req.headers)).toString();
    const { access_token: accessToken } = await exchangeCodeForToken({ clientId, clientSecret, code, redirectUri });

    res.setHeader('Set-Cookie', [
      clearCsrf,
      serializeCookie(TOKEN_COOKIE, accessToken, { maxAgeSeconds: SESSION_COOKIE_MAX_AGE_SECONDS }),
      serializeCookie(PROVIDER_COOKIE, decodedState.provider, { maxAgeSeconds: SESSION_COOKIE_MAX_AGE_SECONDS }),
    ]);
    res.redirect(302, '/?connected=' + decodedState.provider);
  } catch (error) {
    res.setHeader('Set-Cookie', clearCsrf);
    res.status(502).send(error instanceof Error ? error.message : 'Monet token exchange failed.');
  }
}
