import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callMonetChatCompletions, isMonetProvider, parseCookies, PROVIDER_COOKIE, TOKEN_COOKIE, type ChatMessage } from './_lib/monet';

const MAX_MESSAGES = 40;

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const messages = (body as { messages: unknown[] }).messages;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  const parsed: ChatMessage[] = [];
  for (const entry of messages) {
    if (!entry || typeof entry !== 'object') return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || typeof content !== 'string' || !content.trim()) return null;
    parsed.push({ role, content });
  }
  return parsed;
}

/**
 * POST /api/chat — the only endpoint the tutor UI talks to for actual
 * messages. Reads the connection from httpOnly cookies (never from the
 * request body), so the browser never needs to see the Monet access token.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const accessToken = cookies[TOKEN_COOKIE];
  const provider = cookies[PROVIDER_COOKIE];
  if (!accessToken || !isMonetProvider(provider)) {
    res.status(401).json({ error: 'Not connected. Connect GPT or Claude first.' });
    return;
  }

  const messages = parseMessages(req.body);
  if (!messages) {
    res.status(400).json({ error: 'Body must be { messages: [{ role, content }, ...] } (1-40 entries).' });
    return;
  }

  try {
    const completion = await callMonetChatCompletions({ accessToken, provider, messages });
    res.status(200).json(completion);
  } catch (error) {
    // Don't relay Monet's raw error text to the client — it could echo the
    // Authorization header or other request internals back.
    res.status(502).json({ error: 'The AI tutor is unavailable right now. Try again in a moment.' });
    console.error('Monet chat completion failed', error);
  }
}
