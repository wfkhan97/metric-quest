import { useEffect, useRef } from 'react';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { sql } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--retro-teal)', fontWeight: '700' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--retro-amber)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--retro-success)' },
  { tag: [tags.lineComment, tags.blockComment], color: 'var(--retro-muted)', fontStyle: 'italic' },
  { tag: [tags.operator, tags.punctuation, tags.paren], color: 'var(--retro-text)' },
  { tag: [tags.typeName, tags.propertyName], color: 'var(--retro-danger)' },
]);

const terminalTheme = EditorView.theme({
  '&': {
    color: 'var(--retro-text)',
    height: '100%',
  },
  '.cm-content': {
    caretColor: 'var(--retro-amber)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '0.95rem',
    lineHeight: '1.45',
    padding: '0.65rem',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--retro-amber)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(255, 209, 102, 0.35) !important',
  },
  '.cm-gutters': { display: 'none' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'rgba(31, 211, 196, 0.06)' },
});

type SqlEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
};

export function SqlEditor({ id, value, onChange, ariaLabelledBy, ariaDescribedBy }: SqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          sql(),
          syntaxHighlighting(highlightStyle),
          terminalTheme,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            id,
            'aria-labelledby': ariaLabelledBy,
            ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Editor is created once per mount; MissionView remounts (key={mission.id})
    // on mission change, so a fresh editor per mission is already guaranteed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} id={`${id}-container`} className="sql-editor" spellCheck="false" />;
}
