import type { CompiledContentNode, ContentRendererPlugin } from "../publicTypes";
import ReactMarkdown from "react-markdown";

function MarkdownNodeRenderer({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
  if (node.kind !== "markdown") {
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

function CodeNodeRenderer({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
  if (node.kind !== "code") {
    return <UnsupportedNodeRenderer node={node} />;
  }

  return (
    <pre className="deck-code-block">
      <code>{node.code}</code>
    </pre>
  );
}

function MermaidNodeRenderer({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
  if (node.kind !== "mermaid") {
    return <UnsupportedNodeRenderer node={node} />;
  }

  return <pre className="deck-mermaid-block">{node.chart}</pre>;
}

function UnsupportedNodeRenderer({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
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
