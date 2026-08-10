import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PROVIDER_COOKIE, serializeCookie, TOKEN_COOKIE } from '../_lib/monet';

/**
 * POST /api/oauth/disconnect — clears our session cookies. This only
 * forgets the connection locally; it doesn't revoke it on Monet's side
 * (that's done from the Monet dashboard, per their own "revoke anytime").
 */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  res.setHeader('Set-Cookie', [
    serializeCookie(TOKEN_COOKIE, '', { clear: true }),
    serializeCookie(PROVIDER_COOKIE, '', { clear: true }),
  ]);
  res.status(200).json({ connected: false });
}
