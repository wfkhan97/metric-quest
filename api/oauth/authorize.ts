import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAuthorizeUrl,
  CSRF_COOKIE,
  CSRF_COOKIE_MAX_AGE_SECONDS,
  encodeState,
  isMonetProvider,
  originFromHeaders,
  serializeCookie,
} from '../_lib/monet';

/**
 * GET /api/oauth/authorize?provider=openai|anthropic
 *
 * Sets a short-lived, httpOnly CSRF cookie and redirects the browser to
 * Monet's hosted consent screen. Kept as its own server round-trip (rather
 * than the client redirecting to Monet directly) specifically so the CSRF
 * token can be httpOnly — a client-visible token would defeat the point.
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  const clientId = process.env.MONET_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'MONET_CLIENT_ID is not configured' });
    return;
  }

  const provider = typeof req.query.provider === 'string' ? req.query.provider : undefined;
  if (!isMonetProvider(provider)) {
    res.status(400).json({ error: 'provider must be "openai" or "anthropic"' });
    return;
  }

  const csrf = crypto.randomUUID();
  const redirectUri = new URL('/api/oauth/callback', originFromHeaders(req.headers)).toString();
  const authorizeUrl = buildAuthorizeUrl({ clientId, provider, redirectUri, state: encodeState(provider, csrf) });

  res.setHeader('Set-Cookie', serializeCookie(CSRF_COOKIE, csrf, { maxAgeSeconds: CSRF_COOKIE_MAX_AGE_SECONDS }));
  res.redirect(302, authorizeUrl);
}
