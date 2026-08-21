import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildTutorSystemPrompt,
  callMoonshotChatCompletions,
  createFixedWindowRateLimiter,
  normalizeTutorHistory,
  selectedMoonshotModel,
  type ChatMessage,
  type TutorContext,
  type TutorContextRow,
} from './_lib/moonshot.js';

const CHAT_RATE_LIMIT = createFixedWindowRateLimiter({ maxRequests: 8, windowMs: 60_000 });

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object' || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const parsed: ChatMessage[] = [];
  for (const entry of (body as { messages: unknown[] }).messages) {
    if (!entry || typeof entry !== 'object') return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    parsed.push({ role, content });
  }
  return normalizeTutorHistory(parsed);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function parseLastResult(value: unknown): TutorContext['lastResult'] {
  if (!value || typeof value !== 'object') return undefined;
  const { columns, rows } = value as { columns?: unknown; rows?: unknown };
  if (!isStringArray(columns) || !Array.isArray(rows)) return undefined;
  const validRows = rows.every(
    (row): row is TutorContextRow => Array.isArray(row) && row.every((cell) => typeof cell === 'string' || typeof cell === 'number' || cell === null),
  );
  if (!validRows) return undefined;
  return { columns, rows: rows as TutorContextRow[] };
}

function parseContext(body: unknown): TutorContext | null {
  if (!body || typeof body !== 'object') return null;
  const context = (body as { context?: unknown }).context;
  if (!context || typeof context !== 'object') return null;
  const candidate = context as Record<string, unknown>;
  const { missionTitle, missionBrief, concept, currentSql, visibleTables, relationships, diagnosticLabel } = candidate;
  if (typeof missionTitle !== 'string' || typeof missionBrief !== 'string') return null;
  if (typeof concept !== 'string' || typeof currentSql !== 'string' || !isStringArray(visibleTables)) return null;

  return {
    missionTitle,
    missionBrief,
    concept,
    currentSql,
    visibleTables,
    relationships: isStringArray(relationships) ? relationships : undefined,
    lastResult: parseLastResult(candidate.lastResult),
    diagnosticLabel: typeof diagnosticLabel === 'string' ? diagnosticLabel : undefined,
  };
}

function clientKey(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  return firstAddress?.trim() || 'unknown-client';
}

/**
 * POST /api/chat — the optional tutor's only server endpoint. Moonshot is
 * called with a game-owned server secret; browsers never see an API key and
 * no player account, OAuth callback, or connection cookie is involved.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'The AI tutor is not configured yet.' });
    return;
  }

  if (!CHAT_RATE_LIMIT.check(clientKey(req))) {
    res.status(429).json({ error: 'The AI tutor is taking a short break. Please try again in a minute.' });
    return;
  }

  const messages = parseMessages(req.body);
  const context = parseContext(req.body);
  if (!messages || !context) {
    res.status(400).json({
      error: 'Body must include valid user/assistant messages and the active mission context.',
    });
    return;
  }

  try {
    const completion = await callMoonshotChatCompletions({
      apiKey,
      model: selectedMoonshotModel(),
      messages: [buildTutorSystemPrompt(context), ...messages],
    });
    res.status(200).json(completion);
  } catch (error) {
    // Do not relay provider text: it could include request internals.
    console.error('Moonshot tutor completion failed', error);
    res.status(502).json({ error: 'The AI tutor is unavailable right now. Try again in a moment.' });
  }
}
