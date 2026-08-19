/**
 * Server-only helpers for the optional Moonshot-powered SQL tutor.
 *
 * The browser receives neither the Moonshot API key nor a provider token.
 * Keep the tutor's mission context and teaching rules here so a learner
 * cannot bypass them by editing client-side JavaScript.
 */

export const MOONSHOT_CHAT_COMPLETIONS_URL = 'https://api.moonshot.ai/v1/chat/completions';
export const DEFAULT_MOONSHOT_MODEL = 'moonshot-v1-8k';
export const MAX_TUTOR_HISTORY_MESSAGES = 12;
export const MAX_TUTOR_MESSAGE_CHARACTERS = 2_000;
export const MAX_TUTOR_OUTPUT_TOKENS = 450;

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type TutorContextRow = (string | number | null)[];

export type TutorContext = {
  missionTitle: string;
  missionBrief: string;
  concept: string;
  visibleTables: string[];
  relationships?: string[];
  currentSql: string;
  lastResult?: { columns: string[]; rows: TutorContextRow[] };
  diagnosticLabel?: string;
};

/** Row cap prevents one broad result set from dominating a tutor prompt. */
const MAX_CONTEXT_ROWS = 25;

/**
 * Keeps the most recent conversational turns within a predictable prompt
 * budget. The UI still displays the full local conversation to the learner.
 */
export function normalizeTutorHistory(messages: ChatMessage[]): ChatMessage[] | null {
  if (messages.length === 0) return null;
  const recent = messages.slice(-MAX_TUTOR_HISTORY_MESSAGES);
  const normalized: ChatMessage[] = [];
  for (const message of recent) {
    if ((message.role !== 'user' && message.role !== 'assistant') || !message.content.trim()) return null;
    const content = message.content.trim();
    if (content.length > MAX_TUTOR_MESSAGE_CHARACTERS) return null;
    normalized.push({ role: message.role, content });
  }
  return normalized;
}

/**
 * Builds the trusted system prompt from the live mission state. The tutor
 * helps with an executed attempt; it must not run a query or grade one.
 */
export function buildTutorSystemPrompt(context: TutorContext): ChatMessage {
  const lines: string[] = [
    'You are ECHO, a friendly, patient SQL tutor inside Metric Quest, a browser-based SQL learning game. ' +
      'The player is working on the mission described below. Default to brief hints and guiding questions that help ' +
      'them reason through their OWN query, rather than solving it for them unprompted. If they explicitly ask ' +
      'for the full answer or complete query, give it to them directly. Never claim that you executed their query, ' +
      'changed their score, or accessed information not included in this prompt.',
    '',
    `Mission: ${context.missionTitle}`,
    `Concept: ${context.concept}`,
    `Business question: ${context.missionBrief}`,
    '',
    'Visible schema:',
    ...context.visibleTables.map((table) => `- ${table}`),
  ];

  if (context.relationships?.length) {
    lines.push('Table relationships:', ...context.relationships.map((relationship) => `- ${relationship}`));
  }

  lines.push('', "Player's current SQL:", context.currentSql.trim() || "(empty — they haven't written anything yet)");

  if (context.lastResult) {
    const { columns, rows } = context.lastResult;
    lines.push('', `Their last query's actual result (${rows.length} row(s), columns: ${columns.join(', ')}):`);
    lines.push(...rows.slice(0, MAX_CONTEXT_ROWS).map((row) => JSON.stringify(row)));
    if (rows.length > MAX_CONTEXT_ROWS) {
      lines.push(`… (${rows.length - MAX_CONTEXT_ROWS} more row(s) truncated)`);
    }
  }

  if (context.diagnosticLabel) {
    lines.push('', `Automated diagnostic on their last wrong attempt: ${context.diagnosticLabel}`);
  }

  return { role: 'system', content: lines.join('\n') };
}

export function selectedMoonshotModel(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.MOONSHOT_MODEL?.trim() || DEFAULT_MOONSHOT_MODEL;
}

export async function callMoonshotChatCompletions(params: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}): Promise<unknown> {
  const response = await fetch(MOONSHOT_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_completion_tokens: MAX_TUTOR_OUTPUT_TOKENS,
      stream: false,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Moonshot chat completion failed (${response.status}): ${text}`);
  }
  return JSON.parse(text);
}

type RateLimitEntry = { startedAt: number; count: number };

/**
 * A small per-instance guard for the public serverless route. It is purposely
 * injectable for deterministic tests. Production launch still requires a
 * durable edge/store-backed limit and spend alert, per BACKLOG item 3.
 */
export function createFixedWindowRateLimiter(params: { maxRequests: number; windowMs: number; now?: () => number }) {
  const entries = new Map<string, RateLimitEntry>();
  const now = params.now ?? Date.now;

  return {
    check(key: string): boolean {
      const timestamp = now();
      const entry = entries.get(key);
      if (!entry || timestamp - entry.startedAt >= params.windowMs) {
        entries.set(key, { startedAt: timestamp, count: 1 });
        return true;
      }
      if (entry.count >= params.maxRequests) return false;
      entry.count += 1;
      return true;
    },
  };
}
