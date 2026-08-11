import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isMonetProvider, parseCookies, PROVIDER_COOKIE, TOKEN_COOKIE } from '../_lib/monet';

/**
 * GET /api/oauth/status — tells the client whether a connection exists and
 * which provider, without ever exposing the token itself.
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  const cookies = parseCookies(req.headers.cookie);
  const provider = cookies[PROVIDER_COOKIE];
  const connected = Boolean(cookies[TOKEN_COOKIE]) && isMonetProvider(provider);
  res.status(200).json(connected ? { connected: true, provider } : { connected: false });
}
