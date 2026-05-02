import { ContentRenderer } from "./ContentRenderer";
import type { CompiledContentNode, ContentRendererPlugin } from "../publicTypes";

function NodeRenderer({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
  return <ContentRenderer content={{ kind: "markdown", markdown: "", nodes: [node] }} />;
}

export const markdownRendererPlugin: ContentRendererPlugin = {
  kind: "markdown",
  render: NodeRenderer,
};

export const codeRendererPlugin: ContentRendererPlugin = {
  kind: "code",
  render: NodeRenderer,
};

export const mermaidRendererPlugin: ContentRendererPlugin = {
  kind: "mermaid",
  render: NodeRenderer,
};
