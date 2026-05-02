import ReactMarkdown from "react-markdown";
import type { CompiledContent, CompiledContentNode, RendererRegistry } from "../publicTypes";

type ContentRendererProps = {
  readonly content: CompiledContent;
  readonly renderers?: RendererRegistry;
};

export function ContentRenderer({ content, renderers }: ContentRendererProps): React.ReactElement {
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
        <ContentNode key={`${node.kind}-${index}`} node={node} renderers={renderers} />
      ))}
    </div>
  );
}

function ContentNode({
  node,
  renderers,
}: {
  readonly node: CompiledContentNode;
  readonly renderers?: RendererRegistry;
}): React.ReactElement {
  const PluginRenderer = renderers?.get(node.kind)?.render;
  if (PluginRenderer) {
    return <PluginRenderer node={node} />;
  }

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
