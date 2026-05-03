import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";
import { TitleSlot } from "./TitleSlot";

export function CoverLayout({ slide, target, renderers }: LayoutRendererProps): React.ReactElement {
  return (
    <article className="deck-layout deck-layout-cover" data-target={target}>
      <div className="deck-cover-copy">
        <Slot slide={slide} name="eyebrow" className="deck-cover-eyebrow" renderers={renderers} />
        <TitleSlot slide={slide} className="deck-cover-title" variant="cover" renderers={renderers} />
        <Slot slide={slide} name="subtitle" className="deck-cover-subtitle" renderers={renderers} />
      </div>
      <Slot slide={slide} name="footer" className="deck-slide-footer" renderers={renderers} />
    </article>
  );
}

function Slot({
  slide,
  name,
  className,
  renderers,
}: {
  readonly slide: LayoutRendererProps["slide"];
  readonly name: string;
  readonly className: string;
  readonly renderers: LayoutRendererProps["renderers"];
}): React.ReactElement | null {
  const slot = slide.slots.get(name);
  if (!slot) {
    return null;
  }

  return (
    <div className={className} data-slot={name}>
      <ContentRenderer content={slot.content} renderers={renderers} />
    </div>
  );
}
