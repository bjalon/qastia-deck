import type { ContentRendererPlugin, RenderableContentNode } from "../publicTypes";
import ReactMarkdown from "react-markdown";

function MarkdownNodeRenderer({ node }: { readonly node: RenderableContentNode }): React.ReactElement {
  if (node.kind !== "markdown" || !("markdown" in node)) {
    return <UnsupportedNodeRenderer node={node} />;
  }

  return (
    <ReactMarkdown
      allowedElements={[
        "p",
        "strong",
        "em",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "br",
      ]}
      urlTransform={(url) => {
        if (/^(https?:|mailto:|\/|#)/i.test(url)) {
          return url;
        }
        return "";
      }}
    >
      {node.markdown}
    </ReactMarkdown>
  );
}

function CodeNodeRenderer({ node }: { readonly node: RenderableContentNode }): React.ReactElement {
  if (node.kind !== "code" || !("code" in node)) {
    return <UnsupportedNodeRenderer node={node} />;
  }

  return (
    <pre className="deck-code-block">
      <code>{node.code}</code>
    </pre>
  );
}

function MermaidNodeRenderer({ node }: { readonly node: RenderableContentNode }): React.ReactElement {
  if (node.kind !== "mermaid" || !("chart" in node)) {
    return <UnsupportedNodeRenderer node={node} />;
  }

  return <pre className="deck-mermaid-block">{node.chart}</pre>;
}

function UnsupportedNodeRenderer({ node }: { readonly node: RenderableContentNode }): React.ReactElement {
  return <pre className="deck-unsupported-renderer">Renderer: {node.kind}</pre>;
}

export const markdownRendererPlugin: ContentRendererPlugin = {
  kind: "markdown",
  render: MarkdownNodeRenderer,
};

export const codeRendererPlugin: ContentRendererPlugin = {
  kind: "code",
  render: CodeNodeRenderer,
};

export const mermaidRendererPlugin: ContentRendererPlugin = {
  kind: "mermaid",
  render: MermaidNodeRenderer,
};
