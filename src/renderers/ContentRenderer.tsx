import type {
  CompiledContent,
  ContentRendererPlugin,
  RenderableContentNode,
  RendererRegistry,
} from "../publicTypes";
import { defaultRenderers } from "../runtime/defaultRenderers";

type ContentRendererProps = {
  readonly content: CompiledContent;
  readonly renderers?: RendererRegistry;
};

export const defaultRendererRegistry: RendererRegistry = new Map(
  defaultRenderers.map((renderer) => [renderer.kind, renderer]),
);

export function ContentRenderer({ content, renderers }: ContentRendererProps): React.ReactElement {
  const rendererRegistry = renderers ?? defaultRendererRegistry;

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
    const renderer = rendererRegistry.get(content.rendererKind);
    if (!renderer) {
      return <UnsupportedRenderer kind={content.rendererKind} />;
    }

    return renderNode(renderer, {
      kind: content.rendererKind,
      props: content.props,
    });
  }

  return (
    <div className="deck-markdown">
      {content.nodes.map((node, index) => (
        <ContentNode key={`${node.kind}-${index}`} node={node} renderers={rendererRegistry} />
      ))}
    </div>
  );
}

function ContentNode({
  node,
  renderers,
}: {
  readonly node: RenderableContentNode;
  readonly renderers?: RendererRegistry;
}): React.ReactElement {
  const renderer = renderers?.get(node.kind) ?? defaultRendererRegistry.get(node.kind);
  if (renderer) {
    return renderNode(renderer, node);
  }

  return <UnsupportedRenderer kind={node.kind} />;
}

function renderNode(
  renderer: ContentRendererPlugin,
  node: RenderableContentNode,
): React.ReactElement {
  const PluginRenderer = renderer.render;
  return <PluginRenderer node={node} />;
}

function UnsupportedRenderer({ kind }: { readonly kind: string }): React.ReactElement {
  return <pre className="deck-unsupported-renderer">Renderer: {kind}</pre>;
}
