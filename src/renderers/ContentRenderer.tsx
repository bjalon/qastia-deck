import ReactMarkdown from "react-markdown";
import type { CompiledContent, CompiledContentNode } from "../publicTypes";

type ContentRendererProps = {
  readonly content: CompiledContent;
};

export function ContentRenderer({ content }: ContentRendererProps): React.ReactElement {
  if (content.kind === "image") {
    return (
      <img
        className="deck-slot-image"
        src={content.src ?? ""}
        alt={content.alt ?? ""}
        loading="lazy"
      />
    );
  }

  if (content.kind === "renderer") {
    return (
      <pre className="deck-unsupported-renderer">
        Renderer: {content.rendererKind}
      </pre>
    );
  }

  return (
    <div className="deck-markdown">
      {content.nodes.map((node, index) => (
        <ContentNode key={`${node.kind}-${index}`} node={node} />
      ))}
    </div>
  );
}

function ContentNode({ node }: { readonly node: CompiledContentNode }): React.ReactElement {
  if (node.kind === "code") {
    return (
      <pre className="deck-code-block">
        <code>{node.code}</code>
      </pre>
    );
  }

  if (node.kind === "mermaid") {
    return <pre className="deck-mermaid-block">{node.chart}</pre>;
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
