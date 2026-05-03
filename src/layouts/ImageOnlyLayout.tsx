import { ContentRenderer } from "../renderers/ContentRenderer";
import type { LayoutRendererProps } from "../publicTypes";

export function ImageOnlyLayout({ slide, target, renderers }: LayoutRendererProps): React.ReactElement {
  const image = slide.slots.get("image");
  const caption = slide.slots.get("caption");

  return (
    <article className="deck-layout deck-layout-image-only" data-target={target}>
      <main>{image ? <ContentRenderer content={image.content} renderers={renderers} /> : null}</main>
      <footer>{caption ? <ContentRenderer content={caption.content} renderers={renderers} /> : null}</footer>
    </article>
  );
}
