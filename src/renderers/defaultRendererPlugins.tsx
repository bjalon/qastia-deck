import type { ContentRendererPlugin, RenderableContentNode } from "../publicTypes";
import { useEffect, useId, useState } from "react";
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

  return <MermaidDiagram chart={node.chart} />;
}

function MermaidDiagram({ chart }: { readonly chart: string }): React.ReactElement {
  const reactId = useId();
  const [renderState, setRenderState] = useState<
    | { readonly status: "loading" }
    | { readonly status: "rendered"; readonly svg: string }
    | { readonly status: "failed"; readonly message: string }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const renderId = `deck-mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    setRenderState({ status: "loading" });

    void import("mermaid")
      .then(async (module) => {
        const mermaid = module.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
        });

        const { svg } = await mermaid.render(renderId, chart);
        if (!cancelled) {
          setRenderState({ status: "rendered", svg });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setRenderState({
            status: "failed",
            message: error instanceof Error ? error.message : "Unable to render Mermaid diagram.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (renderState.status === "rendered") {
    return (
      <figure
        className="deck-mermaid-block deck-mermaid-block-rendered"
        dangerouslySetInnerHTML={{ __html: renderState.svg }}
      />
    );
  }

  if (renderState.status === "failed") {
    return (
      <pre className="deck-mermaid-block" data-status="failed">
        {renderState.message}
        {"\n\n"}
        {chart}
      </pre>
    );
  }

  return (
    <pre className="deck-mermaid-block" data-status="loading">
      {chart}
    </pre>
  );
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
