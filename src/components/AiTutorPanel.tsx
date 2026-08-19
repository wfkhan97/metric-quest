import { useEffect, useRef, useState } from 'react';
import { sendTutorMessage, type TutorContext, type TutorMessage } from '../lib/aiTutor';

type AiTutorPanelProps = {
  onClose: () => void;
  /** The current schema, SQL, and last result are sent only after opt-in. */
  context: TutorContext;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])';

export function AiTutorPanel({ onClose, context }: AiTutorPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
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
            <h2 id="ai-tutor-title">ECHO · friendly AI tutor</h2>
          </div>
          <button type="button" className="link-button" onClick={onClose} ref={closeButtonRef}>
            <span aria-hidden="true">✕ </span>Close
          </button>
        </header>
        <div className="glossary-body">
          {!hasAcceptedDisclosure && (
            <section aria-labelledby="ai-tutor-disclosure-title">
              <h3 id="ai-tutor-disclosure-title">Before you ask ECHO</h3>
              <p>
                ECHO is optional. To help with this mission, Metric Quest sends Moonshot AI the visible schema, your current SQL,
                your most recent query result, and any local diagnostic shown here.
              </p>
              <p className="subtle">
                Metric Quest pays for the request. Do not enter personal, sensitive, or unrelated information. ECHO can explain and
                guide; it cannot run a query, change your score, or complete the mission for you.
              </p>
              <button type="button" className="start-button" onClick={() => setHasAcceptedDisclosure(true)}>
                I understand — start tutor
              </button>
            </section>
          )}

          {hasAcceptedDisclosure && (
            <section aria-labelledby="ai-tutor-chat-title">
              <h3 id="ai-tutor-chat-title">Ask about this mission or your query</h3>
              <p className="subtle">ECHO starts with hints. Ask explicitly if you want the full query.</p>
              <ul className="ai-tutor-messages" aria-live="polite">
                {messages.length === 0 && <li className="subtle">What part of your query would you like to work through?</li>}
                {messages.map((message, index) => (
                  <li key={index} className={`ai-tutor-message ai-tutor-message-${message.role}`}>
                    <strong>{message.role === 'user' ? 'You' : 'ECHO'}:</strong> {message.content}
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
