import { yaml } from "@codemirror/lang-yaml";
import { EditorState } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { DeckDiagnostic } from "../../publicTypes";

export type DeckSourceEditorHandle = {
  readonly focusDiagnostic: (diagnostic: DeckDiagnostic) => void;
};

export type DeckSourceEditorProps = {
  readonly value: string;
  readonly diagnostics: readonly DeckDiagnostic[];
  readonly readOnly?: boolean;
  readonly onChange: (value: string) => void;
};

export const DeckSourceEditor = forwardRef<DeckSourceEditorHandle, DeckSourceEditorProps>(
  function DeckSourceEditor(
    {
      value,
      diagnostics,
      readOnly = false,
      onChange,
    },
    ref,
  ): React.ReactElement {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);

    onChangeRef.current = onChange;
    valueRef.current = value;

    useImperativeHandle(ref, () => ({
      focusDiagnostic(diagnostic: DeckDiagnostic): void {
        const view = viewRef.current;
        const offset = diagnostic.range?.start.offset;
        if (!view || offset === undefined) {
          view?.focus();
          return;
        }

        const position = Math.min(Math.max(offset, 0), view.state.doc.length);
        view.dispatch({
          selection: { anchor: position },
          effects: EditorView.scrollIntoView(position, { y: "center" }),
        });
        view.focus();
      },
    }), []);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) {
        return undefined;
      }

      const view = new EditorView({
        parent: host,
        state: EditorState.create({
          doc: valueRef.current,
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            yaml(),
            EditorView.lineWrapping,
            EditorView.editable.of(!readOnly),
            EditorState.readOnly.of(readOnly),
            keymap.of([]),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) {
                return;
              }

              const nextValue = update.state.doc.toString();
              valueRef.current = nextValue;
              onChangeRef.current(nextValue);
            }),
          ],
        }),
      });

      viewRef.current = view;
      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, [readOnly]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view || view.state.doc.toString() === value) {
        return;
      }

      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }, [value]);

    const positionedDiagnostics = diagnostics.filter((diagnostic) => diagnostic.range);

    return (
      <section className="deck-source-editor" aria-label="Source YAML">
        <div ref={hostRef} className="deck-source-editor-codemirror" />
        <textarea
          aria-hidden="true"
          className="deck-source-editor-fallback"
          readOnly
          tabIndex={-1}
          value={value}
        />
        {positionedDiagnostics.length > 0 ? (
          <ul className="deck-source-diagnostic-lines" aria-label="Diagnostics source YAML">
            {positionedDiagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.code}-${diagnostic.range?.start.offset ?? index}`}>
                <button
                  type="button"
                  onClick={() => viewRef.current ? focusEditorOnDiagnostic(viewRef.current, diagnostic) : undefined}
                >
                  <strong>Ligne {diagnostic.range ? diagnostic.range.start.line + 1 : "?"}</strong>
                  <span>{diagnostic.message}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  },
);

function focusEditorOnDiagnostic(view: EditorView, diagnostic: DeckDiagnostic): void {
  const offset = diagnostic.range?.start.offset;
  if (offset === undefined) {
    view.focus();
    return;
  }

  const position = Math.min(Math.max(offset, 0), view.state.doc.length);
  view.dispatch({
    selection: { anchor: position },
    effects: EditorView.scrollIntoView(position, { y: "center" }),
  });
  view.focus();
}
