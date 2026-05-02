import type { DebugDeckViewModel } from "../publicTypes";

type DebugDeckFallbackProps = {
  readonly fallback: DebugDeckViewModel;
};

export function DebugDeckFallback({ fallback }: DebugDeckFallbackProps): React.ReactElement {
  return (
    <section className="deck-debug-fallback">
      <header>
        <h2>{fallback.title}</h2>
      </header>
      <DiagnosticsList diagnostics={fallback.diagnostics} />
      <pre>{fallback.source.content}</pre>
    </section>
  );
}

export function DiagnosticsList({
  diagnostics,
}: {
  readonly diagnostics: DebugDeckViewModel["diagnostics"];
}): React.ReactElement {
  if (diagnostics.length === 0) {
    return (
      <div className="deck-diagnostics-empty" role="status">
        Aucun diagnostic.
      </div>
    );
  }

  return (
    <ul className="deck-diagnostics-list">
      {diagnostics.map((diagnostic, index) => (
        <li key={`${diagnostic.code}-${index}`} data-severity={diagnostic.severity}>
          <strong>{diagnostic.code}</strong>
          <span>{diagnostic.message}</span>
          {diagnostic.hint ? <small>{diagnostic.hint}</small> : null}
        </li>
      ))}
    </ul>
  );
}
