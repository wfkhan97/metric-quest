export type TutorProvider = 'openai' | 'anthropic';

export type TutorMessage = { role: 'user' | 'assistant'; content: string };

export type ConnectionStatus = { connected: false } | { connected: true; provider: TutorProvider };

export function connectUrl(provider: TutorProvider): string {
  return `/api/oauth/authorize?provider=${provider}`;
}

export async function fetchConnectionStatus(): Promise<ConnectionStatus> {
  const response = await fetch('/api/oauth/status');
  if (!response.ok) return { connected: false };
  const body = (await response.json()) as ConnectionStatus;
  return body.connected ? { connected: true, provider: body.provider } : { connected: false };
}

export async function disconnect(): Promise<void> {
  await fetch('/api/oauth/disconnect', { method: 'POST' });
}

/** Throws with a message safe to show the player directly. */
export async function sendTutorMessage(messages: TutorMessage[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(typeof body?.error === 'string' ? body.error : 'The AI tutor is unavailable right now.');
  }
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('The AI tutor sent back something unexpected.');
  }
  return content;
}
