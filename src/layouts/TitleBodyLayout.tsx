import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";

export function TitleBodyLayout({ slide, target }: LayoutRendererProps): React.ReactElement {
  const title = slide.slots.get("title");
  const body = slide.slots.get("body");
  const footer = slide.slots.get("footer");

  return (
    <article className="deck-layout deck-layout-title-body" data-target={target}>
      <header>{title ? <ContentRenderer content={title.content} /> : null}</header>
      <main>{body ? <ContentRenderer content={body.content} /> : null}</main>
      <footer>{footer ? <ContentRenderer content={footer.content} /> : null}</footer>
    </article>
  );
}
