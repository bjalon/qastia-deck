import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";

export function TwoColumnsLayout({ slide, target }: LayoutRendererProps): React.ReactElement {
  const title = slide.slots.get("title");
  const left = slide.slots.get("left");
  const right = slide.slots.get("right");
  const footer = slide.slots.get("footer");

  return (
    <article className="deck-layout deck-layout-two-columns" data-target={target}>
      <header>{title ? <ContentRenderer content={title.content} /> : null}</header>
      <main className="deck-two-columns-grid">
        <section>{left ? <ContentRenderer content={left.content} /> : null}</section>
        <section>{right ? <ContentRenderer content={right.content} /> : null}</section>
      </main>
      <footer>{footer ? <ContentRenderer content={footer.content} /> : null}</footer>
    </article>
  );
}
