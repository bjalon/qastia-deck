import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";
import { TitleSlot } from "./TitleSlot";

export function TitleBodyLayout({ slide, target, renderers }: LayoutRendererProps): React.ReactElement {
  const body = slide.slots.get("body");
  const footer = slide.slots.get("footer");

  return (
    <article className="deck-layout deck-layout-title-body" data-target={target}>
      <header>
        <TitleSlot slide={slide} renderers={renderers} />
      </header>
      <main>{body ? <ContentRenderer content={body.content} renderers={renderers} /> : null}</main>
      <footer>{footer ? <ContentRenderer content={footer.content} renderers={renderers} /> : null}</footer>
    </article>
  );
}
