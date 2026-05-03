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
  onDiagnosticClick,
}: {
  readonly diagnostics: DebugDeckViewModel["diagnostics"];
  readonly onDiagnosticClick?: (diagnostic: DebugDeckViewModel["diagnostics"][number]) => void;
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
          <button
            type="button"
            disabled={!onDiagnosticClick}
            onClick={() => onDiagnosticClick?.(diagnostic)}
          >
            <strong>{diagnostic.code}</strong>
            <span>{diagnostic.message}</span>
            {diagnostic.range ? <small>Ligne {diagnostic.range.start.line + 1}</small> : null}
            {diagnostic.hint ? <small>{diagnostic.hint}</small> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
