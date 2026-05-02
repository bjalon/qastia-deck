export { compileDeck } from "./compiler/compileDeck";
export { compileMarkdown } from "./compiler/compileMarkdown";
export { summarizeDiagnostics } from "./compiler/diagnostics";
export { hashSource } from "./compiler/hash";

export type {
  CompileContext,
  CompileDeckResult,
  CompileMode,
  DeckDiagnostic,
  DeckDiagnosticSummary,
  DeckSource,
  DiagnosticCode,
  DiagnosticSeverity,
} from "./publicTypes";
