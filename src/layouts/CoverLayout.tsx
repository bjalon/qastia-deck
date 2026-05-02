import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";
import { TitleSlot } from "./TitleSlot";

export function CoverLayout({ slide, target }: LayoutRendererProps): React.ReactElement {
  return (
    <article className="deck-layout deck-layout-cover" data-target={target}>
      <div className="deck-cover-copy">
        <Slot slide={slide} name="eyebrow" className="deck-cover-eyebrow" />
        <TitleSlot slide={slide} className="deck-cover-title" variant="cover" />
        <Slot slide={slide} name="subtitle" className="deck-cover-subtitle" />
      </div>
      <Slot slide={slide} name="footer" className="deck-slide-footer" />
    </article>
  );
}

function Slot({
  slide,
  name,
  className,
}: {
  readonly slide: LayoutRendererProps["slide"];
  readonly name: string;
  readonly className: string;
}): React.ReactElement | null {
  const slot = slide.slots.get(name);
  if (!slot) {
    return null;
  }

  return (
    <div className={className} data-slot={name}>
      <ContentRenderer content={slot.content} />
    </div>
  );
}
