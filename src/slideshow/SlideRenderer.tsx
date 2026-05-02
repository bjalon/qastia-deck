import type { CompiledSlide, LayoutRendererTarget } from "../publicTypes";

type SlideRendererProps = {
  readonly slide: CompiledSlide;
  readonly target: LayoutRendererTarget;
};

export function SlideRenderer({ slide, target }: SlideRendererProps): React.ReactElement {
  const LayoutComponent = slide.layout.definition.component;

  return (
    <section
      className="deck-slide-frame"
      data-slide-id={slide.id}
      data-layout={slide.layout.name}
      data-target={target}
    >
      <LayoutComponent slide={slide} target={target} />
    </section>
  );
}
