import type { CompiledContentNode, DeckDiagnostic } from "../publicTypes";

const fencedBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
const htmlPattern = /<([a-z][a-z0-9-]*)(\s|>|\/>)/i;

export function compileMarkdown(
  markdown: string,
  path: readonly string[],
): {
  readonly nodes: readonly CompiledContentNode[];
  readonly diagnostics: readonly DeckDiagnostic[];
} {
  const diagnostics: DeckDiagnostic[] = [];

  if (htmlPattern.test(markdown)) {
    diagnostics.push({
      code: "MARKDOWN_UNSUPPORTED_HTML",
      severity: "warning",
      message: "Raw HTML is ignored by the default markdown renderer.",
      path,
      hint: "Use Markdown syntax or a custom renderer instead.",
    });
  }

  const nodes: CompiledContentNode[] = [];
  let cursor = 0;

  for (const match of markdown.matchAll(fencedBlockPattern)) {
    const [fullMatch, language, body] = match;
    const index = match.index ?? 0;
    const before = markdown.slice(cursor, index);
    if (before.trim().length > 0) {
      nodes.push({ kind: "markdown", markdown: before });
    }

    if (language?.toLowerCase() === "mermaid") {
      nodes.push({ kind: "mermaid", chart: body.trim() });
    } else {
      nodes.push({ kind: "code", language, code: body.replace(/\n$/, "") });
    }

    cursor = index + fullMatch.length;
  }

  const after = markdown.slice(cursor);
  if (after.trim().length > 0 || nodes.length === 0) {
    nodes.push({ kind: "markdown", markdown: after });
  }

  return { nodes, diagnostics };
}
