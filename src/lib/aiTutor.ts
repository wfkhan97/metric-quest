export type TutorMessage = { role: 'user' | 'assistant'; content: string };

export type TutorContextRow = (string | number | null)[];

/** Mirrors the server-only Moonshot tutor context without exposing its key. */
export type TutorContext = {
  missionTitle: string;
  missionBrief: string;
  concept: string;
  visibleTables: string[];
  relationships?: string[];
  currentSql: string;
  lastResult?: { columns: string[]; rows: TutorContextRow[] };
  diagnosticLabel?: string;
  teachingNote?: string;
};

/** Throws with a message safe to show the player directly. */
export async function sendTutorMessage(messages: TutorMessage[], context: TutorContext): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
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
