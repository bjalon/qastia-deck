import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";
import { TitleSlot } from "./TitleSlot";

export function TwoColumnsLayout({ slide, target, renderers }: LayoutRendererProps): React.ReactElement {
  const left = slide.slots.get("left");
  const right = slide.slots.get("right");
  const footer = slide.slots.get("footer");

  return (
    <article className="deck-layout deck-layout-two-columns" data-target={target}>
      <header>
        <TitleSlot slide={slide} renderers={renderers} />
      </header>
      <main className="deck-two-columns-grid">
        <section>{left ? <ContentRenderer content={left.content} renderers={renderers} /> : null}</section>
        <section>{right ? <ContentRenderer content={right.content} renderers={renderers} /> : null}</section>
      </main>
      <footer>{footer ? <ContentRenderer content={footer.content} renderers={renderers} /> : null}</footer>
    </article>
  );
}
