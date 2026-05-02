import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";

export function ImageOnlyLayout({ slide, target }: LayoutRendererProps): React.ReactElement {
  const image = slide.slots.get("image");
  const caption = slide.slots.get("caption");

  return (
    <article className="deck-layout deck-layout-image-only" data-target={target}>
      <main>{image ? <ContentRenderer content={image.content} /> : null}</main>
      <footer>{caption ? <ContentRenderer content={caption.content} /> : null}</footer>
    </article>
  );
}
