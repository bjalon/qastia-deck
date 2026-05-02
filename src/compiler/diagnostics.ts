import type { DeckDiagnostic, DiagnosticCode, DiagnosticSeverity } from "../publicTypes";

export function diagnostic(
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string,
  path?: readonly string[],
  slideId?: string,
  hint?: string,
): DeckDiagnostic {
  return {
    code,
    severity,
    message,
    path,
    slideId,
    hint,
  };
}

export function summarizeDiagnostics(diagnostics: readonly DeckDiagnostic[]) {
  const counts = new Map<string, DeckDiagnostic>();

  for (const item of diagnostics) {
    const key = `${item.code}:${item.severity}`;
    const previous = counts.get(key);
    counts.set(key, {
      code: item.code,
      severity: item.severity,
      message: String(previous ? Number(previous.message) + 1 : 1),
    });
  }

  return Array.from(counts.values()).map((item) => ({
    code: item.code,
    severity: item.severity,
    count: Number(item.message),
  }));
}
