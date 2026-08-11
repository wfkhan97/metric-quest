import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildTutorSystemPrompt,
  callMonetChatCompletions,
  isMonetProvider,
  parseCookies,
  PROVIDER_COOKIE,
  TOKEN_COOKIE,
  type ChatMessage,
  type TutorContext,
  type TutorContextRow,
} from './_lib/monet';

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
  if (typeof concept !== 'string' || typeof currentSql !== 'string') return null;
  if (!isStringArray(visibleTables)) return null;

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

/**
 * POST /api/chat — the only endpoint the tutor UI talks to for actual
 * messages. Reads the connection from httpOnly cookies (never from the
 * request body), so the browser never needs to see the Monet access token.
 *
 * The request also carries the current mission's context (schema, the
 * player's SQL, their last result, any diagnostic) so the tutor can "fully
 * help" per product decision (2026-08-11) rather than reason blind. That
 * context is turned into a system message here, server-side, so the
 * hints-first/full-answer-if-asked behavior can't be stripped by editing
 * client JS.
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
  const context = parseContext(req.body);
  if (!messages || !context) {
    res.status(400).json({
      error: 'Body must be { messages: [{ role, content }, ...], context: { missionTitle, missionBrief, concept, visibleTables, currentSql, ... } }.',
    });
    return;
  }

  try {
    const completion = await callMonetChatCompletions({
      accessToken,
      provider,
      messages: [buildTutorSystemPrompt(context), ...messages],
    });
    res.status(200).json(completion);
  } catch (error) {
    // Don't relay Monet's raw error text to the client — it could echo the
    // Authorization header or other request internals back.
    res.status(502).json({ error: 'The AI tutor is unavailable right now. Try again in a moment.' });
    console.error('Monet chat completion failed', error);
  }
}
