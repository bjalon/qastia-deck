import type { DeckDiagnostic, DiagnosticCode, DiagnosticSeverity } from "../publicTypes";
export declare function diagnostic(code: DiagnosticCode, severity: DiagnosticSeverity, message: string, path?: readonly string[], slideId?: string, hint?: string): DeckDiagnostic;
export declare function summarizeDiagnostics(diagnostics: readonly DeckDiagnostic[]): {
    code: DiagnosticCode;
    severity: DiagnosticSeverity;
    count: number;
}[];
//# sourceMappingURL=diagnostics.d.ts.map