import type { CompiledSlide, LayoutRendererTarget, RendererRegistry } from "../publicTypes";
import { defaultRendererRegistry } from "../renderers/ContentRenderer";

type SlideRendererProps = {
  readonly slide: CompiledSlide;
  readonly target: LayoutRendererTarget;
  readonly renderers?: RendererRegistry;
};

export function SlideRenderer({ slide, target, renderers = defaultRendererRegistry }: SlideRendererProps): React.ReactElement {
  const LayoutComponent = slide.layout.definition.component;

  return (
    <section
      className="deck-slide-frame"
      data-slide-id={slide.id}
      data-layout={slide.layout.name}
      data-target={target}
    >
      <LayoutComponent slide={slide} target={target} renderers={renderers} />
    </section>
  );
}
