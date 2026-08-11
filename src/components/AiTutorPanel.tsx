import { useEffect, useRef, useState } from 'react';
import {
  connectUrl,
  disconnect,
  fetchConnectionStatus,
  sendTutorMessage,
  type ConnectionStatus,
  type TutorContext,
  type TutorMessage,
  type TutorProvider,
} from '../lib/aiTutor';

type AiTutorPanelProps = {
  onClose: () => void;
  /** The active mission's schema, the player's current SQL, and their last
   * result/diagnostic — sent to the tutor on every message so it can "fully
   * help" rather than reason blind (product decision, 2026-08-11). */
  context: TutorContext;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

const providerLabel: Record<TutorProvider, string> = { openai: 'ChatGPT', anthropic: 'Claude' };

export function AiTutorPanel({ onClose, context }: AiTutorPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<ConnectionStatus | 'loading'>('loading');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchConnectionStatus()
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleDisconnect() {
    await disconnect();
    setStatus({ connected: false });
    setMessages([]);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;
    const nextMessages: TutorMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setDraft('');
    setIsSending(true);
    setError(null);
    try {
      const reply = await sendTutorMessage(nextMessages, context);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI tutor is unavailable right now.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className="glossary-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="glossary-panel" role="dialog" aria-modal="true" aria-labelledby="ai-tutor-title" ref={panelRef}>
        <header className="glossary-header">
          <div>
            <p className="eyebrow">Aurora Music mainframe · off-the-record channel</p>
            <h2 id="ai-tutor-title">Friendly AI tutor</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body">
          {status === 'loading' && <p className="subtle">Checking connection…</p>}

          {status !== 'loading' && !status.connected && (
            <section aria-labelledby="ai-tutor-connect-title">
              <h3 id="ai-tutor-connect-title">Connect your own AI subscription</h3>
              <p>
                This tutor runs on <strong>your</strong> ChatGPT Plus/Team or Claude Pro/Team subscription, connected
                through Monet. Aurora Music never sees or stores your login — Monet vaults it and proxies each request.
              </p>
              <p className="subtle">
                To actually help, every message shares this mission&apos;s schema, your current SQL, and your last
                query&apos;s real result with your connected AI — the same way it would if you pasted them in
                yourself. Every question also counts against your own plan&apos;s usage. You can revoke access any
                time from Monet or by disconnecting below.
              </p>
              <div className="save-slot-actions">
                <a className="start-button" href={connectUrl('openai')}>
                  Connect ChatGPT
                </a>
                <a className="start-button" href={connectUrl('anthropic')}>
                  Connect Claude
                </a>
              </div>
            </section>
          )}

          {status !== 'loading' && status.connected && (
            <section aria-labelledby="ai-tutor-chat-title">
              <h3 id="ai-tutor-chat-title">
                Connected to {providerLabel[status.provider]}{' '}
                <button type="button" className="link-button" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </h3>
              <ul className="ai-tutor-messages" aria-live="polite">
                {messages.length === 0 && <li className="subtle">Ask about this mission or your query.</li>}
                {messages.map((message, index) => (
                  <li key={index} className={`ai-tutor-message ai-tutor-message-${message.role}`}>
                    <strong>{message.role === 'user' ? 'You' : providerLabel[status.provider]}:</strong> {message.content}
                  </li>
                ))}
              </ul>
              {error && (
                <p role="alert" className="ai-tutor-error">
                  {error}
                </p>
              )}
              <form className="ai-tutor-form" onSubmit={handleSubmit}>
                <label htmlFor="ai-tutor-input">Your question</label>
                <textarea
                  id="ai-tutor-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  disabled={isSending}
                />
                <button type="submit" className="start-button" disabled={isSending || !draft.trim()}>
                  {isSending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
